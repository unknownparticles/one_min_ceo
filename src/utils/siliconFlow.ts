import { EndingResult, FixedEnding, InteractionResult, WorldScenario, BossIdentityType } from "../types";
import { getFallbackScenario } from "../../serverFallback";
import { buildResourceGenerationGuide, getResourcePack } from "./resourceKit";

const SILICONFLOW_ENDPOINT = "https://api.siliconflow.cn/v1/chat/completions";
const DEFAULT_MODEL = "Qwen/Qwen3.5-35B-A3B";

export type ApiProvider = "siliconflow" | "minimax";

export interface ApiSettings {
  provider: ApiProvider;
  siliconFlowApiKey: string;
  siliconFlowModel: string;
  minimaxApiKey: string;
  minimaxModel: string;
}

const DEFAULT_SILICONFLOW_MODEL = "Qwen/Qwen3.5-35B-A3B";
const DEFAULT_MINIMAX_MODEL = "MiniMax-M2.5";
const MINIMAX_ENDPOINT = "https://api.minimax.io/v1/chat/completions";

type RuntimeConfig = {
  siliconFlowApiKey?: string;
  siliconFlowModel?: string;
  minimaxApiKey?: string;
  minimaxModel?: string;
  provider?: ApiProvider;
};

declare global {
  interface Window {
    __ONE_MIN_CEO_CONFIG__?: RuntimeConfig;
  }
}

export const getApiSettings = (): ApiSettings => {
  let stored: Partial<ApiSettings> = {};
  try {
    const raw = localStorage.getItem("one_min_ceo_api_settings");
    if (raw) {
      stored = JSON.parse(raw);
    }
  } catch (e) {
    console.error("加载 API 设置失败", e);
  }

  const sfKey = stored.siliconFlowApiKey ||
                window.__ONE_MIN_CEO_CONFIG__?.siliconFlowApiKey ||
                import.meta.env.VITE_SILICONFLOW_API_KEY ||
                "";

  const mmKey = stored.minimaxApiKey ||
                window.__ONE_MIN_CEO_CONFIG__?.minimaxApiKey ||
                import.meta.env.VITE_MINIMAX_API_KEY ||
                "";

  let defaultProvider: ApiProvider = "siliconflow";
  if (stored.provider) {
    defaultProvider = stored.provider;
  } else if (mmKey && !sfKey) {
    defaultProvider = "minimax";
  }

  return {
    provider: defaultProvider,
    siliconFlowApiKey: sfKey,
    siliconFlowModel: stored.siliconFlowModel || window.__ONE_MIN_CEO_CONFIG__?.siliconFlowModel || import.meta.env.VITE_SILICONFLOW_MODEL || DEFAULT_SILICONFLOW_MODEL,
    minimaxApiKey: mmKey,
    minimaxModel: stored.minimaxModel || window.__ONE_MIN_CEO_CONFIG__?.minimaxModel || import.meta.env.VITE_MINIMAX_MODEL || DEFAULT_MINIMAX_MODEL,
  };
};

export const saveApiSettings = (settings: ApiSettings) => {
  try {
    localStorage.setItem("one_min_ceo_api_settings", JSON.stringify(settings));
    if (!window.__ONE_MIN_CEO_CONFIG__) {
      window.__ONE_MIN_CEO_CONFIG__ = {};
    }
    window.__ONE_MIN_CEO_CONFIG__.siliconFlowApiKey = settings.siliconFlowApiKey;
    window.__ONE_MIN_CEO_CONFIG__.siliconFlowModel = settings.siliconFlowModel;
    window.__ONE_MIN_CEO_CONFIG__.minimaxApiKey = settings.minimaxApiKey;
    window.__ONE_MIN_CEO_CONFIG__.minimaxModel = settings.minimaxModel;
    window.__ONE_MIN_CEO_CONFIG__.provider = settings.provider;
  } catch (e) {
    console.error("保存 API 设置失败", e);
  }
};

