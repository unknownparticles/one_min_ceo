import { EndingResult, FixedEnding, InteractionResult, WorldScenario, BossIdentityType } from "../types";
import { getFallbackScenario } from "./fallbackScenario";
import { buildResourceGenerationGuide, getResourcePack } from "./resourceKit";

const SILICONFLOW_ENDPOINT = "https://api.siliconflow.cn/v1/chat/completions";
const DEFAULT_MODEL = "Qwen/Qwen2.5-14B-Instruct";

export type ApiProvider = "siliconflow" | "minimax";

export interface ApiSettings {
  provider: ApiProvider;
  siliconFlowApiKey: string;
  siliconFlowModel: string;
  minimaxApiKey: string;
  minimaxModel: string;
  enableThinking: boolean;
}

const DEFAULT_SILICONFLOW_MODEL = "Qwen/Qwen2.5-14B-Instruct";
const DEFAULT_MINIMAX_MODEL = "MiniMax-M2.5";
const MINIMAX_ENDPOINT = "https://api.minimax.io/v1/chat/completions";

type RuntimeConfig = {
  siliconFlowApiKey?: string;
  siliconFlowModel?: string;
  minimaxApiKey?: string;
  minimaxModel?: string;
  provider?: ApiProvider;
  enableThinking?: boolean;
};

declare global {
  interface Window {
    __ONE_MIN_CEO_CONFIG__?: RuntimeConfig;
  }
}

export const getRawStoredSettings = (): Partial<ApiSettings> => {
  try {
    const raw = localStorage.getItem("one_min_ceo_api_settings");
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("加载原始 API 设置失败", e);
  }
  return {};
};

export const hasEnvApiKey = (provider: ApiProvider): boolean => {
  if (provider === "siliconflow") {
    return !!(window.__ONE_MIN_CEO_CONFIG__?.siliconFlowApiKey || import.meta.env.VITE_SILICONFLOW_API_KEY);
  } else {
    return !!(window.__ONE_MIN_CEO_CONFIG__?.minimaxApiKey || import.meta.env.VITE_MINIMAX_API_KEY);
  }
};

