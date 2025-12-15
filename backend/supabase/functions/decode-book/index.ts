// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createDecodeAssistant } from './decode.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
console.info('server started');
const assitant = createDecodeAssistant({
  supabaseUrl: Deno.env.get("SUPABASE_URL"),
  supabaseKey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
  openaiApiKey: Deno.env.get("OPENAI_API_KEY"),
  embeddingModel: Deno.env.get("EMBEDDING_MODEL")
});
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
function sendUpdate(channelName, payload) {
  supabase.channel(`decode-book:${channelName}`).send({
    ...corsHeaders,
    type: 'broadcast',
    event: 'progress',
    payload
  });
}
function errorResponse(e) {
  return new Response(JSON.stringify({
    error: e
  }), {
    status: 400,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Connection": "keep-alive"
    }
  });
}
function successResponse(data) {
  return new Response(JSON.stringify(data), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Connection': 'keep-alive'
    }
  });
}
Deno.serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  const { name, searchTerm } = await req.json();
  sendUpdate(name, {
    update: 'Preparing assistant…'
  });
  function onToolCall(toolName, args) {
    if (toolName === 'codeLookUp') {
      sendUpdate(name, {
        update: `Looking up code rule ${args.ruleId}`
      });
    } else if (toolName === 'semanticSearch') {
      sendUpdate(name, {
        update: 'Performing semantic lookup'
      });
    }
  }
  if (typeof searchTerm !== 'string' || searchTerm.length < 3 || searchTerm.length > 300) {
    return errorResponse(new Error("Invalid query"));
  }
  try {
    const resp = await assitant.ask(searchTerm, onToolCall);
    return successResponse(resp);
  } catch (e) {
    console.error(e);
    return errorResponse(e);
  }
});
