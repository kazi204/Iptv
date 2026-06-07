import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

export function usePlayer(streamUrl: string | undefined) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [qualities, setQualities] = useState<{ id: number; height: number; width?: number; bitrate?: number }[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 is Auto
  const [isLoading, setIsLoading] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [buffered, setBuffered] = useState(0);
  const [isLive, setIsLive] = useState(true);
  const [errorHappened, setErrorHappened] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    setIsLoading(true);
    setErrorHappened(null);
    setQualities([]);
    setCurrentQuality(-1);

    // If an existing HLS instance exists, destroy it
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        maxBufferLength: 30, // maximum buffer length in seconds
      });

      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        setIsLoading(false);
        // Map available quality levels
        const mappedQualities = hls.levels.map((level, index) => ({
          id: index,
          height: level.height,
          width: level.width,
          bitrate: level.bitrate,
        }));
        // Sort descending by height
        setQualities(mappedQualities.sort((a, b) => b.height - a.height));
        
        // Default play
        video.play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        // Hls handles quality selection
        // data.level is the index of selected level
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("hls.js error:", data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setErrorHappened("Network error encountered. Trying to recover...");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setErrorHappened("Media decoding failed. Retrying...");
              hls.recoverMediaError();
              break;
            default:
              setErrorHappened("Player loaded with standard errors. Stream might be inactive.");
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // For Safari and native browser HLS
      video.src = streamUrl;
      video.addEventListener("loadedmetadata", () => {
        setIsLoading(false);
        video.play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      });

      video.addEventListener("error", () => {
        setErrorHappened("Standard video load error. Check compatibility of this HLS stream.");
        setIsLoading(false);
      });
    } else {
      setErrorHappened("HLS stream playback is not supported on this platform/browser.");
      setIsLoading(false);
    }

    // Set initial volume & mute state
    video.volume = isMuted ? 0 : volume;
    video.muted = isMuted;

    // Monitor buffering & playback rate
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => setIsLoading(false);
    const handleTimeUpdate = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const duration = video.duration || 1;
        setBuffered(Math.min((bufferedEnd / duration) * 100, 100));
      }
      setIsLive(video.duration === Infinity || isNaN(video.duration));
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      // Dismount cleanly
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("timeupdate", handleTimeUpdate);

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl]);

  // Sync volume actions
  const changeVolume = (newVolume: number) => {
    const vol = Math.max(0, Math.min(1, newVolume));
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : vol;
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
      videoRef.current.volume = nextMuted ? 0 : volume;
    }
  };

  // Switch streaming quality
  const changeQuality = (levelIndex: number) => {
    setCurrentQuality(levelIndex);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(e => console.warn(e));
    }
  };

  const changeSpeed = (rate: number) => {
    setPlaybackSpeed(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  return {
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
  };
}
