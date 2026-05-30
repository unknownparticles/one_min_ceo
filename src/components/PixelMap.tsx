import React, { useEffect, useRef } from "react";
import { Position, NPC, Item } from "../types";
import { SpriteRenderer } from "./SpriteRenderer";
import { audio } from "../utils/audio";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";

interface PixelMapProps {
  tiles: string[][];
  playerPosition: Position;
  npcs: NPC[];
  items: Item[];
  onMove: (newPos: Position) => void;
  onInteract: (type: "NPC" | "Item", id: string, name: string) => void;
  activeInteractionId: string | null;
}

export const PixelMap: React.FC<PixelMapProps> = ({
  tiles,
  playerPosition,
  npcs,
  items,
  onMove,
  onInteract,
  activeInteractionId,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const rows = tiles.length;
  const cols = tiles[0]?.length || 0;

  // Track player direction
  const [direction, setDirection] = React.useState<"left" | "right">("right");
  const [isMoving, setIsMoving] = React.useState<boolean>(false);

  // Focus map on mount
  useEffect(() => {
    mapRef.current?.focus();
  }, []);

  // Collision and Boundary check
  const tryMove = (dx: number, dy: number) => {
    if (activeInteractionId) return; // Freeze movement during dialogue

    const targetX = playerPosition.x + dx;
    const targetY = playerPosition.y + dy;

    // Check bounds
    if (targetX < 0 || targetX >= cols || targetY < 0 || targetY >= rows) {
      audio.playSound("bump");
      return;
    }

    // Set face direction
    if (dx < 0) setDirection("left");
    if (dx > 0) setDirection("right");

    // Check direct collision with NPC
    const collidingNpc = npcs.find((n) => n.x === targetX && n.y === targetY);
    if (collidingNpc) {
      onInteract("NPC", collidingNpc.id, collidingNpc.name);
      return; // Stop on encounter
    }

    // Check direct collision with Item
    const collidingItem = items.find((it) => it.x === targetX && it.y === targetY);
    if (collidingItem) {
      onInteract("Item", collidingItem.id, collidingItem.name);
      return; // Stop on encounter
    }

    // Check Wall collision
    const tileType = tiles[targetY][targetX];
    if (tileType === "wall") {
      audio.playSound("bump");
      return;
    }

    setIsMoving(true);
    setTimeout(() => setIsMoving(false), 150);

    // Audio sound
    audio.playSound("walk");

    const nextPos = { x: targetX, y: targetY };
    onMove(nextPos);
  };

  // Keyboard handle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeInteractionId) return;

      switch (e.key.toLowerCase()) {
        case "arrowup":
        case "w":
          e.preventDefault();
          tryMove(0, -1);
          break;
        case "arrowdown":
        case "s":
          e.preventDefault();
          tryMove(0, 1);
          break;
        case "arrowleft":
        case "a":
          e.preventDefault();
          tryMove(-1, 0);
          break;
        case "arrowright":
        case "d":
          e.preventDefault();
          tryMove(1, 0);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playerPosition, tiles, npcs, items, activeInteractionId]);

  // Color mappings for tiles
  const getTileStyles = (type: string) => {
    switch (type) {
      case "wall":
        return "bg-[#C68642] border-b-4 border-[#8b5a2b] text-slate-800 shadow-inner";
      case "floor":
        return "bg-[#C68642]/80 border border-[#8b5a2b]/25 relative after:absolute after:inset-0 after:bg-[radial-gradient(#8b5a2b_1px,transparent_1px)] after:bg-[size:8px_8px] after:opacity-20";
      case "carpet":
        return "bg-[#E63946] border border-[#a5212c] relative after:absolute after:inset-1 after:border after:border-dashed after:border-[#FFD93D]/30";
      case "grass":
        return "bg-[#6BCB77] border border-[#52a35e]";
      case "snow":
        return "bg-[#FFFFFF] border border-slate-200/80 shadow-inner";
      case "water":
        return "bg-[#BDE0FE] border border-[#9cc6eb] overflow-hidden";
      case "deck":
        return "bg-[#C68642] border-r border-[#8b5a2b]/35";
      case "road":
        return "bg-[#FF6B35] border border-[#d95221]";
      case "metal_plate":
        return "bg-[#BDE0FE] border border-[#8ebbe6] text-[#4D96FF]";
      default:
        return "bg-[#FFF3BF]";
    }
  };

  // Render tile decorations or symbols to look hyper detailed
  const renderTileDecon = (type: string, x: number, y: number) => {
    switch (type) {
      case "water":
        return (
          <svg className="absolute inset-0 w-full h-full animate-water-drift pointer-events-none select-none opacity-40" viewBox="0 0 32 32">
            <path d="M 4,12 Q 8,8 12,12 T 20,12 T 28,12" fill="none" stroke="#e0f2fe" strokeWidth="1" />
            <path d="M 0,24 Q 4,20 8,24 T 16,24 T 24,24 T 32,24" fill="none" stroke="#e0f2fe" strokeWidth="1" />
          </svg>
        );
      case "grass":
        return (
          <svg className="absolute inset-0 w-full h-full pointer-events-none select-none opacity-50" viewBox="0 0 32 32">
            {((x + y) % 3 === 0) && (
              <>
                <path d="M 8,24 L 10,16 L 14,24" fill="none" stroke="#065f46" strokeWidth="1.5" />
                <path d="M 12,24 L 15,14 L 18,24" fill="none" stroke="#047857" strokeWidth="1.5" />
              </>
            )}
            {((x + y) % 3 === 1) && (
              <path d="M 18,20 L 20,12 L 23,20" fill="none" stroke="#065f46" strokeWidth="1.5" />
            )}
          </svg>
        );
      case "snow":
        return (
          <svg className="absolute inset-0 w-full h-full pointer-events-none select-none opacity-35" viewBox="0 0 32 32">
            {((x * 2 + y) % 4 === 0) && (
              <>
                <line x1="16" y1="10" x2="16" y2="22" stroke="#ffffff" strokeWidth="1" />
                <line x1="10" y1="16" x2="22" y2="16" stroke="#ffffff" strokeWidth="1" />
              </>
            )}
          </svg>
        );
      case "deck":
        return (
          <svg className="absolute inset-0 w-full h-full pointer-events-none select-none opacity-30" viewBox="0 0 32 32">
            <line x1="8" y1="0" x2="8" y2="32" stroke="#451a03" strokeWidth="1" />
            <line x1="24" y1="0" x2="24" y2="32" stroke="#451a03" strokeWidth="1" />
          </svg>
        );
      case "metal_plate":
        return (
          <svg className="absolute inset-0 w-full h-full pointer-events-none select-none opacity-40" viewBox="0 0 32 32">
            {/* Screws at corners */}
            <circle cx="4" cy="4" r="1.2" fill="#22d3ee" />
            <circle cx="28" cy="4" r="1.2" fill="#22d3ee" />
            <circle cx="4" cy="28" r="1.2" fill="#22d3ee" />
            <circle cx="28" cy="28" r="1.2" fill="#22d3ee" />
            {/* Cyber lines */}
            <path d="M 16,0 L 16,32 M 0,16 L 32,16" fill="none" stroke="#06b6d4" strokeWidth="0.8" />
          </svg>
        );
      case "wall":
        return (
          <svg className="absolute inset-0 w-full h-full pointer-events-none select-none opacity-20" viewBox="0 0 32 32">
            <line x1="0" y1="10" x2="32" y2="10" stroke="#000000" strokeWidth="1.5" />
            <line x1="0" y1="22" x2="32" y2="22" stroke="#000000" strokeWidth="1.5" />
            {(y % 2 === 0) ? (
              <>
                <line x1="16" y1="0" x2="16" y2="10" stroke="#000000" strokeWidth="1.5" />
                <line x1="8" y1="10" x2="8" y2="22" stroke="#000000" strokeWidth="1.5" />
                <line x1="24" y1="10" x2="24" y2="22" stroke="#000000" strokeWidth="1.5" />
                <line x1="16" y1="22" x2="16" y2="32" stroke="#000000" strokeWidth="1.5" />
              </>
            ) : (
              <>
                <line x1="8" y1="0" x2="8" y2="10" stroke="#000000" strokeWidth="1.5" />
                <line x1="24" y1="0" x2="24" y2="10" stroke="#000000" strokeWidth="1.5" />
                <line x1="16" y1="10" x2="16" y2="22" stroke="#000000" strokeWidth="1.5" />
                <line x1="8" y1="22" x2="8" y2="32" stroke="#000000" strokeWidth="1.5" />
                <line x1="24" y1="22" x2="24" y2="32" stroke="#000000" strokeWidth="1.5" />
              </>
            )}
          </svg>
        );
      case "road":
        return (
          <svg className="absolute inset-0 w-full h-full pointer-events-none select-none opacity-30" viewBox="0 0 32 32">
            {((x + y) % 2 === 0) && (
              <line x1="16" y1="2" x2="16" y2="14" stroke="#fbbf24" strokeWidth="2" strokeDasharray="3,3" />
            )}
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Instructions Overlay */}
      <div className="text-center text-xs text-slate-300 font-mono flex items-center gap-4 max-sm:hidden">
        <span>控制: <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-bold text-emerald-400 border border-slate-700">W A S D</kbd> 或 <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-bold text-emerald-400 border border-slate-700">↑ ↓ ← →</kbd></span>
        <span className="text-slate-600">|</span>
        <span>走到人物或物品上方触发 AI 事件 ✨</span>
      </div>

      {/* Main retro CRT screen wrapper */}
      <div id="pixel-map-container" className="relative p-4 rounded-3xl border-4 border-slate-850 shadow-2xl overflow-hidden w-full max-w-[680px] crt-container neon-glow-emerald glass-panel">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-black pointer-events-none opacity-50 z-10" />
        <div className="crt-flicker-overlay" />

        <div
          ref={mapRef}
          tabIndex={0}
          className="grid gap-0 select-none outline-none relative overflow-hidden rounded-xl border border-slate-950/45"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            aspectRatio: "16/12",
          }}
        >
          {tiles.map((rowArr, y) =>
            rowArr.map((tile, x) => {
              const isPlayer = playerPosition.x === x && playerPosition.y === y;
              const cellNpc = npcs.find((n) => n.x === x && n.y === y);
              const cellItem = items.find((it) => it.x === x && it.y === y);

              return (
                <div
                  key={`${x}-${y}`}
                  className={`aspect-square relative flex items-center justify-center transition-all duration-100 ${getTileStyles(tile)}`}
                >
                  {/* Visual Texture elements */}
                  {renderTileDecon(tile, x, y)}

                  {/* Render Item Layer */}
                  {cellItem && !isPlayer && (
                    <div className="absolute z-20 hover:scale-120 cursor-pointer animate-float">
                      <SpriteRenderer type={cellItem.sprite} size={30} />
                      {/* Interactive prompt */}
                      <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] bg-slate-950 border border-amber-400 text-amber-300 font-bold px-1.5 py-0.5 rounded shadow-lg uppercase tracking-wider whitespace-nowrap opacity-90 animate-pulse">
                        调查
                      </span>
                    </div>
                  )}

                  {/* Render NPC Layer */}
                  {cellNpc && !isPlayer && (
                    <div className="absolute z-20 hover:scale-120 cursor-pointer">
                      <SpriteRenderer type={cellNpc.sprite} size={30} />
                      {/* Name badge */}
                      <span className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 text-[8px] bg-slate-950 border border-sky-400 text-sky-300 font-bold px-1 rounded shadow-lg whitespace-nowrap opacity-95">
                        {cellNpc.name}
                      </span>
                    </div>
                  )}

                  {/* Render Player Layer */}
                  {isPlayer && (
                    <div className="absolute z-30 drop-shadow-[0_6px_8px_rgba(0,0,0,0.6)] transition-all duration-75">
                      <SpriteRenderer
                        type="ceo"
                        size={32}
                        direction={direction}
                        isMoving={isMoving}
                      />
                      {/* Player crown */}
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 font-mono text-[9px] text-green-300 bg-emerald-950 border border-green-500/80 px-1.5 rounded-full whitespace-nowrap font-bold animate-bounce shadow">
                        老板
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Tactile D-pad Control Panel for Mobile Support */}
      <div className="flex flex-col items-center gap-1 sm:hidden mt-2 p-4 rounded-3xl shadow-[4px_4px_0px_#2A2A2A] border-3 border-[#2D3436] bg-[#EAF6FF]">
        <button
          onClick={() => tryMove(0, -1)}
          className="w-14 h-14 flex items-center justify-center bg-[#FFD93D] hover:bg-[#FF9F1C] text-[#FF9F1C] rounded-full active:scale-90 border-3 border-[#2D3436] shadow-[2.5px_2.5px_0px_#2A2A2A] font-bold cursor-pointer transition"
        >
          <ArrowUp size={24} className="text-[#FF9F1C]" style={{ strokeWidth: 3 }} />
        </button>

        <div className="flex gap-10">
          <button
            onClick={() => tryMove(-1, 0)}
            className="w-14 h-14 flex items-center justify-center bg-[#FFD93D] hover:bg-[#FF9F1C] text-[#FF9F1C] rounded-full active:scale-90 border-3 border-[#2D3436] shadow-[2.5px_2.5px_0px_#2A2A2A] font-bold cursor-pointer transition"
          >
            <ArrowLeft size={24} className="text-[#FF9F1C]" style={{ strokeWidth: 3 }} />
          </button>

          <button
            onClick={() => tryMove(1, 0)}
            className="w-14 h-14 flex items-center justify-center bg-[#FFD93D] hover:bg-[#FF9F1C] text-[#FF9F1C] rounded-full active:scale-90 border-3 border-[#2D3436] shadow-[2.5px_2.5px_0px_#2A2A2A] font-bold cursor-pointer transition"
          >
            <ArrowRight size={24} className="text-[#FF9F1C]" style={{ strokeWidth: 3 }} />
          </button>
        </div>

        <button
          onClick={() => tryMove(0, 1)}
          className="w-14 h-14 flex items-center justify-center bg-[#FFD93D] hover:bg-[#FF9F1C] text-[#FF9F1C] rounded-full active:scale-90 border-3 border-[#2D3436] shadow-[2.5px_2.5px_0px_#2A2A2A] font-bold cursor-pointer transition"
        >
          <ArrowDown size={24} className="text-[#FF9F1C]" style={{ strokeWidth: 3 }} />
        </button>
      </div>
    </div>
  );
};
