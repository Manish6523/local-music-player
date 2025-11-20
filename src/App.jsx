import React, { useState, useEffect, useRef, useCallback } from "react";
import { parseBlob } from "music-metadata-browser";
import { Buffer } from "buffer";
import { Routes, Route, useLocation } from "react-router-dom"; 
import Navbar from "./components/Navbar";
import Home from "./components/Main/Home";
import PlayerPage from "./components/Main/PlayerPage";
import PlayerControls from "./components/PlayerControls"; // Import the Player Controls

// Polyfill for Buffer needed by music-metadata-browser
window.Buffer = Buffer;

const App = () => {
  // --- STATE ---
  const [playlists, setPlaylists] = useState({});
  const [currentPlaylistName, setCurrentPlaylistName] = useState(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [currentPlayingSong, setCurrentPlayingSong] = useState(null); 
  
  // Player State
  const audioRef = useRef(new Audio());
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const location = useLocation(); 

  // --- DERIVED STATE ---
  const currentSongList = playlists[currentPlaylistName] || [];
  const maxIndex = currentSongList.length - 1;

  // --- HANDLERS ---

  const handleFolderSelect = async (e) => {
    // ... (Your existing file parsing logic is preserved) ...
    const files = Array.from(e.target.files).filter((file) =>
      file.type.includes("audio")
    );

    const tempPlaylists = {};

    await Promise.all(
      files.map(async (file) => {
        const pathParts = file.webkitRelativePath.split("/");
        const playlistName =
          pathParts.length > 1 && pathParts[1] !== ""
            ? pathParts[1]
            : "Default";

        let coverUrl = null;
        let title = file.name.replace(/\.[^/.]+$/, "");
        let artist = "Unknown Artist";

        try {
          const blob = file.slice();
          const metadata = await parseBlob(blob);

          if (metadata.common) {
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
    setCurrentPlaylistName(firstPlaylist);
    setCurrentSongIndex(0);
    // Automatically start playing the first song of the first playlist
    if (tempPlaylists[firstPlaylist] && tempPlaylists[firstPlaylist].length > 0) {
        playSong(tempPlaylists[firstPlaylist], 0);
    }
  };

  const selectPlaylist = (playlistName) => {
    setCurrentPlaylistName(playlistName);
    setCurrentSongIndex(0);
  };
  
  // 1. Core Playback Toggle
  const onPlayPause = useCallback(() => {
    if (currentPlayingSong) {
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            // If paused, ensure we have a valid source before trying to play
            if (!audioRef.current.src) {
                 // If no source is set (e.g., first load), set the first song
                playSong(currentSongList, currentSongIndex);
            } else {
                audioRef.current.play().catch(e => console.error("Playback error:", e));
                setIsPlaying(true);
            }
        }
    } else if (currentSongList.length > 0) {
        // If nothing is playing but a playlist is selected, start the first song
        playSong(currentSongList, 0);
    }
  }, [currentPlayingSong, isPlaying, currentSongList, currentSongIndex]);


  // 2. Play Song (Centralized logic to update UI state and audio element)
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
    
    // Play with a slight delay to ensure the audio element is ready
    setTimeout(() => {
        audioRef.current.play().catch(e => console.error("Playback failed:", e));
        setIsPlaying(true);
    }, 100);
  }, []); // Dependencies needed: none for the direct function logic, but relies on state updates

  // 3. Skip Next/Prev Logic
  const onNext = useCallback(() => {
    if (maxIndex > 0) {
        const nextIndex = (currentSongIndex + 1) % (maxIndex + 1); // Loop back to 0
        playSong(currentSongList, nextIndex);
    }
  }, [currentSongIndex, maxIndex, currentSongList, playSong]);

  const onPrev = useCallback(() => {
    if (maxIndex > 0) {
        let prevIndex = currentSongIndex - 1;
        if (prevIndex < 0) {
            prevIndex = maxIndex; // Loop back to the end
        }
        playSong(currentSongList, prevIndex);
    }
  }, [currentSongIndex, maxIndex, currentSongList, playSong]);
  
  // 4. Seek Handler
  const onSeek = useCallback((time) => {
    if (audioRef.current) {
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    }
  }, []);

  // 5. Audio Event Listeners (Crucial for time and duration updates)
  useEffect(() => {
    const audio = audioRef.current;
    
    const setAudioData = () => {
        setDuration(audio.duration);
        setCurrentTime(audio.currentTime);
    };
    
    const updateTime = () => setCurrentTime(audio.currentTime);
    const togglePlay = () => setIsPlaying(true);
    const togglePause = () => setIsPlaying(false);
    const handleSongEnd = () => onNext(); // Auto-skip to next track

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
  }, [onNext]); // Depend on onNext for 'ended' handler

  return (
    <main
        className="min-h-screen" 
        // add bg image
        style={{background: `url('/background.jpg') no-repeat center center fixed`, backgroundSize: 'cover'}}
    >
        {/* Navbar remains at the top */}
        {/* {!location.pathname.startsWith("/play/") && <Navbar />}  */}
        
        {/* Routes container needs padding at the bottom to avoid being hidden by the fixed footer */}
        <div className="pb-24 overflow-y-auto backdrop-blur-xs ">
            <Routes>
                <Route
                    path="/"
                    element={
                        <Home
                            playlists={playlists}
                            currentPlaylist={currentPlaylistName}
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
                            currentSongIndex={currentSongIndex} 
                            selectPlaylist={selectPlaylist} 
                            playSong={playSong} // Pass playSong to PlayerPage to allow list item clicks
                            currentSong={currentPlayingSong} // Pass current song for highlighting
                        />
                    }
                />
            </Routes>
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
        />
    </main>
  );
};

export default App;