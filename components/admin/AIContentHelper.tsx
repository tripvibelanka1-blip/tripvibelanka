'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Search,
  ExternalLink,
  Copy,
  Check,
  X,
  Camera,
  Bot,
  MapPin,
  Image as ImageIcon,
} from 'lucide-react';

export type AIModuleType = 'destination' | 'tour' | 'activity' | 'vehicle';

interface AIContentHelperProps {
  topic?: string;
  location?: string;
  moduleType: AIModuleType;
  className?: string;
  variant?: 'pill' | 'button' | 'compact';
}

export default function AIContentHelper({
  topic = '',
  location = '',
  moduleType,
  className = '',
  variant = 'pill',
}: AIContentHelperProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'imageOnly'>('all');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // Active Location is primary, fall back to topic
  const activeLocation = location?.trim() || topic?.trim() || '';
  const displayLocation = activeLocation || (
    moduleType === 'destination'
      ? 'e.g. Sigiriya'
      : moduleType === 'tour'
      ? 'e.g. Sigiriya, Kandy, Ella, Yala'
      : moduleType === 'activity'
      ? 'e.g. Yala National Park'
      : 'e.g. Toyota HiAce Super GL'
  );

  // Search URLs
  const searchQuery = activeLocation
    ? `${activeLocation} Sri Lanka tourism guide`
    : 'Sri Lanka tourism guide';
  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(
    searchQuery
  )}`;
  const googleImagesUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(
    activeLocation ? `${activeLocation} Sri Lanka` : 'Sri Lanka tourism'
  )}`;
  const geminiUrl = 'https://gemini.google.com/app';

  // ----------------------------------------------------
  // 1. Direct Instant Image Generation Prompt
  // ----------------------------------------------------
  const generateDirectImagePrompt = () => {
    const loc = activeLocation || '[Insert Location Name]';

    if (moduleType === 'destination') {
      return `Cinematic luxury travel photography of ${loc} in Sri Lanka, majestic panoramic vista, golden hour warm sunlight breaking through soft clouds, lush tropical scenery, candid luxury travelers admiring the view from a distance, shot on Leica SL2 with 35mm Summilux lens at f/2.8, ISO 100, hyper-realistic, photorealistic, 8k resolution, National Geographic editorial style, rich natural color grade --ar 16:9 --style raw --v 6.0`;
    }

    if (moduleType === 'tour') {
      return `Epic scenic landscape panorama highlighting ${loc} in Sri Lanka, winding highland roads, ancient heritage citadel and misty emerald tea gardens, dramatic sunset golden hour lighting, luxury private travel atmosphere, shot on Sony A7R V 24-70mm GM II at f/4.0, hyper-detailed, 8k resolution, photorealistic, Condé Nast Traveler cover aesthetic --ar 16:9 --style raw --v 6.0`;
    }

    if (moduleType === 'activity') {
      return `Dynamic luxury adventure photograph of an authentic excursion in ${loc} Sri Lanka, candid traveler moment, dramatic natural environment, crisp morning sunlight, golden dust motes and authentic textures, shot on Canon EOS R5 with 70-200mm f/2.8L at 1/1000s, 8k resolution, photorealistic action travel photography --ar 16:9 --style raw --v 6.0`;
    }

    // Vehicle
    return `Commercial automotive luxury photography of a pristine ${loc}, parked along a scenic Sri Lankan coastal highway lined with coconut palm trees and turquoise ocean in the background, soft golden hour side lighting, mirror-like paint reflections, shot on Hasselblad H6D-100c at 50mm, f/4, clean professional advertising look, 8k resolution, photorealistic --ar 16:9 --style raw --v 6.0`;
  };

  // ----------------------------------------------------
  // 2. Full Gemini Prompt (ONLY 5 items based on location, rest manual)
  // ----------------------------------------------------
  const generateGeminiPrompt = () => {
    const loc = activeLocation || '[Insert Location Name]';

    if (moduleType === 'destination') {
      return `You are an elite luxury travel writer & art director for TripVibe Lanka, a premier private tour operator in Sri Lanka.
The location entered by the admin is: "${loc}".

Based ONLY on this location, please generate ONLY the following 5 items (everything else is handled manually by the admin):

1. Title:
A refined, captivating luxury title for this destination (e.g. "Sigiriya & The Ancient Citadel").

2. Marketing Tagline:
A punchy, evocative 1-sentence luxury subtitle capturing the mood and prestige of this location.

3. Category:
Recommended category (e.g. Cultural Heritage, Hill Country, Coastal & Beaches, Wildlife & Nature, or Sacred Sites).

4. Content Description:
An evocative, immersive 2-to-3 sentence description detailing the sensory atmosphere, cultural/natural splendor, and authentic allure of this place.

5. Image Generation Prompt (for Midjourney / Gemini Imagen / Flux):
An ultra-detailed, photorealistic prompt to generate stunning travel photography for this destination:
- Visual: Wide cinematic vista of ${loc}, lush tropical scenery, morning golden hour light breaking through mist, candid luxury travelers admiring the view from a distance.
- Photography: Shot on Leica SL2 35mm f/2.8, 8k resolution, authentic color grading, hyper-realistic textures, award-winning National Geographic editorial style --ar 16:9 --style raw

Tone: Sophisticated, authentic, and evocative. Avoid cliché AI buzzwords like "elevate", "seamless", or "next-level".`;
    }

    if (moduleType === 'tour') {
      return `You are an elite luxury tour designer & art director for TripVibe Lanka, crafting bespoke private chauffeur itineraries in Sri Lanka.
The location(s) entered by the admin are: "${loc}".

Based ONLY on these location(s), please generate ONLY the following 5 items (everything else like itinerary days, inclusions, exclusions, and pricing is handled manually):

1. Title:
A captivating, prestigious tour package title connecting these locations (e.g. "Ancient Kingdoms & Wild Highlands Odyssey").

2. Marketing Tagline:
A punchy 1-sentence subtitle capturing the spirit and narrative arc of this journey.

3. Category:
Best-fit category filter (Choose one: Cultural, Wildlife, Coastal, Hill Country, or Signature).

4. Content Description:
A rich, evocative 2-to-3 sentence overview describing the narrative, sensory circuit, and authentic highlights connecting these destinations.

5. Image Generation Prompt (for Midjourney / Gemini Imagen / Flux):
An ultra-detailed photorealistic prompt for generating a signature hero cover photo:
- Visual: Epic cinematic landscape panorama showcasing iconic scenery from ${loc}, dramatic sunset lighting, misty valleys, emerald tea gardens or coastal roads.
- Photography: Shot on Sony A7R V 24-70mm GM II, f/4, 8k resolution, natural warm light, photorealistic, Condé Nast Traveler editorial cover aesthetic --ar 16:9 --style raw

Tone: Tailored luxury, authentic, and evocative.`;
    }

    if (moduleType === 'activity') {
      return `You are an expert adventure & excursion curator for TripVibe Lanka.
The location entered by the admin is: "${loc}".

Based ONLY on this location, please generate ONLY the following 5 items (everything else like duration, inclusions, and pricing is handled manually):

1. Title:
A captivating, authentic title for a premier excursion in this location (e.g. "Dawn Leopard Safari & Wilderness Game Drive").

2. Marketing Tagline:
A punchy 1-sentence subtitle capturing the adrenaline, wonder, and exclusivity of the excursion.

3. Category:
Best-fit category (Choose one: Wildlife & Nature, Adventure & Trekking, Cultural & Sacred, Culinary & Heritage, or Marine Adventure).

4. Content Description:
A vivid, sensory 2-to-3 sentence description detailing what travelers will see, hear, feel, and encounter during this experience.

5. Image Generation Prompt (for Midjourney / Gemini Imagen / Flux):
An ultra-detailed photorealistic prompt for generating authentic excursion photography:
- Visual: Authentic, candid travel action moment in ${loc}, dramatic natural environment, crisp morning sunlight, golden dust motes or ocean spray.
- Photography: Shot on Canon EOS R5 with 70-200mm f/2.8L, 8k resolution, natural documentary color grading, photorealistic, no AI distortion --ar 16:9 --style raw

Tone: Vivid, captivating, and authentic.`;
    }

    // Vehicle
    return `You are an executive chauffeur fleet manager & art director for TripVibe Lanka.
The vehicle entered by the admin is: "${loc}".

Based ONLY on this vehicle model, please generate ONLY the following 5 items (all mechanical specs, seating capacity, and rates are handled manually):

1. Title:
Refined presentation model title (e.g. "Toyota HiAce Super GL Luxury Coach").

2. Marketing Tagline:
A punchy 1-sentence subtitle for the ideal passenger group (e.g. "Couples, solo travelers & executive business trips").

3. Category:
Fleet category (Choose one: Passenger Van, Sedan Car, Luxury VIP Chauffeur, Mini Bus, or Large Tourist Coach).

4. Content Description:
A sleek 2-sentence description highlighting ride smoothness, climate comfort, and confidence across Sri Lanka's coastal highways and hill country passes.

5. Image Generation Prompt (for Midjourney / Gemini Imagen / Flux):
An ultra-realistic commercial automotive photograph of this vehicle:
- Setting: Parked along a scenic Sri Lankan coastal highway or outside a luxury colonial tea estate, clean reflection on bodywork.
- Photography: Shot on Hasselblad H6D-100c, soft golden hour side lighting, 8k resolution, clean automotive advertising aesthetic --ar 16:9 --style raw

Tone: Executive, reassuring, and premium.`;
  };

  const directImagePrompt = generateDirectImagePrompt();
  const fullGeminiPrompt = generateGeminiPrompt();

  // Copy Handlers
  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(fullGeminiPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2200);
    } catch (err) {
      console.error('Failed to copy prompt:', err);
    }
  };

  const handleCopyImageOnly = async () => {
    try {
      await navigator.clipboard.writeText(directImagePrompt);
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2200);
    } catch (err) {
      console.error('Failed to copy image prompt:', err);
    }
  };

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const moduleLabel =
    moduleType === 'destination'
      ? 'Destination'
      : moduleType === 'tour'
      ? 'Tour Package'
      : moduleType === 'activity'
      ? 'Activity'
      : 'Vehicle';

  return (
    <div ref={popoverRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      {variant === 'pill' ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r from-purple-50 via-amber-50 to-orange-50 text-slate-800 border border-purple-200 hover:border-purple-300 hover:shadow-xs transition-all cursor-pointer select-none group active:scale-95"
          title="Open AI Content & Image Generation Prompt"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-600 group-hover:rotate-12 transition-transform" />
          <span>AI Content & Image</span>
          <span className="text-[10px] text-purple-700 bg-purple-100/70 px-1.5 py-0.2 rounded font-mono">
            Gemini
          </span>
        </button>
      ) : variant === 'button' ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all cursor-pointer shadow-xs active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Generate with AI</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-all cursor-pointer"
          title="Open AI Prompt Tooltip"
        >
          <Sparkles className="w-4 h-4" />
        </button>
      )}

      {/* Floating Popover / Tooltip Balloon */}
      {isOpen && (
        <div className="absolute right-0 sm:left-0 sm:right-auto top-full mt-2 z-50 w-[94vw] sm:w-[500px] md:w-[540px] max-w-xl p-5 bg-white rounded-3xl border border-purple-200/90 shadow-2xl shadow-purple-900/10 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-left">
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 via-indigo-500 to-[#FF6B00] text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <span>AI Content & Image Prompt</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.2 rounded-full">
                    {moduleLabel}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Generates Title, Tagline, Category, Description & Image Prompt from your location
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Location Badge */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-50/80 via-indigo-50/50 to-orange-50/60 border border-purple-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-[#FF6B00] flex-shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 flex-shrink-0">
                Location Entered:
              </span>
              <span className="font-bold text-slate-900 truncate font-mono">
                {displayLocation}
              </span>
            </div>
            {!activeLocation && (
              <span className="text-[10px] text-amber-600 font-medium italic flex-shrink-0 pl-2">
                (Type in the form to update)
              </span>
            )}
          </div>

          {/* Quick Research Reference Links */}
          <div className="flex items-center gap-2 pt-0.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-600 mr-1">
              Google Reference:
            </span>
            <a
              href={googleSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            >
              <Search className="w-3 h-3 text-[#FF6B00]" />
              <span>Search Google</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-50" />
            </a>

            <a
              href={googleImagesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            >
              <Camera className="w-3 h-3 text-purple-600" />
              <span>Google Images</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-50" />
            </a>
          </div>

          {/* Tab Selector: Full Content & Image Prompt vs Direct Image Prompt */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Content & Image (5 Fields)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('imageOnly')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                activeTab === 'imageOnly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
              <span>Image Prompt Only</span>
            </button>
          </div>

          {/* Prompt Display & Copy */}
          {activeTab === 'all' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">
                  Prompts Gemini to generate <b>Title, Tagline, Category, Description & Image Prompt</b>:
                </span>
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    copiedPrompt
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs active:scale-95'
                  }`}
                >
                  {copiedPrompt ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Gemini Prompt</span>
                    </>
                  )}
                </button>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 max-h-40 overflow-y-auto">
                <pre className="text-[11px] font-sans text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {fullGeminiPrompt}
                </pre>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">
                  Direct prompt for <b>Midjourney, Gemini Imagen, or Flux</b>:
                </span>
                <button
                  type="button"
                  onClick={handleCopyImageOnly}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    copiedImage
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-gradient-to-r from-orange-500 to-[#FF6B00] hover:from-orange-600 hover:to-orange-700 text-white shadow-xs active:scale-95'
                  }`}
                >
                  {copiedImage ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Image Prompt</span>
                    </>
                  )}
                </button>
              </div>

              <div className="rounded-2xl bg-slate-900 text-slate-100 p-3.5 max-h-40 overflow-y-auto border border-slate-800">
                <p className="text-[11px] font-mono text-slate-200 leading-relaxed select-all">
                  {directImagePrompt}
                </p>
              </div>
            </div>
          )}

          {/* Launch Gemini Action */}
          <div className="pt-2 border-t border-slate-100">
            <a
              href={geminiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-[#FF6B00] hover:from-purple-700 hover:to-orange-600 shadow-md shadow-purple-500/20 active:scale-[0.99] transition-all cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>Launch Google Gemini (gemini.google.com)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
