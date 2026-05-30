import React from "react";

interface SpriteRendererProps {
  type: string;
  size?: number;
  className?: string;
  direction?: "left" | "right";
  isMoving?: boolean;
}

export const SpriteRenderer: React.FC<SpriteRendererProps> = ({
  type,
  size = 32,
  className = "",
  direction = "right",
  isMoving = false,
}) => {
  const isLeft = direction === "left";
  // Subtly bounce when moving
  const bounceY = isMoving ? "animate-[bounce_0.6s_infinite_margin]" : "";

  // Helper to generate pixelated path arrays
  const renderPixelPaths = () => {
    switch (type.toLowerCase()) {
      // PLAYERS
      case "ceo":
        return (
          <>
            {/* Outline */}
            <rect x="5" y="1" width="22" height="30" fill="none" stroke="#000000" strokeWidth="1" />
            {/* Slick Hair with highlight */}
            <rect x="6" y="2" width="20" height="6" fill="#1e1e2d" />
            <rect x="8" y="3" width="16" height="2" fill="#3f3f5a" /> {/* Hair Highlight */}
            {/* Face & Neck */}
            <rect x="8" y="8" width="16" height="8" fill="#fddcb4" />
            <rect x="10" y="14" width="12" height="2" fill="#e2b485" /> {/* Face Shadow */}
            {/* Sunglasses with glare */}
            <rect x="6" y="10" width="20" height="4" fill="#0c0c0f" />
            <rect x="8" y="10" width="2" height="2" fill="#ffffff" /> {/* Glare 1 */}
            <rect x="18" y="10" width="2" height="2" fill="#ffffff" /> {/* Glare 2 */}
            {/* Tuxedo Suite */}
            <rect x="6" y="16" width="20" height="12" fill="#111827" />
            <rect x="6" y="16" width="4" height="12" fill="#1f2937" /> {/* Left shoulder highlight */}
            <rect x="22" y="16" width="4" height="12" fill="#0f172a" /> {/* Right shoulder shadow */}
            {/* White Shirt & Blue Tie */}
            <rect x="12" y="16" width="8" height="6" fill="#ffffff" />
            <rect x="14" y="16" width="4" height="6" fill="#2563eb" /> {/* Royal Blue Tie */}
            <rect x="14" y="20" width="4" height="3" fill="#1d4ed8" /> {/* Tie Shadow */}
            {/* Gold Lapel Pin */}
            <circle cx="9" cy="19" r="1.5" fill="#f59e0b" />
            {/* Shoes */}
            <rect x="7" y="28" width="7" height="4" fill="#090d16" />
            <rect x="8" y="29" width="5" height="1" fill="#475569" /> {/* Shoe Highlight */}
            <rect x="18" y="28" width="7" height="4" fill="#090d16" />
            <rect x="19" y="29" width="5" height="1" fill="#475569" />
          </>
        );
      case "ski":
        return (
          <>
            {/* Helmet & Goggles */}
            <rect x="6" y="2" width="20" height="10" fill="#2563eb" /> {/* Glossy Blue Helmet */}
            <rect x="9" y="3" width="14" height="2" fill="#60a5fa" /> {/* Helmet Shine */}
            <rect x="6" y="5" width="20" height="5" fill="#f43f5e" /> {/* Pink Visor */}
            <rect x="8" y="5" width="4" height="2" fill="#ffffff" stroke="#fda4af" strokeWidth="0.5" /> {/* Glare */}
            {/* Face protector / chin */}
            <rect x="8" y="10" width="16" height="8" fill="#e5e7eb" />
            <rect x="10" y="13" width="12" height="4" fill="#f97316" stroke="#c2410c" strokeWidth="0.5" /> {/* Warm neck warmer */}
            {/* High-tech Ski Jacket */}
            <rect x="4" y="18" width="24" height="10" fill="#1d4ed8" />
            <rect x="4" y="18" width="2" height="8" fill="#60a5fa" /> {/* Left arm stripe */}
            <rect x="26" y="18" width="2" height="8" fill="#60a5fa" /> {/* Right arm stripe */}
            <rect x="13" y="18" width="6" height="10" fill="#f43f5e" /> {/* Center neon pink strip */}
            {/* Ski Poles (Yellow) */}
            <rect x="2" y="14" width="2" height="17" fill="#fbbf24" stroke="#d97706" strokeWidth="0.5" />
            <rect x="1" y="16" width="4" height="2" fill="#475569" /> {/* Pole Grip */}
            <rect x="28" y="14" width="2" height="17" fill="#fbbf24" stroke="#d97706" strokeWidth="0.5" />
            <rect x="27" y="16" width="4" height="2" fill="#475569" />
            {/* Hot Skis underneath */}
            <rect x="5" y="29" width="22" height="3" fill="#f43f5e" stroke="#9f1239" strokeWidth="0.5" />
            <rect x="7" y="29" width="18" height="1" fill="#ffe4e6" />
          </>
        );
      case "diver":
        return (
          <>
            {/* Antique copper helmet */}
            <rect x="6" y="2" width="20" height="20" fill="#d97706" stroke="#78350f" strokeWidth="1" />
            <rect x="9" y="3" width="14" height="3" fill="#fbbf24" /> {/* Metallic top shine */}
            {/* Viewport */}
            <circle cx="16" cy="11" r="6" fill="#06b6d4" stroke="#78350f" strokeWidth="1.5" />
            <circle cx="14" cy="9" r="2.5" fill="#e0f2fe" /> {/* Viewport reflection */}
            {/* Copper bolts and rivets */}
            <circle cx="9" cy="6" r="1.2" fill="#f59e0b" />
            <circle cx="23" cy="6" r="1.2" fill="#f59e0b" />
            <circle cx="9" cy="16" r="1.2" fill="#f59e0b" />
            <circle cx="23" cy="16" r="1.2" fill="#f59e0b" />
            {/* Diver Suit */}
            <rect x="4" y="22" width="24" height="8" fill="#b45309" />
            <rect x="13" y="22" width="6" height="5" fill="#f59e0b" /> {/* Chest valve base */}
            <circle cx="16" cy="24.5" r="2" fill="#ef4444" /> {/* Red main valve button */}
            {/* Heavy boots */}
            <rect x="7" y="30" width="7" height="2" fill="#1e293b" />
            <rect x="18" y="30" width="7" height="2" fill="#1e293b" />
          </>
        );
      case "pilot":
        return (
          <>
            {/* Cap and Flaps */}
            <rect x="6" y="2" width="20" height="8" fill="#451a03" stroke="#1c0a00" strokeWidth="0.5" />
            <rect x="4" y="6" width="3" height="6" fill="#3b1301" /> {/* Ear flap L */}
            <rect x="25" y="6" width="3" height="6" fill="#3b1301" /> {/* Ear flap R */}
            <rect x="8" y="10" width="16" height="7" fill="#fddcb4" /> {/* Face */}
            {/* Aviator Glasses */}
            <rect x="7" y="11" width="18" height="4" fill="#0f172a" />
            <rect x="8" y="12" width="4" height="2" fill="#38bdf8" /> {/* Lens L */}
            <rect x="16" y="12" width="4" height="2" fill="#38bdf8" /> {/* Lens R */}
            {/* Scarf & Bomber Jacket */}
            <rect x="4" y="17" width="24" height="12" fill="#5c1d02" />
            <rect x="11" y="17" width="10" height="5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.5" /> {/* White pilot scarf */}
            <rect x="14" y="21" width="4" height="8" fill="#e2e8f0" /> {/* Scarf tail */}
            {/* Pocket badge */}
            <rect x="7" y="21" width="3" height="2" fill="#eab308" />
            <rect x="8" y="28" width="16" height="4" fill="#0f172a" /> {/* Pants */}
          </>
        );
      case "chef":
        return (
          <>
            {/* Chef Hat */}
            <path d="M 9,10 Q 16,1 23,10 L 23,13 L 9,13 Z" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="11" y="4" width="10" height="6" fill="#ffffff" />
            <rect x="9" y="12" width="14" height="3" fill="#e2e8f0" /> {/* Hat base strip */}
            {/* Face */}
            <rect x="9" y="15" width="14" height="6" fill="#ffedd5" />
            <rect x="11" y="16.5" width="3" height="1.5" fill="#451a03" /> {/* Mustache L */}
            <rect x="18" y="16.5" width="3" height="1.5" fill="#451a03" /> {/* Mustache R */}
            <rect x="13" y="19" width="6" height="1.5" fill="#ef4444" /> {/* Mouth */}
            {/* Suit & Apron */}
            <rect x="6" y="21" width="20" height="9" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.5" />
            <rect x="12" y="21" width="8" height="9" fill="#dc2626" /> {/* Red center tie/apron band */}
            <rect x="7" y="23" width="2" height="2" fill="#475569" /> {/* Button L */}
            <rect x="23" y="23" width="2" height="2" fill="#475569" /> {/* Button R */}
            {/* Chef's knife */}
            <rect x="2" y="21" width="3" height="8" fill="#94a3b8" /> {/* Blade */}
            <rect x="3.5" y="21.5" width="1" height="5" fill="#e2e8f0" /> {/* Shine */}
            <rect x="2.5" y="29" width="2" height="2" fill="#78350f" /> {/* Handle */}
          </>
        );
      case "explorer":
        return (
          <>
            {/* Fedora Hat */}
            <rect x="4" y="6" width="24" height="3" fill="#854d0e" stroke="#451a03" strokeWidth="0.5" /> {/* Brim */}
            <rect x="7" y="2" width="18" height="4" fill="#a16207" /> {/* Hat Crown */}
            <rect x="7" y="5" width="18" height="1" fill="#b45309" /> {/* Accent band */}
            {/* Face */}
            <rect x="8" y="9" width="16" height="7" fill="#fddcb4" />
            <circle cx="11" cy="11.5" r="1.2" fill="#1e293b" /> {/* Eye L */}
            <circle cx="21" cy="11.5" r="1.2" fill="#1e293b" /> {/* Eye R */}
            {/* Explorer Khakis */}
            <rect x="6" y="16" width="20" height="12" fill="#ca8a04" stroke="#854d0e" strokeWidth="0.5" />
            <rect x="6" y="16" width="3" height="7" fill="#b45309" /> {/* Shoulder strap L */}
            <rect x="23" y="16" width="3" height="7" fill="#b45309" /> {/* Shoulder strap R */}
            {/* Backpack on side */}
            <rect x="3" y="17" width="3" height="9" fill="#7c2d12" />
            {/* Pants/Shoes */}
            <rect x="8" y="28" width="16" height="3" fill="#854d0e" />
          </>
        );
      case "space":
        return (
          <>
            {/* Visor & Helmet */}
            <rect x="7" y="2" width="18" height="18" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" rx="5" />
            <rect x="9" y="4" width="14" height="10" fill="#0f172a" rx="3" /> {/* Dark Visor */}
            <rect x="10" y="5" width="8" height="4" fill="#38bdf8" opacity="0.4" /> {/* Visor reflection */}
            <circle cx="20" cy="11" r="1" fill="#ec4899" /> {/* Module dot */}
            {/* Suit body */}
            <rect x="6" y="20" width="20" height="10" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.5" />
            <rect x="11" y="22" width="10" height="5" fill="#06b6d4" /> {/* Control pad */}
            <circle cx="13" cy="24" r="1" fill="#ef4444" />
            <circle cx="18" cy="24" r="1" fill="#22c55e" />
            {/* Side booster pack */}
            <rect x="3" y="20" width="3" height="8" fill="#cbd5e1" />
            <rect x="26" y="20" width="3" height="8" fill="#cbd5e1" />
          </>
        );
      case "tycoon":
        return (
          <>
            {/* Black Top Hat */}
            <rect x="8" y="1" width="16" height="10" fill="#0f172a" />
            <rect x="8" y="10" width="16" height="2" fill="#ef4444" /> {/* Red satin ribbon */}
            <rect x="4" y="11" width="24" height="2" fill="#0f172a" /> {/* Hat rim */}
            {/* Face */}
            <rect x="8" y="13" width="16" height="6" fill="#fddcb4" />
            <circle cx="12" cy="15" r="2.5" fill="#f59e0b" stroke="#b45309" strokeWidth="0.5" /> {/* Gold Monocle */}
            <path d="M 21,17.5 L 25,17.5" stroke="#3b1301" strokeWidth="1.5" /> {/* Cigar */}
            <circle cx="25.5" cy="17.5" r="0.8" fill="#ef4444" className="animate-pulse" /> {/* Burning tip */}
            {/* Suit */}
            <rect x="5" y="19" width="22" height="10" fill="#0f172a" />
            <rect x="11" y="19" width="10" height="5" fill="#ffffff" /> {/* White shirt */}
            <rect x="14" y="20" width="4" height="2" fill="#dc2626" /> {/* Red bow-tie */}
            {/* Gold Chain */}
            <path d="M 12,23 Q 16,27 20,23" fill="none" stroke="#f59e0b" strokeWidth="1" />
            {/* Shoes */}
            <rect x="7" y="29" width="7" height="3" fill="#000000" />
            <rect x="18" y="29" width="7" height="3" fill="#000000" />
          </>
        );

      // NPCS
      case "secretary":
        return (
          <>
            {/* Hair Bun & Hair */}
            <circle cx="16" cy="3.5" r="3" fill="#581c87" /> {/* Violet Hair Bun */}
            <rect x="7" y="6" width="18" height="6" fill="#6b21a8" />
            {/* Face */}
            <rect x="9" y="10" width="14" height="7" fill="#fee2e2" />
            {/* Cute Pink/Magenta Glasses */}
            <rect x="8" y="11.5" width="16" height="3" fill="none" stroke="#db2777" strokeWidth="1" />
            <circle cx="11.5" cy="13" r="1.5" fill="#db2777" opacity="0.3" />
            <circle cx="20.5" cy="13" r="1.5" fill="#db2777" opacity="0.3" />
            {/* Corporate Skirt Suit */}
            <rect x="6" y="17" width="20" height="11" fill="#4c1d95" />
            <rect x="12" y="17" width="8" height="5" fill="#fdf2f8" /> {/* Pink undershirt */}
            {/* Gold Badge */}
            <rect x="7" y="19" width="2.5" height="1.5" fill="#eab308" />
            {/* Clipboard */}
            <rect x="19" y="19" width="8" height="10.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.5" />
            <rect x="21" y="18" width="4" height="1.5" fill="#475569" /> {/* Clip */}
            <rect x="21" y="21" width="4" height="1" fill="#3b82f6" /> {/* Text line */}
            <rect x="21" y="23.5" width="4" height="1" fill="#64748b" />
            <rect x="21" y="26" width="4" height="1" fill="#22c55e" />
          </>
        );
      case "dog":
        return (
          <>
            {/* Shiba/Husky Head */}
            <rect x="11" y="8" width="14" height="10" fill="#f59e0b" rx="2" />
            <rect x="9" y="6" width="4" height="5" fill="#b45309" /> {/* Ear Left */}
            <rect x="23" y="6" width="4" height="5" fill="#b45309" /> {/* Ear Right */}
            <rect x="13" y="11" width="10" height="7" fill="#ffffff" /> {/* Muzzle white block */}
            <circle cx="15" cy="12" r="1" fill="#0f172a" /> {/* Eye L */}
            <circle cx="21" cy="12" r="1" fill="#0f172a" /> {/* Eye R */}
            <polygon points="17,14 19,14 18,15.5" fill="#0f172a" /> {/* Cute Nose */}
            {/* Torso */}
            <rect x="9" y="18" width="18" height="9" fill="#d97706" rx="2" />
            {/* Cyber collar with bubble */}
            <rect x="9" y="17.5" width="18" height="2" fill="#06b6d4" />
            <circle cx="18" cy="18.5" r="2.5" fill="#22d3ee" className="animate-pulse" /> {/* Collar module */}
            {/* Dog Feet */}
            <rect x="10" y="27" width="4" height="4" fill="#f59e0b" />
            <rect x="22" y="27" width="4" height="4" fill="#f59e0b" />
            {/* Tail */}
            <path d="M 27,21 Q 31,18 30,15" fill="none" stroke="#d97706" strokeWidth="2.5" />
          </>
        );
      case "butler":
        return (
          <>
            {/* Hair */}
            <rect x="8" y="2" width="16" height="8" fill="#94a3b8" />
            <rect x="6" y="5" width="20" height="2" fill="#cbd5e1" /> {/* Hair Highlight */}
            {/* Face */}
            <rect x="10" y="10" width="12" height="7" fill="#ffedd5" />
            <circle cx="13" cy="12" r="1" fill="#1e293b" />
            <circle cx="19" cy="12" r="1" fill="#1e293b" />
            {/* Tailcoat Suit */}
            <rect x="5" y="17" width="22" height="12" fill="#0f172a" />
            <rect x="12" y="17" width="8" height="7" fill="#ffffff" /> {/* White shirt center */}
            <rect x="13.5" y="19.5" width="5" height="2" fill="#dc2626" /> {/* Bow tie */}
            <circle cx="16" cy="22" r="1" fill="#0f172a" /> {/* Button */}
            {/* Silver Tray & Wine glass */}
            <rect x="21" y="18" width="9" height="1.5" fill="#e2e8f0" /> {/* Silver tray */}
            <path d="M 23.5,13 L 26.5,13 L 26.5,14 L 25.5,16 L 25.5,17.5 L 23.5,17.5 Z" fill="#ef4444" opacity="0.8" /> {/* Wine glass */}
            <line x1="25" y1="16" x2="25" y2="18" stroke="#ffffff" strokeWidth="1" /> {/* Stem */}
          </>
        );
      case "investor":
        return (
          <>
            {/* Wild Blonde Hair */}
            <rect x="6" y="1" width="20" height="9" fill="#fbbf24" stroke="#d97706" strokeWidth="0.5" />
            <path d="M 6,5 L 3,7 L 6,9" stroke="#d97706" strokeWidth="1" /> {/* Spikes */}
            <path d="M 26,5 L 29,7 L 26,9" stroke="#d97706" strokeWidth="1" />
            {/* Face */}
            <rect x="8" y="10" width="16" height="6" fill="#ffedd5" />
            <rect x="9" y="11" width="2" height="2" fill="#059669" /> {/* Crazy green eyes */}
            <rect x="21" y="11" width="2" height="2" fill="#059669" />
            {/* Red Blazer */}
            <rect x="4" y="16" width="24" height="12" fill="#dc2626" />
            <rect x="12" y="16" width="8" height="6" fill="#0f172a" /> {/* Dark tie */}
            {/* Stacks of Cash */}
            <rect x="7" y="21" width="18" height="7" fill="#10b981" rx="1.5" stroke="#047857" strokeWidth="0.5" /> {/* Green money piles */}
            <rect x="13" y="21" width="3" height="7" fill="#ffffff" opacity="0.8" /> {/* Strap L */}
            <rect x="20" y="21" width="3" height="7" fill="#ffffff" opacity="0.8" /> {/* Strap R */}
          </>
        );
      case "robot":
        return (
          <>
            {/* Steel Head */}
            <rect x="8" y="4" width="16" height="10" fill="#94a3b8" stroke="#475569" strokeWidth="1" rx="2" />
            <rect x="10" y="5.5" width="12" height="2.5" fill="#1e293b" />
            <circle cx="12" cy="6.8" r="1.5" fill="#22d3ee" className="animate-pulse" /> {/* Cyber Cyan Eye L */}
            <circle cx="20" cy="6.8" r="1.5" fill="#22d3ee" className="animate-pulse" /> {/* Eye R */}
            <rect x="15" y="1" width="2" height="3" fill="#ef4444" /> {/* Antenna */}
            <circle cx="16" cy="1.2" r="1.5" fill="#fbbf24" className="animate-ping" /> {/* Blinking warning bulb */}
            {/* Chest & Body */}
            <rect x="5" y="14" width="22" height="14" fill="#64748b" stroke="#334155" strokeWidth="1" />
            <rect x="9" y="16.5" width="14" height="7.5" fill="#0f172a" rx="1" /> {/* Core display */}
            <path d="M 10,20 L 14,18 L 18,21 L 22,17" fill="none" stroke="#22c55e" strokeWidth="1.5" /> {/* Graph line */}
            {/* Side bolts */}
            <circle cx="7" cy="25" r="1" fill="#475569" />
            <circle cx="25" cy="25" r="1" fill="#475569" />
          </>
        );
      case "alien":
        return (
          <>
            {/* Cyber green gelatinous head */}
            <rect x="7" y="3" width="18" height="13" fill="#4ade80" stroke="#166534" strokeWidth="1" rx="4" />
            <rect x="10" y="4" width="12" height="4" fill="#a7f3d0" /> {/* Highlight */}
            {/* Three eyes */}
            <circle cx="11" cy="11" r="2" fill="#ffffff" />
            <circle cx="11" cy="11" r="0.8" fill="#db2777" />
            <circle cx="16" cy="9" r="2" fill="#ffffff" />
            <circle cx="16" cy="9" r="0.8" fill="#db2777" />
            <circle cx="21" cy="11" r="2" fill="#ffffff" />
            <circle cx="21" cy="11" r="0.8" fill="#db2777" />
            {/* Antennas */}
            <line x1="12" y1="3" x2="10" y2="1" stroke="#f59e0b" strokeWidth="1.5" />
            <circle cx="10" cy="1" r="1.5" fill="#f59e0b" />
            <line x1="20" y1="3" x2="22" y2="1" stroke="#f59e0b" strokeWidth="1.5" />
            <circle cx="22" cy="1" r="1.5" fill="#f59e0b" />
            {/* Space tunic */}
            <rect x="8" y="16" width="16" height="12" fill="#047857" stroke="#064e3b" strokeWidth="0.5" />
            <rect x="11" y="18" width="10" height="2" fill="#eab308" /> {/* Gold belt */}
          </>
        );
      case "guard":
        return (
          <>
            {/* Security Cap */}
            <rect x="6" y="2" width="20" height="5" fill="#0f172a" />
            <rect x="4" y="5.5" width="24" height="1.5" fill="#1e293b" /> {/* Cap visor edge */}
            <rect x="15" y="3" width="2" height="2" fill="#f59e0b" /> {/* Security Badge */}
            {/* Face */}
            <rect x="8" y="7" width="16" height="8" fill="#ffedd5" />
            <rect x="6" y="9.5" width="20" height="3" fill="#000000" /> {/* Heavy shades */}
            {/* Tactical Armor vest */}
            <rect x="4" y="15" width="24" height="13.5" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
            <rect x="7" y="17" width="18" height="6" fill="#0f172a" /> {/* Bulletproof sheet */}
            <rect x="9" y="19" width="14" height="2" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.5" /> {/* POLICE/GUARD text */}
            {/* Baton & flashlight on belt */}
            <rect x="23" y="22" width="2" height="7" fill="#3b4252" />
            <rect x="7" y="22" width="3" height="4" fill="#d8dee9" />
          </>
        );

      // ITEMS & FURNITURE
      case "desk":
        return (
          <>
            {/* Polished Mahogany Top */}
            <rect x="1" y="11" width="30" height="7" fill="#7c2d12" stroke="#451a03" strokeWidth="0.5" />
            <rect x="2" y="11.5" width="28" height="1.5" fill="#b45309" /> {/* Top specular reflection */}
            {/* Sturdy Desk Legs */}
            <rect x="3" y="18" width="4" height="11.5" fill="#451a03" />
            <rect x="25" y="18" width="4" height="11.5" fill="#451a03" />
            <rect x="3" y="28" width="5" height="1.5" fill="#0f172a" />
            <rect x="24" y="28" width="5" height="1.5" fill="#0f172a" />
            {/* High Tech Monitor */}
            <rect x="9" y="3" width="14" height="7.5" fill="#475569" rx="1" />
            <rect x="10" y="4" width="12" height="5.5" fill="#0f172a" />
            {/* Financial Graph details inside screen */}
            <path d="M 11,8 L 14,6 L 17,7 L 21,5" fill="none" stroke="#10b981" strokeWidth="1.2" /> {/* Trend up */}
            <circle cx="21" cy="5" r="0.8" fill="#34d399" className="animate-pulse" />
            {/* Stand */}
            <rect x="14" y="10.5" width="4" height="1" fill="#475569" />
          </>
        );
      case "pen":
        return (
          <>
            {/* Gold Pen body */}
            <line x1="26" y1="4" x2="6" y2="24" stroke="#fbbf24" strokeWidth="3" />
            <line x1="24" y1="6" x2="8" y2="22" stroke="#f59e0b" strokeWidth="1" />
            {/* Silver pen nib */}
            <polygon points="6,24 10,22 6,20" fill="#f8fafc" />
            <polygon points="5,26 6,24 4,24" fill="#cbd5e1" />
            {/* Star Sparkles around the pen */}
            <polygon points="12,6 13,8 15,9 13,10 12,12 11,10 9,9 11,8" fill="#ffffff" className="animate-pulse" />
            <polygon points="22,18 23,19 24,18 23,17" fill="#60a5fa" className="animate-pulse" />
          </>
        );
      case "coffee":
        return (
          <>
            {/* Machine Main Body */}
            <rect x="6" y="5" width="20" height="23" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" rx="3" />
            <rect x="7" y="6" width="18" height="6" fill="#334155" /> {/* Top lid */}
            {/* Display screen */}
            <rect x="9" y="13" width="14" height="5.5" fill="#020617" />
            <rect x="11" y="15" width="10" height="1.5" fill="#22d3ee" className="animate-pulse" /> {/* Liquid meter */}
            {/* Golden Mug */}
            <rect x="13" y="21.5" width="6" height="5.5" fill="#fbbf24" stroke="#d97706" strokeWidth="0.5" rx="1" />
            <path d="M 19,22.5 Q 21,23 21,24.5 Q 21,26 19,26.5" fill="none" stroke="#d97706" strokeWidth="1" /> {/* Mug Handle */}
            {/* Flowing coffee */}
            <line x1="16" y1="18.5" x2="16" y2="21.5" stroke="#38bdf8" strokeWidth="1.5" className="animate-pulse" />
          </>
        );
      case "chest":
        return (
          <>
            {/* Wooden base */}
            <rect x="3" y="9" width="26" height="20" fill="#78350f" stroke="#451a03" strokeWidth="1" rx="2" />
            <rect x="3" y="9" width="26" height="7" fill="#b45309" stroke="#451a03" strokeWidth="0.5" /> {/* Lid */}
            {/* Metallic Gold bands */}
            <rect x="7" y="9" width="3" height="20" fill="#f59e0b" />
            <rect x="22" y="9" width="3" height="20" fill="#f59e0b" />
            <rect x="3" y="15" width="26" height="2" fill="#d97706" />
            {/* Golden Key Lock */}
            <rect x="13.5" y="14.5" width="5" height="5.5" fill="#f59e0b" stroke="#78350f" strokeWidth="0.5" />
            <circle cx="16" cy="17.2" r="1.2" fill="#000000" />
            <line x1="16" y1="18.4" x2="16" y2="19.6" stroke="#000000" strokeWidth="1" />
          </>
        );
      case "golf_ball":
        return (
          <>
            {/* Ball */}
            <circle cx="16" cy="15" r="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.5" />
            <circle cx="16" cy="15" r="7.5" fill="#f8fafc" />
            {/* 3D dimple shading */}
            <circle cx="13" cy="12" r="0.8" fill="#cbd5e1" />
            <circle cx="18" cy="13" r="0.8" fill="#cbd5e1" />
            <circle cx="14" cy="16" r="0.8" fill="#cbd5e1" />
            <circle cx="17" cy="17" r="0.8" fill="#cbd5e1" />
            <circle cx="19" cy="15" r="0.8" fill="#cbd5e1" />
            {/* Tee stand (Blue) */}
            <polygon points="14,23 18,23 16,30" fill="#38bdf8" />
            <rect x="15" y="23" width="2" height="7.5" fill="#0284c7" />
          </>
        );
      case "shoe":
        return (
          <>
            {/* Dynamic Sneaker */}
            <path d="M 3,25 L 21,11 L 29,11 L 29,27 L 3,27 Z" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
            <path d="M 8,27 L 29,27" stroke="#ef4444" strokeWidth="2.5" /> {/* Red strip */}
            <line x1="18" y1="11" x2="18" y2="19" stroke="#cbd5e1" strokeWidth="2" /> {/* Laces */}
            <line x1="22" y1="12" x2="22" y2="19" stroke="#cbd5e1" strokeWidth="2" />
            <rect x="24" y="11" width="5" height="5" fill="#e2e8f0" /> {/* Back ankle pad */}
          </>
        );
      case "lever":
        return (
          <>
            {/* Metallic Base housing */}
            <rect x="6" y="21" width="20" height="9.5" fill="#475569" stroke="#1e293b" strokeWidth="1.5" rx="1.5" />
            <rect x="11" y="23" width="10" height="3" fill="#0f172a" />
            {/* Lever stick */}
            <line x1="16" y1="21" x2="9" y2="6.5" stroke="#94a3b8" strokeWidth="4.5" />
            <line x1="15.5" y1="20" x2="10" y2="7.5" stroke="#cbd5e1" strokeWidth="1.5" />
            {/* Power dome knob */}
            <circle cx="9" cy="6.5" r="4.5" fill="#ef4444" stroke="#991b1b" strokeWidth="0.5" />
            <circle cx="7.8" cy="4.8" r="1.5" fill="#fca5a5" /> {/* Glare */}
          </>
        );
      case "rocket_button":
        return (
          <>
            {/* Tech base */}
            <rect x="4" y="17" width="24" height="13.5" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1.5" rx="3" />
            <rect x="6" y="22" width="20" height="2" fill="#1e3a8a" />
            {/* Giant red button */}
            <ellipse cx="16" cy="14" rx="8" ry="5.5" fill="#ef4444" stroke="#991b1b" strokeWidth="0.5" />
            <ellipse cx="16" cy="11.5" rx="8" ry="3" fill="#f87171" />
            <ellipse cx="14" cy="11" rx="2.5" ry="1" fill="#ffffff" /> {/* Glare */}
          </>
        );
      case "egg":
        return (
          <>
            {/* Alien Bio egg */}
            <path d="M 16,3 C 7.5,15 5.5,28 16,28 C 26.5,28 24.5,15 16,3 Z" fill="#fbcfe8" stroke="#db2777" strokeWidth="1.5" />
            {/* Bio texture veins */}
            <ellipse cx="12.5" cy="17" rx="2.5" ry="5" fill="#ec4899" opacity="0.65" />
            <ellipse cx="19.5" cy="14" rx="2" ry="4" fill="#ec4899" opacity="0.65" />
            <circle cx="16" cy="23" r="1.5" fill="#fae8ff" />
            <ellipse cx="14.5" cy="9.5" rx="1.5" ry="3.5" fill="#ffffff" /> {/* Bio highlight */}
          </>
        );

      default:
        // Default boxy character
        return (
          <>
            <rect x="5" y="3" width="22" height="26" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1.5" rx="2" />
            <rect x="9" y="8" width="4" height="4" fill="#ffffff" />
            <rect x="19" y="8" width="4" height="4" fill="#ffffff" />
            <rect x="9" y="16" width="14" height="4" fill="#ffffff" />
          </>
        );
    }
  };

  return (
    <div
      id={`sprite_${type}`}
      className={`relative inline-block ${bounceY} ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        imageRendering: "pixelated",
      }}
    >
      <svg
        viewBox="0 0 32 32"
        width="100%"
        height="100%"
        style={{
          transform: isLeft ? "scaleX(-1)" : "none",
          imageRendering: "pixelated",
        }}
      >
        {renderPixelPaths()}
      </svg>
    </div>
  );
};

