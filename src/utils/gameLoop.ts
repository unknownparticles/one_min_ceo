import type { Item, NPC, Position, WorldScenario } from "../types";

export interface BossMeters {
  wealth: number;
  fame: number;
  sanity: number;
  chaos: number;
}

export interface MeterDelta {
  wealth: number;
  fame: number;
  sanity: number;
  chaos: number;
}

export interface MeterCrash {
  key: keyof BossMeters;
  title: string;
  description: string;
}

export interface InteractableTarget {
  type: "NPC" | "Item";
  id: string;
  name: string;
  x: number;
  y: number;
  stage: number;
  total: number;
  distance: number;
}

export interface DestinyIntroCard {
  title: string;
  subtitle: string;
  joke: string;
  goal: string;
  tips: string[];
}

export interface DailyScoreEntry {
  id: string;
  seed: string;
  identity: string;
  score: number;
  rank: string;
  chaos: number;
  combo: number;
  historyCount: number;
  timestamp: string;
}

export interface ExtremeOption {
  label: string;
  outcomeText: string;
  timeDelta: number;
  actionId: string;
  isEarlyEnd?: boolean;
  soundHint?: string;
}

export const DEFAULT_METERS: BossMeters = {
  wealth: 58,
  fame: 52,
  sanity: 62,
  chaos: 34,
};

export const METER_LABELS: Record<keyof BossMeters, { name: string; icon: string; color: string }> = {
  wealth: { name: "资产", icon: "💰", color: "#F4D35E" },
  fame: { name: "声望", icon: "📣", color: "#4D96FF" },
  sanity: { name: "理智", icon: "🧠", color: "#6BCB77" },
  chaos: { name: "荒诞", icon: "🌀", color: "#FF6B6B" },
};

const DAILY_BOARD_KEY = "boss_minute_daily_board_v1";

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(value)));

export function createEmptyDelta(): MeterDelta {
  return { wealth: 0, fame: 0, sanity: 0, chaos: 0 };
}

export function hasAnyDelta(delta: MeterDelta): boolean {
  return Object.values(delta).some((v) => v !== 0);
}

export function applyMeterDelta(current: BossMeters, delta: MeterDelta): BossMeters {
  return {
    wealth: clamp(current.wealth + delta.wealth),
    fame: clamp(current.fame + delta.fame),
    sanity: clamp(current.sanity + delta.sanity),
    chaos: clamp(current.chaos + delta.chaos),
  };
}

/**
 * 从选项文案/结果文案启发式估算四维变化。
 * 目标是让玩家立刻感到“选择有代价”，对标 Reigns 的可见资源拉扯。
 */
export function estimateMeterImpact(
  actionText: string,
  outcomeText = "",
  timeDelta = 0,
  actionId = ""
): MeterDelta {
  const text = `${actionText} ${outcomeText} ${actionId}`.toLowerCase();
  const delta = createEmptyDelta();

  const hit = (...keys: string[]) => keys.some((k) => text.includes(k.toLowerCase()));

  if (hit("签", "融资", "协议", "收购", "投资", "支票", "买", "收购", "deal", "buy", "ipo")) {
    delta.wealth += hit("破产", "亏", "赔", "烧掉") ? -18 : -8;
    delta.fame += 8;
    delta.chaos += 4;
  }
  if (hit("钞", "撒钱", "打赏", "红包", "金卡", "无限", "bailout")) {
    delta.wealth -= 14;
    delta.fame += 6;
    delta.sanity += 4;
  }
  if (hit("跑", "逃", "躲", "无视", "沉默", "撤", "exit", "离开", "躺平")) {
    delta.sanity += 6;
    delta.fame -= 5;
    delta.chaos -= 3;
  }
  if (hit("咖啡", "酒", "灌", "嗨", "派对", "蹦", "夜店", "drink")) {
    delta.sanity -= 10;
    delta.chaos += 10;
    delta.fame += 3;
  }
  if (hit("按钮", "爆炸", "核弹", "毁灭", "崩", "炸", "烧", "火", "豪赌", "allin", "押")) {
    delta.chaos += 16;
    delta.sanity -= 8;
    delta.wealth -= 6;
  }
  if (hit("直播", "采访", "狗仔", "热搜", "曝光", "声明", "公关")) {
    delta.fame += 12;
    delta.sanity -= 4;
    delta.chaos += 5;
  }
  if (hit("狗", "柴犬", "外星", "量子", "时空", "平行", "魔法", "幽灵")) {
    delta.chaos += 12;
    delta.sanity -= 6;
  }
  if (hit("道歉", "和解", "合规", "冷静", "理性", "分析", "假装")) {
    delta.sanity += 10;
    delta.chaos -= 6;
    delta.fame += 2;
  }
  if (hit("裁员", "开除", "骂", "甩锅")) {
    delta.wealth += 6;
    delta.fame -= 10;
    delta.sanity -= 4;
  }
  if (hit("自定义", "custom", "自由")) {
    delta.chaos += 8;
    delta.fame += 3;
    delta.sanity -= 2;
  }
  if (hit("extreme_allin_chaos", "极端豪赌")) {
    delta.chaos += 20;
    delta.wealth -= 12;
    delta.sanity -= 10;
    delta.fame += 8;
  }
  if (hit("extreme_lie_flat", "极端躺平")) {
    delta.sanity += 14;
    delta.chaos -= 10;
    delta.fame -= 8;
    delta.wealth -= 4;
  }
  if (hit("extreme_pr_nuke", "公关核爆")) {
    delta.fame += 18;
    delta.sanity -= 12;
    delta.chaos += 10;
  }
  if (hit("extreme_charity_launder", "慈善洗白")) {
    delta.fame += 10;
    delta.wealth -= 16;
    delta.sanity += 6;
    delta.chaos += 4;
  }

  if (timeDelta <= -15) {
    delta.wealth -= 4;
    delta.chaos += 6;
  } else if (timeDelta <= -8) {
    delta.chaos += 3;
  } else if (timeDelta <= -3) {
    delta.fame += 1;
  }

  if (!hasAnyDelta(delta)) {
    delta.chaos += 4;
    delta.sanity -= 2;
    delta.fame += timeDelta < 0 ? 2 : 0;
  }

  (Object.keys(delta) as (keyof MeterDelta)[]).forEach((key) => {
    delta[key] = Math.max(-22, Math.min(22, delta[key]));
  });

  return delta;
}

