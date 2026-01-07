import React, { useState, useEffect } from 'react';
import { Settings, Car, Map, Cone, Layout, Zap, Image as ImageIcon, Sparkles, PenTool, MousePointer2, Palette, Wrench, Sliders, CheckCircle2 } from 'lucide-react';
import { ArtStyle, AssetType, GenerationConfig } from '../types';

interface SidebarProps {
  config: GenerationConfig;
  isGenerating: boolean;
  onConfigChange: (newConfig: GenerationConfig) => void;
  onGenerate: () => void;
}

const CAR_COLORS = [
  { name: 'Red', class: 'bg-red-500' },
  { name: 'Blue', class: 'bg-blue-500' },
  { name: 'Green', class: 'bg-green-500' },
  { name: 'Yellow', class: 'bg-yellow-400' },
  { name: 'Black', class: 'bg-slate-900' },
  { name: 'White', class: 'bg-slate-100' },
  { name: 'Purple', class: 'bg-purple-500' },
  { name: 'Orange', class: 'bg-orange-500' },
  { name: 'Silver', class: 'bg-slate-400' },
  { name: 'Gold', class: 'bg-yellow-600' },
];

const BODY_STYLES = ['Classic Muscle', 'Modern Supercar', 'Tuner / JDM', 'Pro Mod Dragster', 'Vintage Hot Rod', 'Funny Car', 'Pickup Truck'];
const DECAL_STYLES = ['None', 'Dual Racing Stripes', 'Side Flames', 'Lightning Bolt Pattern', 'Sponsor Logos', 'Skull Livery', 'Geometric Camo'];
const SPOILER_TYPES = ['No Spoiler', 'Lip Spoiler', 'GT Wing', 'Drag Wing', 'Parachute Pack'];
const HOOD_TYPES = ['Stock Hood', 'Cowl Induction', 'Supercharger Blower', 'Velocity Stacks', 'Vented Carbon'];

