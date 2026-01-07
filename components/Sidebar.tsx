import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Car, Map, Cone, Layout, Zap, Image as ImageIcon, Sparkles, PenTool, MousePointer2, Palette, Wrench, Sliders, CheckCircle2, Flag, Trees, Grid, ArrowUp, Box, Layers, Flame, Wind, ChevronDown, GripVertical, Monitor, Terminal, CircleDashed, Disc, PaintBucket, Eye, Cpu } from 'lucide-react';
import { ArtStyle, AssetType, GenerationConfig } from '../types';

interface SidebarProps {
  config: GenerationConfig;
  isGenerating: boolean;
  onConfigChange: (newConfig: GenerationConfig) => void;
  onGenerate: () => void;
}

// --- CONSTANTS ---

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

const ENGINE_TYPES = [
  'V8 Big Block', 'V8 Small Block (LS)', 'Inline-4', 'Inline-6 (2JZ/RB)', 'V6 Twin Turbo', 
  'V10', 'V12', 'Rotary (13B)', 'Rotary (20B)', 'Flat-4 (Boxer)', 'Flat-6', 
  'Electric Motor', 'Jet Turbine'
];

const ENGINE_COMPONENTS = [
  'Stock / Hidden', 'Roots Supercharger (Blower)', 'Twin Turbochargers', 'Single Huge Turbo', 
  'Velocity Stacks', 'Exhaust Headers (Up-swept)', 'Individual Throttle Bodies (ITBs)', 
  'Centrifugal Supercharger', 'Nitrous Oxide System', 'Intercooler Piping', 'Gold Heat Shielding'
];

const RIM_STYLES = [
  // Racing / Performance
  'TE37 Style (6-Spoke)', 'RPF1 Style (Twin Spoke)', 'Work Meister (Deep Dish)', 'CE28 Style (Multi-spoke)', 'Advan 3-Spoke',
  // Drag Specific
  'Weld Racing (Magnum)', 'Drag Star (5-Spoke)', 'Beadlock Drag', 'Solid Disc (Aero)', 'Skinny Front Runners',
  // Classic / Muscle
  'Cragar S/S', 'Torq Thrust', 'Steelies (Black)', 'Steelies (Chrome Hub)', 'Wire Spoke (Dayton)', 'Rallye Wheels',
  // Modern / Euro
  'Rotiform Aerodisc', 'BBS Mesh (RS)', 'Turbofan', 'Concave 5-Spoke', 'Split 5-Spoke',
  // Wild
  'Spinner Rims', 'Neon Light-Up', 'Transparent/Glass', 'Gold Plated'
];

const TIRE_TYPES = ['Drag Slicks (Wrinkle Wall)', 'Semi-Slicks', 'Street Performance', 'White Lettering', 'Redline Classics', 'Stretched Tires'];

