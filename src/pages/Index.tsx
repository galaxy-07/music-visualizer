
import React, { useState, useRef, useCallback } from 'react';
import { Upload, Play, Pause, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import FileUploader from '@/components/FileUploader';
import DotMatrixVisualizer from '@/components/DotMatrixVisualizer';
import AudioAnalyzer from '@/components/AudioAnalyzer';

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
    setAudioFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setIsAnalyzing(true);
    
    // Simulate analysis - in real implementation, this would call the analysis APIs
    setTimeout(() => {
      const mockAnalysis: AnalysisData = {
        toneSegments: [
          { start: 0, end: 30, tone: 'happy', confidence: 0.8 },
          { start: 30, end: 60, tone: 'sad', confidence: 0.7 },
          { start: 60, end: 90, tone: 'energetic', confidence: 0.9 },
        ],
        beats: Array.from({ length: 200 }, (_, i) => i * 0.5), // Beat every 0.5 seconds
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Music Emotion Visualizer
          </h1>
          <p className="text-slate-300 text-lg">
            Upload an MP3 file to see its emotional journey through interactive visualization
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload and Controls Section */}
          <div className="space-y-6">
            <Card className="p-6 bg-black/20 border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Audio Upload
              </h2>
              <FileUploader onFileUpload={handleFileUpload} />
              
              {isAnalyzing && (
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center gap-2 text-blue-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                    Analyzing audio...
                  </div>
                </div>
              )}
            </Card>

            {audioFile && (
              <Card className="p-6 bg-black/20 border-slate-700">
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
                      className="bg-white/10 border-slate-600 text-white hover:bg-white/20"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </Button>
                    
                    <div className="flex-1">
                      <div className="text-sm text-slate-300 mb-1">
                        Current Tone: <span className="capitalize font-semibold text-white">{getCurrentTone()}</span>
                      </div>
                      <Progress value={getProgress()} className="h-2" />
                      <div className="flex justify-between text-xs text-slate-400 mt-1">
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

          {/* Visualization Section */}
          <div>
            <Card className="p-6 bg-black/20 border-slate-700 h-fit">
              <h3 className="text-lg font-semibold text-white mb-4">
                Dot Matrix Visualization
              </h3>
              <DotMatrixVisualizer
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
