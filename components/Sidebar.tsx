import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Car, Map, Cone, Layout, Zap, Image as ImageIcon, Sparkles, PenTool, MousePointer2, Palette, Wrench, Sliders, CheckCircle2, Flag, Trees, Grid, ArrowUp, Box, Layers, Flame, Wind, ChevronDown, GripVertical, Monitor, Terminal, CircleDashed, Disc, PaintBucket, Eye, Cpu, MousePointer, Component, Circle, Aperture, Minimize2, Maximize2, MoveHorizontal, AlignJustify, Square, Hash, Type, Activity } from 'lucide-react';
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

const RIM_STYLES = [
  // Racing / Performance
  'TE37 Style (6-Spoke)', 'RPF1 Style (Twin Spoke)', 'Work Meister (Deep Dish)', 'CE28 Style (Multi-spoke)', 'Advan 3-Spoke',
  // Drag Specific
  'Weld Racing (Magnum)', 'Drag Star (5-Spoke)', 'Beadlock Drag', 'Solid Disc (Aero)', 'Skinny Front Runners', 'Centerline Convo Pro',
  // Classic / Muscle
  'Cragar S/S', 'Torq Thrust', 'Steelies (Black)', 'Steelies (Chrome Hub)', 'Wire Spoke (Dayton)', 'Rallye Wheels',
  // Modern / Euro
  'Rotiform Aerodisc', 'BBS Mesh (RS)', 'Turbofan', 'Concave 5-Spoke', 'Split 5-Spoke', 'ASANTI AF141',
  // Wild
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

const TIRE_BRANDING_OPTIONS = [
  { id: 'Clean Sidewall', label: 'Clean', desc: 'No text or markings' },
  { id: 'Bold White Lettering', label: 'White Letters', desc: 'Racing tire style' },
  { id: 'Yellow Racing Logo', label: 'Yellow Logos', desc: 'Professional circuit look' },
  { id: 'Redline Classic', label: 'Redline', desc: 'Vintage muscle look' },
  { id: 'Stretched Sidewall', label: 'Stretched', desc: 'Extreme tuner style' },
];

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
    category: "Street Tuner Heroes",
    cars: [
      "Nissan 350Z (Z33)", "Infiniti G35 Coupe", "Mazda MX-5 Miata (NA)", "Mazda MX-5 Miata (ND)",
      "Honda S2000 (AP1)", "Honda Prelude SH", "Acura Integra Type R (DC2)", "Acura RSX Type S",
      "Mitsubishi Eclipse GSX (2G)", "Toyota MR2 Turbo (SW20)", "Subaru BRZ (Gen 1)", "Scion tC",
      "1995 Saturn SC2 (Flip-up headlights)"
    ]
  },
  {
    category: "FWD Drag Monsters",
    cars: [
      "Honda Civic EG Hatch", "Honda Civic EK Coupe", "Honda CR-X Si",
      "Dodge Neon SRT-4", "Chevrolet Cobalt SS Turbo", "Ford Focus SVT",
      "Volkswagen GTI VR6", "Mazdaspeed 3", "Fiat 500 Abarth",
      "2005 Saturn Ion Redline"
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
  }
];

