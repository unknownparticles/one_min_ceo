import { BossIdentityType, ResourcePack } from "../types";

type ResourceSeed = {
  palette: ResourcePack["palette"];
  tileSet: string[];
  propSet: string[];
  spriteSet: string[];
  ambiance: string[];
};

const COMMON_SPRITES = [
  "secretary",
  "investor",
  "butler",
  "robot",
  "alien",
  "guard",
  "dog",
];

const COMMON_PROPS = [
  "desk",
  "pen",
  "coffee",
  "chest",
  "lever",
  "rocket_button",
  "egg",
  "golf_ball",
  "shoe",
];

const RESOURCE_SEEDS: Record<string, ResourceSeed> = {
  CEO: {
    palette: {
      primary: "#10b981",
      secondary: "#f59e0b",
      accent: "#38bdf8",
      surface: "#0f172a",
    },
    tileSet: ["floor", "carpet", "wall", "metal_plate"],
    propSet: ["desk", "pen", "coffee", "chest", "rocket_button", "lever"],
    spriteSet: ["ceo", "secretary", "investor", "robot", "dog"],
    ambiance: ["纳斯达克电子敲钟", "高空玻璃会议室", "黄金消防喷淋", "财报碎纸暴雨"],
  },
  SKI: {
    palette: {
      primary: "#38bdf8",
      secondary: "#f43f5e",
      accent: "#fbbf24",
      surface: "#0f172a",
    },
    tileSet: ["snow", "wall", "road", "metal_plate"],
    propSet: ["shoe", "lever", "coffee", "egg", "rocket_button"],
    spriteSet: ["ski", "guard", "robot", "alien", "dog"],
    ambiance: ["雪道激光旗门", "贵宾缆车站", "失控赞助商无人机", "冰面金箔反光"],
  },
  DIVER: {
    palette: {
      primary: "#06b6d4",
      secondary: "#d97706",
      accent: "#22c55e",
      surface: "#082f49",
    },
    tileSet: ["water", "deck", "metal_plate", "wall"],
    propSet: ["chest", "lever", "egg", "coffee", "pen"],
    spriteSet: ["diver", "alien", "robot", "butler", "dog"],
    ambiance: ["深海铜质氧气舱", "发光珊瑚账本", "沉船保险箱", "海沟泡泡广播"],
  },
  PILOT: {
    palette: {
      primary: "#f59e0b",
      secondary: "#38bdf8",
      accent: "#ef4444",
      surface: "#1e293b",
    },
    tileSet: ["metal_plate", "road", "floor", "wall"],
    propSet: ["lever", "shoe", "coffee", "rocket_button", "pen"],
    spriteSet: ["pilot", "guard", "secretary", "robot", "investor"],
    ambiance: ["私人飞机廊桥", "金色航班广播", "暴雨跑道灯", "总统失物箱"],
  },
  CHEF: {
    palette: {
      primary: "#ef4444",
      secondary: "#f8fafc",
      accent: "#f59e0b",
      surface: "#111827",
    },
    tileSet: ["floor", "carpet", "deck", "wall"],
    propSet: ["coffee", "pen", "chest", "egg", "lever"],
    spriteSet: ["chef", "butler", "investor", "guard", "dog"],
    ambiance: ["米其林后厨红毯", "鹅肝警报灯", "金勺评委席", "会喷火的甜品车"],
  },
  SPACE: {
    palette: {
      primary: "#22d3ee",
      secondary: "#ec4899",
      accent: "#a3e635",
      surface: "#020617",
    },
    tileSet: ["metal_plate", "floor", "wall", "water"],
    propSet: ["rocket_button", "lever", "egg", "coffee", "chest"],
    spriteSet: ["space", "alien", "robot", "dog", "secretary"],
    ambiance: ["休斯敦发射倒计时", "月球贵宾候机厅", "真空香槟吧", "星际狗粮仓"],
  },
  TYCOON: {
    palette: {
      primary: "#f59e0b",
      secondary: "#ef4444",
      accent: "#10b981",
      surface: "#0f172a",
    },
    tileSet: ["deck", "carpet", "floor", "wall"],
    propSet: ["chest", "golf_ball", "coffee", "pen", "lever"],
    spriteSet: ["tycoon", "butler", "investor", "guard", "dog"],
    ambiance: ["游艇天台晚宴", "黑卡烟花秀", "离岸信托酒柜", "黄金高尔夫推杆"],
  },
};

const normalizeIdentity = (identity?: string): BossIdentityType => {
  const raw = (identity || "CEO").toUpperCase();
  if (raw.includes("SKI") || raw.includes("雪")) return "SKI";
  if (raw.includes("DIVER") || raw.includes("潜水") || raw.includes("SEA")) return "DIVER";
  if (raw.includes("PILOT") || raw.includes("飞机")) return "PILOT";
  if (raw.includes("CHEF") || raw.includes("厨")) return "CHEF";
  if (raw.includes("SPACE") || raw.includes("太空")) return "SPACE";
  if (raw.includes("TYCOON") || raw.includes("首富") || raw.includes("游艇")) return "TYCOON";
  return "CEO";
};

export const getResourcePack = (identity?: string, theme?: string): ResourcePack => {
  const identityType = normalizeIdentity(identity);
  const seed = RESOURCE_SEEDS[identityType] || RESOURCE_SEEDS.CEO;

  return {
    logoMark: "ONE_MIN_BOSS_PIXEL_CROWN",
    palette: seed.palette,
    tileSet: Array.from(new Set([...seed.tileSet, "floor", "wall"])),
    propSet: Array.from(new Set([...seed.propSet, ...COMMON_PROPS])).slice(0, 12),
    spriteSet: Array.from(new Set([...seed.spriteSet, ...COMMON_SPRITES])).slice(0, 12),
    ambiance: seed.ambiance,
    posterTitle: theme || "一分钟老板因果资产包",
    posterSubtitle: "60秒微缩世界 / NPC资产 / 荒诞道具 / 固定结局线",
  };
};

export const buildResourceGenerationGuide = (identity?: string): string => {
  const pack = getResourcePack(identity);
  return [
    "资源生成要求：",
    `1. 必须附带 resourcePack 字段，包含 logoMark, palette, tileSet, propSet, spriteSet, ambiance, posterTitle, posterSubtitle。`,
    `2. sprite 只能优先使用这些可渲染资源：${pack.spriteSet.join(", ")}。`,
    `3. 物品 sprite 只能优先使用这些可渲染资源：${pack.propSet.join(", ")}。`,
    `4. tiles 只能使用这些地块：${pack.tileSet.join(", ")}。`,
    "5. 地图必须像一个完整的可游玩舞台：入口、主路径、风险区、奖励区、结局触发物都要能从布局上看出来。",
    "6. 每个 NPC/Item 的名字、storyline、actionId 要与资源主题强绑定，避免秘书、按钮、咖啡这种单薄重复资源。",
  ].join("\n");
};
