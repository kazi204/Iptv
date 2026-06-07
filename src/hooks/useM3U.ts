import { useState, useEffect, useMemo, useCallback } from "react";
import { Channel } from "../types";
import { parseM3U } from "../utils/parseM3U";

export interface UseM3UOptions {
  // Option parameters for extensibility
}

/**
 * React hook to fetch M3U playlists with robust CORS fallback proxy capabilities.
 */
export function useM3U(playlistUrl: string, _options: UseM3UOptions = {}) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState<number>(0);

  const refetch = useCallback(() => {
    setTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!playlistUrl) return;

    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        let text = "";
        let response;

        try {
          // Attempt direct fetch
          response = await fetch(playlistUrl);
          if (!response.ok) {
            throw new Error(`Direct connection returned HTTP status ${response.status}`);
          }
          text = await response.text();
        } catch (directError) {
          console.warn("Direct fetch failed or blocked by CORS. Using proxy fallback...", directError);
          
          // CORS Proxy helper fallback
          const fallbackUrl = `https://corsproxy.io/?${encodeURIComponent(playlistUrl)}`;
          response = await fetch(fallbackUrl);
          if (!response.ok) {
            throw new Error(`CORS Proxy failed to download playlist (HTTP status: ${response.status})`);
          }
          text = await response.text();
        }

        const parsedList = parseM3U(text);

        // De-duplicate parsedList IDs to be absolutely unique for JSX mapping safety
        const uniqueList: Channel[] = [];
        const seenIds = new Set<string>();
        parsedList.forEach(ch => {
          let uniqueId = ch.id;
          let counter = 1;
          while (seenIds.has(uniqueId)) {
            uniqueId = `${ch.id}-${counter}`;
            counter++;
          }
          seenIds.add(uniqueId);
          uniqueList.push({ ...ch, id: uniqueId });
        });

        if (isMounted) {
          setChannels(uniqueList);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.Message || err.message || "Failed to load and parse M3U playlist");
          setChannels([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [playlistUrl, trigger]);

  // Memoize the playlist channels array
  const memoizedChannels = useMemo(() => channels, [channels]);

  return {
    channels: memoizedChannels,
    loading,
    error,
    refetch,
  };
}
