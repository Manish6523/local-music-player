import { useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Volume2,
  ListMusic,
  Heart,
  Music,
  Clock,
  MoreHorizontal,
  X,
  Activity,
  Terminal,
} from "lucide-react";
import { MUSIC_NOTE_FALLBACK } from "./utils";

const RightPlayerPanel = ({
  currentSong,
  isPlaying,
  duration,
  currentTime,
  onPlayPause,
  onPrev,
  onNext,
  onSeek,
  audioRef,
  isShuffle,
  toggleShuffle,
  repeatMode,
  toggleRepeat,
  currentPlaybackList,
  playSong,
  currentSongIndex,
  onClose,
}) => {
  const location = useLocation();
  if (location.pathname === "/preview") return <></>;

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === 0) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleProgressChange = (e) => {
    const newTime = parseFloat(e.target.value);
    onSeek(newTime);
  };

  const currentCover = currentSong?.cover || MUSIC_NOTE_FALLBACK;

  const songIndexInList = useMemo(
    () => currentPlaybackList.findIndex((song) => song.url === currentSong?.url),
    [currentPlaybackList, currentSong]
  );

  const upNext =
    songIndexInList >= 0
      ? currentPlaybackList.slice(songIndexInList + 1)
      : currentPlaybackList;

  return (
    <div className="w-full lg:w-96 h-full relative flex shrink-0 flex-col bg-background font-mono border-l border-white/10">
      {/* Brutalist Glass Panel */}
      <div className="absolute inset-0 bg-gradient-glass backdrop-blur-3xl">
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Mobile Close */}
      <div className="lg:hidden fixed z-50 p-4 right-0">
        <button onClick={onClose} className="p-2 bg-white/50 text-black border border-white/20 cursor-pointer">
          <X size={20} />
        </button>
      </div>

      <div className="relative z-10 p-5 flex flex-col h-full overflow-hidden">
        {/* Technical Header */}
        <div className="hidden md:flex items-center justify-between mb-6 opacity-40 text-[10px] tracking-[0.3em] uppercase border-b border-white/10 pb-2">
          <span className="flex items-center gap-2"><Terminal size={12}/> AUDIO_OUTPUT</span>
          <span className="flex items-center gap-2"><Activity size={12}/> {isPlaying ? 'ACTIVE' : 'IDLE'}</span>
        </div>

        {currentSong ? (
          <div className="flex flex-col space-y-6 shrink-0">
            {/* Album Art: Brutalist Style */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-primary/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <img
                src={currentCover}
                alt="Manifest_Art"
                className="relative w-full aspect-square object-cover border border-white/10 grayscale-0hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute bottom-2 right-2 bg-black/80 border border-white/20 px-2 py-1 text-[9px] uppercase tracking-widest">
                {currentSong.duration}
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-black tracking-tighter uppercase truncate text-white">{currentSong.title}</h2>
              <p className="text-[10px] text-primary uppercase tracking-[0.2em]">{currentSong.artist}</p>
            </div>

            {/* Progress: Data Stream Style */}
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleProgressChange}
                className="w-full h-1 appearance-none bg-white cursor-pointer accent-primary"
                style={{
                  background: `linear-gradient(to right, #e4ff0e ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.1) 0%)`
                }}
              />
              <div className="flex justify-between text-[10px] text-white/40 tabular-nums">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls: Brutalist Grid */}
            <div className="grid grid-cols-5 gap-2">
              <button
                onClick={toggleShuffle}
                className={`p-2 flex items-center justify-center border transition-all cursor-pointer ${
                  isShuffle ? "bg-primary text-black border-primary" : "bg-white/5 text-white/40 border-white/10"
                }`}
              >
                <Shuffle size={14} />
              </button>
              <button
                onClick={onPrev}
                className="p-2 flex items-center justify-center bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <SkipBack size={16} fill="currentColor" />
              </button>
              <button
                onClick={onPlayPause}
                className="p-2 flex items-center justify-center bg-primary text-black shadow-[4px_4px_0px_rgba(var(--primary),0.3)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
              >
                {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
              </button>
              <button
                onClick={onNext}
                className="p-2 flex items-center justify-center bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <SkipForward size={16} fill="currentColor" />
              </button>
              <button
                onClick={toggleRepeat}
                className={`p-2 flex items-center justify-center border transition-all cursor-pointer ${
                  repeatMode !== "off" ? "bg-primary text-black border-primary" : "bg-white/5 text-white/40 border-white/10"
                }`}
              >
                <Repeat size={14} />
              </button>
            </div>

            {/* Audio Manifest Settings */}
            <div className="p-3 bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-widest text-white/30">Master_Volume</span>
                <Volume2 size={12} className="text-primary" />
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                defaultValue="1"
                onChange={(e) => (audioRef.current.volume = parseFloat(e.target.value))}
                className="w-full h-[2px] appearance-none bg-white/10 accent-primary cursor-pointer"
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-20 italic text-[10px] tracking-widest uppercase">
            [ No_Data_Source_Loaded ]
          </div>
        )}

        {/* Queue: The Manifest Stream */}
        <div className="mt-8 flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-[10px] font-bold tracking-[0.4em] uppercase text-primary">/ Up_Next</h3>
            <div className="h-px grow bg-white/10"></div>
          </div>
          <div className="space-y-1 overflow-y-auto custom-scrollbar pr-2">
            {upNext.length > 0 ? (
              upNext.slice(0, 20).map((song, index) => {
                // Calculate the actual index in the full playback list
                const actualIndex = currentPlaybackList.findIndex((s) => s.url === song.url);
                return (
                  <div
                    key={index} // Changed from idx to index to match the map argument
                    onClick={() => playSong(currentPlaybackList, actualIndex)}
                    className="grid grid-cols-[32px_1fr_40px] items-center p-2 border border-transparent hover:border-white/10 hover:bg-white/5 transition-all cursor-pointer group"
                  >
                    <span className="text-[9px] text-white/20 font-bold group-hover:text-primary transition-colors">
                      {(index + 1) < 10 ? `0${index + 1}` : index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase truncate text-white/60 group-hover:text-white transition-colors">
                        {song.title}
                      </p>
                      <p className="text-[8px] uppercase tracking-tighter text-white/20">{song.artist}</p>
                    </div>
                    <span className="text-[8px] text-white/20 text-right">{song.duration}</span>
                  </div>
                );
              })
            ) : (
              <div className="text-[10px] uppercase text-white/10 py-4 text-center border border-dashed border-white/5">
                End_of_Stream
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
};

export default RightPlayerPanel;