import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/components/common/utils';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
/** Type for broadcast update messages from Supabase. */
type BroadCastupdate = {
  update: string;
};

/**
 * Custom hook for subscribing to Supabase broadcast channels.
 * @param channelName - Name of the channel to join.
 * @returns The latest update message from the channel.
 */
export default function useChannel(channelName: string) {
  const [update, setUpdate] = useState<string>('');

  // subscribes to a channel name
  useEffect(() => {
    if (!channelName) return;

    const channel = supabase.channel(`decode-book:${channelName}`, {
      config: { private: false },
    });

    channel.on('broadcast', { event: '*' }, ({ payload }) => {
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
