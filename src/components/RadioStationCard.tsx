'use client'

import React, { useState } from "react";
import Image from "next/image";
import { FaMusic, FaPlay, FaPause, FaHeart } from "react-icons/fa";
import { IoWarningOutline } from "react-icons/io5";
import type { RadioStation } from "../types/types";

interface RadioStationCardProps {
  station: RadioStation;
  isActive: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  hasError: boolean;
  isFavorite: boolean;
  onClick: () => void;
}

export default function RadioStationCard({
  station,
  isActive,
  isPlaying,
  isLoading,
  hasError,
  isFavorite,
  onClick,
}: RadioStationCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Derive a subtle background color from the station name
  const getStationColor = (name: string) => {
    // Simple hash function to generate a hue from the station name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Convert to a hue value (0-360)
    const hue = Math.abs(hash % 360);
    
    // Return HSL color with low saturation and high lightness for subtlety
    return `hsl(${hue}, 70%, 92%)`;
  };

  const stationColor = getStationColor(station.name);

  return (
    <div
      className={`relative overflow-hidden rounded-xl transition-all duration-300 shadow-md hover:shadow-lg scale-on-hover cursor-pointer ${
        isActive ? "ring-2 ring-primary" : "hover:ring-1 hover:ring-primary/50"
      }`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Mobile layout - horizontal card for smallest screens */}
      <div className="block sm:hidden flex flex-row h-24">
        {/* Image container - smaller square for mobile */}
        <div className="relative h-24 w-24 flex-shrink-0 bg-card overflow-hidden">
          {!imageError ? (
            <Image 
              src={station.imgUrl}
              alt={station.name}
              fill
              sizes="96px"
              className={`object-cover transition-transform duration-500 ease-in-out ${
                isHovered ? 'scale-110' : 'scale-100'
              }`}
              onError={() => setImageError(true)}
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-card"
              style={{ 
                background: `linear-gradient(135deg, ${stationColor} 0%, rgba(var(--card), 0.8) 100%)` 
              }}
            >
              <FaMusic className="text-2xl text-primary/60" />
            </div>
          )}

          {/* Subtle color overlay based on station name */}
          <div 
            className={`absolute inset-0 mix-blend-soft-light transition-opacity duration-300 ${
              isActive ? 'opacity-60' : 'opacity-30'
            }`}
            style={{ backgroundColor: stationColor }}
          />

          {/* Favorite indicator - positioned for mobile */}
          {isFavorite && (
            <div className="absolute top-1 right-1 z-20">
              <FaHeart className="text-red-500 drop-shadow-md text-sm" />
            </div>
          )}

          {/* Status overlays for mobile */}
          {hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-900/20 backdrop-blur-sm">
              <div className="bg-red-900/80 rounded-full p-2">
                <IoWarningOutline className="text-white text-sm" />
              </div>
            </div>
          )}

          {/* Active/Playing indicator for mobile */}
          {isActive && !hasError && (
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]">
              <div className="absolute inset-0 flex items-center justify-center">
                {isLoading ? (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-black/40 backdrop-blur-md rounded-full">
                    <span className="w-1 h-3 bg-white rounded-full animate-sound-wave"></span>
                    <span className="w-1 h-3 bg-white rounded-full animate-sound-wave animation-delay-200"></span>
                    <span className="w-1 h-3 bg-white rounded-full animate-sound-wave animation-delay-500"></span>
                  </div>
                ) : (
                  <div className="bg-white/90 rounded-full p-2 shadow-lg">
                    {isPlaying ? (
                      <FaPause className="text-primary text-sm" />
                    ) : (
                      <FaPlay className="text-primary text-sm" />
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Station info for mobile - beside the image */}
        <div className="p-3 flex-grow flex flex-col justify-center">
          <div className="flex items-start justify-between">
            <div className="pr-2">
              <h3 className="font-medium line-clamp-1 text-base">{station.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {station.description || "Lofi Radio Station"}
              </p>
            </div>
            {isActive && isPlaying && (
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded whitespace-nowrap">
                Live
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Desktop layout - vertical card */}
      <div className="hidden sm:block">
        {/* Favorite indicator */}
        {isFavorite && (
          <div className="absolute top-2 right-2 z-20">
            <FaHeart className="text-red-500 drop-shadow-md" />
          </div>
        )}

        {/* Background image */}
        <div className="aspect-square relative bg-card overflow-hidden">
          {!imageError ? (
            <Image 
              src={station.imgUrl}
              alt={station.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className={`object-cover transition-transform duration-700 ease-in-out ${
                isHovered || isActive ? 'scale-110' : 'scale-100'
              }`}
              onError={() => setImageError(true)}
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center"
              style={{ 
                background: `linear-gradient(135deg, ${stationColor} 0%, rgba(var(--card), 0.8) 100%)` 
              }}
            >
              <FaMusic className="text-5xl text-primary/60" />
            </div>
          )}

          {/* Subtle color overlay based on station name */}
          <div 
            className={`absolute inset-0 mix-blend-soft-light transition-opacity duration-300 ${
              isActive ? 'opacity-60' : isHovered ? 'opacity-40' : 'opacity-30'
            }`}
            style={{ backgroundColor: stationColor }}
          />

          {/* Status overlays */}
          {hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-900/20 backdrop-blur-sm">
              <div className="bg-red-900/80 rounded-full p-3">
                <IoWarningOutline className="text-white text-xl" />
              </div>
            </div>
          )}

          {/* Active/Playing overlay with glass effect */}
          {isActive && !hasError && (
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Play button or loading indicator */}
              <div className="absolute inset-0 flex items-center justify-center">
                {isLoading ? (
                  <div className="flex items-center space-x-1 px-3 py-2 bg-black/40 backdrop-blur-md rounded-full">
                    <span className="w-1 h-3 bg-white rounded-full animate-sound-wave"></span>
                    <span className="w-1 h-3 bg-white rounded-full animate-sound-wave animation-delay-200"></span>
                    <span className="w-1 h-3 bg-white rounded-full animate-sound-wave animation-delay-500"></span>
                  </div>
                ) : (
                  <div className="bg-white/90 rounded-full p-3 shadow-lg transition-transform duration-200 hover:scale-110">
                    {isPlaying ? (
                      <FaPause className="text-primary text-xl" />
                    ) : (
                      <FaPlay className="text-primary text-xl" />
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Station info */}
        <div 
          className={`p-3 border-t border-border transition-colors duration-300 ${
            isActive ? 'bg-primary/5' : 'bg-card'
          }`}
          style={{
            backgroundColor: isActive ? `${stationColor}30` : '' // 30 is opacity in hex
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium line-clamp-1">{station.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {station.description || "Lofi Radio Station"}
              </p>
            </div>
            {isActive && isPlaying && (
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                Live
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 