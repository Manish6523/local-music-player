import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Disc3, Maximize, Minimize, Search, X, Terminal, Activity, Eye } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";

// Technical Search Manifest
function SearchBar({ allSongs, playSong, selectPlaylist, playlists }) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [focus, setFocus] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 180);
    return () => clearTimeout(t);
  }, [query]);

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
    if (playSong && playlists?.[playlistName]) {
      const idx = playlists[playlistName].findIndex(s => s.url === song.url);
      if (idx !== -1) playSong(playlists[playlistName], idx);
    }
    setQuery("");
    setFocus(false);
  };

  return (
    <div className="flex-1 flex justify-center px-4 relative font-mono" ref={containerRef}>
      <div className="w-full max-w-[400px] relative">
        <div className="relative flex items-center group">
          <Search size={14} className="absolute left-3 text-primary/50 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocus(true)}
            placeholder="SEARCH_DB..."
            className="w-full bg-white/5 border border-white/10 px-10 py-2 text-[0.8rem] tracking-widest uppercase focus:border-primary/50 text-white placeholder-white/20 outline-none transition-all shadow-inner"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 text-white/30 hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Technical Dropdown */}
        {focus && (debounced.trim()) && (
          <div className="absolute left-0 right-0 mt-2 z-[100] bg-black border border-white/10 shadow-[8px_8px_0px_rgba(0,0,0,0.5)] backdrop-blur-3xl overflow-hidden">
            <div className="bg-white/5 px-3 py-1 border-b border-white/10 flex justify-between items-center">
              <span className="text-[9px] uppercase tracking-[0.3em] text-white/40">Query_Results</span>
              <span className="text-[9px] text-primary font-bold">FOUND: {results.length}</span>
            </div>
            {results.length > 0 ? (
              results.map((song, idx) => (
                <div
                  key={idx}
                  onClick={() => handleClick(song)}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-primary/10 border-b border-white/5 last:border-none cursor-pointer group transition-all"
                >
                  <img src={song.cover} className="w-8 h-8 object-cover grayscale-0group-hover:grayscale-0 border border-white/10" alt="" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-white uppercase truncate">{song.title}</p>
                    <p className="text-[8px] text-white/40 uppercase truncate tracking-tighter">{song.artist}</p>
                  </div>
                  <span className="text-[9px] text-primary/40 font-bold tracking-tighter">{song.duration}</span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-[10px] uppercase tracking-widest text-white/20">Null_Pointer_Exception: No_Results</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const Navbar = ({ onFolderSelect, onToggleRightPanel, isScrolled, allSongs, playSong, selectPlaylist, playlists }) => {
  const navigate = useNavigate();
  const [isFullScreen, setIsFullscreen] = useState(!!(typeof document !== "undefined" && document.fullscreenElement));

  useEffect(() => {
    const handle = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handle);
    return () => document.removeEventListener("fullscreenchange", handle);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      const el = document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  };

  return (
    <nav className={`h-16 flex items-center sticky top-0 z-50 md:px-6 transition-all border-b border-transparent font-mono ${isScrolled ? "bg-black/60 backdrop-blur-xl border-white/5" : ""}`}>
      
      {/* System Brand */}
      <div className="flex items-center gap-4 shrink-0">
        <button onClick={() => navigate("/")} className="group relative">
           <div className="absolute -inset-2 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
           <img src="/logo.svg" alt="logo" className="w-9 grayscale-0group-hover:grayscale-0 transition-all" />
        </button>
        <div className="hidden lg:block border-l border-white/10 pl-4">
           <p className="text-[10px] font-bold tracking-[0.4em] text-white uppercase">Golden_Wind</p>
           <p className="text-[8px] tracking-[0.2em] text-white/30 uppercase mt-0.5">Capability_Manifest_v3.0</p>
        </div>
      </div>

      <SearchBar allSongs={allSongs} playSong={playSong} selectPlaylist={selectPlaylist} playlists={playlists} />

      {/* System Actions */}
      <div className="flex items-center gap-2">
        

        <label className="p-2 cursor-pointer bg-white/5 border border-white/10 hover:border-primary/50 text-white/60 hover:text-white transition-all">
          <Plus size={18} />
          <input type="file" webkitdirectory="true" directory="true" multiple onChange={onFolderSelect} className="hidden" />
        </label>

        <button onClick={toggleFullScreen} className="p-2 cursor-pointer bg-white/5 border border-white/10 hover:border-primary/50 text-white/60 hover:text-white transition-all">
          {isFullScreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>

        <button
          onClick={() => navigate('/preview')}
          className="p-2 cursor-pointer bg-white/5 border border-white/10 hover:border-primary/50 text-white/60 hover:text-white transition-all"
        >
          <Eye size={18} />
        </button>

        <button onClick={onToggleRightPanel} className="lg:hidden p-2 p-2 cursor-pointer bg-white/5 border border-white/10 hover:border-primary/50 text-white/60 hover:text-white transition-all">
          <Disc3 size={18} className="animate-spin-slow" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;