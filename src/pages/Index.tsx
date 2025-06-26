
import React, { useState, useRef, useCallback } from 'react';
import { Upload, Play, Pause, Volume2, Music, Sparkles, SkipForward, SkipBack } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import FileUploader from '@/components/FileUploader';
import CosmicVisualizer from '@/components/CosmicVisualizer';
import AudioAnalyzer from '@/components/AudioAnalyzer';
import CometBackground from '@/components/CometBackground';

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
    // Reset all state when new file is uploaded
    setAnalysisData(null);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);

    // Clear previous audio URL
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    
    setAudioFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setIsAnalyzing(true);

    // Generate analysis based on file name for demo
    setTimeout(() => {
      const isSadSong = file.name.toLowerCase().includes('sad');
      const isEnergeticSong = file.name.toLowerCase().includes('energetic') || file.name.toLowerCase().includes('dance');
      
      let mockAnalysis: AnalysisData;
      
      if (isSadSong) {
        mockAnalysis = {
          toneSegments: [{
            start: 0,
            end: 25,
            tone: 'sad',
            confidence: 0.9
          }, {
            start: 25,
            end: 50,
            tone: 'melancholy',
            confidence: 0.8
          }, {
            start: 50,
            end: 75,
            tone: 'sad',
            confidence: 0.85
          }, {
            start: 75,
            end: 100,
            tone: 'neutral',
            confidence: 0.6
          }],
          beats: Array.from({ length: 150 }, (_, i) => i * 0.67),
          duration: 120
        };
      } else if (isEnergeticSong) {
        mockAnalysis = {
          toneSegments: [{
            start: 0,
            end: 20,
            tone: 'energetic',
            confidence: 0.95
          }, {
            start: 20,
            end: 40,
            tone: 'happy',
            confidence: 0.8
          }, {
            start: 40,
            end: 70,
            tone: 'energetic',
            confidence: 0.9
          }, {
            start: 70,
            end: 120,
            tone: 'happy',
            confidence: 0.85
          }],
          beats: Array.from({ length: 300 }, (_, i) => i * 0.4),
          duration: 120
        };
      } else {
        mockAnalysis = {
          toneSegments: [{
            start: 0,
            end: 30,
            tone: 'happy',
            confidence: 0.8
          }, {
            start: 30,
            end: 60,
            tone: 'energetic',
            confidence: 0.9
          }, {
            start: 60,
            end: 90,
            tone: 'calm',
            confidence: 0.75
          }, {
            start: 90,
            end: 120,
            tone: 'happy',
            confidence: 0.7
          }],
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

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
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

  const getProgress = () => {
    return duration > 0 ? (currentTime / duration) * 100 : 0;
  };

  const getToneColor = (tone: string) => {
    const colorMap: { [key: string]: string } = {
      happy: 'text-yellow-400',
      energetic: 'text-orange-400',
      sad: 'text-blue-400',
      melancholy: 'text-purple-400',
      calm: 'text-teal-400',
      angry: 'text-red-400',
      neutral: 'text-gray-400'
    };
    return colorMap[tone] || 'text-gray-400';
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cosmic gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-black" />
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 via-transparent to-pink-900/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
      
      <CometBackground />
      
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 backdrop-blur-[0.5px]" />
      
      <div className="container mx-auto px-4 py-4 relative z-10 max-w-6xl">
        {/* Compact Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Music className="w-6 h-6 text-white" />
            <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent mb-1">
            Cosmic Music Visualizer
          </h1>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            Experience your music through cosmic visualization and emotional analysis
          </p>
        </div>

        {/* Main Content - Single Row Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-180px)]">
          
          {/* Left Panel - Controls */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-3">
            
            {/* Upload Section */}
            <div className="p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl shadow-purple-500/10">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="w-3 h-3 text-blue-400" />
                <h3 className="text-xs font-medium text-white">Upload Track</h3>
              </div>
              <FileUploader onFileUpload={handleFileUpload} />
              
              {isAnalyzing && (
                <div className="mt-2 p-2 bg-blue-500/10 rounded border border-blue-500/20">
                  <div className="flex items-center gap-2 text-white text-xs">
                    <div className="animate-spin rounded-full h-2 w-2 border border-white border-t-transparent"></div>
                    <span>Analyzing...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Playback Controls */}
            {audioFile && (
              <div className="p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl shadow-green-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <Volume2 className="w-3 h-3 text-green-400" />
                  <h3 className="text-xs font-medium text-white">Playback</h3>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 justify-center">
                    <Button
                      onClick={skipBackward}
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-white hover:bg-white/10"
                    >
                      <SkipBack className="w-3 h-3" />
                    </Button>
                    
                    <Button
                      onClick={togglePlayPause}
                      size="sm"
                      className="h-8 w-8 rounded-full bg-white text-black hover:bg-gray-200 p-0"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </Button>
                    
                    <Button
                      onClick={skipForward}
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-white hover:bg-white/10"
                    >
                      <SkipForward className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-300">Emotion:</span>
                      <span className={`text-xs font-bold capitalize ${getToneColor(getCurrentTone())}`}>
                        {getCurrentTone()}
                      </span>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        getCurrentTone() === 'happy' ? 'bg-yellow-400' :
                        getCurrentTone() === 'sad' ? 'bg-blue-400' :
                        getCurrentTone() === 'energetic' ? 'bg-orange-400' :
                        getCurrentTone() === 'calm' ? 'bg-teal-400' :
                        getCurrentTone() === 'angry' ? 'bg-red-400' :
                        getCurrentTone() === 'melancholy' ? 'bg-purple-400' : 'bg-gray-400'
                      } animate-pulse`} />
                    </div>
                    
                    <div className="relative cursor-pointer" onClick={handleProgressClick}>
                      <Progress value={getProgress()} className="h-1.5 bg-gray-700/50 border border-white/5 rounded-full" />
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>{Math.floor(currentTime / 60)}:{(Math.floor(currentTime) % 60).toString().padStart(2, '0')}</span>
                      <span>{Math.floor(duration / 60)}:{(Math.floor(duration) % 60).toString().padStart(2, '0')}</span>
                    </div>
                  </div>
                </div>

                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              </div>
            )}

            {/* Analysis Display */}
            {analysisData && (
              <div className="p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl shadow-indigo-500/10">
                <h3 className="text-xs font-medium text-white mb-2">Analysis</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center p-2 bg-white/5 rounded">
                    <div className="text-sm font-bold text-white">{analysisData.beats.length}</div>
                    <div className="text-gray-400">Beats</div>
                  </div>
                  <div className="text-center p-2 bg-white/5 rounded">
                    <div className="text-sm font-bold text-white">{Math.round(analysisData.beats.length / analysisData.duration * 60)}</div>
                    <div className="text-gray-400">BPM</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Cosmic Visualization */}
          <div className="lg:col-span-8 xl:col-span-9">
            <div className="h-full p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl shadow-purple-500/10">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-white">Cosmic Visualization</h3>
                <p className="text-xs text-gray-400">
                  {analysisData ? 'Visual representation of your music\'s emotional journey' : 'Upload a track to begin visualization'}
                </p>
              </div>
              <div className="h-[calc(100%-50px)]">
                <CosmicVisualizer
                  currentTone={getCurrentTone()}
                  currentTime={currentTime}
                  beats={analysisData?.beats || []}
                  isPlaying={isPlaying}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
