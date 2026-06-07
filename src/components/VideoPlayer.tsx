import React, { useRef, useState, useEffect } from "react";
import { useTV } from "../context/TVContext";
import { usePlayer } from "../hooks/usePlayer";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  Heart,
  Loader2,
  Tv,
  AlertOctagon,
  Gauge,
  MonitorPlay,
  RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const VideoPlayer: React.FC = () => {
  const { activeChannel, watchlist, toggleWatchlist } = useTV();
  
  // Custom HLS hook binding
  const {
    videoRef,
    isPlaying,
    volume,
    isMuted,
    qualities,
    currentQuality,
    isLoading,
    playbackSpeed,
    buffered,
    isLive,
    errorHappened,
    togglePlay,
    changeVolume,
    toggleMute,
    changeQuality,
    changeSpeed,
  } = usePlayer(activeChannel?.url);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<number | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const isFavorited = activeChannel ? watchlist.includes(activeChannel.id) : false;

  // Mouse movement shows controls, hide after delay
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout) {
      window.clearTimeout(controlsTimeout);
    }
    const timeout = window.setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setSettingsOpen(false);
      }
    }, 3500);
    setControlsTimeout(timeout);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeout) window.clearTimeout(controlsTimeout);
    };
  }, [controlsTimeout]);

  // Handle Fullscreen
  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.warn(err));
    } else {
      containerRef.current.requestFullscreen().catch(err => console.warn(err));
    }
  };

  if (!activeChannel) {
    return (
      <div className="flex h-[32rem] flex-col items-center justify-center rounded-2xl border border-white/5 bg-[#151518] p-6 text-center select-none" id="player-not-selected">
        <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-slate-400">
          <Tv className="h-8 w-8 text-blue-500 animate-pulse" />
        </div>
        <h3 className="text-lg font-bold text-slate-100">Now Playing</h3>
        <p className="mt-1.5 max-w-sm text-xs text-slate-400 leading-relaxed">
          Please select a channel from the directory below or import your custom M3U playlist file to begin streaming!
        </p>
      </div>
    );
  }

  const selectedQualityLabel = currentQuality === -1 
    ? "Auto" 
    : qualities.find(q => q.id === currentQuality)?.height 
      ? `${qualities.find(q => q.id === currentQuality)?.height}p` 
      : "Standard";

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full aspect-video md:h-[34rem] overflow-hidden rounded-2xl border border-white/5 bg-black group select-none shadow-2xl"
      id="custom-video-player-container"
    >
      {/* Actual HTML5 Video Tag */}
      <video
        ref={videoRef}
        onClick={togglePlay}
        className="h-full w-full object-contain cursor-pointer"
        playsInline
      />

      {/* Dim Overlay when controls are displayed */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/60 pointer-events-none transition-opacity duration-300 ${
        showControls ? "opacity-100" : "opacity-0"
      }`} />

      {/* Loading Buffering Indicator Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10 animate-fade-in">
          <div className="flex flex-col items-center gap-2.5">
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest font-mono">
              Buffering Stream...
            </span>
          </div>
        </div>
      )}

      {/* Video Stream Crash/Error Banner Overlay */}
      {errorHappened && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-[#0a0a0b]/95 z-20 animate-fade-in">
          <AlertOctagon className="h-12 w-12 text-red-500 mb-3.5" />
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Playback Connection Failure</h4>
          <p className="mt-1.5 max-w-md text-xs text-center text-slate-400 leading-relaxed font-mono">
            {errorHappened}
          </p>
          <div className="mt-4 flex gap-3 text-[10px] uppercase font-bold text-slate-450">
            <span className="px-3 py-1.5 rounded-lg border border-white/5 bg-white/5">
              CORS restrictions may be active on some remote links.
            </span>
          </div>
        </div>
      )}

      {/* HUD Header Bar */}
      <div className={`absolute top-0 inset-x-0 p-4 sm:p-5 flex items-start justify-between transition-all duration-300 ${
        showControls ? "translate-y-0 opacity-100 pointer-events-auto" : "-translate-y-4 opacity-0 pointer-events-none"
      }`}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
            {activeChannel.logo ? (
              <img
                src={activeChannel.logo}
                alt=""
                referrerPolicy="no-referrer"
                className="h-full w-full object-contain p-1"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <Tv className="h-4.5 w-4.5 text-blue-500" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white leading-tight truncate max-w-[200px] sm:max-w-[400px]">
                {activeChannel.name}
              </h2>
              {isLive ? (
                <span className="flex items-center gap-1 bg-red-650 px-2 py-0.5 rounded text-[9px] font-extrabold text-white uppercase tracking-widest leading-none">
                  <span className="h-1 w-1 rounded-full bg-white animate-ping"></span>
                  <span>LIVE</span>
                </span>
              ) : (
                <span className="bg-white/10 text-slate-300 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest leading-none">
                  VOD
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-350 mt-0.5 font-semibold">
              Category: <span className="text-blue-400">{activeChannel.group || "General"}</span>
            </p>
          </div>
        </div>

        {/* Favorite Watchlist trigger inside HUD header */}
        <button
          onClick={() => toggleWatchlist(activeChannel.id)}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
            isFavorited
              ? "bg-rose-500/20 border-rose-500 text-rose-400"
              : "bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10"
          }`}
          title={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={`h-4.5 w-4.5 ${isFavorited ? "fill-current text-rose-500" : ""}`} />
        </button>
      </div>

      {/* Center HUD big play hover state */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <AnimatePresence>
          {!isPlaying && !isLoading && !errorHappened && (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={togglePlay}
              className="pointer-events-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-500 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Play className="h-8 w-8 text-white fill-current translate-x-0.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Controls HUD Footer panel */}
      <div className={`absolute bottom-0 inset-x-0 p-4 sm:p-5 flex flex-col gap-3 transition-all duration-300 ${
        showControls ? "translate-y-0 opacity-100 pointer-events-auto" : "translate-y-4 opacity-0 pointer-events-none"
      }`}>
        
        {/* Quality stream timeline track simulation (if streaming buffered) */}
        {!isLive && (
          <div className="relative w-full h-1 bg-white/10 rounded-full overflow-hidden hover:h-1.5 transition-all">
            <div
              className="absolute left-0 top-0 bottom-0 bg-blue-500 transition-all duration-300"
              style={{ width: `${buffered}%` }}
            />
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          
          {/* Play, Pause, Volume section */}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-205 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="h-4.5 w-4.5 fill-current" />
              ) : (
                <Play className="h-4.5 w-4.5 fill-current translate-x-0.5" />
              )}
            </button>

            {/* Mute and volume slider */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 py-1.5 px-3 rounded-xl transition-all">
              <button
                onClick={toggleMute}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                {isMuted ? (
                  <VolumeX className="h-4.5 w-4.5" />
                ) : (
                  <Volume2 className="h-4.5 w-4.5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={(e) => changeVolume(parseFloat(e.target.value))}
                className="w-16 accent-blue-550 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            {/* Resolution parameters indicators */}
            <span className="hidden sm:inline-flex bg-[#151518] border border-white/5 px-2 py-1 text-[10px] font-mono text-slate-400 rounded-lg">
              {qualities.length > 0 && qualities[0].height ? `${qualities[0].height}p Stream` : "Autodetect URL"}
            </span>
          </div>

          {/* Settings menu dropdown + Maximize Fullscreen section */}
          <div className="flex items-center gap-3 relative">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className={`h-10 w-10 flex items-center justify-center rounded-xl border transition-all cursor-pointer ${
                settingsOpen
                  ? "bg-white/10 border-white/15 text-blue-400"
                  : "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <Settings className={`h-4.5 w-4.5 ${settingsOpen ? "rotate-45" : ""} transition-transform duration-300`} />
            </button>

            {/* Full Settings Configuration Box Overlay */}
            <AnimatePresence>
              {settingsOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setSettingsOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="absolute right-0 bottom-12 mb-1 w-64 rounded-xl border border-white/10 bg-[#0d0d0f] p-4 shadow-2xl z-20"
                  >
                    <div className="space-y-4">
                       {/* Quality level switcher */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <MonitorPlay className="h-3.5 w-3.5 text-blue-500" />
                          <span>Streaming Resolution</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          <button
                            onClick={() => changeQuality(-1)}
                            className={`py-1 text-xs font-semibold rounded cursor-pointer ${
                              currentQuality === -1
                                ? "bg-blue-600 text-white font-bold"
                                : "bg-white/5 text-slate-400 hover:text-white"
                            }`}
                          >
                            Auto
                          </button>
                          {qualities.slice(0, 5).map((lvl) => (
                            <button
                              key={lvl.id}
                              onClick={() => changeQuality(lvl.id)}
                              className={`py-1 text-xs font-semibold rounded cursor-pointer ${
                                currentQuality === lvl.id
                                  ? "bg-blue-600 text-white font-bold"
                                  : "bg-white/5 text-slate-400 hover:text-white"
                              }`}
                            >
                              {lvl.height}p
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Video speed multiplier selector (good for VOD channels) */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <Gauge className="h-3.5 w-3.5 text-blue-500" />
                          <span>Playback velocity</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                          {[0.75, 1, 1.25, 1.5].map((rate) => (
                            <button
                              key={rate}
                              onClick={() => changeSpeed(rate)}
                              className={`py-1 text-[10px] font-bold rounded cursor-pointer ${
                                playbackSpeed === rate
                                  ? "bg-blue-600 text-white font-bold"
                                  : "bg-white/5 text-slate-400 hover:text-white"
                              }`}
                            >
                              {rate}x
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Technical detail print list */}
                      <div className="border-t border-white/5 pt-2 text-[9px] font-mono text-slate-500 flex justify-between">
                        <span>HLS Engine v1.0 • Quality:</span>
                        <span className="text-blue-400 font-bold">{selectedQualityLabel}</span>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Maximize option button */}
            <button
              onClick={handleFullscreen}
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-205 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <Maximize className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default VideoPlayer;
