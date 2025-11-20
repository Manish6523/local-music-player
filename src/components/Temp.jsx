import React, { useState } from "react";
import { parseBlob } from "music-metadata-browser";
import { Buffer } from "buffer";

window.Buffer = Buffer;

const Temp = () => {
  const [playlists, setPlaylists] = useState({}); // { playlistName: [{title, artist, url, cover}] }
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);

  // Handle folder selection
  const handleFolderSelect = async (e) => {
    const files = Array.from(e.target.files).filter((file) =>
      file.type.includes("audio")
    );

    const tempPlaylists = {};

    await Promise.all(
      files.map(async (file) => {
        const pathParts = file.webkitRelativePath.split("/");
        const playlistName = pathParts.length > 1 ? pathParts[1] : "Default";

        let coverUrl = null;
        let title = file.name.replace(/\.[^/.]+$/, ""); // default: filename without extension
        let artist = "Unknown Artist";

        try {
          const blob = file.slice();
          const metadata = await parseBlob(blob);

          // Extract metadata
          if (metadata.common) {
            // console.log(metadata);
            title = metadata.common.title || title;
            artist = metadata.common.artist || artist;

            const pictures = metadata.common.picture;
            if (pictures && pictures.length > 0) {
              const pic = pictures[0];
              coverUrl = URL.createObjectURL(
                new Blob([pic.data], { type: pic.format })
              );
            }
          }
        } catch (err) {
          console.warn("Failed to read metadata for", file.name, err);
        }

        const songData = {
          title,
          artist,
          url: URL.createObjectURL(file),
          cover: coverUrl,
        };

        if (!tempPlaylists[playlistName]) tempPlaylists[playlistName] = [];
        tempPlaylists[playlistName].push(songData);
      })
    );

    setPlaylists(tempPlaylists);
    const firstPlaylist = Object.keys(tempPlaylists)[0];
    setCurrentPlaylist(firstPlaylist);
    setCurrentSongIndex(0);
  };

  const currentSong =
    currentPlaylist && playlists[currentPlaylist]
      ? playlists[currentPlaylist][currentSongIndex]
      : null;

  const handleNext = () => {
    if (!currentPlaylist) return;
    setCurrentSongIndex((prev) =>
      (prev + 1) % playlists[currentPlaylist].length
    );
  };

  const handlePrev = () => {
    if (!currentPlaylist) return;
    setCurrentSongIndex((prev) =>
      (prev - 1 + playlists[currentPlaylist].length) %
      playlists[currentPlaylist].length
    );
  };

  const selectPlaylist = (playlistName) => {
    setCurrentPlaylist(playlistName);
    setCurrentSongIndex(0);
  };

  const selectSong = (index) => {
    setCurrentSongIndex(index);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4">
      <h1 className="text-white text-2xl mb-4">My Music Player</h1>

      <input
        type="file"
        webkitdirectory="true"
        directory=""
        multiple
        onChange={handleFolderSelect}
        className="mb-4 p-1 text-black rounded"
      />

      {currentSong ? (
        <div className="flex flex-col items-center w-full max-w-3xl">
          {/* Current song display */}
          {currentSong.cover ? (
            <img
              src={currentSong.cover}
              alt="cover"
              className="w-48 h-48 object-cover mb-3 rounded-md shadow-lg"
            />
          ) : (
            <div className="w-48 h-48 bg-gray-700 flex items-center justify-center mb-3 rounded-md shadow-inner">
              No cover
            </div>
          )}

          <p className="text-white text-lg font-semibold">
            {currentSong.title}
          </p>
          <p className="text-gray-400 mb-2">{currentSong.artist}</p>

          <audio
            controls
            className="w-full max-w-md mb-3"
            src={currentSong.url}
          />

          <div className="flex gap-4 mb-4">
            <button
              onClick={handlePrev}
              className="px-4 py-2 bg-white rounded shadow"
            >
              Prev
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-white rounded shadow"
            >
              Next
            </button>
          </div>

          {/* Playlist selector */}
          <div className="flex gap-4 mb-4 flex-wrap">
            {Object.keys(playlists).map((pl) => (
              <button
                key={pl}
                onClick={() => selectPlaylist(pl)}
                className={`px-3 py-1 rounded ${
                  pl === currentPlaylist ? "bg-white text-red-500" : "bg-gray-200"
                }`}
              >
                {pl}
              </button>
            ))}
          </div>

          {/* Songs list */}
          <div className="flex flex-wrap gap-4 justify-center">
            {currentPlaylist &&
              playlists[currentPlaylist].map((song, idx) => (
                <div
                  key={idx}
                  onClick={() => selectSong(idx)}
                  className={`w-32 flex flex-col items-center cursor-pointer p-2 rounded-md shadow ${
                    idx === currentSongIndex ? "bg-red-500 text-white" : "bg-gray-800"
                  }`}
                >
                  {song.cover ? (
                    <img
                      src={song.cover}
                      alt="cover"
                      className="w-24 h-24 object-cover mb-1 rounded-md"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-600 mb-1 flex items-center justify-center rounded-md">
                      No cover
                    </div>
                  )}
                  <p className="text-center text-sm font-semibold">{song.title}</p>
                  <p className="text-center text-xs text-gray-300">{song.artist}</p>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <p className="text-white">Select a folder with MP3 files to play</p>
      )}
    </div>
  );
};

export default Temp;
