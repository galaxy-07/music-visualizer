
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
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-6 bg-gray-900 border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">
        Emotional Analysis
      </h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">
            Tone Timeline
          </h4>
          <div className="space-y-2">
            {data.toneSegments.map((segment, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                  currentTime >= segment.start && currentTime <= segment.end
                    ? 'border-white bg-gray-800'
                    : 'border-gray-600 bg-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-white" />
                  <span className="text-white capitalize font-medium">
                    {segment.tone}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400">
                    {formatTime(segment.start)} - {formatTime(segment.end)}
                  </span>
                  <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                    {Math.round(segment.confidence * 100)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">
            Beat Analysis
          </h4>
          <div className="text-sm text-gray-400">
            <div>Total beats detected: {data.beats.length}</div>
            <div>Average BPM: {Math.round((data.beats.length / data.duration) * 60)}</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AudioAnalyzer;