const Sidebar: React.FC<SidebarProps> = ({ config, isGenerating, onConfigChange, onGenerate }) => {
  const [useCarBuilder, setUseCarBuilder] = useState(true);
  const [carOptions, setCarOptions] = useState({
    color: 'Red',
    body: 'Classic Muscle',
    decals: 'Dual Racing Stripes',
    spoiler: 'Drag Wing',
    hood: 'Supercharger Blower'
  });
  
  const handleTypeChange = (type: AssetType) => {
    onConfigChange({ ...config, type });
  };

  const handleStyleChange = (style: ArtStyle) => {
    onConfigChange({ ...config, style });
  };

  const handleAspectRatioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onConfigChange({ ...config, aspectRatio: e.target.value as any });
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onConfigChange({ ...config, prompt: e.target.value });
  };

  // Update prompt when builder options change
  useEffect(() => {
    if (config.type === 'car' && useCarBuilder) {
      const parts = [
        `A ${carOptions.color.toLowerCase()} ${carOptions.body.toLowerCase()} drag racing car.`,
        `Features a ${carOptions.hood.toLowerCase()} on the hood`,
        `and a ${carOptions.spoiler.toLowerCase()} on the rear.`,
        carOptions.decals !== 'None' ? `Decorated with ${carOptions.decals.toLowerCase()} decals.` : 'Clean bodywork, no decals.',
        'Top-down view, symmetrical, isolated on plain background.'
      ];
      onConfigChange({ ...config, prompt: parts.join(' ') });
    }
  }, [carOptions, useCarBuilder, config.type]);

  return (
    <div className="w-full md:w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8 text-cyan-400">
          <Settings className="w-6 h-6 animate-spin-slow" />
          <h2 className="text-xl font-bold brand-font tracking-wide">CONFIG</h2>
        </div>

        {/* Asset Type Selection */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Asset Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleTypeChange('car')}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${config.type === 'car' ? 'bg-cyan-950/50 border-cyan-500 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
            >
              <Car className="w-6 h-6 mb-1" />
              <span className="text-xs">Car Builder</span>
            </button>
            <button
              onClick={() => handleTypeChange('track')}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${config.type === 'track' ? 'bg-cyan-950/50 border-cyan-500 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
            >
              <Map className="w-6 h-6 mb-1" />
              <span className="text-xs">Track</span>
            </button>
            <button
              onClick={() => handleTypeChange('prop')}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${config.type === 'prop' ? 'bg-cyan-950/50 border-cyan-500 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
            >
              <Cone className="w-6 h-6 mb-1" />
              <span className="text-xs">Prop</span>
            </button>
            <button
              onClick={() => handleTypeChange('ui')}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${config.type === 'ui' ? 'bg-cyan-950/50 border-cyan-500 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
            >
              <Layout className="w-6 h-6 mb-1" />
              <span className="text-xs">UI</span>
            </button>
          </div>
        </div>

        {/* Art Style Selection */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Art Style</label>
          <div className="grid grid-cols-2 gap-2">
             {[
               { id: 'pixel', label: 'Pixel Art', icon: MousePointer2 },
               { id: 'vector', label: 'Vector', icon: PenTool },
               { id: 'realistic', label: 'Realistic', icon: ImageIcon },
               { id: 'neon', label: 'Neon', icon: Zap },
               { id: 'blueprint', label: 'Blueprint', icon: Layout },
               { id: 'sketch', label: 'Sketch', icon: Sparkles },
             ].map((styleOption) => (
                <button
                  key={styleOption.id}
                  onClick={() => handleStyleChange(styleOption.id as ArtStyle)}
                  className={`flex items-center gap-2 p-2 px-3 rounded text-sm border transition-all ${config.style === styleOption.id ? 'bg-indigo-950/50 border-indigo-500 text-indigo-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                >
                  <styleOption.icon className="w-4 h-4" />
                  <span>{styleOption.label}</span>
                </button>
             ))}
          </div>
        </div>

        {/* Aspect Ratio */}
        <div className="mb-6">
           <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Aspect Ratio</label>
           <select 
             value={config.aspectRatio} 
             onChange={handleAspectRatioChange}
             className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2.5"
           >
             <option value="1:1">1:1 (Square)</option>
             <option value="3:4">3:4 (Portrait)</option>
             <option value="4:3">4:3 (Landscape)</option>
             <option value="16:9">16:9 (Wide)</option>
             <option value="9:16">9:16 (Tall)</option>
           </select>
        </div>

        {/* CAR CUSTOMIZER UI */}
        {config.type === 'car' && (
           <div className="mb-6 bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-bold text-slate-200">Car Customizer</span>
                </div>
                <button 
                  onClick={() => setUseCarBuilder(!useCarBuilder)}
                  className="text-xs text-cyan-500 hover:text-cyan-400 underline"
                >
                  {useCarBuilder ? 'Use Manual Prompt' : 'Use Builder'}
                </button>
              </div>

              {useCarBuilder ? (
                <div className="space-y-4">
                  {/* Paint Color */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2 flex items-center gap-1">
                      <Palette className="w-3 h-3" /> Paint Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {CAR_COLORS.map((c) => (
                        <button
                          key={c.name}
                          onClick={() => setCarOptions({...carOptions, color: c.name})}
                          title={c.name}
                          className={`w-6 h-6 rounded-full ${c.class} ring-2 ring-offset-2 ring-offset-slate-900 transition-all ${carOptions.color === c.name ? 'ring-cyan-500 scale-110' : 'ring-transparent hover:scale-110'}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Body Style */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Body Style</label>
                    <select 
                      value={carOptions.body}
                      onChange={(e) => setCarOptions({...carOptions, body: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 text-xs rounded p-2"
                    >
                      {BODY_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Decals */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Decals</label>
                    <select 
                      value={carOptions.decals}
                      onChange={(e) => setCarOptions({...carOptions, decals: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 text-xs rounded p-2"
                    >
                      {DECAL_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Aero / Parts */}
                  <div className="grid grid-cols-2 gap-2">
                     <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Spoiler</label>
                        <select 
                          value={carOptions.spoiler}
                          onChange={(e) => setCarOptions({...carOptions, spoiler: e.target.value})}
                          className="w-full bg-slate-900 border border-slate-700 text-xs rounded p-2"
                        >
                          {SPOILER_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Hood</label>
                        <select 
                          value={carOptions.hood}
                          onChange={(e) => setCarOptions({...carOptions, hood: e.target.value})}
                          className="w-full bg-slate-900 border border-slate-700 text-xs rounded p-2"
                        >
                          {HOOD_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                     </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic p-2 border border-dashed border-slate-700 rounded text-center">
                  Manual prompt mode enabled. Use the text box below.
                </div>
              )}
           </div>
        )}

        {/* Prompt Input */}
        <div className="mb-6 flex-grow">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
             {config.type === 'car' && useCarBuilder ? 'Generated Prompt' : 'Description'}
          </label>
          <textarea
            value={config.prompt}
            onChange={handlePromptChange}
            readOnly={config.type === 'car' && useCarBuilder}
            placeholder="e.g. Red muscle car with white stripes and a supercharger..."
            className={`w-full h-32 bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 p-3 resize-none ${config.type === 'car' && useCarBuilder ? 'opacity-60 cursor-not-allowed' : ''}`}
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={onGenerate}
          disabled={isGenerating || !config.prompt.trim()}
          className={`w-full py-4 rounded-lg font-bold text-lg brand-font tracking-wider transition-all shadow-lg
            ${isGenerating 
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-900/50'
            }`}
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </span>
          ) : (
            'GENERATE ASSET'
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
