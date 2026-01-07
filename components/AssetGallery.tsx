import React, { useState } from 'react';
import { Download, Trash2, ZoomIn, Clock, Sparkles, Loader2 } from 'lucide-react';
import { GeneratedAsset } from '../types';

interface AssetGalleryProps {
  assets: GeneratedAsset[];
  onDelete: (id: string) => void;
  onUpdateAsset: (id: string, newUrl: string) => void;
}

const AssetGallery: React.FC<AssetGalleryProps> = ({ assets, onDelete, onUpdateAsset }) => {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleDownload = (asset: GeneratedAsset) => {
    const link = document.createElement('a');
    link.href = asset.imageUrl;
    link.download = `draggen-${asset.type}-${asset.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const processTransparency = async (asset: GeneratedAsset) => {
    setProcessingId(asset.id);
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = asset.imageUrl;
      await img.decode();

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Smart Alpha Extraction targeting Black Backgrounds
      // We look at the corners to verify background color (usually 0,0,0)
      const rRef = data[0], gRef = data[1], bRef = data[2];
      const tolerance = 35;
      const softness = 15;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const dist = Math.sqrt((r - rRef) ** 2 + (g - gRef) ** 2 + (b - bRef) ** 2);

        if (dist < tolerance) {
          data[i + 3] = 0;
        } else if (dist < tolerance + softness) {
          const ratio = (dist - tolerance) / softness;
          data[i + 3] = Math.min(data[i + 3], ratio * 255);
        }
      }

      ctx.putImageData(imageData, 0, 0);
      onUpdateAsset(asset.id, canvas.toDataURL('image/png'));
    } catch (e) {
      console.error("Failed to process transparency", e);
    } finally {
      setProcessingId(null);
    }
  };

  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8">
        <div className="w-24 h-24 border-2 border-dashed border-slate-700 rounded-full flex items-center justify-center mb-4">
          <ZoomIn className="w-10 h-10 opacity-50" />
        </div>
        <p className="text-lg font-medium mb-2">No Assets Generated Yet</p>
        <p className="text-sm max-w-md text-center">Use the sidebar controls to describe and generate your first drag racing asset.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6 pb-24 overflow-y-auto">
      {assets.map((asset) => (
        <div key={asset.id} className="group relative bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-xl hover:border-cyan-500/50 transition-all duration-300">
          <div className="aspect-square w-full relative bg-slate-900/50">
            {/* Checkerboard pattern overlay for transparency visualization */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{
                   backgroundImage: 'linear-gradient(45deg, #475569 25%, transparent 25%), linear-gradient(-45deg, #475569 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #475569 75%), linear-gradient(-45deg, transparent 75%, #475569 75%)',
                   backgroundSize: '20px 20px',
                   backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                 }}>
            </div>
            
            <img 
              src={asset.imageUrl} 
              alt={asset.prompt} 
              className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105 z-10 relative"
            />
            
            <div className="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-4 backdrop-blur-sm z-20">
              <button 
                onClick={() => handleDownload(asset)}
                className="p-3 bg-cyan-600 hover:bg-cyan-500 rounded-full text-white shadow-lg transform hover:scale-110 transition-transform"
                title="Download PNG"
              >
                <Download className="w-5 h-5" />
              </button>
              <button 
                onClick={() => processTransparency(asset)}
                disabled={processingId === asset.id}
                className="p-3 bg-indigo-600 hover:bg-indigo-500 rounded-full text-white shadow-lg transform hover:scale-110 transition-transform disabled:opacity-50"
                title="Remove Black Background"
              >
                {processingId === asset.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => onDelete(asset.id)}
                className="p-3 bg-red-600 hover:bg-red-500 rounded-full text-white shadow-lg transform hover:scale-110 transition-transform"
                title="Delete Asset"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-800 border-t border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${
                asset.type === 'car' ? 'bg-orange-900/50 text-orange-400' :
                asset.type === 'track' ? 'bg-emerald-900/50 text-emerald-400' :
                asset.type === 'prop' ? 'bg-purple-900/50 text-purple-400' :
                'bg-blue-900/50 text-blue-400'
              }`}>
                {asset.type}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(asset.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
            <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed" title={asset.prompt}>
              {asset.prompt}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AssetGallery;