// MASSIVE CAR LIST
const CAR_GROUPS = [
  {
    category: "JDM Legends (90s-00s)",
    cars: [
      "Nissan Skyline GT-R R34 V-Spec", "Nissan Skyline GT-R R33", "Nissan Skyline GT-R R32",
      "Toyota Supra MK4 (JZA80)", "Mazda RX-7 FD Spirit R", "Honda NSX-R (NA2)",
      "Mitsubishi Lancer Evolution IX", "Mitsubishi Lancer Evolution VI TME",
      "Subaru Impreza 22B STi", "Nissan Silvia S15 Spec-R", "Nissan Silvia S14 Kouki",
      "Nissan 180SX Type X", "Honda S2000 CR", "Toyota AE86 Sprinter Trueno",
      "Mazda RX-7 FC3S", "Mitsubishi 3000GT VR-4", "Toyota Celica GT-Four ST205",
      "Honda Integra Type R DC2", "Honda Civic Type R EK9"
    ]
  },
  {
    category: "Modern JDM & Tuner",
    cars: [
      "Nissan GT-R R35 Nismo", "Toyota GR Supra (A90)", "Honda Civic Type R FL5",
      "Nissan Z Performance (RZ34)", "Toyota GR86 / Subaru BRZ", "Toyota GR Yaris",
      "Lexus LFA", "Lexus LC500", "Acura NSX Type S", "Subaru WRX STI (VA)"
    ]
  },
  {
    category: "Classic American Muscle",
    cars: [
      "1967 Ford Mustang Fastback", "1969 Ford Mustang Boss 429", "1965 Shelby Cobra 427",
      "1969 Chevrolet Camaro SS", "1969 Chevrolet Camaro Z28",
      "1970 Dodge Charger R/T", "1969 Dodge Charger Daytona",
      "1970 Plymouth Hemi Cuda", "1970 Plymouth Superbird", "1970 Chevrolet Chevelle SS 454",
      "1969 Pontiac GTO Judge", "1968 Dodge Dart Hemi Super Stock", "1970 Buick GSX",
      "1969 Oldsmobile 442", "1957 Chevrolet Bel Air", "1965 Pontiac Catalina 2+2"
    ]
  },
  {
    category: "Modern American Muscle",
    cars: [
      "Dodge Challenger SRT Demon 170", "Dodge Charger SRT Hellcat Redeye",
      "Ford Mustang Dark Horse", "Ford Mustang Shelby GT500 (S550)",
      "Chevrolet Camaro ZL1 1LE", "Chevrolet Corvette C8 Z06",
      "Chevrolet Corvette C7 ZR1", "Dodge Viper ACR Extreme",
      "Cadillac CT5-V Blackwing", "Ford GT (2005)", "Ford GT (2017)"
    ]
  },
  {
    category: "Drag Racing Specials",
    cars: [
      "Foxbody Mustang (Drag Spec)", "Chevrolet Nova (Big Tire)", "Willys Coupe Gasser",
      "Chevrolet S10 Drag Truck", "Top Fuel Dragster", "Nitro Funny Car",
      "Pro Mod Chevrolet Camaro", "Twin Turbo Lamborghini Huracan", "Volkswagen Beetle (Drag Bug)"
    ]
  },
  {
    category: "Euro Legends & Classics",
    cars: [
      "BMW M3 E30 Sport Evolution", "BMW M3 E46 CSL", "Mercedes-Benz 190E 2.5-16 Evo II",
      "Porsche 911 Turbo (930 Widowmaker)", "Porsche 959", "Ferrari F40", "Ferrari Testarossa",
      "Lamborghini Countach LP5000", "Lamborghini Diablo SV", "Lancia Delta HF Integrale",
      "Audi Sport Quattro S1", "Volkswagen Golf GTI Mk2", "Jaguar XJ220"
    ]
  },
  {
    category: "Modern Euro Performance",
    cars: [
      "Porsche 911 GT3 RS (992)", "Porsche 911 Turbo S (992)", "BMW M4 CSL (G82)",
      "BMW M5 CS (F90)", "Mercedes-AMG GT Black Series", "Audi RS6 Avant",
      "Ferrari 296 GTB", "Ferrari SF90 Stradale", "Lamborghini Huracan STO",
      "Lamborghini Aventador SVJ", "McLaren 765LT", "McLaren Senna"
    ]
  },
  {
    category: "Hypercars",
    cars: [
      "Bugatti Chiron Super Sport 300+", "Bugatti Bolide", "Koenigsegg Jesko Attack",
      "Koenigsegg Gemera", "Pagani Huayra R", "Rimac Nevera", "Hennessey Venom F5",
      "Lotus Evija", "Aston Martin Valkyrie"
    ]
  },
  {
    category: "Performance Trucks & SUVs",
    cars: [
      "Ram 1500 TRX", "Ford F-150 Raptor R", "Ford F-150 Lightning (1993)",
      "GMC Syclone", "Jeep Grand Cherokee Trackhawk", "Lamborghini Urus Performante",
      "Tesla Cybertruck", "Volvo 850 R Estate"
    ]
  },
  {
    category: "Everyday Sedans",
    cars: [
      "Toyota Camry TRD", "Honda Accord 2.0T", "Nissan Altima SR", "Hyundai Sonata N-Line", 
      "Kia K5 GT", "Subaru Legacy", "Volkswagen Passat", "Mazda 6", 
      "Chevrolet Malibu", "Dodge Charger SXT", "Chrysler 300", "Ford Taurus SHO"
    ]
  },
  {
    category: "Economy Hatchbacks",
    cars: [
      "Honda Civic Hatchback", "Toyota Corolla Hatchback", "Volkswagen Golf TSI", 
      "Mazda 3 Hatchback", "Ford Focus ST", "Ford Fiesta ST", 
      "Mini Cooper S", "Fiat 500 Abarth", "Hyundai Veloster N", 
      "Chevrolet Spark", "Nissan Versa Note", "Honda Fit"
    ]
  },
  {
    category: "Family SUVs & Minivans",
    cars: [
      "Toyota RAV4 Prime", "Honda CR-V", "Nissan Rogue", "Ford Explorer ST", 
      "Jeep Grand Cherokee", "Chevrolet Tahoe", "Subaru Forester Wilderness", 
      "Mazda CX-5", "Kia Telluride", "Hyundai Palisade",
      "Honda Odyssey", "Toyota Sienna", "Chrysler Pacifica", "Dodge Grand Caravan"
    ]
  },
  {
    category: "Work Trucks & Utility",
    cars: [
      "Ford F-150 XL (Work Truck)", "Chevrolet Silverado 1500 WT", "Ram 1500 Tradesman", 
      "Toyota Tacoma SR", "Ford Ranger", "Nissan Frontier", 
      "Ford Transit Van", "Mercedes-Benz Sprinter", "Chevrolet Express Van",
      "Isuzu NPR Box Truck", "Garbage Truck", "School Bus", "Ambulance", "Fire Truck"
    ]
  },
  {
    category: "Classic Daily Drivers",
    cars: [
      "1995 Honda Civic EJ", "1990 Toyota Camry", "1985 Toyota Corolla AE86 (Stock)", 
      "1995 Ford Taurus", "Volvo 240 DL", "Mercedes-Benz W123 300D", 
      "BMW E30 325i", "Saab 900 Turbo", "Volkswagen Beetle (Classic)", "Citroen 2CV"
    ]
  },
  {
    category: "Wagons & Estates",
    cars: [
      "Subaru Outback", "Audi A4 Allroad", "Volvo V60 Polestar", 
      "Mercedes-Benz E63 AMG Wagon", "Buick Roadmaster Estate", 
      "Ford Country Squire", "Dodge Magnum SRT8"
    ]
  },
  {
    category: "Electric & Hybrids",
    cars: [
      "Tesla Model S Plaid", "Tesla Model 3 Performance", "Tesla Model X", "Tesla Model Y",
      "Porsche Taycan Turbo S", "Audi RS e-tron GT", "Lucid Air Sapphire",
      "Hyundai Ioniq 5 N", "Kia EV6 GT", "Rivian R1T", "Rivian R1S", "Ford F-150 Lightning"
    ]
  },
  {
    category: "Micro & Kei Cars",
    cars: [
      "Honda Beat", "Suzuki Cappuccino", "Autozam AZ-1", "Daihatsu Copen", 
      "Smart Fortwo", "Peel P50", "Reliant Robin", "Fiat 126"
    ]
  }
];

