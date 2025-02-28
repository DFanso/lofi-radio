'use client'

import { useState } from "react";
import { RadioStation } from "./RadioPlayer";
import Image from "next/image";
import { FaMusic, FaExclamationTriangle, FaPlay, FaPause } from "react-icons/fa";

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
      className={`rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer group
        ${isActive 
          ? "ring-2 ring-primary border-primary/20 bg-card/50" 
          : "bg-card hover:bg-card/80 border-muted"}
        ${hasError ? "opacity-70" : ""}`}
      onClick={onClick}
    >
      <div className="relative aspect-square">
        {/* Glass morphism overlay for active state */}
        {isActive && (
          <div className="absolute inset-0 bg-background/20 backdrop-blur-[2px] z-5" />
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
        
        {/* Background image */}
        <div className="w-full h-full bg-accent/30 flex items-center justify-center relative overflow-hidden">
          {!imageError ? (
            <Image 
              src={station.image}
              alt={station.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FaMusic className="w-16 h-16 text-primary-foreground/30" />
            </div>
          )}
        </div>
        
        {/* Status indicators */}
        <div className="absolute top-3 right-3 z-20">
          {/* Error indicator */}
          {hasError && (
            <div className="bg-destructive/90 text-destructive-foreground rounded-full p-1.5 shadow-md">
              <FaExclamationTriangle className="w-3 h-3" />
            </div>
          )}
        </div>
        
        {/* Play/Loading indicator */}
        <div className="absolute bottom-3 right-3 z-20">
          {isActive && isLoading && (
            <div className="w-10 h-10 rounded-full bg-primary shadow-lg flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {isActive && isPlaying && !isLoading && (
            <div className="w-10 h-10 rounded-full bg-primary shadow-lg flex items-center justify-center">
              <div className="flex space-x-0.5">
                <div className="w-1 h-3 bg-white rounded-sm animate-sound-wave"></div>
                <div className="w-1 h-5 bg-white rounded-sm animate-sound-wave animation-delay-200"></div>
                <div className="w-1 h-3 bg-white rounded-sm animate-sound-wave animation-delay-500"></div>
              </div>
            </div>
          )}
        </div>
        
        {/* Play button overlay on hover */}
        <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-105">
            {isActive && isPlaying ? (
              <FaPause className="w-6 h-6 text-white" />
            ) : (
              <FaPlay className="w-6 h-6 text-white ml-1" />
            )}
          </div>
        </div>
      </div>

      {/* Station info */}
      <div className="p-4">
        <h3 className="font-medium text-lg flex items-center">
          {station.name}
          {isActive && (
            <span className="ml-2 text-xs uppercase tracking-wider text-primary font-semibold">Live</span>
          )}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">{station.description}</p>
      </div>
    </div>
  );
} 