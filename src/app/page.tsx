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

  // Navigate to next station
  const handleNextStation = () => {
    if (!currentStation) return;
    
    // Clear any errors
    setError(null);
    
    const currentIndex = radioStations.findIndex(station => station.id === currentStation.id);
    
    // If current station is found and it's not the last one
    if (currentIndex !== -1 && currentIndex < radioStations.length - 1) {
      // Move to next station
      console.log(`Moving to next station: ${radioStations[currentIndex + 1].name}`);
      handleStationSelect(radioStations[currentIndex + 1]);
    } else {
      // Loop back to the first station
      console.log(`Looping to first station: ${radioStations[0].name}`);
      handleStationSelect(radioStations[0]);
    }
  };

  // Navigate to previous station
  const handlePreviousStation = () => {
    if (!currentStation) return;
    
    // Clear any errors
    setError(null);
    
    const currentIndex = radioStations.findIndex(station => station.id === currentStation.id);
    
    // If current station is found and it's not the first one
    if (currentIndex > 0) {
      // Move to previous station
      console.log(`Moving to previous station: ${radioStations[currentIndex - 1].name}`);
      handleStationSelect(radioStations[currentIndex - 1]);
    } else {
      // Loop to the last station
      console.log(`Looping to last station: ${radioStations[radioStations.length - 1].name}`);
      handleStationSelect(radioStations[radioStations.length - 1]);
    }
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
      {/* Enhanced Header/Navigation */}
      <header className="fixed w-full top-0 z-10 bg-background/80 backdrop-blur-xl border-b shadow-sm">
        <div className="container flex justify-between items-center h-16 px-4 max-w-6xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-500 to-primary p-2 rounded-lg shadow-md">
              <FaMusic className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Lofi Radio
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="rounded-full bg-muted p-2 hover:bg-muted/80 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
            </button>
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

      {/* Enhanced Main Content */}
      <main className="flex-1 w-full pt-24 pb-40">
        <div className="px-4 mx-auto max-w-6xl">
          {/* Hero section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-2">Discover Lofi Music</h2>
            <p className="text-muted-foreground max-w-2xl">
              Relax, study, or focus with our curated collection of lofi beats and ambient music from around the world.
            </p>
          </div>
          
          {/* Featured stations section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Featured Stations</h3>
              <button className="text-sm text-primary hover:underline">View All</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {radioStations.slice(0, 4).map((station) => (
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
          
          {/* All stations section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">All Stations</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">{radioStations.length} stations</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {radioStations.slice(4).map((station) => (
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
        onNextStation={handleNextStation}
        onPreviousStation={handlePreviousStation}
      />
    </div>
  );
}