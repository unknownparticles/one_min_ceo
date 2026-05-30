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
  id?: string;
  icon?: string;
  difficulty?: number;
  matchKeywords: string[];
  identity: string | { title?: string; description?: string };
  theme: string;
  mapLayout:
    | {
        width: number;
        height: number;
        tileRules: Record<string, string>;
      }
    | string[][];
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

function isWorldJson(value: unknown): value is WorldJson {
  const candidate = value as Partial<WorldJson> | null;
  const mapLayout = candidate?.mapLayout;
  const hasRuleMap = !!(
    mapLayout &&
    !Array.isArray(mapLayout) &&
    typeof mapLayout.width === "number" &&
    typeof mapLayout.height === "number" &&
    mapLayout.tileRules
  );
  const hasTileMap = Array.isArray(mapLayout) && Array.isArray(mapLayout[0]);

  return !!(
    candidate &&
    Array.isArray(candidate.matchKeywords) &&
    (typeof candidate.identity === "string" ||
      (typeof candidate.identity === "object" && typeof candidate.identity?.title === "string")) &&
    (hasRuleMap || hasTileMap) &&
    Array.isArray(candidate.npcs) &&
    Array.isArray(candidate.items)
  );
}

function loadAllWorlds(): WorldJson[] {
  const worlds: WorldJson[] = [];
  for (const filePath in worldModules) {
    try {
      const world = worldModules[filePath] as unknown;
      if (isWorldJson(world)) {
        const filename = filePath.split("/").pop() || "";
        const id = filename.replace(".json", "");
        worlds.push({
          ...world,
          id,
        });
      } else {
        console.warn(`[Fallback] Skipped non-world JSON file "${filePath}"`);
      }
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
  const identity = typeof w.identity === "string"
    ? w.identity
    : w.identity.title || "一分钟老板";
  const mapLayout = Array.isArray(w.mapLayout)
    ? {
        width: w.mapLayout[0]?.length || 0,
        height: w.mapLayout.length,
        tiles: w.mapLayout,
      }
    : {
        width: w.mapLayout.width,
        height: w.mapLayout.height,
        tiles: buildTiles(w.mapLayout.width, w.mapLayout.height, w.mapLayout.tileRules),
      };

  return {
    identity,
    theme: w.theme,
    mapLayout,
    playerPosition: w.playerPosition,
    npcs: w.npcs,
    items: w.items,
    fixedEndings: w.fixedEndings,
    introText: w.introText,
    ambientMusic: w.ambientMusic,
  };
}

// Helper to resolve Icons based on keywords
function getIconByIdentity(identity: string): string {
  const norm = identity.toLowerCase();
  if (norm.includes("ceo") || norm.includes("首席") || norm.includes("公司") || norm.includes("创始人")) return "💎";
  if (norm.includes("滑雪") || norm.includes("雪")) return "🏂";
  if (norm.includes("潜水") || norm.includes("深海") || norm.includes("海底") || norm.includes("潜航")) return "🐙";
  if (norm.includes("飞机") || norm.includes("航天") || norm.includes("机长") || norm.includes("机舱")) return "✈️";
  if (norm.includes("厨师") || norm.includes("名厨") || norm.includes("美食") || norm.includes("餐")) return "👨‍🍳";
  if (norm.includes("太空") || norm.includes("宇宙") || norm.includes("星系") || norm.includes("火星") || norm.includes("月球")) return "🚀";
  if (norm.includes("首富") || norm.includes("富豪") || norm.includes("大班") || norm.includes("财阀") || norm.includes("大亨")) return "👑";
  if (norm.includes("裁员") || norm.includes("layoff")) return "📄";
  if (norm.includes("开会") || norm.includes("会议") || norm.includes("董事")) return "💼";
  if (norm.includes("厕所") || norm.includes("马桶") || norm.includes("停水")) return "🧻";
  if (norm.includes("银行")) return "🏦";
  if (norm.includes("证券") || norm.includes("股票") || norm.includes("交易所") || norm.includes("ipo")) return "📈";
  if (norm.includes("赌场") || norm.includes("博彩")) return "🎰";
  if (norm.includes("帝国") || norm.includes("皇帝") || norm.includes("政变") || norm.includes("王室")) return "👑";
  if (norm.includes("机器人") || norm.includes("ai") || norm.includes("智脑") || norm.includes("神谕")) return "🤖";
  if (norm.includes("外星") || norm.includes("异形") || norm.includes("星际")) return "👽";
  if (norm.includes("能源") || norm.includes("反物质") || norm.includes("太阳") || norm.includes("电力")) return "⚡";
  if (norm.includes("婚礼")) return "💒";
  if (norm.includes("监狱")) return "⛓️";
  if (norm.includes("量子")) return "⚛️";
  return "🗺️";
}

// Deterministic difficulty rating (2 to 5)
function getDifficultyByIdentity(identity: string): number {
  let sum = 0;
  for (let i = 0; i < identity.length; i++) {
    sum += identity.charCodeAt(i);
  }
  return (sum % 4) + 2;
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
    const matchedWorlds = worlds.filter((world) =>
      world.matchKeywords.some((kw) => norm.includes(String(kw).toLowerCase()))
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

export interface PlayableMapScenario {
  id: string;
  identity: string;
  theme: string;
  icon: string;
  difficulty: number;
  description: string;
  isFeatured: boolean;
  scenario: FallbackScenario;
}

export function getAllAvailableScenarios(): PlayableMapScenario[] {
  const worlds = getWorlds();
  const featuredIds = ["ceo", "diver", "layoff", "meeting", "skiing", "space", "toilet", "wangduoyu", "pilot", "chef", "tycoon"];

  return worlds.map((w) => {
    const scenario = worldJsonToScenario(w);
    const id = w.id || scenario.identity;
    const isFeatured = featuredIds.includes(id.toLowerCase());

    const icon = w.icon || getIconByIdentity(scenario.identity);
    const difficulty = w.difficulty || getDifficultyByIdentity(scenario.identity);

    return {
      id,
      identity: scenario.identity,
      theme: scenario.theme,
      icon,
      difficulty,
      description: scenario.introText,
      isFeatured,
      scenario,
    };
  });
}