/** Reigns 式预判：只根据选项标签估算，供箭头展示。 */
export function previewOptionImpact(label: string, actionId = "", timeDelta = 0): MeterDelta {
  return estimateMeterImpact(label, "", timeDelta, actionId);
}

export function topDeltaArrows(delta: MeterDelta, limit = 3): Array<{ key: keyof MeterDelta; value: number; icon: string; name: string }> {
  return (Object.keys(delta) as (keyof MeterDelta)[])
    .map((key) => ({ key, value: delta[key], icon: METER_LABELS[key].icon, name: METER_LABELS[key].name }))
    .filter((item) => item.value !== 0)
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, limit);
}

export function checkMeterCrash(meters: BossMeters): MeterCrash | null {
  if (meters.wealth <= 0) {
    return {
      key: "wealth",
      title: "资产归零破产局",
      description: "账上只剩一枚纪念币。债权人组成的铜管乐队已在楼下起调。",
    };
  }
  if (meters.fame <= 0) {
    return {
      key: "fame",
      title: "声望蒸发隐身局",
      description: "全网搜索不到你的名字，连门卫都把你当成快递代收点。",
    };
  }
  if (meters.sanity <= 0) {
    return {
      key: "sanity",
      title: "理智熔断狂欢局",
      description: "你开始用股票K线解读咖啡拉花，董事会建议你先睡一觉。",
    };
  }
  if (meters.chaos >= 100) {
    return {
      key: "chaos",
      title: "荒诞奇点爆表局",
      description: "现实协议被你玩坏了，因果律开始按会员价收费。",
    };
  }
  if (meters.wealth >= 100 && meters.chaos >= 85) {
    return {
      key: "wealth",
      title: "钞能力过载局",
      description: "钱多到开始拥有自主意识，它投票把你开除出董事会。",
    };
  }
  return null;
}

export function getMeterPressureHint(meters: BossMeters): string {
  const risks: string[] = [];
  if (meters.wealth <= 25) risks.push("资产告急");
  if (meters.fame <= 25) risks.push("声望崩盘边缘");
  if (meters.sanity <= 25) risks.push("理智危险");
  if (meters.chaos >= 75) risks.push("荒诞过载");
  if (risks.length === 0) {
    if (meters.chaos >= 55) return "命运提示：再荒诞一点就能解锁离谱结局。";
    if (meters.wealth >= 70) return "命运提示：钱很多，但故事还不够疯。";
    return "命运提示：去触发更多节点，把四维条拉出极端曲线。";
  }
  return `危险：${risks.join(" / ")}。一次错误选择就可能提前结算。`;
}

