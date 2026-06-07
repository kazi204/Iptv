import React, { useRef } from "react";
import { useTV } from "../context/TVContext";
import { Star, Flame, Trophy, Newspaper, Music, Theater, Compass, HeartPulse, Heart, Radio } from "lucide-react";
import { motion } from "motion/react";

// Helper to provide nice icons for popular categories
const getCategoryIcon = (category: string) => {
  const normalized = category.toLowerCase();
  if (normalized === "all") return <Compass className="h-3.5 w-3.5" />;
  if (normalized === "favorites") return <Heart className="h-3.5 w-3.5 text-rose-500 fill-current" />;
  if (normalized.includes("watchlist")) return <Star className="h-3.5 w-3.5 text-amber-400" />;
  if (normalized.includes("custom")) return <Radio className="h-3.5 w-3.5 text-teal-400" />;
  if (normalized.includes("news")) return <Newspaper className="h-3.5 w-3.5" />;
  if (normalized.includes("sport")) return <Trophy className="h-3.5 w-3.5 text-orange-400" />;
  if (normalized.includes("science") || normalized.includes("space")) return <Flame className="h-3.5 w-3.5 text-cyan-400" />;
  if (normalized.includes("music")) return <Music className="h-3.5 w-3.5" />;
  if (normalized.includes("movie") || normalized.includes("entertainment") || normalized.includes("culture")) return <Theater className="h-3.5 w-3.5" />;
  if (normalized.includes("lifestyle") || normalized.includes("food")) return <HeartPulse className="h-3.5 w-3.5 text-rose-400" />;
  return null;
};

export const CategoryFilter: React.FC = () => {
  const { categories, selectedCategory, setSelectedCategory } = useTV();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative border-b border-white/5 bg-[#0a0a0b] py-3.5 px-4 sm:px-10 select-none" id="categories-filter-bar">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        {/* Label description */}
        <span className="hidden sm:inline-block text-[10px] font-bold text-slate-500 uppercase tracking-widest pointer-events-none">
          Classify
        </span>

        {/* Categories container */}
        <div
          ref={scrollContainerRef}
          className="flex-1 flex overflow-x-auto gap-2 scrollbar-none pb-1 -mb-1 pr-4"
          style={{ scrollbarWidth: "none" }}
        >
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            const icon = getCategoryIcon(cat);
            return (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 shrink-0 px-4 py-2 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                  isActive
                    ? "bg-blue-600 border-blue-500 text-white font-bold"
                    : "border-white/5 bg-white/5 text-slate-400 hover:border-white/10 hover:text-slate-200"
                }`}
              >
                {icon}
                <span>{cat}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default CategoryFilter;
