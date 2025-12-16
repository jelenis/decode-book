import { createClient } from 'npm:@supabase/supabase-js';
import { createOpenAI } from 'npm:@ai-sdk/openai';
import { embed, generateText, stepCountIs, Output, tool } from 'npm:ai';
import { z } from 'npm:zod';
const PROMPT_URL = new URL("./prompt.txt", import.meta.url);
const SYSTEM_PROMPT = await Deno.readTextFile(PROMPT_URL);
export function createDecodeAssistant(config) {
  const supabase = createClient(config.supabaseUrl, config.supabaseKey);
  const openai = createOpenAI({
    apiKey: config.openaiApiKey
  });
  async function search(query) {
    const { embedding } = await embed({
      model: openai.textEmbeddingModel(config.embeddingModel),
      value: query
    });
    const { data, error } = await supabase.rpc('match_codes', {
      query_embedding: embedding,
      match_threshold: 0.3,
      match_count: 10
    });
    if (error) throw error;
    return data.map(({ similarity, ...rule })=>rule);
  }
  async function codeLookUp(ruleId) {
    const result = await supabase.from("codes").select('title,section,subsection,content').eq('rule', ruleId);
    if (!result.data) return null;
    return result.data[0] || null;
  }
  const CECAnswerSchema = z.object({
    rules: z.array(z.object({
      ruleNumber: z.string().describe("CEC rule number, e.g. '12-3016'"),
      section: z.string().nullable().describe("Section name if available"),
      subsection: z.string().nullable().describe("Subsection name if available"),
      title: z.string().nullable().describe("Rule title if available"),
      subRuleLabel: z.array(z.string()).nullable().describe("Array of sub-rule labels (e.g. ['1)', '2)(b)']) if they can be inferred from the text; otherwise null."),
      relevanceExplanation: z.string().describe("Very Brief explanation of how this sub-rule supports the conclusion.")
    })).min(1),
    conclusion: z.string().describe("A single brief sentence that answers the user's question, citing the relevant rule numbers without the subrule label (e.g. '[12-3016] [30-1206]'). Special-condition rules MUST be explicitly indicated.")
  });
  async function ask(query, onToolCall) {
    let result = null;
    result = await generateText({
      model: openai("gpt-4.1-mini"),
      stopWhen: stepCountIs(8),
      experimental_output: Output.object({
        schema: CECAnswerSchema
      }),
      tools: {
        web_search: openai.tools.webSearch({}),
        getCode: tool({
          description: 'look up a code rule in the cec given the rule number, returned in json format',
          inputSchema: z.object({
            ruleId: z.string().describe('the code rule in the format of number-number')
          }),
          execute: async ({ ruleId })=>{
            onToolCall("codeLookUp", {
              ruleId
            });
            return codeLookUp(ruleId);
          }
        }),
        semanticSearch: tool({
          description: "Search for relevant electrical code rules using semantic similarity. Use this when you need to find code rules related to a concept, topic, or question but don't have a specific rule number. Returns up to 5 most relevant rules based on vector embeddings.",
          inputSchema: z.object({
            semanticQuery: z.string().describe('a string used to search for similar code rules in the cec using vector embeddings')
          }),
          execute: async ({ semanticQuery })=>{
            onToolCall("semanticSearch", {
              semanticQuery
            });
            return search(semanticQuery);
          }
        })
      },
      system: SYSTEM_PROMPT,
      prompt: query
    });
    try {
      // Optionally log or process result here
      return result.experimental_output;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  return {
    ask
  };
}
