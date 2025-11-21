import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Buffer } from "buffer";
import {
  Routes,
  Route,
  useParams,
  useNavigate,
  Link,
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

// Polyfill for Buffer needed by music-metadata-browser (mocked for this environment)
window.Buffer = Buffer;

// --- MOCK METADATA PARSER ---
const mockParseBlob = async (blob) => {
    return {
        common: {
            title: blob.name.replace(/\.[^/.]+$/, "") || "Untitled Track",
            artist: "Unknown Artist",
            album: "Local Files",
            picture: null,
        },
    };
};

// --- HELPER COMPONENTS ---

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
  
  const currentCover = currentSong?.cover || "https://placehold.co/50x50/333333/ffffff?text=♫";

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
              onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/50x50/1db954/ffffff?text=♫"; }}
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
                            src={nowPlaying.cover || "https://placehold.co/40x40/333/FFF?text=♫"}
                            alt="Cover"
                            className="w-10 h-10 object-cover rounded-md flex-shrink-0"
                            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/40x40/1db954/ffffff?text=♫"; }}
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
                                src={song.cover || "https://placehold.co/30x30/444/AAA?text=♫"}
                                alt="Cover"
                                className="w-8 h-8 object-cover rounded-md flex-shrink-0"
                                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/30x30/1db954/ffffff?text=♫"; }}
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
                        const firstSong = list[0];
                        const cover = firstSong?.cover || "https://placehold.co/150x150/222/FFF?text=PLAYLIST";
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
                                    onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/150x150/1db954/ffffff?text=PLAYLIST"; }}
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
}) => {
  const { pname } = useParams();
  const navigate = useNavigate();

  const playlistName = decodeURIComponent(pname);
  const songList = playlists[playlistName] || [];

  // --- Derived Data ---
  const mainSong = songList[0];
  const mainCover = mainSong?.cover || "https://placehold.co/256x256/222/FFF?text=PLAYLIST";
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

      if (currentPlaylistName === playlistName && currentSong) {
          onPlayPause();
          return;
      }
      
      const listToPlay = isShuffle && shuffledSongMap[playlistName]
                         ? shuffledSongMap[playlistName]
                         : songList;

      playSong(listToPlay, 0);
    }
  }, [songList, playSong, selectPlaylist, playlistName, currentPlaylistName, currentSong, onPlayPause, isShuffle, shuffledSongMap]);

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
            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/256x256/1db954/ffffff?text=PLAYLIST"; }}
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
  // --- STATE ---
  const [playlists, setPlaylists] = useState({});
  const [currentPlaylistName, setCurrentPlaylistName] = useState(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(0); 
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

  const getPlaybackList = useCallback(() => {
      if (isShuffle && currentPlaylistName && shuffledSongMap[currentPlaylistName]) {
          return shuffledSongMap[currentPlaylistName];
      }
      return currentSongListOriginal;
  }, [isShuffle, currentPlaylistName, shuffledSongMap, currentSongListOriginal]);
  
  const currentPlaybackList = getPlaybackList();
  
  const currentSongIndexInPlaybackList = useMemo(() => {
    if (!currentPlayingSong) return -1;
    return currentPlaybackList.findIndex(song => song.url === currentPlayingSong.url);
  }, [currentPlayingSong, currentPlaybackList]);
  
  const currentPlaylistIndex = useMemo(() => playlistNames.indexOf(currentPlaylistName), [playlistNames, currentPlaylistName]);

  // Fisher-Yates shuffle algorithm
  const createShuffledList = useCallback((list) => {
      const array = [...list];
      for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
  }, []);

  // --- HANDLERS ---

  const handleFolderSelect = async (e) => {
    const files = Array.from(e.target.files).filter((file) =>
      file.type.includes("audio")
    );

    const tempPlaylists = {};

    await Promise.all(
      files.map(async (file) => {
        const pathParts = (file.webkitRelativePath || file.name).split("/");
        const playlistName =
          pathParts.length > 1 && pathParts[1] !== "" && !pathParts[1].endsWith(".mp3")
            ? pathParts[1]
            : "Local Music";

        let coverUrl = null;
        let title = file.name.replace(/\.[^/.]+$/, "");
        let artist = "Unknown Artist";
        let album = playlistName;

        try {
          const blob = file.slice();
          const metadata = await mockParseBlob(blob); 
          
          if (metadata.common) {
            title = metadata.common.title || title;
            album = metadata.common.album || playlistName; 
            artist = metadata.common.artist || "Unknown Artist";
            coverUrl = "https://placehold.co/50x50/1db954/ffffff?text=♫"; // Placeholder
          }
        } catch (err) {
          console.warn("Failed to read metadata for", file.name, err);
        }

        const songData = {
          title,
          artist,
          album: album, 
          url: URL.createObjectURL(file), 
          cover: coverUrl, 
        };

        if (!tempPlaylists[playlistName]) tempPlaylists[playlistName] = [];
        tempPlaylists[playlistName].push(songData);
      })
    );

    setPlaylists(tempPlaylists);
    const firstPlaylist = Object.keys(tempPlaylists)[0];
    setCurrentPlaylistName(firstPlaylist);
    if(tempPlaylists[firstPlaylist]?.length > 0) {
        const list = tempPlaylists[firstPlaylist];
        playSong(list, 0);
    } 
  };

  const selectPlaylist = (playlistName) => {
    setCurrentPlaylistName(playlistName);
  };
  
  const playSong = useCallback((songList, index) => {
    const songToPlay = songList[index];
    
    setCurrentSongIndex(index); 
    setCurrentPlayingSong(songToPlay);
    
    if (!songToPlay || !songToPlay.url) {
        console.error(`Cannot play: Missing URL for ${songToPlay?.title}.`);
        setIsPlaying(false);
        return;
    }
    
    audioRef.current.src = songToPlay.url;
    audioRef.current.load();
    
    setTimeout(() => {
        audioRef.current.play().catch(e => console.error("Playback failed:", e));
        setIsPlaying(true);
    }, 100);
  }, []); 

  const onPlayPause = useCallback(() => {
    const currentList = getPlaybackList();
    
    if (currentPlayingSong) {
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            if (!audioRef.current.src && currentList.length > 0) {
                playSong(currentList, 0); 
            } else {
                audioRef.current.play().catch(e => console.error("Playback error:", e));
                setIsPlaying(true);
            }
        }
    } else if (currentPlaybackList.length > 0) {
        playSong(currentPlaybackList, 0);
    }
  }, [currentPlayingSong, isPlaying, currentPlaybackList, playSong, getPlaybackList]);


  const toggleShuffle = useCallback(() => {
    if (!currentPlaylistName || currentSongListOriginal.length === 0) return;

    if (isShuffle) {
        setIsShuffle(false);
        const currentIndexInOriginal = currentSongListOriginal.findIndex(
            s => s.url === currentPlayingSong?.url
        );
        setCurrentSongIndex(currentIndexInOriginal >= 0 ? currentIndexInOriginal : 0);
        
    } else {
        const shuffledList = createShuffledList(currentSongListOriginal);
        
        setShuffledSongMap(prev => ({
            ...prev,
            [currentPlaylistName]: shuffledList
        }));
        setIsShuffle(true);
        
        const currentIndexInShuffled = shuffledList.findIndex(
            s => s.url === currentPlayingSong?.url
        );
        setCurrentSongIndex(currentIndexInShuffled >= 0 ? currentIndexInShuffled : 0);
    }
  }, [isShuffle, currentPlaylistName, currentSongListOriginal, currentPlayingSong, createShuffledList]);
  
  const toggleRepeat = useCallback(() => {
    setRepeatMode(prevMode => {
      switch (prevMode) {
        case 'off': return 'all';
        case 'all': return 'one';
        case 'one': default: return 'off';
      }
    });
    // Set audio loop property for 'one' repeat mode
    audioRef.current.loop = (repeatMode === 'all'); // It will be 'one' next, so set loop to true. When it switches to 'off', it will be false.
  }, [repeatMode]);


  const onNext = useCallback(() => {
    const currentList = getPlaybackList();
    if (currentList.length === 0 || !currentPlayingSong) {
        setIsPlaying(false);
        return; 
    }
    
    const actualIndex = currentSongIndexInPlaybackList;
    const currentMaxIndex = currentList.length - 1;

    if (repeatMode === 'one') {
      playSong(currentList, actualIndex);
      return;
    }

    if (actualIndex < currentMaxIndex) {
        const nextIndex = actualIndex + 1;
        playSong(currentList, nextIndex);
        
    } else if (repeatMode === 'all') {
        playSong(currentList, 0);

    } else {
        const nextPlaylistIndex = (currentPlaylistIndex + 1) % playlistNames.length;
        
        if (playlistNames.length <= 1) {
            setIsPlaying(false);
            return;
        }
        
        const nextPlaylistName = playlistNames[nextPlaylistIndex];
        const nextSongListOriginal = playlists[nextPlaylistName];

        if (nextSongListOriginal && nextSongListOriginal.length > 0) {
            setCurrentPlaylistName(nextPlaylistName);
            
            let songListToPlay = nextSongListOriginal;
            if (isShuffle) {
                let shuffledList = shuffledSongMap[nextPlaylistName];
                if (!shuffledList) {
                    shuffledList = createShuffledList(nextSongListOriginal);
                    setShuffledSongMap(prev => ({ ...prev, [nextPlaylistName]: shuffledList }));
                }
                songListToPlay = shuffledList;
            }
            playSong(songListToPlay, 0);
        } else {
            setIsPlaying(false);
        }
    }
  }, [repeatMode, currentPlayingSong, currentSongIndexInPlaybackList, getPlaybackList, currentPlaylistIndex, playlistNames, playlists, isShuffle, shuffledSongMap, createShuffledList, playSong]);


  const onPrev = useCallback(() => {
    const currentList = getPlaybackList();
    if (currentList.length === 0 || !currentPlayingSong) return;

    const actualIndex = currentSongIndexInPlaybackList;

    if (audioRef.current.currentTime > 3) {
        playSong(currentList, actualIndex);
        return;
    }

    if (actualIndex > 0) {
        const prevIndex = actualIndex - 1;
        playSong(currentList, prevIndex);
    } else if (repeatMode === 'all') {
        playSong(currentList, currentList.length - 1);
    } else if (actualIndex === 0 && currentPlaylistIndex > 0) {
        const prevPlaylistIndex = currentPlaylistIndex - 1;
        const prevPlaylistName = playlistNames[prevPlaylistIndex];
        const prevSongListOriginal = playlists[prevPlaylistName];

        if (prevSongListOriginal && prevSongListOriginal.length > 0) {
            setCurrentPlaylistName(prevPlaylistName);
            
            let songListToPlay = prevSongListOriginal;
            if (isShuffle && shuffledSongMap[prevPlaylistName]) {
                songListToPlay = shuffledSongMap[prevPlaylistName];
            }

            const prevSongIndex = songListToPlay.length - 1;
            playSong(songListToPlay, prevSongIndex);
        }
    } else {
        playSong(currentList, 0);
    }
  }, [repeatMode, currentPlayingSong, currentSongIndexInPlaybackList, currentPlaylistIndex, playlistNames, playlists, isShuffle, shuffledSongMap, getPlaybackList, playSong]);
  
  const onSeek = useCallback((time) => {
    if (audioRef.current) {
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    }
  }, []);

  // Audio Event Listeners
  useEffect(() => {
    const audio = audioRef.current;
    
    const setAudioData = () => {
        setDuration(audio.duration);
        setCurrentTime(audio.currentTime);
    };
    
    const updateTime = () => setCurrentTime(audio.currentTime);
    const togglePlay = () => setIsPlaying(true);
    const togglePause = () => setIsPlaying(false);
    
    const handleSongEnd = () => onNext(); 

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('play', togglePlay);
    audio.addEventListener('pause', togglePause);
    audio.addEventListener('ended', handleSongEnd);
    
    return () => {
        audio.removeEventListener('loadeddata', setAudioData);
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('play', togglePlay);
        audio.removeEventListener('pause', togglePause);
        audio.removeEventListener('ended', handleSongEnd);
    };
  }, [onNext]);
  
  // Auto-play the first song of the selected playlist if nothing is playing
  useEffect(() => {
      if (currentPlaylistName && !currentPlayingSong) {
          const list = playlists[currentPlaylistName];
          if (list && list.length > 0) {
              const listToPlay = isShuffle ? shuffledSongMap[currentPlaylistName] || list : list;
              playSong(listToPlay, 0);
          }
      }
  }, [currentPlaylistName, currentPlayingSong, playlists, isShuffle, shuffledSongMap, playSong]);


  return (
    <main className="h-screen bg-black overflow-hidden text-white font-sans">
        
        {/* Main Application Layout (Sidebar, Content, Aside) */}
        <div className="h-[calc(100vh-5rem)] flex">
            
            {/* Left Sidebar */}
            <Sidebar 
                onFolderSelect={handleFolderSelect} 
                playlistNames={playlistNames} 
                selectPlaylist={selectPlaylist} 
            />

            {/* Center Area (Navbar + Main Content) */}
            <div className="flex-grow min-w-0 flex flex-col bg-gray-900 rounded-lg m-2 overflow-hidden shadow-xl">
                <Routes>
                    <Route path="*" element={<Navbar navigateBack={() => window.history.back()} navigateForward={() => window.history.forward()}/>} />
                </Routes>
                
                <div className="flex-grow overflow-y-auto custom-scrollbar">
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <Home
                                    playlists={playlists}
                                    currentPlaylistName={currentPlaylistName}
                                    onFolderSelect={handleFolderSelect}
                                    selectPlaylist={selectPlaylist}
                                />
                            }
                        />
                        <Route
                            path="/play/:pname"
                            element={
                                <PlayerPage
                                    playlists={playlists}
                                    currentPlaylistName={currentPlaylistName}
                                    selectPlaylist={selectPlaylist} 
                                    playSong={playSong}
                                    currentSong={currentPlayingSong}
                                    isShuffle={isShuffle} 
                                    shuffledSongMap={shuffledSongMap}
                                    onPlayPause={onPlayPause}
                                    isPlaying={isPlaying}
                                />
                            }
                        />
                    </Routes>
                </div>
            </div>

            {/* Right Aside/Queue (Hidden by default until 2XL screens) */}
            <QueueAside
                currentPlaybackList={currentPlaybackList}
                currentPlayingSong={currentPlayingSong}
            />
            
        </div>

        {/* FIXED PLAYER CONTROLS */}
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
    </main>
  );
};

export default App;