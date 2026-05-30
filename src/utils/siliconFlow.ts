import { EndingResult, FixedEnding, InteractionResult, WorldScenario, BossIdentityType } from "../types";
import { getFallbackScenario } from "../../serverFallback";
import { buildResourceGenerationGuide, getResourcePack } from "./resourceKit";

const SILICONFLOW_ENDPOINT = "https://api.siliconflow.cn/v1/chat/completions";
const DEFAULT_MODEL = "deepseek-ai/DeepSeek-V4-Flash";

type RuntimeConfig = {
  siliconFlowApiKey?: string;
  siliconFlowModel?: string;
};

declare global {
  interface Window {
    __ONE_MIN_CEO_CONFIG__?: RuntimeConfig;
  }
}

const getRuntimeConfig = (): RuntimeConfig => {
  return {
    siliconFlowApiKey:
      window.__ONE_MIN_CEO_CONFIG__?.siliconFlowApiKey ||
      import.meta.env.VITE_SILICONFLOW_API_KEY,
    siliconFlowModel:
      window.__ONE_MIN_CEO_CONFIG__?.siliconFlowModel ||
      import.meta.env.VITE_SILICONFLOW_MODEL ||
      DEFAULT_MODEL,
  };
};

export const hasSiliconFlowKey = (): boolean => {
  return !!getRuntimeConfig().siliconFlowApiKey;
};

const parseJsonObject = <T>(content: string): T => {
  const trimmed = content.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1].trim() : trimmed;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return JSON.parse(raw.slice(start, end + 1)) as T;
  }
  return JSON.parse(raw) as T;
};

const callSiliconFlowJson = async <T>(systemPrompt: string, userPrompt: string, maxTokens = 4096): Promise<T> => {
  const config = getRuntimeConfig();
  if (!config.siliconFlowApiKey) {
    throw new Error("未配置 SiliconFlow API Key");
  }

  const response = await fetch(SILICONFLOW_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.siliconFlowApiKey}`,
    },
    body: JSON.stringify({
      model: config.siliconFlowModel || DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.9,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || `SiliconFlow 请求失败：${response.status}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("SiliconFlow 返回内容为空");
  }

  return parseJsonObject<T>(content);
};

const withFallbackIdentity = (scenario: ReturnType<typeof getFallbackScenario>, identityType: string): WorldScenario => {
  return {
    ...scenario,
    identityType: (identityType || "CEO") as BossIdentityType,
    resourcePack: getResourcePack(identityType, scenario.theme),
    isFallback: true,
  };
};

export const generateWorld = async (identity: string, customPrompt: string): Promise<WorldScenario> => {
  const systemPrompt = `你是像素世界生成器，为游戏《一分钟老板》生成完整可玩的 JSON 场景。只返回 JSON，不要 Markdown。
JSON 必须包含字段：identity, identityType, theme, mapLayout, playerPosition, npcs, items, introText, ambientMusic, fixedEndings, resourcePack。
mapLayout.width 必须是 16，height 必须是 12，tiles 是 12x16 字符串矩阵，边界用 wall，其余可用 floor/carpet/grass/snow/water/deck/road/metal_plate。
npcs 生成 4 到 6 个，items 生成 4 到 6 个，坐标不能重叠，x 在 1 到 14，y 在 1 到 10。
每个 NPC 和 Item 都必须有 storyline，storyline 正好 3 步；每步包含 id, text, allowsFreeInput, options；每个 options 需要 label, outcomeText, timeDelta, actionId, 可选 isEarlyEnd 和 soundHint。
fixedEndings 生成 4 到 6 个，每个包含 endingId, title, description, priority, triggerRules；triggerRules 至少包含 mustInclude，可选 forbidInclude 和 requiredSequence。
resourcePack.palette 必须包含 primary, secondary, accent, surface 四个十六进制色值。
resourcePack.tileSet/propSet/spriteSet/ambiance 每项至少 4 个元素。
${buildResourceGenerationGuide(identity)}
语气要荒诞、中文、节奏快，适合 60 秒倒计时互动。`;

  const userPrompt = `身份类型：${identity || "CEO"}。自定义设定：${customPrompt || "无"}。请生成一个完整场景 JSON。`;

  try {
    const world = await callSiliconFlowJson<WorldScenario>(systemPrompt, userPrompt, 8192);
    return {
      ...world,
      identityType: (world.identityType || identity || "CEO") as BossIdentityType,
      resourcePack: world.resourcePack || getResourcePack(world.identityType || identity, world.theme),
    };
  } catch (error) {
    console.warn("[SiliconFlow fallback] generateWorld", error);
    return withFallbackIdentity(getFallbackScenario(identity), identity);
  }
};

