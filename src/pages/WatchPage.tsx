import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTV } from "../context/TVContext";
import { VideoPlayer } from "../components/VideoPlayer";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { ArrowLeft, Star, Heart, CheckCircle, Info, Layers, RefreshCw, Calendar, Eye, Share2, CornerDownRight, Loader2, Tv } from "lucide-react";
import { checkStream } from "../utils/checkStream";
import { motion } from "motion/react";

export const WatchPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { channels, customChannels, activeChannel, setActiveChannel, watchlist, toggleWatchlist } = useTV();
  const [streamActive, setStreamActive] = useState<boolean | null>(null);
  const [checkingUrl, setCheckingUrl] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);

  // Combine TV channels and custom imported streams for cohesive addressability
  const allChannels = useMemo(() => {
    return [...(customChannels || []), ...channels];
  }, [channels, customChannels]);

  // Sync active channel to url parameter on mount/update using reference-safe checks
  useEffect(() => {
    if (id && allChannels.length > 0) {
      const match = allChannels.find(ch => ch.id === id);
      if (match && activeChannel?.id !== id) {
        setActiveChannel(match);
      } else if (!match) {
        // Fallback or warning if channel ID is not resolved in memory
        console.warn(`Channel id ${id} not found.`);
      }
    }
  }, [id, allChannels.length, activeChannel?.id, setActiveChannel]);

  // Run async connection reachability tests on stream sources
  const activeUrl = activeChannel?.url;
  useEffect(() => {
    if (!activeUrl) {
      setStreamActive(null);
      return;
    }

    setCheckingUrl(true);
    setStreamActive(null);

    let activeCheck = true;
    checkStream(activeUrl).then(status => {
      if (activeCheck) {
        setStreamActive(status.alive);
        setCheckingUrl(false);
      }
    });

    return () => {
      activeCheck = false;
    };
  }, [activeUrl]);

  // Extract other channels in the same group (recommendations)
  const recommendations = useMemo(() => {
    if (!activeChannel) return [];
    return allChannels
      .filter(ch => ch.group === activeChannel.group && ch.id !== activeChannel.id)
      .slice(0, 5);
  }, [allChannels, activeChannel]);

  // General fallback list if no recommendations in group
  const randomRecommendations = useMemo(() => {
    return allChannels
      .filter(ch => ch.id !== activeChannel?.id)
      .slice(0, 6);
  }, [allChannels, activeChannel]);

  const sidebarChannels = recommendations.length > 0 ? recommendations : randomRecommendations;
  const isFavorited = activeChannel ? watchlist.includes(activeChannel.id) : false;

  const handleShareClick = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareFeedback(true);
    setTimeout(() => setShareFeedback(false), 2000);
  };

  if (!activeChannel && allChannels.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0b] pb-20">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 text-blue-500 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-300">Initializing digital tuner...</p>
        </div>
      </div>
    );
  }

  // Fallback in case ID is wrong and we have channel lists
  if (!activeChannel && allChannels.length > 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <h4 className="text-sm font-bold text-slate-100">Broadcast Channel Not Found</h4>
        <p className="mt-1 text-xs text-slate-400">The referenced channel ID could not be loaded into memory.</p>
        <Link to="/" className="mt-4 inline-block bg-blue-600 px-4 py-2 text-xs font-bold text-white rounded-full">
          Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-slate-100 select-none" id="watch-view-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-10 py-6 font-sans">
        
        {/* Navigation Breadcrumb header row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-[#151518]/60 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Browse Directory</span>
          </Link>

          {activeChannel && (
            <div className="flex items-center gap-2 text-xs font-mono text-slate-450 bg-[#0d0d0f] border border-white/5 rounded-full py-1.5 px-4">
              <span className="text-slate-500">Stream locator:</span>
              <span className="text-blue-400 font-bold max-w-[120px] sm:max-w-xs truncate" title={activeChannel.url}>
                {activeChannel.url}
              </span>
            </div>
          )}
        </div>

        {/* Triple grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main player + channel info column (span 2 on dekstop) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Custom video player hook component with crash protection */}
            <ErrorBoundary>
              <VideoPlayer />
            </ErrorBoundary>

            {/* Stream analytics metadata description block */}
            {activeChannel && (
              <div className="rounded-2xl border border-white/5 bg-[#151518]/85 p-6 shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-white/5 mb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-extrabold text-white leading-none">{activeChannel.name}</h3>
                      <span className="px-2 py-0.5 rounded bg-blue-950/50 border border-blue-900/40 text-[10px] font-bold text-blue-400 uppercase tracking-widest leading-none">
                        {activeChannel.group || "General"}
                      </span>
                    </div>
                    {activeChannel.language && (
                      <p className="text-xs text-slate-455 font-medium mt-1.5">
                        Broadcasting Language: <span className="text-slate-200 capitalize">{activeChannel.language}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleWatchlist(activeChannel.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                        isFavorited
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                          : "border-white/5 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Star className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
                      <span>{isFavorited ? "Starred" : "Star Favourite"}</span>
                    </button>

                    <button
                      onClick={handleShareClick}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer border-white/5 ${
                        shareFeedback 
                          ? "bg-emerald-600/15 border-emerald-500 text-emerald-400"
                          : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Share2 className="h-4 w-4" />
                      <span>{shareFeedback ? "Copied Link!" : "Share Link"}</span>
                    </button>
                  </div>
                </div>

                {/* Grid analytics info specs details */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-medium text-slate-400 select-none">
                  <div className="bg-white/5 border border-white/5 p-3.5 rounded-xl">
                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Server Reachability</p>
                    <div className="flex items-center gap-1.5 font-bold">
                      {checkingUrl ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 text-slate-400 animate-spin" />
                          <span className="text-slate-400">Pinging...</span>
                        </>
                      ) : streamActive ? (
                        <>
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-400 fill-current" />
                          <span className="text-emerald-400 uppercase font-mono tracking-wider">ACTIVE</span>
                        </>
                      ) : (
                        <>
                          <Info className="h-3.5 w-3.5 text-amber-400" />
                          <span className="text-amber-400 uppercase font-mono tracking-wider">SECURE LINK</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/5 p-3.5 rounded-xl">
                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Source Format</p>
                    <span className="font-bold text-slate-200 uppercase font-mono tracking-wider">
                      {activeChannel.url.includes(".m3u8") ? "HLS (.m3u8)" : "MP4 Stream"}
                    </span>
                  </div>

                  <div className="bg-white/5 border border-white/5 p-3.5 rounded-xl col-span-2 sm:col-span-1">
                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Broadcast Group</p>
                    <span className="font-bold text-slate-200 capitalize">
                      {activeChannel.group || "General Broadcast"}
                    </span>
                  </div>
                </div>

                <div className="mt-5 text-slate-400 text-xs leading-relaxed font-sans max-w-2xl border-t border-white/5 pt-4">
                  <span className="font-bold text-slate-300">Streaming Notice:</span> This digital signal is decoded in real time on the client server. Ensure your network has access to origin links. If the player displays CORS load warnings or spins indefinitely, it implies the host of this streaming link requires an active secure origin wrapper.
                </div>
              </div>
            )}
          </div>

          {/* Recommendation list Sidebar section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold text-slate-450 uppercase tracking-widest">
                Recommended Broadcasts
              </span>
              <span className="text-[10px] font-mono text-slate-550">
                {sidebarChannels.length} related found
              </span>
            </div>

            <div className="space-y-2.5 max-h-[36rem] overflow-y-auto pr-1">
              {sidebarChannels.map((ch) => {
                const isSelected = ch.id === activeChannel?.id;
                return (
                  <motion.div
                    key={ch.id}
                    whileHover={{ x: 2 }}
                    className={`group rounded-xl border p-3 cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#151518] border-blue-500 shadow-md shadow-blue-950/10"
                        : "bg-[#151518]/30 border-white/5 hover:bg-white/5 hover:border-white/10"
                    }`}
                    onClick={() => {
                      setActiveChannel(ch);
                      navigate(`/watch/${ch.id}`);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-950 border border-white/5 flex items-center justify-center p-1 overflow-hidden">
                        {ch.logo ? (
                          <img
                            src={ch.logo}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <Tv className="h-4.5 w-4.5 text-blue-500" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <span className="inline-block px-1.5 py-0.5 rounded bg-[#0a0a0b] border border-white/5 text-[8px] font-bold text-slate-400 capitalize max-w-[100px] truncate">
                          {ch.group || "General"}
                        </span>
                        <h4 className="text-xs font-bold text-slate-200 group-hover:text-blue-400 truncate mt-1">
                          {ch.name}
                        </h4>
                      </div>

                      <div className="text-slate-500 group-hover:text-blue-500 transition-colors">
                        <CornerDownRight className="h-4 w-4" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
export default WatchPage;
