import { useNavigate, useLocation } from "react-router-dom";
import { Music, Menu, Plus } from "lucide-react";

const Navbar = ({ onFolderSelect, onToggleRightPanel }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <nav
      className={`h-16 md:h-20 px-4 md:px-8 flex items-center justify-between fixed w-full top-0 z-30 transition-all duration-300`}   >
      <div className="flex items-center space-x-2 md:space-x-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center space-x-2 md:space-x-3 group"
        >
          <div className="p-1.5 md:p-2 rounded-xl md:rounded-2xl bg-gradient-primary">
            <Music size={20} className="md:w-7 md:h-7 text-white" />
          </div>
          <span className="text-xl md:text-2xl font-bold text-white hidden sm:inline group-hover:text-primary transition-colors">
            Vibes
          </span>
        </button>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        <label className="relative group cursor-pointer">
          <div className="lg:hidden p-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 transition-all duration-300"
          aria-label="Toggle player panel">
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
        
        {/* Hamburger menu for mobile */}
        <button
          onClick={onToggleRightPanel}
          className="lg:hidden p-2 rounded-lg bg-white/5 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 transition-all duration-300"
          aria-label="Toggle player panel"
        >
          <Menu size={24} className="text-white" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

