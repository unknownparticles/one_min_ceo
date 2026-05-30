/**
 * Browser-compatible fallback scenario loader.
 * Uses Vite's import.meta.glob to statically bundle the JSON files at build
 * time, replacing the server-side fs/path implementation in serverFallback.ts.
 *
 * All type definitions are duplicated here so this module has zero imports from
 * the server-only serverFallback.ts, preventing Vite from pulling in Node.js
 * built-ins (path, fs) into the client bundle.
 */

// ── Shared type definitions (kept in sync with serverFallback.ts) ─────────────

export interface FallbackOption {
  label: string;
  outcomeText: string;
  timeDelta: number;
  actionId: string;
  isEarlyEnd?: boolean;
  soundHint?: string;
}

export interface FallbackStep {
  id: string;
  text: string;
  allowsFreeInput?: boolean;
  options: FallbackOption[];
}

export interface FallbackNPC {
  id: string;
  name: string;
  sprite: string;
  x: number;
  y: number;
  dialogue: string;
  storyline: FallbackStep[];
}

export interface FallbackItem {
  id: string;
  name: string;
  sprite: string;
  x: number;
  y: number;
  description: string;
  storyline: FallbackStep[];
}

export interface TriggerRules {
  mustInclude: string[];
  forbidInclude?: string[];
  requiredSequence?: string[];
}

export interface FixedEnding {
  endingId: string;
  title: string;
  description: string;
  priority: number;
  triggerRules: TriggerRules;
}

export interface FallbackScenario {
  identity: string;
  theme: string;
  mapLayout: {
    width: number;
    height: number;
    tiles: string[][];
  };
  playerPosition: { x: number; y: number };
  npcs: FallbackNPC[];
  items: FallbackItem[];
  fixedEndings: FixedEnding[];
  introText: string;
  ambientMusic: string;
}

// ── Internal JSON shape (as stored on disk) ───────────────────────────────────

interface WorldJson {
  matchKeywords: string[];
  identity: string;
  theme: string;
  mapLayout: {
    width: number;
    height: number;
    tileRules: Record<string, string>;
  };
  playerPosition: { x: number; y: number };
  npcs: FallbackNPC[];
  items: FallbackItem[];
  fixedEndings: FixedEnding[];
  introText: string;
  ambientMusic: string;
}

// ── Tile-map builder (mirrors the logic in serverFallback.ts) ─────────────────

function resolveTile(
  r: number,
  c: number,
  width: number,
  height: number,
  rules: Record<string, string>
): string {
  if (r === 0 || r === height - 1 || c === 0 || c === width - 1) {
    return "wall";
  }

  for (const [tileName, rule] of Object.entries(rules)) {
    if (tileName === "wall" || tileName === "default") continue;
    if (rule === "border") continue;
    if (rule === "row_second_to_last" && r === height - 2) return tileName;
    if (rule === "col_mod4" && c % 4 === 0) return tileName;

    if (rule.startsWith("row") && rule.includes("and")) {
      const nums = rule.replace("row", "").split("and").map(Number);
      if (nums.includes(r)) return tileName;
    }

    const rowRangeMatch = rule.match(/^row(\d+)to(\d+)_col(\d+)to(\d+)$/);
    if (rowRangeMatch) {
      const [, r1, r2, c1, c2] = rowRangeMatch.map(Number);
      if (r > r1 && r < r2 && c > c1 && c < c2) return tileName;
    }

    const rowColMatch = rule.match(/^row(\d+)_col(\d+)to(\d+)$/);
    if (rowColMatch) {
      const [, row, cStart, cEnd] = rowColMatch.map(Number);
      if (r === row && c > cStart && c < cEnd) return tileName;
    }
  }

  return rules["default"] ?? "floor";
}

function buildTiles(
  width: number,
  height: number,
  tileRules: Record<string, string>
): string[][] {
  const tiles: string[][] = [];
  for (let r = 0; r < height; r++) {
    const row: string[] = [];
    for (let c = 0; c < width; c++) {
      row.push(resolveTile(r, c, width, height, tileRules));
    }
    tiles.push(row);
  }
  return tiles;
}

// ── Static world loader via Vite glob import ──────────────────────────────────
// All JSON files under fallback-worlds/ are bundled at build time.
// The `eager: true` flag means they are loaded synchronously with no fs/path.

const worldModules = import.meta.glob<WorldJson>(
  "/fallback-worlds/*.json",
  { eager: true }
);

function loadAllWorlds(): WorldJson[] {
  const worlds: WorldJson[] = [];
  for (const filePath in worldModules) {
    try {
      worlds.push(worldModules[filePath] as WorldJson);
    } catch (err) {
      console.warn(`[Fallback] Failed to load world file "${filePath}":`, err);
    }
  }
  console.log(`[Fallback] Loaded ${worlds.length} world(s) from fallback-worlds/`);
  return worlds;
}

// Cache so we only process once per page load.
let _cachedWorlds: WorldJson[] | null = null;

function getWorlds(): WorldJson[] {
  if (!_cachedWorlds) {
    _cachedWorlds = loadAllWorlds();
  }
  return _cachedWorlds;
}

function worldJsonToScenario(w: WorldJson): FallbackScenario {
  return {
    identity: w.identity,
    theme: w.theme,
    mapLayout: {
      width: w.mapLayout.width,
      height: w.mapLayout.height,
      tiles: buildTiles(w.mapLayout.width, w.mapLayout.height, w.mapLayout.tileRules),
    },
    playerPosition: w.playerPosition,
    npcs: w.npcs,
    items: w.items,
    fixedEndings: w.fixedEndings,
    introText: w.introText,
    ambientMusic: w.ambientMusic,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export function getFallbackScenario(identity: string): FallbackScenario {
  const worlds = getWorlds();

  if (worlds.length === 0) {
    throw new Error(
      "No fallback worlds available. Please add JSON files to fallback-worlds/."
    );
  }

  const norm = (identity || "").toLowerCase();

  // 1. Try to match by keyword
  if (norm.length > 0) {
    for (const world of worlds) {
      if (world.matchKeywords.some((kw) => norm.includes(kw.toLowerCase()))) {
        return worldJsonToScenario(world);
      }
    }
  }

  // 2. No match → pick a random world
  const randomIndex = Math.floor(Math.random() * worlds.length);
  return worldJsonToScenario(worlds[randomIndex]);
}
