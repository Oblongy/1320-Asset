import React, { useState, useEffect } from 'react';
import { Rocket, Github, Info, Layers, Image as ImageIcon, PenTool } from 'lucide-react';
import Sidebar from './components/Sidebar';
import AssetGallery from './components/AssetGallery';
import Workbench from './components/Workbench';
import { generateAsset } from './services/geminiService';
import { GeneratedAsset, GenerationConfig } from './types';

const App: React.FC = () => {
  const [config, setConfig] = useState<GenerationConfig>({
    prompt: '',
    type: 'car',
    style: 'vector',
    aspectRatio: '1:1',
    perspective: 'top-down'
  });

  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'gallery' | 'workbench'>('gallery');

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('draggen-assets');
    if (saved) {
      try {
        setAssets(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load local storage assets");
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('draggen-assets', JSON.stringify(assets));
  }, [assets]);

  const handleGenerate = async () => {
    if (!config.prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const imageUrl = await generateAsset(config);
      
      const newAsset: GeneratedAsset = {
        id: crypto.randomUUID(),
        imageUrl,
        prompt: config.prompt,
        type: config.type,
        style: config.style,
        timestamp: Date.now()
      };

      setAssets(prev => [newAsset, ...prev]);
    } catch (err: any) {
      setError(err.message || "Failed to generate asset. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">
      {/* Sidebar Controls */}
      <Sidebar 
        config={config} 
        isGenerating={isGenerating} 
        onConfigChange={setConfig} 
        onGenerate={handleGenerate}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-cyan-500 to-blue-600 p-2 rounded-lg shadow-lg shadow-cyan-500/20">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold brand-font text-white tracking-widest">DRAG<span className="text-cyan-400">GEN</span></h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">AI Powered Asset Forge</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex bg-slate-900/50 p-1 rounded-lg border border-slate-800">
               <button 
                  onClick={() => setCurrentView('gallery')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${currentView === 'gallery' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
               >
                  <ImageIcon className="w-4 h-4" /> Gallery
               </button>
               <button 
                  onClick={() => setCurrentView('workbench')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${currentView === 'workbench' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
               >
                  <PenTool className="w-4 h-4" /> Workbench
               </button>
            </div>
            
             <div className="hidden md:flex items-center gap-1 bg-slate-800 px-3 py-1 rounded-full border border-slate-700 text-sm text-slate-400">
               <Layers className="w-3 h-3 text-cyan-500" />
               <span>Model: Gemini 2.5 Flash</span>
             </div>
          </div>
        </header>

        {/* Error Notification */}
        {error && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-900/90 border border-red-500 text-white px-6 py-3 rounded-lg shadow-2xl z-50 flex items-center gap-3 animate-fade-in-down">
            <Info className="w-5 h-5" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-2 font-bold hover:text-red-200">×</button>
          </div>
        )}

        {/* Canvas / Gallery Area */}
        <main className="flex-1 overflow-hidden relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
          {currentView === 'gallery' ? (
             <AssetGallery assets={assets} onDelete={handleDelete} />
          ) : (
             <Workbench assets={assets} />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;