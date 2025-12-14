import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zjzpmvfuhgndocqkreks.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqenBtdmZ1aGduZG9jcWtyZWtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMTM3MjcsImV4cCI6MjA4MDY4OTcyN30.voBdjJZl0Ifa6gW0xxeF_py05ZuTo50GjMkCt2zR2Vc';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

type BroadCastPayload = {
  update: string;
};

export default function useChannel(channelName: string) {
  const [resp, setResp] = useState<BroadCastPayload | null>(null);

  useEffect(() => {
    if (!channelName) return;
    const channel = supabase.channel(`decode-book:${channelName}`);
    channel.on('broadcast', { event: '*' }, (resp) => {
      setResp(resp.payload);
    }).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName]);

  return resp;
}