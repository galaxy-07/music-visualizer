
import React, { useState, useRef, useCallback } from 'react';
import { Music, Sparkles } from 'lucide-react';
import DotMatrixVisualizer from '@/components/DotMatrixVisualizer';
import PlaybackControls from '@/components/PlaybackControls';
import UploadSection from '@/components/UploadSection';
import AnalysisStats from '@/components/AnalysisStats';

interface AnalysisData {
  toneSegments: Array<{
    start: number;
    end: number;
    tone: string;
    confidence: number;
  }>;
  beats: number[];
  duration: number;
}

const Index = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    // Reset state
    setAnalysisData(null);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    
    setAudioFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setIsAnalyzing(true);

    // Generate mock analysis
    setTimeout(() => {
      const isSadSong = file.name.toLowerCase().includes('sad');
      const isEnergeticSong = file.name.toLowerCase().includes('energetic') || file.name.toLowerCase().includes('dance');
      
      let mockAnalysis: AnalysisData;
      
      if (isSadSong) {
        mockAnalysis = {
          toneSegments: [
            { start: 0, end: 25, tone: 'sad', confidence: 0.9 },
            { start: 25, end: 50, tone: 'melancholy', confidence: 0.8 },
            { start: 50, end: 75, tone: 'sad', confidence: 0.85 },
            { start: 75, end: 100, tone: 'neutral', confidence: 0.6 }
          ],
          beats: Array.from({ length: 150 }, (_, i) => i * 0.67),
          duration: 120
        };
      } else if (isEnergeticSong) {
        mockAnalysis = {
          toneSegments: [
            { start: 0, end: 20, tone: 'energetic', confidence: 0.95 },
            { start: 20, end: 40, tone: 'happy', confidence: 0.8 },
            { start: 40, end: 70, tone: 'energetic', confidence: 0.9 },
            { start: 70, end: 120, tone: 'happy', confidence: 0.85 }
          ],
          beats: Array.from({ length: 300 }, (_, i) => i * 0.4),
          duration: 120
        };
      } else {
        mockAnalysis = {
          toneSegments: [
            { start: 0, end: 30, tone: 'happy', confidence: 0.8 },
            { start: 30, end: 60, tone: 'energetic', confidence: 0.9 },
            { start: 60, end: 90, tone: 'calm', confidence: 0.75 },
            { start: 90, end: 120, tone: 'happy', confidence: 0.7 }
          ],
          beats: Array.from({ length: 240 }, (_, i) => i * 0.5),
          duration: 120
        };
      }
      
      setAnalysisData(mockAnalysis);
      setIsAnalyzing(false);
    }, 2500);
  }, [audioUrl]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, duration);
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
    }
  };

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration > 0) {
      const rect = event.currentTarget.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const newTime = clickX / rect.width * duration;
      audioRef.current.currentTime = newTime;
    }
  };

  const getCurrentTone = () => {
    if (!analysisData) return 'neutral';
    const segment = analysisData.toneSegments.find(seg => 
      currentTime >= seg.start && currentTime <= seg.end
    );
    return segment?.tone || 'neutral';
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Music className="w-5 h-5 text-white" />
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Music Visualizer</h1>
          <p className="text-gray-400 text-sm">Dot matrix visualization of rhythm and emotion</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
          
          {/* Left Column - Controls */}
          <div className="flex flex-col gap-4 w-full lg:w-auto">
            <UploadSection onFileUpload={handleFileUpload} isAnalyzing={isAnalyzing} />
            
            {audioFile && (
              <PlaybackControls
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                currentTone={getCurrentTone()}
                onTogglePlayPause={togglePlayPause}
                onSkipForward={skipForward}
                onSkipBackward={skipBackward}
                onProgressClick={handleProgressClick}
              />
            )}

            {analysisData && <AnalysisStats analysisData={analysisData} />}
          </div>

          {/* Center - Dot Matrix Visualization */}
          <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6">
            <div className="mb-4 text-center">
              <h3 className="text-lg font-semibold text-white">Dot Matrix Visualization</h3>
              <p className="text-sm text-gray-400">
                {analysisData ? 'Visual representation of rhythm and emotion' : 'Upload a track to begin'}
              </p>
            </div>
            <DotMatrixVisualizer
              currentTone={getCurrentTone()}
              currentTime={currentTime}
              beats={analysisData?.beats || []}
              isPlaying={isPlaying}
            />
          </div>
        </div>

        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={() => {
            if (audioRef.current) {
              setCurrentTime(audioRef.current.currentTime);
            }
          }}
          onLoadedMetadata={() => {
            if (audioRef.current) {
              setDuration(audioRef.current.duration);
            }
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      </div>
    </div>
  );
};

export default Index;
