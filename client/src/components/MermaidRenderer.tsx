import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, AlertCircle } from 'lucide-react';

interface MermaidRendererProps {
  chart: string;
  id?: string;
}

mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'loose',
  flowchart: {
    useMaxWidth: false,
    htmlLabels: true,
    curve: 'basis'
  }
});

export const MermaidRenderer: React.FC<MermaidRendererProps> = ({ chart, id = 'mermaid-chart' }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    let isMounted = true;
    const renderDiagram = async () => {
      if (!chart || !chart.trim()) {
        setSvgContent('');
        return;
      }
      try {
        setError(null);
        const uniqueId = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(uniqueId, chart.trim());
        if (isMounted) {
          setSvgContent(svg);
          setScale(1);
          setPan({ x: 0, y: 0 });
        }
      } catch (err: any) {
        console.warn('[MermaidRenderer] Render failed:', err);
        if (isMounted) {
          setError('Failed to render diagram structure. Showing raw specification.');
        }
      }
    };

    renderDiagram();
    return () => {
      isMounted = false;
    };
  }, [chart]);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.4));
  const handleReset = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="relative rounded-2xl bg-slate-50/80 border border-slate-200 overflow-hidden shadow-inner select-none">
      {/* Zoom and Pan Controls Bar */}
      <div className="absolute top-3 right-3 z-10 flex items-center space-x-1.5 bg-white/90 backdrop-blur-xs p-1.5 rounded-xl border border-slate-200/80 shadow-xs">
        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 cursor-pointer transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 cursor-pointer transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleReset}
          title="Reset Zoom & Pan"
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <span className="text-[11px] font-mono font-bold text-slate-500 px-1.5 border-l border-slate-200">
          {Math.round(scale * 100)}%
        </span>
      </div>

      <div className="absolute bottom-3 left-3 z-10 text-[10px] text-slate-400 bg-white/80 px-2 py-1 rounded-md border border-slate-200/60 pointer-events-none">
        💡 Drag to pan • Use buttons to zoom
      </div>

      {error ? (
        <div className="p-8 text-center text-xs text-rose-600 space-y-2">
          <AlertCircle className="w-6 h-6 mx-auto text-rose-500" />
          <p>{error}</p>
          <pre className="text-[11px] bg-slate-900 text-slate-100 p-3 rounded-xl text-left overflow-x-auto font-mono">
            {chart}
          </pre>
        </div>
      ) : (
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-[420px] flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing p-6"
        >
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.15s ease-out'
            }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
            className="flex items-center justify-center max-w-none"
          />
        </div>
      )}
    </div>
  );
};
