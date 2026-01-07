import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Car, Map, Cone, Layout, Zap, Image as ImageIcon, Sparkles, PenTool, MousePointer2, Palette, Wrench, Sliders, CheckCircle2, Flag, Trees, Grid, ArrowUp, Box, Layers, Flame, Wind, ChevronDown, GripVertical, Monitor, Terminal } from 'lucide-react';
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
const WHEEL_TYPES = ['Stock Rims', 'Drag Slicks', 'Chrome Mag Wheels', 'Black Racing Alloys', 'Wire Spoke', 'Carbon Fiber'];
const TINT_STYLES = ['Clear Glass', 'Dark Smoke', 'Limo Black', 'Mirror Chrome', 'Red Tint', 'Blue Tint'];
const VENT_STYLES = ['Standard', 'Side Exhaust', 'Fender Vents', 'Roof Scoop', 'Rear Diffuser', 'Widebody Fenders'];
// Expanded Body Kits
const BODY_KITS = ['Stock Body', 'Widebody Kit', 'Rally Aero', 'Rocket Bunny Style', 'Time Attack Aero', 'Dakar Rally Inspired', 'Canard & Winglets', 'Stealth Bomber'];
const UNDERGLOW = ['None', 'Neon Blue', 'Neon Red', 'Neon Green', 'Neon Purple', 'Neon White'];
const ACTION_FX = ['Static / Clean', 'Tire Smoke', 'Exhaust Flames', 'Nitro Flames & Smoke', 'Drifting Smoke'];

// Track Builder Constants
const TRACK_SEGMENTS = ['Straight Road', 'Slight Curve Left', 'Slight Curve Right', 'Sharp Turn', 'Start Line', 'Finish Line', 'Staging Area'];
const TRACK_SURFACES = ['Dark Asphalt', 'Grey Concrete', 'Dirt / Gravel', 'Wet Tarmac', 'Neon Grid', 'Ice / Snow'];
const TRACK_LANES = ['1 Lane', '2 Lanes (Standard)', '4 Lanes (Wide)'];
const TRACK_ENVIRONMENTS = ['Pro Stadium', 'Desert Highway', 'City Street Night', 'Forest Road', 'Industrial Zone', 'Sci-Fi Tunnel'];
const TRACK_DETAILS = ['No Details', 'Tire Barriers', 'Concrete Walls', 'Grass Borders', 'Grandstands', 'Street Lights'];

// Reusable Section Component for Streamlined UI
const SidebarSection: React.FC<{
  title: string;
  icon: React.ElementType;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ title, icon: Icon, isOpen, onToggle, children }) => (
  <div className="mb-3 border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40 shadow-sm transition-all duration-200">
    <button
      onClick={onToggle}
      className={`w-full flex items-center justify-between p-4 transition-colors ${isOpen ? 'bg-slate-800/60 text-slate-200' : 'bg-transparent text-slate-400 hover:bg-slate-800/30'}`}
    >
      <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest">
        <Icon className={`w-4 h-4 ${isOpen ? 'text-cyan-400' : 'text-slate-500'}`} />
        {title}
      </div>
      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-cyan-500' : 'text-slate-600'}`} />
    </button>
    
    {isOpen && (
      <div className="p-4 border-t border-slate-800/50 animate-in slide-in-from-top-2 fade-in duration-200">
        {children}
      </div>
    )}
  </div>
);

