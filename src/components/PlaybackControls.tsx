
import React from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface PlaybackControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  currentTone: string;
  onTogglePlayPause: () => void;
  onSkipForward: () => void;
  onSkipBackward: () => void;
  onProgressClick: (event: React.MouseEvent<HTMLDivElement>) => void;
}

const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  currentTone,
  onTogglePlayPause,
  onSkipForward,
  onSkipBackward,
  onProgressClick,
}) => {
  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    return duration > 0 ? (currentTime / duration) * 100 : 0;
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-3 sm:p-4 w-full max-w-sm transition-all duration-300 ease-in-out">
      <div className="flex items-center gap-2 mb-3">
        <Volume2 className="w-4 h-4 text-white" />
        <h3 className="text-sm font-display font-medium text-white">Playback</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2 justify-center">
          <Button
            onClick={onSkipBackward}
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-white hover:bg-gray-800 transition-colors duration-200"
          >
            <SkipBack className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          
          <Button
            onClick={onTogglePlayPause}
            size="sm"
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white text-black hover:bg-gray-200 p-0 transition-all duration-200 hover:scale-105"
          >
            {isPlaying ? 
              <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : 
              <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />
            }
          </Button>
          
          <Button
            onClick={onSkipForward}
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-white hover:bg-gray-800 transition-colors duration-200"
          >
            <SkipForward className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs sm:text-sm font-medium text-gray-300">Emotion:</span>
            <span className="text-xs sm:text-sm font-display font-bold capitalize text-white">
              {currentTone}
            </span>
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          </div>
          
          <div className="relative cursor-pointer" onClick={onProgressClick}>
            <Progress 
              value={getProgress()} 
              className="h-2 bg-gray-700 border-none transition-all duration-200 hover:h-3" 
            />
          </div>
          
          <div className="flex justify-between text-xs font-mono text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaybackControls;
