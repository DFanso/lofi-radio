'use client'

import { Button } from "@/components/ui/button";
import { FaPlay, FaPause, FaVolumeDown, FaVolumeUp, FaHeart, FaStepBackward, FaStepForward, FaVolumeMute } from "react-icons/fa";
import Image from "next/image";
import { useState, useEffect } from "react";

// Radio station interface
export interface RadioStation {
  id: string;
  name: string;
  url: string;
  description: string;
  image: string;
}

interface RadioPlayerProps {
  station: RadioStation | null;
  isPlaying: boolean;
  isLoading?: boolean;
  volume: number;
  onVolumeChange: (volume: number) => void;
  onPlayPause: () => void;
  onNextStation: () => void;
  onPreviousStation: () => void;
}

export function RadioPlayer({ 
  station, 
  isPlaying, 
  isLoading = false,
  volume, 
  onVolumeChange, 
  onPlayPause,
  onNextStation,
  onPreviousStation
}: RadioPlayerProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);
  const [isPrevButtonActive, setIsPrevButtonActive] = useState(false);
  const [isNextButtonActive, setIsNextButtonActive] = useState(false);

  useEffect(() => {
    if (volume > 0) {
      setPreviousVolume(volume);
    }
  }, [volume]);

  const handleMuteToggle = () => {
    if (isMuted) {
      // Unmute - restore previous volume
      onVolumeChange(previousVolume);
      setIsMuted(false);
    } else {
      // Mute - set volume to 0
      setPreviousVolume(volume);
      onVolumeChange(0);
      setIsMuted(true);
    }
  };

  // Choose the appropriate volume icon based on volume level and mute state
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <FaVolumeMute className="w-3 h-3" />;
    } else if (volume < 50) {
      return <FaVolumeDown className="w-3 h-3" />;
    } else {
      return <FaVolumeUp className="w-3 h-3" />;
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
                  src={station.image}
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
                  <div className="text-sm text-muted-foreground truncate max-w-[200px]">{station.description}</div>
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
          
          {/* Volume control */}
          <div className="flex items-center w-full max-w-xs gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground p-0"
              onClick={handleMuteToggle}
            >
              {getVolumeIcon()}
            </Button>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => {
                e.preventDefault();
                const newVolume = parseInt(e.target.value);
                onVolumeChange(newVolume);
                if (newVolume > 0 && isMuted) {
                  setIsMuted(false);
                }
              }}
              className="w-full h-1 bg-accent rounded-lg appearance-none cursor-pointer accent-primary relative
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary
                [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3
                [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary
                [&::-moz-range-thumb]:border-none"
            />
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 ml-2 text-muted-foreground"
            >
              <FaHeart className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 