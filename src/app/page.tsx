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
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(80);
  const [error, setError] = useState<string | null>(null);
  const [stationsWithErrors, setStationsWithErrors] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  
  // Initialize audio on client side
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume / 100;
    
    // Configure audio element for better streaming
    if (audioRef.current) {
      audioRef.current.preload = "auto";
      audioRef.current.crossOrigin = "anonymous";
    }
    
    // Add error event listener
    const handleAudioError = (e: Event) => {
      const audioError = e.currentTarget as HTMLAudioElement;
      const errorMessage = audioError.error ? audioError.error.message : "Unknown error";
      
      console.error(`Audio error: ${errorMessage}`, {
        src: audioRef.current?.src
      });
      
      setIsPlaying(false);
      setIsLoading(false);
      
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
    
    // Add loadstart and canplay events for better loading indicators
    const handleLoadStart = () => {
      setIsLoading(true);
    };
    
    const handleCanPlay = () => {
      setIsLoading(false);
    };
    
    if (audioRef.current) {
      audioRef.current.addEventListener('error', handleAudioError);
      audioRef.current.addEventListener('loadstart', handleLoadStart);
      audioRef.current.addEventListener('canplay', handleCanPlay);
    }
    
    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('error', handleAudioError);
        audioRef.current.removeEventListener('loadstart', handleLoadStart);
        audioRef.current.removeEventListener('canplay', handleCanPlay);
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [currentStation]);

  // Handle volume change in a separate effect
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const handleStationSelect = (station: RadioStation) => {
    // Clear any previous errors
    setError(null);
    setIsLoading(true);
    retryCountRef.current = 0;
    
    // Clear any existing timeouts
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
      
      if (currentStation?.id === station.id && isPlaying) {
        setIsPlaying(false);
        setIsLoading(false);
        return;
      }
      
      // Play the new station
      try {
        // Set current station before attempting to play
        setCurrentStation(station);
        
        // Attempt direct connection first
        let streamUrl = station.url;
        
        // Ensure we're using https to avoid mixed content warnings
        if (!streamUrl.startsWith('https://')) {
          streamUrl = 'https://' + streamUrl.replace('http://', '');
        }
        
        console.log(`Playing station: ${station.name}`, { url: streamUrl });
        
        // Instead of showing an error immediately, set a loading message that gives more time
        const playStream = () => {
          // Set the source and play
          if (audioRef.current) {
            audioRef.current.src = streamUrl;
            
            // Try to play the stream directly
            audioRef.current.play()
            .then(() => {
              console.log(`Successfully playing ${station.name}`);
              setIsPlaying(true);
              setIsLoading(false);
              retryCountRef.current = 0;
              
              // Clear any loading timeout
              if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current);
                loadingTimeoutRef.current = null;
              }
            })
            .catch(error => {
              console.error(`Error playing station: ${station.name}`, error);
              
              // Instead of showing an error immediately, try again a few times
              if (retryCountRef.current < 2) {
                retryCountRef.current++;
                console.log(`Retrying (${retryCountRef.current}/2)...`);
                
                // Use timeout to retry playback after a delay
                loadingTimeoutRef.current = setTimeout(() => {
                  if (audioRef.current) {
                    playStream();
                  }
                }, 3000); // Retry after 3 seconds
              } else {
                // After retries, show error
                setIsPlaying(false);
                setIsLoading(false);
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
            });
          }
        };
        
        // Start the playback process
        playStream();
        
      } catch (error) {
        console.error(`Caught error playing ${station.name}`, error);
        setError(`Could not play ${station.name}. Please try another station.`);
        setIsLoading(false);
        
        // Clear error after 5 seconds
        setTimeout(() => setError(null), 5000);
      }
    }
  };

  const togglePlayPause = () => {
    if (!currentStation || !audioRef.current) return;
    
    // Clear any previous errors
    setError(null);
    
    if (isPlaying) {
      console.log(`Pausing ${currentStation.name}`);
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      console.log(`Attempting to resume ${currentStation.name}`);
      setIsLoading(true);
      retryCountRef.current = 0;
      
      const resumePlaying = () => {
        if (!audioRef.current) return;
        
        audioRef.current.play()
          .then(() => {
            console.log(`Successfully resumed ${currentStation.name}`);
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch(error => {
            console.error(`Error resuming ${currentStation.name}`, error);
            
            // Retry a couple times before showing error
            if (retryCountRef.current < 2) {
              retryCountRef.current++;
              console.log(`Retrying resume (${retryCountRef.current}/2)...`);
              
              // Try again after a delay
              setTimeout(resumePlaying, 2000);
            } else {
              setIsLoading(false);
              setError(`Could not play ${currentStation.name}. Please try again.`);
              
              // Clear error after 5 seconds
              setTimeout(() => setError(null), 5000);
            }
          });
      };
      
      resumePlaying();
    }
  };
  
  // Handle volume change with dedicated function
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    // Audio volume is handled in the useEffect
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

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

      {/* Error message only - removed loading indicator */}
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
                isPlaying={isPlaying && currentStation?.id === station.id}
                isLoading={isLoading && currentStation?.id === station.id}
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
        isLoading={isLoading}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        onPlayPause={togglePlayPause}
      />
    </div>
  );
}