const BODY_KITS = [
  'Stock Body', 'Widebody (Bolt-on)', 'Widebody (Molded)', 'Rocket Bunny Style', 'Liberty Walk Style',
  'Pandem Widebody', 'Veilside Fortune', 'KBD Bodykit', 'Vertex Style', 'Bomex Aero',
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

const ACTION_FX = [
  'Static / Clean', 
  'Subtle Heat Haze', 
  'Faint Dust Particles', 
  'Light Tire Smoke',
  'Heavy Tire Smoke (Burnout)', 
  'Exhaust Flames', 
  'Nitro Flames (Blue)', 
  'Motion Blur', 
  'Drifting Smoke'
];

// Track Builder Constants
const TRACK_SEGMENTS = ['Straight Road', 'Slight Curve Left', 'Slight Curve Right', 'Sharp Turn', 'Start Line', 'Finish Line', 'Staging Area'];
const TRACK_SURFACES = ['Dark Asphalt', 'Grey Concrete', 'Dirt / Gravel', 'Wet Tarmac', 'Neon Grid', 'Ice / Snow'];
const TRACK_ENVIRONMENTS = ['Pro Stadium', 'Desert Highway', 'City Street Night', 'Forest Road', 'Industrial Zone', 'Sci-Fi Tunnel'];

// UI Builder Constants
const UI_ELEMENT_TYPES = [
  'Button (Start)', 'Button (Options)', 'Icon (Nitrous)', 'Icon (Engine)', 'Icon (Tires)', 
  'Speedometer (Analog)', 'Speedometer (Digital)', 'Tachometer', 'Gear Indicator',
  'Progress Bar (Fuel)', 'Progress Bar (Boost)', 'Game HUD Panel', 'Minimap Frame', 
  'Victory Banner', 'Defeat Banner'
];

const UI_THEMES = [
  'Sci-Fi / Holographic', 'Retro Pixel (8-bit)', 'Modern Minimal', 'Grunge / Rusty Metal', 
  'Neon Cyberpunk', 'Carbon Fiber & Chrome', 'Flat Vector', 'Glassmorphism'
];

const UI_SHAPES = [
  'Rectangle', 'Rounded Rectangle', 'Circle / Gauge', 'Hexagon', 'Octagon', 'Complex Tech Shape'
];

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
    generationMode: 'complete',
    color: 'Red',
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

  // Track Builder State
  const [useTrackBuilder, setUseTrackBuilder] = useState(true);
  const [trackOptions, setTrackOptions] = useState({
    segment: 'Straight Road',
    surface: 'Dark Asphalt',
    environment: 'Pro Stadium',
  });
  
  // UI Builder State
  const [useUiBuilder, setUseUiBuilder] = useState(true);
  const [uiOptions, setUiOptions] = useState({
    elementType: 'Speedometer (Analog)',
    theme: 'Neon Cyberpunk',
    shape: 'Circle / Gauge',
    primaryColor: 'Cyan'
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
      let parts: string[] = [];
      const view = config.perspective;
      const baseStyle = 'Style: 2D game asset, high definition, photorealistic textures, isolated on transparent background.';

      const getWheelbaseDescription = (val: number) => {
        if (val < 25) return "very short wheelbase, compact chassis";
        if (val < 50) return "standard factory wheelbase spacing";
        if (val < 75) return "extended wheelbase, stretched chassis spacing";
        return "extreme long wheelbase, pro mod dragster style stretched wheel spacing";
      };

      const wheelbaseDesc = getWheelbaseDescription(carOptions.wheelbase);

      if (carOptions.generationMode === 'complete') {
        parts = [
            `Subject: ${carOptions.body}.`,
            `Dimensions: ${wheelbaseDesc}.`,
            `Paint: ${carOptions.color} paint with a ${carOptions.finish} finish.`,
            `Wheels: ${carOptions.rims} rims with ${carOptions.dishDepth} and ${carOptions.fitment}.`,
            `Tires: ${carOptions.tireProfile} tires with ${carOptions.tireBranding}.`,
            `Modifications: ${carOptions.bodyKit} body kit, ${carOptions.hood}, ${carOptions.spoiler}, and ${carOptions.exhaust}.`,
            carOptions.accessory !== 'None' ? `Accessory: ${carOptions.accessory}.` : '',
            carOptions.livery !== 'Clean (No Livery)' ? `Livery: ${carOptions.livery}.` : '',
            carOptions.underglow !== 'None' ? `Underglow: ${carOptions.underglow}.` : '',
            carOptions.fx !== 'Static / Clean' ? `Effect: ${carOptions.fx}.` : '',
            `View: ${view}.`,
            baseStyle
          ];
      } else if (carOptions.generationMode === 'body') {
          parts = [
            `Subject: ${carOptions.body} Car Body Chassis ONLY.`,
            `Condition: No wheels, empty wheel wells, floating chassis.`,
            `Dimensions: ${wheelbaseDesc}.`,
            `Paint: ${carOptions.color} paint with a ${carOptions.finish} finish.`,
            `Modifications: ${carOptions.bodyKit} body kit, ${carOptions.hood}.`,
            carOptions.livery !== 'Clean (No Livery)' ? `Livery: ${carOptions.livery}.` : '',
            `View: ${view}.`,
            baseStyle
          ];
      } else if (carOptions.generationMode === 'wheel') {
          parts = [
            `Subject: Single Car Wheel and Tire.`,
            `Rim: ${carOptions.rims}, profile is ${carOptions.dishDepth}, color ${carOptions.finish}.`,
            `Tire: ${carOptions.tireProfile} rubber, fitment style is ${carOptions.fitment}, branding: ${carOptions.tireBranding}.`,
            `View: ${view === 'top-down' ? 'Top-down view showing tire tread' : 'Side profile of rim and tire sidewall'}.`,
            `Effect: ${carOptions.fx !== 'Static / Clean' ? carOptions.fx : 'Clean studio lighting'}.`,
            baseStyle
          ];
      } else if (carOptions.generationMode === 'rim') {
           parts = [
            `Subject: Single Car Wheel Rim (No Tire).`,
            `Style: ${carOptions.rims}.`,
            `Profile: ${carOptions.dishDepth}.`,
            `Color: ${carOptions.color} ${carOptions.finish}.`,
            `View: ${view === 'top-down' ? 'Top-down view of rim face' : 'Side profile of rim'}.`,
            baseStyle
          ];
      } else if (carOptions.generationMode === 'tire') {
           parts = [
            `Subject: Single Car Tire (Rubber only, empty center).`,
            `Type: ${carOptions.tires}, profile: ${carOptions.tireProfile}, branding: ${carOptions.tireBranding}.`,
            `View: ${view === 'top-down' ? 'Top-down view of tire tread' : 'Side profile of tire sidewall'}.`,
            baseStyle
          ];
      } else if (carOptions.generationMode === 'spoiler') {
           parts = [
            `Subject: Car Spoiler / Wing (Component).`,
            `Style: ${carOptions.spoiler}.`,
            `Color: ${carOptions.color} ${carOptions.finish}.`,
            `View: ${view}.`,
            baseStyle
          ];
      }

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

  // Update prompt for UI Builder
  useEffect(() => {
    if (config.type === 'ui' && useUiBuilder) {
        const parts = [
            `Game UI Asset: ${uiOptions.elementType}.`,
            `Style: ${uiOptions.theme}.`,
            `Shape: ${uiOptions.shape}.`,
            `Color Theme: ${uiOptions.primaryColor}.`,
            `View: Front facing flat UI element.`,
            'High quality game interface design, isolated on transparent background.'
        ];
        onConfigChange({ ...config, prompt: parts.join(' ') });
    }
  }, [uiOptions, useUiBuilder, config.type]);

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
        
        {/* SECTION 1: GENERAL */}
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
                   <option value="9:16">9:16 (Portrait Tall)</option>
                 </select>
             </div>
          </div>
        </SidebarSection>

        {/* SECTION 3: VEHICLE FORGE */}
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
                  <button 
                    onClick={() => setUseCarBuilder(!useCarBuilder)}
                    className="text-[10px] font-bold text-cyan-600 hover:text-cyan-400 uppercase tracking-wider flex items-center gap-1"
                  >
                    {useCarBuilder ? 'Manual Prompt' : 'Builder Mode'} <Terminal className="w-3 h-3" />
                  </button>
                </div>

                {useCarBuilder ? (
                  <div className="space-y-5 animate-in fade-in">
                     <div className="grid grid-cols-2 gap-2 mb-2">
                        {[
                            { id: 'complete', label: 'Full Vehicle', icon: Car },
                            { id: 'body', label: 'Body Only', icon: Component },
                            { id: 'wheel', label: 'Wheel & Tire', icon: Disc },
                            { id: 'rim', label: 'Rim Only', icon: CircleDashed },
                            { id: 'tire', label: 'Tire Only', icon: Circle },
                            { id: 'spoiler', label: 'Spoiler', icon: Wind }
                        ].map((mode) => (
                           <button
                              key={mode.id}
                              onClick={() => setCarOptions({...carOptions, generationMode: mode.id as any})}
                              className={`flex items-center gap-2 p-2 rounded-md text-[10px] font-bold uppercase transition-all border ${carOptions.generationMode === mode.id ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                           >
                              <mode.icon className="w-3 h-3" /> {mode.label}
                           </button>
                        ))}
                     </div>

                    {/* Paint & Chassis */}
                    {(carOptions.generationMode === 'complete' || carOptions.generationMode === 'body' || carOptions.generationMode === 'spoiler' || carOptions.generationMode === 'rim') && (
                      <div className="space-y-3">
                         <div className="flex items-center gap-2 text-xs font-bold text-slate-300 pb-1 border-b border-slate-800">
                           <Palette className="w-3.5 h-3.5 text-cyan-500" /> Paint & Chassis
                         </div>
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
                         <select 
                           value={carOptions.finish}
                           onChange={(e) => setCarOptions({...carOptions, finish: e.target.value})}
                           className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded p-2"
                         >
                           {PAINT_FINISHES.map(s => <option key={s} value={s}>{s}</option>)}
                         </select>
                         
                         {(carOptions.generationMode === 'complete' || carOptions.generationMode === 'body') && (
                            <>
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
                            </>
                         )}
                      </div>
                    )}

                    {/* WHEELS & STANCE - ENHANCED */}
                    {(carOptions.generationMode === 'complete' || carOptions.generationMode === 'wheel' || carOptions.generationMode === 'rim' || carOptions.generationMode === 'tire') && (
                      <div className="space-y-4">
                         <div className="flex items-center gap-2 text-xs font-bold text-slate-300 pb-1 border-b border-slate-800">
                           <Disc className="w-3.5 h-3.5 text-cyan-500" /> Wheels, Tires & Stance
                         </div>
                         
                         {/* Rim Selection */}
                         {(carOptions.generationMode === 'complete' || carOptions.generationMode === 'wheel' || carOptions.generationMode === 'rim') && (
                           <div className="space-y-2">
                             <select 
                                value={carOptions.rims}
                                onChange={(e) => setCarOptions({...carOptions, rims: e.target.value})}
                                className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded p-2"
                              >
                                {RIM_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                             </select>
                             
                             <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">Rim Depth Profile</label>
                             <div className="grid grid-cols-3 gap-2">
                                {RIM_DEPTH_OPTIONS.map((opt) => (
                                  <button
                                    key={opt.id}
                                    onClick={() => setCarOptions({...carOptions, dishDepth: opt.id})}
                                    title={opt.desc}
                                    className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${carOptions.dishDepth === opt.id ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                                  >
                                    <opt.icon className="w-4 h-4 mb-1" />
                                    <span className="text-[8px] font-bold text-center leading-tight">{opt.label}</span>
                                  </button>
                                ))}
                             </div>
                           </div>
                         )}

                         {/* Tire Stance / Fitment */}
                         {(carOptions.generationMode === 'complete' || carOptions.generationMode === 'wheel') && (
                           <div className="space-y-2">
                             <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Tire Stance / Fitment</label>
                             <div className="grid grid-cols-3 gap-2">
                                {TIRE_FITMENT_OPTIONS.map((opt) => (
                                  <button
                                    key={opt.id}
                                    onClick={() => setCarOptions({...carOptions, fitment: opt.id})}
                                    title={opt.desc}
                                    className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${carOptions.fitment === opt.id ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                                  >
                                    <opt.icon className="w-4 h-4 mb-1" />
                                    <span className="text-[8px] font-bold text-center leading-tight">{opt.label}</span>
                                  </button>
                                ))}
                             </div>
                           </div>
                         )}

                         {/* Tire Profile */}
                         {(carOptions.generationMode === 'complete' || carOptions.generationMode === 'wheel' || carOptions.generationMode === 'tire') && (
                           <div className="space-y-2">
                             <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Tire Profile (Sidewall Height)</label>
                             <div className="grid grid-cols-1 gap-1.5">
                                {TIRE_PROFILE_OPTIONS.map((opt) => (
                                  <button
                                    key={opt.id}
                                    onClick={() => setCarOptions({...carOptions, tireProfile: opt.id})}
                                    className={`flex items-center justify-between px-3 py-1.5 rounded-md border text-[10px] transition-all ${carOptions.tireProfile === opt.id ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800/50'}`}
                                  >
                                    <span className="font-bold">{opt.label}</span>
                                    <span className="text-[8px] opacity-60 uppercase tracking-tighter">{opt.desc}</span>
                                  </button>
                                ))}
                             </div>
                           </div>
                         )}

                         {/* Tire Branding */}
                         {(carOptions.generationMode === 'complete' || carOptions.generationMode === 'wheel' || carOptions.generationMode === 'tire') && (
                           <div className="space-y-2">
                             <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                               <Type className="w-3 h-3" /> Tire Branding & Style
                             </label>
                             <div className="grid grid-cols-1 gap-1.5">
                                {TIRE_BRANDING_OPTIONS.map((opt) => (
                                  <button
                                    key={opt.id}
                                    onClick={() => setCarOptions({...carOptions, tireBranding: opt.id})}
                                    className={`flex items-center justify-between px-3 py-1.5 rounded-md border text-[10px] transition-all ${carOptions.tireBranding === opt.id ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800/50'}`}
                                  >
                                    <span className="font-bold">{opt.label}</span>
                                    <span className="text-[8px] opacity-60 uppercase tracking-tighter">{opt.desc}</span>
                                  </button>
                                ))}
                             </div>
                           </div>
                         )}
                      </div>
                    )}

                    {/* Accessories & FX */}
                    <div className="space-y-3">
                       <div className="flex items-center gap-2 text-xs font-bold text-slate-300 pb-1 border-b border-slate-800">
                         <Flame className="w-3.5 h-3.5 text-cyan-500" /> Extras & Effects
                       </div>
                       <div className="grid grid-cols-2 gap-2">
                         {(carOptions.generationMode === 'complete' || carOptions.generationMode === 'body') && (
                           <select 
                              value={carOptions.livery}
                              onChange={(e) => setCarOptions({...carOptions, livery: e.target.value})}
                              className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded p-2"
                            >
                              {LIVERIES.map(s => <option key={s} value={s}>{s}</option>)}
                           </select>
                         )}
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
          </SidebarSection>
        )}

        {/* SECTION 4: GENERATION SETTINGS */}
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

      {/* Footer / Generate Button */}
      <div className="p-4 border-t border-slate-900 bg-slate-950 z-10">
        <button
          onClick={onGenerate}
          disabled={isGenerating || !config.prompt}
          className={`
            w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all duration-300 flex items-center justify-center gap-2
            ${isGenerating || !config.prompt 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg hover:shadow-cyan-500/20 active:scale-95'
            }
          `}
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Forging Asset...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Asset
            </>
          )}
        </button>
      </div>
      
      <div 
        onMouseDown={startResizing}
        className="absolute top-0 right-0 bottom-0 w-1 cursor-ew-resize hover:bg-cyan-500/50 transition-colors z-50" 
      />
    </div>
  );
};

export default Sidebar;
