/*
Small helper module that wires Supabase + OpenAI together to
implement the "decode" assistant used by the function.

Responsibilities:
- perform semantic search (embeddings + Supabase RPC)
- look up full code entries from the `codes` table
- call the LLM with structured output expectations and a couple
  lightweight tools (semanticSearch and getCode)
*/
import { createClient } from "npm:@supabase/supabase-js";
import { createOpenAI } from "npm:@ai-sdk/openai";
import { embed, generateText, Output, stepCountIs, tool } from "npm:ai";
import { z } from "npm:zod";

const PROMPT_URL = new URL("./prompt.txt", import.meta.url);
const SYSTEM_PROMPT = await Deno.readTextFile(PROMPT_URL);

export function createDecodeAssistant(config) {
  // `config` should contain credentials and model identifiers.
  // We create short-lived clients here so callers can provide
  // environment-specific keys (e.g. from Supabase function env).
  const supabase = createClient(config.supabaseUrl, config.supabaseKey);
  const openai = createOpenAI({
    apiKey: config.openaiApiKey,
  });

  async function keywordSearch(terms: string[]) {
    const { data, error } = await supabase.rpc("keyword_search", {
        terms
    });
    if (error) throw error;
    return data;
  }

  async function search(query) {
    // Convert the user's query into an embedding, then call a
    // Supabase RPC (`match_codes`) that performs a vector similarity
    // match on the stored code embeddings. We return the matched rules
    // (dropping the similarity score here — the LLM can still request
    // more detail via the `getCode` tool).
    const { embedding } = await embed({
      model: openai.textEmbeddingModel(config.embeddingModel),
      value: query,
    });
    const { data, error } = await supabase.rpc("match_codes", {
      query_embedding: embedding,
      match_threshold: 0.3,
      match_count: 10,
    });
    if (error) throw error;
    return data.map(({ similarity, ...rule }) => rule);
  }

  async function codeLookUp(ruleId) {
    // Look up the full code entry by its `rule` identifier. This returns
    // a single row with fields we expose to the assistant (title, section,
    // subsection, content). If nothing is found we return `null` so the
    // tool contract is simple for the LLM to consume.
    const result = await supabase.from("codes").select(
      "title, section, subsection, content",
    ).eq("rule", ruleId);
    if (!result.data) return null;
    return result.data[0] || null;
  }

  const CECAnswerSchema = z.object({
    rules: z.array(
      z.object({
        ruleNumber: z.string().describe("CEC rule number like '12-3016', or 'UNKNOWN' if it cannot be confirmed."),
        section: z.string().nullable().describe("Section name if available"),
        subsection: z.string().nullable().describe("Subsection name if available"),
        title: z.string().nullable().describe("Rule title if available"),
        subRuleLabel: z.array(z.string()).describe(
          "Array of sub-rule labels (e.g. ['1)', '2)(b)']). Use [] if they cannot be inferred."
        ),
        relevanceExplanation: z.string().describe(
          "Brief explanation of how this sub-rule supports the conclusion. 1-2 sentances. Do not include subrule labels."
        ),
      })
    ).min(0).max(4),
    conclusion: z.string().describe(
      "Up to 4 sentences that answer the user's question in plain language. " +
      "YOU MUST CITE RULE NUMBERS IN THIS FORMAT '[12-3016]' immediately next to the claim they support. " +
      "Any special-condition rule must be clearly labeled as conditional. " +
      "If the answer can't be confirmed from the code text, explain why."
    )
  });

  /*
  `CECAnswerSchema` defines the structured object we expect back from the
  model. We use `experimental_output` in `generateText` to request an
  object-shaped response that the SDK will attempt to parse against this
  schema. That makes downstream UI and tooling simpler and less error
  prone than free-text-only outputs.
  */

  async function ask(query, onToolCall) {
    /*
    Ask the LLM to produce a structured answer. We provide two lightweight
    tools the model can call: `semanticSearch` to fetch candidate rules
    (using embeddings + RPC) and `getCode` to fetch a full code entry.
    `onToolCall` is invoked whenever a tool is executed so the caller
    (the function wrapper) can emit progress updates or logs.
    */
    const result = await generateText({
      model: openai("gpt-4.1-mini"),
      stopWhen: stepCountIs(8),
      experimental_output: Output.object({ schema: CECAnswerSchema }),
      tools: {
        web_search: openai.tools.webSearch({}),
        getCode: tool({
          description: "Look up a code rule in the CEC by rule number; return JSON.",
          inputSchema: z.object({ ruleId: z.string().describe("Rule in number-number format") }),
          execute: async ({ ruleId }) => {
            // Notify caller that the assistant requested a code lookup.
            onToolCall("codeLookUp", { ruleId });
            return codeLookUp(ruleId);
          },
        }),
        semanticSearch: tool({
          description:
            "Search for relevant electrical code rules using semantic similarity; returns up to 5 results.",
          inputSchema: z.object({ semanticQuery: z.string().describe("Query string for semantic search") }),
          execute: async ({ semanticQuery }) => {
            // The assistant can call this tool to get nearby candidate
            // rules. These are returned without the similarity score
            // (we drop it in `search`) so the model gets content-focused
            // results it can cite or ask to `getCode` for details.
            onToolCall("semanticSearch", { semanticQuery });
            return search(semanticQuery);
          },
        }),
        keywordSearch: tool({
          description: 'Search for relevant electrical code rules using tsvector search on the text provided.',
          inputSchema: z.object({text: z.string().describe('Query string for keyword based search.')}),
          execute: async ({text}) => {

            
            const sanitized = text.toLowerCase()
            .replace(/[^a-z0-9]+/g, " ")
            .trim()
            .split(' ');
         

            onToolCall("keywordSearch", { sanitized });
            const result = await keywordSearch(sanitized);
            console.log(result);
            return result;

          }
        })
      },
      system: SYSTEM_PROMPT,
      prompt: query,
    });

    try {
      return result.experimental_output;
    } catch (e) {
      console.error(e);
      return null;
    }
  }
  return {
    ask,
  };
}