const BODY_KITS = [
  'Stock Body', 'Widebody (Bolt-on)', 'Widebody (Molded)', 'Rocket Bunny Style', 'Liberty Walk Style',
  'Rally Aero', 'Time Attack Aero', 'Dakar Rally Inspired', 'Canard & Winglets', 'Stealth Bomber',
  'Cyberpunk Kit', 'Mad Max Armor'
];

const HOOD_TYPES = [
  'Stock Hood', 'Cowl Induction', 'Carbon Vented', 'Shaker Scoop', 'Transparent (Glass)',
  'Supercharger (Blower)', 'Velocity Stacks', 'Twin Turbo (Bullhorns)'
];

const SPOILER_TYPES = [
  'No Spoiler', 'Lip Spoiler', 'Ducktail', 'GT Wing (High)', 'GT Wing (Chassis Mount)',
  'Drag Wing (Aluminum)', 'Active Aero Wing', 'Roof Spoiler'
];

const EXHAUST_STYLES = [
  'Stock Hidden', 'Dual Rear Tips', 'Quad Tips', 'Large Single Can', 'Side Exit (Sidepipes)',
  'Hood Exit (Hater Pipes)', 'Fender Exit'
];

const ACCESSORIES = [
  'None', 'Wheelie Bar', 'Parachute Pack', 'Dual Parachutes', 'Roof Rack', 'Roof Scoop', 
  'Exposed Intercooler', 'Tow Hook', 'Roll Cage (Visible)', 'Window Net'
];

