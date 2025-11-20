import React from "react";
// Assuming you use react-router-dom for routing
import { Link } from "react-router-dom"; 

// Utility function (placeholder for now)
const formatTotalDuration = (data) => "3h";

// Added onClick prop
const PlaylistCard = ({ data, title, onClick }) => {
  const playlistName = title || "Untitled Playlist";
  const songCount = data?.length || 0;
  const totalDuration = formatTotalDuration(data);
  const cover = data?.[0]?.cover;
//   const randomIndex = Math.floor(Math.random() * songCount);
//   const randomCover = data?.[randomIndex]?.cover;

  return (
    <div
      className="rounded-lg transition-all duration-200"
      // Apply background/hover style here if you want the card to look good
    >
      {/* The Link component handles navigation */}
      <Link 
        to={`/play/${playlistName}`} 
        onClick={onClick} // This ensures the selectPlaylist state update happens BEFORE navigation
      >
        {cover ? (
          <img
            src={cover}
            alt={playlistName}
            className="w-full object-cover rounded-md mb-2"
          />
        ) : (
          <div className="w-full h-32 bg-gray-700 rounded-md mb-2 flex items-center justify-center text-sm text-gray-400">
            No Art
          </div>
        )}
      </Link>

      {/* Playlist Title and Metadata */}
      <p className="font-semibold text-white text-lg truncate">{playlistName}</p>
      <p className="text-sm text-gray-400">
        {songCount} songs • {totalDuration}
      </p>
    </div>
  );
};

export default PlaylistCard;