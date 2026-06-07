import { Channel } from "../types";

/**
 * Parses an M3U file string into an array of Channel objects.
 */
export function parseM3U(m3uContent: string): Channel[] {
  const channels: Channel[] = [];
  const lines = m3uContent.split(/\r?\n/);
  
  let currentMetadata: {
    name?: string;
    logo?: string | null;
    group?: string;
    language?: string;
    country?: string;
  } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) continue;

    if (line.startsWith("#EXTINF:")) {
      currentMetadata = {};
      
      // Extract tvg-logo
      const logoMatch = line.match(/tvg-logo="([^"]*)"/) || line.match(/tvg-logo=([^,\s]+)/);
      currentMetadata.logo = logoMatch && logoMatch[1] ? logoMatch[1] : null;

      // Extract group-title
      const groupMatch = line.match(/group-title="([^"]*)"/) || line.match(/group-title=([^,\s]+)/);
      currentMetadata.group = groupMatch && groupMatch[1] ? groupMatch[1] : "General";

      // Extract tvg-language
      const languageMatch = line.match(/tvg-language="([^"]*)"/) || line.match(/tvg-language=([^,\s]+)/);
      if (languageMatch && languageMatch[1]) {
        currentMetadata.language = languageMatch[1];
      }

      // Extract tvg-country
      const countryMatch = line.match(/tvg-country="([^"]*)"/) || line.match(/tvg-country=([^,\s]+)/);
      if (countryMatch && countryMatch[1]) {
        currentMetadata.country = countryMatch[1];
      }

      // Extract the name - the part after the last comma
      const commaIndex = line.lastIndexOf(",");
      if (commaIndex !== -1) {
        currentMetadata.name = line.substring(commaIndex + 1).trim();
      } else {
        currentMetadata.name = "Unknown Channel";
      }
    } else if (line.startsWith("#")) {
      // Skip other comments or header format lines
      continue;
    } else {
      // This is a URL line!
      const url = line;
      
      // Skip lines that do not look like valid protocols / stream endings to prevent false positives
      if (!url.startsWith("http://") && !url.startsWith("https://") && !url.includes(".m3u") && !url.includes(".mp4")) {
        continue;
      }

      // Generate a reproducible base64 ID from the URL
      let id = btoa(unescape(encodeURIComponent(url))).replace(/[+/=]/g, "");
      
      // Prevent React unique key crashes with duplicate channels in the file
      const existingCount = channels.filter(c => c.id.startsWith(id)).length;
      if (existingCount > 0) {
        id = `${id}-${existingCount}`;
      }

      if (currentMetadata) {
        channels.push({
          id,
          name: currentMetadata.name || `Channel ${channels.length + 1}`,
          url,
          logo: currentMetadata.logo,
          group: currentMetadata.group || "General",
          language: currentMetadata.language,
          country: currentMetadata.country,
        });
        currentMetadata = null; // Reset for the next info block
      } else {
        channels.push({
          id,
          name: `Stream ${channels.length + 1}`,
          url,
          logo: null,
          group: "General"
        });
      }
    }
  }

  return channels;
}
