
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Music, TrendingUp } from 'lucide-react';

interface ToneSegment {
  start: number;
  end: number;
  tone: string;
  confidence: number;
}

interface AnalysisData {
  toneSegments: ToneSegment[];
  beats: number[];
  duration: number;
}

interface AudioAnalyzerProps {
  data: AnalysisData;
  currentTime: number;
}

const AudioAnalyzer: React.FC<AudioAnalyzerProps> = ({ data, currentTime }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getToneColor = (tone: string) => {
    const colorMap: { [key: string]: string } = {
      happy: 'border-yellow-400 bg-yellow-400/10 text-yellow-300',
      energetic: 'border-orange-400 bg-orange-400/10 text-orange-300',
      sad: 'border-blue-400 bg-blue-400/10 text-blue-300',
      melancholy: 'border-purple-400 bg-purple-400/10 text-purple-300',
      calm: 'border-teal-400 bg-teal-400/10 text-teal-300',
      angry: 'border-red-400 bg-red-400/10 text-red-300',
      neutral: 'border-gray-400 bg-gray-400/10 text-gray-300',
    };
    return colorMap[tone] || 'border-gray-400 bg-gray-400/10 text-gray-300';
  };

  const getToneIcon = (tone: string) => {
    switch (tone) {
      case 'happy':
      case 'energetic':
        return '🎉';
      case 'sad':
      case 'melancholy':
        return '💙';
      case 'calm':
        return '🌊';
      case 'angry':
        return '🔥';
      default:
        return '🎵';
    }
  };

  return (
    <Card className="p-8 bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl rounded-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-2xl font-semibold text-white">Emotional Analysis</h3>
      </div>
      
      <div className="space-y-6">
        {/* Tone Timeline */}
        <div>
          <h4 className="text-lg font-medium text-gray-200 mb-4 flex items-center gap-2">
            <Music className="w-5 h-5" />
            Emotional Journey
          </h4>
          <div className="space-y-3">
            {data.toneSegments.map((segment, index) => (
              <div
                key={index}
                className={`relative p-4 rounded-xl border transition-all duration-300 ${
                  currentTime >= segment.start && currentTime <= segment.end
                    ? `${getToneColor(segment.tone)} scale-105 shadow-lg`
                    : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{getToneIcon(segment.tone)}</span>
                    <div>
                      <span className="font-semibold capitalize text-lg">
                        {segment.tone}
                      </span>
                      <div className="text-sm opacity-75">
                        {formatTime(segment.start)} - {formatTime(segment.end)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant="outline" 
                      className="border-current bg-current/10 text-current font-bold"
                    >
                      {Math.round(segment.confidence * 100)}%
                    </Badge>
                    {currentTime >= segment.start && currentTime <= segment.end && (
                      <div className="w-3 h-3 bg-current rounded-full animate-pulse" />
                    )}
                  </div>
                </div>
                
                {/* Progress bar for current segment */}
                {currentTime >= segment.start && currentTime <= segment.end && (
                  <div className="mt-3">
                    <div className="w-full bg-current/20 rounded-full h-1.5">
                      <div 
                        className="bg-current h-1.5 rounded-full transition-all duration-100"
                        style={{
                          width: `${Math.min(100, Math.max(0, ((currentTime - segment.start) / (segment.end - segment.start)) * 100))}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Beat Analysis */}
        <div className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-xl border border-blue-500/20">
          <h4 className="text-lg font-medium text-gray-200 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Rhythm Analysis
          </h4>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{data.beats.length}</div>
              <div className="text-sm text-gray-400">Total Beats</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{Math.round((data.beats.length / data.duration) * 60)}</div>
              <div className="text-sm text-gray-400">Average BPM</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AudioAnalyzer;
