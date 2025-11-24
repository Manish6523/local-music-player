import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Disc3, AudioLines, Maximize, Minimize } from "lucide-react";
import { useState, useEffect } from "react";

const Navbar = ({ onFolderSelect, onToggleRightPanel, isScrolled }) => {
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
    return () =>
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      // Try to enter fullscreen on the root app element (or fallback to body)
      const el =
        document.getElementById("root") ||
        document.querySelector("#root") ||
        document.body;
      if (el.requestFullscreen) {
        el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      } else if (el.mozRequestFullScreen) {
        el.mozRequestFullScreen();
      } else if (el.msRequestFullscreen) {
        el.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  return (
    <nav
      className={`
        h-16 md:h-20 flex items-center sticky justify-between px-2 top-3 z-30
        transition-all duration-300 rounded-2xl
      // Add blurred glass + border/color when scrolled
      ${
        isScrolled
          ? "bg-gradient-glass backdrop-blur-xl shadow-2xl"
          : ""
      }
      `}

    >
      <div className="flex items-center space-x-2 md:space-x-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center space-x-2 md:space-x-3 group"
        >
          <div className=" rounded-xl md:rounded-2xl bg-gradient-primary">
            {/* <AudioLines size={30} className="md:w-7 md:h-7 text-white animate-pulse" /> */}
            <img src="/logo.svg"  alt="logo" className="md:w-12 w-10" />
          </div>
          <span className="text-xl hidden md:text-2xl font-bold text-white sm:inline group-hover:text-primary transition-colors">
            Golden Wind
          </span>
        </button>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        <label className="relative group cursor-pointer">
          <div
            className="p-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 transition-all duration-300"
            aria-label="Add Folder"
          >
            <Plus size={24} />
          </div>
          <input
            type="file"
            webkitdirectory="true"
            directory="true"
            multiple
            onChange={onFolderSelect}
            className="hidden"
          />
        </label>
        {/* Toggle Fullscreen */}
        <button
          onClick={toggleFullScreen}
          className=" p-2 rounded-lg cursor-pointer bg-white/5 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 transition-all duration-300"
          aria-label="Toggle Fullscreen"
        >
          {isFullScreen ? (
            <Minimize size={24} className="text-white" />
          ) : (
            <Maximize size={24} className="text-white" />
          )}
        </button>

        {/* Hamburger menu for mobile */}
        <button
          onClick={onToggleRightPanel}
          className="lg:hidden p-2 rounded-lg bg-white/5 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 transition-all duration-300"
          aria-label="Toggle player panel"
        >
          <Disc3 size={24} className="text-white animate-spin" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

