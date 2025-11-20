// PlayerPage.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft, // For the back arrow
  Bell, // For the notification icon
  User, // For the profile icon
  Menu, // For the three-bar menu icon
  Play, // For the large central play button
  Shuffle, // For the shuffle icon
} from "lucide-react"; // Import necessary icons

// Helper function for time display (not used in this UI, but good practice)
// const formatTime = (seconds) => { ... };

const PlayerPage = ({
  playlists,
  currentSong,
  currentSongIndex,
  playSong,
  selectPlaylist,
}) => {
  const { pname } = useParams();
  const navigate = useNavigate();

  const playlistName = decodeURIComponent(pname);
  const songList = playlists[playlistName] || [];

  const mainCover = songList[0]?.cover;
  const mainArtist = songList[0]?.artist;
  const albumYear = "2023";
  const totalDuration = "2h 3m";

  // Check for invalid or empty playlist
  if (!playlistName || songList.length === 0) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center p-8">
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

  // Find the index of the currently playing song within THIS specific playlist's list
  const currentSongInThisPlaylistIndex = songList.findIndex(
    (song) => song === currentSong
  );

  const handlePlayButtonClick = () => {
    if (songList.length > 0 && playSong) {
      // Start playing the first song or the current one if already active
      const indexToPlay =
        currentSongInThisPlaylistIndex >= 0
          ? currentSongInThisPlaylistIndex
          : 0;
      playSong(songList, indexToPlay);
      selectPlaylist(playlistName);
    }
  };

  const handleSongClick = (songData, index) => {
    if (playSong) {
      playSong(songList, index);
      selectPlaylist(playlistName);
    }
  };

  return (
    <div className="bg-black min-h-screen text-white relative overflow-hidden">
      {/* Background Image/Overlay (dynamic based on cover if available) */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 blur-lg"
        style={{
          backgroundImage: `url(${
            mainCover ||
            "https://via.placeholder.com/1920x1080/0d1d2b/0e0e0e?text=Music+Background"
          })`,
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-70"></div>

      {/* Main Content Area */}
      <div className="relative z-10 p-8 pt-6 max-w-7xl mx-auto h-screen flex flex-col">
        {/* Top Bar (Navigation & Icons) */}
        <header className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft size={32} /> {/* Replaced < with ChevronLeft */}
          </button>
          <div className="flex items-center space-x-6">
            <span className="text-gray-300 hover:text-white transition-colors cursor-pointer">
              <Bell size={24} /> {/* Replaced 🔔 with Bell */}
            </span>
            <span className="text-gray-300 hover:text-white transition-colors cursor-pointer">
              <User size={24} /> {/* Replaced 👤 with User */}
            </span>
            <span className="text-gray-300 hover:text-white transition-colors cursor-pointer">
              <Menu size={24} /> {/* Replaced ☰ with Menu */}
            </span>
          </div>
        </header>

        {/* Album/Playlist Header Section */}
        <section className="mb-10 flex flex-col md:flex-row items-start md:items-end md:space-x-8">
          <div className="text-center md:text-left mt-8 md:mt-0">
            <p className="text-gray-400 text-sm uppercase font-semibold mb-1">
              Album
            </p>
            <h1 className="text-6xl md:text-7xl font-extrabold text-white mb-4 leading-tight">
              {playlistName}
            </h1>
            <div className="flex items-center text-gray-300 text-lg space-x-4">
              <span>{mainArtist || "Various Artists"}</span>
              <span>•</span>
              <span>{albumYear}</span>
              <span>•</span>
              <span>{totalDuration}</span>
            </div>
          </div>
        </section>

        {/* Large Central Play Button & Shuffle */}
        <div className="flex items-center justify-between my-8 pl-4 pr-12">
          {/* Large Play Button */}
          <button
            onClick={handlePlayButtonClick}
            className="w-16 h-16 bg-red-600 rounded-full flex items-center cursor-pointer justify-center shadow-lg hover:bg-red-700 transition-colors text-white"
          >
            <Play size={32} fill="white" /> {/* Replaced ▶ with Play */}
          </button>
          {/* Shuffle Button */}
          <button className="text-gray-400 hover:text-white transition-colors cursor-pointer">
            <Shuffle size={32} /> {/* Replaced 🔀 with Shuffle */}
          </button>
        </div>

        {/* Song List (Two-Column Layout) */}
        <div className="overflow-y-auto custom-scrollbar pr-4">
          <div className="grid grid-cols-2 gap-x-12 gap-y-2">
            {songList.map((song, idx) => (
              <div
                key={idx}
                onClick={() => handleSongClick(song, idx)}
                className={`flex items-center py-2 px-2 rounded-md cursor-pointer transition-colors duration-200 
                            ${
                              idx === currentSongInThisPlaylistIndex
                                ? "bg-red-700/60"
                                : "hover:bg-[#1a1a1a]"
                            }`}
              >
                <span
                  className={`w-6 text-sm ${
                    idx === currentSongInThisPlaylistIndex
                      ? "text-white"
                      : "text-gray-400"
                  }`}
                >
                  {idx + 1}
                </span>
                <span
                  className={`flex-1 text-base ${
                    idx === currentSongInThisPlaylistIndex
                      ? "text-white"
                      : "text-gray-200"
                  } truncate`}
                >
                  {song.title}
                  {song.artist && song.artist !== mainArtist && (
                    <span className="text-sm text-gray-400">
                      {" "}
                      (feat. {song.artist})
                    </span>
                  )}
                </span>
      
              </div>
            ))}
          </div>
        </div>

        {/* Space for a fixed Mini-Player / Music Controller */}
        <div className="h-24"></div>
      </div>
    </div>
  );
};

export default PlayerPage;
