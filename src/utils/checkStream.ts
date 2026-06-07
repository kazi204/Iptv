/**
 * Sends a HEAD request to the stream URL to check if it's reachable and measure latency.
 * Returns: { alive: boolean, latency: number }
 */
export async function checkStream(
  url: string,
  timeoutMs: number = 5000
): Promise<{ alive: boolean; latency: number }> {
  if (!url) return { alive: false, latency: 0 };

  // Basic protocol check
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return { alive: false, latency: 0 };
  }

  const start = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Consider alive if status is in the 2xx or 3xx range
    const alive = response.status >= 200 && response.status < 400;
    const end = performance.now();
    const latency = Math.round(end - start);

    return { alive, latency };
  } catch (err) {
    clearTimeout(timeoutId);
    return { alive: false, latency: 0 };
  }
}