export const getApiSettings = (): ApiSettings => {
  const stored = getRawStoredSettings();

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
    enableThinking: stored.enableThinking !== undefined ? stored.enableThinking : false,
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
    window.__ONE_MIN_CEO_CONFIG__.enableThinking = settings.enableThinking;
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

const callSiliconFlowJson = async <T>(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 4096,
  overrideModel?: string,
  overrideEnableThinking?: boolean,
  signal?: AbortSignal
): Promise<T> => {
  const settings = getApiSettings();
  const isMiniMax = settings.provider === "minimax" && !overrideModel;
  
  const apiKey = overrideModel ? settings.siliconFlowApiKey : (isMiniMax ? settings.minimaxApiKey : settings.siliconFlowApiKey);
  const model = overrideModel || (isMiniMax ? settings.minimaxModel : settings.siliconFlowModel);
  const endpoint = overrideModel ? SILICONFLOW_ENDPOINT : (isMiniMax ? MINIMAX_ENDPOINT : SILICONFLOW_ENDPOINT);

  if (!apiKey) {
    throw new Error(`未配置 ${isMiniMax ? "MiniMax" : "SiliconFlow"} API Key，请点击右上角 [⚙️ API设置] 进行配置。`);
  }

  const startTime = performance.now();

  (callSiliconFlowJson as any).lastTiming = {
    networkDuration: 0,
    parseDuration: 0,
    totalDuration: 0,
    error: null
  };

  try {
    const bodyParams: any = {
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.9,
      max_tokens: maxTokens,
    };

    const finalEnableThinking = overrideEnableThinking !== undefined
      ? overrideEnableThinking
      : settings.enableThinking;

    if (model.toLowerCase().includes("deepseek")) {
      bodyParams.enable_thinking = finalEnableThinking;
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(bodyParams),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(errorText || `${isMiniMax ? "MiniMax" : "SiliconFlow"} 请求失败：${response.status}`);
    }

    const data = await response.json();
    let content = data?.choices?.[0]?.message?.content;
    const reasoningContent = data?.choices?.[0]?.message?.reasoning_content;
    if (!content || typeof content !== "string") {
      if (reasoningContent && typeof reasoningContent === "string") {
        content = reasoningContent;
      } else {
        throw new Error(`${isMiniMax ? "MiniMax" : "SiliconFlow"} 返回内容为空`);
      }
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
    const totalDuration = performance.now() - startTime;
    (callSiliconFlowJson as any).lastTiming = {
      networkDuration: totalDuration,
      parseDuration: 0,
      totalDuration,
      error: error.message || error.name || "Unknown error"
    };

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


export interface ConnectionTestResult {
  success: boolean;
  message: string;
  latency?: number;
}

export const testApiConnection = async (): Promise<ConnectionTestResult> => {
  const settings = getApiSettings();
  const isMiniMax = settings.provider === "minimax";
  
  const apiKey = isMiniMax ? settings.minimaxApiKey : settings.siliconFlowApiKey;
  const model = isMiniMax ? settings.minimaxModel : settings.siliconFlowModel;
  const endpoint = isMiniMax ? MINIMAX_ENDPOINT : SILICONFLOW_ENDPOINT;

  if (!apiKey) {
    return {
      success: false,
      message: `未配置 ${isMiniMax ? "MiniMax" : "SiliconFlow"} API Key，请先配置。`
    };
  }

  const startTime = performance.now();

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "user", content: "ping" },
        ],
        max_tokens: 5,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      let detail = `HTTP ${response.status}`;
      if (response.status === 401) {
        detail = "API Key 校验失败 (401 Unauthorized)，请检查 Key 是否填写正确。";
      } else if (response.status === 402) {
        detail = "账户欠费 (402 Payment Required)，请前往服务商官网充值。";
      } else if (errorText) {
        detail += `: ${errorText.substring(0, 100)}`;
      }
      return {
        success: false,
        message: detail
      };
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    const latency = performance.now() - startTime;

    if (!content) {
      return {
        success: false,
        message: "API 响应成功，但返回的 choices 结构为空，可能是模型不兼容或设置有误。",
        latency
      };
    }

    return {
      success: true,
      message: `连接成功！延迟 ${latency.toFixed(0)} ms`,
      latency
    };
  } catch (error: any) {
    let msg = error.message || error.name || "连接失败";
    if (msg.includes("Failed to fetch")) {
      msg = "网络请求失败，请检查你的网络连接或 API 端点是否可达（可能需要开启 VPN 或检查 DNS 配置）。";
    }
    return {
      success: false,
      message: msg
    };
  }
};

interface ModelNpc {
  id: string;
  name: string;
  dialogue: string;
  storyline: Array<{
    id: string;
    text: string;
    options: Array<{
      label: string;
      outcomeText: string;
    }>;
  }>;
}

interface ModelItem {
  id: string;
  name: string;
  description: string;
  storyline: Array<{
    id: string;
    text: string;
    options: Array<{
      label: string;
      outcomeText: string;
    }>;
  }>;
}

interface ModelWorldResponse {
  theme: string;
  introText: string;
  npcs: ModelNpc[];
  items: ModelItem[];
}

export const generateWorld = async (
  identity: string,
  customPrompt: string,
  overrideModel?: string,
  overrideEnableThinking?: boolean,
  signal?: AbortSignal
): Promise<WorldScenario> => {
  const skeleton = getFallbackScenario(identity);

  const systemPrompt = `你是《一分钟老板》的荒诞文案生成器，为身份「${identity || "CEO"}」编写剧情。只返回 JSON，不要 Markdown。

返回格式：
{
  "theme": "荒诞时空主题名",
  "introText": "60秒倒计时开场白",
  "npcs": [{ "id": "...", "name": "...", "dialogue": "...", "storyline": [{ "id": "...", "text": "...", "options": [{ "label": "...", "outcomeText": "..." }] }] }],
  "items": [{ "id": "...", "name": "...", "description": "...", "storyline": [{ "id": "...", "text": "...", "options": [{ "label": "...", "outcomeText": "..." }] }] }]
}

约束：
1. npcs/items 的 id 和 storyline 中 step 的 id 必须与骨架完全一致，不增不减
2. 每个 step 的 options 数量必须与骨架一致
3. 只输出纯文本，不输出 mapLayout/playerPosition/fixedEndings/resourcePack`;

  const skeletonDataForPrompt = {
    identity: identity || "CEO",
    npcs: skeleton.npcs.map(n => ({
      id: n.id,
      role: n.name,
      steps: n.storyline.map(s => ({
        id: s.id,
        context: s.text,
        optionCount: s.options.length,
        optionHints: s.options.map(o => o.label)
      }))
    })),
    items: skeleton.items.map(i => ({
      id: i.id,
      type: i.name,
      steps: i.storyline.map(s => ({
        id: s.id,
        context: s.text,
        optionCount: s.options.length,
        optionHints: s.options.map(o => o.label)
      }))
    }))
  };

  const userPrompt = `身份：${identity || "CEO"}。${customPrompt ? `关键词：${customPrompt}。` : ""}
骨架（保留 id 和 option 数量，重写文案）：
${JSON.stringify(skeletonDataForPrompt, null, 2)}`;

  try {
    const worldResult = await callSiliconFlowJson<ModelWorldResponse>(
      systemPrompt,
      userPrompt,
      2048,
      overrideModel,
      overrideEnableThinking,
      signal
    );
    
    const startNormalize = performance.now();

    // Defensive Merge NPC storyline and data
    const mergedNpcs = skeleton.npcs.map(originalNpc => {
      const modelNpc = Array.isArray(worldResult.npcs) 
        ? worldResult.npcs.find((n: any) => n && n.id === originalNpc.id)
        : null;

      if (!modelNpc) {
        return originalNpc;
      }

      const mergedStoryline = originalNpc.storyline.map((originalStep, stepIdx) => {
        const modelStep = Array.isArray(modelNpc.storyline)
          ? (modelNpc.storyline.find((s: any) => s && s.id === originalStep.id) || modelNpc.storyline[stepIdx])
          : null;

        if (!modelStep) {
          return originalStep;
        }

        const mergedOptions = originalStep.options.map((originalOpt, optIdx) => {
          const modelOpt = Array.isArray(modelStep.options)
            ? modelStep.options[optIdx]
            : null;

          if (!modelOpt) {
            return originalOpt;
          }

          return {
            ...originalOpt,
            label: modelOpt.label || originalOpt.label,
            outcomeText: modelOpt.outcomeText || originalOpt.outcomeText,
          };
        });

        return {
          ...originalStep,
          text: modelStep.text || originalStep.text,
          options: mergedOptions,
        };
      });

      return {
        ...originalNpc,
        name: modelNpc.name || originalNpc.name,
        dialogue: modelNpc.dialogue || originalNpc.dialogue,
        storyline: mergedStoryline,
      };
    });

    // Defensive Merge Item storyline and data
    const mergedItems = skeleton.items.map(originalItem => {
      const modelItem = Array.isArray(worldResult.items)
        ? worldResult.items.find((i: any) => i && i.id === originalItem.id)
        : null;

      if (!modelItem) {
        return originalItem;
      }

      const mergedStoryline = originalItem.storyline.map((originalStep, stepIdx) => {
        const modelStep = Array.isArray(modelItem.storyline)
          ? (modelItem.storyline.find((s: any) => s && s.id === originalStep.id) || modelItem.storyline[stepIdx])
          : null;

        if (!modelStep) {
          return originalStep;
        }

        const mergedOptions = originalStep.options.map((originalOpt, optIdx) => {
          const modelOpt = Array.isArray(modelStep.options)
            ? modelStep.options[optIdx]
            : null;

          if (!modelOpt) {
            return originalOpt;
          }

          return {
            ...originalOpt,
            label: modelOpt.label || originalOpt.label,
            outcomeText: modelOpt.outcomeText || originalOpt.outcomeText,
          };
        });

        return {
          ...originalStep,
          text: modelStep.text || originalStep.text,
          options: mergedOptions,
        };
      });

      return {
        ...originalItem,
        name: modelItem.name || originalItem.name,
        description: modelItem.description || originalItem.description,
        storyline: mergedStoryline,
      };
    });

    const normalizeDuration = performance.now() - startNormalize;
    printPerformanceReport("生成世界地图 (generateWorld)", normalizeDuration);

    const mergedTheme = worldResult.theme || skeleton.theme;

    return {
      ...skeleton,
      theme: mergedTheme,
      introText: worldResult.introText || skeleton.introText,
      npcs: mergedNpcs,
      items: mergedItems,
      identityType: (identity || "CEO") as BossIdentityType,
      resourcePack: getResourcePack(identity, mergedTheme),
      isFallback: false,
    };
  } catch (error: any) {
    printPerformanceReport("生成世界地图 (generateWorld)", 0, true, error.message || String(error));
    return withFallbackIdentity(skeleton, identity);
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
}, signal?: AbortSignal): Promise<InteractionResult> => {
  const systemPrompt = `你是《一分钟老板》的荒诞互动导演。只返回 JSON，不要 Markdown。
JSON 必须包含：text, options, allowsFreeInput, soundHint, timeDelta, isEarlyEnd。
options 是 1 到 3 个选项，每项包含 label 和 action.timeDelta 是 0 或负整数。请尽量避免返回 isEarlyEnd: true，除非玩家做出了极其自毁或彻底毁灭整个时空线的不合理动作。`;
  const userPrompt = `身份：${payload.identity}。主题：${payload.theme}。
交互对象类型：${payload.targetType}。对象名：${payload.targetName}。对象 ID：${payload.targetId}。
对话历史：${JSON.stringify(payload.dialogueHistory || [])}
玩家动作：${payload.playerAction || "First approach"}`;

  try {
    const result = await callSiliconFlowJson<InteractionResult>(systemPrompt, userPrompt, 2048, undefined, undefined, signal);
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
}, signal?: AbortSignal): Promise<EndingResult> => {
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
    const result = await callSiliconFlowJson<EndingResult>(systemPrompt, userPrompt, 4096, undefined, undefined, signal);
    printPerformanceReport("评估终局清算 (generateEnding)");
    return result;
  } catch (error: any) {
    printPerformanceReport("评估终局清算 (generateEnding)", 0, true, error.message || String(error));
    return offlineEnding(payload);
  }
};