const LIVERIES = [
  'Clean (No Livery)', 'Dual Racing Stripes', 'Offset Stripe', 'Flames (Traditional)', 'Tribal Vinyl',
  'Lightning Pattern', 'Sponsor Bomb (Logos)', 'Drift Livery', 'Police Pursuit', 'Taxi Cab',
  'Rusty Bucket', 'Itasha (Anime)', 'Geometric Camo', 'Digital Camo', 'Glitch Art', 
  'Japanese Characters', 'Abstract Geometric', 'Retro Stripes'
];

const UNDERGLOW = ['None', 'Neon Blue', 'Neon Red', 'Neon Green', 'Neon Purple', 'Neon White', 'Pulsing RGB'];
const ACTION_FX = ['Static / Clean', 'Tire Smoke (Burnout)', 'Exhaust Flames', 'Nitro Flames (Blue)', 'Motion Blur', 'Drifting Smoke'];

// Track Builder Constants (Keep these simpler)
const TRACK_SEGMENTS = ['Straight Road', 'Slight Curve Left', 'Slight Curve Right', 'Sharp Turn', 'Start Line', 'Finish Line', 'Staging Area'];
const TRACK_SURFACES = ['Dark Asphalt', 'Grey Concrete', 'Dirt / Gravel', 'Wet Tarmac', 'Neon Grid', 'Ice / Snow'];
const TRACK_ENVIRONMENTS = ['Pro Stadium', 'Desert Highway', 'City Street Night', 'Forest Road', 'Industrial Zone', 'Sci-Fi Tunnel'];

