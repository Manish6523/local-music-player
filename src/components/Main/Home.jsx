import React from "react";
import PlaylistCard from "../music_components/PlaylistCard";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom"; // Import Link for the Create button functionality

const Home = ({
  playlists,
  currentPlaylist,
  onFolderSelect,
  selectPlaylist,
}) => {
  // Function to simulate creating a new playlist or re-triggering folder select
  const handleCreateNew = () => {
    // In a real app, this would open a modal for creating a playlist.
    // For now, we reuse the onFolderSelect for convenience.
    const fileInput = document.getElementById("get");
    if (fileInput) {
      fileInput.click();
    }
    console.log("Simulating 'Create New Playlist' action.");
  };

  return (
    // Redesign: Use a darker, less transparent background for the main content area
    <main className="bg-black/80 min-h-screen w-full mx-auto p-8 text-white ">
      <div className="max-w-7xl mx-auto">
        {/* === Header Section === */}
        <div className="flex items-center justify-between border-b border-gray-700 pb-4 mb-8">
          <span className="text-4xl font-extrabold tracking-tight">
            Music Library
          </span>

          {/* File Input & Label (Kept for functionality) */}
          <label
            htmlFor="get"
            className="group flex items-center bg-[#1a1a1a] rounded-full p-2 hover:bg-red-600 transition-colors cursor-pointer"
          >
            <span className="text-sm font-semibold hidden sm:inline">
              <Plus size={24} />
            </span>
          </label>
          <input
            type="file"
            id="get"
            name="get"
            webkitdirectory="true"
            directory=""
            multiple
            onChange={onFolderSelect}
            className="hidden"
          />
        </div>

        {/* === Playlists Grid Section === */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6">
            Your Playlists ({Object.keys(playlists).length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {/* 2. Loaded Playlists */}
            {Object.keys(playlists).map((pl) => (
              <PlaylistCard
                key={pl}
                data={playlists[pl]}
                title={pl}
                onClick={() => selectPlaylist(pl)} // This updates App state before navigation
              />
            ))}
          </div>
        </section>

        {/* === Featured/Active Section (Optional) === */}
        {currentPlaylist && playlists[currentPlaylist] && (
          <section className="mt-10 p-6 bg-red-800/20 rounded-xl border border-red-700/50">
            <h2 className="text-xl font-bold mb-4 text-red-300">
              Currently Active: {currentPlaylist}
            </h2>
            <p className="text-gray-300">
              Total Songs: {playlists[currentPlaylist].length}
            </p>
            <Link
              to={`/play/${currentPlaylist}`}
              className="mt-3 inline-block px-4 py-2 bg-red-600 rounded-full hover:bg-red-700 transition font-semibold"
            >
              Go to Player
            </Link>
          </section>
        )}
      </div>
    </main>
  );
};

export default Home;
