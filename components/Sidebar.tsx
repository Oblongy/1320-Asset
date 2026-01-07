import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Car, Map, Cone, Layout, Zap, Image as ImageIcon, Sparkles, PenTool, MousePointer2, Palette, Wrench, Sliders, CheckCircle2, Flag, Trees, Grid, ArrowUp, Box, Layers, Flame, Wind, ChevronDown, GripVertical, Monitor, Terminal, CircleDashed, Disc, PaintBucket, Eye, Cpu, MousePointer, Component, Circle, Aperture, Minimize2, Maximize2, MoveHorizontal, AlignJustify, Square, Hash, Type, Activity, Copy, ShieldCheck, BoxSelect, Eraser } from 'lucide-react';
import { ArtStyle, AssetType, GenerationConfig } from '../types';

interface SidebarProps {
  config: GenerationConfig;
  isGenerating: boolean;
  onConfigChange: (newConfig: GenerationConfig) => void;
  onGenerate: (isSet?: boolean, selectedPerspectives?: string[]) => void;
}

// --- CONSTANTS ---

const PERSPECTIVE_OPTIONS = [
  { id: 'top-down', label: 'Top Down', icon: ArrowUp },
  { id: 'isometric', label: 'Isometric', icon: Box },
  { id: 'side', label: 'Side', icon: Layers },
  { id: 'front', label: 'Front', icon: Eye },
  { id: 'rear', label: 'Rear', icon: CircleDashed },
];

