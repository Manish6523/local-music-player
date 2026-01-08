import React, { useEffect, useRef, useMemo } from "react";
import { ChevronLeft, Activity, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Preview = ({ currentSong, audioRef, currentTime, isPlaying, lyrics, isFetching }) => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // 1. Fullscreen mode: only request fullscreen, do not navigate away when exiting
  useEffect(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    // No logic to listen for fullscreenchange anymore.
  }, []);

  const currentIndex = useMemo(() => {
    return lyrics.findLastIndex(l => currentTime >= l.time);
  }, [lyrics, currentTime]);

  // 3. New Visualizer Logic: Brutalist Frequency Bars
  useEffect(() => {
    if (!canvasRef.current || !audioRef?.current) return;

    // Use global context to prevent "source already connected" errors
    if (!window._vCtx) {
      window._vCtx = new (window.AudioContext || window.webkitAudioContext)();
      window._vAnalyzer = window._vCtx.createAnalyser();
      window._vAnalyzer.fftSize = 256;
      window._vSource = window._vCtx.createMediaElementSource(audioRef.current);
      window._vSource.connect(window._vAnalyzer);
      window._vAnalyzer.connect(window._vCtx.destination);
    }

    const analyzer = window._vAnalyzer;
    const dataArray = new Uint8Array(analyzer.frequencyBinCount);
    const ctx = canvasRef.current.getContext("2d");
    let raf;

    const render = () => {
      const w = canvasRef.current.width = window.innerWidth;
      const h = canvasRef.current.height = window.innerHeight;
      analyzer.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, w, h);

      const rootStyle = getComputedStyle(document.documentElement);
      const primaryHsl = rootStyle.getPropertyValue('--primary').trim() || "210 100% 50%";
      const primaryColor = `hsla(${primaryHsl.split(' ').join(',')}, 0.4)`;

      // Draw symmetrical brutalist bars in the background
      const barWidth = w / dataArray.length;

      for (let i = 0; i < dataArray.length; i++) {
        const barHeight = (dataArray[i] / 255) * (h / 2);

        ctx.fillStyle = primaryColor;
        // Top half bars
        ctx.fillRect(i * barWidth, 0, barWidth - 2, barHeight);
        // Bottom half bars
        ctx.fillRect(i * barWidth, h - barHeight, barWidth - 2, barHeight);
      }

      raf = requestAnimationFrame(render);
    };

    if (isPlaying) render();
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, audioRef]);

  if (!currentSong) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background text-white flex flex-col overflow-hidden font-mono">
      {/* Portfolio Style Blurred Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20 blur-[120px] scale-110 pointer-events-none transition-all duration-1000"
        style={{ backgroundImage: `url(${currentSong.cover})` }}
      />
      <div className="absolute inset-0 bg-gradient-glass backdrop-blur-3xl" />

      {/* The Visualizer Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* Header */}
      <nav className="relative z-50 flex justify-between p-6 border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <button
          onClick={() => {
            // document.exitFullscreen();
            navigate("/");
          }}
          className="flex cursor-pointer items-center gap-2 text-[10px] tracking-widest uppercase hover:text-primary transition-all"
        >
          <ChevronLeft size={14} /> [ EXIT_PREVIEW ]
        </button>
        <div className="hidden md:flex items-center gap-4 text-[10px] tracking-[0.3em] opacity-40 font-bold">
          <Activity size={14} className="text-primary" /> VISUALIZER_ACTIVE: TRUE
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center">
        {/* Album Art */}
        <div className="mb-10 relative group">
          <img
            src={currentSong.cover}
            className="w-40 h-40 lg:w-52 lg:h-52 rounded-2xl object-cover shadow-2xl ring-1 ring-white/20 transition-all duration-700"
            alt="Art"
          />
        </div>

        {/* Sliding Lyric Track */}
        <div className="relative h-[450px] w-full max-w-5xl overflow-hidden mask-fade-y">
          <div
            className="absolute w-full transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
            style={{ transform: `translateY(${(currentIndex * -90) + 180}px)` }}
          >
            {lyrics.length > 0 ? lyrics.map((line, i) => {
              const isActive = i === currentIndex;
              return (
                <div key={i} className="h-[90px] flex items-center justify-center">
                  <p className={`text-center transition-all duration-700 px-6 font-bold
                    ${isActive
                      ? "text-3xl md:text-3xl opacity-100 scale-110 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                      : "text-xl md:text-2xl opacity-10 blur-[1.5px] scale-90"}`}
                  >
                    {line.text}
                  </p>
                </div>
              );
            }) : (
              <div className="h-full flex items-center justify-center opacity-20 italic">
                {isFetching ? "Syncing..." : "No Synced Lyrics Found"}
              </div>
            )}
          </div>

          {/* Focal Window */}
          <div className="absolute top-1/2 left-0 w-full h-[110px] -translate-y-1/2 border-y border-white/10 bg-white/5 backdrop-blur-lg -z-10 pointer-events-none">
             <div className="absolute left-0 top-0 w-1.5 h-full bg-primary" />
          </div>
        </div>
      </main>

      <footer className="relative z-50 p-8 flex justify-between items-end border-t border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="flex gap-4 items-center">
          <div className="p-3 bg-primary/20 border border-primary/30 rounded-xl">
            <Zap size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tighter">{currentSong.title}</h2>
            <p className="text-[10px] uppercase tracking-[0.4em] opacity-40">{currentSong.artist}</p>
          </div>
        </div>
      </footer>

      <style>{`
        .mask-fade-y {
          mask-image: linear-gradient(to bottom, transparent 0%, black 35%, black 65%, transparent 100%);
          -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 35%, black 65%, transparent 100%);
        }
      `}</style>
    </div>
  );
};

export default Preview;