import { useNavigate } from "react-router-dom";
import { Library, Disc3 } from "lucide-react";
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

  const fallbackCover = PLAYLIST_FALLBACK_SM;

  const handlePlaylistClick = (name) => {
    navigate(`/play/${encodeURIComponent(name)}`);
    selectPlaylist(name);
  };

  const handleSongClick = (song, index) => {
    selectPlaylist("My Songs");
    playSong(individualSongs, index);
  };

  return (
    <div className="flex-grow  p-3 md:p-8 lg:p-[59px] lg:pt-0  text-white min-h-full relative custom-scrollbar"
    >
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
        <div className="text-center p-8 md:p-16 mt-12 rounded-3xl bg-gradient-glass backdrop-blur-3xl border border-white/10 shadow-2xl max-w-2xl mx-auto">
          <div className="p-6 md:p-8 rounded-full bg-primary/20 backdrop-blur-xl inline-flex mb-4 md:mb-6 border border-white/10 shadow-xl shadow-primary/20">
            <Library size={48} className="md:w-16 md:h-16 text-primary" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-white">Your library is empty</h2>
          <p className="text-white/70 mb-6 md:mb-8 text-base md:text-lg">
            Start by loading a music folder from your device
          </p>
          <label className="inline-block px-6 py-3 md:px-8 md:py-4 bg-gradient-primary rounded-full cursor-pointer font-bold text-sm md:text-base shadow-2xl shadow-primary/40 hover:shadow-3xl hover:shadow-primary/60 transition-all duration-300 hover:scale-105 text-white ring-2 ring-white/20 backdrop-blur-xl">
            Load Music Folder
            <input
              type="file"
              webkitdirectory="true"
              directory="true"
              multiple
              onChange={onFolderSelect}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <>
          {playlistNames.length > 0 && (
            <section className="mb-12 md:mb-16 mt-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-white">
                Your Playlists
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                {playlistNames.map((name) => {
                  const list = otherPlaylists[name];
                  const firstSong = list[0];
                  const cover = firstSong?.cover || fallbackCover;
                  const isActive = name === currentPlaylistName;

                  return (
                    <div
                      key={name}
                      className={`relative rounded-2xl overflow-hidden shadow-xl cursor-pointer
                        transition-all duration-300 group hover:scale-105
                        ${isActive ? "ring-2 ring-primary shadow-2xl shadow-primary/50" : "hover:shadow-2xl border border-white/10"}`}
                      onClick={() => handlePlaylistClick(name)}
                    >
                      {/* Enhanced Glass card */}
                      <div className="absolute inset-0 bg-gradient-glass backdrop-blur-3xl shadow-inner"></div>

                      <div className="relative p-2 md:p-4 space-y-2 md:space-y-3">
                        <div className="relative">
                          <img
                            src={cover}
                            alt={`${name} Cover`}
                            className="w-full aspect-square object-cover rounded-lg md:rounded-xl ring-1 ring-white/20 shadow-lg"
                            onError={(e) => (e.target.src = fallbackCover)}
                          />
                          {isActive && (
                            <div className="absolute inset-0 bg-primary/30 backdrop-blur-xs rounded-lg md:rounded-xl flex items-center justify-center border border-white/10">
                              <Disc3
                                size={24}
                                className="md:w-8 md:h-8 text-primary animate-spin drop-shadow-lg"
                              />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-xs md:text-sm font-semibold text-white truncate group-hover:text-primary transition-colors">
                            {name}
                          </h3>
                          <p className="text-[10px] md:text-sm text-white/70">{list.length} tracks</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {individualSongs.length > 0 && (
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-white">
                All Songs
              </h2>
              <div className="flex flex-col gap-2">
                {individualSongs.map((song, idx) => {
                  const isCurrent =
                    currentPlaylistName === "My Songs" &&
                    song.url === currentSong?.url;

                  return (
                    <div
                      key={idx}
                      onClick={() => handleSongClick(song, idx)}
                      className={`grid grid-cols-[50px_1fr_60px] md:grid-cols-[60px_1fr_100px] items-center p-3 md:p-4 rounded-lg md:rounded-xl cursor-pointer transition-all duration-200 group
                        ${isCurrent
                          ? "bg-primary/20 backdrop-blur-xl border border-primary/30 shadow-lg shadow-primary/20"
                          : "hover:bg-gradient-glass backdrop-blur-xl border border-transparent border-white/10 hover:border-white/50 hover:shadow-lg"
                        }`}
                    >
                      <img
                        src={song.cover}
                        alt="cover"
                        className="w-12 h-12 md:w-14 md:h-14 rounded-lg md:rounded-xl object-cover ring-1 ring-white/20 shadow-md"
                        onError={(e) => (e.target.src = MUSIC_NOTE_FALLBACK)}
                      />
                      <div className="truncate ml-2 md:ml-4">
                        <p
                          className={`text-sm md:text-base font-medium truncate ${isCurrent ? "text-primary" : "text-white group-hover:text-primary"
                            } transition-colors`}
                        >
                          {song.title}
                        </p>
                        <p className="text-xs md:text-sm text-white/70 truncate">
                          {song.artist || "Unknown Artist"}
                        </p>
                      </div>
                      <div className="text-xs md:text-sm text-white/70 text-right">
                        {song.duration}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default Home;

