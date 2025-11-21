import React, { useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Bell,
  User,
  Menu,
  Play,
  Shuffle,
  Clock, // Used for duration header
} from "lucide-react";

const PlayerPage = ({
  playlists,
  currentSong,
  currentSongIndex,
  setCurrentSongIndex,
  playSong,
  selectPlaylist,
}) => {
  const { pname } = useParams();
  const navigate = useNavigate();

  const playlistName = decodeURIComponent(pname);
  const songList = playlists[playlistName] || [];

  // --- Derived Data ---
  const mainSong = songList[0];
  const mainCover = mainSong?.cover || "https://placehold.co/256x256/222/FFF?text=PLAYLIST";
  const mainArtist = mainSong?.artist || "Various Artists";
  const albumYear = "2023";

  // Placeholder calculation for display
  const totalDurationInfo = useMemo(() => {
    const totalTracks = songList.length;
    if (totalTracks === 0) return "0 tracks";
    // Assuming an average duration of 3.5 minutes per song for display
    const totalMinutes = totalTracks * 3.5;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    return `${totalTracks} tracks, ${hours}h ${minutes}m`;
  }, [songList.length]);


  // Find the index of the currently playing song within THIS specific playlist's list
  const currentSongInThisPlaylistIndex = useMemo(() => {
    return songList.findIndex((song) => song === currentSong);
  }, [songList, currentSong]);


  // --- Handlers ---
  const handlePlayButtonClick = useCallback(() => {
    if (songList.length > 0 && playSong) {
      // Start playing the first song or the current one if already active
      const indexToPlay = currentSongInThisPlaylistIndex >= 0 ? currentSongInThisPlaylistIndex : 0;
      playSong(songList, indexToPlay);
      selectPlaylist(playlistName);
    }
  }, [songList, playSong, selectPlaylist, playlistName, currentSongInThisPlaylistIndex]);

  const handleSongClick = useCallback((songData, index) => {
    if (playSong) {
      setCurrentSongIndex(index);
      playSong(songList, index);
      selectPlaylist(playlistName);
    }
  }, [songList, playSong, selectPlaylist, playlistName, setCurrentSongIndex]);

  // --- Error State ---
  if (!playlistName || songList.length === 0) {
    return (
      <div className="bg-gray-950 text-white min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Playlist Not Found</h2>
          <button
            onClick={() => navigate("/")}
            className="mt-6 px-6 py-3 bg-red-600 rounded-full hover:bg-red-700 transition-colors text-lg font-semibold"
          >
            Go Back to Library
          </button>
        </div>
      </div>
    );
  }

  // --- Render ---
  return (
    <div className="bg-gray-950 min-h-screen text-white relative overflow-hidden">
      
      {/* Dynamic Header/Background Gradient */}
      <div
        className="absolute top-0 left-0 right-0 h-96 opacity-90"
        style={{
          // Use a subtle gradient reflecting the mood of music players
          background: `linear-gradient(to bottom, #9a3412 0%, #171717 100%)`, 
        }}
      ></div>

      {/* Main Content Area */}
      <div className="relative z-10 p-4 md:p-8 pt-6 max-w-7xl mx-auto min-h-screen flex flex-col">
        
        {/* Top Bar (Navigation & Icons) */}
        <header className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-black/50 rounded-full text-white hover:bg-black/80 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center space-x-4">
            <span className="p-2 text-gray-300 hover:text-white transition-colors cursor-pointer hidden sm:block">
              <Bell size={20} />
            </span>
            <span className="p-2 text-gray-300 hover:text-white transition-colors cursor-pointer hidden sm:block">
              <User size={20} />
            </span>
            <span className="p-2 text-gray-300 hover:text-white transition-colors cursor-pointer">
              <Menu size={20} />
            </span>
          </div>
        </header>

        {/* Album/Playlist Header Section (Responsive Flex Layout) */}
        <section className="flex flex-col md:flex-row items-center md:items-end md:space-x-6 mb-12 mt-4 md:mt-12">
          {/* Cover Art */}
          <img
            src={mainCover}
            alt={`${playlistName} Cover`}
            className="w-48 h-48 md:w-64 md:h-64 object-cover rounded-lg shadow-2xl mb-6 md:mb-0"
            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/256x256/222/FFF?text=PLAYLIST"; }}
          />

          {/* Info Block */}
          <div className="text-center md:text-left">
            <p className="text-sm uppercase font-semibold text-gray-300 mb-2">
              Playlist
            </p>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white mb-4 leading-none">
              {playlistName}
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start items-center text-gray-300 text-sm sm:text-base space-x-3 mt-4">
              <p className="font-bold text-white">{mainArtist}</p>
              <span>•</span>
              <p>{albumYear}</p>
              <span>•</span>
              <p>{totalDurationInfo}</p>
            </div>
          </div>
        </section>

        {/* Controls Bar (Sticky for easy access) */}
        <div className="sticky top-0 bg-gray-950/90 backdrop-blur-sm py-4 flex items-center space-x-6 z-20 border-b border-t border-gray-800">
            {/* Main Play Button */}
            <button
                onClick={handlePlayButtonClick}
                className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-red-500/50 shadow-xl hover:bg-red-700 transition-transform hover:scale-105 text-white"
            >
                <Play size={28} fill="white" className="ml-1" />
            </button>
            
            {/* Shuffle Button (Placeholder for state toggle) */}
            <button className="text-gray-400 hover:text-white transition-colors cursor-pointer p-2 rounded-full hover:bg-gray-800">
                <Shuffle size={24} />
            </button>
        </div>

        {/* Song List (Responsive, single-column track layout) */}
        <div className="overflow-y-auto pt-4 pb-10 flex-grow custom-scrollbar">
          
          {/* Table Header (Hidden on small screens, Grid for structure) */}
          <div className="hidden sm:grid grid-cols-[30px_1fr_150px_80px] text-gray-400 text-xs uppercase font-semibold border-b border-gray-800 pb-2 mb-2 px-2">
            <div>#</div>
            <div>Title</div>
            <div className="hidden md:block">Album</div>
            <div className="flex items-center justify-end"><Clock size={16}/></div>
          </div>

          {songList.map((song, idx) => {
            const isCurrent = idx === currentSongInThisPlaylistIndex;
            
            return (
              <div
                key={idx}
                onClick={() => handleSongClick(song, idx)}
                // Use a responsive grid for the track row
                className={`grid grid-cols-[30px_1fr_150px_80px] items-center py-3 px-2 rounded-lg cursor-pointer transition-colors duration-200 
                            ${
                              isCurrent
                                ? "bg-red-700/60 shadow-lg"
                                : "hover:bg-gray-800/70"
                            }`}
              >
                {/* 1. Index/Play Indicator */}
                <span
                  className={`text-sm font-mono ${isCurrent ? "text-white" : "text-gray-400"}`}
                >
                  {isCurrent ? <Play size={14} fill="currentColor" className="text-red-400"/> : idx + 1}
                </span>

                {/* 2. Title & Artist (Main content block) */}
                <div className="truncate">
                  <p className={`text-base font-medium truncate ${isCurrent ? "text-white" : "text-gray-100"}`}>
                    {song.title}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {song.artist && song.artist !== mainArtist ? `feat. ${song.artist}` : mainArtist}
                  </p>
                </div>
                
                {/* 3. Album/Placeholder (Hidden on small screens) */}
                <div className="text-sm text-gray-400 truncate hidden md:block">
                    {playlistName}
                </div>
                
                {/* 4. Duration (Placeholder) */}
                <div className="text-sm text-gray-400 text-right">
                    3:30
                </div>
              </div>
            );
          })}
        </div>

        {/* Space for a fixed Mini-Player / Music Controller footer */}
        <div className="h-24"></div>
      </div>
    </div>
  );
};

export default PlayerPage;