const CAR_COLORS = [
  { name: 'Red', hex: '#ef4444' },
  { name: 'Crimson', hex: '#991b1b' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Lime', hex: '#84cc16' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Teal', hex: '#14b8a6' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Sky', hex: '#0ea5e9' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Violet', hex: '#8b5cf6' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Fuchsia', hex: '#d946ef' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'White', hex: '#f8fafc' },
  { name: 'Silver', hex: '#94a3b8' },
  { name: 'Grey', hex: '#64748b' },
  { name: 'Black', hex: '#020617' },
  { name: 'Bronze', hex: '#78350f' },
  { name: 'Gold', hex: '#ca8a04' },
];

const PAINT_FINISHES = [
  'Gloss (Standard)', 'Matte / Flat', 'Metallic', 'Satin', 'Chrome', 'Pearlescent', 
  'Color Shift / Chameleon', 'Carbon Fiber Wrap', 'Rusty / Patina', 'Camo Wrap'
];

const RIM_STYLES = [
  'TE37 Style (6-Spoke)', 'RPF1 Style (Twin Spoke)', 'Work Meister (Deep Dish)', 'CE28 Style (Multi-spoke)', 'Advan 3-Spoke',
  'Weld Racing (Magnum)', 'Drag Star (5-Spoke)', 'Beadlock Drag', 'Solid Disc (Aero)', 'Skinny Front Runners', 'Centerline Convo Pro',
  'Cragar S/S', 'Torq Thrust', 'Steelies (Black)', 'Steelies (Chrome Hub)', 'Wire Spoke (Dayton)', 'Rallye Wheels',
  'Rotiform Aerodisc', 'BBS Mesh (RS)', 'Turbofan', 'Concave 5-Spoke', 'Split 5-Spoke', 'ASANTI AF141',
  'Spinner Rims', 'Neon Light-Up', 'Transparent/Glass', 'Gold Plated'
];

const RIM_DEPTH_OPTIONS = [
  { id: 'Standard Depth', label: 'Standard', icon: Disc, desc: 'Factory look' },
  { id: 'Deep Dish', label: 'Deep Dish', icon: Maximize2, desc: 'Large outer lip' },
  { id: 'Concave', label: 'Concave', icon: Minimize2, desc: 'Inward curve' },
  { id: 'Super Deep Concave', label: 'Super Deep', icon: Aperture, desc: 'Extreme curve' },
  { id: 'Flat Face', label: 'Flat Face', icon: Square, desc: 'Minimal depth' },
  { id: 'Step Lip', label: 'Step Lip', icon: Layers, desc: 'Multi-stage lip' },
];

const TIRE_FITMENT_OPTIONS = [
  { id: 'Slight Tuck', label: 'Tucked', icon: Minimize2, desc: 'Inside fender' },
  { id: 'Flush Fitment', label: 'Flush', icon: AlignJustify, desc: 'Even with fender' },
  { id: 'Aggressive Poke', label: 'Poke', icon: Maximize2, desc: 'Outside fender' },
  { id: 'Hellaflush', label: 'Hellaflush', icon: Aperture, desc: 'Tucked & angled' },
  { id: 'Natural Fit', label: 'Natural', icon: Circle, desc: 'Standard OEM' },
  { id: 'Track Spec', label: 'Track', icon: Activity, desc: 'Functional gap' },
];

const TIRE_PROFILE_OPTIONS = [
  { id: 'Rubber-Band (Ultra Low)', label: 'Rubber Band', desc: 'Ultra-thin sidewall' },
  { id: 'Low Profile Performance', label: 'Low Pro', desc: 'Standard sport tire' },
  { id: 'Street Radial', label: 'Street', desc: 'Daily driver profile' },
  { id: 'Beefy / Muscle', label: 'Beefy', desc: 'Thick muscle car look' },
  { id: 'Fat Drag Slick', label: 'Fat Slick', desc: 'Wrinkle-wall drag look' },
];

const CAR_GROUPS = [
  {
    category: "JDM Icons (Classic & 90s)",
    cars: [
      "Nissan Skyline GT-R R34 V-Spec", "Nissan Skyline GT-R R33", "Nissan Skyline GT-R R32",
      "Toyota Supra MK4 (JZA80)", "Mazda RX-7 FD Spirit R", "Honda NSX-R (NA2)",
      "Mitsubishi Lancer Evolution IX", "Mitsubishi Lancer Evolution VI TME",
      "Subaru Impreza 22B STi", "Nissan Silvia S15 Spec-R", "Nissan Silvia S14 Kouki",
      "Nissan 180SX Type X", "Honda S2000 CR", "Toyota AE86 Sprinter Trueno",
      "Mazda RX-7 FC3S", "Mitsubishi 3000GT VR-4", "Toyota Celica GT-Four ST205",
      "Honda Integra Type R DC2", "Honda Civic Type R EK9", "Toyota Chaser JZX100",
      "Toyota Mark II JZX110", "Nissan Laurel C33", "Nissan Cefiro A31",
      "Nissan Pulsar GTI-R", "Mitsubishi Galant VR-4", "Subaru Legacy RS",
      "Honda Accord Euro R (CL7)", "Lexus IS300 (SXE10)", "Mazda RX-3",
      "Datsun 240Z", "Datsun 510", "Toyota Starlet PC1", "Nissan Sunny Truck (B120)"
    ]
  },
  {
    category: "Modern JDM & Tuners",
    cars: [
      "Nissan Z (RZ34)", "Toyota GR Supra (A90)", "Toyota GR Corolla",
      "Honda Civic Type R (FK8)", "Honda Civic Type R (FL5)", "Toyota GR86",
      "Subaru BRZ (Gen 2)", "Nissan GT-R (R35) Nismo", "Lexus LC500",
      "Lexus RC F", "Acura NSX Type S (NC1)", "Mazda MX-5 Miata (ND2)",
      "Subaru WRX (VB)", "Mitsubishi Lancer Evolution Final Edition"
    ]
  },
  {
    category: "Hot Hatches & Street Tuners",
    cars: [
      "Volkswagen Golf GTI (MK8)", "Volkswagen Golf R (MK8)", "Hyundai I30N",
      "Ford Fiesta ST", "Ford Focus RS (MK3)", "Renault Megane RS Trophy",
      "Mini John Cooper Works GP", "Audi RS3 (8V)", "Audi RS3 (8Y)",
      "Mercedes-AMG A45 S", "BMW M135i", "Honda Civic Si (FE)",
      "Mazdaspeed 3", "Dodge Neon SRT-4", "Chevrolet Cobalt SS Turbo",
      "Saturn Ion Redline", "Eagle Talon TSi", "Mitsubishi Eclipse GSX (2G)"
    ]
  },
  {
    category: "Euro Luxury & Performance",
    cars: [
      "BMW M2 (G87)", "BMW M3 (G80)", "BMW M4 (G82)", "BMW M5 (F90) CS",
      "BMW M8 Competition", "Porsche 911 GT3 RS (992)", "Porsche 911 Turbo S (992)",
      "Porsche 718 Cayman GT4 RS", "Audi RS6 Avant", "Audi RS7 Performance",
      "Audi R8 V10 Performance", "Mercedes-AMG GT Black Series", "Mercedes-AMG C63 S (W205)",
      "Mercedes-AMG E63 S", "Alfa Romeo Giulia Quadrifoglio", "Maserati MC20",
      "Jaguar F-Type SVR", "Aston Martin Vantage F1 Edition", "Bentley Continental GT Speed",
      "Rolls-Royce Wraith Black Badge", "Cadillac CT5-V Blackwing"
    ]
  },
  {
    category: "American Muscle (Classics)",
    cars: [
      "1967 Ford Mustang Fastback", "1969 Ford Mustang Boss 429", "1965 Shelby Cobra 427",
      "1969 Chevrolet Camaro SS", "1970 Dodge Charger R/T", "1970 Plymouth Hemi Cuda",
      "1970 Chevrolet Chevelle SS 454", "1969 Pontiac GTO Judge", "1968 Dodge Dart Hemi",
      "1957 Chevrolet Bel Air", "1970 Plymouth Superbird", "1969 Dodge Charger Daytona",
      "Buick Grand National", "Pontiac Firebird Trans Am (WS6)", "Chevrolet Corvette C4 ZR-1",
      "Chevrolet Corvette C2 Stingray", "Shelby GT350 (1965)", "Mercury Cougar Eliminator"
    ]
  },
  {
    category: "American Muscle (Modern)",
    cars: [
      "Dodge Challenger SRT Demon 170", "Dodge Charger SRT Hellcat Redeye",
      "Ford Mustang Dark Horse", "Ford Mustang Shelby GT500 (S550)",
      "Chevrolet Camaro ZL1 1LE", "Chevrolet Corvette C8 Z06",
      "Chevrolet Corvette C7 ZR1", "Dodge Viper ACR Extreme",
      "Cadillac CTS-V Wagon", "Ford GT (2017)", "Saleen S7 Twin Turbo"
    ]
  },
  {
    category: "Heavy Hitters & Hypercars",
    cars: [
      "Lamborghini Huracan Sterrato", "Lamborghini Aventador SVJ", "Lamborghini Urus Performante",
      "Ferrari 296 GTB", "Ferrari SF90 Stradale", "McLaren 720S", "McLaren 765LT",
      "Rimac Nevera", "Lucid Air Sapphire", "Tesla Model S Plaid",
      "Bugatti Chiron Super Sport", "Koenigsegg Jesko Attack", "Pagani Huayra BC",
      "Hennessey Venom F5", "Rivian R1T (Dual Motor)", "GMC Syclone",
      "Ford Lightning (F-150 SVT)", "Jeep Grand Cherokee Trackhawk"
    ]
  },
  {
    category: "Drag Racing & Vintage Gems",
    cars: [
      "Foxbody Mustang (Drag Spec)", "Chevrolet Nova (Big Tire)", "Willys Coupe Gasser",
      "Chevrolet S10 Drag Truck", "Top Fuel Dragster", "Nitro Funny Car",
      "Pro Mod Chevrolet Camaro", "Chevy Vega (Drag Spec)", "Ford Pinto (Drag Spec)",
      "Volkswagen Beetle (Drag Bug)", "Lancia Delta Integrale", "Audi Quattro S1",
      "Ford RS200", "Alpine A110 (Classic)", "DeLorean DMC-12", "Vector W8"
    ]
  }
];

const BODY_KITS = [
  'Stock Body', 'Widebody (Bolt-on)', 'Widebody (Molded)', 'Rocket Bunny Style', 'Liberty Walk Style',
  'Pandem Widebody', 'Veilside Fortune', 'KBD Bodykit', 'Vertex Style', 'Bomex Aero',
  'Rally Aero', 'Time Attack Aero', 'Dakar Rally Inspired', 'Canard & Winglets', 'Stealth Bomber',
  'Cyberpunk Kit', 'Mad Max Armor'
];

const LIVERIES = [
  'Clean (No Livery)', 'Dual Racing Stripes', 'Offset Stripe', 'Flames (Traditional)', 'Tribal Vinyl',
  'Lightning Pattern', 'Sponsor Bomb (Logos)', 'Drift Livery', 'Police Pursuit', 'Taxi Cab',
  'Rusty Bucket', 'Itasha (Anime)', 'Geometric Camo', 'Digital Camo', 'Glitch Art', 
  'Japanese Characters', 'Abstract Geometric', 'Retro Stripes'
];

const ACCESSORIES = [
  'None', 'Wheelie Bar', 'Parachute Pack', 'Dual Parachutes', 'Roof Rack', 'Roof Scoop', 
  'Exposed Intercooler', 'Tow Hook', 'Roll Cage (Visible)', 'Window Net'
];

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
  const [sidebarWidth, setSidebarWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);

  const [sections, setSections] = useState({
    general: true,
    dimensions: true,
    builder: true,
    generation: true
  });

  const [useCarBuilder, setUseCarBuilder] = useState(true);
  const [useAdvancedPaint, setUseAdvancedPaint] = useState(false);
  const [selectedForgeViews, setSelectedForgeViews] = useState<string[]>(['top-down', 'side', 'isometric']);
  
  const [carOptions, setCarOptions] = useState({
    generationMode: 'complete',
    color: 'Red',
    customHex: '#FF0000',
    finish: 'Gloss (Standard)',
    body: 'Nissan Skyline GT-R R34 V-Spec',
    bodyKit: 'Stock Body',
    hood: 'Stock Hood',
    spoiler: 'No Spoiler',
    exhaust: 'Stock Hidden',
    rims: 'TE37 Style (6-Spoke)',
    tires: 'Street Performance',
    livery: 'Clean (No Livery)',
    accessory: 'None',
    underglow: 'None',
    fx: 'Static / Clean',
    tint: 'Dark Smoke',
    wheelbase: 30,
    fitment: 'Natural Fit',
    dishDepth: 'Standard Depth',
    tireProfile: 'Street Radial',
    tireBranding: 'Clean Sidewall'
  });

  const startResizing = useCallback(() => setIsResizing(true), []);
  const stopResizing = useCallback(() => setIsResizing(false), []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      let newWidth = e.clientX;
      if (newWidth < 300) newWidth = 300;
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

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onConfigChange({ ...config, prompt: e.target.value });
  };

  const toggleForgeView = (viewId: string) => {
    setSelectedForgeViews(prev => {
      if (prev.includes(viewId)) {
        return prev.filter(v => v !== viewId);
      }
      if (prev.length >= 3) return prev; 
      return [...prev, viewId];
    });
  };

  useEffect(() => {
    if (config.type === 'car' && useCarBuilder) {
      let parts: string[] = [];
      const view = config.perspective;
      const baseStyle = 'Style: 2D game asset, high definition, isolated on transparent background.';

      const paintDesc = useAdvancedPaint ? `Primary Paint Color: HEX ${carOptions.customHex}` : `Paint Color: ${carOptions.color}`;

      if (carOptions.generationMode === 'complete') {
        parts = [
            `Subject: ${carOptions.body}.`,
            `${paintDesc} with a ${carOptions.finish} finish.`,
            `Wheels: ${carOptions.rims} rims with ${carOptions.dishDepth} profile and ${carOptions.fitment} fitment.`,
            `Tires: ${carOptions.tireProfile} tires.`,
            `Modifications: ${carOptions.bodyKit}, ${carOptions.livery}, ${carOptions.accessory}.`,
            `View: ${view}.`,
            baseStyle
          ];
      } else {
        parts = [
           `Subject: Car component: ${carOptions.generationMode}.`,
           `${paintDesc} if applicable.`,
           `Style details: ${carOptions.rims}, ${carOptions.bodyKit}.`,
           `View: ${view}.`,
           baseStyle
        ];
      }

      onConfigChange({ 
        ...config, 
        prompt: parts.filter(p => p).join(' '),
        hexColor: useAdvancedPaint ? carOptions.customHex : undefined
      });
    }
  }, [carOptions, useCarBuilder, useAdvancedPaint, config.type, config.perspective]);

  return (
    <div 
      style={{ width: sidebarWidth }} 
      className="relative flex-shrink-0 bg-slate-950 border-r border-slate-900 flex flex-col h-full group"
    >
      <div className="p-6 border-b border-slate-900 bg-slate-950 z-10">
        <div className="flex items-center gap-3 text-cyan-400">
          <div className="p-2 bg-cyan-950/30 rounded-lg">
            <Settings className={`w-5 h-5 ${isGenerating ? 'animate-spin-slow' : ''}`} />
          </div>
          <div>
            <h2 className="text-lg font-bold brand-font tracking-wide text-slate-100">CONFIGURATOR</h2>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Asset Forge V2.0</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2">
        <SidebarSection 
          title="Asset Type & Style" 
          icon={Sliders} 
          isOpen={sections.general} 
          onToggle={() => toggleSection('general')}
        >
          <div className="mb-4">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Asset Type</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'car', icon: Car, label: 'Car' },
                { id: 'track', icon: Map, label: 'Track' },
                { id: 'prop', icon: Cone, label: 'Prop' },
                { id: 'ui', icon: Layout, label: 'UI' }
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => onConfigChange({ ...config, type: type.id as AssetType })}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all duration-200 ${config.type === type.id ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                >
                  <type.icon className="w-4 h-4 mb-1" />
                  <span className="text-[9px] font-medium uppercase">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Art Style</label>
            <div className="grid grid-cols-3 gap-2">
               {['vector', 'pixel', 'realistic', 'lowpoly', 'celshaded', 'neon', 'blueprint', 'sketch', 'watercolor', 'oil', 'marker'].map((s) => (
                  <button
                    key={s}
                    onClick={() => onConfigChange({ ...config, style: s as ArtStyle })}
                    className={`p-2 rounded text-[10px] border transition-all text-center capitalize ${config.style === s ? 'bg-indigo-950/30 border-indigo-500/50 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                  >
                    {s}
                  </button>
               ))}
            </div>
          </div>
        </SidebarSection>

        <SidebarSection 
          title="Dimensions & View" 
          icon={Monitor} 
          isOpen={sections.dimensions} 
          onToggle={() => toggleSection('dimensions')}
        >
          <div className="space-y-4">
             <div>
                 <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Camera Angle (Single Generation)</label>
                 <div className="grid grid-cols-2 gap-2">
                    {PERSPECTIVE_OPTIONS.map((view) => (
                      <button 
                        key={view.id}
                        onClick={() => onConfigChange({ ...config, perspective: view.id as any })}
                        className={`flex items-center gap-2 p-2 rounded-md text-xs font-medium transition-all border ${config.perspective === view.id ? 'bg-slate-800 border-cyan-900 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'}`}
                      >
                        <view.icon className="w-3.5 h-3.5" /> {view.label}
                      </button>
                    ))}
                 </div>
             </div>
             
             {/* New Asset Config Toggles */}
             <div className="space-y-2 pt-2 border-t border-slate-800">
                <button 
                   onClick={() => onConfigChange({ ...config, groundShadow: !config.groundShadow })}
                   className={`w-full flex items-center justify-between p-2 rounded-lg border text-[10px] font-bold transition-all uppercase tracking-widest ${config.groundShadow ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
                >
                   <div className="flex items-center gap-2">
                      <BoxSelect className="w-3 h-3" /> Ground Shadow Box
                   </div>
                   <div className={`w-8 h-4 rounded-full relative transition-colors ${config.groundShadow ? 'bg-cyan-500' : 'bg-slate-700'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${config.groundShadow ? 'left-4.5' : 'left-0.5'}`} />
                   </div>
                </button>

                {config.perspective === 'side' && (
                  <button 
                    onClick={() => onConfigChange({ ...config, renderWheelWells: !config.renderWheelWells })}
                    className={`w-full flex items-center justify-between p-2 rounded-lg border text-[10px] font-bold transition-all uppercase tracking-widest ${config.renderWheelWells ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
                  >
                    <div className="flex items-center gap-2">
                        <Eraser className="w-3 h-3" /> Wheel Well Masking
                    </div>
                    <div className={`w-8 h-4 rounded-full relative transition-colors ${config.renderWheelWells ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${config.renderWheelWells ? 'left-4.5' : 'left-0.5'}`} />
                    </div>
                  </button>
                )}
             </div>
          </div>
        </SidebarSection>

        {config.type === 'car' && (
          <SidebarSection 
            title="Vehicle Forge" 
            icon={Wrench}
            isOpen={sections.builder}
            onToggle={() => toggleSection('builder')}
          >
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Generation Mode</label>
                  <button onClick={() => setUseCarBuilder(!useCarBuilder)} className="text-[10px] font-bold text-cyan-600 hover:text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                    {useCarBuilder ? 'Manual Prompt' : 'Builder Mode'} <Terminal className="w-3 h-3" />
                  </button>
                </div>

                {useCarBuilder && (
                  <div className="space-y-5">
                    {/* Color Section */}
                    <div className="space-y-3">
                       <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                             <Palette className="w-3.5 h-3.5 text-cyan-500" /> Paint & Finish
                          </div>
                          <button 
                            onClick={() => setUseAdvancedPaint(!useAdvancedPaint)}
                            className={`text-[9px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded transition-colors ${useAdvancedPaint ? 'bg-cyan-900 text-cyan-100' : 'bg-slate-800 text-slate-500'}`}
                          >
                             Advanced Paint
                          </button>
                       </div>

                       {useAdvancedPaint ? (
                         <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                            <input 
                              type="color" 
                              value={carOptions.customHex}
                              onChange={(e) => setCarOptions({...carOptions, customHex: e.target.value.toUpperCase()})}
                              className="w-10 h-10 rounded bg-transparent border-none cursor-pointer"
                            />
                            <div className="flex-1">
                               <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-tighter mb-1">Precise Hex Code</label>
                               <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded px-2 py-1">
                                  <Hash className="w-3 h-3 text-slate-600" />
                                  <input 
                                     type="text"
                                     value={carOptions.customHex.replace('#', '')}
                                     onChange={(e) => setCarOptions({...carOptions, customHex: '#' + e.target.value.toUpperCase().slice(0, 6)})}
                                     className="bg-transparent text-xs text-slate-200 outline-none font-mono w-full"
                                     placeholder="FFFFFF"
                                  />
                               </div>
                            </div>
                            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" title="Color Locked for all perspectives" />
                         </div>
                       ) : (
                         <div className="flex flex-wrap gap-1.5 animate-in fade-in">
                            {CAR_COLORS.map((c) => (
                              <button
                                key={c.name}
                                onClick={() => setCarOptions({...carOptions, color: c.name})}
                                style={{ backgroundColor: c.hex }}
                                className={`w-5 h-5 rounded-sm ring-1 ring-slate-900 transition-all ${carOptions.color === c.name ? 'ring-2 ring-white scale-110 z-10' : 'hover:scale-110'}`}
                              />
                            ))}
                         </div>
                       )}

                       <select 
                         value={carOptions.finish}
                         onChange={(e) => setCarOptions({...carOptions, finish: e.target.value})}
                         className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded p-2"
                       >
                         {PAINT_FINISHES.map(s => <option key={s} value={s}>{s}</option>)}
                       </select>
                    </div>

                    <div className="space-y-3">
                       <div className="flex items-center gap-2 text-xs font-bold text-slate-300 pb-1 border-b border-slate-800">
                         <Car className="w-3.5 h-3.5 text-cyan-500" /> Chassis & Aero
                       </div>
                       <select 
                          value={carOptions.body}
                          onChange={(e) => setCarOptions({...carOptions, body: e.target.value})}
                          className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded p-2"
                        >
                          {CAR_GROUPS.map((group) => (
                            <optgroup key={group.category} label={group.category} className="bg-slate-900 text-cyan-500 font-bold">
                              {group.cars.map((car) => (
                                <option key={car} value={car} className="text-slate-300 font-normal">{car}</option>
                              ))}
                            </optgroup>
                          ))}
                       </select>
                       <select 
                          value={carOptions.bodyKit}
                          onChange={(e) => setCarOptions({...carOptions, bodyKit: e.target.value})}
                          className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded p-2"
                        >
                          {BODY_KITS.map(s => <option key={s} value={s}>{s}</option>)}
                       </select>
                    </div>

                    <div className="space-y-3">
                       <div className="flex items-center gap-2 text-xs font-bold text-slate-300 pb-1 border-b border-slate-800">
                         <Disc className="w-3.5 h-3.5 text-cyan-500" /> Wheels, Tires & Stance
                       </div>
                       
                       <select value={carOptions.rims} onChange={(e) => setCarOptions({...carOptions, rims: e.target.value})} className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded p-2">
                          {RIM_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                       </select>

                       <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Rim Depth</label>
                       <div className="grid grid-cols-3 gap-2">
                          {RIM_DEPTH_OPTIONS.map((opt) => (
                            <button
                              key={opt.id}
                              onClick={() => setCarOptions({...carOptions, dishDepth: opt.id})}
                              className={`flex flex-col items-center justify-center p-2 rounded-lg border text-[10px] transition-all ${carOptions.dishDepth === opt.id ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
                            >
                              <opt.icon className="w-3 h-3 mb-1" />
                              <span className="text-[8px] font-bold text-center leading-tight">{opt.label}</span>
                            </button>
                          ))}
                       </div>

                       <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tire Fitment (Stance)</label>
                       <div className="grid grid-cols-3 gap-2">
                          {TIRE_FITMENT_OPTIONS.map((opt) => (
                            <button
                              key={opt.id}
                              onClick={() => setCarOptions({...carOptions, fitment: opt.id})}
                              className={`flex flex-col items-center justify-center p-2 rounded-lg border text-[10px] transition-all ${carOptions.fitment === opt.id ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
                            >
                              <opt.icon className="w-3 h-3 mb-1" />
                              <span className="text-[8px] font-bold text-center leading-tight">{opt.label}</span>
                            </button>
                          ))}
                       </div>

                       <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Sidewall Profile</label>
                       <select 
                          value={carOptions.tireProfile}
                          onChange={(e) => setCarOptions({...carOptions, tireProfile: e.target.value})}
                          className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded p-2"
                        >
                          {TIRE_PROFILE_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.label} ({s.desc})</option>)}
                       </select>
                    </div>
                  </div>
                )}
             </div>
          </SidebarSection>
        )}

        <SidebarSection 
          title="Generation Settings" 
          icon={Zap} 
          isOpen={sections.generation} 
          onToggle={() => toggleSection('generation')}
        >
          <div className="space-y-4">
             <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex justify-between">
                   <span>Prompt Description</span>
                   <span className="text-slate-600 font-normal normal-case">{config.prompt.length} chars</span>
                </label>
                <textarea
                  value={config.prompt}
                  onChange={handlePromptChange}
                  placeholder="Describe your asset in detail..."
                  className="w-full h-32 bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none resize-none custom-scrollbar"
                />
             </div>
          </div>
        </SidebarSection>
      </div>

      <div className="p-4 border-t border-slate-900 bg-slate-950 z-10 space-y-4">
        <div>
          <button
            onClick={() => onGenerate(false)}
            disabled={isGenerating || !config.prompt}
            className={`w-full py-3 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all duration-300 flex items-center justify-center gap-2
              ${isGenerating || !config.prompt ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg'}
            `}
          >
            {isGenerating ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            Generate Single
          </button>
        </div>

        <div className="space-y-2">
          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest text-center">Set Forge Views (Max 3)</label>
          <div className="flex justify-center gap-2">
            {PERSPECTIVE_OPTIONS.map(view => (
              <button
                key={view.id}
                onClick={() => toggleForgeView(view.id)}
                className={`p-1.5 rounded-lg border transition-all ${selectedForgeViews.includes(view.id) ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-600 hover:text-slate-400'}`}
                title={`Include ${view.label}`}
              >
                <view.icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          <button
            onClick={() => onGenerate(true, selectedForgeViews)}
            disabled={isGenerating || !config.prompt || config.type !== 'car' || selectedForgeViews.length === 0}
            className={`w-full py-3 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all duration-300 flex items-center justify-center gap-2
              ${isGenerating || !config.prompt || config.type !== 'car' || selectedForgeViews.length === 0 ? 'bg-slate-900 text-slate-700 cursor-not-allowed border border-slate-800' : 'bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-900/50 shadow-lg'}
            `}
          >
            <Copy className="w-3.5 h-3.5" />
            Forge Set ({selectedForgeViews.length})
          </button>
        </div>
      </div>
      
      <div onMouseDown={startResizing} className="absolute top-0 right-0 bottom-0 w-1 cursor-ew-resize hover:bg-cyan-500/50 transition-colors z-50" />
    </div>
  );
};

export default Sidebar;