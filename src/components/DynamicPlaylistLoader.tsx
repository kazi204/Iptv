import React, { useState, useMemo } from "react";
import { useM3U } from "../hooks/useM3U";
import { useTV } from "../context/TVContext";
import { Channel } from "../types";
import { 
  Tv, 
  Search, 
  Download, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  Database,
  Globe2,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const DynamicPlaylistLoader: React.FC = () => {
  const url = "https://iptv-org.github.io/iptv/countries/bd.m3u";
  const { channels, loading, error, refetch } = useM3U(url);
  const { importPlaylist, activeChannel, setActiveChannel } = useTV();
  
  const [search, setSearch] = useState("");
  const [imported, setImported] = useState(false);
  const [importing, setImporting] = useState(false);

  // Filter channels based on search
  const filtered = useMemo(() => {
    if (!search) return channels;
    const s = search.toLowerCase();
    return channels.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        (c.group && c.group.toLowerCase().includes(s)) ||
        (c.language && c.language.toLowerCase().includes(s))
    );
  }, [channels, search]);

  const handleImport = async () => {
    if (channels.length === 0 || imported) return;
    setImporting(true);
    try {
      // Import into our master context database
      const success = await importPlaylist("BD iptv-org Streams", url, true);
      if (success) {
        setImported(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setImporting(false);
    }
  };

  const handlePlayChannel = (ch: Channel) => {
    // Select this channel as the active channel
    setActiveChannel(ch);
    // Smooth scroll to top player if existing
    const playerEl = document.getElementById("video-player-viewport");
    if (playerEl) {
      playerEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="border border-white/5 bg-[#111113] rounded-2xl p-6 sm:p-8 shadow-2xl mt-8 select-none" id="dynamic-playlist-section">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/5 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-[10px] uppercase font-mono tracking-widest text-blue-400 font-bold">
              Dynamic M3U Fetcher Integration
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">
            Bangladesh Live Stream Catalog
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Live client demonstration using the <code className="text-blue-300 font-mono">useM3U</code> hook to load real-time index lists directly from iptv-org catalogs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/5 bg-white/5 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refetch Source</span>
          </button>

          <button
            onClick={handleImport}
            disabled={loading || importing || imported || channels.length === 0}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-white shadow-lg transition-all ${
              imported
                ? "bg-emerald-600 hover:bg-emerald-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 cursor-pointer"
            }`}
          >
            {imported ? (
              <>
                <Check className="h-4 w-4" />
                <span>Imported to Tuner</span>
              </>
            ) : importing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Saving to local db...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Import Playlist ({channels.length})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Connection Info Bar */}
      <div className="bg-[#151518] border border-white/5 rounded-xl px-4 py-3 text-xs flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-blue-400" />
          <span className="font-semibold text-slate-300">Origin Source:</span>
          <span className="text-slate-400 font-mono text-[11px] truncate max-w-xs md:max-w-md">
            {url}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider">
            With High-Priority CORS proxy fallback recovery
          </span>
        </div>
      </div>

      {loading ? (
        // Animated loading layout structure
        <div className="space-y-4">
          <div className="h-10 bg-white/5 rounded-xl animate-pulse w-full max-w-sm mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-white/5 bg-[#151518]/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white/5" />
                  <div className="flex-1 space-y-1.5 py-1">
                    <div className="h-3 w-1/2 rounded bg-white/5" />
                    <div className="h-2.5 w-4/5 rounded bg-white/5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        // Error card
        <div className="bg-red-950/20 border border-red-900/50 rounded-2xl p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-200">Failed to stream iptv-org list</p>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">{error}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-1.5 bg-red-600 hover:bg-emerald-500 rounded-full text-xs font-bold text-white transition-colors"
          >
            <span>Retry Connection</span>
          </button>
        </div>
      ) : (
        <>
          {/* Search toolbar */}
          <div className="flex items-center bg-white/5 border border-white/5 rounded-full px-4 py-2 w-full max-w-md mb-6">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search Bangladesh channels..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-0 text-xs text-slate-100 placeholder-slate-500 focus:ring-0 focus:outline-none ml-2.5 w-full"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No matching channels found. Try adjusting your search keyword.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {filtered.map((item) => {
                  const isActive = activeChannel?.url === item.url;
                  return (
                    <motion.div
                      layout
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      key={item.id}
                      onClick={() => handlePlayChannel(item)}
                      className={`group flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all ${
                        isActive
                          ? "bg-blue-600/10 border-blue-500"
                          : "bg-[#151518]/50 border-white/5 hover:bg-[#151518]"
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-950 border border-white/5 flex items-center justify-center p-1 overflow-hidden">
                          {item.logo ? (
                            <img
                              src={item.logo}
                              alt={item.name}
                              className="h-full w-full object-contain"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <Tv className="h-4.5 w-4.5 text-blue-500" />
                          )}
                        </div>

                        <div className="overflow-hidden">
                          <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-blue-400">
                            {item.name}
                          </h4>
                          <span className="inline-flex items-center gap-1 text-[9px] text-slate-500 capitalize mt-0.5">
                            <Globe2 className="h-2.5 w-2.5 text-slate-500" />
                            {item.group || "General"}
                          </span>
                        </div>
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-1 text-blue-400 shrink-0">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </>
      )}
    </div>
  );
};
