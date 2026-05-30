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
  nextStage?: number | string;
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

function detectCoordOrder(w: any, width: number, height: number): "xy" | "yx" {
  const positions: number[][] = [];
  const getArrayPos = (val: any) => {
    if (Array.isArray(val) && val.length === 2) return val;
    if (val && typeof val === "object" && Array.isArray(val.position) && val.position.length === 2) return val.position;
    return null;
  };

  const pVal = getArrayPos(w.playerPosition);
  if (pVal) positions.push(pVal);

  if (Array.isArray(w.npcs)) {
    w.npcs.forEach((n: any) => {
      const p = getArrayPos(n.position) || getArrayPos(n);
      if (p) positions.push(p);
    });
  }
  if (Array.isArray(w.items)) {
    w.items.forEach((it: any) => {
      const p = getArrayPos(it.position) || getArrayPos(it);
      if (p) positions.push(p);
    });
  }

  let yxImpossible = false;
  let xyImpossible = false;

  for (const pos of positions) {
    const [first, second] = pos;
    if (first >= height || second >= width) {
      yxImpossible = true;
    }
    if (first >= width || second >= height) {
      xyImpossible = true;
    }
  }

  if (yxImpossible && !xyImpossible) return "xy";
  if (xyImpossible && !yxImpossible) return "yx";

  // Wall collisions check to disambiguate
  let yxWalls = 0;
  let xyWalls = 0;

  const tiles = Array.isArray(w.mapLayout)
    ? w.mapLayout
    : (w.mapLayout && w.mapLayout.tileRules
        ? buildTiles(w.mapLayout.width, w.mapLayout.height, w.mapLayout.tileRules)
        : []);

  if (tiles.length > 0) {
    for (const pos of positions) {
      const [first, second] = pos;
      if (first < height && second < width) {
        if (tiles[first][second] === "wall") yxWalls++;
      }
      if (second < height && first < width) {
        if (tiles[second][first] === "wall") xyWalls++;
      }
    }
    if (yxWalls > 0 && xyWalls === 0) return "xy";
    if (xyWalls > 0 && yxWalls === 0) return "yx";
  }

  return "yx";
}

