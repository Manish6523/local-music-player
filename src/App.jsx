import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Buffer } from "buffer";
import {
  Routes,
  Route,
  useParams,
  useNavigate,
  Link,
  useLocation, // Added useLocation for context
} from "react-router-dom";
import {
  Home as HomeIcon,
  Search,
  Library,
  ChevronLeft,
  ChevronRight,
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
  Disc3,
  Clock,
  Settings,
  User,
} from "lucide-react";
// Since this is a single file, we assume music-metadata-browser is available globally
// or mock the dependency. We will assume the real import is intended here.
// NOTE: For live environments, ensure 'music-metadata-browser' is bundled.
import { parseBlob } from "music-metadata-browser";


// Polyfill for Buffer needed by music-metadata-browser (mocked for this environment)
window.Buffer = Buffer;

// --- FALLBACK COVER GENERATION UTILITIES ---

/**
 * Generates a self-contained SVG Data URL for placeholder images.
 * This is used as a fallback if the audio file has no embedded cover art,
 * ensuring covers always display, regardless of CSP rules.
 * @param {string} text The character/text to display (e.g., first letter of the song title).
 * @param {string} baseColor The background hex color.
 * @returns {string} The SVG Data URL.
 */
const generateSvgCover = (text, baseColor = '333333') => {
    const titleChar = encodeURIComponent(text.charAt(0).toUpperCase());
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150">
        <rect width="150" height="150" rx="10" ry="10" fill="#${baseColor}"/>
        <text x="75" y="100" font-size="70" font-family="sans-serif" fill="#ffffff" text-anchor="middle">${titleChar}</text>
    </svg>`;
    return `data:image/svg+xml;base64,${btoa(svgContent)}`;
};

// --- HELPER COMPONENTS ---

// Fallback covers (Data URLs) defined globally for consistency
const MUSIC_NOTE_FALLBACK = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDEwMCAxMDAiPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMWRiOTU0Ii8+PHRleHQgeD0iNTAlIiB5PSI2MCUiIGZvbnQtc2l6ZT0iNDAiIGZvbnQtZmFtaWx5PSJhcmlhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZmZmZiI+4vzwvdGV4dD48L3N2Zz4=";
const PLAYLIST_FALLBACK_SM = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiB2aWV3Qm94PSIwIDAgMTUwIDE1MCI+PHJlY3Qgd2lkdGg9IjE1MCIgaGVpZ2h0PSIxNTAiIHJ4PSIxMCIgcnk9IjEwIiBmaWxsPSIjMjIyMjIyIi8+PHRleHQgeD0iNzUlIiB5PSI4NSUiIGZvbnQtc2l6ZT0iMzUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRkZGRkZGIj5QTEFZTElTVDwvdGV4dD48L3N2Zz4=";
const PLAYLIST_FALLBACK_LG = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgMzAwIDMwMCI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIHJ4PSIxNSIgcnk9IjE1IiBmaWxsPSIjMWRiOTU0Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjAiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjZmZmZmZmIj5QTEFZTElTVDwvdGV4dD48L3N2Zz4=";


// 1. PlayerControls Component (Fixed Footer)
const PlayerControls = ({
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

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md h-20 px-4 flex items-center justify-between z-50 border-t border-gray-800 shadow-2xl">
      {/* Left: Song Info */}
      <div className="flex items-center space-x-3 w-1/4 min-w-[150px] lg:w-1/4">
        {currentSong ? (
          <>
            <img
              src={currentCover}
              alt="Cover"
              className="w-12 h-12 object-cover rounded-md shadow-md flex-shrink-0"
              onError={(e) => { 
                console.error("PlayerControls image load error. Falling back to default.", e);
                e.target.onerror = null; 
                e.target.src=MUSIC_NOTE_FALLBACK; 
              }}
            />
            <div className="truncate hidden sm:block">
              <p className="text-sm font-semibold text-white truncate">{currentSong.title}</p>
              <p className="text-xs text-gray-400 truncate">{currentSong.artist}</p>
            </div>
            <button className="text-gray-400 hover:text-green-500 transition-colors hidden md:block" title="Favorite">
                <Heart size={18} />
            </button>
          </>
        ) : (
          <p className="text-sm text-gray-400">Select music to play...</p>
        )}
      </div>

      {/* Center: Controls and Progress Bar */}
      <div className="flex flex-col items-center justify-center w-full max-w-lg">
        {/* Playback Buttons */}
        <div className="flex items-center space-x-4 mb-1">
          <button
            onClick={toggleShuffle}
            className={`p-1 transition-colors ${isShuffle ? 'text-green-500' : 'text-gray-400 hover:text-white'}`}
            title="Shuffle"
            disabled={!currentSong}
          >
            <Shuffle size={20} />
          </button>
          <button
            onClick={onPrev}
            className="text-gray-200 hover:text-white transition-colors disabled:opacity-50"
            title="Previous"
            disabled={!currentSong}
          >
            <SkipBack size={20} fill="currentColor" />
          </button>
          <button
            onClick={onPlayPause}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform text-gray-900 disabled:opacity-50"
            title={isPlaying ? "Pause" : "Play"}
            disabled={!currentSong}
          >
            {isPlaying ? (
              <Pause size={20} fill="currentColor" />
            ) : (
              <Play size={20} fill="currentColor" className="ml-0.5" />
            )}
          </button>
          <button
            onClick={onNext}
            className="text-gray-200 hover:text-white transition-colors disabled:opacity-50"
            title="Next"
            disabled={!currentSong}
          >
            <SkipForward size={20} fill="currentColor" />
          </button>
          <button
            onClick={toggleRepeat}
            className={`p-1 transition-colors disabled:opacity-50 
                        ${repeatMode !== 'off' ? 'text-green-500' : 'text-gray-400 hover:text-white'}`}
            title={`Repeat: ${repeatMode}`}
            disabled={!currentSong}
          >
            <Repeat size={20} className={`${repeatMode === 'one' ? 'border border-green-500 rounded-full p-px' : ''}`} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center space-x-2 w-full text-xs text-gray-400">
          <span className="w-8 text-right hidden sm:block">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleProgressChange}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg player-progress-slider"
            disabled={!currentSong}
          />
          <span className="w-8 text-left hidden sm:block">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Volume and Queue Button */}
      <div className="flex items-center space-x-4 w-1/4 justify-end min-w-[120px]">
        <ListMusic size={20} className="text-gray-400 hover:text-white cursor-pointer transition-colors hidden sm:block" title="Queue"/>
        <Volume2 size={20} className="text-gray-400 hidden sm:block" />
        {/* Volume slider */}
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          defaultValue="1"
          onChange={(e) => (audioRef.current.volume = parseFloat(e.target.value))}
          className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer player-progress-slider hidden lg:block"
        />
        <Settings size={20} className="text-gray-400 hover:text-white cursor-pointer transition-colors" title="Settings"/>
      </div>

      {/* Custom Tailwind progress bar styling */}
      <style>{`
        /* Custom progress slider colors (Green theme) */
        .player-progress-slider {
             --tw-range-track-bg: #4b5563; 
        }
        .player-progress-slider::-webkit-slider-runnable-track {
            background: #4b5563; /* Gray-600 */
            height: 4px;
            border-radius: 9999px;
        }
        .player-progress-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #1db954; /* Spotify Green */
            cursor: pointer;
            margin-top: -4px; 
            box-shadow: 0 0 5px rgba(29, 185, 84, 0.7);
            transition: opacity 0.2s;
        }
        /* Hide thumb until hover on the track */
        .player-progress-slider::-webkit-slider-thumb {
            opacity: 0;
        }
        .player-progress-slider:hover::-webkit-slider-thumb {
            opacity: 1;
        }
      `}</style>
    </div>
  );
};


// 2. Navbar Component (Top Bar for main content area)
const Navbar = ({ navigateBack, navigateForward }) => {
  return (
    <nav className="h-14 bg-gray-900/80 backdrop-blur-sm px-6 flex items-center justify-between shadow-lg sticky top-0 z-30">
      {/* Left: Nav Buttons */}
      <div className="flex items-center space-x-2">
        <button
          onClick={navigateBack}
          className="p-1.5 bg-black/50 rounded-full text-gray-300 hover:bg-black transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={navigateForward}
          className="p-1.5 bg-black/50 rounded-full text-gray-500 cursor-not-allowed transition-colors"
          disabled
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Right: User Icons */}
      <div className="flex items-center space-x-4">
        <button className="bg-white text-gray-900 px-4 py-1.5 rounded-full hover:bg-gray-200 transition-colors text-sm font-semibold hidden md:block">
          Explore Premium
        </button>
        <button className="bg-black text-white px-4 py-1.5 rounded-full hover:bg-gray-800 transition-colors text-sm font-semibold flex items-center space-x-2">
            <User size={18} className="text-gray-400"/>
            <span className="hidden sm:block">Profile</span>
        </button>
      </div>
    </nav>
  );
};


// 3. Sidebar Component (Left Column)
const Sidebar = ({ onFolderSelect, playlistNames, selectPlaylist }) => {

    const NavLink = ({ to, icon: Icon, label, isActive }) => (
        <Link
            to={to}
            className={`flex items-center space-x-4 p-2 rounded-lg transition-colors font-semibold 
                        ${isActive ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
        >
            <Icon size={24} className={isActive ? 'text-white' : 'text-gray-400'} />
            <span className="hidden md:block">{label}</span>
        </Link>
    );
    
    const location = window.location.pathname;

    return (
        <div className="w-16 md:w-64 bg-black p-2 md:p-4 space-y-2 flex-shrink-0 h-full overflow-y-auto custom-scrollbar">
            {/* Logo - Hidden on mobile, bigger on desktop */}
            <div className="h-10 hidden md:flex items-center px-2 mb-4">
                <Music size={32} className="text-green-500" />
                <span className="text-2xl font-extrabold text-white ml-2">MusiQx</span>
            </div>
            
            {/* Top Navigation Block */}
            <div className="bg-gray-900 rounded-lg p-3 space-y-1 shadow-xl">
                <NavLink to="/" icon={HomeIcon} label="Home" isActive={location === '/'} />
                <NavLink to="/search" icon={Search} label="Search" isActive={location === '/search'} />
            </div>

            {/* Library Block */}
            <div className="bg-gray-900 rounded-lg p-3 space-y-4 shadow-xl flex flex-col flex-grow h-auto max-h-[calc(100vh-280px)]">
                <div className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors cursor-pointer p-2 rounded-lg">
                    <Library size={24} />
                    <span className="font-semibold hidden md:block">Your Library</span>
                </div>
                
                {/* Playlists/Folders List */}
                <div className="space-y-1 overflow-y-auto custom-scrollbar pr-1 flex-grow">
                    {playlistNames.length === 0 ? (
                        <p className="text-xs text-gray-500 px-2 hidden md:block">No playlists.</p>
                    ) : (
                        <ul className="space-y-1">
                            {playlistNames.map((name) => (
                                <li key={name}>
                                    <Link
                                        to={`/play/${encodeURIComponent(name)}`}
                                        onClick={() => selectPlaylist(name)}
                                        className="text-sm text-gray-300 hover:text-white transition-colors block p-2 rounded-md hover:bg-gray-800 truncate"
                                        title={name}
                                    >
                                        <ListMusic size={16} className="inline mr-2 text-green-400 hidden md:inline"/>
                                        <span className="hidden md:inline">{name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Load Folder Button */}
                <label className="block w-full text-center py-2 md:py-1 px-1 md:px-4 bg-green-600 text-white rounded-full cursor-pointer hover:bg-green-700 transition-colors font-semibold text-xs md:text-sm shadow-md mt-auto">
                    <span className="hidden md:inline">+ New Playlist (Load Folder)</span>
                    <span className="md:hidden">+</span>
                    <input
                        type="file"
                        webkitdirectory="true"
                        directory="true"
                        multiple
                        onChange={onFolderSelect}
                        className="hidden"
                    />
                </label>
            </div>
        </div>
    );
};

// 4. QueueAside Component (Right Column - Fixed Width)
const QueueAside = ({ currentPlaybackList, currentPlayingSong }) => {
    
    // Find the index of the currently playing song in the queue
    const currentSongIndex = useMemo(() => 
        currentPlaybackList.findIndex((song) => song.url === currentPlayingSong?.url),
        [currentPlaybackList, currentPlayingSong]
    );

    // Split the queue into "Now Playing" and "Up Next"
    const nowPlaying = currentSongIndex >= 0 ? currentPlaybackList[currentSongIndex] : null;
    const upNext = currentSongIndex >= 0 ? currentPlaybackList.slice(currentSongIndex + 1) : currentPlaybackList;

    const fallbackCover = MUSIC_NOTE_FALLBACK;

    return (
        <div className="w-72 bg-black p-4 space-y-6 flex-shrink-0 h-full overflow-y-auto custom-scrollbar border-l border-gray-900 hidden 2xl:block">
            
            <div className="flex justify-between items-center text-white">
                <h3 className="text-xl font-bold">Queue</h3>
                <h3 className="text-xl font-bold text-gray-500 hover:text-white cursor-pointer transition-colors">Activity</h3>
            </div>
            <div className="border-t border-gray-800 pt-4">

            {/* Now Playing Indicator */}
            {nowPlaying && (
                <div className="p-3 bg-gray-900 rounded-lg shadow-xl relative border-l-4 border-green-500 mb-6">
                    <p className="text-xs uppercase text-green-400 font-semibold mb-2">Now Playing</p>
                    <div className="flex items-center space-x-3">
                        <img
                            src={nowPlaying.cover || fallbackCover}
                            alt="Cover"
                            className="w-10 h-10 object-cover rounded-md flex-shrink-0"
                            onError={(e) => { 
                                console.error("QueueAside image load error. Falling back to default.", e);
                                e.target.onerror = null; 
                                e.target.src=fallbackCover; 
                            }}
                        />
                        <div className="truncate">
                            <p className="text-sm font-semibold text-white truncate">{nowPlaying.title}</p>
                            <p className="text-xs text-gray-400 truncate">{nowPlaying.artist}</p>
                        </div>
                        <Disc3 size={16} className="text-green-500 ml-auto flex-shrink-0 animate-spin-slow"/>
                    </div>
                </div>
            )}

            {/* Up Next List */}
            <div className="space-y-2">
                <p className="text-sm font-bold text-gray-400 uppercase mb-3">Up Next ({upNext.length} tracks)</p>
                {upNext.length > 0 ? (
                    upNext.slice(0, 20).map((song, index) => ( 
                        <div key={index} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-900/70 transition-colors cursor-pointer group">
                            <img
                                src={song.cover || fallbackCover}
                                alt="Cover"
                                className="w-8 h-8 object-cover rounded-md flex-shrink-0"
                                onError={(e) => { 
                                    console.error("QueueAside thumbnail load error. Falling back to default.", e);
                                    e.target.onerror = null; 
                                    e.target.src=fallbackCover; 
                                }}
                            />
                            <div className="truncate flex-grow">
                                <p className="text-sm text-gray-200 truncate group-hover:text-white">{song.title}</p>
                                <p className="text-xs text-gray-500 truncate">{song.artist}</p>
                            </div>
                            <span className="text-xs text-gray-500 ml-auto flex-shrink-0">3:30</span> 
                            <Heart size={14} className="text-gray-600 hover:text-green-500 flex-shrink-0"/>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500 text-center p-4">Queue is empty. Load a playlist to begin.</p>
                )}
            </div>
            </div>
        </div>
    );
}


// 5. Home Component (Main Content)
const Home = ({ playlists, onFolderSelect, selectPlaylist, currentPlaylistName }) => {
  const playlistNames = Object.keys(playlists);
  const navigate = useNavigate();

  const fallbackCover = PLAYLIST_FALLBACK_SM;
  
  const handlePlaylistClick = (name) => {
    navigate(`/play/${encodeURIComponent(name)}`);
    selectPlaylist(name);
  };

  return (
    <div className="flex-grow p-4 md:p-8 overflow-y-auto bg-gray-900 text-white min-h-full">
        <h1 className="text-3xl font-bold mb-8">Good evening</h1>

        {playlistNames.length === 0 ? (
            <div className="text-center p-12 border border-gray-800 rounded-xl bg-gray-800/50">
                <Library size={48} className="mx-auto text-gray-500 mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Your library is empty</h2>
                <p className="text-gray-400 mb-6">Start by loading a music folder from your device.</p>
                <label className="inline-block py-3 px-8 bg-green-600 text-white rounded-full cursor-pointer hover:bg-green-700 transition-colors font-bold shadow-2xl">
                    Load Music Folder
                    <input
                        type="file"
                        webkitdirectory="true"
                        directory="true"
                        multiple
                        onChange={onFolderSelect}
                        className="hidden"
                    />
                </label>
            </div>
        ) : (
            <section className="mt-8">
                <h2 className="text-2xl font-bold mb-6">Recently Played Playlists</h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {playlistNames.map((name) => {
                        const list = playlists[name];
                        // Use the cover from the first song in the playlist
                        const firstSong = list[0]; 
                        const cover = firstSong?.cover || fallbackCover;
                        const isActive = name === currentPlaylistName;

                        return (
                            <div
                                key={name}
                                className={`bg-gray-800 p-4 rounded-lg shadow-xl hover:bg-gray-700 transition-all duration-300 cursor-pointer group relative ${isActive ? 'ring-2 ring-green-500' : ''}`}
                                onClick={() => handlePlaylistClick(name)}
                            >
                                <img
                                    src={cover}
                                    alt={`${name} Cover`}
                                    className="w-full h-auto aspect-square object-cover rounded-md shadow-lg mb-4 group-hover:shadow-2xl transition-shadow"
                                    onError={(e) => { 
                                        console.error("Home playlist image load error. Falling back to default.", e);
                                        e.target.onerror = null; 
                                        e.target.src=fallbackCover; 
                                    }}
                                />
                                <h3 className="text-base font-semibold truncate text-white">{name}</h3>
                                <p className="text-sm text-gray-400 line-clamp-2">
                                    {list.length} tracks
                                </p>
                                {/* Play Button Overlay */}
                                <button className="absolute bottom-16 right-6 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all duration-300 ease-in-out shadow-lg hover:scale-105">
                                    <Play size={24} fill="currentColor" className="ml-0.5 text-black"/>
                                </button>
                                {isActive && (
                                    <Disc3 size={18} className="text-green-500 absolute top-6 right-6 animate-spin-slow"/>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>
        )}
    </div>
  );
};


// 6. PlayerPage Component (Main Content)
const PlayerPage = ({
  playlists,
  currentPlaylistName,
  currentSong,
  playSong,
  selectPlaylist,
  isShuffle,
  shuffledSongMap,
  onPlayPause,
  isPlaying,
  currentSongIndex,
}) => {
  const { pname } = useParams();
  const navigate = useNavigate();

  const playlistName = decodeURIComponent(pname);
  const songList = playlists[playlistName] || [];

  // --- Derived Data ---
  const mainSong = songList[0];
  const fallbackCover = PLAYLIST_FALLBACK_LG;
  const mainCover = mainSong?.cover || fallbackCover;
  const mainArtist = mainSong?.artist || "Various Artists";

  const totalDurationInfo = useMemo(() => {
    const totalTracks = songList.length;
    if (totalTracks === 0) return "0 tracks";
    const totalMinutes = totalTracks * 3.5; // Placeholder avg time
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    return `${totalTracks} songs, approx ${hours}h ${minutes}m`;
  }, [songList.length]);

  const handlePlayButtonClick = useCallback(() => {
    if (songList.length > 0 && playSong) {
      selectPlaylist(playlistName);

      const listToPlay = isShuffle && shuffledSongMap[playlistName]
                         ? shuffledSongMap[playlistName]
                         : songList;
      
      // If the current playlist is playing the current song, just toggle pause
      if (currentPlaylistName === playlistName && currentSong && isPlaying) {
          onPlayPause();
          return;
      }
      
      // If the playlist is already selected and we are paused, resume from the current index (or start at 0)
      const indexToPlay = currentPlaylistName === playlistName && currentSong ? currentSongIndex : 0;
      
      playSong(listToPlay, indexToPlay);
    }
  }, [songList, playSong, selectPlaylist, playlistName, currentPlaylistName, currentSong, onPlayPause, isShuffle, shuffledSongMap, isPlaying, currentSongIndex]);

  const handleSongClick = useCallback((songData, index) => {
    if (playSong) {
      selectPlaylist(playlistName);

      const listToPlay = isShuffle && shuffledSongMap[playlistName]
                         ? shuffledSongMap[playlistName]
                         : songList;

      let actualPlaybackIndex = index;

      if (isShuffle && shuffledSongMap[playlistName]) {
          // Find the index of the clicked song in the shuffled list
          actualPlaybackIndex = listToPlay.findIndex(s => s.url === songData.url);
          actualPlaybackIndex = actualPlaybackIndex >= 0 ? actualPlaybackIndex : index;
      }

      playSong(listToPlay, actualPlaybackIndex);
    }
  }, [songList, playSong, selectPlaylist, playlistName, isShuffle, shuffledSongMap]);


  if (!playlistName || songList.length === 0) {
    return (
      <div className="bg-gray-900 text-white min-h-full flex items-center justify-center p-8">
        <h2 className="text-3xl font-bold">Playlist Not Found</h2>
      </div>
    );
  }

  const isCurrentPlaylistPlaying = currentPlaylistName === playlistName && isPlaying;

  return (
    <div className="bg-gray-900 min-h-full text-white relative flex flex-col">

      {/* Dynamic Header/Background Gradient */}
      <div
        className="absolute top-0 left-0 right-0 h-80 opacity-90"
        style={{
          background: `linear-gradient(to bottom, #1db954 0%, #121212 100%)`, // Spotify Green Gradient
        }}
      ></div>
      
      {/* Scrollable Content Area */}
      <div className="relative z-10 flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full">

        {/* Album/Playlist Header Section */}
        <section className="flex flex-col md:flex-row items-center md:items-end md:space-x-6 mb-12 mt-4 md:mt-12">
          {/* Cover Art */}
          <img
            src={mainCover}
            alt={`${playlistName} Cover`}
            className="w-48 h-48 md:w-56 md:h-56 object-cover rounded-lg shadow-2xl mb-6 md:mb-0"
            onError={(e) => { 
                console.error("PlayerPage main image load error. Falling back to default.", e);
                e.target.onerror = null; 
                e.target.src=fallbackCover; 
            }}
          />

          {/* Info Block */}
          <div className="text-center md:text-left">
            <p className="text-sm uppercase font-semibold text-gray-200 mb-2">
              Playlist
            </p>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white mb-4 leading-none">
              {playlistName}
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start items-center text-gray-300 text-sm sm:text-base space-x-3 mt-4">
              <p className="font-bold text-white">{mainArtist}</p>
              <span>•</span>
              <p>{totalDurationInfo}</p>
            </div>
          </div>
        </section>

        {/* Controls Bar */}
        <div className="py-6 flex items-center space-x-6">
            {/* Main Play/Pause Button */}
            <button
                onClick={handlePlayButtonClick}
                className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/50 hover:bg-green-400 transition-transform hover:scale-105 text-black"
            >
                {isCurrentPlaylistPlaying ? (
                    <Pause size={28} fill="currentColor" />
                ) : (
                    <Play size={28} fill="currentColor" className="ml-0.5" />
                )}
            </button>

            {/* Like Button */}
            <Heart size={32} className="text-gray-400 hover:text-white cursor-pointer transition-colors" />

            {/* More Options */}
            <ListMusic size={32} className="text-gray-400 hover:text-white cursor-pointer transition-colors" title="More Options"/>
        </div>

        {/* Song List */}
        <div className="pt-4 pb-10 custom-scrollbar">

          {/* Table Header */}
          <div className="grid grid-cols-[30px_1fr_150px_80px] text-gray-400 text-xs uppercase font-semibold border-b border-gray-700 pb-2 mb-2 px-2">
            <div className="text-center">#</div>
            <div>Title</div>
            <div className="hidden md:block">Album</div>
            <div className="flex items-center justify-end"><Clock size={16}/></div>
          </div>

          {songList.map((song, idx) => {
            const isCurrent = currentPlaylistName === playlistName && song.url === currentSong?.url;

            return (
              <div
                key={idx}
                onClick={() => handleSongClick(song, idx)}
                className={`grid grid-cols-[30px_1fr_150px_80px] items-center py-2 px-2 rounded-lg cursor-pointer transition-colors duration-200
                            ${
                              isCurrent
                                ? "bg-gray-700/50 shadow-inner"
                                : "hover:bg-gray-800/70"
                            }`}
              >
                {/* 1. Index/Play Indicator */}
                <span
                  className={`text-sm font-mono text-center ${isCurrent ? "text-green-400" : "text-gray-400"}`}
                >
                  {isCurrent ? <Play size={14} fill="currentColor" className="mx-auto"/> : idx + 1}
                </span>

                {/* 2. Title & Artist */}
                <div className="truncate">
                  <p className={`text-base font-medium truncate ${isCurrent ? "text-white" : "text-gray-100"}`}>
                    {song.title}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {song.artist || 'Unknown Artist'}
                  </p>
                </div>

                {/* 3. Album/Placeholder (Hidden on small screens) */}
                <div className="text-sm text-gray-400 truncate hidden md:block">
                    {song.album || playlistName}
                </div>

                {/* 4. Duration (Placeholder) */}
                <div className="text-sm text-gray-400 text-right">
                    3:30
                </div>
              </div>
            );
          })}
        </div>
      </div>
       {/* CSS for custom scrollbar and spinning icon */}
       <style>{`
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #121212; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #4b5563; 
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #6b7280; 
        }

        @keyframes spin-slow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
            animation: spin-slow 2s linear infinite;
        }
       `}</style>
    </div>
  );
};


// 7. Main App Component
const App = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- STATE ---
  const [playlists, setPlaylists] = useState({});
  const [currentPlaylistName, setCurrentPlaylistName] = useState(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(0); // Index in the current playback list
  const [currentPlayingSong, setCurrentPlayingSong] = useState(null); 
  
  // Playback Mode States
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'all', 'one'
  const [shuffledSongMap, setShuffledSongMap] = useState({}); // { playlistName: [shuffled song list] }

  // Player State
  const audioRef = useRef(new Audio());
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // --- DERIVED STATE ---
  const playlistNames = Object.keys(playlists);
  const currentSongListOriginal = playlists[currentPlaylistName] || [];
  const currentPlaylistIndex = playlistNames.indexOf(currentPlaylistName); // Used for playlist transitions

  // --- PLAYBACK UTILITIES ---

  // Helper to get the list currently used for playback (original or shuffled)
  const getPlaybackList = useCallback(() => {
      if (isShuffle && currentPlaylistName && shuffledSongMap[currentPlaylistName]) {
          return shuffledSongMap[currentPlaylistName];
      }
      return currentSongListOriginal;
  }, [isShuffle, currentPlaylistName, shuffledSongMap, currentSongListOriginal]);
  
  const currentPlaybackList = getPlaybackList();
  
  // Fisher-Yates shuffle algorithm
  const createShuffledList = useCallback((list) => {
      const array = [...list];
      for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
  }, []);
  
  // 2. Play Song (Centralized logic to load and play audio)
  const playSong = useCallback((songList, index) => {
    const songToPlay = songList[index];
    
    setCurrentSongIndex(index);
    setCurrentPlayingSong(songToPlay);
    
    if (!songToPlay || !songToPlay.url) {
        console.error(`Cannot play: Missing URL for ${songToPlay?.title}.`);
        setIsPlaying(false);
        return;
    }
    
    if (audioRef.current.src !== songToPlay.url) {
        audioRef.current.src = songToPlay.url;
        audioRef.current.load();
    }
    
    // Use a small delay for reliable playback start after loading
    setTimeout(() => {
        audioRef.current.play().catch(e => console.error("Playback failed:", e));
        setIsPlaying(true);
    }, 100);
  }, []); 

  // --- HANDLERS ---

  // 1. Core Playback Toggle
  const onPlayPause = useCallback(() => {
    if (currentPlayingSong) {
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            const currentList = getPlaybackList();
            if (!audioRef.current.src || audioRef.current.paused) {
                // If audio hasn't been loaded yet or is paused, load and play the current song index
                playSong(currentList, currentSongIndex);
            } else {
                audioRef.current.play().catch(e => console.error("Playback error:", e));
                setIsPlaying(true);
            }
        }
    } else if (currentPlaybackList.length > 0) {
        // If nothing is loaded, start the first song
        playSong(currentPlaybackList, 0);
    }
  }, [currentPlayingSong, isPlaying, currentPlaybackList, currentSongIndex, playSong, getPlaybackList]);


  // New: Toggle Shuffle Mode
  const toggleShuffle = useCallback(() => {
    if (!currentPlaylistName || currentSongListOriginal.length === 0) return;

    if (isShuffle) {
        // Turning OFF shuffle: Revert to original list index
        setIsShuffle(false);
        
        // Find the current song's index in the original list
        const currentIndexInOriginal = currentSongListOriginal.findIndex(
            s => s.url === currentPlayingSong?.url
        );
        setCurrentSongIndex(currentIndexInOriginal >= 0 ? currentIndexInOriginal : 0);
        
        // Restart playback in the context of the original list if playing
        if(currentPlayingSong && isPlaying) {
            playSong(currentSongListOriginal, currentIndexInOriginal >= 0 ? currentIndexInOriginal : 0);
        }
        
    } else {
        // Turning ON shuffle: Create a new shuffled list for this playlist
        const shuffledList = createShuffledList(currentSongListOriginal);
        
        setShuffledSongMap(prev => ({
            ...prev,
            [currentPlaylistName]: shuffledList
        }));
        setIsShuffle(true);
        
        // Find the current song's index in the new shuffled list
        const currentIndexInShuffled = shuffledList.findIndex(
            s => s.url === currentPlayingSong?.url
        );
        setCurrentSongIndex(currentIndexInShuffled >= 0 ? currentIndexInShuffled : 0);
        
        // Restart playback in the context of the new shuffled list if playing
        if(currentPlayingSong && isPlaying) {
            playSong(shuffledList, currentIndexInShuffled >= 0 ? currentIndexInShuffled : 0);
        }
    }
  }, [isShuffle, currentPlaylistName, currentSongListOriginal, currentPlayingSong, createShuffledList, isPlaying, playSong]);
  
  // New: Toggle Repeat Mode
  const toggleRepeat = useCallback(() => {
    setRepeatMode(prevMode => {
      switch (prevMode) {
        case 'off':
          return 'all'; // off -> repeat all
        case 'all':
          return 'one'; // repeat all -> repeat one
        case 'one':
        default:
          return 'off'; // repeat one -> off
      }
    });
  }, []);
  
  const selectPlaylist = useCallback((playlistName) => {
    // Only change playlist name, actual playing song change happens in playSong
    setCurrentPlaylistName(playlistName);
    setCurrentSongIndex(0);
  }, []);


  // 3. Skip Next (Handles song end and playlist transitions)
  const onNext = useCallback(() => {
    const currentList = getPlaybackList();
    if (currentList.length === 0) return; 
    
    const currentMaxIndex = currentList.length - 1;

    if (repeatMode === 'one' && currentPlayingSong) {
      // Repeat One: play the same song again
      playSong(currentList, currentSongIndex);
      return;
    }

    if (currentSongIndex < currentMaxIndex) {
        // Case A: Not the last song in the current list -> Go to next song
        const nextIndex = currentSongIndex + 1;
        playSong(currentList, nextIndex);
        
    } else if (repeatMode === 'all') {
        // Case B: Last song, Repeat All is ON -> Loop back to the first song
        playSong(currentList, 0);

    } else {
        // Case C: Last song, Repeat is OFF -> Try to go to the next playlist
        
        const nextPlaylistIndex = (currentPlaylistIndex + 1);
        
        if (nextPlaylistIndex < playlistNames.length) {
            
            const nextPlaylistName = playlistNames[nextPlaylistIndex];
            const nextSongListOriginal = playlists[nextPlaylistName];

            // 1. Update the current playlist state
            setCurrentPlaylistName(nextPlaylistName);
            
            // 2. Determine song list (shuffled or original)
            let songListToPlay = nextSongListOriginal;
            let indexToPlay = 0;

            if (isShuffle) {
                let shuffledList = shuffledSongMap[nextPlaylistName];
                if (!shuffledList) {
                    // Create shuffled list if it doesn't exist for the new playlist
                    shuffledList = createShuffledList(nextSongListOriginal);
                    setShuffledSongMap(prev => ({
                        ...prev,
                        [nextPlaylistName]: shuffledList
                    }));
                }
                songListToPlay = shuffledList;
            }

            // Must use setTimeout or navigate to trigger state change and re-render.
            // Using playSong directly after setting name is fine as playSong uses the passed list.
            playSong(songListToPlay, indexToPlay);
            
            // Navigate to update the UI
            navigate(`/play/${encodeURIComponent(nextPlaylistName)}`);

        } else {
            // Case D: Reached the end of all music (and not repeating all)
            setIsPlaying(false);
            setCurrentPlayingSong(null);
            setCurrentTime(0);
            setDuration(0);
        }
    }
  }, [currentSongIndex, repeatMode, currentPlayingSong, getPlaybackList, currentPlaylistIndex, playlistNames, playlists, isShuffle, shuffledSongMap, createShuffledList, playSong, navigate]);


  // 4. Skip Previous (Refined to implement "restart song" behavior)
  const onPrev = useCallback(() => {
    const currentList = getPlaybackList();
    
    // Standard Music Player behavior: if currentTime > 3 seconds, restart the song
    if (audioRef.current.currentTime > 3) {
        playSong(currentList, currentSongIndex);
        return;
    }

    if (currentSongIndex > 0) {
        // Go to previous song in the current list
        const prevIndex = currentSongIndex - 1;
        playSong(currentList, prevIndex);
    } else if (repeatMode === 'all') {
        // If at the start and Repeat All is ON, loop to the end of the current list
        playSong(currentList, currentList.length - 1);
    } else if (currentSongIndex === 0 && currentPlaylistIndex > 0) {
        // If at the start, repeat is OFF, and not the first playlist: Go to the last song of the previous playlist
        const prevPlaylistIndex = currentPlaylistIndex - 1;
        const prevPlaylistName = playlistNames[prevPlaylistIndex];
        const prevSongListOriginal = playlists[prevPlaylistName];

        if (prevSongListOriginal && prevSongListOriginal.length > 0) {
            setCurrentPlaylistName(prevPlaylistName);
            
            // Determine which list to play from (original or shuffled)
            let songListToPlay = prevSongListOriginal;
            if (isShuffle && shuffledSongMap[prevPlaylistName]) {
                songListToPlay = shuffledSongMap[prevPlaylistName];
            }

            const prevSongIndex = songListToPlay.length - 1;
            playSong(songListToPlay, prevSongIndex);
            
            // Navigate to update the UI
            navigate(`/play/${encodeURIComponent(prevPlaylistName)}`);
        }
    } else {
        // If at the start and can't go back, restart the current song
        playSong(currentList, 0);
    }
  }, [currentSongIndex, repeatMode, currentPlaylistIndex, playlistNames, playlists, isShuffle, shuffledSongMap, getPlaybackList, playSong, navigate]);
  
  // 5. Seek Handler
  const onSeek = useCallback((time) => {
    if (audioRef.current) {
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    }
  }, []);

  // FOLDER SELECTION HANDLER (UPDATED with user's core logic and robust fallback)
  const handleFolderSelect = async (e) => {
    // This function handles loading audio files from a user-selected folder
    const files = Array.from(e.target.files).filter((file) =>
      file.type.includes("audio")
    );

    const tempPlaylists = {};
    const objectUrls = []; // Track URLs to revoke later

    await Promise.all(
      files.map(async (file) => {
        const pathParts = (file.webkitRelativePath || file.name).split("/");
        
        // The playlist name is the folder name (second to last part in path) or the file name if no folder
        const playlistName = pathParts.length > 1 && pathParts[pathParts.length - 2] !== ""
                                ? pathParts[pathParts.length - 2]
                                : file.name.replace(/\.[^/.]+$/, "");

        // Initialize metadata placeholders
        let coverUrl = null;
        let title = file.name.replace(/\.[^/.]+$/, "");
        let artist = "Unknown Artist";

        try {
            // Attempt to read actual metadata using the imported library function
            const blob = file.slice();
            const metadata = await parseBlob(blob);

            if (metadata.common) {
                title = metadata.common.title || title;
                artist = metadata.common.artist || "Unknown Artist";
                
                // Attempt to extract embedded cover image
                const pictures = metadata.common.picture;
                if (pictures && pictures.length > 0) {
                    const pic = pictures[0];
                    // Create a Blob URL for the cover image data
                    coverUrl = URL.createObjectURL(
                        new Blob([pic.data], { type: pic.format })
                    );
                }
            }
        } catch (err) {
            console.warn("Failed to read metadata for", file.name, err);
            // If metadata fails completely, title/artist fall back to filename, coverUrl remains null
        }
        
        // --- FALLBACK LOGIC ---
        if (!coverUrl) {
             // If no cover was extracted or parsing failed, generate a reliable SVG cover
             const hash = Array.from(title).reduce((h, char) => h + char.charCodeAt(0), 0);
             const colorInt = (hash * 1234567) % 0xffffff;
             const color = colorInt.toString(16).padStart(6, '0');
             coverUrl = generateSvgCover(title, color);
        }
        
        const url = URL.createObjectURL(file);
        objectUrls.push(url);

        const songData = {
          title,
          artist,
          album: playlistName, // Set album to playlist name if metadata didn't provide one
          cover: coverUrl,
          url: url,
        };

        if (!tempPlaylists[playlistName]) {
          tempPlaylists[playlistName] = [];
        }
        tempPlaylists[playlistName].push(songData);
      })
    );
    
    // Revoke old object URLs before setting new state
    Object.values(playlists).flat().forEach(song => {
        if (song.url) URL.revokeObjectURL(song.url);
    });

    setPlaylists(prev => ({...prev, ...tempPlaylists}));
    
    // Navigate to the first loaded playlist or Home
    if (Object.keys(tempPlaylists).length > 0) {
        const firstPlaylistName = Object.keys(tempPlaylists)[0];
        setCurrentPlaylistName(firstPlaylistName);
        setCurrentSongIndex(0); // Reset index
        navigate(`/play/${encodeURIComponent(firstPlaylistName)}`);
    } else {
        navigate('/');
    }
  };


  // 6. Audio Event Listeners (Connects browser audio events to React state)
  useEffect(() => {
    const audio = audioRef.current;
    
    const setAudioData = () => {
        setDuration(audio.duration);
        setCurrentTime(audio.currentTime);
    };
    
    const updateTime = () => setCurrentTime(audio.currentTime);
    const togglePlay = () => setIsPlaying(true);
    const togglePause = () => setIsPlaying(false);
    
    // Song ends -> calls onNext(), which contains the playback mode logic
    const handleSongEnd = () => onNext(); 

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('play', togglePlay);
    audio.addEventListener('pause', togglePause);
    audio.addEventListener('ended', handleSongEnd);
    
    // Cleanup function
    return () => {
        audio.removeEventListener('loadeddata', setAudioData);
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('play', togglePlay);
        audio.removeEventListener('pause', togglePause);
        audio.removeEventListener('ended', handleSongEnd);
    };
  }, [onNext]);
  
  // --- CLEANUP ---
  useEffect(() => {
    // Revoke object URLs when the component unmounts
    return () => {
        audioRef.current.pause();
        Object.values(playlists).flat().forEach(song => {
            if (song.url) URL.revokeObjectURL(song.url);
        });
    };
  }, [playlists]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white font-inter">
      {/* Main Layout Area (Sidebar + Content + Queue) */}
      <div className="flex flex-grow overflow-hidden mb-20"> {/* mb-20 creates space for the player */}
        
        {/* Sidebar */}
        <Sidebar
          onFolderSelect={handleFolderSelect}
          playlistNames={playlistNames}
          selectPlaylist={selectPlaylist}
        />

        {/* Main Content Area */}
        <div className="flex flex-col flex-grow min-w-0">
            <Navbar navigateBack={() => navigate(-1)} navigateForward={() => navigate(1)} />
            <main className="flex-grow overflow-y-auto custom-scrollbar bg-gray-900/90">
                <Routes>
                    <Route path="/" element={
                        <Home 
                            playlists={playlists} 
                            onFolderSelect={handleFolderSelect}
                            selectPlaylist={selectPlaylist}
                            currentPlaylistName={currentPlaylistName}
                            playSong={playSong} 
                            isShuffle={isShuffle}
                        />} 
                    />
                    <Route path="/search" element={
                        <div className="p-8"><h1 className="text-3xl font-bold">Search (Not Implemented)</h1></div>} 
                    />
                    <Route path="/play/:pname" element={
                        <PlayerPage 
                            playlists={playlists}
                            currentPlaylistName={currentPlaylistName}
                            currentSong={currentPlayingSong}
                            playSong={playSong}
                            selectPlaylist={selectPlaylist}
                            isShuffle={isShuffle}
                            shuffledSongMap={shuffledSongMap}
                            onPlayPause={onPlayPause}
                            isPlaying={isPlaying}
                            currentSongIndex={currentSongIndex}
                        />} 
                    />
                    <Route path="*" element={
                        <div className="p-8"><h1 className="text-3xl font-bold">404 Not Found</h1></div>} 
                    />
                </Routes>
            </main>
        </div>
        
        {/* Queue Aside */}
        <QueueAside 
            currentPlaybackList={currentPlaybackList}
            currentPlayingSong={currentPlayingSong}
        />
      </div>

      {/* Player Controls (Fixed Footer) */}
      <PlayerControls
        currentSong={currentPlayingSong}
        isPlaying={isPlaying}
        duration={duration}
        currentTime={currentTime}
        onPlayPause={onPlayPause}
        onPrev={onPrev}
        onNext={onNext}
        onSeek={onSeek}
        audioRef={audioRef}
        isShuffle={isShuffle}
        toggleShuffle={toggleShuffle}
        repeatMode={repeatMode}
        toggleRepeat={toggleRepeat}
      />
    </div>
  );
};

export default App;