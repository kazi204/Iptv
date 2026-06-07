import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback, ReactNode } from "react";
import { Channel, Playlist } from "../types";
import { parseM3U } from "../utils/parseM3U";
import { DEFAULT_M3U_PLAYLIST } from "../data/defaultChannels";

// Define the precise state shape requested by the user, plus compatibility layers
export interface TVState {
  channels: Channel[];
  customChannels: Channel[];
  activeChannel: Channel | null;
  favorites: string[];
  activeCategory: string;
  searchQuery: string;
  playlistUrl: string;
  
  // Compatibility state
  playlists: Playlist[];
  isLoading: boolean;
  error: string | null;
}

// Define the exact Actions specified
export type TVAction =
  | { type: "SET_CHANNELS"; payload: Channel[] }
  | { type: "SET_ACTIVE_CHANNEL"; payload: Channel | null }
  | { type: "TOGGLE_FAVORITE"; payload: string }
  | { type: "SET_CATEGORY"; payload: string }
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_PLAYLIST_URL"; payload: string }
  | { type: "ADD_CUSTOM_CHANNEL"; payload: Channel }
  | { type: "DELETE_CUSTOM_CHANNEL"; payload: string }
  
  // Compatibility actions
  | { type: "SET_PLAYLISTS"; payload: Playlist[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

const getStoredFavorites = (): string[] => {
  try {
    const storedFavorites = localStorage.getItem("tv_favorites") || localStorage.getItem("tv_watchlist");
    if (storedFavorites) {
      return JSON.parse(storedFavorites);
    }
  } catch (err) {
    console.error("Failed to parse favorites from storage", err);
  }
  return [];
};

const getStoredPlaylists = (): Playlist[] => {
  try {
    const storedPlaylists = localStorage.getItem("tv_playlists");
    if (storedPlaylists) {
      return JSON.parse(storedPlaylists);
    }
  } catch (err) {
    console.error("Failed to parse playlists from storage", err);
  }
  return [];
};

const getStoredCustomChannels = (): Channel[] => {
  try {
    const storedCustom = localStorage.getItem("tv_custom_channels");
    if (storedCustom) {
      return JSON.parse(storedCustom);
    }
  } catch (err) {
    console.error("Failed to parse custom channels from storage", err);
  }
  return [];
};

const initialState: TVState = {
  channels: [],
  customChannels: getStoredCustomChannels(),
  activeChannel: null,
  favorites: getStoredFavorites(),
  activeCategory: "All",
  searchQuery: "",
  playlistUrl: "https://iptv-org.github.io/iptv/countries/bd.m3u",
  playlists: getStoredPlaylists(),
  isLoading: true,
  error: null,
};

function tvReducer(state: TVState, action: TVAction): TVState {
  switch (action.type) {
    case "SET_CHANNELS":
      return { ...state, channels: action.payload };
    case "SET_ACTIVE_CHANNEL":
      return { ...state, activeChannel: action.payload };
    case "TOGGLE_FAVORITE": {
      const channelId = action.payload;
      const exists = state.favorites.includes(channelId);
      const updatedFavorites = exists
        ? state.favorites.filter((id) => id !== channelId)
        : [...state.favorites, channelId];
      
      localStorage.setItem("tv_favorites", JSON.stringify(updatedFavorites));
      localStorage.setItem("tv_watchlist", JSON.stringify(updatedFavorites)); // for compatibility
      return { ...state, favorites: updatedFavorites };
    }
    case "SET_CATEGORY":
      return { ...state, activeCategory: action.payload };
    case "SET_SEARCH":
      return { ...state, searchQuery: action.payload };
    case "SET_PLAYLIST_URL":
      return { ...state, playlistUrl: action.payload };
    case "ADD_CUSTOM_CHANNEL": {
      const updatedCustom = [...state.customChannels, action.payload];
      localStorage.setItem("tv_custom_channels", JSON.stringify(updatedCustom));
      return { ...state, customChannels: updatedCustom };
    }
    case "DELETE_CUSTOM_CHANNEL": {
      const channelId = action.payload;
      const updatedCustom = state.customChannels.filter((ch) => ch.id !== channelId);
      localStorage.setItem("tv_custom_channels", JSON.stringify(updatedCustom));
      
      const updatedFavorites = state.favorites.filter((id) => id !== channelId);
      localStorage.setItem("tv_favorites", JSON.stringify(updatedFavorites));
      localStorage.setItem("tv_watchlist", JSON.stringify(updatedFavorites));

      let nextActive = state.activeChannel;
      if (state.activeChannel?.id === channelId) {
        nextActive = state.channels[0] || updatedCustom[0] || null;
      }

      return {
        ...state,
        customChannels: updatedCustom,
        favorites: updatedFavorites,
        activeChannel: nextActive,
      };
    }
    case "SET_PLAYLISTS":
      return { ...state, playlists: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

interface TVContextProps {
  state: TVState;
  dispatch: React.Dispatch<TVAction>;
  
  // Direct destructuring support matching the requested state properties
  channels: Channel[];
  customChannels: Channel[];
  activeChannel: Channel | null;
  favorites: string[];
  activeCategory: string;
  searchQuery: string;
  playlistUrl: string;
  
  // Compatibility direct properties for existing code usage
  playlists: Playlist[];
  watchlist: string[]; // alias of favorites
  selectedCategory: string; // alias of activeCategory
  isLoading: boolean;
  error: string | null;
  categories: string[];
  filteredChannels: Channel[];
  
  // Direct setter function wrappers for compatibility
  setActiveChannel: (channel: Channel | null) => void;
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  toggleWatchlist: (channelId: string) => void;
  toggleFavorite: (channelId: string) => void;
  setPlaylistUrl: (url: string) => void;
  importPlaylist: (name: string, contentOrUrl: string, isUrl: boolean) => Promise<boolean>;
  deletePlaylist: (playlistId: string) => void;
  reloadDefaultPlaylist: () => void;
  
  // Custom added streams
  addCustomChannel: (name: string, url: string, category?: string, logoUrl?: string) => void;
  deleteCustomChannel: (id: string) => void;
}

const TVContext = createContext<TVContextProps | undefined>(undefined);

export const TVProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(tvReducer, initialState);

  // Fetch channels from playlistUrl on change
  useEffect(() => {
    if (!state.playlistUrl) return;

    let isMounted = true;
    const fetchChannels = async () => {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });
      try {
        let text = "";
        let response;
        try {
          response = await fetch(state.playlistUrl);
          if (!response.ok) {
            throw new Error(`Direct connection returned HTTP status ${response.status}`);
          }
          text = await response.text();
        } catch (directErr) {
          console.warn("Direct fetch failed or blocked by CORS. Using proxy fallback...", directErr);
          const fallbackUrl = `https://corsproxy.io/?${encodeURIComponent(state.playlistUrl)}`;
          response = await fetch(fallbackUrl);
          if (!response.ok) {
            throw new Error(`CORS Proxy failed (HTTP status: ${response.status})`);
          }
          text = await response.text();
        }

        const parsedList = parseM3U(text);
        
        // De-duplicate parsedList IDs
        const uniqueList: Channel[] = [];
        const seenIds = new Set<string>();
        parsedList.forEach(ch => {
          let uniqueId = ch.id;
          let counter = 1;
          while (seenIds.has(uniqueId)) {
            uniqueId = `${ch.id}-${counter}`;
            counter++;
          }
          seenIds.add(uniqueId);
          uniqueList.push({ ...ch, id: uniqueId });
        });

        if (isMounted) {
          dispatch({ type: "SET_CHANNELS", payload: uniqueList });
          
          // Auto-select first channel
          if (uniqueList.length > 0) {
            dispatch({ type: "SET_ACTIVE_CHANNEL", payload: uniqueList[0] });
          } else {
            dispatch({ type: "SET_ACTIVE_CHANNEL", payload: null });
          }
        }
      } catch (err: any) {
        if (isMounted) {
          dispatch({ type: "SET_ERROR", payload: err.message || "Failed to load playlist" });
          dispatch({ type: "SET_CHANNELS", payload: [] });
          dispatch({ type: "SET_ACTIVE_CHANNEL", payload: null });
        }
      } finally {
        if (isMounted) {
          dispatch({ type: "SET_LOADING", payload: false });
        }
      }
    };

    fetchChannels();

    return () => {
      isMounted = false;
    };
  }, [state.playlistUrl]);

  // Compute categories/groups dynamically from the loaded channels + Add All and Favorites
  const categories = useMemo(() => {
    const list = new Set<string>();
    list.add("All");
    list.add("Favorites");
    list.add("Custom Channels");
    
    state.channels.forEach(ch => {
      if (ch.group) {
        list.add(ch.group);
      }
    });
    state.customChannels.forEach(ch => {
      if (ch.group) {
        list.add(ch.group);
      }
    });
    return Array.from(list);
  }, [state.channels, state.customChannels]);

  // Compute filtered channels based on active category (Favorites filter included) and search query
  const filteredChannels = useMemo(() => {
    const allChannels = [...state.customChannels, ...state.channels];
    return allChannels.filter(ch => {
      // Category filter
      if (state.activeCategory === "Favorites" || state.activeCategory === "★ Watchlist") {
        if (!state.favorites.includes(ch.id)) return false;
      } else if (state.activeCategory === "Custom Channels") {
        if (!ch.isCustom) return false;
      } else if (state.activeCategory !== "All") {
        if (ch.group !== state.activeCategory) return false;
      }

      // Query search filter
      if (state.searchQuery.trim()) {
        const query = state.searchQuery.toLowerCase();
        const matchesName = ch.name.toLowerCase().includes(query);
        const matchesGroup = ch.group?.toLowerCase().includes(query) || false;
        const matchesCountry = ch.country?.toLowerCase().includes(query) || false;
        return matchesName || matchesGroup || matchesCountry;
      }

      return true;
    });
  }, [state.channels, state.customChannels, state.activeCategory, state.favorites, state.searchQuery]);

  // Define action dispatch wraps
  const setActiveChannel = useCallback((ch: Channel | null) => {
    dispatch({ type: "SET_ACTIVE_CHANNEL", payload: ch });
  }, []);

  const setSelectedCategory = useCallback((cat: string) => {
    dispatch({ type: "SET_CATEGORY", payload: cat });
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: "SET_SEARCH", payload: query });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    dispatch({ type: "TOGGLE_FAVORITE", payload: id });
  }, []);

  const toggleWatchlist = useCallback((id: string) => {
    dispatch({ type: "TOGGLE_FAVORITE", payload: id });
  }, []);

  const setPlaylistUrl = useCallback((url: string) => {
    dispatch({ type: "SET_PLAYLIST_URL", payload: url });
  }, []);

  // Compatibility function for custom playlists
  const importPlaylist = useCallback(async (name: string, contentOrUrl: string, isUrl: boolean): Promise<boolean> => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });
    try {
      let m3uContent = "";
      if (isUrl) {
        const response = await fetch(contentOrUrl);
        if (!response.ok) {
          throw new Error("Could not retrieve playlist from URL");
        }
        m3uContent = await response.text();
      } else {
        m3uContent = contentOrUrl;
      }

      const parsedChannels = parseM3U(m3uContent);
      if (parsedChannels.length === 0) {
        throw new Error("No channels found in this playlist.");
      }

      const newPlaylist: Playlist = {
        id: `pl-${Date.now()}`,
        name: name || `M3U Playlist ${state.playlists.length + 1}`,
        url: isUrl ? contentOrUrl : undefined,
        content: m3uContent,
        channelCount: parsedChannels.length,
        isActive: true,
        importedAt: new Date().toLocaleDateString(),
      };

      const updatedPlaylists = [...state.playlists, newPlaylist];
      dispatch({ type: "SET_PLAYLISTS", payload: updatedPlaylists });
      localStorage.setItem("tv_playlists", JSON.stringify(updatedPlaylists));

      // Import as channels
      const scoped = parsedChannels.map(ch => ({
        ...ch,
        id: `${newPlaylist.id}-${ch.id}`
      }));
      dispatch({ type: "SET_CHANNELS", payload: [...state.channels, ...scoped] });
      
      if (!state.activeChannel && scoped.length > 0) {
        dispatch({ type: "SET_ACTIVE_CHANNEL", payload: scoped[0] });
      }

      return true;
    } catch (err: any) {
      dispatch({ type: "SET_ERROR", payload: err.message || "Failed to process IPTV playlist" });
      return false;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.playlists, state.channels, state.activeChannel]);

  const deletePlaylist = useCallback((playlistId: string) => {
    const updated = state.playlists.filter(p => p.id !== playlistId);
    dispatch({ type: "SET_PLAYLISTS", payload: updated });
    localStorage.setItem("tv_playlists", JSON.stringify(updated));

    // Filter channels
    const filtered = state.channels.filter(ch => !ch.id.startsWith(playlistId));
    dispatch({ type: "SET_CHANNELS", payload: filtered });
    if (state.activeChannel && state.activeChannel.id.startsWith(playlistId)) {
      dispatch({ type: "SET_ACTIVE_CHANNEL", payload: filtered[0] || null });
    }
  }, [state.playlists, state.channels, state.activeChannel]);

  const reloadDefaultPlaylist = useCallback(() => {
    dispatch({ type: "SET_PLAYLIST_URL", payload: "https://iptv-org.github.io/iptv/countries/bd.m3u" });
    dispatch({ type: "SET_CATEGORY", payload: "All" });
    dispatch({ type: "SET_SEARCH", payload: "" });
  }, []);

  const addCustomChannel = useCallback((name: string, url: string, category: string = "Custom Channels", logoUrl: string = "") => {
    const newChannel: Channel = {
      id: `custom-${Date.now()}`,
      name,
      url,
      logo: logoUrl || undefined,
      group: category || "Custom Channels",
      isCustom: true
    };
    dispatch({ type: "ADD_CUSTOM_CHANNEL", payload: newChannel });
    dispatch({ type: "SET_ACTIVE_CHANNEL", payload: newChannel });
  }, []);

  const deleteCustomChannel = useCallback((id: string) => {
    dispatch({ type: "DELETE_CUSTOM_CHANNEL", payload: id });
  }, []);

  return (
    <TVContext.Provider
      value={{
        state,
        dispatch,
        
        // State unpacking
        channels: state.channels,
        customChannels: state.customChannels,
        activeChannel: state.activeChannel,
        favorites: state.favorites,
        activeCategory: state.activeCategory,
        searchQuery: state.searchQuery,
        playlistUrl: state.playlistUrl,
        
        // Compatibility unpacking
        playlists: state.playlists,
        watchlist: state.favorites, // alias
        selectedCategory: state.activeCategory, // alias
        isLoading: state.isLoading,
        error: state.error,
        categories,
        filteredChannels,
        
        // Bound handlers
        setActiveChannel,
        setSelectedCategory,
        setSearchQuery,
        toggleWatchlist,
        toggleFavorite,
        setPlaylistUrl,
        importPlaylist,
        deletePlaylist,
        reloadDefaultPlaylist,
        
        addCustomChannel,
        deleteCustomChannel,
      }}
    >
      {children}
    </TVContext.Provider>
  );
};

export const useTVContext = () => {
  const context = useContext(TVContext);
  if (context === undefined) {
    throw new Error("useTVContext must be used within a TVProvider");
  }
  return context;
};

// Aliased useTV export for existing codebase pieces
export const useTV = () => {
  return useTVContext();
};
