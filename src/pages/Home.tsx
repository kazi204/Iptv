import React from "react";
import { useTVContext } from "../context/TVContext";
import { CategoryFilter } from "../components/CategoryFilter";
import { ChannelList } from "../components/ChannelList";
import { VideoPlayer } from "../components/VideoPlayer";
import { DynamicPlaylistLoader } from "../components/DynamicPlaylistLoader";
import { Radio, Heart, ArrowRight, Play, Server, Film, Star, Layers, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

export const Home: React.FC = () => {
  const { channels, playlists, favorites, reloadDefaultPlaylist, activeChannel } = useTVContext();

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-slate-100" id="home-view-page">
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden border-b border-white/5 bg-[#0a0a0b] py-12 sm:py-16 select-none">
        
        {/* Subtle grid background mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03]" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-600/5 blur-[100px] rounded-full" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-10 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Left Hero copy */}
          <div className="max-w-2xl text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-500/15 bg-blue-500/10 text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping" />
              Next-Gen IPTV Client Player
            </span>
            <h2 className="text-3xl sm:text-4xl font-sans font-extrabold text-white tracking-tight leading-none mb-4">
              Stream live television broadcasts, anywhere, <span className="text-blue-500">instantly.</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed mb-6 max-w-xl">
              Import digital playlists natively using #EXTM3U format, bookmark your favorites to customized lists, controls playback speed, and switches resolutions with our premium custom HLS.js media player.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              {activeChannel ? (
                <Link
                  to={`/watch/${activeChannel.id}`}
                  className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>Resume playing: {activeChannel.name}</span>
                  <ArrowRight className="h-4.5 w-4.5" />
                </Link>
              ) : channels.length > 0 ? (
                <Link
                  to={`/watch/${channels[0].id}`}
                  className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>Start Watching</span>
                  <ArrowRight className="h-4.5 w-4.5" />
                </Link>
              ) : null}

              <button
                onClick={reloadDefaultPlaylist}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/5 bg-white/5 px-4 py-2.5 text-xs font-medium text-slate-350 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reset Default Playlist</span>
              </button>
            </div>
          </div>

          {/* Right Hero metric stats box */}
          <div className="grid grid-cols-2 gap-4 w-full md:max-w-xs shrink-0 select-none">
            <div className="rounded-xl border border-white/5 bg-[#151518]/85 p-4 shadow-xl">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 mb-2">
                <Radio className="h-4 w-4" />
              </div>
              <p className="text-2xl font-black font-mono text-white">{channels.length}</p>
              <p className="text-[10px] uppercase font-bold text-slate-500 mt-0.5">Channels Loaded</p>
            </div>
            
            <div className="rounded-xl border border-white/5 bg-[#151518]/85 p-4 shadow-xl">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 mb-2">
                <Layers className="h-4 w-4" />
              </div>
              <p className="text-2xl font-black font-mono text-white">{playlists.length}</p>
              <p className="text-[10px] uppercase font-bold text-slate-500 mt-0.5">playlists active</p>
            </div>

            <div className="rounded-xl border border-white/5 bg-[#151518]/85 p-4 shadow-xl">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 mb-2">
                <Heart className="h-4 w-4 fill-current" />
              </div>
              <p className="text-2xl font-black font-mono text-white">{favorites.length}</p>
              <p className="text-[10px] uppercase font-bold text-slate-500 mt-0.5">Starred list</p>
            </div>

            <div className="rounded-xl border border-white/5 bg-[#151518]/85 p-4 shadow-xl">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 mb-2">
                <Server className="h-4 w-4" />
              </div>
              <p className="text-xs font-black font-mono text-emerald-400 uppercase tracking-widest mt-1">ONLINE</p>
              <p className="text-[10px] uppercase font-bold text-slate-500 mt-1.5">M3U client status</p>
            </div>
          </div>

        </div>
      </div>

      {/* Category selector slider */}
      <CategoryFilter />

      {/* Grid of channels */}
      <ChannelList />

      {/* Live Dynamic M3U Fetch Demonstration Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-10 pb-16">
        <DynamicPlaylistLoader />
      </div>
    </div>
  );
};
export default Home;
