import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

import { SUPABASE_ANON_KEY,  SUPABASE_FUNCTION_URL} from '../components/utils';

const supabase = createClient(SUPABASE_FUNCTION_URL, SUPABASE_ANON_KEY);
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