import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { Buffer } from "buffer";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { parseBlob } from "music-metadata-browser";
import RightPlayerPanel from "./components/mainUI/RightPlayerPanel";
import Navbar from "./components/mainUI/Navbar";
import Home from "./components/mainUI/Home";
import PlayerPage from "./components/mainUI/PlayerPage";
import { generateSvgCover } from "./components/mainUI/utils";

window.Buffer = Buffer;

// Main App Component
const App = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [playlists, setPlaylists] = useState({});
  const [currentPlaylistName, setCurrentPlaylistName] = useState(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [currentPlayingSong, setCurrentPlayingSong] = useState(null);

  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState("off");
  const [shuffledSongMap, setShuffledSongMap] = useState({});

  const audioRef = useRef(new Audio());
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const playlistNames = Object.keys(playlists);
  const currentSongListOriginal = playlists[currentPlaylistName || ""] || [];
  const currentPlaylistIndex = playlistNames.indexOf(currentPlaylistName || "");

  const getPlaybackList = useCallback(() => {
    if (
      isShuffle &&
      currentPlaylistName &&
      shuffledSongMap[currentPlaylistName]
    ) {
      return shuffledSongMap[currentPlaylistName];
    }
    return currentSongListOriginal;
  }, [
    isShuffle,
    currentPlaylistName,
    shuffledSongMap,
    currentSongListOriginal,
  ]);

  const currentPlaybackList = getPlaybackList();

  const createShuffledList = useCallback((list) => {
    const array = [...list];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }, []);

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

    setTimeout(() => {
      audioRef.current
        .play()
        .catch((e) => console.error("Playback failed:", e));
      setIsPlaying(true);
    }, 100);
  }, []);

  const onPlayPause = useCallback(() => {
    if (currentPlayingSong) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        const currentList = getPlaybackList();
        if (!audioRef.current.src || audioRef.current.paused) {
          playSong(currentList, currentSongIndex);
        } else {
          audioRef.current
            .play()
            .catch((e) => console.error("Playback error:", e));
          setIsPlaying(true);
        }
      }
    } else if (currentPlaybackList.length > 0) {
      playSong(currentPlaybackList, 0);
    }
  }, [
    currentPlayingSong,
    isPlaying,
    currentPlaybackList,
    currentSongIndex,
    playSong,
    getPlaybackList,
  ]);

  const toggleShuffle = useCallback(() => {
    if (!currentPlaylistName || currentSongListOriginal.length === 0) return;

    if (isShuffle) {
      setIsShuffle(false);

      const currentIndexInOriginal = currentSongListOriginal.findIndex(
        (s) => s.url === currentPlayingSong?.url
      );
      setCurrentSongIndex(
        currentIndexInOriginal >= 0 ? currentIndexInOriginal : 0
      );

      if (currentPlayingSong && isPlaying) {
        playSong(
          currentSongListOriginal,
          currentIndexInOriginal >= 0 ? currentIndexInOriginal : 0
        );
      }
    } else {
      const shuffledList = createShuffledList(currentSongListOriginal);

      setShuffledSongMap((prev) => ({
        ...prev,
        [currentPlaylistName]: shuffledList,
      }));
      setIsShuffle(true);

      const currentIndexInShuffled = shuffledList.findIndex(
        (s) => s.url === currentPlayingSong?.url
      );
      setCurrentSongIndex(
        currentIndexInShuffled >= 0 ? currentIndexInShuffled : 0
      );

      if (currentPlayingSong && isPlaying) {
        playSong(
          shuffledList,
          currentIndexInShuffled >= 0 ? currentIndexInShuffled : 0
        );
      }
    }
  }, [
    isShuffle,
    currentPlaylistName,
    currentSongListOriginal,
    currentPlayingSong,
    createShuffledList,
    isPlaying,
    playSong,
  ]);

  const toggleRepeat = useCallback(() => {
    setRepeatMode((prevMode) => {
      switch (prevMode) {
        case "off":
          return "all";
        case "all":
          return "one";
        case "one":
        default:
          return "off";
      }
    });
  }, []);

  const selectPlaylist = useCallback((playlistName) => {
    setCurrentPlaylistName(playlistName);
    setCurrentSongIndex(0);
  }, []);

  const onNext = useCallback(() => {
    const currentList = getPlaybackList();
    if (currentList.length === 0) return;

    const currentMaxIndex = currentList.length - 1;

    if (repeatMode === "one" && currentPlayingSong) {
      playSong(currentList, currentSongIndex);
      return;
    }

    if (currentSongIndex < currentMaxIndex) {
      const nextIndex = currentSongIndex + 1;
      playSong(currentList, nextIndex);
    } else if (repeatMode === "all") {
      playSong(currentList, 0);
    } else {
      const nextPlaylistIndex = currentPlaylistIndex + 1;

      if (nextPlaylistIndex < playlistNames.length) {
        const nextPlaylistName = playlistNames[nextPlaylistIndex];
        const nextSongListOriginal = playlists[nextPlaylistName];

        setCurrentPlaylistName(nextPlaylistName);

        let songListToPlay = nextSongListOriginal;
        let indexToPlay = 0;

        if (isShuffle) {
          let shuffledList = shuffledSongMap[nextPlaylistName];
          if (!shuffledList) {
            shuffledList = createShuffledList(nextSongListOriginal);
            setShuffledSongMap((prev) => ({
              ...prev,
              [nextPlaylistName]: shuffledList,
            }));
          }
          songListToPlay = shuffledList;
        }

        playSong(songListToPlay, indexToPlay);
      } else {
        setIsPlaying(false);
        setCurrentPlayingSong(null);
        setCurrentTime(0);
        setDuration(0);
      }
    }
  }, [
    currentSongIndex,
    repeatMode,
    currentPlayingSong,
    getPlaybackList,
    currentPlaylistIndex,
    playlistNames,
    playlists,
    isShuffle,
    shuffledSongMap,
    createShuffledList,
    playSong,
    navigate,
  ]);

  const onPrev = useCallback(() => {
    const currentList = getPlaybackList();

    if (audioRef.current.currentTime > 3) {
      playSong(currentList, currentSongIndex);
      return;
    }

    if (currentSongIndex > 0) {
      const prevIndex = currentSongIndex - 1;
      playSong(currentList, prevIndex);
    } else if (repeatMode === "all") {
      playSong(currentList, currentList.length - 1);
    } else if (currentSongIndex === 0 && currentPlaylistIndex > 0) {
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
  }, [
    currentSongIndex,
    repeatMode,
    currentPlaylistIndex,
    playlistNames,
    playlists,
    isShuffle,
    shuffledSongMap,
    getPlaybackList,
    playSong,
    navigate,
  ]);

  const onSeek = useCallback((time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const handleFolderSelect = async (e) => {
    const files = Array.from(e.target.files).filter((file) =>
      file.type.includes("audio")
    );

    const tempPlaylists = {};
    const objectUrls = [];

    const dirPaths = new Set();
    for (const file of files) {
      const path = file.webkitRelativePath || file.name;
      const lastSlash = path.lastIndexOf('/');
      if (lastSlash > -1) {
        dirPaths.add(path.substring(0, lastSlash));
      }
    }

    await Promise.all(
      files.map(async (file) => {
        const path = file.webkitRelativePath || file.name;
        const lastSlash = path.lastIndexOf('/');
        let playlistName;

        if (lastSlash === -1) {
          playlistName = "My Songs";
        } else {
          const parentDir = path.substring(0, lastSlash);

          let isContainer = false;
          for (const otherDir of dirPaths) {
            if (otherDir !== parentDir && otherDir.startsWith(parentDir + '/')) {
              isContainer = true;
              break;
            }
          }

          if (isContainer) {
            playlistName = "My Songs";
          } else {
            const nameParts = parentDir.split('/');
            playlistName = nameParts[nameParts.length - 1];
          }
        }

        let coverUrl = null;
        let title = file.name.replace(/\.[^/.]+$/, "");
        let artist = "Unknown Artist";
        let duration = "3:00";

        try {
          const blob = file.slice();
          const metadata = await parseBlob(blob);

          if (metadata.common) {
            title = metadata.common.title || title;
            artist = metadata.common.artist || "Unknown Artist";
            if (metadata.format && metadata.format.duration) {
              const totalSeconds = Math.floor(metadata.format.duration);
              const minutes = Math.floor(totalSeconds / 60);
              const seconds = totalSeconds % 60;
              duration = `${minutes}:${seconds.toString().padStart(2, "0")}`;
            }

            const pictures = metadata.common.picture;
            if (pictures && pictures.length > 0) {
              const pic = pictures[0];
              coverUrl = URL.createObjectURL(
                new Blob([new Uint8Array(pic.data)], { type: pic.format })
              );
            }
          }
        } catch (err) {
          console.warn("Failed to read metadata for", file.name, err);
        }

        if (!coverUrl) {
          const titleStr = title;
          const hash = Array.from(titleStr).reduce(
            (h, char) => h + char.charCodeAt(0),
            0
          );
          const colorInt = (hash * 1234567) % 0xffffff;
          const color = colorInt.toString(16).padStart(6, "0");
          coverUrl = generateSvgCover(titleStr, color);
        }

        const url = URL.createObjectURL(file);
        objectUrls.push(url);

        const songData = {
          title,
          artist,
          album: playlistName,
          cover: coverUrl,
          url: url,
          duration,
        };

        if (!tempPlaylists[playlistName]) {
          tempPlaylists[playlistName] = [];
        }
        tempPlaylists[playlistName].push(songData);
      })
    );

    Object.values(playlists)
      .flat()
      .forEach((song) => {
        if (song.url) URL.revokeObjectURL(song.url);
      });

    setPlaylists((prev) => ({ ...prev, ...tempPlaylists }));

    if (Object.keys(tempPlaylists).length > 0) {
      const firstPlaylistName = Object.keys(tempPlaylists)[0];
      setCurrentPlaylistName(firstPlaylistName);
      setCurrentSongIndex(0);
      navigate("/");
    } else {
      navigate("/");
    }
  };

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

    audio.addEventListener("loadeddata", setAudioData);
    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("play", togglePlay);
    audio.addEventListener("pause", togglePause);
    audio.addEventListener("ended", handleSongEnd);

    return () => {
      audio.removeEventListener("loadeddata", setAudioData);
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("play", togglePlay);
      audio.removeEventListener("pause", togglePause);
      audio.removeEventListener("ended", handleSongEnd);
    };
  }, [onNext]);

  useEffect(() => {
    return () => {
      audioRef.current.pause();
      Object.values(playlists)
        .flat()
        .forEach((song) => {
          if (song.url) URL.revokeObjectURL(song.url);
        });
    };
  }, [playlists]);

  // Decide what the background image should be:
  // - If there's a current song and it has a cover, use that.
  // - Otherwise, use "/background01.jpg".
  // The blur and filter should always be the same, regardless of play/pause state.
  // Only change cover when the *song* changes, not when play/pause changes.

  const bgImage =
    currentPlayingSong?.cover && currentPlayingSong.cover.trim()
      ? currentPlayingSong.cover
      : "/background01.jpg";

  return (
    <div className="flex h-screen bg-background text-white overflow-hidden relative">
      {/* Dynamic blurred background based on current song (changes only when the song or cover changes, not play state) */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center animate-fade-in"
          style={{
            backgroundImage: `url(${bgImage})`,
            // Use lighter blur for song cover, heavier for default; but you could always use the same if you prefer!
            filter:
              bgImage === "/background01.jpg"
                ? 'blur(10px) brightness(0.4)'
                : 'blur(2px) brightness(0.4)',
            transform: "scale(1.2)",
          }}
        />
        <div className="absolute inset-0 bg-background/40" />
      </div>

      <div className="flex flex-col lg:flex-row flex-grow min-w-0 relative z-10">
        {/* <Navbar onFolderSelect={handleFolderSelect} /> */}
        <main className="flex-grow overflow-y-auto custom-scrollbar">
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  playlists={playlists}
                  onFolderSelect={handleFolderSelect}
                  selectPlaylist={selectPlaylist}
                  currentSong={currentPlayingSong}
                  currentPlaylistName={currentPlaylistName}
                  playSong={playSong}
                />
              }
            />
            <Route
              path="/play/:pname"
              element={
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
                />
              }
            />
            <Route
              path="*"
              element={
                <div className="p-8 flex items-center justify-center min-h-screen">
                  <div className="text-center p-8 md:p-16 rounded-3xl bg-card/20 backdrop-blur-3xl border border-white/10 shadow-2xl">
                    <h1 className="text-2xl md:text-4xl font-bold text-white">404 Not Found</h1>
                  </div>
                </div>
              }
            />
          </Routes>
        </main>
      </div>

      <div className="hidden lg:block">
        <RightPlayerPanel
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
          currentPlaybackList={currentPlaybackList}
        />
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--muted) / 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.7);
        }
      `}</style>
    </div>
  );
};

export default App;
