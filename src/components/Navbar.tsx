import React, { useState } from "react";
import { useTVContext } from "../context/TVContext";
import { Link, useNavigate } from "react-router-dom";
import { Search, Plus, Radio, Play, Trash2, RefreshCw, Layers, Star, Heart, Menu, X, Tv, ArrowRight, Activity } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CategoryFilter } from "./CategoryFilter";
import { checkStream } from "../utils/checkStream";

const PLAYLIST_OPTIONS = [
  { name: "Bangladesh", url: "https://iptv-org.github.io/iptv/countries/bd.m3u" },
  { name: "India", url: "https://iptv-org.github.io/iptv/countries/in.m3u" },
  { name: "News", url: "https://iptv-org.github.io/iptv/categories/news.m3u" },
  { name: "Sports", url: "https://iptv-org.github.io/iptv/categories/sports.m3u" },
  { name: "All World", url: "https://iptv-org.github.io/iptv/index.m3u" }
];

export const Navbar: React.FC = () => {
  const {
    playlistUrl,
    setPlaylistUrl,
    favorites,
    activeCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    filteredChannels,
    activeChannel,
    setActiveChannel,
    isLoading,
    addCustomChannel
  } = useTVContext();

  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState("");

  // States for custom stream adding
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStreamName, setNewStreamName] = useState("");
  const [newStreamUrl, setNewStreamUrl] = useState("");
  const [newStreamCategory, setNewStreamCategory] = useState("Custom Channels");
  const [newStreamLogo, setNewStreamLogo] = useState("");
  const [formError, setFormError] = useState("");

  const handlePlaylistChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPlaylistUrl(e.target.value);
    setSelectedCategory("All");
  };

  const handleChannelSelect = (channel: any) => {
    setActiveChannel(channel);
    setIsSidebarOpen(false);
    navigate(`/watch/${channel.id}`);
  };

  const handleAddCustomStream = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreamName.trim()) {
      setFormError("Please enter a stream name.");
      return;
    }
    if (!newStreamUrl.trim() || !/^https?:\/\//i.test(newStreamUrl)) {
      setFormError("Please enter a valid HTTP/HTTPS stream link.");
      return;
    }

    addCustomChannel(
      newStreamName.trim(),
      newStreamUrl.trim(),
      newStreamCategory.trim() || "Custom Channels",
      newStreamLogo.trim() || undefined
    );

    setNewStreamName("");
    setNewStreamUrl("");
    setNewStreamCategory("Custom Channels");
    setNewStreamLogo("");
    setFormError("");
    setIsAddModalOpen(false);

    setSelectedCategory("Custom Channels");
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0a0b]/90 backdrop-blur-md px-4 sm:px-10 h-20 flex items-center" id="main-navbar">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
        
        {/* Logo / Branding */}
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger toggle */}
          <button
            id="mobile-hamburger-btn"
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-350 hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link to="/" className="flex items-center gap-2 cursor-pointer" onClick={() => setSelectedCategory("All")}>
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 shadow-md">
              <Tv className="h-5 w-5 text-white" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
              </span>
            </div>
            <div>
              <h1 className="text-lg font-bold font-sans tracking-tight text-white flex items-center leading-none">
                AHAMMADCAST<span className="text-teal-400 font-mono text-[9px] bg-teal-950/50 border border-teal-950/30 px-1 py-0.5 rounded ml-1 tracking-wider uppercase">Live</span>
              </h1>
              <p className="text-[10px] text-slate-500">IPTV HLS Player</p>
            </div>
          </Link>
        </div>

        {/* Desktop Global Search & Playlist Controls */}
        <div className="hidden md:flex items-center gap-4 flex-1 max-w-lg justify-center relative">
          <div className="relative w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <Search className="h-4 w-4 text-slate-500" />
            </div>
            <input
              id="global-search-input"
              type="text"
              className="w-full rounded-full border border-white/10 bg-[#121215] py-2 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-505 transition-colors focus:border-teal-500 focus:outline-none focus:bg-[#121215]"
              placeholder="Search live streams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Playlist selector dropdown */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Source:
            </span>
            <select
              value={playlistUrl}
              onChange={handlePlaylistChange}
              className="bg-[#151518] border border-white/10 text-slate-250 text-xs rounded-full px-3.5 py-1.5 focus:outline-none focus:border-teal-500 font-semibold cursor-pointer"
            >
              {PLAYLIST_OPTIONS.map((opt) => (
                <option key={opt.name} value={opt.url} className="bg-[#0c0c0e] text-slate-350">
                  {opt.name}
                </option>
              ))}
            </select>
          </div>

          {/* Add Custom Stream Link Button */}
          <button
            id="add-custom-stream-nav"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/5 bg-teal-650/10 text-teal-450 hover:bg-teal-600/20 text-xs font-semibold transition-all cursor-pointer shadow-md shadow-teal-950/20"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Stream</span>
          </button>

          {/* Favorites/Watchlist Toggle Button */}
          <button
            id="watchlist-tab-nav"
            onClick={() => setSelectedCategory(activeCategory === "Favorites" ? "All" : "Favorites")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
              activeCategory === "Favorites" || activeCategory === "★ Watchlist"
                ? "bg-teal-600/10 border-teal-500/50 text-teal-400"
                : "border-white/5 bg-[#151518]/50 text-slate-300 hover:bg-[#151518] hover:text-white"
            }`}
          >
            <Heart className={`h-4 w-4 ${activeCategory === "Favorites" || activeCategory === "★ Watchlist" ? "fill-current text-teal-500" : ""}`} />
            <span className="hidden sm:inline">Favorites</span>
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-black/40 px-1 text-[9px] text-slate-400 font-bold font-mono">
              {favorites.length}
            </span>
          </button>
        </div>
      </div>

      {/* Slide-over Sidenav Sidebar for Channels on Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden md:hidden" id="mobile-sidebar-container">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Sidebar slide transition */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="absolute inset-y-0 left-0 max-w-xs w-full bg-[#0d0d0f] border-r border-white/5 flex flex-col p-5 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4 select-none">
                <div className="flex items-center gap-2">
                  <Tv className="h-5 w-5 text-teal-400" />
                  <span className="font-bold text-white text-sm font-sans tracking-tight">Channel Directory</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Sidebar Search */}
              <div className="relative mb-4">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-slate-500" />
                </span>
                <input
                  type="text"
                  placeholder="Filter by name..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Sidebar Category List */}
              <div className="mb-4">
                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 select-none">Group Filter</p>
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-2">
                  {["All", "Favorites", "Custom Channels", "Entertainment", "News", "Sports"].map((cat) => {
                    const isTabActive = activeCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-[10px] px-2.5 py-1 rounded-full border transition-all cursor-pointer whitespace-nowrap ${
                          isTabActive ? "bg-teal-600 border-teal-500 text-white font-bold" : "border-white/5 bg-white/5 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scrollable list of channels */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                <div className="flex items-center justify-between pb-1 select-none">
                  <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Results ({filteredChannels.length})</span>
                </div>

                {isLoading ? (
                  <div className="space-y-2 py-4">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <div key={idx} className="animate-pulse flex items-center gap-3 p-2 rounded-lg bg-white/5">
                        <div className="h-8 w-8 rounded-lg bg-white/5 shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-2.5 rounded bg-white/5 w-2/3" />
                          <div className="h-2 rounded bg-white/5 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredChannels.length === 0 ? (
                  <div className="text-center py-10 select-none">
                    <p className="text-xs text-slate-500">No channels found</p>
                  </div>
                ) : (
                  filteredChannels.map((ch) => {
                    const isSelected = activeChannel?.id === ch.id;
                    return (
                      <div
                        key={ch.id}
                        onClick={() => handleChannelSelect(ch)}
                        className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer border transition-all ${
                          isSelected
                            ? "bg-teal-950/20 border-teal-500/50 shadow-sm"
                            : "bg-[#151518]/30 border-white/5 hover:bg-white/5 hover:border-white/10"
                        }`}
                      >
                        <div className="h-8 w-8 shrink-0 rounded-lg bg-slate-900 border border-white/5 overflow-hidden flex items-center justify-center p-0.5">
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
                            <Tv className="h-3.5 w-3.5 text-teal-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-slate-200 truncate group-hover:text-teal-400">{ch.name}</h4>
                          <span className="text-[8px] bg-white/5 border border-white/5 rounded px-1.5 py-0.2 text-slate-500 uppercase font-mono mt-0.5 inline-block">
                            {ch.group || "General"}
                          </span>
                        </div>
                        <ArrowRight className="h-3 w-3 text-slate-600" />
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modern, Animated Custom Channel addition Overlay Dialog */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#060608]/90 backdrop-blur-md"
              onClick={() => {
                setIsAddModalOpen(false);
                setFormError("");
              }}
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/5 bg-[#0e0e12] p-6 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400">
                    <Radio className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Add custom stream channel</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Stream direct TV channels or live CCTV links</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setFormError("");
                  }}
                  className="rounded-lg p-1 text-slate-400 hover:bg-white/5 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddCustomStream} className="space-y-4">
                {formError && (
                  <div className="rounded-xl border border-rose-500/10 bg-rose-500/5 p-3.5 text-xs text-rose-400 font-medium">
                    {formError}
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Channel / Stream Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bangladesh TV Live or My Custom Cam"
                    value={newStreamName}
                    onChange={(e) => {
                      setNewStreamName(e.target.value);
                      if (formError) setFormError("");
                    }}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Stream HLS Link (URL) *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://example.com/stream/index.m3u8"
                    value={newStreamUrl}
                    onChange={(e) => {
                      setNewStreamUrl(e.target.value);
                      if (formError) setFormError("");
                    }}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Group / Category
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. News, Custom Channels"
                      value={newStreamCategory}
                      onChange={(e) => setNewStreamCategory(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Logo Icon URL (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/logo.png"
                      value={newStreamLogo}
                      onChange={(e) => setNewStreamLogo(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-white/5 pt-4 mt-5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setFormError("");
                    }}
                    className="rounded-xl border border-white/5 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-[#1a1a20] transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-teal-500 transition-all cursor-pointer shadow-lg shadow-teal-950/20"
                  >
                    Add Stream Channel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
};