// Reusable Section Component
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

  // Car Builder State
  const [useCarBuilder, setUseCarBuilder] = useState(true);
  const [carOptions, setCarOptions] = useState({
    color: 'Red',
    finish: 'Gloss (Standard)',
    body: 'Nissan Skyline GT-R R34 V-Spec',
    bodyKit: 'Stock Body',
    hood: 'Stock Hood',
    spoiler: 'No Spoiler',
    engineType: 'V8 Big Block',
    engineComponent: 'Stock / Hidden',
    exhaust: 'Stock Hidden',
    rims: 'TE37 Style (6-Spoke)',
    tires: 'Street Performance',
    livery: 'Clean (No Livery)',
    accessory: 'None',
    underglow: 'None',
    fx: 'Static / Clean',
    tint: 'Dark Smoke'
  });

  // Track Builder State
  const [useTrackBuilder, setUseTrackBuilder] = useState(true);
  const [trackOptions, setTrackOptions] = useState({
    segment: 'Straight Road',
    surface: 'Dark Asphalt',
    environment: 'Pro Stadium',
  });
  
  // Resize Logic
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

  // Update prompt for Car Builder
  useEffect(() => {
    if (config.type === 'car' && useCarBuilder) {
      const parts = [
        `Subject: ${carOptions.body}.`,
        `Paint: ${carOptions.color} paint with a ${carOptions.finish} finish.`,
        `Engine: ${carOptions.engineType}${carOptions.engineComponent !== 'Stock / Hidden' ? ` featuring a visible ${carOptions.engineComponent}` : ''}.`,
        `Wheels: ${carOptions.rims} rims with ${carOptions.tires}.`,
        `Modifications: ${carOptions.bodyKit} body kit, ${carOptions.hood}, ${carOptions.spoiler}, and ${carOptions.exhaust}.`,
        carOptions.accessory !== 'None' ? `Accessory: ${carOptions.accessory}.` : '',
        carOptions.livery !== 'Clean (No Livery)' ? `Livery: ${carOptions.livery}.` : '',
        carOptions.underglow !== 'None' ? `Underglow: ${carOptions.underglow}.` : '',
        carOptions.fx !== 'Static / Clean' ? `Effect: ${carOptions.fx}.` : '',
        `View: ${config.perspective}.`,
        'Style: 2D game asset, high definition, photorealistic textures, isolated on transparent background.'
      ];
      onConfigChange({ ...config, prompt: parts.filter(p => p).join(' ') });
    }
  }, [carOptions, useCarBuilder, config.type, config.perspective]);

  // Update prompt for Track Builder
  useEffect(() => {
    if (config.type === 'track' && useTrackBuilder) {
      const parts = [
        `${config.perspective} of a drag racing track segment.`,
        `Type: ${trackOptions.segment}.`,
        `Surface: ${trackOptions.surface}.`,
        `Environment: ${trackOptions.environment}.`,
        'Game map asset, isolated on transparent background.'
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
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Asset Forge V2.0</p>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2">
        
        {/* SECTION 1: GENERAL (Asset Type & Style) */}
        <SidebarSection 
          title="Asset Type & Style" 
          icon={Sliders} 
          isOpen={sections.general} 
          onToggle={() => toggleSection('general')}
        >
          {/* Asset Type */}
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

          {/* Art Style */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Art Style</label>
            <div className="grid grid-cols-3 gap-2">
               {[
                 { id: 'vector', label: 'Vector' },
                 { id: 'pixel', label: 'Pixel' },
                 { id: 'realistic', label: 'Realistic' },
                 { id: 'lowpoly', label: 'Low Poly' },
                 { id: 'celshaded', label: 'Cel Shader' },
                 { id: 'vaporwave', label: 'Vaporwave' },
                 { id: 'neon', label: 'Neon' },
                 { id: 'blueprint', label: 'Blueprint' },
                 { id: 'sketch', label: 'Sketch' },
                 { id: 'watercolor', label: 'Watercolor' },
                 { id: 'oil', label: 'Oil Paint' },
                 { id: 'marker', label: 'Marker' },
               ].map((styleOption) => (
                  <button
                    key={styleOption.id}
                    onClick={() => onConfigChange({ ...config, style: styleOption.id as ArtStyle })}
                    className={`p-2 rounded text-[10px] border transition-all text-center ${config.style === styleOption.id ? 'bg-indigo-950/30 border-indigo-500/50 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                  >
                    {styleOption.label}
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
                 <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Camera Angle</label>
                 <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'top-down', label: 'Top Down', icon: ArrowUp },
                      { id: 'isometric', label: 'Isometric 2.5D', icon: Box },
                      { id: 'side', label: 'Side Profile', icon: Layers },
                      { id: 'front', label: 'Front View', icon: Eye },
                      { id: 'rear', label: 'Rear View', icon: CircleDashed },
                    ].map((view) => (
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
             <div>
                 <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Aspect Ratio</label>
                 <select 
                   value={config.aspectRatio} 
                   onChange={(e) => onConfigChange({ ...config, aspectRatio: e.target.value as any })}
                   className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 block p-2.5"
                 >
                   <option value="1:1">1:1 (Square)</option>
                   <option value="3:4">3:4 (Portrait)</option>
                   <option value="4:3">4:3 (Landscape)</option>
                   <option value="16:9">16:9 (Widescreen)</option>
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
                      {useCarBuilder ? 'Manual Mode' : 'Builder Mode'} <Terminal className="w-3 h-3" />
                    </button>
                  </div>

                  {useCarBuilder ? (
                    <div className="space-y-5 animate-in fade-in">
                      {/* 1. Paint & Body */}
                      <div className="space-y-3">
                         <div className="flex items-center gap-2 text-xs font-bold text-slate-300 pb-1 border-b border-slate-800">
                           <Palette className="w-3.5 h-3.5 text-cyan-500" /> Paint & Finish
                         </div>
                         
                         {/* Color Grid */}
                         <div className="flex flex-wrap gap-1.5">
                            {CAR_COLORS.map((c) => (
                              <button
                                key={c.name}
                                onClick={() => setCarOptions({...carOptions, color: c.name})}
                                title={c.name}
                                style={{ backgroundColor: c.hex }}
                                className={`w-5 h-5 rounded-sm ring-1 ring-slate-900 transition-all ${carOptions.color === c.name ? 'ring-2 ring-white scale-110 z-10' : 'hover:scale-110'}`}
                              />
                            ))}
                         </div>
                         
                         {/* Finish Selector */}
                         <select 
                           value={carOptions.finish}
                           onChange={(e) => setCarOptions({...carOptions, finish: e.target.value})}
                           className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded p-2"
                         >
                           {PAINT_FINISHES.map(s => <option key={s} value={s}>{s}</option>)}
                         </select>
                      </div>

                      {/* 2. Chassis & Kit */}
                      <div className="space-y-3">
                         <div className="flex items-center gap-2 text-xs font-bold text-slate-300 pb-1 border-b border-slate-800">
                           <Car className="w-3.5 h-3.5 text-cyan-500" /> Chassis & Aero
                         </div>
                         <div className="grid grid-cols-1 gap-2">
                            {/* UPDATED: Grouped Car Selection */}
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
                         <div className="grid grid-cols-2 gap-2">
                           <select 
                                value={carOptions.hood}
                                onChange={(e) => setCarOptions({...carOptions, hood: e.target.value})}
                                className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded p-2"
                              >
                                {HOOD_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <select 
                                value={carOptions.spoiler}
                                onChange={(e) => setCarOptions({...carOptions, spoiler: e.target.value})}
                                className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded p-2"
                              >
                                {SPOILER_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                         </div>
                      </div>

                      {/* 3. Engine Bay (New) */}
                      <div className="space-y-3">
                         <div className="flex items-center gap-2 text-xs font-bold text-slate-300 pb-1 border-b border-slate-800">
                           <Cpu className="w-3.5 h-3.5 text-cyan-500" /> Engine Bay
                         </div>
                         <div className="grid grid-cols-1 gap-2">
                           <select 
                              value={carOptions.engineType}
                              onChange={(e) => setCarOptions({...carOptions, engineType: e.target.value})}
                              className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded p-2"
                            >
                              {ENGINE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                           </select>
                           <select 
                              value={carOptions.engineComponent}
                              onChange={(e) => setCarOptions({...carOptions, engineComponent: e.target.value})}
                              className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded p-2"
                            >
                              {ENGINE_COMPONENTS.map(s => <option key={s} value={s}>{s}</option>)}
                           </select>
                         </div>
                      </div>

                      {/* 4. Wheels & Tires */}
                      <div className="space-y-3">
                         <div className="flex items-center gap-2 text-xs font-bold text-slate-300 pb-1 border-b border-slate-800">
                           <Disc className="w-3.5 h-3.5 text-cyan-500" /> Wheels
                         </div>
                         <div className="grid grid-cols-1 gap-2">
                           <select 
                              value={carOptions.rims}
                              onChange={(e) => setCarOptions({...carOptions, rims: e.target.value})}
                              className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded p-2"
                            >
                              {RIM_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                           </select>
                           <select 
                              value={carOptions.tires}
                              onChange={(e) => setCarOptions({...carOptions, tires: e.target.value})}
                              className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded p-2"
                            >
                              {TIRE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                           </select>
                         </div>
                      </div>

                      {/* 5. Accessories & FX */}
                      <div className="space-y-3">
                         <div className="flex items-center gap-2 text-xs font-bold text-slate-300 pb-1 border-b border-slate-800">
                           <Flame className="w-3.5 h-3.5 text-cyan-500" /> Livery & Accessories
                         </div>
                         <div className="grid grid-cols-2 gap-2">
                           <select 
                              value={carOptions.livery}
                              onChange={(e) => setCarOptions({...carOptions, livery: e.target.value})}
                              className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded p-2"
                            >
                              {LIVERIES.map(s => <option key={s} value={s}>{s}</option>)}
                           </select>
                           <select 
                              value={carOptions.accessory}
                              onChange={(e) => setCarOptions({...carOptions, accessory: e.target.value})}
                              className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded p-2"
                            >
                              {ACCESSORIES.map(s => <option key={s} value={s}>{s}</option>)}
                           </select>
                           <select 
                              value={carOptions.exhaust}
                              onChange={(e) => setCarOptions({...carOptions, exhaust: e.target.value})}
                              className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded p-2"
                            >
                              {EXHAUST_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                           </select>
                           <select 
                              value={carOptions.underglow}
                              onChange={(e) => setCarOptions({...carOptions, underglow: e.target.value})}
                              className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded p-2"
                            >
                              {UNDERGLOW.map(s => <option key={s} value={s}>{s}</option>)}
                           </select>
                         </div>
                         <select 
                              value={carOptions.fx}
                              onChange={(e) => setCarOptions({...carOptions, fx: e.target.value})}
                              className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded p-2"
                            >
                              {ACTION_FX.map(s => <option key={s} value={s}>{s}</option>)}
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

             {config.type === 'track' && (
               <div className="space-y-4">
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
                   Prompt Preview
                </label>
                <textarea
                  value={config.prompt}
                  onChange={handlePromptChange}
                  readOnly={(config.type === 'car' && useCarBuilder) || (config.type === 'track' && useTrackBuilder)}
                  placeholder="Asset description..."
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