'use client'

import { Button } from "@/components/ui/button";
import { FaPlay, FaPause, FaVolumeUp, FaHeart, FaStepBackward, FaStepForward, FaVolumeMute, FaRegHeart, FaExpand } from "react-icons/fa";
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
  onOpenFullScreen: () => void;
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
  onOpenFullScreen
}: RadioPlayerProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);

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

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t z-50 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Station info */}
          <div className="flex-shrink-0 mr-6 w-full max-w-[180px]">
            {station ? (
              <div className="flex items-center">
                <div 
                  className="h-12 w-12 mr-3 rounded-md bg-accent flex-shrink-0 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={onOpenFullScreen}
                >
                  {station.imgUrl ? (
                    <Image
                      src={station.imgUrl}
                      alt={station.name}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-accent flex items-center justify-center">
                      <span className="text-xs text-accent-foreground">LOFI</span>
                    </div>
                  )}
                </div>
                <div className="truncate">
                  <h3 className="font-medium text-sm truncate">{station.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {station.description || "Lofi Radio Station"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center h-12">
                <span className="text-muted-foreground text-sm">No station selected</span>
              </div>
            )}
          </div>
          
          {/* Player controls */}
          <div className="flex items-center">
            <div className="flex items-center gap-3">
              {/* Previous button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground p-0"
                onClick={onPreviousStation}
                disabled={!station}
              >
                <FaStepBackward className="w-3 h-3" />
              </Button>

              {/* Play/Pause button */}
              <Button
                variant="outline"
                size="icon"
                className={`h-10 w-10 rounded-full ${isPlaying ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`}
                onClick={onPlayPause}
                disabled={!station}
              >
                {isLoading ? (
                  <div className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                ) : isPlaying ? (
                  <FaPause className="w-3 h-3" />
                ) : (
                  <FaPlay className="w-3 h-3 ml-0.5" />
                )}
              </Button>

              {/* Next button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground p-0"
                onClick={onNextStation}
                disabled={!station}
              >
                <FaStepForward className="w-3 h-3" />
              </Button>
              
              {/* Mobile full screen button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground p-0 md:hidden ml-2"
                onClick={onOpenFullScreen}
                disabled={!station}
                title="Open full screen player"
              >
                <FaExpand className="w-3 h-3" />
              </Button>
              
              {/* Mobile favorite button */}
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 text-muted-foreground p-0 md:hidden ml-1 ${
                  isFavorite ? "text-red-500" : ""
                }`}
                onClick={onToggleFavorite}
                disabled={!station}
              >
                {isFavorite ? <FaHeart className="w-3 h-3" /> : <FaRegHeart className="w-3 h-3" />}
              </Button>
            </div>
          </div>
          
          {/* Volume and favorite controls */}
          <div className="hidden md:flex items-center w-full max-w-xs gap-2">
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
                [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full 
                [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-none"
            />
            
            {/* Desktop favorite button */}
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 p-0 ml-2 ${
                isFavorite ? "text-red-500" : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={onToggleFavorite}
              disabled={!station}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorite ? <FaHeart className="w-3 h-3" /> : <FaRegHeart className="w-3 h-3" />}
            </Button>
            
            {/* Desktop full screen button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground p-0 hover:text-foreground ml-1"
              onClick={onOpenFullScreen}
              disabled={!station}
              title="Open full screen player"
            >
              <FaExpand className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 