
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
  const toneColors: { [key: string]: string } = {
    happy: 'bg-yellow-500',
    sad: 'bg-blue-500',
    energetic: 'bg-red-500',
    calm: 'bg-green-500',
    angry: 'bg-pink-500',
    neutral: 'bg-gray-500',
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-6 bg-black/20 border-slate-700">
      <h3 className="text-lg font-semibold text-white mb-4">
        Emotional Analysis
      </h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-2">
            Tone Timeline
          </h4>
          <div className="space-y-2">
            {data.toneSegments.map((segment, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                  currentTime >= segment.start && currentTime <= segment.end
                    ? 'border-white bg-white/10'
                    : 'border-slate-600 bg-slate-800/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      toneColors[segment.tone] || toneColors.neutral
                    }`}
                  />
                  <span className="text-white capitalize font-medium">
                    {segment.tone}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-400">
                    {formatTime(segment.start)} - {formatTime(segment.end)}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(segment.confidence * 100)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-2">
            Beat Analysis
          </h4>
          <div className="text-sm text-slate-400">
            <div>Total beats detected: {data.beats.length}</div>
            <div>Average BPM: {Math.round((data.beats.length / data.duration) * 60)}</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AudioAnalyzer;
