import React, { useState, useRef, useCallback } from 'react';
import { Upload, Play, Pause, Volume2 } from 'lucide-react';
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
    // Reset analysis data when new file is uploaded
    setAnalysisData(null);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    
    setAudioFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setIsAnalyzing(true);
    
    // Generate different analysis based on file name for demo purposes
    setTimeout(() => {
      const isSadSong = file.name.toLowerCase().includes('sad');
      
      const mockAnalysis: AnalysisData = isSadSong ? {
        toneSegments: [
          { start: 0, end: 25, tone: 'sad', confidence: 0.9 },
          { start: 25, end: 50, tone: 'melancholy', confidence: 0.8 },
          { start: 50, end: 75, tone: 'sad', confidence: 0.85 },
          { start: 75, end: 100, tone: 'neutral', confidence: 0.6 },
        ],
        beats: Array.from({ length: 150 }, (_, i) => i * 0.67), // Slower beats for sad song
        duration: 120
      } : {
        toneSegments: [
          { start: 0, end: 30, tone: 'happy', confidence: 0.8 },
          { start: 30, end: 60, tone: 'energetic', confidence: 0.9 },
          { start: 60, end: 90, tone: 'happy', confidence: 0.75 },
          { start: 90, end: 120, tone: 'calm', confidence: 0.7 },
        ],
        beats: Array.from({ length: 240 }, (_, i) => i * 0.5), // Faster beats for upbeat song
        duration: 120
      };
      
      setAnalysisData(mockAnalysis);
      setIsAnalyzing(false);
    }, 3000);
  }, []);

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

  return (
    <div className="min-h-screen bg-black relative">
      <CometBackground />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Music Emotion Visualizer
          </h1>
          <p className="text-gray-400 text-lg">
            Upload an MP3 file to see its emotional journey through interactive 3D visualization
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload and Controls Section */}
          <div className="space-y-6">
            <Card className="p-6 bg-gray-900/80 backdrop-blur-sm border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Audio Upload
              </h2>
              <FileUploader onFileUpload={handleFileUpload} />
              
              {isAnalyzing && (
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center gap-2 text-white">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Analyzing audio...
                  </div>
                </div>
              )}
            </Card>

            {audioFile && (
              <Card className="p-6 bg-gray-900/80 backdrop-blur-sm border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  Playback Controls
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={togglePlayPause}
                      variant="outline"
                      size="lg"
                      className="bg-white text-black border-white hover:bg-gray-200"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </Button>
                    
                    <div className="flex-1">
                      <div className="text-sm text-gray-300 mb-1">
                        Current Tone: <span className="capitalize font-semibold text-white">{getCurrentTone()}</span>
                      </div>
                      <Progress value={getProgress()} className="h-2 bg-gray-700" />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>{Math.floor(currentTime)}s</span>
                        <span>{Math.floor(duration)}s</span>
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

            {analysisData && (
              <AudioAnalyzer data={analysisData} currentTime={currentTime} />
            )}
          </div>

          {/* 3D Visualization Section */}
          <div>
            <Card className="p-6 bg-gray-900/80 backdrop-blur-sm border-gray-700 h-fit">
              <h3 className="text-lg font-semibold text-white mb-4">
                3D Sphere Visualization
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Drag to rotate • Scroll to zoom • Interactive 3D visualization
              </p>
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
