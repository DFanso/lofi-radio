'use client'

import { useState } from "react";
import { RadioStation } from "./RadioPlayer";
import Image from "next/image";
import { FaMusic, FaExclamationTriangle } from "react-icons/fa";

interface RadioStationCardProps {
  station: RadioStation;
  isActive: boolean;
  isPlaying: boolean;
  onClick: () => void;
  hasError?: boolean;
  isLoading?: boolean;
}

export function RadioStationCard({ 
  station, 
  isActive, 
  isPlaying, 
  onClick,
  hasError = false,
  isLoading = false
}: RadioStationCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div 
      className={`rounded-lg overflow-hidden border transition-all hover:shadow-md cursor-pointer group ${
        isActive && isPlaying 
          ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
          : ""
      } ${hasError ? "opacity-70" : ""}`}
      onClick={onClick}
    >
      <div className="relative aspect-square">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
        
        {/* Background color/pattern */}
        <div className="w-full h-full bg-accent/30 flex items-center justify-center relative overflow-hidden">
          {/* Show station image or fallback */}
          {!imageError ? (
            <Image 
              src={station.image}
              alt={station.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FaMusic className="w-16 h-16 text-primary-foreground/30" />
            </div>
          )}
        </div>
        
        {/* Play indicator */}
        {isActive && isPlaying && !isLoading && (
          <div className="absolute bottom-3 right-3 z-20 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg animate-pulse-slow">
            <div className="w-3 h-3 bg-primary-foreground rounded-full" />
          </div>
        )}
        
        {/* Loading indicator */}
        {isActive && isLoading && (
          <div className="absolute bottom-3 right-3 z-20 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {/* Play button overlay on hover */}
        <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-14 h-14 rounded-full bg-primary/80 flex items-center justify-center shadow-lg">
            {isActive && isPlaying ? (
              <FaMusic className="w-6 h-6 text-primary-foreground animate-pulse" />
            ) : (
              <FaMusic className="w-6 h-6 text-primary-foreground" />
            )}
          </div>
        </div>
      </div>

      {/* Station info */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-lg">{station.name}</h3>
          {hasError && (
            <FaExclamationTriangle className="text-amber-500 w-4 h-4" />
          )}
        </div>
        <p className="text-sm text-muted-foreground">{station.description}</p>
      </div>
    </div>
  );
} 