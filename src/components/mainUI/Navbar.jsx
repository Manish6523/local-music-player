import { useNavigate, useLocation } from "react-router-dom";
import { Music } from "lucide-react";

const Navbar = ({ onFolderSelect }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <nav
      className={`h-16 md:h-20 px-4 md:px-8 flex items-center justify-between fixed w-full top-0 z-30 transition-all duration-300
        ${isHome ? "bg-transparent" : "bg-gradient-glass backdrop-blur-3xl border-b border-white/10 shadow-lg"}`}
    >
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
          <div className="px-4 py-2 md:px-6 md:py-3 bg-gradient-primary rounded-full font-semibold text-xs md:text-sm shadow-xl shadow-primary/40 hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-105 text-white ring-2 ring-white/20 backdrop-blur-xl">
            + Load Music
          </div>
          <input
            type="file"
            webkitdirectory="true"
            directory="true"
            multiple
            onChange={()=>onFolderSelect()}
            className="hidden"
          />
        </label>
      </div>
    </nav>
  );
};

export default Navbar;