export function distanceOf(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function listInteractableTargets(
  world: WorldScenario,
  playerPos: Position,
  stageMap: Record<string, number>
): InteractableTarget[] {
  const targets: InteractableTarget[] = [];

  world.npcs.forEach((npc: NPC) => {
    const total = npc.storyline?.length || 3;
    const stage = stageMap[npc.id] || 0;
    if (stage >= total) return;
    targets.push({
      type: "NPC",
      id: npc.id,
      name: npc.name,
      x: npc.x,
      y: npc.y,
      stage,
      total,
      distance: distanceOf(playerPos, { x: npc.x, y: npc.y }),
    });
  });

  world.items.forEach((item: Item) => {
    const total = item.storyline?.length || 3;
    const stage = stageMap[item.id] || 0;
    if (stage >= total) return;
    targets.push({
      type: "Item",
      id: item.id,
      name: item.name,
      x: item.x,
      y: item.y,
      stage,
      total,
      distance: distanceOf(playerPos, { x: item.x, y: item.y }),
    });
  });

  return targets.sort((a, b) => a.distance - b.distance || a.stage - b.stage);
}

export function findBestNextTarget(
  world: WorldScenario,
  playerPos: Position,
  stageMap: Record<string, number>,
  excludeId?: string
): InteractableTarget | null {
  const targets = listInteractableTargets(world, playerPos, stageMap).filter((t) => t.id !== excludeId);
  return targets[0] || null;
}

export function formatDelta(value: number): string {
  if (value > 0) return `+${value}`;
  if (value < 0) return `${value}`;
  return "0";
}

export function computeRunGrade(meters: BossMeters, combo: number, historyCount: number, timerLeft: number): {
  rank: string;
  title: string;
  score: number;
} {
  const extremity =
    Math.abs(meters.wealth - 50) +
    Math.abs(meters.fame - 50) +
    Math.abs(meters.sanity - 50) +
    Math.abs(meters.chaos - 50);
  const score = extremity * 1.4 + combo * 8 + historyCount * 6 + (60 - timerLeft) * 0.5 + meters.chaos * 0.3;

  if (score >= 180) return { rank: "S", title: "因果操盘手", score };
  if (score >= 140) return { rank: "A", title: "分钟级传奇老板", score };
  if (score >= 100) return { rank: "B", title: "半吊子神豪", score };
  if (score >= 70) return { rank: "C", title: "路人甲董事", score };
  return { rank: "D", title: "被时间开除的实习生", score };
}

export function buildLocalEndingText(
  identity: string,
  meters: BossMeters,
  history: Array<{ entity: string; action: string; outcome: string }>,
  crash: MeterCrash | null,
  combo: number
): string {
  const top = history.slice(0, 3).map((h, i) => `${i + 1}. 对「${h.entity}」选择「${h.action}」→ ${h.outcome}`).join("\n");
  const meterLine = `资产${meters.wealth} / 声望${meters.fame} / 理智${meters.sanity} / 荒诞${meters.chaos}`;
  const crashLine = crash ? `\n结算触发：${crash.title}。${crash.description}` : "";
  return `作为「${identity}」的这一分钟里，你把人生拧成了四条扭曲曲线：${meterLine}。最高连击 ${combo}。\n${top || "你几乎什么都没做，时间自己把结局写完了。"}${crashLine}`;
}

const DESTINY_JOKES = [
  "秘书说你的日程只剩 60 秒，但其中 12 秒要拿来解释为什么日程只剩 60 秒。",
  "董事会建议你保持冷静；冷静的市场价格今天涨了 300%。",
  "你的智能手表提醒：距离成为段子主角还有 59 秒。",
  "外星狗已就位。它不听指令，只听股价。",
  "系统提示：本局目标不是赢，是输得足够有传播度。",
];

export function buildDestinyIntroCard(identity: string, theme: string): DestinyIntroCard {
  const joke = DESTINY_JOKES[Math.floor(Math.random() * DESTINY_JOKES.length)];
  return {
    title: "命运卡已发出",
    subtitle: `${identity} · ${theme}`,
    joke,
    goal: "本局目标：把荒诞拉高，同时别让资产/声望/理智归零。",
    tips: [
      "选项旁箭头=资源预判（像 Reigns）",
      "对话时时间仍在滴答（像 60 Seconds!）",
      "连续决策叠连击；空跑地图会断连击",
      "极端分支能快速冲分，也容易爆仓",
    ],
  };
}


export function listExtremeOptions(entityName = "命运"): ExtremeOption[] {
  return [
    {
      label: "🧨 极端豪赌：把一切押给荒诞",
      outcomeText: `你对「${entityName}」按下精神核按钮：合同、理智和物理定律一起退订。荒诞值暴涨，钱包和大脑同时冒烟。`,
      timeDelta: -12,
      actionId: "extreme_allin_chaos",
      soundHint: "explosion",
    },
    {
      label: "🧊 极端躺平：假装这是别人的公司",
      outcomeText: `你看着「${entityName}」，微笑着把责任扔进共享文档。世界短暂安静，声望下滑，但你感觉自己活过来了。`,
      timeDelta: -4,
      actionId: "extreme_lie_flat",
      soundHint: "bling",
    },
    {
      label: "📢 公关核爆：先上热搜再解释",
      outcomeText: `你直播连线「${entityName}」，标题直接叫《我可能破产了》。声望爆炸式上涨，评论区开始成立粉丝宗教。`,
      timeDelta: -8,
      actionId: "extreme_pr_nuke",
      soundHint: "bling",
    },
    {
      label: "🕊️ 慈善洗白：用捐赠购买原谅",
      outcomeText: `你以「${entityName}」的名义捐出一栋会自己走路的大楼。公众暂时感动，财务总监开始写遗书。`,
      timeDelta: -10,
      actionId: "extreme_charity_launder",
      soundHint: "bling",
    },
  ];
}

export function getExtremeOption(actionId: string, entityName = "命运"): ExtremeOption | null {
  return listExtremeOptions(entityName).find((o) => o.actionId === actionId) || null;
}

/** 给本地选项追加双极端分支，降低 AI 依赖、提高再玩差异。 */
export function withExtremeBranches<T extends {
  label: string;
  outcomeText?: string;
  timeDelta?: number;
  actionId?: string;
  isEarlyEnd?: boolean;
  soundHint?: string;
}>(options: T[], entityName = "命运", seedKey = ""): T[] {
  const base = options || [];
  if (base.some((o) => (o.actionId || "").startsWith("extreme_"))) return base;

  const extremes = listExtremeOptions(entityName);

  // 按实体/阶段种子轮换，保证展示与结算一致
  let hash = 0;
  const key = `${entityName}|${seedKey}`;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  const start = hash % extremes.length;
  const picked = [extremes[start], extremes[(start + 1) % extremes.length]];

  return [...base, ...(picked as unknown as T[])].slice(0, 5);
}

export function getDailySeed(date = new Date()): string {
  // 本地日界，避免 UTC 导致“今日”偏移
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function loadDailyBoard(seed = getDailySeed()): DailyScoreEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DAILY_BOARD_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw) as DailyScoreEntry[];
    return all
      .filter((item) => item.seed === seed)
      .sort((a, b) => b.score - a.score || b.chaos - a.chaos)
      .slice(0, 20);
  } catch {
    return [];
  }
}

