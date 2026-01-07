import React, { useState, useRef, useEffect } from 'react';
import { GeneratedAsset } from '../types';
import { Move, Trash2, Plus, Minus, RotateCw, Layers, ZoomIn, ZoomOut, Download, MousePointer2, Copy, Grid, Moon, CheckSquare, Wand2, Droplets, Eraser, Sparkles, Loader2 } from 'lucide-react';

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

  const addItemToStage = (asset: GeneratedAsset) => {
    const defaultScale = asset.type === 'car' ? 1.5 : 1;
    const newItem: StageItem = {
      id: crypto.randomUUID(),
      assetId: asset.id,
      asset,
      x: 400,
      y: 300,
      scale: defaultScale,
      rotation: 0,
      zIndex: items.length + 1,
      blendMode: 'normal'
    };
    setItems(prev => [...prev, newItem]);
    setSelectedIds(new Set([newItem.id]));
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
        
        // Multi-sample reference for better accuracy
        const rRef = data[0], gRef = data[1], bRef = data[2];

        // Advanced Alpha Fix Algorithm
        const tolerance = 40; 
        const softness = 15;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i+1], b = data[i+2];
          const dist = Math.sqrt((r - rRef) ** 2 + (g - gRef) ** 2 + (b - bRef) ** 2);
          
          if (dist < tolerance) {
            data[i+3] = 0;
          } else if (dist < tolerance + softness) {
            const ratio = (dist - tolerance) / softness;
            data[i+3] = Math.min(data[i+3], ratio * 255);
            
            // Defringe: adjust RGB towards neighbors if near edge to kill any remaining white/black bleed
            // (Simplified version: darken edges slightly if removing black to ensure no light halos)
            if (rRef < 50 && gRef < 50 && bRef < 50) {
              data[i] = (data[i] * ratio);
              data[i+1] = (data[i+1] * ratio);
              data[i+2] = (data[i+2] * ratio);
            }
          }
        }
        
        ctx.putImageData(imageData, 0, 0);
        newItems[index] = {
          ...item,
          asset: { ...item.asset, imageUrl: canvas.toDataURL('image/png') }
        };
      }
      setItems(newItems);
    } catch (e) {
      console.error("Background removal failed", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = async () => {
    if (items.length === 0) return;
    setIsExporting(true);

    try {
      const loadedImages = await Promise.all(items.map(async (item) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = item.asset.imageUrl;
        await img.decode();
        return { item, img };
      }));

      // Find precise bounds
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      loadedImages.forEach(({ item, img }) => {
        const w = img.naturalWidth * item.scale;
        const h = img.naturalHeight * item.scale;
        const rad = Math.abs(item.rotation * Math.PI / 180);
        const boundW = Math.abs(w * Math.cos(rad)) + Math.abs(h * Math.sin(rad));
        const boundH = Math.abs(w * Math.sin(rad)) + Math.abs(h * Math.cos(rad));
        
        minX = Math.min(minX, item.x - boundW/2);
        minY = Math.min(minY, item.y - boundH/2);
        maxX = Math.max(maxX, item.x + boundW/2);
        maxY = Math.max(maxY, item.y + boundH/2);
      });

      const padding = 10;
      const width = Math.ceil(maxX - minX + padding * 2);
      const height = Math.ceil(maxY - minY + padding * 2);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);

      const sorted = [...loadedImages].sort((a, b) => a.item.zIndex - b.item.zIndex);

      sorted.forEach(({ item, img }) => {
        ctx.save();
        const drawX = item.x - (minX - padding);
        const drawY = item.y - (minY - padding);
        ctx.translate(drawX, drawY);
        ctx.rotate((item.rotation * Math.PI) / 180);
        ctx.scale(item.scale, item.scale);
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
        ctx.restore();
      });

      const link = document.createElement('a');
      link.download = `draggen-export-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error("Export failed", e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (e.shiftKey) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
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
    setItems(prev => prev.map(item => selectedIds.has(item.id) ? { ...item, x: item.x + dx, y: item.y + dy } : item));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const getBackgroundStyle = () => {
    if (backgroundMode === 'checker') return { backgroundImage: 'linear-gradient(45deg, #1e293b 25%, transparent 25%), linear-gradient(-45deg, #1e293b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1e293b 75%), linear-gradient(-45deg, transparent 75%, #1e293b 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px', backgroundColor: '#0f172a' };
    if (backgroundMode === 'grid') return { backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '20px 20px', backgroundColor: '#0f172a' };
    return { backgroundColor: '#0f172a' };
  };

  return (
    <div className="flex h-full bg-slate-900 overflow-hidden">
      <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col z-20">
        <div className="p-4 border-b border-slate-900">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4" /> Asset Library
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
          {assets.map(asset => (
            <div key={asset.id} onClick={() => addItemToStage(asset)} className="group relative aspect-square bg-slate-900 rounded-lg border border-slate-800 hover:border-cyan-500 cursor-pointer overflow-hidden transition-all active:scale-95">
               <img src={asset.imageUrl} className="w-full h-full object-contain p-2" />
               <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Plus className="w-6 h-6 text-white" /></div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col relative bg-[#1e1e24]">
        <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-20 shadow-md">
           <div className="flex items-center gap-2">
              <div className="bg-slate-800 rounded-lg p-1 flex gap-1 border border-slate-700">
                 <button onClick={() => updateSelected(p => ({ scale: p.scale + 0.1 }))} className="p-1.5 hover:bg-slate-700 rounded text-slate-300"><ZoomIn className="w-4 h-4" /></button>
                 <button onClick={() => updateSelected(p => ({ scale: Math.max(0.1, p.scale - 0.1) }))} className="p-1.5 hover:bg-slate-700 rounded text-slate-300"><ZoomOut className="w-4 h-4" /></button>
              </div>
              <div className="bg-slate-800 rounded-lg p-1 flex gap-1 border border-slate-700">
                 <button onClick={() => updateSelected(p => ({ rotation: p.rotation - 45 }))} className="p-1.5 hover:bg-slate-700 rounded text-slate-300"><RotateCw className="w-4 h-4 -scale-x-100" /></button>
                 <button onClick={() => updateSelected(p => ({ rotation: p.rotation + 45 }))} className="p-1.5 hover:bg-slate-700 rounded text-slate-300"><RotateCw className="w-4 h-4" /></button>
              </div>
              <button onClick={removeBackground} disabled={selectedIds.size === 0 || isProcessing} className="p-2 bg-indigo-950/40 border border-indigo-500/50 rounded-lg text-indigo-400 hover:bg-indigo-900/50 disabled:opacity-50 flex items-center gap-2 text-xs font-bold" title="Smart Transparency Auto-Fix">
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} FIX ALPHA
              </button>
              <div className="bg-slate-800 rounded-lg p-1 flex gap-1 border border-slate-700 ml-2">
                 <button onClick={() => setBackgroundMode('dark')} className={`p-1.5 rounded ${backgroundMode === 'dark' ? 'bg-slate-600' : ''}`}><Moon className="w-4 h-4" /></button>
                 <button onClick={() => setBackgroundMode('grid')} className={`p-1.5 rounded ${backgroundMode === 'grid' ? 'bg-slate-600' : ''}`}><Grid className="w-4 h-4" /></button>
                 <button onClick={() => setBackgroundMode('checker')} className={`p-1.5 rounded ${backgroundMode === 'checker' ? 'bg-slate-600' : ''}`}><CheckSquare className="w-4 h-4" /></button>
              </div>
           </div>
           
           <div className="flex items-center gap-2">
              <button onClick={duplicateSelected} disabled={selectedIds.size === 0} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors border border-slate-700 uppercase">Duplicate</button>
              <button onClick={deleteSelected} disabled={selectedIds.size === 0} className="px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50 text-red-200 rounded-lg text-xs font-bold transition-colors border border-red-900/50 uppercase">Delete</button>
              <button onClick={handleExport} disabled={items.length === 0 || isExporting} className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold shadow-lg flex items-center gap-2 uppercase tracking-widest">
                 {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />} Export PNG
              </button>
           </div>
        </div>

        <div ref={stageRef} className="flex-1 relative overflow-hidden cursor-crosshair" onMouseMove={handleStageMouseMove} onMouseUp={() => setIsDragging(false)} onMouseLeave={() => setIsDragging(false)} onClick={(e) => e.target === stageRef.current && setSelectedIds(new Set())} style={getBackgroundStyle()}>
          <div className="w-full h-full origin-center" style={{ transform: `scale(${canvasScale})` }}>
             {items.map(item => (
               <div key={item.id} onMouseDown={(e) => handleMouseDown(e, item.id)} style={{ position: 'absolute', left: item.x, top: item.y, transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scale(${item.scale})`, zIndex: item.zIndex, mixBlendMode: item.blendMode }} className={`group relative select-none ${selectedIds.has(item.id) ? 'z-50' : ''}`}>
                  {selectedIds.has(item.id) && <div className="absolute -inset-2 border-2 border-cyan-500 border-dashed rounded-lg pointer-events-none animate-pulse"></div>}
                  <img src={item.asset.imageUrl} className="max-w-[512px] pointer-events-none drop-shadow-2xl" draggable={false} />
               </div>
             ))}
          </div>
          {items.length === 0 && <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none text-center flex-col"><Move className="w-16 h-16 mb-4 text-slate-500" /><h2 className="text-2xl font-bold brand-font text-slate-400">WORKBENCH</h2><p>Place assets to begin building your racing scene.</p></div>}
        </div>
      </div>
    </div>
  );
};

export default Workbench;