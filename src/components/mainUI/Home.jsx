import { useNavigate } from "react-router-dom";
import { Library, Disc3, FolderOpen, Hash, Clock, User } from "lucide-react";
import { PLAYLIST_FALLBACK_SM, MUSIC_NOTE_FALLBACK } from "./utils";
import Navbar from "./Navbar";

const Home = ({
  playlists,
  onFolderSelect,
  selectPlaylist,
  currentSong,
  handleFolderSelect,
  currentPlaylistName,
  playSong,
  isScrolled,
  onToggleRightPanel,
  setShowRightPanel,
  showRightPanel,
  allSongs
}) => {
  const { "My Songs": individualSongs = [], ...otherPlaylists } = playlists;
  const playlistNames = Object.keys(otherPlaylists);
  const navigate = useNavigate();

  const handlePlaylistClick = (name) => {
    navigate(`/play/${encodeURIComponent(name)}`);
    selectPlaylist(name);
  };

  const handleSongClick = (song, index) => {
    selectPlaylist("My Songs");
    playSong(individualSongs, index);
  };

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

      {playlistNames.length === 0 && individualSongs.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center border border-white/10 bg-white/5 backdrop-blur-3xl rounded-3xl p-12">
          <div className="p-6 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <FolderOpen size={48} className="text-primary animate-pulse" />
          </div>
          <h2 className="text-2xl font-black tracking-tighter mb-2 uppercase">System_Library_Empty</h2>
          <p className="text-white/40 text-sm mb-8 tracking-widest uppercase">[ No_Data_Source_Detected ]</p>
          
          <label className="px-8 py-4 bg-primary text-white font-bold text-sm tracking-widest uppercase cursor-pointer hover:bg-primary/80 transition-all shadow-[8px_8px_0px_rgba(var(--primary),0.2)] active:translate-x-1 active:translate-y-1 active:shadow-none">
            Import_Directory
            <input type="file" webkitdirectory="true" directory="true" multiple onChange={onFolderSelect} className="hidden" />
          </label>
        </div>
      ) : (
        <div className="mt-10 space-y-16">
          {/* Section: Playlists (The Manifest) */}
          {playlistNames.length > 0 && (
            <section>
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-sm font-bold tracking-[0.4em] uppercase text-primary">/ Playlists_Manifest</h2>
                <div className="h-px grow bg-gradient-to-r from-primary/50 to-transparent"></div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-6">
                {playlistNames.map((name) => {
                  const list = otherPlaylists[name];
                  const cover = list[0]?.cover || PLAYLIST_FALLBACK_SM;
                  const isActive = name === currentPlaylistName;

                  return (
                    <div
                      key={name}
                      onClick={() => handlePlaylistClick(name)}
                      className="group cursor-pointer relative"
                    >
                      <div className="aspect-square mb-4 overflow-hidden border border-white/10 bg-white/5 relative shadow-2xl group-hover:border-primary/50 transition-all">
                        <img 
                          src={cover} 
                          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isActive ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'}`} 
                          alt="" 
                        />
                        {isActive && (
                          <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center">
                            <Disc3 size={32} className="animate-spin text-white" />
                          </div>
                        )}
                        <div className="absolute bottom-2 right-2 bg-black/80 text-[10px] px-2 py-1 border border-white/20">
                          {list.length}_FLS
                        </div>
                      </div>
                      <h3 className="text-xs font-bold tracking-widest uppercase truncate">{name}</h3>
                      <p className="text-[10px] text-white/40 uppercase mt-1">Status: Indexed</p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Section: All Songs (Data Stream) */}
          {individualSongs.length > 0 && (
            <section>
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-sm font-bold tracking-[0.4em] uppercase text-primary">/ Global_Data_Stream</h2>
                <div className="h-px grow bg-gradient-to-r from-primary/50 to-transparent"></div>
              </div>

              {/* Header Labels for Brutalist Look */}
              <div className="grid grid-cols-[60px_1fr_120px_80px] px-6 mb-4 text-[10px] uppercase tracking-widest text-white/30">
                <span>#_ID</span>
                <span>Track_Title // Artist</span>
                <span className="hidden md:block text-right">Duration</span>
                <span className="text-right">Action</span>
              </div>

              <div className="space-y-1">
                {individualSongs.map((song, idx) => {
                  const isCurrent = currentPlaylistName === "My Songs" && song.url === currentSong?.url;

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
                      <span className="text-[10px] text-white/30 font-bold">
                        {isCurrent ? <Activity size={12} className="text-primary animate-pulse" /> : idx.toString().padStart(2, '0')}
                      </span>
                      
                      <div className="flex items-center gap-4 min-w-0">
                        <img src={song.cover} className={`w-8 h-8 object-cover border border-white/10 ${isCurrent ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'}`} alt="" />
                        <div className="truncate">
                          <p className={`text-xs font-bold uppercase truncate ${isCurrent ? 'text-primary' : 'text-white'}`}>{song.title}</p>
                          <p className="text-[10px] text-white/40 uppercase truncate tracking-tighter">{song.artist || "Unknown_Entity"}</p>
                        </div>
                      </div>

                      <div className="hidden md:block text-right font-mono text-[10px] text-white/40">
                        {song.duration}
                      </div>

                      <div className="text-right opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-primary font-bold">PLAY_</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
};

export default Home;