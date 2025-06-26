
import React, { useState, useRef, useCallback } from 'react';
import { Upload, Play, Pause, Volume2, Music, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import FileUploader from '@/components/FileUploader';
import SphereVisualizer from '@/components/SphereVisualizer';
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
          toneSegments: [
            { start: 0, end: 25, tone: 'sad', confidence: 0.9 },
            { start: 25, end: 50, tone: 'melancholy', confidence: 0.8 },
            { start: 50, end: 75, tone: 'sad', confidence: 0.85 },
            { start: 75, end: 100, tone: 'neutral', confidence: 0.6 },
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
            { start: 70, end: 120, tone: 'happy', confidence: 0.85 },
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
            { start: 90, end: 120, tone: 'happy', confidence: 0.7 },
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

  const getCurrentTone = () => {
    if (!analysisData) return 'neutral';
    const segment = analysisData.toneSegments.find(
      seg => currentTime >= seg.start && currentTime <= seg.end
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
      neutral: 'text-gray-400',
    };
    return colorMap[tone] || 'text-gray-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      <CometBackground />
      
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/20 backdrop-blur-[1px]" />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Music className="w-12 h-12 text-white" />
              <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent mb-4">
            Music Emotion Visualizer
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Experience your music like never before. Upload any track and watch emotions come alive through stunning 3D visualization
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Panel */}
          <div className="space-y-6">
            {/* Upload Section */}
            <Card className="p-8 bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Upload Your Track</h2>
              </div>
              <FileUploader onFileUpload={handleFileUpload} />
              
              {isAnalyzing && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-xl border border-blue-500/30">
                  <div className="flex items-center gap-3 text-white">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span className="text-lg">Analyzing emotional patterns...</span>
                  </div>
                  <div className="mt-2 text-sm text-blue-200">
                    Extracting beats, tones, and musical emotions
                  </div>
                </div>
              )}
            </Card>

            {/* Playback Controls */}
            {audioFile && (
              <Card className="p-8 bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                    <Volume2 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white">Playback</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <Button
                      onClick={togglePlayPause}
                      size="lg"
                      className="h-16 w-16 rounded-full bg-gradient-to-r from-white to-gray-200 text-black hover:from-gray-100 hover:to-gray-300 shadow-lg transition-all duration-200 hover:scale-105"
                    >
                      {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                    </Button>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-sm text-gray-300">Current Emotion:</span>
                        <span className={`text-lg font-bold capitalize ${getToneColor(getCurrentTone())}`}>
                          {getCurrentTone()}
                        </span>
                        <div className={`w-3 h-3 rounded-full ${getCurrentTone() === 'happy' ? 'bg-yellow-400' : getCurrentTone() === 'sad' ? 'bg-blue-400' : getCurrentTone() === 'energetic' ? 'bg-orange-400' : getCurrentTone() === 'calm' ? 'bg-teal-400' : getCurrentTone() === 'angry' ? 'bg-red-400' : getCurrentTone() === 'melancholy' ? 'bg-purple-400' : 'bg-gray-400'} animate-pulse`} />
                      </div>
                      <div className="relative">
                        <Progress 
                          value={getProgress()} 
                          className="h-3 bg-gray-700/50 border border-white/10 rounded-full overflow-hidden"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full" />
                      </div>
                      <div className="flex justify-between text-sm text-gray-400 mt-2">
                        <span>{Math.floor(currentTime / 60)}:{(Math.floor(currentTime) % 60).toString().padStart(2, '0')}</span>
                        <span>{Math.floor(duration / 60)}:{(Math.floor(duration) % 60).toString().padStart(2, '0')}</span>
                      </div>
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
              </Card>
            )}

            {/* Analysis Section */}
            {analysisData && (
              <AudioAnalyzer data={analysisData} currentTime={currentTime} />
            )}
          </div>

          {/* 3D Visualization */}
          <div>
            <Card className="p-8 bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl rounded-2xl">
              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-white mb-2">Emotional Universe</h3>
                <p className="text-gray-300">
                  Watch emotions dance in 3D space • Drag to orbit • Scroll to zoom • Use controls for precision
                </p>
              </div>
              <SphereVisualizer
                currentTone={getCurrentTone()}
                currentTime={currentTime}
                beats={analysisData?.beats || []}
                isPlaying={isPlaying}
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
