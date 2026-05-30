// /serverFallback.ts
// Worlds are loaded dynamically from the fallback-worlds/ directory.
// Each JSON file is one world. Add or remove files to add/remove worlds.

import fs from "fs";
import path from "path";

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

// ── Internal JSON shape (as stored on disk) ──────────────────────────────────

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

// ── Tile-map builder ──────────────────────────────────────────────────────────
// Translates the compact tileRules in each JSON into a full tiles[][] grid so
// the rest of the game code never needs to change.

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

function resolveTile(
  r: number,
  c: number,
  width: number,
  height: number,
  rules: Record<string, string>
): string {
  // Border → wall
  if (r === 0 || r === height - 1 || c === 0 || c === width - 1) {
    return "wall";
  }

  for (const [tileName, rule] of Object.entries(rules)) {
    if (tileName === "wall" || tileName === "default") continue;

    // Supported rule patterns:
    //   "border"              – already handled above
    //   "row3_col3to12"       – specific row and column range
    //   "row4and5"            – two specific rows
    //   "row4to8_col4to11"    – row range AND column range
    //   "row6_col2to13"       – specific row and column range
    //   "row_second_to_last"  – second-to-last row
    //   "col_mod4"            – every column where c % 4 === 0

    if (rule === "border") continue;

    if (rule === "row_second_to_last" && r === height - 2) return tileName;

    if (rule === "col_mod4" && c % 4 === 0) return tileName;

    if (rule.startsWith("row") && rule.includes("and")) {
      // e.g. "row4and5"
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

// ── World loader ──────────────────────────────────────────────────────────────

const WORLDS_DIR = path.join(__dirname, "fallback-worlds");

function loadAllWorlds(): WorldJson[] {
  if (!fs.existsSync(WORLDS_DIR)) {
    console.warn(`[Fallback] fallback-worlds/ directory not found at ${WORLDS_DIR}`);
    return [];
  }

  const files = fs.readdirSync(WORLDS_DIR).filter((f) => f.endsWith(".json"));

  const worlds: WorldJson[] = [];
  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(WORLDS_DIR, file), "utf-8");
      worlds.push(JSON.parse(raw) as WorldJson);
    } catch (err) {
      console.warn(`[Fallback] Failed to load world file "${file}":`, err);
    }
  }

  console.log(`[Fallback] Loaded ${worlds.length} world(s) from fallback-worlds/`);
  return worlds;
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
  const worlds = loadAllWorlds();

  if (worlds.length === 0) {
    throw new Error("No fallback worlds available. Please add JSON files to fallback-worlds/.");
  }

  const norm = (identity || "").toLowerCase();

  // 1. Try to match by keyword
  if (norm.length > 0) {
    const matchedWorlds = worlds.filter((world) =>
      world.matchKeywords.some((kw) => norm.includes(kw.toLowerCase()))
    );
    if (matchedWorlds.length > 0) {
      const randomIndex = Math.floor(Math.random() * matchedWorlds.length);
      return worldJsonToScenario(matchedWorlds[randomIndex]);
    }
  }

  // 2. No match → pick a random world
  const randomIndex = Math.floor(Math.random() * worlds.length);
  return worldJsonToScenario(worlds[randomIndex]);
}
