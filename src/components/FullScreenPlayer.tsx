'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  FaPlay, 
  FaPause, 
  FaStepForward, 
  FaStepBackward, 
  FaVolumeUp, 
  FaVolumeMute, 
  FaHeart, 
  FaRegHeart,
  FaMusic,
  FaTimes
} from 'react-icons/fa';
import type { RadioStation } from "@/types/types";

interface FullScreenPlayerProps {
  station: RadioStation | null;
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
  onVolumeChange: (newVolume: number) => void;
  onPlayPause: () => void;
  onNextStation: () => void;
  onPreviousStation: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClose: () => void;
}

export default function FullScreenPlayer({
  station,
  isPlaying,
  isLoading,
  volume,
  onVolumeChange,
  onPlayPause,
  onNextStation,
  onPreviousStation,
  isFavorite,
  onToggleFavorite,
  onClose
}: FullScreenPlayerProps) {
  const [imageError, setImageError] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);
  const [bgOpacity, setBgOpacity] = useState(0);
  
  // Reset image error and animate bg when station changes
  useEffect(() => {
    setImageError(false);
    setBgOpacity(0);
    const timer = setTimeout(() => {
      setBgOpacity(0.7);
    }, 200);
    return () => clearTimeout(timer);
  }, [station]);

  // Handle mute toggle
  const handleMuteToggle = () => {
    if (!isMuted) {
      setPrevVolume(volume);
      onVolumeChange(0);
    } else {
      onVolumeChange(prevVolume || 50);
    }
    setIsMuted(!isMuted);
  };

  // Handle volume change from slider
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value, 10);
    onVolumeChange(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  if (!station) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-300 overflow-hidden">
      {/* Dynamic background */}
      {!imageError && station.imgUrl && (
        <>
          <div 
            style={{ opacity: bgOpacity }}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out z-0"
          >
            <Image
              src={station.imgUrl}
              alt=""
              fill
              className="object-cover blur-3xl scale-110"
              quality={20}
              priority={false}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/80 to-background/95" />
          </div>
          
          {/* Animated particles for visual effect */}
          <div className="absolute inset-0 z-0 opacity-30">
            {isPlaying && (
              <>
                <div className="absolute w-4 h-4 rounded-full bg-primary/20 top-1/4 left-1/4 animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute w-6 h-6 rounded-full bg-primary/10 top-3/4 left-1/3 animate-pulse" style={{ animationDuration: '7s' }} />
                <div className="absolute w-3 h-3 rounded-full bg-primary/20 top-2/3 right-1/4 animate-pulse" style={{ animationDuration: '5s' }} />
                <div className="absolute w-5 h-5 rounded-full bg-primary/10 top-1/3 right-1/3 animate-pulse" style={{ animationDuration: '6s' }} />
              </>
            )}
          </div>
        </>
      )}

      {/* Close button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-3 text-foreground/70 hover:text-foreground rounded-full hover:bg-foreground/10 transition-colors"
        aria-label="Close full screen player"
      >
        <FaTimes className="w-6 h-6" />
      </button>
      
      <div className="flex flex-col items-center justify-center flex-grow p-6 text-center relative z-10">
        {/* Station artwork */}
        <div className="relative w-full max-w-lg aspect-square mb-8 rounded-2xl overflow-hidden shadow-2xl">
          {!imageError ? (
            <Image
              src={station.imgUrl}
              alt={station.name}
              fill
              sizes="(max-width: 768px) 90vw, 500px"
              className="object-cover"
              onError={() => setImageError(true)}
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/30 to-accent/30">
              <FaMusic className="w-28 h-28 text-primary/50" />
            </div>
          )}

          {/* Favorite button overlaid on artwork */}
          <button
            onClick={onToggleFavorite}
            className={`absolute top-4 right-4 p-3 rounded-full ${
              isFavorite ? 'text-red-500 bg-black/20' : 'text-white/70 bg-black/30 hover:text-red-500'
            } transition-colors backdrop-blur-sm`}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorite ? <FaHeart className="w-6 h-6" /> : <FaRegHeart className="w-6 h-6" />}
          </button>
        </div>

        {/* Station info */}
        <div className="mb-8 w-full max-w-lg px-4">
          <h2 className="text-3xl font-bold mb-2 line-clamp-2">{station.name}</h2>
          <p className="text-lg text-muted-foreground mb-2 line-clamp-2">
            {station.description || "Lofi Radio Station"}
          </p>
          {isPlaying && (
            <div className="flex justify-center items-center mt-4">
              <span className="text-sm font-medium text-primary bg-primary/10 px-4 py-1 rounded-full flex items-center">
                <span className="mr-2">LIVE</span>
                <div className="flex items-center space-x-1">
                  <span className="w-1 h-3 bg-primary rounded-full animate-sound-wave"></span>
                  <span className="w-1 h-3 bg-primary rounded-full animate-sound-wave animation-delay-200"></span>
                  <span className="w-1 h-3 bg-primary rounded-full animate-sound-wave animation-delay-500"></span>
                </div>
              </span>
            </div>
          )}
        </div>

        {/* Playback controls */}
        <div className="w-full max-w-lg px-4 mb-8">
          <div className="flex items-center justify-center space-x-8">
            <button
              className="text-foreground/70 hover:text-foreground transition-colors p-3"
              onClick={onPreviousStation}
              aria-label="Previous station"
            >
              <FaStepBackward className="w-8 h-8" />
            </button>

            <button
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-6 transition-all hover:scale-105"
              onClick={onPlayPause}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isLoading ? (
                <div className="w-8 h-8 border-4 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <FaPause className="w-8 h-8" />
              ) : (
                <FaPlay className="w-8 h-8 ml-1" />
              )}
            </button>

            <button
              className="text-foreground/70 hover:text-foreground transition-colors p-3"
              onClick={onNextStation}
              aria-label="Next station"
            >
              <FaStepForward className="w-8 h-8" />
            </button>
          </div>
        </div>

        {/* Volume control */}
        <div className="w-full max-w-lg px-4 hidden sm:flex items-center justify-center space-x-4">
          <button
            onClick={handleMuteToggle}
            className="text-foreground/70 hover:text-foreground transition-colors"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted || volume === 0 ? (
              <FaVolumeMute className="w-5 h-5" />
            ) : (
              <FaVolumeUp className="w-5 h-5" />
            )}
          </button>
          
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full max-w-sm h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            aria-label="Volume control"
          />
          
          <span className="text-sm text-muted-foreground w-8 text-center">
            {volume}%
          </span>
        </div>
      </div>
    </div>
  );
} 