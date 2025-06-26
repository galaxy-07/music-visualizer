
import React from 'react';
import { RotateCcw, ZoomIn, ZoomOut, RotateCw, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SphereControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onReset: () => void;
}

const SphereControls: React.FC<SphereControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onRotateLeft,
  onRotateRight,
  onReset,
}) => {
  return (
    <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2 bg-black/20 backdrop-blur-sm rounded-lg p-2 border border-white/10">
      <div className="flex gap-1">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-white hover:bg-white/20 border border-white/20"
          onClick={onZoomIn}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-white hover:bg-white/20 border border-white/20"
          onClick={onZoomOut}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex gap-1">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-white hover:bg-white/20 border border-white/20"
          onClick={onRotateLeft}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-white hover:bg-white/20 border border-white/20"
          onClick={onRotateRight}
        >
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 text-white hover:bg-white/20 border border-white/20"
        onClick={onReset}
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
      <div className="text-xs text-white/60 text-center mt-1">
        <Move className="h-3 w-3 mx-auto mb-1" />
        Drag to orbit
      </div>
    </div>
  );
};

export default SphereControls;
