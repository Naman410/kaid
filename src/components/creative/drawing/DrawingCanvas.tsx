
import { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas } from 'fabric';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

type DrawingTool = 'crayon' | 'pencil' | 'brush' | 'pen' | 'eraser';

const DrawingCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<DrawingTool>('crayon');
  const [brushSize, setBrushSize] = useState([15]);
  const [activeColor, setActiveColor] = useState('#000000');
  const { toast } = useToast();

  const tools = [
    { name: 'crayon' as DrawingTool, icon: '🖍️', label: 'Crayon' },
    { name: 'pencil' as DrawingTool, icon: '✏️', label: 'Pencil' },
    { name: 'brush' as DrawingTool, icon: '🖌️', label: 'Brush' },
    { name: 'pen' as DrawingTool, icon: '🖊️', label: 'Pen' },
    { name: 'eraser' as DrawingTool, icon: '🧽', label: 'Eraser' }
  ];

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB',
    '#8B4513', '#808080', '#FFFFFF'
  ];

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 500,
      backgroundColor: '#ffffff',
    });

    // Enable drawing mode first to initialize the brush
    canvas.isDrawingMode = true;
    
    // Now we can safely configure the brush
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = activeColor;
      canvas.freeDrawingBrush.width = brushSize[0];
    }

    setFabricCanvas(canvas);

    // Handle resize
    const handleResize = () => {
      const container = canvasRef.current?.parentElement;
      if (container && canvas) {
        const containerWidth = container.clientWidth - 48; // Account for padding
        const maxWidth = Math.min(containerWidth, 800);
        const height = (maxWidth / 800) * 500;
        
        canvas.setDimensions({
          width: maxWidth,
          height: height
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!fabricCanvas || !fabricCanvas.freeDrawingBrush) return;

    // Configure brush based on active tool
    const brush = fabricCanvas.freeDrawingBrush;
    
    if (activeTool === 'eraser') {
      // For eraser, we'll use white color
      brush.color = '#ffffff';
      brush.width = brushSize[0];
    } else {
      brush.color = activeColor;
      brush.width = brushSize[0];
      
      // Tool-specific configurations
      switch (activeTool) {
        case 'crayon':
          // Rougher, more textured appearance
          break;
        case 'pencil':
          // Thinner, more precise
          break;
        case 'brush':
          // Smooth strokes
          break;
        case 'pen':
          // Clean, precise lines
          break;
      }
    }
  }, [activeTool, brushSize, activeColor, fabricCanvas]);

  const handleToolSelect = (tool: DrawingTool) => {
    setActiveTool(tool);
    console.log(`Selected ${tool}`);
  };

  const handleColorSelect = (color: string) => {
    setActiveColor(color);
  };

  const handleClearCanvas = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = '#ffffff';
    fabricCanvas.renderAll();
    toast({
      title: "Canvas Cleared! 🧹",
      description: "Ready for your next masterpiece!"
    });
  };

  const handleDownload = () => {
    if (!fabricCanvas) return;
    
    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2 // Higher resolution
    });
    
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'my-drawing.png';
    link.click();
    
    toast({
      title: "Downloaded! 💾",
      description: "Your artwork has been saved!"
    });
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-indigo-100 to-purple-100 border-0 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        🎨 Drawing Canvas 🎨
      </h2>
      
      {/* Drawing Tools */}
      <div className="mb-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Choose Your Tool:</h3>
          <div className="grid grid-cols-5 gap-3">
            {tools.map((tool) => (
              <Button
                key={tool.name}
                onClick={() => handleToolSelect(tool.name)}
                variant={activeTool === tool.name ? "default" : "outline"}
                className={`p-4 h-auto flex flex-col space-y-2 rounded-xl transform hover:scale-105 transition-all duration-200 ${
                  activeTool === tool.name 
                    ? 'bg-blue-500 text-white shadow-lg' 
                    : 'bg-white hover:bg-blue-50'
                }`}
              >
                <span className="text-2xl">{tool.icon}</span>
                <span className="text-sm font-medium">{tool.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Color Picker */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Pick a Color:</h3>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => handleColorSelect(color)}
                className={`w-8 h-8 rounded-full border-2 transform hover:scale-110 transition-all duration-200 ${
                  activeColor === color ? 'border-gray-800 shadow-lg' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Brush Size */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Brush Size: {brushSize[0]}px
          </h3>
          <Slider
            value={brushSize}
            onValueChange={setBrushSize}
            max={50}
            min={5}
            step={1}
            className="w-full max-w-md"
          />
        </div>

        {/* Canvas Controls */}
        <div className="flex gap-3">
          <Button
            onClick={handleClearCanvas}
            variant="outline"
            className="rounded-xl bg-white hover:bg-red-50 border-red-200"
          >
            🧹 Clear Canvas
          </Button>
          <Button
            onClick={handleDownload}
            variant="outline"
            className="rounded-xl bg-white hover:bg-green-50 border-green-200"
          >
            💾 Download Drawing
          </Button>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="bg-white rounded-xl shadow-inner p-4">
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <canvas ref={canvasRef} className="max-w-full h-auto block" />
        </div>
        <p className="text-sm text-gray-500 mt-2 text-center">
          Start drawing on the canvas above! 🎨
        </p>
      </div>
    </Card>
  );
};

export default DrawingCanvas;