export const generateInteraction = async (payload: {
  identity?: string;
  theme?: string;
  targetType: "NPC" | "Item";
  targetName: string;
  targetId: string;
  dialogueHistory: string[];
  playerAction: string;
}): Promise<InteractionResult> => {
  const systemPrompt = `你是《一分钟老板》的荒诞互动导演。只返回 JSON，不要 Markdown。
JSON 必须包含：text, options, allowsFreeInput, soundHint, timeDelta, isEarlyEnd。
options 是 1 到 3 个选项，每项包含 label 和 action。timeDelta 是 0 或负整数。`;
  const userPrompt = `身份：${payload.identity}。主题：${payload.theme}。
交互对象类型：${payload.targetType}。对象名：${payload.targetName}。对象 ID：${payload.targetId}。
对话历史：${JSON.stringify(payload.dialogueHistory || [])}
玩家动作：${payload.playerAction || "First approach"}`;

  return callSiliconFlowJson<InteractionResult>(systemPrompt, userPrompt, 2048);
};

const findMatchedEnding = (fixedEndings: FixedEnding[] = [], actionSequence: string[] = []): FixedEnding | null => {
  const sorted = [...fixedEndings].sort((a, b) => (b.priority || 0) - (a.priority || 0));
  for (const ending of sorted) {
    const rules = ending.triggerRules;
    if (!rules) continue;

    const mustMatch = (rules.mustInclude || []).every(action => actionSequence.includes(action));
    const forbidMatch = !(rules.forbidInclude || []).some(action => actionSequence.includes(action));
    const sequenceMatch = !rules.requiredSequence || rules.requiredSequence.length < 2 || rules.requiredSequence.every((action, index, arr) => {
      if (index === 0) return true;
      return actionSequence.indexOf(arr[index - 1]) >= 0 && actionSequence.indexOf(arr[index - 1]) < actionSequence.indexOf(action);
    });

    if (mustMatch && forbidMatch && sequenceMatch) {
      return ending;
    }
  }

  return null;
};

const offlineEnding = (payload: {
  identity: string;
  theme: string;
  spentTime: number;
  actionSequence: string[];
  fixedEndings?: FixedEnding[];
}): EndingResult => {
  const matchedEnding = findMatchedEnding(payload.fixedEndings, payload.actionSequence);
  const randTag = Math.floor(Math.random() * 8999 + 1000).toString(16).toUpperCase();
  const shorthand = (payload.identity || "BOSS").slice(0, 3).toUpperCase();

  return {
    id: `${shorthand} #${randTag}`,
    title: matchedEnding ? matchedEnding.title : "【平平无奇的星际富豪】",
    rank: matchedEnding ? (matchedEnding.priority >= 4 ? "SSS 降维打击级" : "SS 荒诞传奇级") : "A- 稳扎稳打级",
    endingText: matchedEnding
      ? matchedEnding.description
      : `你在「${payload.theme}」中坚持探索了 ${payload.spentTime.toFixed(1)} 秒。行动轨迹（${payload.actionSequence.join(" -> ") || "平稳摸鱼"}）没有撞上主灾难线，管理局判定你功过参半，继续戴着大钻戒过富豪生活。`,
    achievements: [
      "因果线的织梦者",
      matchedEnding ? `达成特定结局：${matchedEnding.title.replace(/[【】]/g, "")}` : "避开宿命的过客",
    ],
    stats: {
      wealthWasted: matchedEnding ? "100% 满重力耗损" : "30% 适度花销",
      butterflyEffectIndex: matchedEnding ? "999% (爆表)" : "120% (微澜)",
      insanityLevel: matchedEnding ? "星际观测级" : "循规蹈矩",
    },
    isFallback: true,
  };
};

export const generateEnding = async (payload: {
  identity: string;
  theme: string;
  spentTime: number;
  interactionLog: Array<{ entity: string; action: string; outcome: string }>;
  actionSequence: string[];
  fixedEndings?: FixedEnding[];
}): Promise<EndingResult> => {
  const matchedEnding = findMatchedEnding(payload.fixedEndings, payload.actionSequence);
  const systemPrompt = `你是《一分钟老板》的终局评估官。只返回 JSON，不要 Markdown。
JSON 必须包含：id, title, rank, endingText, achievements, stats。
stats 必须包含 wealthWasted, butterflyEffectIndex, insanityLevel。
${matchedEnding ? `玩家触发固定结局：${matchedEnding.title}。结局描述：${matchedEnding.description}。必须围绕这个固定结局扩写。` : "没有固定结局命中，请基于行动记录生成荒诞总结。"}`;
  const userPrompt = `身份：${payload.identity}
主题：${payload.theme}
已用时间：${payload.spentTime}
行动序列：${JSON.stringify(payload.actionSequence)}
互动记录：${JSON.stringify(payload.interactionLog)}`;

  try {
    return await callSiliconFlowJson<EndingResult>(systemPrompt, userPrompt, 4096);
  } catch (error) {
    console.warn("[SiliconFlow fallback] generateEnding", error);
    return offlineEnding(payload);
  }
};
