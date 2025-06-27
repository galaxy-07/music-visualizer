
import React from 'react';
import { Activity } from 'lucide-react';

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

interface AnalysisStatsProps {
  analysisData: AnalysisData;
}

const AnalysisStats: React.FC<AnalysisStatsProps> = ({ analysisData }) => {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 w-full max-w-sm">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-4 h-4 text-white" />
        <h3 className="text-sm font-display font-medium text-white">Analysis</h3>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="text-center p-3 bg-gray-800/50 rounded">
          <div className="text-xl font-display font-bold text-white">{analysisData.beats.length}</div>
          <div className="text-gray-400 font-medium">Beats</div>
        </div>
        <div className="text-center p-3 bg-gray-800/50 rounded">
          <div className="text-xl font-display font-bold text-white">
            {Math.round(analysisData.beats.length / analysisData.duration * 60)}
          </div>
          <div className="text-gray-400 font-medium">BPM</div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisStats;
