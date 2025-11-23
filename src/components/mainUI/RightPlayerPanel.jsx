import { useMemo } from "react";
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
} from "lucide-react";
import { MUSIC_NOTE_FALLBACK } from "./utils";
/*
  To make the RightPlayerPanel component itself vertically scrollable
  (instead of only the queue having scroll), wrap the top-level content in a div:
    className="h-full overflow-y-auto"
  or similar at the top-level container of the component (not shown in import section).
  IN THIS SELECTION: No code changes beyond imports are needed here,
  but be sure to update container div in the main component render accordingly.
*/

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

  // Calculate the index in the playback list for queue display
  const songIndexInList = useMemo(
    () =>
      currentPlaybackList.findIndex((song) => song.url === currentSong?.url),
    [currentPlaybackList, currentSong]
  );

  const upNext =
    songIndexInList >= 0
      ? currentPlaybackList.slice(songIndexInList + 1)
      : currentPlaybackList;
  const fallbackCover = MUSIC_NOTE_FALLBACK;

  const handleQueueItemClick = (song, index) => {
    if (playSong && currentPlaybackList) {
      // Find the actual index in the current playback list
      const actualIndex = currentPlaybackList.findIndex((s) => s.url === song.url);
      if (actualIndex >= 0) {
        playSong(currentPlaybackList, actualIndex);
      }
    }
    // if (onClose) {
    //   onClose();
    // }
  };

  return (
    <div className="w-full lg:w-96 h-full relative flex flex-shrink-0 flex-col bg-background lg:bg-transparent">
      {/* Enhanced Glass panel with gradient and stronger blur */}
      <div className="absolute inset-0 bg-gradient-glass backdrop-blur-3xl border-l border-white/10">
        <div className="absolute inset-0 bg-card/20"></div>
      </div>

      {/* Close button for mobile */}
      <div className="lg:hidden fixed z-20 flex justify-end p-3 right-0">
        <button
          onClick={onClose}
          className="p-2 rounded-lg bg-white/5 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 transition-all duration-300"
          aria-label="Close panel"
        >
          <X size={24} />
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 md:p-6 flex flex-col space-y-4 md:space-y-6 h-full ">
        {/* Player Section */}
        {currentSong ? (
          <div className="flex flex-col text-white space-y-4 md:space-y-6 flex-shrink-0">
            {/* Cover with enhanced glass effect */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-primary opacity-30 rounded-2xl blur-xl group-hover:opacity-50 transition-opacity duration-300"></div>
              <img
                src={currentCover}
                alt="Cover"
                className="relative w-full aspect-square rounded-2xl shadow-2xl shadow-primary/30 ring-1 ring-white/20"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = fallbackCover;
                }}
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-xl md:text-2xl font-bold truncate text-white">
                {currentSong.title}
              </h2>
              <p className="text-xs md:text-sm text-white/70 truncate">
                {currentSong.artist}
              </p>
            </div>

            {/* Progress Bar with enhanced glass styling */}
            <div className="w-full space-y-2">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleProgressChange}
                className="w-full h-2 appearance-none rounded-full bg-white/5 backdrop-blur-md cursor-pointer border border-white/10
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary 
                  [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-primary/50
                  [&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-white/30
                  [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-all
                  [&::-webkit-slider-thumb]:hover:scale-125 [&::-webkit-slider-thumb]:hover:shadow-xl"
                style={{
                  background: `linear-gradient(to right,
                    hsl(var(--primary)) ${(currentTime / (duration || 1)) * 100}%,
                    rgba(255, 255, 255, 0.05) ${(currentTime / (duration || 1)) * 100}%
                  )`,
                }}
              />
              <div className="flex justify-between text-xs text-white/70">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls with enhanced glass buttons */}
            <div className="flex items-center justify-center space-x-2 md:space-x-4">
              <button
                onClick={toggleShuffle}
                className={`p-2 rounded-full backdrop-blur-xl transition-all duration-300 border ${
                  isShuffle
                    ? "bg-primary/20 text-primary border-primary/30 shadow-lg shadow-primary/20"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border-white/10"
                }`}
              >
                <Shuffle size={18} className="md:w-5 md:h-5" />
              </button>

              <button
                onClick={onPrev}
                className="p-2 md:p-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 hover:scale-105 hover:border-white/20 transition-all duration-300 shadow-lg"
              >
                <SkipBack size={20} className="md:w-[22px] md:h-[22px]" fill="currentColor" />
              </button>

              <button
                onClick={onPlayPause}
                className="w-12 h-12 md:w-16 md:h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white shadow-2xl shadow-primary/50 hover:shadow-3xl hover:shadow-primary/60 hover:scale-110 transition-all duration-300 ring-2 ring-white/20 backdrop-blur-xl"
              >
                {isPlaying ? (
                  <Pause size={24} className="md:w-7 md:h-7" fill="currentColor" />
                ) : (
                  <Play size={24} className="md:w-7 md:h-7" fill="currentColor" />
                )}
              </button>

              <button
                onClick={onNext}
                className="p-2 md:p-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 hover:scale-105 hover:border-white/20 transition-all duration-300 shadow-lg"
              >
                <SkipForward size={20} className="md:w-[22px] md:h-[22px]" fill="currentColor" />
              </button>

              <button
                onClick={toggleRepeat}
                className={`p-2 rounded-full backdrop-blur-xl transition-all duration-300 border ${
                  repeatMode !== "off"
                    ? "bg-primary/20 text-primary border-primary/30 shadow-lg shadow-primary/20"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border-white/10"
                }`}
              >
                <Repeat size={18} className="md:w-5 md:h-5" />
              </button>
            </div>

            {/* Secondary controls with enhanced glass effect */}
            <div className="flex items-center justify-between p-3 md:p-4 rounded-2xl bg-gradient-glass backdrop-blur-xl border border-white/10 shadow-xl">
              <div className="flex items-center gap-2 md:gap-3">
                <button className="text-white/70 hover:text-white transition-colors">
                  <Heart size={16} className="md:w-[18px] md:h-[18px]" />
                </button>
                <button className="text-white/70 hover:text-white transition-colors">
                  <ListMusic size={16} className="md:w-[18px] md:h-[18px]" />
                </button>
                <button className="text-white/70 hover:text-white transition-colors">
                  <Clock size={16} className="md:w-[18px] md:h-[18px]" />
                </button>
                <button className="text-white/70 hover:text-white transition-colors">
                  <MoreHorizontal size={16} className="md:w-[18px] md:h-[18px]" />
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <Volume2 size={16} className="md:w-[18px] md:h-[18px] text-white/70" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  defaultValue="1"
                  onChange={(e) => {
                    const vol = parseFloat(e.target.value);
                    audioRef.current.volume = vol;
                  }}
                  className="w-20 h-1 appearance-none rounded-full bg-white/10 cursor-pointer border border-white/10
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary 
                    [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-primary/30"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-white/70 text-center space-y-4">
            <div className="p-4 md:p-6 rounded-full bg-gradient-glass backdrop-blur-xl border border-white/10 shadow-2xl">
              <Music size={40} className="md:w-12 md:h-12" />
            </div>
            <div>
              <p className="text-base md:text-lg font-semibold text-white">No song selected</p>
              <p className="text-xs md:text-sm text-white/70">Load music to start playing</p>
            </div>
          </div>
        )}

        {/* Queue Section with enhanced glass effect */}
        <div className="border-t border-white/10 pt-4 md:pt-6 flex flex-col min-h-0 flex-1 overflow-hidden">
          <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4 text-white flex-shrink-0">Up Next</h3>
          <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 min-h-0">
            {upNext.length > 0 ? (
              upNext.slice(0, 20).map((song, index) => {
                // Calculate the actual index in the full playback list
                const actualIndex = currentPlaybackList.findIndex((s) => s.url === song.url);
                return (
                  <div
                    key={`${song.url}-${index}`}
                    onClick={() => handleQueueItemClick(song, actualIndex)}
                    className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 rounded-xl hover:bg-white/5 backdrop-blur-xl transition-all duration-200 cursor-pointer group border border-transparent hover:border-white/10 hover:shadow-lg"
                  >
                    <img
                      src={song.cover || fallbackCover}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-lg ring-1 ring-white/20 shadow-md flex-shrink-0"
                      onError={(e) => (e.target.src = fallbackCover)}
                      alt="cover"
                    />
                    <div className="truncate flex-grow min-w-0">
                      <p className="text-xs md:text-sm text-white group-hover:text-primary transition-colors truncate">
                        {song.title}
                      </p>
                      <p className="text-[10px] md:text-xs text-white/70 truncate">{song.artist}</p>
                    </div>
                    <span className="text-[10px] md:text-xs text-white/70 flex-shrink-0">{song.duration}</span>
                  </div>
                );
              })
            ) : (
              <div className="text-center p-6 md:p-8 rounded-xl bg-gradient-glass backdrop-blur-xl border border-white/10 shadow-lg">
                <p className="text-xs md:text-sm text-white/70">Queue is empty</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightPlayerPanel;

