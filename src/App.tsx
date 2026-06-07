/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { TVProvider } from "./context/TVContext";
import { Navbar } from "./components/Navbar";
import { Home } from "./pages/Home";
import { Loader2, Tv } from "lucide-react";

const WatchPage = lazy(() => import("./pages/WatchPage"));

const SuspenseLoading: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] select-none text-center p-6 bg-[#0a0a0b]" id="suspense-loader">
    <div className="relative h-16 w-16 mb-4 flex items-center justify-center">
      <Loader2 className="absolute h-12 w-12 text-teal-500 animate-spin" />
      <Tv className="h-6 w-6 text-slate-450" />
    </div>
    <h3 className="text-sm font-sans font-extrabold text-white tracking-tight">Channel Buffer Tuning</h3>
    <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-wider animate-pulse">Initializing direct stream connection...</p>
  </div>
);

export default function App() {
  return (
    <TVProvider>
      <Router>
        <div className="min-h-screen bg-[#0a0a0b] text-slate-100 flex flex-col selection:bg-teal-600/30 selection:text-teal-100">
          {/* Global Sticky Navigation Bar */}
          <Navbar />
          
          {/* Main Workspace Routing */}
          <main className="flex-1">
            <Suspense fallback={<SuspenseLoading />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/watch/:id" element={<WatchPage />} />
              </Routes>
            </Suspense>
          </main>

          {/* Humble, polished footer */}
          <footer className="border-t border-white/5 bg-[#0d0d0f] py-6 text-center text-[10px] text-slate-500 select-none">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 font-medium">
              <p>© 2026 Vuecast Player Inc. All Rights Reserved.</p>
              <div className="flex gap-4">
                <a href="#/" className="hover:text-slate-300">Privacy Policy</a>
                <span className="text-white/10">•</span>
                <a href="#/" className="hover:text-slate-300">Terms of Use</a>
                <span className="text-white/10">•</span>
                <a href="#/" className="hover:text-slate-300">HLS Live Tuner</a>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </TVProvider>
  );
}
