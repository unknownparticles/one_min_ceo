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

    // Check Wall collision
    const tileType = tiles[targetY][targetX];
    if (tileType === "wall") {
      audio.playSound("bump");
      return;
    }

    // Set face direction
    if (dx < 0) setDirection("left");
    if (dx > 0) setDirection("right");

    setIsMoving(true);
    setTimeout(() => setIsMoving(false), 150);

    // Audio sound
    audio.playSound("walk");

    const nextPos = { x: targetX, y: targetY };

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
        return "bg-slate-800 border-b-4 border-slate-900 text-slate-550 shadow-inner";
      case "floor":
        return "bg-zinc-100 border border-zinc-250";
      case "carpet":
        return "bg-rose-700 border border-rose-800 relative after:absolute after:inset-1 after:border-dashed after:border-rose-900 after:opacity-40";
      case "grass":
        return "bg-emerald-600 border border-emerald-750";
      case "snow":
        return "bg-amber-50 border border-stone-200";
      case "water":
        return "bg-sky-500 border border-sky-600 animate-[pulse_3s_infinite]";
      case "deck":
        return "bg-amber-800 border-r border-amber-900";
      case "road":
        return "bg-stone-500 border border-stone-600";
      case "metal_plate":
        return "bg-cyan-950 border border-cyan-900 text-cyan-400";
      default:
        return "bg-stone-200";
    }
  };

  // Render tile decorations or symbols to look hyper detailed
  const renderTileDecon = (type: string, x: number, y: number) => {
    if (type === "water") {
      return (
        <span className="absolute text-[8px] text-sky-200 opacity-60 font-mono left-1 top-1 leading-none select-none">
          ~~
        </span>
      );
    }
    if (type === "grass") {
      return (y % 2 === 0 && x % 3 === 0) ? (
        <span className="absolute w-1 h-2 bg-emerald-800 rounded-full left-2 top-2 opacity-40 select-none"></span>
      ) : null;
    }
    if (type === "snow") {
      return (y % 3 === 0 && x % 2 === 0) ? (
        <span className="absolute text-[6px] text-stone-300 left-3 top-2 select-none">*</span>
      ) : null;
    }
    if (type === "deck") {
      return <div className="absolute inset-y-0 right-0 w-[2px] bg-amber-950 opacity-10"></div>;
    }
    if (type === "metal_plate") {
      return <div className="absolute inset-2 border border-cyan-800 opacity-20"></div>;
    }
    return null;
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Instructions Overlay */}
      <div className="text-center text-xs text-slate-400 font-mono flex items-center gap-4 max-sm:hidden">
        <span>移动: <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-bold text-emerald-400 border border-slate-700">W A S D</kbd> 或 <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-bold text-emerald-400 border border-slate-700">↑ ↓ ← →</kbd></span>
        <span className="text-slate-600">|</span>
        <span>走到人物或物品上面即可触发AI随机事件 🚀</span>
      </div>

      {/* Main retro CRT screen wrapper */}
      <div className="relative p-3 bg-slate-950 rounded-2xl border-4 border-slate-850 shadow-2xl overflow-hidden w-full max-w-[680px]">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-black pointer-events-none opacity-40 z-10" />

        <div
          ref={mapRef}
          tabIndex={0}
          className="grid gap-0 select-none outline-none relative overflow-hidden"
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
                    <div className="absolute z-20 hover:scale-110 cursor-pointer animate-[wiggle_1.5s_ease-in-out_infinite]">
                      <SpriteRenderer type={cellItem.sprite} size={28} />
                      {/* Interactive prompt */}
                      <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] bg-slate-900 border border-amber-400 text-amber-300 font-bold px-1 rounded uppercase tracking-wider whitespace-nowrap opacity-90 animate-pulse">
                        调查
                      </span>
                    </div>
                  )}

                  {/* Render NPC Layer */}
                  {cellNpc && !isPlayer && (
                    <div className="absolute z-20 hover:scale-115 cursor-pointer">
                      <SpriteRenderer type={cellNpc.sprite} size={28} />
                      {/* Name badge */}
                      <span className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 text-[8px] bg-slate-900 border border-sky-400 text-sky-300 font-semibold px-0.5 rounded whitespace-nowrap opacity-95">
                        {cellNpc.name}
                      </span>
                    </div>
                  )}

                  {/* Render Player Layer */}
                  {isPlayer && (
                    <div className="absolute z-30 drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)] transition-all duration-75">
                      <SpriteRenderer
                        type={window.localStorage.getItem("currentIdentityType") || "ceo"}
                        size={30}
                        direction={direction}
                        isMoving={isMoving}
                      />
                      {/* Player crown */}
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 font-mono text-[9px] text-green-300 bg-emerald-950/90 border border-green-500/80 px-1 rounded-full whitespace-nowrap font-bold animate-bounce shadow">
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
      <div className="flex flex-col items-center gap-1 sm:hidden mt-2 p-3 bg-slate-900/60 rounded-3xl border border-slate-800">
        <button
          onClick={() => tryMove(0, -1)}
          className="w-12 h-12 flex items-center justify-center bg-slate-850 hover:bg-slate-750 text-white rounded-xl active:scale-90 border border-slate-700 font-bold cursor-pointer"
        >
          <ArrowUp size={24} />
        </button>

        <div className="flex gap-8">
          <button
            onClick={() => tryMove(-1, 0)}
            className="w-12 h-12 flex items-center justify-center bg-slate-850 hover:bg-slate-750 text-white rounded-xl active:scale-90 border border-slate-700 font-bold cursor-pointer"
          >
            <ArrowLeft size={24} />
          </button>

          <button
            onClick={() => tryMove(1, 0)}
            className="w-12 h-12 flex items-center justify-center bg-slate-850 hover:bg-slate-750 text-white rounded-xl active:scale-90 border border-slate-700 font-bold cursor-pointer"
          >
            <ArrowRight size={24} />
          </button>
        </div>

        <button
          onClick={() => tryMove(0, 1)}
          className="w-12 h-12 flex items-center justify-center bg-slate-850 hover:bg-slate-750 text-white rounded-xl active:scale-90 border border-slate-700 font-bold cursor-pointer"
        >
          <ArrowDown size={24} />
        </button>
      </div>
    </div>
  );
};
