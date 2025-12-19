/*
Setup type definitions for built-in Supabase Runtime APIs.
This import provides typings for the Supabase Functions edge runtime
when running under Deno in the Supabase environment.
*/
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createDecodeAssistant } from './decode.ts';
import { createClient } from 'npm:@supabase/supabase-js@latest';
import { Redis } from 'npm:@upstash/redis@latest'
import { Ratelimit } from "https://cdn.skypack.dev/@upstash/ratelimit@latest";


console.info('server started');

/**
 * preform serverless rate limiting use Redis
 */
const redis = new Redis({
  url: 'https://resolved-deer-29683.upstash.io',
  token: Deno.env.get('REDIS_TOKEN'),
})
// Create a new ratelimiter, that allows 2 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(2, '10 s'),
  analytics: true,
})


/*
Create and configure the `assistant` instance.

`createDecodeAssistant` returns an object exposing `ask(query, onToolCall)`.
We pass runtime credentials and the embedding model identifier via
environment variables so the function remains portable across environments.
*/
const assistant = createDecodeAssistant({
  supabaseUrl: Deno.env.get("SUPABASE_URL"),
  supabaseKey: Deno.env.get("SECRET_KEY"),
  openaiApiKey: Deno.env.get("OPENAI_API_KEY"),
  embeddingModel: Deno.env.get("EMBEDDING_MODEL")
});
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'x-client-info, apikey, content-type',
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};


/*
Create a lightweight Supabase client for broadcasting realtime updates.
This client is used for sending progress messages to channels that the
frontend can subscribe to while the assistant runs.
*/
const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SECRET_KEY"));

/*
Send progress updates to a Supabase realtime channel. The frontend
subscribes to these messages to render live assistant progress.
`channelName` is typically a short session identifier supplied by the client.
`payload` is an object with an `update` string describing the current step.
*/
function sendUpdate(channelName, payload) {
  const config = {
    private: false
  };
  supabase.channel(`decode-book:${channelName}`, { config })
    .httpSend('progress', payload);
}

/*
Return a standardized error `Response` object. This keeps the client-side
handling simple: the body contains `message` and optional `code`, and the
status is 400 for invalid or handled errors.
*/
function errorResponse(e) {
  return new Response(JSON.stringify({
    message: e?.message,
    code: e?.code
  }), {
    status: 400,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Connection": "keep-alive"
    }
  });
}

/*
Return a successful JSON `Response` reusing `corsHeaders` so the client
can consistently parse assistant results.
*/
function successResponse(data) {
  return new Response(JSON.stringify(data), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Connection': 'keep-alive'
    }
  });
}

function getIP(headers) {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('cf-connecting-ip') || headers.get('x-real-ip') || '';
}

  /*
  Callback invoked by the assistant when it triggers one of the
  tools (`codeLookUp` or `semanticSearch`). We translate those tool
  calls into progress messages sent to the client's realtime channel.
  */
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }

  const ip = getIP(req.headers);
  console.log(`IP: ${ip} has made a request`)
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return errorResponse(new Error("limit exceeded, too many requests"));
  }


  const { name, searchTerm } = await req.json();

  /*
  Notify the frontend that we're preparing the assistant. The frontend
  can use this to show a loading state tied to the session `name`.
  */
  sendUpdate(name, {
    update: 'Preparing assistant…'
  });



  /*
  Basic input validation: ensure `searchTerm` is a string within
  reasonable length bounds. If validation fails we return a 400
  response so the client can handle this as a user error instead
  of an internal failure.
  */
  if (typeof searchTerm !== 'string' || searchTerm.length < 2 || searchTerm.length > 300) {
    return errorResponse(new Error("Invalid query"));
  }

  try {
    const resp = await assistant.ask(searchTerm, onToolCall);
    return successResponse(resp);
  } catch (e) {
    return errorResponse(e);
  }
});