// Model to use for random concept streaming (non-thinking mode)
export const FLASH_MODEL = "deepseek-ai/DeepSeek-V4-Flash";

/**
 * 流式输出一个30字以内的荒诞商业构想。
 * 使用 deepseek-ai/DeepSeek-V4-Flash 非思考模式（enable_thinking: false），
 * 通过 SSE 流实时回调每个 token。
 *
 * @param onChunk 每次收到新文本片段时的回调
 * @param onDone  流完成时的回调，返回完整文本
 * @param onError 错误时的回调
 * @returns 取消函数
 */
export const streamBusinessConcept = (
  onChunk: (text: string) => void,
  onDone: (fullText: string) => void,
  onError: (err: Error) => void
): (() => void) => {
  const settings = getApiSettings();
  const apiKey = settings.siliconFlowApiKey;

  if (!apiKey) {
    onError(new Error("未配置 SiliconFlow API Key，请点击右上角 [⚙️ API设置] 进行配置。"));
    return () => {};
  }

  const controller = new AbortController();

  const run = async () => {
    try {
      const response = await fetch(SILICONFLOW_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: FLASH_MODEL,
          messages: [
            {
              role: "system",
              content: "你是一个天马行空的创业导师。直接输出一个不超过30个汉字的荒诞商业构想，不要解释，不要标点符号之外的格式，只输出构想本身。",
            },
            {
              role: "user",
              content: "给我一个让所有人都目瞪口呆的奇特创业构想，30字以内。",
            },
          ],
          stream: true,
          enable_thinking: false,
          temperature: 1.0,
          max_tokens: 60,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        throw new Error(`SiliconFlow 流式请求失败：${response.status} ${errText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("无法获取流式响应 Reader");

      const decoder = new TextDecoder("utf-8");
      let fullText = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === "data: [DONE]") continue;
          if (!trimmed.startsWith("data: ")) continue;

          try {
            const json = JSON.parse(trimmed.slice(6));
            const delta = json?.choices?.[0]?.delta?.content;
            if (delta && typeof delta === "string") {
              // Limit total streamed text to 30 Chinese characters
              const remaining = 30 - [...fullText].length;
              if (remaining <= 0) continue;
              const chunk = [...delta].slice(0, remaining).join("");
              fullText += chunk;
              onChunk(chunk);
              if ([...fullText].length >= 30) {
                reader.cancel();
                break;
              }
            }
          } catch {
            // Skip malformed SSE lines
          }
        }
      }

      onDone(fullText.trim());
    } catch (err: any) {
      if (err.name !== "AbortError") {
        onError(err instanceof Error ? err : new Error(String(err)));
      }
    }
  };

  run();
  return () => controller.abort();
};
