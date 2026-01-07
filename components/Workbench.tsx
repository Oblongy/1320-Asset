import React, { useState, useRef, useEffect } from 'react';
import { GeneratedAsset } from '../types';
import { Move, Trash2, Plus, Minus, RotateCw, Layers, ZoomIn, ZoomOut, Download, MousePointer2, Copy, Grid, Moon, CheckSquare, Wand2, Droplets, Eraser } from 'lucide-react';

interface WorkbenchProps {
  assets: GeneratedAsset[];
}

type BlendMode = 'normal' | 'screen' | 'multiply' | 'overlay';

interface StageItem {
  id: string;
  assetId: string;
  asset: GeneratedAsset;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
  blendMode: BlendMode;
}

type BackgroundMode = 'dark' | 'grid' | 'checker';

const Workbench: React.FC<WorkbenchProps> = ({ assets }) => {
  const [items, setItems] = useState<StageItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [canvasScale, setCanvasScale] = useState(1);
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>('grid');
  const [isExporting, setIsExporting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const stageRef = useRef<HTMLDivElement>(null);

  // --- ACTIONS ---

  const addItemToStage = (asset: GeneratedAsset) => {
    // Default size is based on asset type
    const defaultScale = asset.type === 'car' ? 1.5 : 1;

    const newItem: StageItem = {
      id: crypto.randomUUID(),
      assetId: asset.id,
      asset,
      x: 400, // Center-ish relative to container, will adjust based on view
      y: 300,
      scale: defaultScale,
      rotation: 0,
      zIndex: items.length + 1,
      blendMode: 'normal'
    };
    setItems(prev => [...prev, newItem]);
    setSelectedIds(new Set([newItem.id]));
  };

  const updateItem = (id: string, updates: Partial<StageItem>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const updateSelected = (updates: Partial<StageItem> | ((prev: StageItem) => Partial<StageItem>)) => {
    setItems(prev => prev.map(item => {
      if (selectedIds.has(item.id)) {
        const newValues = typeof updates === 'function' ? updates(item) : updates;
        return { ...item, ...newValues };
      }
      return item;
    }));
  };

  const deleteSelected = () => {
    setItems(prev => prev.filter(item => !selectedIds.has(item.id)));
    setSelectedIds(new Set());
  };

  const duplicateSelected = () => {
    const newItems: StageItem[] = [];
    const newSelection = new Set<string>();

    items.forEach(item => {
      if (selectedIds.has(item.id)) {
        const copy: StageItem = {
          ...item,
          id: crypto.randomUUID(),
          x: item.x + 20,
          y: item.y + 20,
          zIndex: items.length + newItems.length + 1
        };
        newItems.push(copy);
        newSelection.add(copy.id);
      }
    });

    setItems(prev => [...prev, ...newItems]);
    setSelectedIds(newSelection);
  };

  const bringToFront = () => {
    const maxZ = Math.max(...items.map(i => i.zIndex), 0);
    updateSelected({ zIndex: maxZ + 1 });
  };

  const sendToBack = () => {
    const minZ = Math.min(...items.map(i => i.zIndex), 0);
    updateSelected({ zIndex: minZ - 1 });
  };

  const toggleBlendMode = () => {
    updateSelected(item => {
      const modes: BlendMode[] = ['normal', 'screen', 'multiply', 'overlay'];
      const nextIndex = (modes.indexOf(item.blendMode) + 1) % modes.length;
      return { blendMode: modes[nextIndex] };
    });
  };

  // --- BACKGROUND REMOVAL (CHROMA KEY) ---
  const removeBackground = async () => {
    if (selectedIds.size === 0) return;
    setIsProcessing(true);
    
    try {
      const newItems = [...items];
      
      for (const id of selectedIds) {
        const index = newItems.findIndex(i => i.id === id);
        if (index === -1) continue;
        
        const item = newItems[index];
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = item.asset.imageUrl;
        await img.decode();
        
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;
        
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Auto-detect background color from corners
        // We verify 4 corners and pick the most common color or just top-left if consistent
        const getPixel = (x: number, y: number) => {
          const idx = (y * canvas.width + x) * 4;
          return [data[idx], data[idx+1], data[idx+2], data[idx+3]];
        };

        const corners = [
          getPixel(0, 0),
          getPixel(canvas.width - 1, 0),
          getPixel(0, canvas.height - 1),
          getPixel(canvas.width - 1, canvas.height - 1)
        ];

        // Use top-left as reference
        const [rRef, gRef, bRef] = corners[0];
        
        const tolerance = 40; // Adjustable tolerance
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i+1];
          const b = data[i+2];
          // const a = data[i+3];
          
          const dist = Math.sqrt((r - rRef) ** 2 + (g - gRef) ** 2 + (b - bRef) ** 2);
          
          if (dist < tolerance) {
            data[i+3] = 0; // Set Alpha to 0
          }
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Update item with new transparent image
        newItems[index] = {
          ...item,
          asset: {
            ...item.asset,
            imageUrl: canvas.toDataURL('image/png')
          }
        };
      }
      
      setItems(newItems);
    } catch (e) {
      console.error("Failed to remove background", e);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- INTERACTION ---

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    
    // Multi-select with shift
    if (e.shiftKey) {
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        return newSet;
      });
    } else if (!selectedIds.has(id)) {
      setSelectedIds(new Set([id]));
    }

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleStageMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const dx = (e.clientX - dragStart.x) / canvasScale;
    const dy = (e.clientY - dragStart.y) / canvasScale;

    setItems(prev => prev.map(item => {
      if (selectedIds.has(item.id)) {
        return { ...item, x: item.x + dx, y: item.y + dy };
      }
      return item;
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleStageMouseUp = () => {
    setIsDragging(false);
  };

  const handleStageClick = (e: React.MouseEvent) => {
    if (e.target === stageRef.current) {
      setSelectedIds(new Set());
    }
  };

  // --- EXPORT ---
  const handleExport = async () => {
    if (items.length === 0) return;
    setIsExporting(true);

    try {
      // 1. Load all images
      const loadedImages = await Promise.all(items.map(async (item) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = item.asset.imageUrl;
        await img.decode();
        return { item, img };
      }));

      // 2. Calculate Bounding Box
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

      loadedImages.forEach(({ item, img }) => {
        const w = img.naturalWidth * item.scale;
        const h = img.naturalHeight * item.scale;
        const radius = Math.sqrt(w*w + h*h) / 2;
        
        minX = Math.min(minX, item.x - radius);
        minY = Math.min(minY, item.y - radius);
        maxX = Math.max(maxX, item.x + radius);
        maxY = Math.max(maxY, item.y + radius);
      });

      const padding = 50; 
      const width = Math.max(100, Math.ceil(maxX - minX + padding * 2));
      const height = Math.max(100, Math.ceil(maxY - minY + padding * 2));

      // 3. Create Canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 4. Draw
      // Sort by zIndex to draw in correct order
      const sorted = [...loadedImages].sort((a, b) => a.item.zIndex - b.item.zIndex);

      sorted.forEach(({ item, img }) => {
        ctx.save();
        
        const cx = item.x - (minX - padding);
        const cy = item.y - (minY - padding);
        
        ctx.translate(cx, cy);
        ctx.rotate((item.rotation * Math.PI) / 180);
        ctx.scale(item.scale, item.scale);
        
        // Apply Blend Mode for export
        // Note: Canvas blend modes map roughly to CSS but names vary.
        // 'normal' -> 'source-over'
        ctx.globalCompositeOperation = item.blendMode === 'normal' ? 'source-over' : item.blendMode;

        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
        ctx.restore();
      });

      // 5. Download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `draggen-assembly-${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export image. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // --- BACKGROUND STYLE ---
  const getBackgroundStyle = () => {
    switch (backgroundMode) {
      case 'dark':
        return { backgroundColor: '#0f172a' };
      case 'checker':
        return { 
          backgroundImage: `
            linear-gradient(45deg, #1e293b 25%, transparent 25%), 
            linear-gradient(-45deg, #1e293b 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #1e293b 75%), 
            linear-gradient(-45deg, transparent 75%, #1e293b 75%)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
          backgroundColor: '#0f172a'
        };
      case 'grid':
      default:
        return {
          backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          backgroundColor: '#0f172a'
        };
    }
  };

  const getBlendModeIcon = (mode: BlendMode) => {
     switch(mode) {
        case 'screen': return <span className="text-[10px] font-bold">SCR</span>;
        case 'multiply': return <span className="text-[10px] font-bold">MUL</span>;
        case 'overlay': return <span className="text-[10px] font-bold">OVL</span>;
        default: return <Droplets className="w-4 h-4" />;
     }
  }

  return (
    <div className="flex h-full bg-slate-900 overflow-hidden">
      {/* 1. LIBRARY SIDEBAR */}
      <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col z-20">
        <div className="p-4 border-b border-slate-900">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4" /> Asset Library
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
          {assets.length === 0 ? (
            <div className="text-center text-slate-600 text-xs py-10">
              No assets generated yet.
            </div>
          ) : (
            assets.map(asset => (
              <div 
                key={asset.id} 
                onClick={() => addItemToStage(asset)}
                className="group relative aspect-square bg-slate-900 rounded-lg border border-slate-800 hover:border-cyan-500 cursor-pointer overflow-hidden transition-all active:scale-95"
              >
                 <img src={asset.imageUrl} alt="asset" className="w-full h-full object-contain p-2" />
                 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Plus className="w-6 h-6 text-white" />
                 </div>
                 <div className="absolute bottom-0 left-0 right-0 bg-slate-950/80 p-1 text-[9px] text-center truncate text-slate-400">
                    {asset.type}
                 </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. MAIN STAGE */}
      <div className="flex-1 flex flex-col relative bg-[#1e1e24]">
        
        {/* Toolbar */}
        <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-20 shadow-md">
           <div className="flex items-center gap-2">
              {/* Transform Controls */}
              <div className="bg-slate-800 rounded-lg p-1 flex gap-1 border border-slate-700">
                 <button onClick={() => updateSelected(p => ({ scale: p.scale + 0.1 }))} className="p-1.5 hover:bg-slate-700 rounded text-slate-300" title="Scale Up"><ZoomIn className="w-4 h-4" /></button>
                 <button onClick={() => updateSelected(p => ({ scale: Math.max(0.1, p.scale - 0.1) }))} className="p-1.5 hover:bg-slate-700 rounded text-slate-300" title="Scale Down"><ZoomOut className="w-4 h-4" /></button>
              </div>
              <div className="bg-slate-800 rounded-lg p-1 flex gap-1 border border-slate-700">
                 <button onClick={() => updateSelected(p => ({ rotation: p.rotation - 45 }))} className="p-1.5 hover:bg-slate-700 rounded text-slate-300" title="Rotate Left"><RotateCw className="w-4 h-4 -scale-x-100" /></button>
                 <button onClick={() => updateSelected(p => ({ rotation: p.rotation + 45 }))} className="p-1.5 hover:bg-slate-700 rounded text-slate-300" title="Rotate Right"><RotateCw className="w-4 h-4" /></button>
              </div>
              <div className="bg-slate-800 rounded-lg p-1 flex gap-1 border border-slate-700">
                 <button onClick={bringToFront} className="p-1.5 hover:bg-slate-700 rounded text-slate-300" title="Bring to Front"><Layers className="w-4 h-4" /></button>
                 <button onClick={sendToBack} className="p-1.5 hover:bg-slate-700 rounded text-slate-300 opacity-70" title="Send to Back"><Layers className="w-4 h-4" /></button>
              </div>
              
              {/* Divider */}
              <div className="w-px h-6 bg-slate-800 mx-2"></div>

              {/* Background & Blend Controls */}
              <div className="bg-slate-800 rounded-lg p-1 flex gap-1 border border-slate-700">
                 <button 
                    onClick={removeBackground} 
                    disabled={selectedIds.size === 0 || isProcessing}
                    className={`p-1.5 hover:bg-slate-700 rounded text-cyan-400 disabled:opacity-50`}
                    title="Magic Wand: Auto-remove background (Click to make transparent)"
                 >
                    {isProcessing ? <div className="w-4 h-4 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" /> : <Wand2 className="w-4 h-4" />}
                 </button>
                 <button 
                    onClick={toggleBlendMode} 
                    disabled={selectedIds.size !== 1}
                    className={`p-1.5 hover:bg-slate-700 rounded text-slate-300 disabled:opacity-50 flex items-center justify-center w-8`} 
                    title="Toggle Blend Mode (Normal -> Screen -> Multiply)"
                 >
                    {selectedIds.size === 1 ? getBlendModeIcon(items.find(i => selectedIds.has(i.id))?.blendMode || 'normal') : <Droplets className="w-4 h-4" />}
                 </button>
              </div>

               <div className="w-px h-6 bg-slate-800 mx-2"></div>

              {/* View Controls */}
              <div className="bg-slate-800 rounded-lg p-1 flex gap-1 border border-slate-700">
                 <button onClick={() => setBackgroundMode('dark')} className={`p-1.5 rounded transition-colors ${backgroundMode === 'dark' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-slate-200'}`} title="Dark Background"><Moon className="w-4 h-4" /></button>
                 <button onClick={() => setBackgroundMode('grid')} className={`p-1.5 rounded transition-colors ${backgroundMode === 'grid' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-slate-200'}`} title="Grid Background"><Grid className="w-4 h-4" /></button>
                 <button onClick={() => setBackgroundMode('checker')} className={`p-1.5 rounded transition-colors ${backgroundMode === 'checker' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-slate-200'}`} title="Transparent/Checker Background"><CheckSquare className="w-4 h-4" /></button>
              </div>
           </div>
           
           <div className="flex items-center gap-2">
              <button onClick={duplicateSelected} disabled={selectedIds.size === 0} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 border border-slate-700">
                 <Copy className="w-3.5 h-3.5" /> Duplicate
              </button>
              <button onClick={deleteSelected} disabled={selectedIds.size === 0} className="flex items-center gap-2 px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50 text-red-200 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 border border-red-900/50">
                 <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
              <div className="w-px h-6 bg-slate-800 mx-1"></div>
              <button 
                onClick={handleExport} 
                disabled={items.length === 0 || isExporting}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg hover:shadow-emerald-900/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                 {isExporting ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                 EXPORT PNG
              </button>
           </div>
        </div>

        {/* Canvas Area */}
        <div 
          ref={stageRef}
          className="flex-1 relative overflow-hidden cursor-crosshair"
          onMouseMove={handleStageMouseMove}
          onMouseUp={handleStageMouseUp}
          onMouseLeave={handleStageMouseUp}
          onClick={handleStageClick}
          style={getBackgroundStyle()}
        >
          {/* Zoom Wrapper */}
          <div 
            className="w-full h-full origin-center transition-transform duration-75"
            style={{ transform: `scale(${canvasScale})` }}
          >
             {items.map(item => (
               <div
                  key={item.id}
                  onMouseDown={(e) => handleMouseDown(e, item.id)}
                  style={{
                    position: 'absolute',
                    left: item.x,
                    top: item.y,
                    transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scale(${item.scale})`,
                    zIndex: item.zIndex,
                    cursor: isDragging && selectedIds.has(item.id) ? 'grabbing' : 'grab',
                    mixBlendMode: item.blendMode
                  }}
                  className={`group relative select-none ${selectedIds.has(item.id) ? 'z-50' : ''}`}
               >
                  {/* Selection Border */}
                  {selectedIds.has(item.id) && (
                    <div className="absolute -inset-2 border-2 border-cyan-500 border-dashed rounded-lg pointer-events-none animate-pulse"></div>
                  )}
                  
                  <img 
                    src={item.asset.imageUrl} 
                    alt="asset" 
                    className="max-w-[300px] pointer-events-none drop-shadow-2xl" 
                    draggable={false}
                  />
               </div>
             ))}
          </div>
          
          {/* Instructions Overlay */}
          {items.length === 0 && (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                <div className="text-center">
                   <Move className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                   <h2 className="text-2xl font-bold brand-font text-slate-400">WORKBENCH</h2>
                   <p className="text-slate-500">Select assets from the library to assemble your vehicle.</p>
                   <p className="text-slate-600 text-sm mt-2">Use the Wand <Wand2 className="w-3 h-3 inline"/> to remove backgrounds.</p>
                </div>
             </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="h-8 bg-slate-950 border-t border-slate-900 flex items-center justify-between px-4 text-[10px] text-slate-500 font-mono">
           <div>ITEMS: {items.length} | SELECTED: {selectedIds.size}</div>
           <div className="flex items-center gap-4">
              <span>CANVAS: 100%</span>
              <span>MAGIC WAND FOR TRANSPARENCY</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Workbench;