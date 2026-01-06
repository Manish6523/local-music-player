import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Disc3, Maximize, Minimize, Search, X } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";

// Improved, cleaner SearchBar
function SearchBar({ allSongs, playSong, selectPlaylist, playlists, navigate, location }) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [focus, setFocus] = useState(false);
  const containerRef = useRef(null);

  // Debounce user input
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 180);
    return () => clearTimeout(t);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!focus) return;
    const handle = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setFocus(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [focus]);

  const results = useMemo(() => {
    if (!debounced.trim() || !allSongs?.length) return [];
    const q = debounced.toLowerCase().trim();
    return allSongs.filter(song =>
      song.title?.toLowerCase().includes(q) ||
      song.artist?.toLowerCase().includes(q)
    ).slice(0, 7);
  }, [debounced, allSongs]);

  const handleClick = song => {
    let playlistName = song.album || "My Songs";
    if (!playlists?.[playlistName]) playlistName = "My Songs";
    selectPlaylist?.(playlistName);
    if (playSong && playlists && playlists[playlistName]) {
      const idx = playlists[playlistName].findIndex(s => s.url === song.url);
      if (idx !== -1) playSong(playlists[playlistName], idx);
    }
    setQuery("");
    setDebounced("");
    setFocus(false);
  };

  return (
    <div
      className="flex-1 min-w-0 flex justify-center px-1 relative"
      ref={containerRef}
      style={{ zIndex: 50 }}
    >
      <div className="w-full max-w-[200px] sm:max-w-[290px] md:max-w-[400px]">
        <div className="relative flex items-center w-full">
          <span className="absolute left-2 z-10 top-1/2 -translate-y-1/2 text-white/40">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocus(true)}
            placeholder="Search music..."
            className="w-full bg-white/10 backdrop-blur-md border border-white/10 rounded-xl px-8 py-1.5 text-[0.93rem] focus:ring-2 focus:ring-primary/30 text-white placeholder-white/40 outline-none transition-all duration-150 min-w-0 shadow-sm"
            style={{ minWidth: 0 }}
            aria-label="Search music"
            autoComplete="off"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setDebounced(""); setFocus(false); }}
              className="absolute right-1 cursor-pointer top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition"
              tabIndex={-1}
              aria-label="Clear"
              type="button"
            >
              <X size={17} />
            </button>
          )}
        </div>
        {/* Dropdown */}
        {focus && (results.length > 0 || (debounced.trim() && results.length === 0)) && (
          <div className="absolute left-0 right-0 mt-3 top-[120%] z-40 bg-gradient-glass backdrop-blur-xl rounded-xl border border-white/10 shadow-xl max-h-[16rem] overflow-y-auto custom-scrollbar p-1.5">
            {results.length > 0 ? (
              results.map((song, idx) => (
                <div
                  key={idx}
                  onClick={() => handleClick(song)}
                  tabIndex={0}
                  className="flex items-center gap-3 px-2 py-2 hover:bg-white/10 rounded-lg cursor-pointer transition"
                >
                  <img
                    src={song.cover}
                    alt={song.title}
                    className="w-8 h-8 object-cover rounded shadow-sm border border-white/10 bg-white/10 shrink-0"
                    onError={e => e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23999'%3E%3Cpath d='M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z'/%3E%3C/svg%3E"}
                  />
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-white truncate">{song.title}</span>
                    <span className="block text-[0.7rem] text-white/60 truncate">{song.artist || "Unknown Artist"}</span>
                  </div>
                  <span className="ml-1 text-[0.74rem] text-white/40">{song.duration}</span>
                </div>
              ))
            ) : (
              <div className="px-4 py-5 text-center text-xs text-white/70">No songs found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const Navbar = ({ onFolderSelect, onToggleRightPanel, isScrolled, allSongs, playSong, selectPlaylist, playlists }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isFullScreen, setIsFullscreen] = useState(
    !!(typeof document !== "undefined" && document.fullscreenElement)
  );

  // Listen for fullscreen change
  useEffect(() => {
    function handleFullScreenChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullScreenChange);
  }, []);

  // Fullscreen handler
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      const el = document.getElementById("root") || document.querySelector("#root") || document.body;
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
      else if (el.msRequestFullscreen) el.msRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
    }
  };

  return (
    <nav
      className={`
        h-14 md:h-16 flex items-center sticky justify-between  top-2 z-30
        transition-all duration-300 rounded-2xl
        ${isScrolled ? "bg-gradient-glass backdrop-blur-xl shadow-xl" : ""}
      `}
      style={{ minHeight: "52px" }}
    >
      {/* Left: Logo */}
      <div className="flex items-center space-x-2 md:space-x-3 flex-shrink-0">
        <button
          onClick={() => navigate("/")}
          className="flex items-center space-x-2 md:space-x-3 group focus:outline-none"
          aria-label="Home"
        >
          <div className="rounded-xl md:rounded-2xl bg-gradient-primary flex items-center justify-center p-1.5 md:p-2">
            <img src="/logo.svg" alt="logo" className="md:w-10 w-8" draggable="false" />
          </div>
          <span className="text-lg hidden md:inline font-bold text-white group-hover:text-primary transition-colors tracking-wide drop-shadow-sm">
            Golden Wind
          </span>
        </button>
      </div>

      {/* Center: Responsive SearchBar */}
      <SearchBar
        allSongs={allSongs}
        playSong={playSong}
        selectPlaylist={selectPlaylist}
        playlists={playlists}
        navigate={navigate}
        location={location}
      />

      {/* Right: Controls */}
      <div className="flex items-center gap-1 sm:gap-2">
        <label
          className="relative group cursor-pointer"
          tabIndex={0}
          aria-label="Add Folder"
        >
          <div
            className="p-1.5 md:p-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white hover:bg-white/15 transition-all duration-200 shadow-sm"
          >
            <Plus size={21} />
          </div>
          <input
            type="file"
            webkitdirectory="true"
            directory="true"
            multiple
            onChange={onFolderSelect}
            className="hidden"
            tabIndex={-1}
            aria-label="Choose Folder"
          />
        </label>
        {/* Fullscreen button */}
        <button
          onClick={toggleFullScreen}
          className="p-1.5 md:p-2 rounded-lg cursor-pointer bg-white/5 backdrop-blur-xl border border-white/10 text-white hover:bg-white/15 transition-all duration-200 shadow-sm"
          aria-label="Toggle Fullscreen"
        >
          {isFullScreen ? (
            <Minimize size={21} className="text-white" />
          ) : (
            <Maximize size={21} className="text-white" />
          )}
        </button>
        {/* Mobile: Right panel hamburger */}
        <button
          onClick={onToggleRightPanel}
          className="lg:hidden p-1.5 md:p-2 rounded-lg bg-white/5 backdrop-blur-xl border border-white/10 text-white hover:bg-white/15 transition-all duration-200 shadow-sm flex items-center"
          aria-label="Toggle player panel"
        >
          <Disc3 size={21} className="text-white animate-spin-slow" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
