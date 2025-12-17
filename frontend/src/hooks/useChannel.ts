import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../components/common/utils';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
type BroadCastupdate = {
  update: string;
};

/**
 * React Hook that wraps Supabase 
 * on each message update part of the payload is returned.
 * @param channelName unique id of channel
 * @returns the most recent broadcasted onthe channel
 */
export default function useChannel(channelName: string) {
  const [update, setUpdate] = useState<string>('');

  // subscribes to a channel name
  useEffect(() => {
    if (!channelName) return;

    const channel = supabase.channel(`decode-book:${channelName}`, {
      config: { private: false },
    });

    channel.on("broadcast", { event: "*" }, ({payload}) => {
      
      if (typeof payload?.update === 'string') {
        setUpdate(payload.update);
      }
    });

    channel.subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [channelName]); 

  return update;
}
