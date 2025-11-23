import { useParams } from "react-router-dom";
import { useMemo, useCallback } from "react";
import { Play, Pause, Heart, ListMusic, Clock } from "lucide-react";
import { PLAYLIST_FALLBACK_LG } from "./utils";

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

  const playlistName = decodeURIComponent(pname || "");
  const songList = playlists[playlistName] || [];

  const mainSong = songList[0];
  const fallbackCover = PLAYLIST_FALLBACK_LG;
  const mainCover = mainSong?.cover || fallbackCover;
  const mainArtist = mainSong?.artist || "Various Artists";

  const totalDurationInfo = useMemo(() => {
    const totalTracks = songList.length;
    if (totalTracks === 0) return "0 tracks";
    const totalMinutes = totalTracks * 3.5;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    return `${totalTracks} songs, ~${hours}h ${minutes}m`;
  }, [songList.length]);

  const handlePlayButtonClick = useCallback(() => {
    if (songList.length > 0 && playSong) {
      selectPlaylist(playlistName);

      const listToPlay =
        isShuffle && shuffledSongMap[playlistName]
          ? shuffledSongMap[playlistName]
          : songList;

      if (currentPlaylistName === playlistName && currentSong && isPlaying) {
        onPlayPause();
        return;
      }

      const indexToPlay =
        currentPlaylistName === playlistName && currentSong
          ? currentSongIndex
          : 0;

      playSong(listToPlay, indexToPlay);
    }
  }, [
    songList,
    playSong,
    selectPlaylist,
    playlistName,
    currentPlaylistName,
    currentSong,
    onPlayPause,
    isShuffle,
    shuffledSongMap,
    isPlaying,
    currentSongIndex,
  ]);

  const handleSongClick = useCallback(
    (songData, index) => {
      if (playSong) {
        selectPlaylist(playlistName);

        const listToPlay =
          isShuffle && shuffledSongMap[playlistName]
            ? shuffledSongMap[playlistName]
            : songList;

        let actualPlaybackIndex = index;

        if (isShuffle && shuffledSongMap[playlistName]) {
          actualPlaybackIndex = listToPlay.findIndex(
            (s) => s.url === songData.url
          );
          actualPlaybackIndex =
            actualPlaybackIndex >= 0 ? actualPlaybackIndex : index;
        }

        playSong(listToPlay, actualPlaybackIndex);
      }
    },
    [
      songList,
      playSong,
      selectPlaylist,
      playlistName,
      isShuffle,
      shuffledSongMap,
    ]
  );

  if (!playlistName || songList.length === 0) {
    return (
      <div className="min-h-full bg-gray-300 flex items-center justify-center p-4 md:p-8">
        <div className="text-center p-8 md:p-16 rounded-2xl md:rounded-3xl bg-gradient-glass backdrop-blur-3xl border border-white/10 shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Playlist Not Found</h2>
        </div>
      </div>
    );
  }

  const isCurrentPlaylistPlaying =
    currentPlaylistName === playlistName && isPlaying;

  return (
    <div className="min-h-full text-white relative flex flex-col pt-16 md:pt-20">
      {/* Blurred background */}
      <div className="absolute top-0 left-0 right-0 h-64 md:h-96 overflow-hidden">
        <div
          className="w-full h-full bg-center bg-cover scale-110 blur-3xl opacity-30"
          style={{
            backgroundImage: `url(${mainCover})`,
          }}
        ></div>
      </div>

      <div className="relative z-10 flex-grow p-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full">
        {/* Header with glass effect */}
        <section className="flex flex-col md:flex-row items-center md:items-end md:space-x-8 mb-8 md:mb-12">
          <div className="relative group mb-4 md:mb-6 lg:mb-0">
            <div className="absolute -inset-2 bg-gradient-primary opacity-20 rounded-2xl md:rounded-3xl blur-2xl group-hover:opacity-40 transition-opacity duration-500"></div>
            <img
              src={mainCover}
              alt={`${playlistName} Cover`}
              className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 object-cover rounded-2xl md:rounded-3xl shadow-2xl shadow-primary/40 ring-2 ring-white/20"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = fallbackCover;
              }}
            />
            <div className="absolute inset-0 rounded-2xl md:rounded-3xl bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>

          <div className="text-center md:text-left space-y-3 md:space-y-4">
            <div className="inline-block px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-gradient-glass backdrop-blur-xl border border-white/10 shadow-lg">
              <p className="text-xs md:text-sm font-semibold text-primary">
                Playlist
              </p>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-none">
              {playlistName}
            </h1>

            <div className="flex flex-wrap justify-center md:justify-start items-center text-white/70 text-xs sm:text-sm md:text-base space-x-2 md:space-x-3">
              <p className="font-bold text-white">{mainArtist}</p>
              <span>•</span>
              <p>{totalDurationInfo}</p>
            </div>
          </div>
        </section>

        {/* Controls */}
        <div className="py-4 md:py-6 flex items-center space-x-4 md:space-x-6">
          <button
            onClick={handlePlayButtonClick}
            className="w-12 h-12 md:w-16 md:h-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-2xl shadow-primary/50 hover:shadow-3xl hover:shadow-primary/60 hover:scale-110 transition-all duration-300 ring-2 ring-white/20 backdrop-blur-xl text-white"
          >
            {isCurrentPlaylistPlaying ? (
              <Pause size={24} className="md:w-7 md:h-7" fill="currentColor" />
            ) : (
              <Play size={24} className="md:w-7 md:h-7" fill="currentColor" className="ml-0.5" />
            )}
          </button>

          <button className="p-2 md:p-3 rounded-full bg-gradient-glass backdrop-blur-xl border border-white/10 text-white/70 hover:text-white hover:border-primary/30 hover:shadow-lg transition-all duration-300">
            <Heart size={20} className="md:w-7 md:h-7" />
          </button>

          <button className="p-2 md:p-3 rounded-full bg-gradient-glass backdrop-blur-xl border border-white/10 text-white/70 hover:text-white hover:border-primary/30 hover:shadow-lg transition-all duration-300">
            <ListMusic size={20} className="md:w-7 md:h-7" />
          </button>
        </div>

        {/* Song List with glass cards */}
        <div className="pt-4 pb-6 md:pb-10">
          <div className="grid grid-cols-[30px_1fr_50px] md:grid-cols-[40px_1fr_150px_80px] text-white/70 text-[10px] md:text-xs uppercase font-semibold border-b border-white/20 pb-2 md:pb-3 mb-2 md:mb-3 px-2 md:px-4">
            <div className="text-center">#</div>
            <div className="ml-2 md:ml-3">Title</div>
            <div className="hidden md:block">Album</div>
            <div className="flex items-center justify-end">
              <Clock size={12} className="md:w-4 md:h-4" />
            </div>
          </div>

          <div className="space-y-2">
            {songList.map((song, idx) => {
              const isCurrent =
                currentPlaylistName === playlistName &&
                song.url === currentSong?.url;

              return (
                <div
                  key={idx}
                  onClick={() => handleSongClick(song, idx)}
                  className={`grid grid-cols-[30px_1fr_50px] md:grid-cols-[40px_1fr_150px_80px] items-center py-2 md:py-3 px-2 md:px-4 rounded-lg md:rounded-xl cursor-pointer transition-all duration-200 group
                    ${
                      isCurrent
                        ? "bg-primary/20 backdrop-blur-xl border border-primary/30 shadow-lg shadow-primary/20"
                        : "hover:bg-gradient-glass backdrop-blur-xl border border-transparent hover:border-white/10 hover:shadow-lg"
                    }`}
                >
                  <span
                    className={`text-xs md:text-sm font-mono text-center ${
                      isCurrent ? "text-primary" : "text-white/70"
                    }`}
                  >
                    {isCurrent ? (
                      <Play
                        size={12}
                        className="md:w-3.5 md:h-3.5 mx-auto"
                        fill="currentColor"
                      />
                    ) : (
                      idx + 1
                    )}
                  </span>

                  <div className="flex items-center gap-2 md:gap-3 ml-2 md:ml-3 min-w-0">
                    <img
                      src={song?.cover}
                      alt="cover"
                      className="w-10 h-10 md:w-12 md:h-12 rounded-lg ring-1 ring-white/20 shadow-md"
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm md:text-base font-medium truncate ${
                          isCurrent ? "text-primary" : "text-white group-hover:text-primary"
                        } transition-colors`}
                      >
                        {song.title}
                      </p>
                      <p className="text-[10px] md:text-xs text-white/70 truncate">
                        {song.artist || "Unknown Artist"}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs md:text-sm text-white/70 truncate hidden md:block">
                    {song.album || playlistName}
                  </div>

                  <div className="text-xs md:text-sm text-white/70 text-right">
                    {song?.duration}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerPage;