const Sidebar: React.FC<SidebarProps> = ({ config, isGenerating, onConfigChange, onGenerate }) => {
  // Sidebar Resize State
  const [sidebarWidth, setSidebarWidth] = useState(360);
  const [isResizing, setIsResizing] = useState(false);

  // Collapsible Section State
  const [sections, setSections] = useState({
    general: true,
    dimensions: true,
    builder: true,
    generation: true
  });

  // Car Builder State
  const [useCarBuilder, setUseCarBuilder] = useState(true);
  const [carOptions, setCarOptions] = useState({
    color: 'Red',
    body: 'Classic Muscle',
    decals: 'Dual Racing Stripes',
    spoiler: 'Drag Wing',
    hood: 'Supercharger Blower',
    wheels: 'Drag Slicks',
    tint: 'Dark Smoke',
    vents: 'Side Exhaust',
    bodyKit: 'Stock Body',
    underglow: 'None',
    fx: 'Static / Clean'
  });

  // Track Builder State
  const [useTrackBuilder, setUseTrackBuilder] = useState(true);
  const [trackOptions, setTrackOptions] = useState({
    segment: 'Straight Road',
    surface: 'Dark Asphalt',
    lanes: '2 Lanes (Standard)',
    environment: 'Pro Stadium',
    details: 'Tire Barriers'
  });
  
  // Resize Logic
  const startResizing = useCallback(() => setIsResizing(true), []);
  const stopResizing = useCallback(() => setIsResizing(false), []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      let newWidth = e.clientX;
      if (newWidth < 260) newWidth = 260;
      if (newWidth > 600) newWidth = 600;
      setSidebarWidth(newWidth);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, stopResizing]);

  const toggleSection = (section: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleTypeChange = (type: AssetType) => {
    onConfigChange({ ...config, type });
  };

  const handleStyleChange = (style: ArtStyle) => {
    onConfigChange({ ...config, style });
  };

  const handleAspectRatioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onConfigChange({ ...config, aspectRatio: e.target.value as any });
  };

  const handlePerspectiveChange = (val: 'top-down' | 'isometric') => {
    onConfigChange({ ...config, perspective: val });
  }

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onConfigChange({ ...config, prompt: e.target.value });
  };

  // Update prompt for Car Builder
  useEffect(() => {
    if (config.type === 'car' && useCarBuilder) {
      const parts = [
        `A ${carOptions.color.toLowerCase()} ${carOptions.body.toLowerCase()} drag racing car.`,
        config.perspective === 'isometric' ? 'Shown in 2.5D Isometric view.' : 'Shown in Top-down view.',
        `Fitted with ${carOptions.wheels.toLowerCase()}, ${carOptions.bodyKit.toLowerCase()}, and ${carOptions.tint.toLowerCase()} windows.`,
        `Features a ${carOptions.hood.toLowerCase()}`,
        carOptions.vents !== 'Standard' ? `and ${carOptions.vents.toLowerCase()}.` : '.',
        `The rear has a ${carOptions.spoiler.toLowerCase()}.`,
        carOptions.decals !== 'None' ? `Decorated with ${carOptions.decals.toLowerCase()} decals.` : 'Clean bodywork, no decals.',
        carOptions.underglow !== 'None' ? `Glowing with ${carOptions.underglow.toLowerCase()} under the chassis.` : '',
        carOptions.fx !== 'Static / Clean' ? `Action shot featuring ${carOptions.fx.toLowerCase()}.` : '',
        'Isolated on plain background.'
      ];
      onConfigChange({ ...config, prompt: parts.join(' ') });
    }
  }, [carOptions, useCarBuilder, config.type, config.perspective]);

  // Update prompt for Track Builder
  useEffect(() => {
    if (config.type === 'track' && useTrackBuilder) {
      const parts = [
        `${config.perspective === 'isometric' ? '2.5D Isometric view' : 'Top-down view'} of a ${trackOptions.lanes.toLowerCase()} drag racing track.`,
        `Segment type: ${trackOptions.segment}.`,
        `Surface material: ${trackOptions.surface}.`,
        `Setting: ${trackOptions.environment}.`,
        trackOptions.details !== 'No Details' ? `Features ${trackOptions.details.toLowerCase()} on the edges.` : 'Clean edges.',
        'Game map asset.'
      ];
      onConfigChange({ ...config, prompt: parts.join(' ') });
    }
  }, [trackOptions, useTrackBuilder, config.type, config.perspective]);

  return (
    <div 
      style={{ width: sidebarWidth }} 
      className="relative flex-shrink-0 bg-slate-950 border-r border-slate-900 flex flex-col h-full group"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-900 bg-slate-950 z-10">
        <div className="flex items-center gap-3 text-cyan-400">
          <div className="p-2 bg-cyan-950/30 rounded-lg">
            <Settings className={`w-5 h-5 ${isGenerating ? 'animate-spin-slow' : ''}`} />
          </div>
          <div>
            <h2 className="text-lg font-bold brand-font tracking-wide text-slate-100">CONFIGURATOR</h2>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Customize Parameters</p>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2">
        
        {/* SECTION 1: GENERAL (Asset Type & Style) */}
        <SidebarSection 
          title="General Settings" 
          icon={Sliders} 
          isOpen={sections.general} 
          onToggle={() => toggleSection('general')}
        >
          {/* Asset Type */}
          <div className="mb-4">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Asset Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleTypeChange('car')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200 ${config.type === 'car' ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_-3px_rgba(6,182,212,0.15)]' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-800'}`}
              >
                <Car className="w-5 h-5 mb-1.5" />
                <span className="text-[10px] font-medium">Vehicle</span>
              </button>
              <button
                onClick={() => handleTypeChange('track')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200 ${config.type === 'track' ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_-3px_rgba(6,182,212,0.15)]' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-800'}`}
              >
                <Map className="w-5 h-5 mb-1.5" />
                <span className="text-[10px] font-medium">Track</span>
              </button>
              <button
                onClick={() => handleTypeChange('prop')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200 ${config.type === 'prop' ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_-3px_rgba(6,182,212,0.15)]' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-800'}`}
              >
                <Cone className="w-5 h-5 mb-1.5" />
                <span className="text-[10px] font-medium">Prop</span>
              </button>
              <button
                onClick={() => handleTypeChange('ui')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200 ${config.type === 'ui' ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_-3px_rgba(6,182,212,0.15)]' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-800'}`}
              >
                <Layout className="w-5 h-5 mb-1.5" />
                <span className="text-[10px] font-medium">Interface</span>
              </button>
            </div>
          </div>

          {/* Art Style */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Art Style</label>
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
                    className={`flex items-center gap-2 p-2 px-3 rounded text-xs border transition-all ${config.style === styleOption.id ? 'bg-indigo-950/30 border-indigo-500/50 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                  >
                    <styleOption.icon className="w-3.5 h-3.5" />
                    <span>{styleOption.label}</span>
                  </button>
               ))}
            </div>
          </div>
        </SidebarSection>

        {/* SECTION 2: DIMENSIONS */}
        <SidebarSection 
          title="Dimensions & View" 
          icon={Monitor} 
          isOpen={sections.dimensions} 
          onToggle={() => toggleSection('dimensions')}
        >
          <div className="space-y-4">
             <div>
                 <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Perspective</label>
                 <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                    <button 
                      onClick={() => handlePerspectiveChange('top-down')}
                      className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-md text-xs font-medium transition-all ${config.perspective === 'top-down' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      <ArrowUp className="w-3.5 h-3.5" /> Top Down
                    </button>
                    <button 
                      onClick={() => handlePerspectiveChange('isometric')}
                      className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-md text-xs font-medium transition-all ${config.perspective === 'isometric' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      <Box className="w-3.5 h-3.5" /> 2.5D Iso
                    </button>
                 </div>
             </div>
             <div>
                 <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Aspect Ratio</label>
                 <select 
                   value={config.aspectRatio} 
                   onChange={handleAspectRatioChange}
                   className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 block p-2.5"
                 >
                   <option value="1:1">1:1 (Square)</option>
                   <option value="3:4">3:4 (Portrait)</option>
                   <option value="4:3">4:3 (Landscape)</option>
                   <option value="16:9">16:9 (Widescreen)</option>
                   <option value="9:16">9:16 (Mobile)</option>
                 </select>
             </div>
          </div>
        </SidebarSection>

        {/* SECTION 3: BUILDER (Dynamic) */}
        {(config.type === 'car' || config.type === 'track') && (
          <SidebarSection 
            title={config.type === 'car' ? 'Vehicle Forge' : 'Track Architect'} 
            icon={config.type === 'car' ? Wrench : Flag}
            isOpen={sections.builder}
            onToggle={() => toggleSection('builder')}
          >
             {config.type === 'car' && (
               <div className="space-y-4">
                  <div className="flex justify-end">
                    <button 
                      onClick={() => setUseCarBuilder(!useCarBuilder)}
                      className="text-[10px] font-bold text-cyan-600 hover:text-cyan-400 uppercase tracking-wider flex items-center gap-1"
                    >
                      {useCarBuilder ? 'Switch to Manual' : 'Switch to Builder'} <Terminal className="w-3 h-3" />
                    </button>
                  </div>

                  {useCarBuilder ? (
                    <div className="space-y-4 animate-in fade-in">
                      {/* Paint Color */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                          <Palette className="w-3 h-3" /> Paint Color
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {CAR_COLORS.map((c) => (
                            <button
                              key={c.name}
                              onClick={() => setCarOptions({...carOptions, color: c.name})}
                              title={c.name}
                              className={`w-6 h-6 rounded-md ${c.class} ring-2 ring-offset-2 ring-offset-slate-900 transition-all ${carOptions.color === c.name ? 'ring-cyan-500 scale-110' : 'ring-transparent hover:scale-105 opacity-80 hover:opacity-100'}`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Body Style */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Chassis</label>
                        <select 
                          value={carOptions.body}
                          onChange={(e) => setCarOptions({...carOptions, body: e.target.value})}
                          className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg p-2.5 focus:border-cyan-500 outline-none"
                        >
                          {BODY_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>

                      {/* Body Kit & Decals */}
                       <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Aero Kit</label>
                            <select 
                              value={carOptions.bodyKit}
                              onChange={(e) => setCarOptions({...carOptions, bodyKit: e.target.value})}
                              className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg p-2.5 focus:border-cyan-500 outline-none"
                            >
                              {BODY_KITS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Livery</label>
                            <select 
                              value={carOptions.decals}
                              onChange={(e) => setCarOptions({...carOptions, decals: e.target.value})}
                              className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg p-2.5 focus:border-cyan-500 outline-none"
                            >
                              {DECAL_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-3">
                         <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Induction</label>
                            <select 
                              value={carOptions.hood}
                              onChange={(e) => setCarOptions({...carOptions, hood: e.target.value})}
                              className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg p-2.5 focus:border-cyan-500 outline-none"
                            >
                              {HOOD_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                         </div>
                         <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Rear Wing</label>
                            <select 
                              value={carOptions.spoiler}
                              onChange={(e) => setCarOptions({...carOptions, spoiler: e.target.value})}
                              className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg p-2.5 focus:border-cyan-500 outline-none"
                            >
                              {SPOILER_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                         </div>
                         <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Rims/Tires</label>
                            <select 
                              value={carOptions.wheels}
                              onChange={(e) => setCarOptions({...carOptions, wheels: e.target.value})}
                              className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg p-2.5 focus:border-cyan-500 outline-none"
                            >
                              {WHEEL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                         </div>
                         <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Venting</label>
                            <select 
                              value={carOptions.vents}
                              onChange={(e) => setCarOptions({...carOptions, vents: e.target.value})}
                              className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg p-2.5 focus:border-cyan-500 outline-none"
                            >
                              {VENT_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                         </div>
                      </div>

                      {/* Action FX & Underglow */}
                      <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                         <label className="block text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                           <Flame className="w-3 h-3" /> Special FX
                         </label>
                         <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Underglow</label>
                                <select 
                                  value={carOptions.underglow}
                                  onChange={(e) => setCarOptions({...carOptions, underglow: e.target.value})}
                                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg p-2 focus:border-cyan-500 outline-none"
                                >
                                  {UNDERGLOW.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Particles</label>
                                <select 
                                  value={carOptions.fx}
                                  onChange={(e) => setCarOptions({...carOptions, fx: e.target.value})}
                                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg p-2 focus:border-cyan-500 outline-none"
                                >
                                  {ACTION_FX.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                         </div>
                         <div className="mt-3">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Tinting</label>
                            <select 
                              value={carOptions.tint}
                              onChange={(e) => setCarOptions({...carOptions, tint: e.target.value})}
                              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg p-2 focus:border-cyan-500 outline-none"
                            >
                              {TINT_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                         </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic p-4 border border-dashed border-slate-800 rounded-lg text-center bg-slate-900/30">
                      Manual prompt mode enabled. Use the description box below.
                    </div>
                  )}
               </div>
             )}

             {config.type === 'track' && (
               <div className="space-y-4">
                  <div className="flex justify-end">
                    <button 
                      onClick={() => setUseTrackBuilder(!useTrackBuilder)}
                      className="text-[10px] font-bold text-emerald-600 hover:text-emerald-400 uppercase tracking-wider flex items-center gap-1"
                    >
                      {useTrackBuilder ? 'Switch to Manual' : 'Switch to Builder'} <Terminal className="w-3 h-3" />
                    </button>
                  </div>

                  {useTrackBuilder ? (
                    <div className="space-y-4 animate-in fade-in">
                      {/* Segment Type */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                          <ArrowUp className="w-3 h-3" /> Segment Shape
                        </label>
                        <select 
                          value={trackOptions.segment}
                          onChange={(e) => setTrackOptions({...trackOptions, segment: e.target.value})}
                          className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg p-2.5 focus:border-emerald-500 outline-none"
                        >
                          {TRACK_SEGMENTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>

                      {/* Surface Material */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                          <Grid className="w-3 h-3" /> Surface Material
                        </label>
                        <select 
                          value={trackOptions.surface}
                          onChange={(e) => setTrackOptions({...trackOptions, surface: e.target.value})}
                          className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg p-2.5 focus:border-emerald-500 outline-none"
                        >
                          {TRACK_SURFACES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>

                      {/* Lanes */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Width / Lanes</label>
                        <select 
                          value={trackOptions.lanes}
                          onChange={(e) => setTrackOptions({...trackOptions, lanes: e.target.value})}
                          className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg p-2.5 focus:border-emerald-500 outline-none"
                        >
                          {TRACK_LANES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>

                      {/* Environment */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                          <Trees className="w-3 h-3" /> Biome
                        </label>
                        <select 
                          value={trackOptions.environment}
                          onChange={(e) => setTrackOptions({...trackOptions, environment: e.target.value})}
                          className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg p-2.5 focus:border-emerald-500 outline-none"
                        >
                          {TRACK_ENVIRONMENTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>

                      {/* Props/Details */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Side Objects</label>
                        <select 
                          value={trackOptions.details}
                          onChange={(e) => setTrackOptions({...trackOptions, details: e.target.value})}
                          className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg p-2.5 focus:border-emerald-500 outline-none"
                        >
                          {TRACK_DETAILS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic p-4 border border-dashed border-slate-800 rounded-lg text-center bg-slate-900/30">
                      Manual prompt mode enabled. Use the description box below.
                    </div>
                  )}
               </div>
             )}
          </SidebarSection>
        )}

        {/* SECTION 4: GENERATION (Prompt & Button) */}
        <SidebarSection 
          title="Generation" 
          icon={Zap}
          isOpen={sections.generation}
          onToggle={() => toggleSection('generation')}
        >
          <div className="space-y-4">
             <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                   {(config.type === 'car' && useCarBuilder) || (config.type === 'track' && useTrackBuilder) ? 'Final Prompt Preview' : 'Asset Description'}
                </label>
                <textarea
                  value={config.prompt}
                  onChange={handlePromptChange}
                  readOnly={(config.type === 'car' && useCarBuilder) || (config.type === 'track' && useTrackBuilder)}
                  placeholder="e.g. Red muscle car with white stripes and a supercharger..."
                  className={`w-full h-24 bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 p-3 resize-none custom-scrollbar ${((config.type === 'car' && useCarBuilder) || (config.type === 'track' && useTrackBuilder)) ? 'opacity-70 cursor-not-allowed bg-slate-950' : ''}`}
                />
             </div>
             
             <button
                onClick={onGenerate}
                disabled={isGenerating || !config.prompt.trim()}
                className={`w-full py-3.5 rounded-lg font-bold text-sm brand-font tracking-wider transition-all shadow-lg transform active:scale-95
                  ${isGenerating 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed animate-pulse border border-slate-700' 
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-900/30 border border-cyan-500/30'
                  }`}
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </span>
                ) : (
                  'GENERATE ASSET'
                )}
              </button>
          </div>
        </SidebarSection>
      </div>
      
      {/* Resizer Handle */}
      <div 
         className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-cyan-500/50 transition-colors z-50 flex items-center justify-center group opacity-0 hover:opacity-100"
         onMouseDown={startResizing}
      >
         <div className="h-8 w-1 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
      </div>
    </div>
  );
};

export default Sidebar;