import React, { useState, useEffect, useMemo } from "react";
import { useTV } from "../context/TVContext";
import { ChannelCard } from "./ChannelCard";
import { AlertCircle, RefreshCw, Star, Info, ListFilter } from "lucide-react";
import { motion } from "motion/react";
import * as ReactWindow from "react-window";

// Bulletproof bundler ESM/CJS interop resolver
// @ts-ignore
const List = ReactWindow.List || (ReactWindow as any).default?.List || ReactWindow;

export const ChannelList: React.FC = () => {
  const { filteredChannels, isLoading, error, searchQuery, selectedCategory, reloadDefaultPlaylist } = useTV();
  
  // Track window width to dynamically adapt virtualization grid column count
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Determine grid column layout based on viewport width boundaries
  const cols = useMemo(() => {
    if (windowWidth < 640) return 1;    // Mobile
    if (windowWidth < 1024) return 2;   // Tablet/Slight screen
    if (windowWidth < 1280) return 3;   // Small desktop
    return 4;                           // XL screens
  }, [windowWidth]);

  // Transform channels array into grouped row matrix chunks for virtualized grid rendering
  const virtualizedRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < filteredChannels.length; i += cols) {
      rows.push(filteredChannels.slice(i, i + cols));
    }
    return rows;
  }, [filteredChannels, cols]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 sm:px-10 py-6" id="channels-loader-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border border-white/5 bg-[#151518] p-4 flex gap-4">
            <div className="h-14 w-14 rounded-xl bg-slate-900/40" />
            <div className="flex-1 space-y-2.5 py-1">
              <div className="h-3 w-1/3 rounded bg-slate-900/40" />
              <div className="h-4 w-4/5 rounded bg-slate-900/40" />
              <div className="h-2.5 w-1/2 rounded bg-slate-900/40" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4" id="channels-error-state">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-950 text-red-500 mb-4 border border-red-900">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-slate-100">Playback Load Error</h3>
        <p className="mt-1.5 text-xs text-slate-400 font-medium">{error}</p>
        <button
          onClick={reloadDefaultPlaylist}
          className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-500 transition-colors cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Reload Worldwide Channels</span>
        </button>
      </div>
    );
  }

  if (filteredChannels.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4" id="channels-empty-state">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-slate-500 mb-4 border border-white/10">
          <ListFilter className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-slate-100">No matching streams</h3>
        <p className="mt-1.5 text-xs text-slate-400 font-medium font-sans">
          {searchQuery
            ? `We couldn't find any broadcasts matching "${searchQuery}" in ${selectedCategory || "this category"}.`
            : selectedCategory === "Favorites" || selectedCategory === "★ Watchlist"
            ? "Your favorites list is empty. Bookmark streams by tapping the heart icon!"
            : "No channels found in this category."}
        </p>

        {searchQuery && (
          <button
            onClick={reloadDefaultPlaylist}
            className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-white/5 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white cursor-pointer"
          >
            Reset filter variables
          </button>
        )}
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  // Virtual Row Render Callback
  const VirtualRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const rowChannels = virtualizedRows[index];
    if (!rowChannels) return null;

    return (
      <div
        style={{
          ...style,
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gap: "16px",
          paddingLeft: "2px",
          paddingRight: "2px"
        }}
      >
        {rowChannels.map((channel) => (
          <div key={channel.id} className="h-[96px]">
            <ChannelCard channel={channel} />
          </div>
        ))}
      </div>
    );
  };

  // Virtualization Threshold constant
  const VIRTUALIZATION_THRESHOLD = 200;
  const isVirtualized = filteredChannels.length > VIRTUALIZATION_THRESHOLD;

  return (
    <div className="px-4 sm:px-10 py-6" id="channels-grid-container">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4 select-none">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Available Streams
            </span>
            <span className="rounded bg-[#151518] px-2 py-0.5 text-[10px] font-mono text-slate-400 border border-white/5">
              {filteredChannels.length} channels
            </span>
            {isVirtualized && (
              <span className="text-[9px] bg-teal-950/40 text-teal-400 border border-teal-900/30 px-1.5 py-0.5 rounded uppercase font-bold font-mono tracking-wider">
                Virtualized
              </span>
            )}
          </div>
        </div>

        {isVirtualized ? (
          /* Render virtualized scroll layer using react-window */
          <div style={{ height: "640px", width: "100%" }} className="overflow-visible">
            <List<{}>
              style={{ height: 640, width: "100%" }}
              rowCount={virtualizedRows.length}
              rowHeight={114} // Height + gap of row
              rowComponent={VirtualRow}
              rowProps={{}}
              className="scrollbar-none"
            />
          </div>
        ) : (
          /* Standard fluid grid container for small channel lists */
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {filteredChannels.map((channel) => (
              <motion.div key={channel.id} variants={itemVariants}>
                <ChannelCard channel={channel} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ChannelList;
