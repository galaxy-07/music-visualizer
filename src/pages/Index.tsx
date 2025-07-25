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

  const generateAdvancedAnalysis = (fileName: string, audioDuration: number): AnalysisData => {
    const name = fileName.toLowerCase();
    
    const emotionKeywords = {
      sad: ['sad', 'melancholy', 'blue', 'cry', 'tear', 'lonely', 'empty', 'broken', 'hurt'],
      happy: ['happy', 'joy', 'celebration', 'party', 'smile', 'bright', 'sunshine', 'fun'],
      energetic: ['energetic', 'dance', 'pump', 'power', 'electric', 'hype', 'intense', 'fire'],
      calm: ['calm', 'peaceful', 'relax', 'chill', 'ambient', 'smooth', 'zen', 'soft'],
      angry: ['angry', 'rage', 'metal', 'aggressive', 'hard', 'rock', 'fury', 'mad'],
      melancholy: ['nostalgic', 'wistful', 'memory', 'past', 'longing', 'sorrow']
    };

    let primaryEmotion = 'neutral';
    let maxMatches = 0;
    
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      const matches = keywords.filter(keyword => name.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        primaryEmotion = emotion;
      }
    }

    const generateBeats = (emotion: string, duration: number) => {
      let bpm: number;
      let pattern: 'regular' | 'syncopated' | 'slow' | 'irregular' = 'regular';
      
      switch (emotion) {
        case 'energetic':
          bpm = 128 + Math.random() * 20;
          pattern = 'syncopated';
          break;
        case 'happy':
          bpm = 110 + Math.random() * 20;
          pattern = 'regular';
          break;
        case 'sad':
        case 'melancholy':
          bpm = 60 + Math.random() * 20;
          pattern = 'slow';
          break;
        case 'angry':
          bpm = 140 + Math.random() * 20;
          pattern = 'irregular';
          break;
        case 'calm':
          bpm = 70 + Math.random() * 15;
          pattern = 'slow';
          break;
        default:
          bpm = 100 + Math.random() * 20;
          pattern = 'regular';
      }

      const beatInterval = 60 / bpm;
      const beats = [];
      
      for (let time = 0; time < duration; time += beatInterval) {
        const variation = (Math.random() - 0.5) * 0.1;
        beats.push(time + variation);
        
        if (pattern === 'syncopated' && Math.random() > 0.7) {
          beats.push(time + beatInterval * 0.5 + variation);
        }
        
        if (pattern === 'irregular' && Math.random() > 0.8) {
          beats.push(time + beatInterval * 0.25 + variation);
        }
      }
      
      return beats.sort((a, b) => a - b);
    };

    const generateToneSegments = (primaryEmotion: string, duration: number) => {
      const segments = [];
      const numSegments = Math.floor(duration / 20) + 2;
      
      for (let i = 0; i < numSegments; i++) {
        const start = (i / numSegments) * duration;
        const end = Math.min(((i + 1) / numSegments) * duration, duration);
        
        let tone = primaryEmotion;
        let confidence = 0.8 + Math.random() * 0.2;
        
        if (i > 0 && i < numSegments - 1 && Math.random() > 0.6) {
          const variations = {
            sad: ['melancholy', 'neutral'],
            happy: ['energetic', 'calm'],
            energetic: ['happy', 'neutral'],
            calm: ['happy', 'neutral'],
            angry: ['energetic', 'neutral'],
            melancholy: ['sad', 'calm']
          };
          
          const possibleVariations = variations[primaryEmotion as keyof typeof variations] || ['neutral'];
          tone = Math.random() > 0.5 ? primaryEmotion : possibleVariations[Math.floor(Math.random() * possibleVariations.length)];
          confidence *= 0.9;
        }
        
        segments.push({ start, end, tone, confidence });
      }
      
      return segments;
    };

    return {
      toneSegments: generateToneSegments(primaryEmotion, audioDuration),
      beats: generateBeats(primaryEmotion, audioDuration),
      duration: audioDuration
    };
  };

  const handleFileUpload = useCallback(async (file: File) => {
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

    setTimeout(() => {
      const estimatedDuration = 180;
      const analysis = generateAdvancedAnalysis(file.name, estimatedDuration);
      
      setAnalysisData(analysis);
      setIsAnalyzing(false);
    }, 2000);
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

  const handleLoadedMetadata = () => {
    if (audioRef.current && audioFile && !analysisData) {
      const actualDuration = audioRef.current.duration;
      const analysis = generateAdvancedAnalysis(audioFile.name, actualDuration);
      setAnalysisData(analysis);
      setDuration(actualDuration);
    } else if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Music className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-1 tracking-tight">
            Music Visualizer
          </h1>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden space-y-4">
          {/* Upload Section */}
          <div className="flex justify-center">
            <div className="w-full max-w-sm">
              <UploadSection onFileUpload={handleFileUpload} isAnalyzing={isAnalyzing} />
            </div>
          </div>

          {/* Visualizer - Full width on mobile */}
          <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-3 sm:p-4">
            <DotMatrixVisualizer
              currentTone={getCurrentTone()}
              currentTime={currentTime}
              beats={analysisData?.beats || []}
              isPlaying={isPlaying}
            />
          </div>

          {/* Controls Row */}
          {audioFile && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex justify-center">
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
              </div>
              
              {analysisData && (
                <div className="flex justify-center">
                  <AnalysisStats analysisData={analysisData} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex flex-col lg:flex-row gap-6 items-start justify-center">
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
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      </div>
    </div>
  );
};

export default Index;
