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
  if (hit("跑", "逃", "躲", "无视", "沉默", "撤", "exit", "离开")) {
    delta.sanity += 6;
    delta.fame -= 5;
    delta.chaos -= 3;
  }
  if (hit("咖啡", "酒", "灌", "嗨", "派对", "蹦", "夜店", "drink")) {
    delta.sanity -= 10;
    delta.chaos += 10;
    delta.fame += 3;
  }
  if (hit("按钮", "爆炸", "核弹", "毁灭", "崩", "炸", "烧", "火")) {
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
  if (hit("道歉", "和解", "合规", "冷静", "冷静", "理性", "分析")) {
    delta.sanity += 10;
    delta.chaos -= 6;
    delta.fame += 2;
  }
  if (hit("裁员", "开除", "骂", "甩锅", "甩", "甩锅")) {
    delta.wealth += 6;
    delta.fame -= 10;
    delta.sanity -= 4;
  }
  if (hit("自定义", "custom", "自由")) {
    delta.chaos += 8;
    delta.fame += 3;
    delta.sanity -= 2;
  }

  // 时间代价越大，通常越“豪赌”
  if (timeDelta <= -15) {
    delta.wealth -= 4;
    delta.chaos += 6;
  } else if (timeDelta <= -8) {
    delta.chaos += 3;
  } else if (timeDelta <= -3) {
    delta.fame += 1;
  }

  // 若完全没命中关键词，给一点基础波动，避免数值死水
  if (!hasAnyDelta(delta)) {
    delta.chaos += 4;
    delta.sanity -= 2;
    delta.fame += timeDelta < 0 ? 2 : 0;
  }

  // 限制单次冲击幅度，保持可读
  (Object.keys(delta) as (keyof MeterDelta)[]).forEach((key) => {
    delta[key] = Math.max(-22, Math.min(22, delta[key]));
  });

  return delta;
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