function parsePosition(posVal: any, width: number, height: number, order: "xy" | "yx"): { x: number; y: number } {
  if (!posVal) return { x: 0, y: 0 };

  if (typeof posVal === "object" && !Array.isArray(posVal)) {
    if (posVal.x !== undefined || posVal.y !== undefined) {
      return {
        x: posVal.x !== undefined ? Number(posVal.x) : 0,
        y: posVal.y !== undefined ? Number(posVal.y) : 0
      };
    }
    if (posVal.row !== undefined || posVal.col !== undefined) {
      return {
        x: posVal.col !== undefined ? Number(posVal.col) : 0,
        y: posVal.row !== undefined ? Number(posVal.row) : 0
      };
    }
  }

  if (Array.isArray(posVal) && posVal.length === 2) {
    const [first, second] = posVal;
    if (order === "xy") {
      return { x: Number(first), y: Number(second) };
    } else {
      return { x: Number(second), y: Number(first) };
    }
  }

  return { x: 0, y: 0 };
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

  const order = detectCoordOrder(w, mapLayout.width, mapLayout.height);

  // Parse player position
  const rawPlayerPos = parsePosition(w.playerPosition, mapLayout.width, mapLayout.height, order);

  // Gather all valid walkable floor tiles first (for player positioning fallback)
  const walkableTiles: { x: number; y: number }[] = [];
  for (let r = 0; r < mapLayout.height; r++) {
    for (let c = 0; c < mapLayout.width; c++) {
      if (mapLayout.tiles[r] && mapLayout.tiles[r][c] !== "wall") {
        walkableTiles.push({ x: c, y: r });
      }
    }
  }

  // Validate and relocate player position if on wall or out of bounds
  let playerPosition = rawPlayerPos;
  if (
    playerPosition.x <= 0 || playerPosition.x >= mapLayout.width - 1 ||
    playerPosition.y <= 0 || playerPosition.y >= mapLayout.height - 1 ||
    (mapLayout.tiles[playerPosition.y] && mapLayout.tiles[playerPosition.y][playerPosition.x] === "wall")
  ) {
    if (walkableTiles.length > 0) {
      playerPosition = walkableTiles[0];
    }
  }

  // Find all reachable tiles from playerPosition using Breadth-First Search (BFS)
  const reachableTiles: { x: number; y: number }[] = [];
  const visited = new Set<string>();
  const queue: { x: number; y: number }[] = [];

  if (
    playerPosition.x >= 0 && playerPosition.x < mapLayout.width &&
    playerPosition.y >= 0 && playerPosition.y < mapLayout.height &&
    mapLayout.tiles[playerPosition.y] && mapLayout.tiles[playerPosition.y][playerPosition.x] !== "wall"
  ) {
    queue.push(playerPosition);
    visited.add(`${playerPosition.x},${playerPosition.y}`);
  }

  let head = 0;
  while (head < queue.length) {
    const curr = queue[head++];
    reachableTiles.push(curr);

    const neighbors = [
      { x: curr.x + 1, y: curr.y },
      { x: curr.x - 1, y: curr.y },
      { x: curr.x, y: curr.y + 1 },
      { x: curr.x, y: curr.y - 1 }
    ];

    for (const nb of neighbors) {
      if (
        nb.x >= 0 && nb.x < mapLayout.width &&
        nb.y >= 0 && nb.y < mapLayout.height &&
        mapLayout.tiles[nb.y] && mapLayout.tiles[nb.y][nb.x] !== "wall"
      ) {
        const key = `${nb.x},${nb.y}`;
        if (!visited.has(key)) {
          visited.add(key);
          queue.push(nb);
        }
      }
    }
  }

  // Shuffle reachableTiles to distribute relocated entities randomly across the reachable area
  const shuffledReachable = [...reachableTiles];
  for (let i = shuffledReachable.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffledReachable[i];
    shuffledReachable[i] = shuffledReachable[j];
    shuffledReachable[j] = temp;
  }

  const occupied = new Set<string>();
  occupied.add(`${playerPosition.x},${playerPosition.y}`);

  // Coordinate placement coordinator with collision evasion (only placing entities on reachable tiles)
  const getFreeWalkable = (suggested: { x: number; y: number }): { x: number; y: number } => {
    const suggestedKey = `${suggested.x},${suggested.y}`;
    if (
      suggested.x > 0 && suggested.x < mapLayout.width - 1 &&
      suggested.y > 0 && suggested.y < mapLayout.height - 1 &&
      mapLayout.tiles[suggested.y] && mapLayout.tiles[suggested.y][suggested.x] !== "wall" &&
      visited.has(suggestedKey) &&
      !occupied.has(suggestedKey)
    ) {
      occupied.add(suggestedKey);
      return suggested;
    }

    for (const tile of shuffledReachable) {
      const key = `${tile.x},${tile.y}`;
      if (!occupied.has(key)) {
        occupied.add(key);
        return tile;
      }
    }
    return playerPosition;
  };

  // Harmonize npcs to newer standard schema (x, y at root, linear steps, label/outcomeText options)
  const npcs: FallbackNPC[] = (w.npcs || []).map((n: any, npcIdx: number) => {
    const pos = n.position !== undefined ? n.position : (n.x !== undefined || n.y !== undefined ? { x: n.x, y: n.y } : null);
    const rawPos = parsePosition(pos, mapLayout.width, mapLayout.height, order);
    const finalPos = getFreeWalkable(rawPos);
    
    let dialogue = "";
    if (typeof n.dialogue === "string") {
      dialogue = n.dialogue;
    } else if (n.dialogue && typeof n.dialogue === "object") {
      dialogue = n.dialogue.greeting || n.dialogue.text || n.dialogueTitle || "";
    } else {
      dialogue = n.dialogueTitle || n.dialog || "";
    }
    
    const rootOptions = n.options || [];
    const rawStoryline = (n.dialogue && typeof n.dialogue === "object" && Array.isArray(n.dialogue.stages) && n.dialogue.stages.length > 0)
      ? n.dialogue.stages
      : (n.storyline || []);

    const storyline: FallbackStep[] = rawStoryline.map((step: any, stepIdx: number) => {
      const stepId = step.id || `step_${step.stage !== undefined ? step.stage : stepIdx + 1}`;
      let text = step.text || step.scene || step.content || step.dialogue || step.dialog || step.description || step.question || step.narrator || "";
      if (!text) {
        text = dialogue;
      }
      const allowsFreeInput = !!step.allowsFreeInput;
      
      const stepRawOptions = (step.options && step.options.length > 0) ? step.options : rootOptions;
      
      const options: FallbackOption[] = (stepRawOptions || []).map((opt: any, optIdx: number) => {
        const label = opt.label || opt.text || "选择";
        const nextStage = opt.nextStage !== undefined ? opt.nextStage 
          : (opt.target_stage !== undefined ? opt.target_stage 
          : (opt.targetStage !== undefined ? opt.targetStage 
          : (opt.next !== undefined ? opt.next : opt.redirect)));
        const actionId = opt.actionId || opt.toEnd || (typeof nextStage === 'string' ? nextStage : `option_${nextStage || optIdx + 1}`);
        const outcomeText = opt.outcomeText || `【选择后果】：你选择了『${label}』，导致后续时空因果产生了微妙波折。`;
        const timeDelta = opt.timeDelta !== undefined ? opt.timeDelta : 0;
        const isEarlyEnd = opt.isEarlyEnd !== undefined
          ? opt.isEarlyEnd
          : (!!opt.toEnd || (typeof nextStage === 'string' && (nextStage.startsWith('ending') || nextStage.startsWith('end'))));
        const soundHint = opt.soundHint || "";
        
        return {
          label,
          outcomeText,
          timeDelta,
          actionId,
          isEarlyEnd,
          soundHint,
          nextStage
        };
      });
      
      return {
        id: stepId,
        text,
        allowsFreeInput,
        options
      };
    });

    return {
      id: n.id || `npc_${npcIdx}`,
      name: n.name || "NPC",
      sprite: n.sprite || "secretary",
      x: finalPos.x,
      y: finalPos.y,
      dialogue,
      storyline
    };
  });

  // Harmonize items to newer standard schema
  const items: FallbackItem[] = (w.items || []).map((it: any, itemIdx: number) => {
    const pos = it.position !== undefined ? it.position : (it.x !== undefined || it.y !== undefined ? { x: it.x, y: it.y } : null);
    const rawPos = parsePosition(pos, mapLayout.width, mapLayout.height, order);
    const finalPos = getFreeWalkable(rawPos);

    const description = it.description || "";
    const rootOptions = it.options || [];

    const storyline: FallbackStep[] = (it.storyline || []).map((step: any, stepIdx: number) => {
      const stepId = step.id || `step_${step.stage !== undefined ? step.stage : stepIdx + 1}`;
      let text = step.text || step.scene || step.content || step.dialogue || step.dialog || step.description || step.question || step.narrator || "";
      if (!text) {
        text = description;
      }
      const allowsFreeInput = !!step.allowsFreeInput;
      
      const stepRawOptions = (step.options && step.options.length > 0) ? step.options : rootOptions;
      
      const options: FallbackOption[] = (stepRawOptions || []).map((opt: any, optIdx: number) => {
        const label = opt.label || opt.text || "选择";
        const nextStage = opt.nextStage !== undefined ? opt.nextStage 
          : (opt.target_stage !== undefined ? opt.target_stage 
          : (opt.targetStage !== undefined ? opt.targetStage 
          : (opt.next !== undefined ? opt.next : opt.redirect)));
        const actionId = opt.actionId || opt.toEnd || (typeof nextStage === 'string' ? nextStage : `option_${nextStage || optIdx + 1}`);
        const outcomeText = opt.outcomeText || `【选择后果】：你选择了『${label}』，导致后续时空因果产生了微妙波折。`;
        const timeDelta = opt.timeDelta !== undefined ? opt.timeDelta : 0;
        const isEarlyEnd = opt.isEarlyEnd !== undefined
          ? opt.isEarlyEnd
          : (!!opt.toEnd || (typeof nextStage === 'string' && (nextStage.startsWith('ending') || nextStage.startsWith('end'))));
        const soundHint = opt.soundHint || "";
        
        return {
          label,
          outcomeText,
          timeDelta,
          actionId,
          isEarlyEnd,
          soundHint,
          nextStage
        };
      });
      
      return {
        id: stepId,
        text,
        allowsFreeInput,
        options
      };
    });

    return {
      id: it.id || `item_${itemIdx}`,
      name: it.name || "物品",
      sprite: it.sprite || "coffee",
      x: finalPos.x,
      y: finalPos.y,
      description,
      storyline
    };
  });

  // Harmonize fixed endings
  const fixedEndings: FixedEnding[] = (w.fixedEndings || []).map((ending: any) => {
    const endingId = ending.endingId || ending.id || "";
    const title = ending.title || "";
    const description = ending.description || ending.text || "";
    const priority = ending.priority !== undefined ? ending.priority : 3;
    const triggerRules = ending.triggerRules || {
      mustInclude: [endingId]
    };
    return {
      endingId,
      title,
      description,
      priority,
      triggerRules
    };
  });

  return {
    identity,
    theme: w.theme,
    mapLayout,
    playerPosition,
    npcs,
    items,
    fixedEndings,
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

  // 0. Direct exact match by ID or Identity Name
  const directMatch = worlds.find(
    (w) =>
      w.id?.toLowerCase() === norm ||
      (typeof w.identity === "string" && w.identity.toLowerCase() === norm) ||
      (typeof w.identity === "object" && w.identity?.title?.toLowerCase() === norm)
  );
  if (directMatch) {
    return worldJsonToScenario(directMatch);
  }

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
