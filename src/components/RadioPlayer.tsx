'use client'

import { Button } from "@/components/ui/button";
import { FaPlay, FaPause, FaVolumeDown, FaVolumeUp, FaHeart, FaStepBackward, FaStepForward } from "react-icons/fa";

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
  volume: number;
  onVolumeChange: (volume: number) => void;
  onPlayPause: () => void;
}

export function RadioPlayer({ 
  station, 
  isPlaying, 
  volume, 
  onVolumeChange, 
  onPlayPause 
}: RadioPlayerProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4 w-full sm:w-auto">
            {/* Station info with album art (if available) */}
            {station && (
              <div className="hidden sm:block relative h-12 w-12 rounded-md overflow-hidden bg-accent/30">
                {station.image && (
                  <div className="w-full h-full">
                    {/* This would be a real image in production */}
                    <div className="absolute inset-0 flex items-center justify-center text-2xl">
                      🎵
                    </div>
                  </div>
                )}
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
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              disabled={!station}
            >
              <FaStepBackward className="w-3 h-3" />
            </Button>
            
            <Button 
              variant="default"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={onPlayPause}
              disabled={!station}
            >
              {isPlaying ? (
                <FaPause className="w-4 h-4" />
              ) : (
                <FaPlay className="w-4 h-4 ml-0.5" />
              )}
            </Button>
            
            <Button 
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              disabled={!station}
            >
              <FaStepForward className="w-3 h-3" />
            </Button>
          </div>
          
          {/* Volume control */}
          <div className="flex items-center w-full max-w-xs gap-2">
            <FaVolumeDown className="w-3 h-3 text-muted-foreground" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => onVolumeChange(parseInt(e.target.value))}
              className="w-full h-2 bg-accent rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <FaVolumeUp className="w-3 h-3 text-muted-foreground" />
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 ml-2 text-muted-foreground"
            >
              <FaHeart className="w-3 h-3" />
            </Button>
          </div>
        </div>
        
        {/* Progress bar - visual only for now */}
        <div className="w-full h-1 bg-secondary mt-3">
          <div 
            className="h-full bg-primary rounded-r-full"
            style={{ width: isPlaying ? '45%' : '0%', transition: 'width 1s linear' }}
          ></div>
        </div>
      </div>
    </div>
  );
} 