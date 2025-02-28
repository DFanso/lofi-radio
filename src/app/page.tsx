'use client'
import { useState, useEffect, useRef } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { RadioPlayer, RadioStation } from "@/components/RadioPlayer";
import { RadioStationCard } from "@/components/RadioStationCard";
import { radioStations } from "@/lib/radio-stations";
import { FaMusic } from "react-icons/fa";

export default function Home() {
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [stationsWithErrors, setStationsWithErrors] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Initialize audio on client side
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume / 100;
    
    // Add error event listener
    const handleAudioError = (e: Event) => {
      console.error("Audio error:", e);
      const audioError = e.currentTarget as HTMLAudioElement;
      const errorMessage = audioError.error ? audioError.error.message : "Unknown error";
      
      setIsPlaying(false);
      
      // Handle specific error types
      if (errorMessage.includes("AbortError")) {
        console.log("Aborted error detected, attempting retry");
        // For AbortError, attempt to retry playback
        if (retryCount < 3 && currentStation) {
          setRetryCount(prev => prev + 1);
          
          // Short delay before retry
          setTimeout(() => {
            if (audioRef.current && currentStation) {
              audioRef.current.src = currentStation.url;
              audioRef.current.play().catch(retryError => {
                console.error("Retry failed:", retryError);
                setError(`Could not play ${currentStation.name} after retry. Please try again later.`);
                
                // Add station to error list after retry fails
                setStationsWithErrors(prev => {
                  if (!prev.includes(currentStation.id)) {
                    return [...prev, currentStation.id];
                  }
                  return prev;
                });
              });
            }
          }, 1000);
          
          return;
        }
      }
      
      // For all other errors or if retries exceeded
      setError("Failed to play this station. Please try another one.");
      
      // Add current station to error list
      if (currentStation) {
        setStationsWithErrors(prev => {
          if (!prev.includes(currentStation.id)) {
            return [...prev, currentStation.id];
          }
          return prev;
        });
      }
      
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    };
    
    audioRef.current.addEventListener('error', handleAudioError);
    
    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('error', handleAudioError);
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      // Abort any pending fetch operations
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [currentStation, retryCount, volume]);

  // Handle volume change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const handleStationSelect = (station: RadioStation) => {
    // Clear any previous errors and reset retry count
    setError(null);
    setRetryCount(0);
    
    // Abort any pending operations
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    if (audioRef.current) {
      audioRef.current.pause();
      
      if (currentStation?.id === station.id && isPlaying) {
        setIsPlaying(false);
        return;
      }
      
      // Play the new station
      try {
        // Add timeout handling to prevent indefinite loading
        const timeoutId = setTimeout(() => {
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setError(`Loading ${station.name} timed out. Please try again later.`);
          }
        }, 15000); // 15 second timeout
        
        audioRef.current.src = station.url;
        audioRef.current.play().then(() => {
          // Clear timeout on successful playback
          clearTimeout(timeoutId);
          setCurrentStation(station);
          setIsPlaying(true);
        }).catch(error => {
          // Clear timeout
          clearTimeout(timeoutId);
          
          console.error("Error playing audio:", error);
          
          // Check for AbortError
          if (error.name === "AbortError") {
            setError(`Request to play ${station.name} was aborted. Please try again.`);
            return;
          }
          
          setIsPlaying(false);
          setError(`Could not play ${station.name}. Please try another station.`);
          
          // Add station to error list
          setStationsWithErrors(prev => {
            if (!prev.includes(station.id)) {
              return [...prev, station.id];
            }
            return prev;
          });
          
          // Clear error after 5 seconds
          setTimeout(() => setError(null), 5000);
        });
      } catch (error) {
        console.error("Caught error playing audio:", error);
        setError(`Could not play ${station.name}. Please try another station.`);
        
        // Add station to error list
        setStationsWithErrors(prev => {
          if (!prev.includes(station.id)) {
            return [...prev, station.id];
          }
          return prev;
        });
        
        // Clear error after 5 seconds
        setTimeout(() => setError(null), 5000);
      }
    }
  };

  const togglePlayPause = () => {
    if (!currentStation) return;
    
    // Clear any previous errors
    setError(null);
    
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else if (audioRef.current) {
      // Abort any pending operations
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create new abort controller
      abortControllerRef.current = new AbortController();
      
      // Add timeout handling
      const timeoutId = setTimeout(() => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          setError(`Loading ${currentStation.name} timed out. Please try again later.`);
        }
      }, 15000); // 15 second timeout
      
      audioRef.current.play().then(() => {
        // Clear timeout on successful playback
        clearTimeout(timeoutId);
        setIsPlaying(true);
      }).catch(error => {
        // Clear timeout
        clearTimeout(timeoutId);
        
        console.error("Error playing audio:", error);
        
        // Check for AbortError
        if (error.name === "AbortError") {
          setError(`Request to play ${currentStation.name} was aborted. Please try again.`);
          return;
        }
        
        setError(`Could not play ${currentStation.name}. Please try another station.`);
        
        // Add station to error list
        setStationsWithErrors(prev => {
          if (!prev.includes(currentStation.id)) {
            return [...prev, currentStation.id];
          }
          return prev;
        });
        
        // Clear error after 5 seconds
        setTimeout(() => setError(null), 5000);
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="fixed w-full top-0 z-10 bg-background/95 backdrop-blur-md border-b">
        <div className="container flex justify-between items-center h-16 px-4 max-w-6xl mx-auto">
          <div className="flex items-center space-x-2">
            <FaMusic className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">Lofi Radio</h1>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Error message */}
      {error && (
        <div className="fixed top-20 left-0 right-0 z-50 flex justify-center">
          <div className="bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-md shadow-lg">
            {error}
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 w-full pt-24 pb-40">
        <div className="px-4 mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {radioStations.map((station) => (
              <RadioStationCard
                key={station.id}
                station={station}
                isActive={currentStation?.id === station.id}
                isPlaying={isPlaying}
                hasError={stationsWithErrors.includes(station.id)}
                onClick={() => handleStationSelect(station)}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Player controls */}
      <RadioPlayer
        station={currentStation}
        isPlaying={isPlaying}
        volume={volume}
        onVolumeChange={setVolume}
        onPlayPause={togglePlayPause}
      />
    </div>
  );
}
