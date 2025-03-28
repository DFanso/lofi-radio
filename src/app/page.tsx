'use client'
import { useState, useEffect, useRef } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import RadioPlayer from "@/components/RadioPlayer";
import RadioStationCard from "@/components/RadioStationCard";
import FullScreenPlayer from "@/components/FullScreenPlayer";
import { radioStations } from "@/lib/radio-stations";
import { FaMusic, FaTimes } from "react-icons/fa";
import type { RadioStation } from "@/types/types";
import Image from "next/image";

export default function Home() {
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(80);
  const [error, setError] = useState<string | null>(null);
  const [stationsWithErrors, setStationsWithErrors] = useState<string[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);
  const [backgroundOpacity, setBackgroundOpacity] = useState(0);
  const [showLastStationNotification, setShowLastStationNotification] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [autoPlayLastStation, setAutoPlayLastStation] = useState(false);
  const [lastPlayedStationId, setLastPlayedStationId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  
  // Initialize audio on client side and load user preferences from localStorage
  useEffect(() => {
    // Load saved volume preference
    const savedVolume = localStorage.getItem('lofiRadioVolume');
    if (savedVolume) {
      try {
        const parsedVolume = parseInt(savedVolume, 10);
        if (!isNaN(parsedVolume) && parsedVolume >= 0 && parsedVolume <= 100) {
          setVolume(parsedVolume);
        }
      } catch (e) {
        console.error('Error loading volume preference', e);
      }
    }
    
    // Load auto-play preference
    const savedAutoPlay = localStorage.getItem('lofiRadioAutoPlay');
    if (savedAutoPlay) {
      try {
        setAutoPlayLastStation(savedAutoPlay === 'true');
      } catch (e) {
        console.error('Error loading auto-play preference', e);
      }
    }
    
    // Initialize audio element
    audioRef.current = new Audio();
    audioRef.current.volume = volume / 100;
    
    // Configure audio element for better streaming
    if (audioRef.current) {
      audioRef.current.preload = "auto";
      audioRef.current.crossOrigin = "anonymous";
    }
    
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('lofiRadioFavorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Error loading favorites', e);
      }
    }
    
    // Load last played station ID
    const lastStationId = localStorage.getItem('lofiRadioLastStation');
    if (lastStationId) {
      setLastPlayedStationId(lastStationId);
      
      // Now find and load the station
      try {
        const lastStation = radioStations.find(station => station.id === lastStationId);
        if (lastStation) {
          console.log(`Restored last played station: ${lastStation.name}`);
          setCurrentStation(lastStation);
          setShowLastStationNotification(true);
          
          // Hide notification after 5 seconds
          setTimeout(() => {
            setShowLastStationNotification(false);
          }, 5000);
          
          // Auto-play if enabled in settings
          if (savedAutoPlay === 'true') {
            // Small delay to ensure audio is initialized
            setTimeout(() => {
              handleStationSelect(lastStation);
              setShowLastStationNotification(false);
            }, 500);
          }
        }
      } catch (e) {
        console.error('Error loading last station', e);
      }
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
      }
    };
  }, []);  // Remove currentStation dependency since we need this to run only once on mount

  // Handle audio updates when current station changes
  useEffect(() => {
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
      }
    };
  }, [currentStation]);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('lofiRadioFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // Save last played station to localStorage whenever it changes
  useEffect(() => {
    if (currentStation) {
      localStorage.setItem('lofiRadioLastStation', currentStation.id);
      setLastPlayedStationId(currentStation.id);
    }
  }, [currentStation]);

  // Save volume preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('lofiRadioVolume', volume.toString());
    // Still update audio volume even if current player instance is null
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Save auto-play preference whenever it changes
  useEffect(() => {
    localStorage.setItem('lofiRadioAutoPlay', autoPlayLastStation.toString());
  }, [autoPlayLastStation]);

  // Handle adding/removing favorites
  const toggleFavorite = (stationId: string) => {
    if (favorites.includes(stationId)) {
      // Remove from favorites
      setFavorites(favorites.filter(id => id !== stationId));
    } else {
      // Add to favorites
      setFavorites([...favorites, stationId]);
    }
  };

  // Check if a station is favorited
  const isFavorite = (stationId: string) => {
    return favorites.includes(stationId);
  };

  // Handle volume change with dedicated function
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    // Audio volume is handled in the useEffect
  };

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

  // Filter stations based on search query
  const filteredStations = searchQuery.trim() === '' 
    ? radioStations 
    : radioStations.filter(station => 
        station.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        station.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
  
  // Toggle search input visibility
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      // Focus the search input when it becomes visible
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      // Clear search when closing
      setSearchQuery('');
    }
  };

  // Close search when pressing Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  // Toggle full screen player
  const toggleFullScreen = () => {
    setIsFullScreenOpen(!isFullScreenOpen);
    
    // Toggle body scroll locking
    if (!isFullScreenOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };
  
  // Ensure scroll is restored if component unmounts while in fullscreen
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Add helper function to generate dynamic colors from station names
  const getStationColor = (name: string) => {
    // Simple hash function to generate a hue from the station name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Convert to a hue value (0-360)
    const hue = Math.abs(hash % 360);
    
    // Return HSL color
    return `hsl(${hue}, 70%, 50%)`;
  };

  // Animate background opacity when station changes or play state changes
  useEffect(() => {
    if (currentStation) {
      // For station changes, reset opacity first
      if (!backgroundOpacity) {
        setBackgroundOpacity(0);
        // Short delay then fade in
        const timer = setTimeout(() => {
          setBackgroundOpacity(isPlaying ? 0.8 : 0.3);
        }, 100);
        return () => clearTimeout(timer);
      } else {
        // For play state changes, transition directly
        setBackgroundOpacity(isPlaying ? 0.8 : 0.3);
      }
    }
  }, [currentStation, isPlaying, backgroundOpacity]);

  // Toggle settings panel
  // const toggleSettings = () => {
  //   setShowSettings(!showSettings);
  // };

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Dynamic station background - enhanced to match fullscreen experience */}
      {currentStation && (
        <div 
          className="fixed inset-0 z-0 transition-all duration-1000 ease-in-out"
          style={{ opacity: backgroundOpacity }}
        >
          {currentStation.imgUrl ? (
            <Image 
              src={currentStation.imgUrl} 
              alt=""
              fill
              className={`object-cover blur-3xl scale-110 transition-transform duration-2000 ${isPlaying ? 'scale-125' : 'scale-110'}`}
              quality={20}
              priority={false}
            />
          ) : (
            <div 
              className="absolute inset-0 bg-gradient-to-br transition-opacity duration-1000"
              style={{ 
                background: `linear-gradient(135deg, ${getStationColor(currentStation.name)} 0%, rgba(var(--background), 0.8) 100%)` 
              }}
            />
          )}
          
          {/* Enhanced gradient overlay that ensures content remains readable */}
          <div className={`absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background/95 z-10 transition-opacity duration-500 ${isPlaying ? 'opacity-75' : 'opacity-90'}`} />
          
          {/* Add subtle animated particles when playing like in full screen player */}
          {isPlaying && (
            <div className="absolute inset-0 z-10 opacity-30">
              <div className="absolute w-4 h-4 rounded-full bg-primary/20 top-1/4 left-1/4 animate-pulse" style={{ animationDuration: '4s' }} />
              <div className="absolute w-6 h-6 rounded-full bg-primary/10 top-3/4 left-1/3 animate-pulse" style={{ animationDuration: '7s' }} />
              <div className="absolute w-3 h-3 rounded-full bg-primary/20 top-2/3 right-1/4 animate-pulse" style={{ animationDuration: '5s' }} />
              <div className="absolute w-5 h-5 rounded-full bg-primary/10 top-1/3 right-1/3 animate-pulse" style={{ animationDuration: '6s' }} />
            </div>
          )}
        </div>
      )}

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
            <div className="relative">
              {isSearchOpen && (
                <div className="absolute right-0 top-0 -mt-1 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center bg-muted rounded-full overflow-hidden pr-2 pl-4 shadow-md">
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search stations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent border-none outline-none py-2 w-56 text-sm focus:ring-0"
                    />
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="p-1 text-muted-foreground hover:text-foreground"
                    >
                      {searchQuery && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              )}
              <button 
                onClick={toggleSearch}
                className={`rounded-full ${isSearchOpen ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'} p-2 hover:bg-muted/80 transition-colors`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
              </button>
            </div>
            {/* <button 
              onClick={toggleSettings}
              className={`rounded-full ${showSettings ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'} p-2 hover:bg-muted/80 transition-colors`}
              aria-label="Settings"
            >
              <FaCog className="w-4 h-4" />
            </button> */}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed right-4 top-20 z-50 w-80 bg-card border shadow-lg rounded-lg animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between border-b p-4">
            <h3 className="font-medium">Settings</h3>
            <button 
              onClick={() => setShowSettings(false)}
              className="text-muted-foreground hover:text-foreground rounded-full p-1"
              aria-label="Close settings"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="autoplay-toggle" className="text-sm flex-grow">
                Auto-play last station on return
                <p className="text-xs text-muted-foreground">
                  Automatically play your last station when you open the app
                </p>
              </label>
              <div className="relative inline-block w-12 align-middle select-none">
                <input 
                  type="checkbox" 
                  id="autoplay-toggle" 
                  checked={autoPlayLastStation}
                  onChange={() => setAutoPlayLastStation(!autoPlayLastStation)}
                  className="sr-only"
                />
                <div className={`block ${autoPlayLastStation ? 'bg-primary' : 'bg-muted'} w-12 h-6 rounded-full transition-colors duration-200`}></div>
                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 transform ${autoPlayLastStation ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Last station notification */}
      {showLastStationNotification && currentStation && (
        <div className="fixed top-20 left-0 right-0 z-50 flex justify-center animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-primary/90 text-primary-foreground px-4 py-2 rounded-md shadow-lg flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
              <path d="m9 12 2 2 4-4"></path>
            </svg>
            <span>Restored your last station: <strong>{currentStation.name}</strong></span>
            <button 
              onClick={() => {
                handleStationSelect(currentStation);
                setShowLastStationNotification(false);
              }}
              className="ml-4 bg-white/20 hover:bg-white/30 text-white rounded-full p-1 transition-colors flex items-center"
              aria-label="Play last station"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span className="ml-1 mr-1 text-sm">Play</span>
            </button>
          </div>
        </div>
      )}

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
          
          {/* Favorites section - only show if there are favorites */}
          {favorites.length > 0 && searchQuery.trim() === '' && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Your Favorites</h3>
                <span className="text-sm text-muted-foreground">{favorites.length} stations</span>
              </div>
              
              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {radioStations
                  .filter(station => favorites.includes(station.id))
                  .map((station) => (
                    <RadioStationCard
                      key={station.id}
                      station={station}
                      isActive={currentStation?.id === station.id}
                      isPlaying={isPlaying && currentStation?.id === station.id}
                      isLoading={isLoading && currentStation?.id === station.id}
                      hasError={stationsWithErrors.includes(station.id)}
                      isFavorite={true}
                      isLastPlayed={!currentStation?.id && lastPlayedStationId === station.id}
                      onClick={() => handleStationSelect(station)}
                    />
                  ))}
              </div>
            </div>
          )}
          
          {/* Search results indicator */}
          {searchQuery.trim() !== '' && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-2">Search Results</h3>
              <p className="text-muted-foreground">
                {filteredStations.length === 0
                  ? "No stations found matching your search."
                  : `Found ${filteredStations.length} ${filteredStations.length === 1 ? 'station' : 'stations'} matching "${searchQuery}"`}
              </p>
            </div>
          )}
          
          {/* Station grids - conditionally render based on search */}
          {searchQuery.trim() === '' ? (
            <>
              {/* Featured stations section */}
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Featured Stations</h3>
                  <span className="text-sm text-muted-foreground">{radioStations.slice(0, 4).length} stations</span>
                </div>
                
                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {radioStations.slice(0, 4).map((station) => (
                    <RadioStationCard
                      key={station.id}
                      station={station}
                      isActive={currentStation?.id === station.id}
                      isPlaying={isPlaying && currentStation?.id === station.id}
                      isLoading={isLoading && currentStation?.id === station.id}
                      hasError={stationsWithErrors.includes(station.id)}
                      isFavorite={isFavorite(station.id)}
                      isLastPlayed={!currentStation?.id && lastPlayedStationId === station.id}
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
                    <span className="text-sm text-muted-foreground">{radioStations.slice(4).length} stations</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {radioStations.slice(4).map((station) => (
                    <RadioStationCard
                      key={station.id}
                      station={station}
                      isActive={currentStation?.id === station.id}
                      isPlaying={isPlaying && currentStation?.id === station.id}
                      isLoading={isLoading && currentStation?.id === station.id}
                      hasError={stationsWithErrors.includes(station.id)}
                      isFavorite={isFavorite(station.id)}
                      isLastPlayed={!currentStation?.id && lastPlayedStationId === station.id}
                      onClick={() => handleStationSelect(station)}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Search results */
            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredStations.map((station) => (
                <RadioStationCard
                  key={station.id}
                  station={station}
                  isActive={currentStation?.id === station.id}
                  isPlaying={isPlaying && currentStation?.id === station.id}
                  isLoading={isLoading && currentStation?.id === station.id}
                  hasError={stationsWithErrors.includes(station.id)}
                  isFavorite={isFavorite(station.id)}
                  isLastPlayed={!currentStation?.id && lastPlayedStationId === station.id}
                  onClick={() => handleStationSelect(station)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Full screen player modal */}
      {isFullScreenOpen && currentStation && (
        <FullScreenPlayer
          station={currentStation}
          isPlaying={isPlaying}
          isLoading={isLoading}
          volume={volume}
          onVolumeChange={handleVolumeChange}
          onPlayPause={togglePlayPause}
          onNextStation={handleNextStation}
          onPreviousStation={handlePreviousStation}
          isFavorite={currentStation ? isFavorite(currentStation.id) : false}
          onToggleFavorite={() => currentStation && toggleFavorite(currentStation.id)}
          onClose={() => {
            setIsFullScreenOpen(false);
            document.body.style.overflow = '';
          }}
        />
      )}

      {/* Player controls - only show when not in full screen mode */}
      {!isFullScreenOpen && (
        <RadioPlayer
          station={currentStation}
          isPlaying={isPlaying}
          isLoading={isLoading}
          volume={volume}
          onVolumeChange={handleVolumeChange}
          onPlayPause={togglePlayPause}
          onNextStation={handleNextStation}
          onPreviousStation={handlePreviousStation}
          isFavorite={currentStation ? isFavorite(currentStation.id) : false}
          onToggleFavorite={() => currentStation && toggleFavorite(currentStation.id)}
          onOpenFullScreen={toggleFullScreen}
        />
      )}
    </div>
  );
}