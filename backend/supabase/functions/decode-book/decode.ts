import { createClient } from 'npm:@supabase/supabase-js';
import { createOpenAI } from 'npm:@ai-sdk/openai';
import { embed, generateText, stepCountIs, Output, tool } from 'npm:ai';
import { z } from 'npm:zod';
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
    conclusion: z.string().describe("A single brief sentence that answers the user's question, citing the relevant rule numbers (e.g. '... (Rules 12-3016, 30-1206)').")
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
      system: `
        You respond ONLY by filling the JSON schema. You never speak directly to the user.
      TOOL RULES:
      - You have NO knowledge except what you obtain from semanticSearch, getCode, and (optionally) webSearch.
      - If the user does NOT provide a specific rule number, you MUST call semanticSearch first.
      - Use the "content" field of semanticSearch/getCode results to identify the specific sentence or clause that answers the question.
      - You may call getCode when you need more detail for a known rule number, but you are allowed to answer using only semanticSearch content if it is sufficient.
      - If the user asks if something is possible, you MUST include the necessary conditions/requirements stated by the code (not just yes/no).
      WEB SEARCH GATING (STRICT):
      - You MUST first form a "draft conclusion" based ONLY on semanticSearch/getCode excerpts.
      - You may use webSearch ONLY for ONE of these purposes:
        1) to confirm you did not miss an exception/limitation tied to the same rule numbers you already found, OR
        2) to find additional related rule numbers when your draft conclusion is missing required conditions (e.g., bonding, fittings, derating, environment rating).
      - You MUST NOT use webSearch to introduce a brand-new answer that contradicts the semanticSearch/getCode excerpts.
      - After webSearch, if you find additional relevant rule numbers, you MUST call semanticSearch/getCode for those rule numbers (webSearch alone is not acceptable evidence) and the inorder to be considered true you must also find the evidence using semanticSearch/getCode.
      - If webSearch finds nothing that leads to additional semanticSearch/getCode evidence, keep the draft conclusion.
      reconsider but do not create new results based on websearch.
        SCHEMA RULES:
        - "rules":
            - Include 1–4 rules that directly support your final conclusion.
            - Duplicate rules shall be handled by merging their fields and revlevant Explanation
            - For each rule:
                - ruleNumber: from the "rule" field.
                - section, subsection, title: copy from the tool result when present, otherwise null.
                - subRuleLabel: if the text clearly indicates sub-rules number/letter (e.g. "1)", "2)", "a)"), include them in this array; otherwise null. Only include the subrules that contain the relvevant information.
                - relevanceExplanation: briefly state why this excerpt is relevant.
        - "conclusion":
            - A brief professional (but readable to the layman) explanation answering the user's question.
            - Must be based ONLY on the excerpts you provided in "rules".
            - If mentioning the relevant rule numbers, put them beside the parts you concluded from it e.g. "(Rules 12-3016, 30-1206)".
            - The conclusion sentence must be the final part of your reasoning; no follow-up offers or extra commentary.
            - No more than three sentances long.
            
        If no tool results clearly address the question:
        - Provide a single rule entry mirroring the most relevant tool result if available, or return an empty list ONLY when there truly are no relevant results.
        - In that case set conclusion to: "I cannot find this information in the available code database."
        VERIFICATION REQUIREMENTS:
        - For every rule you you array, you MUST call getCode(ruleNumber) at least once to confirm the exact subrule text.
        - For every rule in any semantic search if it applies  you MUST call getCode(ruleNumber) at least once to confirm.
        - If getCode reveals a limiting condition or exception, you MUST incorporate it in relevanceExplanation and conclusion.
        STOP CONDITION (required):
        You may only produce the final JSON after BOTH are true:
        1) You have at least ONE excerpt that directly answers the question (not just loosely related).
        2) You have at least ONE excerpt covering constraints/requirements/limitations (where applicable).
        If either is missing, you MUST continue searching (semanticSearch or getCode as appropriate).`,
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