export function submitDailyScore(input: {
  identity: string;
  meters: BossMeters;
  combo: number;
  historyCount: number;
  timerLeft: number;
  rank?: string;
  seed?: string;
}): { board: DailyScoreEntry[]; entry: DailyScoreEntry } {
  const seed = input.seed || getDailySeed();
  if (typeof window === "undefined") {
    const grade = computeRunGrade(input.meters, input.combo, input.historyCount, input.timerLeft);
    const entry: DailyScoreEntry = {
      id: `ssr_${Date.now()}`,
      seed,
      identity: input.identity,
      score: Math.round(grade.score),
      rank: input.rank || grade.rank,
      chaos: input.meters.chaos,
      combo: input.combo,
      historyCount: input.historyCount,
      timestamp: new Date().toLocaleTimeString(),
    };
    return { board: [entry], entry };
  }
  const grade = computeRunGrade(input.meters, input.combo, input.historyCount, input.timerLeft);
  const entry: DailyScoreEntry = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    seed,
    identity: input.identity,
    score: Math.round(grade.score),
    rank: input.rank || grade.rank,
    chaos: input.meters.chaos,
    combo: input.combo,
    historyCount: input.historyCount,
    timestamp: new Date().toLocaleTimeString(),
  };

  let all: DailyScoreEntry[] = [];
  try {
    const raw = window.localStorage.getItem(DAILY_BOARD_KEY);
    all = raw ? (JSON.parse(raw) as DailyScoreEntry[]) : [];
  } catch {
    all = [];
  }

  // 只保留近 14 天，避免无限膨胀
  const recentSeeds = new Set<string>();
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    recentSeeds.add(getDailySeed(d));
  }
  all = all.filter((item) => recentSeeds.has(item.seed));
  all.unshift(entry);
  window.localStorage.setItem(DAILY_BOARD_KEY, JSON.stringify(all.slice(0, 300)));
  return { board: loadDailyBoard(seed), entry };
}

export function getDailyBestScore(seed = getDailySeed()): number {
  const board = loadDailyBoard(seed);
  return board[0]?.score || 0;
}
