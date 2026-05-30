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
            {/* Suit & Hair */}
            <rect x="6" y="2" width="20" height="6" fill="#1e1e2d" /> {/* Slick Hair */}
            <rect x="8" y="8" width="16" height="8" fill="#fddcb4" /> {/* Face */}
            <rect x="6" y="10" width="20" height="4" fill="#000000" /> {/* Sunglasses */}
            <rect x="6" y="16" width="20" height="12" fill="#111827" /> {/* Tuxedo */}
            <rect x="12" y="16" width="8" height="6" fill="#ffffff" /> {/* White Shirt */}
            <rect x="14" y="17" width="4" height="4" fill="#bfdbfe" /> {/* Blue Tie */}
            <rect x="8" y="28" width="6" height="4" fill="#000000" /> {/* Shoes Left */}
            <rect x="18" y="28" width="6" height="4" fill="#000000" /> {/* Shoes Right */}
          </>
        );
      case "ski":
        return (
          <>
            <rect x="6" y="2" width="20" height="10" fill="#3b82f6" /> {/* Blue Helmet */}
            <rect x="8" y="6" width="16" height="4" fill="#f43f5e" /> {/* Pink Goggles */}
            <rect x="8" y="12" width="16" height="6" fill="#f3f4f6" /> {/* Face protector */}
            <rect x="4" y="18" width="24" height="10" fill="#1d4ed8" /> {/* High-tech ski jacket */}
            <rect x="2" y="20" width="2" height="12" fill="#eab308" /> {/* Ski Poles */}
            <rect x="28" y="20" width="2" height="12" fill="#eab308" />
            <rect x="6" y="28" width="20" height="4" fill="#f43f5e" /> {/* Hot skis */}
          </>
        );
      case "diver":
        return (
          <>
            <rect x="6" y="2" width="20" height="20" fill="#b45309" /> {/* Antique copper helmet */}
            <rect x="10" y="6" width="12" height="10" fill="#38bdf8" /> {/* Glass viewport */}
            <rect x="12" y="8" width="8" height="4" fill="#e0f2fe" /> {/* Viewport reflection */}
            <rect x="4" y="22" width="24" height="8" fill="#78350f" /> {/* Heavy diver suit */}
            <circle cx="16" cy="18" r="1.5" fill="#eab308" /> {/* Valve node */}
            <rect x="8" y="30" width="16" height="2" fill="#000000" /> {/* Weighted lead boots */}
          </>
        );
      case "pilot":
        return (
          <>
            <rect x="6" y="2" width="20" height="8" fill="#78350f" /> {/* Aviator Cap */}
            <rect x="4" y="6" width="4" height="4" fill="#475569" /> {/* Leather ear flap */}
            <rect x="24" y="6" width="4" height="4" fill="#475569" />
            <rect x="8" y="10" width="16" height="6" fill="#fddcb4" /> {/* Face */}
            <rect x="8" y="12" width="16" height="3" fill="#020617" /> {/* Dark shades */}
            <rect x="4" y="16" width="24" height="12" fill="#451a03" /> {/* Bomber jacket */}
            <rect x="14" y="16" width="4" height="12" fill="#ffffff" /> {/* Pilot scarf */}
            <rect x="8" y="28" width="16" height="4" fill="#1e293b" /> {/* Pants */}
          </>
        );
      case "chef":
        return (
          <>
            <path d="M 10,2 Q 16,0 22,2 T 26,8 L 6,8 Z" fill="#ffffff" /> {/* Tall Chef Hat */}
            <rect x="8" y="8" width="16" height="8" fill="#ffedd5" /> {/* Face */}
            <rect x="10" y="11" width="4" height="2" fill="#451a03" /> {/* Mustache */}
            <rect x="18" y="11" width="4" height="2" fill="#451a03" />
            <rect x="12" y="13" width="8" height="2" fill="#dc2626" />
            <rect x="6" y="16" width="20" height="12" fill="#ffffff" /> {/* White Apron */}
            <rect x="10" y="18" width="12" height="10" fill="#dc2626" /> {/* Red tie */}
            <rect x="2" y="18" width="4" height="10" fill="#94a3b8" /> {/* Chef's knife */}
          </>
        );
      case "explorer":
        return (
          <>
            <rect x="4" y="4" width="24" height="4" fill="#b45309" /> {/* Fedora Hat Rim */}
            <rect x="8" y="2" width="16" height="4" fill="#78350f" /> {/* Fedora Crown */}
            <rect x="8" y="8" width="16" height="8" fill="#fddcb4" /> {/* Face */}
            <rect x="6" y="16" width="20" height="12" fill="#ca8a04" /> {/* Explorer khakis */}
            <rect x="4" y="18" width="4" height="8" fill="#78350f" /> {/* Backpack */}
            <rect x="12" y="16" width="8" height="12" fill="#451a03" /> {/* Utility suspenders */}
          </>
        );
      case "space":
        return (
          <>
            <circle cx="16" cy="12" r="10" fill="#cccccc" /> {/* Visor frame */}
            <circle cx="16" cy="12" r="8" fill="#1e1b4b" /> {/* Galaxy reflective helmet */}
            <circle cx="12" cy="9" r="2" fill="#6366f1" /> {/* Stardust dots */}
            <circle cx="20" cy="14" r="1.5" fill="#a5f3fc" />
            <rect x="6" y="22" width="20" height="10" fill="#e2e8f0" /> {/* Astronaut space suit */}
            <rect x="12" y="24" width="8" height="4" fill="#10b981" /> {/* Cyan interface module */}
          </>
        );
      case "tycoon":
        return (
          <>
            <rect x="8" y="0" width="16" height="10" fill="#111827" /> {/* Black Top Hat */}
            <rect x="4" y="8" width="24" height="2" fill="#dc2626" /> {/* Red satin ribbon */}
            <rect x="2" y="10" width="28" height="2" fill="#111827" /> {/* Rim */}
            <rect x="8" y="12" width="16" height="6" fill="#fddcb4" /> {/* Face */}
            <circle cx="12" cy="14" r="2.5" fill="#eab308" /> {/* Gold Monocle */}
            <path d="M 20,16 L 24,16" stroke="#451a03" strokeWidth="2" /> {/* Cigar */}
            <circle cx="25" cy="16" r="1" fill="#f43f5e" /> {/* Burning tip */}
            <rect x="4" y="18" width="24" height="14" fill="#111827" /> {/* Pinstripe jacket */}
            <rect x="15" y="18" width="2" height="14" fill="#e2e8f0" /> {/* Pinstripe gold chain */}
          </>
        );

      // NPCS
      case "secretary":
        return (
          <>
            <rect x="10" y="2" width="12" height="8" fill="#7c2d12" /> {/* Hair Bun */}
            <rect x="8" y="10" width="16" height="8" fill="#fbcfe8" /> {/* Hair & Face */}
            <rect x="10" y="13" width="4" height="2" stroke="#ec4899" fill="none" /> {/* Glasses */}
            <rect x="18" y="13" width="4" height="2" stroke="#ec4899" fill="none" />
            <rect x="6" y="18" width="20" height="10" fill="#4c1d95" /> {/* Purple Skirt Suit */}
            <rect x="20" y="18" width="6" height="10" fill="#e2e8f0" /> {/* Clipboard */}
          </>
        );
      case "dog":
        return (
          <>
            <rect x="12" y="10" width="12" height="8" fill="#d97706" /> {/* Dog Head */}
            <rect x="22" y="8" width="4" height="6" fill="#92400e" /> {/* Ear */}
            <rect x="10" y="18" width="16" height="10" fill="#f59e0b" /> {/* Torso */}
            <rect x="10" y="18" width="16" height="2" fill="#06b6d4" /> {/* SCI-FI collar glowing */}
            <rect x="8" y="24" width="4" height="6" fill="#d97706" /> {/* Left foot */}
            <rect x="20" y="24" width="4" height="6" fill="#d97706" /> {/* Right foot */}
            <circle cx="25" cy="19" r="1.5" fill="#06b6d4" /> {/* Cyber module collar bubble */}
          </>
        );
      case "butler":
        return (
          <>
            <rect x="8" y="2" width="16" height="8" fill="#475569" /> {/* Gray hair */}
            <rect x="10" y="10" width="12" height="6" fill="#ffedd5" /> {/* Face */}
            <rect x="6" y="16" width="20" height="14" fill="#0f172a" /> {/* Black tailcoat */}
            <rect x="14" y="16" width="4" height="6" fill="#ffffff" /> {/* White tux front */}
            <rect x="15" y="18" width="2" height="2" fill="#dc2626" /> {/* Bow tie */}
            <rect x="22" y="18" width="8" height="2" fill="#cbd5e1" /> {/* Silver tray */}
            <rect x="26" y="14" width="2" height="4" fill="#dc2626" /> {/* Wine glass on tray */}
          </>
        );
      case "investor":
        return (
          <>
            <rect x="6" y="2" width="20" height="8" fill="#eab308" /> {/* Wild blonde hair */}
            <rect x="8" y="10" width="16" height="6" fill="#ffedd5" /> {/* Face */}
            <rect x="4" y="16" width="24" height="12" fill="#dc2626" /> {/* Red panic blazer */}
            <rect x="8" y="22" width="16" height="6" fill="#22c55e" /> {/* Holds green stacks of cash */}
          </>
        );
      case "robot":
        return (
          <>
            <rect x="8" y="4" width="16" height="10" fill="#94a3b8" /> {/* Metallic head */}
            <rect x="11" y="7" width="2" height="2" fill="#06b6d4" /> {/* Laser eyes */}
            <rect x="19" y="7" width="2" height="2" fill="#06b6d4" />
            <rect x="15" y="2" width="2" height="3" fill="#ef4444" /> {/* Antenna */}
            <rect x="6" y="14" width="20" height="14" fill="#475569" />{/* Steel body */}
            <rect x="10" y="17" width="12" height="6" fill="#f8fafc" /> {/* Core power grid */}
          </>
        );
      case "alien":
        return (
          <>
            <rect x="8" y="4" width="16" height="12" fill="#22c55e" /> {/* Cyber green gelatinous head */}
            <circle cx="11" cy="9" r="1.5" fill="#f43f5e" /> {/* Three eyes */}
            <circle cx="16" cy="7" r="1.5" fill="#f43f5e" />
            <circle cx="21" cy="9" r="1.5" fill="#f43f5e" />
            <rect x="8" y="16" width="16" height="12" fill="#15803d" /> {/* Tentacle uniform */}
            <rect x="4" y="2" width="2" height="6" fill="#eab308" /> {/* Antennas */}
            <rect x="26" y="2" width="2" height="6" fill="#eab308" />
          </>
        );
      case "guard":
        return (
          <>
            <rect x="6" y="4" width="20" height="6" fill="#020617" /> {/* Crew cut jet black */}
            <rect x="8" y="10" width="16" height="6" fill="#fbcfe8" /> {/* Face */}
            <rect x="6" y="11" width="20" height="3" fill="#000000" /> {/* Heavy shades */}
            <rect x="4" y="16" width="24" height="14" fill="#0f172a" /> {/* Black security tactical vest */}
            <rect x="22" y="18" width="3" height="10" fill="#334155" /> {/* Baton/flashlight */}
          </>
        );

      // ITEMS & FURNITURE
      case "desk":
        return (
          <>
            <rect x="2" y="8" width="28" height="10" fill="#78350f" /> {/* Desk top */}
            <rect x="4" y="18" width="4" height="12" fill="#451a03" /> {/* Legs */}
            <rect x="24" y="18" width="4" height="12" fill="#451a03" />
            <rect x="10" y="2" width="12" height="6" fill="#e2e8f0" /> {/* High tech monitor */}
            <rect x="11" y="3" width="10" height="4" fill="#090d16" />
            <circle cx="16" cy="5" r="1" fill="#10b981" /> {/* Graph glint */}
          </>
        );
      case "pen":
        return (
          <>
            <line x1="28" y1="4" x2="4" y2="28" stroke="#eab308" strokeWidth="4" /> {/* Gold Pen Body */}
            <polygon points="4,28 8,24 4,24" fill="#f3f4f6" /> {/* Silver pen nib */}
            {/* Sparkles */}
            <circle cx="10" cy="8" r="1.5" fill="#ffffff" />
            <circle cx="22" cy="22" r="1.5" fill="#38bdf8" />
          </>
        );
      case "coffee":
        return (
          <>
            <rect x="6" y="6" width="20" height="22" fill="#334155" /> {/* Machine Main */}
            <rect x="10" y="10" width="12" height="6" fill="#020617" /> {/* LED Display */}
            <rect x="12" y="12" width="8" height="2" fill="#06b6d4" /> {/* Cyan level meter */}
            <rect x="14" y="20" width="4" height="5" fill="#fcd34d" /> {/* Golden coffee mug */}
            <rect x="15" y="17" width="2" height="3" fill="#06b6d4" /> {/* Pouring bluish plasma */}
          </>
        );
      case "chest":
        return (
          <>
            <rect x="4" y="8" width="24" height="20" fill="#78350f" stroke="#eab308" strokeWidth="2" /> {/* Chest body */}
            <rect x="4" y="8" width="24" height="6" fill="#b45309" /> {/* LID */}
            <rect x="14" y="14" width="4" height="4" fill="#eab308" /> {/* Gold Lock plate */}
            <circle cx="16" cy="16" r="1" fill="#000000" /> {/* Keyhole */}
          </>
        );
      case "golf_ball":
        return (
          <>
            <circle cx="16" cy="18" r="7" fill="#ffffff" /> {/* Golf Ball */}
            <circle cx="14" cy="15" r="1" fill="#cbd5e1" /> {/* Dimples */}
            <circle cx="18" cy="16" r="1" fill="#cbd5e1" />
            <circle cx="15" cy="20" r="1" fill="#cbd5e1" />
            <rect x="15" y="25" width="2" height="5" fill="#38bdf8" /> {/* Tee stand */}
          </>
        );
      case "shoe":
        return (
          <>
            <path d="M 4,24 L 20,12 L 28,12 L 28,26 L 4,26 Z" fill="#ffffff" /> {/* Leather Sneaker */}
            <path d="M 12,26 L 28,26" stroke="#ef4444" strokeWidth="2" /> {/* Red strip */}
            <line x1="16" y1="12" x2="16" y2="20" stroke="#cbd5e1" strokeWidth="2" /> {/* Laces */}
            <line x1="20" y1="14" x2="20" y2="20" stroke="#cbd5e1" strokeWidth="2" />
          </>
        );
      case "lever":
        return (
          <>
            <rect x="8" y="22" width="16" height="8" fill="#475569" /> {/* Base housing */}
            <line x1="16" y1="22" x2="8" y2="6" stroke="#94a3b8" strokeWidth="4" /> {/* Metallic stick */}
            <circle cx="8" cy="6" r="4.5" fill="#ef4444" /> {/* Red power grip dome */}
          </>
        );
      case "rocket_button":
        return (
          <>
            <rect x="6" y="18" width="20" height="12" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" /> {/* High tech base */}
            <circle cx="16" cy="14" r="6" fill="#ef4444" /> {/* Giant Red Button */}
            <circle cx="14" cy="12" r="2.5" fill="#fca5a5" /> {/* Glare */}
          </>
        );
      case "egg":
        return (
          <>
            <path d="M 16,4 C 8,16 6,28 16,28 C 26,28 24,16 16,4 Z" fill="#fbcfe8" /> {/* Alien glowing egg */}
            <ellipse cx="14" cy="18" rx="2" ry="4" fill="#ec4899" /> {/* Bio textures */}
            <ellipse cx="18" cy="15" rx="1.5" ry="3" fill="#fae8ff" />
          </>
        );

      default:
        // Default boxy character
        return (
          <>
            <rect x="6" y="4" width="20" height="24" fill="#3b82f6" />
            <rect x="10" y="8" width="4" height="4" fill="#ffffff" />
            <rect x="18" y="8" width="4" height="4" fill="#ffffff" />
            <rect x="10" y="16" width="12" height="4" fill="#ffffff" />
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
