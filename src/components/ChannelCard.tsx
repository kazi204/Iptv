import React, { useState, useEffect, useRef, memo } from "react";
import { Channel } from "../types";
import { useTV } from "../context/TVContext";
import { Heart, Tv, Eye, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { checkStream } from "../utils/checkStream";

interface ChannelCardProps {
  channel: Channel;
}

export const ChannelCard: React.FC<ChannelCardProps> = memo(({ channel }) => {
  const { watchlist, toggleWatchlist, activeChannel, setActiveChannel } = useTV();
  const [imgError, setImgError] = useState(false);
  const [status, setStatus] = useState<"unchecked" | "alive" | "dead">("unchecked");
  const [latency, setLatency] = useState<number | null>(null);

  const elementRef = useRef<HTMLDivElement | null>(null);
  const isFavorited = watchlist.includes(channel.id);
  const isActive = activeChannel?.id === channel.id;

  // Use IntersectionObserver to lazily check stream status
  useEffect(() => {
    const currentElement = elementRef.current;
    if (!currentElement || status !== "unchecked") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            checkStream(channel.url, 4000).then((res) => {
              setStatus(res.alive ? "alive" : "dead");
              if (res.alive) {
                setLatency(res.latency);
              }
            });
            // Stop observing once triggered
            observer.unobserve(currentElement);
          }
        });
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    observer.observe(currentElement);

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [channel.url, status]);

  // Generate fallback avatar name prefix
  const parts = channel.name.trim().split(/\s+/);
  const avatarInitials = parts.length > 0 && parts[0]
    ? parts.slice(0, 2).map(n => n?.[0] || "").join("").toUpperCase()
    : channel.name.substring(0, 2).toUpperCase();

  // Pick deterministic bg for logo fallback
  const getFallbackColor = (name: string) => {
    const code = name.charCodeAt(0) + (name.charCodeAt(1) || 0);
    const hues = [160, 180, 200, 220, 240, 280];
    const hue = hues[code % hues.length];
    return `hsl(${hue}, 60%, 15%)`;
  };

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlist(channel.id);
  };

  const handleCardClick = () => {
    setActiveChannel(channel);
  };

  return (
    <motion.div
      ref={elementRef}
      whileHover={{ y: -4, scale: 1.01 }}
      className={`group relative overflow-hidden rounded-xl border transition-all duration-300 select-none ${
        isActive
          ? "border-teal-500 bg-[#151518] shadow-lg shadow-teal-950/20"
          : "border-white/5 bg-[#151518]/60 hover:border-white/10 hover:bg-[#151518]"
      }`}
    >
      <Link to={`/watch/${channel.id}`} onClick={handleCardClick} className="block p-4" id={`channel-link-${channel.id}`}>
        <div className="flex items-start gap-4">
          
          {/* Logo container */}
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center p-1.5 transition-all group-hover:border-white/10">
            {channel.logo && !imgError ? (
              <img
                src={channel.logo}
                alt={channel.name}
                referrerPolicy="no-referrer"
                loading="lazy"
                onError={() => setImgError(true)}
                className="h-full w-full object-contain filter drop-shadow"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center text-xs font-bold text-teal-400 tracking-wider rounded-lg font-sans"
                style={{ backgroundColor: getFallbackColor(channel.name) }}
              >
                {avatarInitials || <Tv className="h-4 w-4" />}
              </div>
            )}

            {/* Playing Badge overlay */}
            {isActive && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-600">
                  <Play className="h-2 w-2 text-white fill-current animate-pulse pl-0.5" />
                </span>
              </div>
            )}
          </div>

          {/* Details column */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <span className="px-1.5 py-0.5 rounded bg-[#0a0a0b] border border-white/5 text-[9px] font-bold text-slate-400 capitalize max-w-[100px] truncate">
                {channel.group || "General"}
              </span>
              {channel.country && (
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">
                  {channel.country}
                </span>
              )}
              {/* Colored status dot indicator */}
              <div 
                className="flex items-center gap-1 ml-auto"
                title={status === "alive" ? `Status: Online (Latency: ${latency}ms)` : status === "dead" ? "Status: Offline/CORS restrictions" : "Checking status..."}
              >
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${
                  status === "alive" ? "bg-emerald-500 animate-pulse" : status === "dead" ? "bg-rose-500" : "bg-slate-500 animate-pulse"
                }`} />
                {status === "alive" && latency !== null && (
                  <span className="text-[8px] font-mono text-emerald-400 font-bold">{latency}ms</span>
                )}
              </div>
            </div>

            <h4 className="text-sm font-sans font-semibold text-slate-100 group-hover:text-teal-400 transition-colors truncate">
              {channel.name}
            </h4>
            
            <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5">
              Source: {channel.url.split("/")[2] || "IPTV Link"}
            </p>
          </div>
        </div>

        {/* Favorite Heart action overlay */}
        <button
          onClick={handleWatchlistClick}
          className={`absolute right-2 top-2 p-1.5 rounded-lg border transition-all ${
            isFavorited
              ? "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
              : "border-transparent text-slate-600 hover:text-slate-350 hover:bg-slate-900"
          }`}
          title={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={`h-4.5 w-4.5 ${isFavorited ? "fill-current text-rose-500" : ""}`} />
        </button>

        {/* Quick watch arrow indicator on hover */}
        <div className="absolute bottom-3 right-3 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-teal-400 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
          <span>Watch</span>
          <Play className="h-3 w-3 fill-current" />
        </div>
      </Link>
    </motion.div>
  );
});

ChannelCard.displayName = "ChannelCard";
export default ChannelCard;