export const hasSiliconFlowKey = (): boolean => {
  const settings = getApiSettings();
  if (settings.provider === "minimax") {
    return !!settings.minimaxApiKey;
  }
  return !!settings.siliconFlowApiKey;
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
  const settings = getApiSettings();
  const isMiniMax = settings.provider === "minimax";
  
  const apiKey = isMiniMax ? settings.minimaxApiKey : settings.siliconFlowApiKey;
  const model = isMiniMax ? settings.minimaxModel : settings.siliconFlowModel;
  const endpoint = isMiniMax ? MINIMAX_ENDPOINT : SILICONFLOW_ENDPOINT;

  if (!apiKey) {
    throw new Error(`未配置 ${isMiniMax ? "MiniMax" : "SiliconFlow"} API Key，请点击右上角 [⚙️ API设置] 进行配置。`);
  }

  const startTime = performance.now();
  
  // Set up 5-second request timeout controller and Promise.race for double-insurance
  const controller = new AbortController();
  let timeoutId: any = null;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      controller.abort(); // Attempt to abort underlying network request
      reject(new DOMException("The user aborted a request.", "AbortError"));
    }, 5000);
  });

  // Initialize timing placeholder in case of early errors
  (callSiliconFlowJson as any).lastTiming = {
    networkDuration: 0,
    parseDuration: 0,
    totalDuration: 0,
    error: null
  };

  try {
    const response = await Promise.race([
      fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.9,
          max_tokens: maxTokens,
        }),
        signal: controller.signal
      }),
      timeoutPromise
    ]);

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(errorText || `${isMiniMax ? "MiniMax" : "SiliconFlow"} 请求失败：${response.status}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      throw new Error(`${isMiniMax ? "MiniMax" : "SiliconFlow"} 返回内容为空`);
    }

    const networkEndTime = performance.now();
    const networkDuration = networkEndTime - startTime;

    const parseStartTime = performance.now();
    const parsed = parseJsonObject<T>(content);
    const parseEndTime = performance.now();
    const parseDuration = parseEndTime - parseStartTime;

    (callSiliconFlowJson as any).lastTiming = {
      networkDuration,
      parseDuration,
      totalDuration: performance.now() - startTime,
      error: null
    };

    return parsed;
  } catch (error: any) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    controller.abort();
    const totalDuration = performance.now() - startTime;
    (callSiliconFlowJson as any).lastTiming = {
      networkDuration: totalDuration,
      parseDuration: 0,
      totalDuration,
      error: error.message || error.name || "Unknown error"
    };

    if (error.name === "AbortError") {
      throw new Error(`时空网关连接超时 (API 请求超出 5 秒无响应)，已自动切回离线降级引擎！`);
    }
    throw error;
  }
};

const withFallbackIdentity = (scenario: ReturnType<typeof getFallbackScenario>, identityType: string): WorldScenario => {
  return {
    ...scenario,
    identityType: (identityType || "CEO") as BossIdentityType,
    resourcePack: getResourcePack(identityType, scenario.theme),
    isFallback: true,
  };
};

const normalizeMapLayout = (mapLayout: any): any => {
  if (!mapLayout) return null;
  let tiles = mapLayout.tiles;
  if (!Array.isArray(tiles)) return null;

  // 1. Handle case where it is an array of CSV strings (common LLM behavior)
  // e.g. ["wall,wall,wall", "floor,floor,floor"]
  if (tiles.length > 0 && typeof tiles[0] === "string" && tiles[0].includes(",")) {
    tiles = tiles.map((row: string) => row.split(",").map(t => t.trim()));
  }

  // 2. Handle case where it is a flat 1D array of 192 (12 * 16) elements
  if (tiles.length === 192 && typeof tiles[0] === "string") {
    const newTiles: string[][] = [];
    for (let i = 0; i < 12; i++) {
      newTiles.push(tiles.slice(i * 16, (i + 1) * 16));
    }
    tiles = newTiles;
  }

  // 3. Verify it is a valid 12x16 2D array
  if (tiles.length !== 12) return null;
  for (let r = 0; r < 12; r++) {
    if (!Array.isArray(tiles[r]) || tiles[r].length !== 16) {
      return null;
    }
  }

  return {
    width: 16,
    height: 12,
    tiles: tiles
  };
};

const printPerformanceReport = (actionName: string, customDuration = 0, isFallback = false, errorMsg?: string) => {
  const timing = (callSiliconFlowJson as any).lastTiming;
  if (!timing) return;
  
  const settings = getApiSettings();
  const providerLabel = settings.provider === "minimax" ? "MiniMax (海螺AI)" : "SiliconFlow (硅基流动)";
  
  const labelStyle = "color: #FF9F1C; font-weight: bold;";
  const valueStyle = "color: #6BCB77; font-weight: bold;";
  const warningStyle = "color: #FF6B6B; font-weight: bold; background: #FFF3BF; padding: 2px 4px; border-radius: 4px;";
  
  if (isFallback || timing.error || errorMsg) {
    const errMsg = errorMsg || timing.error || "未知网络异常";
    console.warn(
      `%c================ [ONE MIN CEO 性能分析 - 离线降级降临] ================\n` +
      `%c- 提供商: %c${providerLabel}\n` +
      `%c- 动作: %c${actionName}\n` +
      `%c- 网络尝试耗时: %c${timing.networkDuration.toFixed(1)} ms\n` +
      `%c- 降级原因: %c${errMsg}\n` +
      `%c- 状态: %c已切回本地离线引擎，游戏可正常畅玩！\n` +
      `%c========================================================================`,
      "color: #FF6B6B; font-weight: bold;",
      "color: #2D3436;", labelStyle,
      "color: #2D3436;", labelStyle + "color: #FF6B6B; background: #FFD93D; padding: 1.5px 4px; border-radius: 4px;",
      "color: #2D3436;", valueStyle,
      "color: #2D3436;", warningStyle,
      "color: #2D3436;", "color: #FF6B6B; font-weight: bold;",
      "color: #FF6B6B; font-weight: bold;"
    );
  } else {
    console.log(
      `%c================ [ONE MIN CEO 性能分析 - AI 完美生成] ================\n` +
      `%c- 提供商: %c${providerLabel}\n` +
      `%c- 动作: %c${actionName}\n` +
      `%c- 网络请求耗时: %c${timing.networkDuration.toFixed(1)} ms\n` +
      `%c- 数据结构解析: %c${timing.parseDuration.toFixed(1)} ms\n` +
      (customDuration > 0 ? `%c- 地图规范校验: %c${customDuration.toFixed(1)} ms\n` : "") +
      `%c- 总体计算耗时: %c${(timing.totalDuration + customDuration).toFixed(1)} ms\n` +
      `%c========================================================================`,
      "color: #22c55e; font-weight: bold;",
      "color: #2D3436;", labelStyle,
      "color: #2D3436;", labelStyle + "color: #FFD93D; background: #2D3436; padding: 1.5px 4px; border-radius: 4px;",
      "color: #2D3436;", valueStyle,
      "color: #2D3436;", valueStyle,
      ...(customDuration > 0 ? ["color: #2D3436;", valueStyle] : []),
      "color: #2D3436;", "color: #A66CFF; font-weight: black;",
      "color: #22c55e; font-weight: bold;"
    );
  }
};

export const generateWorld = async (identity: string, customPrompt: string): Promise<WorldScenario> => {
  const systemPrompt = `你是像素世界生成器，为游戏《一分钟老板》生成完整可玩的 JSON 场景。只返回 JSON，不要 Markdown。
JSON 必须包含字段：identity, identityType, theme, mapLayout, playerPosition, npcs, items, introText, ambientMusic, fixedEndings, resourcePack。
mapLayout.width 必须是 16，height 必须是 12，tiles 是 12x16 字符串矩阵，边界用 wall，其余可用 floor/carpet/grass/snow/water/deck/road/metal_plate。
npcs 生成 4 到 6 个，items 生成 4 到 6 个，坐标不能重叠，x 在 1 到 14，y 在 1 到 10。
每个 NPC 和 Item 都必须有 storyline，storyline 正好 3 步；每步包含 id, text, allowsFreeInput, options；每个 options 需要 label, outcomeText, timeDelta, actionId, 可选 isEarlyEnd 和 soundHint。注意，前两步 storyline 的 options 绝对不能设置 isEarlyEnd: true，只有在第三步也就是终结选择时才可以有条件地启用。
timeDelta 表示消耗剩余时间，必须是 0 或负整数，绝对不能返回正数。
fixedEndings 生成 4 到 6 个，每个包含 endingId, title, description, priority, triggerRules；triggerRules 至少包含 mustInclude，可选 forbidInclude 和 requiredSequence。
resourcePack.palette 必须包含 primary, secondary, accent, surface 四个十六进制色值。
resourcePack.tileSet/propSet/spriteSet/ambiance 每项至少 4 个元素。
${buildResourceGenerationGuide(identity)}
语气要荒诞、中文、节奏快，适合 60 秒倒计时互动。`;

  const userPrompt = `身份类型：${identity || "CEO"}。自定义设定：${customPrompt || "无"}。请生成一个完整场景 JSON。`;

  try {
    const world = await callSiliconFlowJson<WorldScenario>(systemPrompt, userPrompt, 8192);
    
    const startNormalize = performance.now();
    // Verify and normalize mapLayout structure to avoid empty map or runtime error
    const normalizedLayout = normalizeMapLayout(world.mapLayout);
    const normalizeDuration = performance.now() - startNormalize;
    
    if (!normalizedLayout) {
      throw new Error("大模型生成的场景中地图布局 (mapLayout) 无效或缺失");
    }

    // Safety checks for NPCs and Items lists to ensure array format
    const npcs = Array.isArray(world.npcs) ? world.npcs : [];
    const items = Array.isArray(world.items) ? world.items : [];

    printPerformanceReport("生成世界地图 (generateWorld)", normalizeDuration);

    return {
      ...world,
      mapLayout: normalizedLayout,
      npcs,
      items,
      identityType: (world.identityType || identity || "CEO") as BossIdentityType,
      resourcePack: world.resourcePack || getResourcePack(world.identityType || identity, world.theme),
    };
  } catch (error: any) {
    printPerformanceReport("生成世界地图 (generateWorld)", 0, true, error.message || String(error));
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
options 是 1 到 3 个选项，每项包含 label 和 action.timeDelta 是 0 或负整数。请尽量避免返回 isEarlyEnd: true，除非玩家做出了极其自毁或彻底毁灭整个时空线的不合理动作。`;
  const userPrompt = `身份：${payload.identity}。主题：${payload.theme}。
交互对象类型：${payload.targetType}。对象名：${payload.targetName}。对象 ID：${payload.targetId}。
对话历史：${JSON.stringify(payload.dialogueHistory || [])}
玩家动作：${payload.playerAction || "First approach"}`;

  try {
    const result = await callSiliconFlowJson<InteractionResult>(systemPrompt, userPrompt, 2048);
    printPerformanceReport("生成场景互动 (generateInteraction)");
    return result;
  } catch (error: any) {
    printPerformanceReport("生成场景互动 (generateInteraction)", 0, true, error.message || String(error));
    throw error;
  }
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
    const result = await callSiliconFlowJson<EndingResult>(systemPrompt, userPrompt, 4096);
    printPerformanceReport("评估终局清算 (generateEnding)");
    return result;
  } catch (error: any) {
    printPerformanceReport("评估终局清算 (generateEnding)", 0, true, error.message || String(error));
    return offlineEnding(payload);
  }
};
