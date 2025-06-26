
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
    <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-1 bg-black/30 backdrop-blur-sm rounded-lg p-2 border border-white/20">
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 text-white/80 hover:text-white hover:bg-white/20 border border-white/20 text-xs"
          onClick={onZoomIn}
        >
          <ZoomIn className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 text-white/80 hover:text-white hover:bg-white/20 border border-white/20 text-xs"
          onClick={onZoomOut}
        >
          <ZoomOut className="h-3 w-3" />
        </Button>
      </div>
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 text-white/80 hover:text-white hover:bg-white/20 border border-white/20 text-xs"
          onClick={onRotateLeft}
        >
          <RotateCcw className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 text-white/80 hover:text-white hover:bg-white/20 border border-white/20 text-xs"
          onClick={onRotateRight}
        >
          <RotateCw className="h-3 w-3" />
        </Button>
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="h-6 w-6 p-0 text-white/80 hover:text-white hover:bg-white/20 border border-white/20 text-xs"
        onClick={onReset}
      >
        <RotateCcw className="h-3 w-3" />
      </Button>
      <div className="text-xs text-white/50 text-center mt-1 px-1">
        <Move className="h-2 w-2 mx-auto mb-0.5" />
        <div className="text-xs leading-none">Drag</div>
      </div>
    </div>
  );
};

export default SphereControls;
