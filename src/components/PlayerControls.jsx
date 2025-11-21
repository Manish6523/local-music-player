import React, { useState, useCallback } from 'react';
import { 
    Play, 
    Pause, 
    SkipBack, 
    SkipForward, 
    Volume2, // High volume icon
    VolumeX, // Mute icon
    Repeat, 
    Shuffle,
    Heart
} from 'lucide-react';

// Helper for formatting seconds into M:SS
const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

const PlayerControls = ({ 
    currentSong, 
    isPlaying, 
    duration, 
    currentTime, 
    onPlayPause, 
    onPrev, 
    onNext, 
    onSeek,
    audioRef // Used here for volume management
}) => {
    // Local state for UI controls
    const [volume, setVolume] = useState(0.7);
    const [isMuted, setIsMuted] = useState(false);

    // Placeholder data if no song is loaded
    const song = currentSong || { 
        title: "No Song Selected", 
        artist: "Ready to Play", 
        cover: "https://placehold.co/50x50/333333/ffffff?text=♫" 
    };

    // Calculate progress percentage for the bar
    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
    
    // --- START: Volume Handler for standard range input ---
    const handleVolumeChange = useCallback((e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        
        // Update the audio element directly
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
            setIsMuted(newVolume === 0);
        }
    }, [audioRef]);
    // --- END: Volume Handler for standard range input ---


    // Handle seek on the progress bar (Music Position)
    const handleSeek = useCallback((e) => {
        if (duration > 0 && onSeek && e.target.offsetWidth) {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const newTime = (clickX / rect.width) * duration;
            onSeek(newTime);
        }
    }, [duration, onSeek]);
    
    // Handle volume icon click (mute/unmute)
    const toggleMute = useCallback(() => {
        if (audioRef.current) {
            if (isMuted || audioRef.current.volume === 0) {
                // Unmute: restore to previous volume or 0.5
                audioRef.current.volume = volume > 0 ? volume : 0.5;
                setVolume(volume > 0 ? volume : 0.5);
                setIsMuted(false);
            } else {
                // Mute
                audioRef.current.volume = 0;
                setIsMuted(true);
            }
        }
    }, [isMuted, volume, audioRef]);


    // Determine if the component should be rendered
    if (!currentSong) {
        // Optionally render a minimal placeholder bar if no song is loaded
        return (
            <footer className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm h-16 border-t border-gray-800 flex items-center justify-center text-gray-400 z-50">
                <p className="text-sm">Select a playlist to start listening.</p>
            </footer>
        );
    }


    return (
        <aside className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md h-20 border-t border-gray-800 text-white z-50 shadow-2xl">
            {/* Custom CSS for Range Input Styling (Track and Thumb) */}
            <style jsx="true">{`
                /* Base style for the slider track */
                .volume-slider {
                    background: transparent;
                }

                /* Webkit (Chrome/Safari) Track */
                .volume-slider::-webkit-slider-runnable-track {
                    width: 100%;
                    height: 4px;
                    background: #374151; /* gray-700 */
                    border-radius: 3px;
                }
                
                /* Webkit (Chrome/Safari) Thumb */
                .volume-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    margin-top: -6px; /* Center the thumb vertically */
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #ef4444; /* red-500 */
                    cursor: pointer;
                    box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.5);
                    transition: background 0.15s ease-in-out;
                }
                
                /* Firefox Track */
                .volume-slider::-moz-range-track {
                    width: 100%;
                    height: 4px;
                    background: #374151; /* gray-700 */
                    border-radius: 3px;
                }

                /* Firefox Thumb */
                .volume-slider::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #ef4444; /* red-500 */
                    cursor: pointer;
                    box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.5);
                    border: none;
                }

            `}</style>

            
            <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6">
                
                {/* 1. Left Section: Song Info */}
                <div className="flex items-center w-1/4 min-w-[200px]">
                    <img 
                        src={song.cover} 
                        alt="Cover" 
                        className="w-16 h-16 object-cover rounded-md shadow-lg mr-4" 
                        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/50x50/333333/ffffff?text=♫"; }}
                    />
                    <div className="truncate">
                        <p className="text-sm font-semibold truncate hover:text-red-400 transition cursor-pointer">{song.title}</p>
                        <p className="text-xs text-gray-400 truncate hover:text-gray-300 transition cursor-pointer">{song.artist}</p>
                    </div>
                    <Heart size={18} className="ml-4 text-gray-500 hover:text-red-500 cursor-pointer transition" fill='currentColor'/>
                </div>

                {/* 2. Center Section: Main Controls and Progress */}
                <div className="flex flex-col items-center w-1/2 max-w-lg">
                    
                    {/* Control Buttons */}
                    <div className="flex items-center space-x-6 mb-1">
                        <Shuffle size={18} className="text-gray-400 hover:text-white cursor-pointer transition"/>
                        
                        <button onClick={onPrev} className="text-white hover:text-red-400 transition disabled:text-gray-600" disabled={!onPrev}>
                            <SkipBack size={24} fill="currentColor"/>
                        </button>

                        <button 
                            onClick={onPlayPause} 
                            className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition shadow-lg"
                        >
                            {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
                        </button>
                        
                        <button onClick={onNext} className="text-white hover:text-red-400 transition disabled:text-gray-600" disabled={!onNext}>
                            <SkipForward size={24} fill="currentColor"/>
                        </button>
                        
                        <Repeat size={18} className="text-gray-400 hover:text-white cursor-pointer transition"/>
                    </div>

                    {/* Progress Bar (Music Position) */}
                    <div className="flex items-center w-full space-x-2 text-xs">
                        <span className="text-gray-400">{formatTime(currentTime)}</span>
                        
                        {/* Progress Bar Container */}
                        <div 
                            className="flex-grow h-1 bg-gray-700 rounded-full cursor-pointer group"
                            onClick={handleSeek}
                        >
                            {/* Filled Progress */}
                            <div 
                                className="h-full bg-red-500 rounded-full relative" 
                                style={{ width: `${progressPercent}%` }}
                            >
                                {/* Drag Handle */}
                                <div className="absolute -right-1.5 -top-1.5 w-4 h-4 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                        </div>

                        <span className="text-gray-400">{formatTime(duration)}</span>
                    </div>

                </div>

                {/* 3. Right Section: Volume and Utilities */}
                <div className="flex items-center justify-end w-1/4 space-x-4">
                    <button onClick={toggleMute} className="text-gray-400 hover:text-white transition">
                        {isMuted || audioRef.current?.volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    
                    {/* Volume Slider (HTML Range Input restored and styled) */}
                    <input 
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        // Use the custom class defined in the <style> tag
                        className="volume-slider w-24 h-4 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            </div>
        </aside>
    );
}

export default PlayerControls;