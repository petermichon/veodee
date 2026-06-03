import { memo } from 'react';
import { RotateCcw, Download, Upload, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LibraryControlsProps {
  onReset?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onRaw?: () => void;
  rawActive?: boolean;
  className?: string;
}

// Memoized component to prevent unnecessary re-renders
export const LibraryControls = memo(function LibraryControls({
  onReset,
  onExport,
  onImport,
  onRaw,
  rawActive,
  className,
}: LibraryControlsProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 mb-6 overflow-x-auto flex-nowrap',
        className
      )}
    >
      {/* Import Button */}
      {onImport && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onImport}
          className="h-8 text-muted-foreground hover:bg-transparent"
        >
          <Download className="h-4 w-4 mr-2" />
          Import
        </Button>
      )}
      {/* Export Button */}
      {onExport && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onExport}
          className="h-8 text-muted-foreground hover:bg-transparent"
        >
          <Upload className="h-4 w-4 mr-2" />
          Export
        </Button>
      )}
      {/* Reset Button */}
      {onReset && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-8 text-muted-foreground hover:bg-transparent"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      )}
      {/* Raw Button */}
      {onRaw && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRaw}
          className={`h-8 hover:bg-transparent ${rawActive ? 'text-foreground' : 'text-muted-foreground'}`}
        >
          <Code className="h-4 w-4 mr-2" />
          Raw
        </Button>
      )}
    </div>
  );
});
