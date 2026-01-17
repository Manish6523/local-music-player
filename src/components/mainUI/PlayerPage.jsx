import React, { useMemo, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { 
  Play, 
  Pause, 
  Heart, 
  ListMusic, 
  Clock, 
  ArrowBigLeft, 
  Activity, 
  Hash, 
  User, 
  Disc3 
} from "lucide-react";
import { PLAYLIST_FALLBACK_LG } from "./utils";
import Navbar from "./Navbar";

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
  isScrolled,
  onToggleRightPanel,
  handleFolderSelect,
  setShowRightPanel,
  showRightPanel,
  allSongs
}) => {
  const { pname } = useParams();
  const playlistName = decodeURIComponent(pname || "");
  const songList = playlists[playlistName] || [];

  const mainSong = songList[0];
  const fallbackCover = PLAYLIST_FALLBACK_LG;
  const mainCover = mainSong?.cover || fallbackCover;

  const totalDurationInfo = useMemo(() => {
    const totalTracks = songList.length;
    if (totalTracks === 0) return "0_TRACKS";
    return `${totalTracks.toString().padStart(2, '0')}_TRACKS_INDEXED`;
  }, [songList.length]);

  const handlePlayButtonClick = useCallback(() => {
    if (songList.length > 0 && playSong) {
      selectPlaylist(playlistName);
      const listToPlay = isShuffle && shuffledSongMap[playlistName] 
        ? shuffledSongMap[playlistName] 
        : songList;

      if (currentPlaylistName === playlistName && currentSong && isPlaying) {
        onPlayPause();
        return;
      }
      const indexToPlay = currentPlaylistName === playlistName && currentSong 
        ? currentSongIndex 
        : 0;
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
        actualPlaybackIndex = listToPlay.findIndex((s) => s.url === songData.url);
        actualPlaybackIndex = actualPlaybackIndex >= 0 ? actualPlaybackIndex : index;
      }
      playSong(listToPlay, actualPlaybackIndex);
    }
  }, [songList, playSong, selectPlaylist, playlistName, isShuffle, shuffledSongMap]);

  if (!playlistName || songList.length === 0) {
    return (
      <div className="min-h-full flex items-center justify-center p-8 font-mono">
        <div className="text-center p-12 bg-white/5 border border-white/10 backdrop-blur-3xl rounded-3xl shadow-2xl">
          <h2 className="text-2xl font-black tracking-tighter text-white uppercase">404_PLAYLIST_NOT_FOUND</h2>
          <Link to={"/"} className="inline-block mt-8 px-8 py-3 bg-primary text-black font-bold uppercase tracking-widest shadow-[4px_4px_0px_rgba(var(--primary),0.3)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
            Return_to_Core
          </Link>
        </div>
      </div>
    );
  }

  const isCurrentPlaylistPlaying = currentPlaylistName === playlistName && isPlaying;

  return (
    <div className="grow p-4 md:p-8 lg:p-12 lg:pt-0 text-white min-h-full relative font-mono custom-scrollbar">
      <Navbar
        isScrolled={isScrolled}
        onFolderSelect={handleFolderSelect}
        onToggleRightPanel={() => setShowRightPanel(!showRightPanel)}
        allSongs={allSongs}
        playSong={playSong}
        selectPlaylist={selectPlaylist}
        playlists={playlists}
      />

      <div className="mt-10 space-y-12">
        {/* HEADER: Playlist Manifest */}
        <header className="flex flex-col md:flex-row gap-8 items-end p-6 bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Activity size={180} className="text-primary" />
          </div>

          <div className="relative shrink-0">
            <img 
              src={mainCover} 
              alt="Art" 
              className="w-48 h-48 md:w-64 md:h-64 object-cover border border-white/20 shadow-2xl grayscale-0group-hover:grayscale-0 transition-all duration-700" 
            />
            <div className="absolute -bottom-2 -left-2 bg-primary text-black px-3 py-1 text-sm font-bold tracking-widest uppercase">
              Directory_Verified
            </div>
          </div>

          <div className="flex-1 space-y-4 relative z-10">
            <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-[0.4em]">
              <ListMusic size={14} /> Playlist_Object
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none break-all">
              {playlistName}
            </h1>
            <div className="flex items-center gap-4 text-sm text-white/40 uppercase tracking-widest">
              <span className="flex items-center gap-1"><User size={12}/> {mainSong?.artist || "SYSTEM_VAR"}</span>
              <span className="flex items-center gap-1"><Disc3 size={12}/> {totalDurationInfo}</span>
            </div>
          </div>

          {/* <div className="pb-2">
            <button
              onClick={handlePlayButtonClick}
              className="w-16 h-16 bg-primary text-black flex items-center justify-center shadow-[6px_6px_0px_rgba(var(--primary),0.3)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
            >
              {isCurrentPlaylistPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
            </button>
          </div> */}
        </header>

        {/* SONG STREAM: Technical List */}
        <section>
          <div className="grid grid-cols-[60px_1fr_120px_80px] px-6 mb-4 text-sm uppercase tracking-widest text-white/30 font-bold border-b border-white/5 pb-2">
            <div className="flex items-center gap-1"><Hash size={10}/> ID</div>
            <div>File_Name // Metadata</div>
            <div className="hidden md:block text-right">Album_Context</div>
            <div className="flex items-center justify-end gap-1"><Clock size={10}/> DUR</div>
          </div>

          <div className="space-y-1">
            {songList.map((song, idx) => {
              const isCurrent = currentPlaylistName === playlistName && song.url === currentSong?.url;

              return (
                <div
                  key={idx}
                  onClick={() => handleSongClick(song, idx)}
                  className={`grid grid-cols-[60px_1fr_80px] md:grid-cols-[60px_1fr_120px_80px] items-center px-6 py-3 border border-transparent transition-all duration-300 group cursor-pointer
                    ${isCurrent 
                      ? "bg-primary/10 border-primary/40 shadow-[4px_4px_0px_rgba(var(--primary),0.2)]" 
                      : "hover:bg-white/5 hover:border-white/10"
                    }`}
                >
                  <span className="text-sm text-white/30 font-bold">
                    {isCurrent ? <Activity size={12} className="text-primary animate-pulse" /> : idx.toString().padStart(2, '0')}
                  </span>

                  <div className="flex items-center gap-4 min-w-0">
                    <img 
                      src={song.cover} 
                      className={`size-12 object-cover border border-white/10 ${isCurrent ? 'grayscale-0' : 'grayscale-0group-hover:grayscale-0'}`} 
                      alt="" 
                    />
                    <div className="truncate">
                      <p className={`text-base font-bold uppercase truncate ${isCurrent ? 'text-primary' : 'text-white'}`}>
                        {song.title}
                      </p>
                      <p className="text-sm text-white/40 uppercase truncate tracking-tighter">
                        {song.artist || "Undefined_Artist"}
                      </p>
                    </div>
                  </div>

                  <div className="hidden md:block text-right font-mono text-sm text-white/40 truncate px-4">
                    {song.album || playlistName}
                  </div>

                  <div className="text-right text-sm text-white/40 font-bold">
                    {song?.duration || "00:00"}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PlayerPage;