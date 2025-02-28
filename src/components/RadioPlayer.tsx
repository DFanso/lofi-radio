'use client'

import { Button } from "@/components/ui/button";
import { FaPlay, FaPause, FaVolumeUp, FaHeart, FaStepBackward, FaStepForward, FaVolumeMute, FaRegHeart } from "react-icons/fa";
import Image from "next/image";
import { useState, useEffect } from "react";
import type { RadioStation } from "@/types/types";

export interface RadioPlayerProps {
  station: RadioStation | null;
  isPlaying: boolean;
  isLoading?: boolean;
  volume: number;
  onVolumeChange: (newVolume: number) => void;
  onPlayPause: () => void;
  onNextStation: () => void;
  onPreviousStation: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export default function RadioPlayer({
  station,
  isPlaying,
  isLoading = false,
  volume,
  onVolumeChange,
  onPlayPause,
  onNextStation,
  onPreviousStation,
  isFavorite,
  onToggleFavorite,
}: RadioPlayerProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);
  const [isPrevButtonActive, setIsPrevButtonActive] = useState(false);
  const [isNextButtonActive, setIsNextButtonActive] = useState(false);

  useEffect(() => {
    if (!isMuted && volume === 0) {
      onVolumeChange(prevVolume || 50);
    }
  }, [isMuted, volume, prevVolume, onVolumeChange]);

  const handleMuteToggle = () => {
    if (!isMuted) {
      setPrevVolume(volume);
      onVolumeChange(0);
    } else {
      onVolumeChange(prevVolume || 50);
    }
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value, 10);
    onVolumeChange(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  // Handle next button with visual feedback
  const handleNextClick = () => {
    if (!station) return;
    
    setIsNextButtonActive(true);
    onNextStation();
    
    // Reset active state after animation time
    setTimeout(() => setIsNextButtonActive(false), 200);
  };

  // Handle previous button with visual feedback
  const handlePrevClick = () => {
    if (!station) return;
    
    setIsPrevButtonActive(true);
    onPreviousStation();
    
    // Reset active state after animation time
    setTimeout(() => setIsPrevButtonActive(false), 200);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t z-50 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4 w-full sm:w-auto">
            {/* Station info with album art (if available) */}
            {station && (
              <div className="hidden sm:block relative h-12 w-12 rounded-md overflow-hidden bg-accent/30">
                <Image 
                  src={station.imgUrl}
                  alt={station.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
            )}
            
            <div className="flex flex-col">
              {station ? (
                <>
                  <div className="font-medium truncate max-w-[200px]">{station.name}</div>
                  <div className="text-sm text-muted-foreground truncate max-w-[200px]">{station.description || "Lofi Radio Station"}</div>
                </>
              ) : (
                <div className="text-muted-foreground">Select a station to play</div>
              )}
            </div>
          </div>
          
          {/* Playback controls */}
          <div className="flex items-center space-x-2">
            <Button 
              variant={isPrevButtonActive ? "default" : "ghost"}
              size="icon"
              className={`h-8 w-8 transition-colors ${isPrevButtonActive ? 'text-primary-foreground' : 'text-muted-foreground'}`}
              disabled={!station}
              onClick={handlePrevClick}
            >
              <FaStepBackward className="w-3 h-3" />
            </Button>
            
            <Button 
              variant="default"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={onPlayPause}
              disabled={!station || isLoading}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
              ) : isPlaying ? (
                <FaPause className="w-4 h-4" />
              ) : (
                <FaPlay className="w-4 h-4 ml-0.5" />
              )}
            </Button>
            
            <Button 
              variant={isNextButtonActive ? "default" : "ghost"}
              size="icon"
              className={`h-8 w-8 transition-colors ${isNextButtonActive ? 'text-primary-foreground' : 'text-muted-foreground'}`}
              disabled={!station}
              onClick={handleNextClick}
            >
              <FaStepForward className="w-3 h-3" />
            </Button>
          </div>
          
          {/* Volume and favorite controls */}
          <div className="flex items-center w-full max-w-xs gap-2">
            {/* Favorite button */}
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 text-muted-foreground p-0 ${
                !station ? "opacity-50 cursor-not-allowed" 
                : isFavorite 
                  ? "text-red-500 hover:text-red-600" 
                  : "text-muted-foreground hover:text-red-500"
              }`}
              onClick={onToggleFavorite}
              disabled={!station}
            >
              {isFavorite ? <FaHeart className="w-3 h-3" /> : <FaRegHeart className="w-3 h-3" />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground p-0"
              onClick={handleMuteToggle}
            >
              {isMuted || volume === 0 ? (
                <FaVolumeMute className="w-3 h-3" />
              ) : (
                <FaVolumeUp className="w-3 h-3" />
              )}
            </Button>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full h-1 bg-accent rounded-lg appearance-none cursor-pointer accent-primary relative
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary
                [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3
                [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary
                [&::-moz-range-thumb]:border-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 