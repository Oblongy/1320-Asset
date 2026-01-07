import React from 'react';
import { Download, Trash2, ZoomIn, Clock } from 'lucide-react';
import { GeneratedAsset } from '../types';

interface AssetGalleryProps {
  assets: GeneratedAsset[];
  onDelete: (id: string) => void;
}

const AssetGallery: React.FC<AssetGalleryProps> = ({ assets, onDelete }) => {
  const handleDownload = (asset: GeneratedAsset) => {
    const link = document.createElement('a');
    link.href = asset.imageUrl;
    link.download = `draggen-${asset.type}-${asset.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          {/* Image Container */}
          <div className="aspect-square w-full relative bg-slate-900/50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
             {/* Checkerboard pattern overlay for transparency visualization */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '10px 10px'}}>
            </div>
            
            <img 
              src={asset.imageUrl} 
              alt={asset.prompt} 
              className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
            />
            
            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-4 backdrop-blur-sm">
              <button 
                onClick={() => handleDownload(asset)}
                className="p-3 bg-cyan-600 hover:bg-cyan-500 rounded-full text-white shadow-lg transform hover:scale-110 transition-transform"
                title="Download PNG"
              >
                <Download className="w-5 h-5" />
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

          {/* Info Footer */}
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
