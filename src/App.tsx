/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Timer,
  BookOpen,
  Compass,
  DollarSign,
  History,
  Music,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Plus,
  Compass as CompassIcon,
  Crown,
  ChevronRight,
  TrendingUp,
  Share2,
  Grid,
  Info,
  Clock,
  Coins,
  ArrowRight,
  Github,
  ScanLine,
  CheckCircle2,
  Settings,
  Search,
  Wifi,
  WifiOff,
  Trophy,
  Gift,
  PartyPopper
} from "lucide-react";
import html2canvas from "html2canvas";
import { PixelMap } from "./components/PixelMap";
import { SpriteRenderer } from "./components/SpriteRenderer";
import { Position, NPC, Item, WorldScenario, InteractionResult, EndingResult, SavedLife, DailyChallenge, BossIdentityType } from "./types";
import { getDailyChallenge } from "./utils/dailyPresets";
import { getAllAvailableScenarios } from "./utils/fallbackScenario";
import { audio } from "./utils/audio";
import { generateEnding, generateInteraction, generateWorld, hasSiliconFlowKey, getApiSettings, saveApiSettings, testApiConnection, getRawStoredSettings, hasEnvApiKey, streamBusinessConcept, FLASH_MODEL, DEFAULT_SILICONFLOW_MODEL, getProviderDisplayName, type ApiSettings } from "./utils/siliconFlow";
import { getResourcePack } from "./utils/resourceKit";
import logoUrl from "../assets/logo.png";
import douyinQrUrl from "../assets/douyin.JPG";
import xiaohongshuQrUrl from "../assets/xiaohongshu.JPG";

// Ticker lines for the header to increase high-contrast satire & immersive feeling
const METADATA_TICKERS = [
  "📈 特斯拉今日市值重挫 50%, 原因系埃隆马斯克发表太空柴犬推特...",
  "💎 索罗斯基金会拟收购一整座阿尔卑斯雪山，仅因董事长认为那里的气泡水更冰...",
  "🛸 天文学家在火星暗面发现一台古董高尔夫球车，侧面印有罗斯柴尔德企业财团...",
  "🍕 全球小麦基金暴涨300%, 传闻谷歌联合创始人斥资百亿研发会说法语的小麦...",
  "🐬 深海潜水员在太平洋沟底捞起一张无限透支白金卡，据传失主是上个世纪的石油巨鳄...",
  "🌌 太空探索者在阿尔法星系外围开设了第一家星巴克旗舰店...",
  "💼 瑞士银行为神秘客户保管的‘远古狗罐头’投保 20 亿美元..."
];

const PRESETS = [
  { type: "CEO", name: "科技公司创始人", icon: "💎", difficulty: 2, description: "IPO上市前60秒，金钱、名誉与外星特工看门狗一网打尽" },
  { type: "SKI", name: "滑雪世界冠军", icon: "🏂", difficulty: 3, description: "雪道入口 the 最后60秒，面对挑衅和神秘的科幻加速板" },
  { type: "DIVER", name: "深海潜水探险家", icon: "🐙", difficulty: 4, description: "在海底神秘氧气舱和变异珊瑚群间耗竭最后一分钟" },
  { type: "PILOT", name: "私人飞机机长", icon: "✈️", difficulty: 3, description: "超音速飞机起航前，总统丢了一只白鞋，命运在拉扯" },
  { type: "CHEF", name: "米其林名厨大亨", icon: "👨‍🍳", difficulty: 4, description: "距离全球金勺评委吃下致命鹅肝余存60秒" },
  { type: "SPACE", name: "太空旅行富商", icon: "🚀", difficulty: 5, description: "休斯敦航天站倒数发射60秒，试图喂饱虚空哈士奇" },
  { type: "TYCOON", name: "世界首富大班", icon: "👑", difficulty: 2, description: "名利场晚宴天台上，一枚神秘黑色按钮和虚浮的游艇秘密" }
];

const DEFAULT_RANDOM_CONCEPT = "把北极融化的冰用游艇运到沙特卖，顺便推行减肥放电脂肪险";

const ACHIEVEMENT_DEFS = [
  { id: "first_world", name: "第一桶时空金", description: "进入任意一分钟老板世界。", icon: "🏁" },
  { id: "first_mark", name: "因果留痕", description: "记录第一条老板因果印记。", icon: "📜" },
  { id: "three_marks", name: "三连败家", description: "单局记录至少 3 条因果印记。", icon: "💸" },
  { id: "custom_action", name: "不走寻常路", description: "提交一次自定义荒诞动作。", icon: "🧠" },
  { id: "all_nodes", name: "量子清洁工", description: "把当前世界的所有因果节点探索完毕。", icon: "🧹" },
  { id: "early_end", name: "提前看透浮名", description: "主动或因时空坍缩提前结算此生。", icon: "⏱️" },
  { id: "last_second", name: "压哨董事长", description: "在剩余 10 秒以内结算。", icon: "🔥" },
  { id: "first_ending", name: "人生传承开馆", description: "收集第一张结局卡。", icon: "🏛️" },
  { id: "vip_unlock", name: "零元尊享大王", description: "激活永久 VIP 特许。", icon: "👑" },
  { id: "rewind", name: "时间河流偷渡者", description: "关注后开启一次时光机回溯。", icon: "🌀" }
] as const;

const EASTER_EGG_DEFS = [
  { id: "logo_combo", name: "老板暗门", description: "连续点击顶部 Logo 5 次。", icon: "🕹️" },
  { id: "wang_duoyu_money", name: "西虹市隐藏合同", description: "商业构想命中王多鱼式离谱关键词。", icon: "🥒" },
  { id: "lucky_timer", name: "6.6 秒玄学", description: "倒计时滑入 6.6 秒以内。", icon: "🎲" },
  { id: "dog_or_button", name: "不要惹按钮和狗", description: "触发狗、按钮或咖啡等危险因果锚点。", icon: "🚨" },
  { id: "archive_hoarder", name: "命运卡牌囤积癖", description: "人生传承馆累计收集 3 张结局卡。", icon: "🃏" }
] as const;

type AchievementId = typeof ACHIEVEMENT_DEFS[number]["id"];
type EasterEggId = typeof EASTER_EGG_DEFS[number]["id"];
type UnlockToast = {
  kind: "achievement" | "easter";
  icon: string;
  name: string;
  description: string;
};

const readStoredIds = (key: string): string[] => {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [];
  }
};

const normalizeTimeDelta = (value: unknown): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(0, Math.trunc(parsed));
};

const clampTimer = (value: number): number => {
  return parseFloat(Math.min(60, Math.max(0, value)).toFixed(1));
};

export default function App() {
  // Game States
  const [gameState, setGameState] = useState<"lobby" | "loading" | "playing" | "ending" | "follow_unlock">("lobby");
  
  // Custom or pre-selected choices
  const [selectedPreset, setSelectedPreset] = useState<any>(PRESETS[0]);
  const [allMaps, setAllMaps] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapCategory, setMapCategory] = useState<"featured" | "custom">("featured");
  const [customIdentityInput, setCustomIdentityInput] = useState<string>("");
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [settingsProvider, setSettingsProvider] = useState<"siliconflow" | "minimax" | "deepseek">("siliconflow");
  const [sfApiKey, setSfApiKey] = useState<string>("");
  const [sfModel, setSfModel] = useState<string>("");
  const [mmApiKey, setMmApiKey] = useState<string>("");
  const [mmModel, setMmModel] = useState<string>("");
  const [dsApiKey, setDsApiKey] = useState<string>("");
  const [dsModel, setDsModel] = useState<string>("");
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  
  // Lobby Subtabs
  const [activeTab, setActiveTab] = useState<"normal" | "presets" | "album" | "daily" | "vip" | "achievements">("normal");
  const [isVip, setIsVip] = useState<boolean>(false);
  const [showFollowModal, setShowFollowModal] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [loadingText, setLoadingText] = useState<string>("时空波阵预热中...");
  const [wangDuoyuConcept, setWangDuoyuConcept] = useState<string>("");
  const [enableThinking, setEnableThinking] = useState<boolean>(false);
  const [localMode, setLocalMode] = useState<boolean>(false);
  const [isStreamingConcept, setIsStreamingConcept] = useState<boolean>(false);

  // Game Play States
  const [worldScenario, setWorldScenario] = useState<WorldScenario | null>(null);
  const [playerPos, setPlayerPos] = useState<Position>({ x: 3, y: 3 });
  const [timer, setTimer] = useState<number>(60.00);
  const [lastInteractedEntity, setLastInteractedEntity] = useState<{ type: "NPC" | "Item", id: string, name: string } | null>(null);
  const [interactionResult, setInteractionResult] = useState<InteractionResult | null>(null);
  const [entityStageMap, setEntityStageMap] = useState<Record<string, number>>({});
  const [actionSequence, setActionSequence] = useState<string[]>([]);
  
  // AI query loading triggers
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [customActionValue, setCustomActionValue] = useState<string>("");
  const [historyLog, setHistoryLog] = useState<Array<{ entity: string, action: string, outcome: string }>>([]);
  const [currentDialogueHistory, setCurrentDialogueHistory] = useState<string[]>([]);
  
  // Final Ending Card
  const [endingResult, setEndingResult] = useState<EndingResult | null>(null);

  // Stored endings in localStorage
  const [savedEndings, setSavedEndings] = useState<SavedLife[]>([]);
  const [unlockedAchievementIds, setUnlockedAchievementIds] = useState<string[]>([]);
  const [unlockedEasterEggIds, setUnlockedEasterEggIds] = useState<string[]>([]);
  const [unlockToast, setUnlockToast] = useState<UnlockToast | null>(null);
  
  // UI audio state
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [systemAlertMessage, setSystemAlertMessage] = useState<string | null>(null);

  // Ticker text cycles
  const [tickerIndex, setTickerIndex] = useState<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const logoClickCountRef = useRef<number>(0);
  const logoClickTimerRef = useRef<number | null>(null);

  const getAbortSignal = (): AbortSignal => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    return controller.signal;
  };

  const showUnlockToast = (toast: UnlockToast) => {
    setUnlockToast(toast);
    window.setTimeout(() => {
      setUnlockToast(current => (current?.name === toast.name ? null : current));
    }, 4200);
  };

  const unlockAchievement = (id: AchievementId) => {
    const def = ACHIEVEMENT_DEFS.find(item => item.id === id);
    if (!def) return;
    setUnlockedAchievementIds(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      window.localStorage.setItem("boss_minute_achievements", JSON.stringify(next));
      showUnlockToast({ kind: "achievement", icon: def.icon, name: def.name, description: def.description });
      audio.playSound("bling");
      return next;
    });
  };

  const unlockEasterEgg = (id: EasterEggId) => {
    const def = EASTER_EGG_DEFS.find(item => item.id === id);
    if (!def) return;
    setUnlockedEasterEggIds(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      window.localStorage.setItem("boss_minute_easter_eggs", JSON.stringify(next));
      showUnlockToast({ kind: "easter", icon: def.icon, name: def.name, description: def.description });
      audio.playSound("bling");
      return next;
    });
  };

  const appendHistoryLog = (entry: { entity: string, action: string, outcome: string }) => {
    setHistoryLog(prev => {
      const next = [...prev, entry];
      unlockAchievement("first_mark");
      if (next.length >= 3) {
        unlockAchievement("three_marks");
      }
      return next;
    });
  };

  const handleLogoClick = () => {
    handleBackToLobby();
    logoClickCountRef.current += 1;

    if (logoClickTimerRef.current) {
      window.clearTimeout(logoClickTimerRef.current);
    }
    logoClickTimerRef.current = window.setTimeout(() => {
      logoClickCountRef.current = 0;
    }, 1800);

    if (logoClickCountRef.current >= 5) {
      logoClickCountRef.current = 0;
      unlockEasterEgg("logo_combo");
      setSystemAlertMessage("🕹️ 老板暗门已开启：顶部 Logo 里确实藏着一个偷偷摸摸的像素开关。");
    }
  };
  
  // Check if all storyline stages for all NPCs and Items have been completed
  const checkIfAllExhausted = (currentStageMap: Record<string, number>): boolean => {
    if (!worldScenario) return false;
    const hasNpcStorylines = worldScenario.npcs.some(npc => npc.storyline && npc.storyline.length > 0);
    const hasItemStorylines = worldScenario.items.some(item => item.storyline && item.storyline.length > 0);
    if (!hasNpcStorylines && !hasItemStorylines) return false;

    const npcExhausted = worldScenario.npcs.every(npc => {
      if (!npc.storyline || npc.storyline.length === 0) return true;
      const stage = currentStageMap[npc.id] || 0;
      return stage >= npc.storyline.length;
    });

    const itemExhausted = worldScenario.items.every(itm => {
      if (!itm.storyline || itm.storyline.length === 0) return true;
      const stage = currentStageMap[itm.id] || 0;
      return stage >= itm.storyline.length;
    });

    return npcExhausted && itemExhausted;
  };

  // Fetch local collection and config checks
  useEffect(() => {
    setHasApiKey(hasSiliconFlowKey());

    // Initialize playable maps from local JSON files
    const scenarios = getAllAvailableScenarios().map((s) => ({
      type: s.id,
      name: s.identity,
      icon: s.icon,
      difficulty: s.difficulty,
      description: s.description,
      isFeatured: s.isFeatured,
      scenario: s.scenario
    }));
    setAllMaps(scenarios);
    const defaultFeatured = scenarios.find(m => m.isFeatured);
    if (defaultFeatured) {
      setSelectedPreset(defaultFeatured);
    }
    
    // Load API settings into local React states (only load raw user overrides to avoid exposing env keys)
    const stored = getRawStoredSettings();
    setSettingsProvider(stored.provider || "siliconflow");
    setSfApiKey(stored.siliconFlowApiKey || "");
    setSfModel(stored.siliconFlowModel || "");
    setMmApiKey(stored.minimaxApiKey || "");
    setMmModel(stored.minimaxModel || "");
    setDsApiKey(stored.deepseekApiKey || "");
    setDsModel(stored.deepseekModel || "");
    setEnableThinking(stored.enableThinking !== undefined ? stored.enableThinking : false);
    setLocalMode(stored.localMode || false);

    // Load saved ending cards
    const cached = localStorage.getItem("boss_minute_endings");
    if (cached) {
      try {
        setSavedEndings(JSON.parse(cached));
      } catch (e) {
        setSavedEndings([]);
      }
    }
    setUnlockedAchievementIds(readStoredIds("boss_minute_achievements"));
    setUnlockedEasterEggIds(readStoredIds("boss_minute_easter_eggs"));

    // Ticker timer interval
    const tInterval = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % METADATA_TICKERS.length);
    }, 6000);

    return () => {
      clearInterval(tInterval);
      if (logoClickTimerRef.current) {
        window.clearTimeout(logoClickTimerRef.current);
      }
      abortControllerRef.current?.abort();
    };
  }, []);

  // Timer Countdown loop during gameplay (stops if dialogue or ad triggers)
  useEffect(() => {
    if (gameState !== "playing" || interactionResult) return;

    const timerInterval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 0.1) {
          clearInterval(timerInterval);
          handleTriggerEnding();
          return 0;
        }
        return parseFloat((prev - 0.1).toFixed(1));
      });
    }, 100);

    return () => clearInterval(timerInterval);
  }, [gameState, interactionResult]);

  useEffect(() => {
    if (gameState === "playing" && timer > 0 && timer <= 6.6) {
      unlockEasterEgg("lucky_timer");
    }
  }, [gameState, timer]);

  // Handle Mute Toggle
  const toggleMute = () => {
    audio.isMuted = !isAudioMuted;
    setIsAudioMuted(!isAudioMuted);
    if (!isAudioMuted) {
      audio.stopBGM();
    } else {
      if (worldScenario) {
        audio.playBGM(worldScenario.ambientMusic);
      } else {
        audio.playBGM("corporate-jazz");
      }
    }
  };

  // Launch pre-game loading with funny hints
  // Handler for the lobby start button – if no input, stream a concept first
  const handleLobbyStartClick = () => {
    const isNormalTab = activeTab === "normal";
    const currentInput = isNormalTab ? wangDuoyuConcept : customIdentityInput;
    const hasInput = currentInput.trim().length > 0;

    if (hasInput) {
      handleStartGame();
      return;
    }

    // No input: stream a short random concept before entering the game.
    // If that optional request is unavailable, keep the start flow moving.
    setIsStreamingConcept(true);
    const setter = isNormalTab ? setWangDuoyuConcept : setCustomIdentityInput;
    setter("");
    let accumulated = "";
    let settled = false;
    let cancelStream = () => {};

    const startWithConcept = (concept: string, useFlashOverrides: boolean) => {
      setter(concept);
      setIsStreamingConcept(false);
      const activeProvider = getApiSettings().provider;
      const overrideModel = useFlashOverrides && activeProvider === "siliconflow" ? FLASH_MODEL : undefined;
      const overrideThinking = useFlashOverrides && activeProvider === "siliconflow" ? false : undefined;
      handleStartGame(undefined, undefined, concept, overrideModel, overrideThinking);
    };

    if (!hasSiliconFlowKey()) {
      setSystemAlertMessage("⚠️ 未配置可用 API Key，已使用默认构想直接进入本地随机世界。");
      startWithConcept(DEFAULT_RANDOM_CONCEPT, false);
      return;
    }

    const streamTimeout = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      cancelStream();
      setSystemAlertMessage("⚠️ 随机构想生成超时，已使用默认构想继续进入世界。");
      startWithConcept(accumulated.trim() || DEFAULT_RANDOM_CONCEPT, false);
    }, 8000);

    cancelStream = streamBusinessConcept(
      (chunk) => {
        if (settled) return;
        accumulated += chunk;
        setter(accumulated);
      },
      (fullText) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(streamTimeout);
        startWithConcept(fullText.trim() || DEFAULT_RANDOM_CONCEPT, true);
      },
      (err) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(streamTimeout);
        setSystemAlertMessage(`⚠️ 流式生成失败：${err.message} 已使用默认构想继续进入世界。`);
        startWithConcept(accumulated.trim() || DEFAULT_RANDOM_CONCEPT, false);
      }
    );

    // Safety: cancel stream if component unmounts
    return cancelStream;
  };

  const handleStartGame = async (dailyPrompt?: string, dailyType?: BossIdentityType, forcedConcept?: string, overrideModel?: string, overrideEnableThinking?: boolean) => {
    // Play entry bling
    audio.playSound("bling");
    setGameState("loading");
    setLoadingProgress(0);
    setLoadingText("🌌 [对流层] 正在定位高维时空坐标网络...");
    setTimer(60.0);
    setHistoryLog([]);
    setCurrentDialogueHistory([]);
    setLastInteractedEntity(null);
    setInteractionResult(null);
    setEntityStageMap({});
    setActionSequence([]);
    unlockAchievement("first_world");

    const LOADING_HINTS = [
      { p: 0, text: "🌌 [对流层] 正在定位高维时空坐标网络..." },
      { p: 15, text: "🐕 [特工狗] 正在唤醒外星特工狗，调试赛博哈士奇声波天线..." },
      { p: 35, text: "☕ [漏电咖啡] 正在给黄金粒子办公咖啡机上水充电..." },
      { p: 55, text: "💸 [神豪印钞] 正在搬运北极冰川和百亿对赌资金打包装箱..." },
      { p: 75, text: "⏳ [时空天线] 正在向平行时空管理局索要特许败家令，折叠维度中..." },
      { p: 90, text: "🚀 [量子跳跃] 宇宙线起航！时空对流风暴已稳定，即将跳入目标世界..." }
    ];

    let currentProg = 0;
    const progressTimer = setInterval(() => {
      currentProg += (99 - currentProg) * 0.05;
      const rounded = Math.min(99, Math.trunc(currentProg));
      setLoadingProgress(rounded);
      
      const matched = [...LOADING_HINTS].reverse().find(h => rounded >= h.p);
      if (matched) {
        setLoadingText(matched.text);
      }
    }, 150);

    const isNormal = activeTab === "normal" && !dailyType;
    let chosenIdentity = "";
    let finalPrompt = "";

    if (isNormal) {
      const NORMAL_MOMENTS = [
        { id: "MEETING", title: "董事会开会瞬间" },
        { id: "SKI", title: "滑雪绝境" },
        { id: "TOILET", title: "上厕所停水无纸" },
        { id: "LAYOFF", title: "给刁难骨干发裁员通知" },
        { id: "WANG_DUOYU", title: "继承二爷遗产限时败光三百万" }
      ];
      const randMoment = NORMAL_MOMENTS[Math.floor(Math.random() * NORMAL_MOMENTS.length)];
      chosenIdentity = randMoment.id;
      const conceptToUse = forcedConcept ?? wangDuoyuConcept.trim();
      if (/(北极|沙特|减肥|放电|三百万|王多鱼|西虹市)/.test(conceptToUse)) {
        unlockEasterEgg("wang_duoyu_money");
      }
      finalPrompt = `你是普通人王多鱼，大发横财需要败光三百万！当前的随机时间瞬间落在：『${randMoment.title}』，你的创业败家商业构思是：${conceptToUse || '把北极融化的冰用游艇运到沙特卖，或者推行减肥放电脂肪险'}`;
    } else {
      chosenIdentity = dailyType || (selectedPreset?.type || "CEO");
      finalPrompt = forcedConcept ?? (dailyPrompt || customIdentityInput);
    }

    window.localStorage.setItem("currentIdentityType", chosenIdentity);

    try {
      const signal = getAbortSignal();
      const worldData = await generateWorld(
        chosenIdentity,
        finalPrompt,
        overrideModel,
        overrideEnableThinking,
        signal
      );
      
      clearInterval(progressTimer);
      setLoadingProgress(100);
      setLoadingText("✨ [大功告成] 维度构建圆满咬合！神豪身份已降维着陆！");

      setTimeout(() => {
        setWorldScenario(worldData);
        setPlayerPos(worldData.playerPosition);
        setGameState("playing");
        // Play thematic BGM synthesiser
        audio.playBGM(worldData.ambientMusic || "corporate-jazz");
      }, 400);
    } catch (error: any) {
      clearInterval(progressTimer);
      setGameState("lobby");
      setSystemAlertMessage(error.message || "SiliconFlow 服务暂时不可用，请检查 GitHub Actions Secret 或本地 VITE_SILICONFLOW_API_KEY。");
      audio.playSound("error");
    }
  };

  // Interact touch on world element (triggered from map movement)
  const handleInteractionDetected = async (type: "NPC" | "Item", id: string, name: string) => {
    if (isAiLoading) return;
    setIsAiLoading(true);

    const cueMap: Record<string, string> = {
      secretary: "bling",
      dog: "bark",
      butler: "drink",
      rob: "alert",
      coffee: "drink",
      pen: "scifi_laser",
      button: "explosion"
    };

    const cue = cueMap[id] || "alert";
    audio.playSound(cue);

    setLastInteractedEntity({ type, id, name });
    if (/(dog|button|coffee|犬|狗|按钮|咖啡)/i.test(`${id} ${name}`)) {
      unlockEasterEgg("dog_or_button");
    }

    try {
      // Find local pre-generated storyline
      const npc = worldScenario?.npcs?.find(n => n.id === id);
      const item = worldScenario?.items?.find(it => it.id === id);
      const entity = npc || item;

      const shouldTryAi = isVip && hasApiKey && !localMode;

      if (shouldTryAi && entity) {
        const stageIndex = entityStageMap[id] || 0;
        const maxStages = (entity.storyline && entity.storyline.length > 0) ? entity.storyline.length : 3;

        if (stageIndex >= maxStages) {
          const allExhausted = checkIfAllExhausted(entityStageMap);
          if (allExhausted) {
            setInteractionResult({
              text: `【时空维度闭合】「${name}」以及此处的其他因果极点已经全部通盘探索完毕（阶段均已完美收官），量子宇宙已没有更深层的随机选项。时光不待，直接开始最终极的时空评级与成就清算吧！`,
              options: [
                { label: "👑 进行终极神豪财富与宿命评估", action: "trigger_ending_via_exhaustion" }
              ],
              allowsFreeInput: false,
              soundHint: "alert",
              timeDelta: 0,
              isEarlyEnd: false
            });
          } else {
            setInteractionResult({
              text: `【时空波动稳定】「${name}」背后的因果世界线已被彻底固化（${maxStages}个阶段已全部完美收官）。去寻找其他的因果锚点吧，时间一分一秒正在流逝！`,
              options: [
                { label: "👌 完成因果 (继续探索)", action: "close_after_advance" }
              ],
              allowsFreeInput: false,
              soundHint: "bling",
              timeDelta: 0,
              isEarlyEnd: false
            });
          }
          setIsAiLoading(false);
          return;
        }

        try {
          setInteractionResult({
            text: `正在与「${name}」对接时空频率，推演因果波动中...`,
            options: [],
            allowsFreeInput: false,
            soundHint: "",
            timeDelta: 0,
            isEarlyEnd: false
          });

          const parsedOfflineStep = (entity.storyline && entity.storyline.length > 0)
            ? entity.storyline[stageIndex]
            : null;

          const contextGreeting = parsedOfflineStep
            ? parsedOfflineStep.text
            : (type === "NPC" ? (entity as NPC).dialogue : (entity as Item).description) || "空气中回荡起时空乱流的鸣响...";

          const signal = getAbortSignal();
          const data = await generateInteraction({
            identity: worldScenario?.identity,
            theme: worldScenario?.theme,
            targetType: type,
            targetName: name,
            targetId: id,
            dialogueHistory: currentDialogueHistory,
            playerAction: currentDialogueHistory.length === 0
              ? `First approach (实体初始情境: "${contextGreeting}")`
              : currentDialogueHistory[currentDialogueHistory.length - 1]
          }, signal);

          let finalOptions = data.options.map((opt: any, idx: number) => ({
            label: opt.label,
            action: opt.action || `option_${idx}`
          }));

          if (finalOptions.length === 0 && !data.allowsFreeInput) {
            finalOptions.push({
              label: "👌 完成因果 (继续探索)",
              action: "close_and_advance_stage"
            });
          }

          setInteractionResult({
            text: currentDialogueHistory.length === 0
              ? `🎬 【${name}】：${contextGreeting}\n\n${data.text}`
              : data.text,
            options: finalOptions,
            allowsFreeInput: !!data.allowsFreeInput,
            soundHint: data.soundHint || "",
            timeDelta: 0,
            isEarlyEnd: !!data.isEarlyEnd
          });

          if (data.soundHint) {
            audio.playSound(data.soundHint);
          }

          if (data.isEarlyEnd) {
            setTimeout(() => {
              handleTriggerEnding();
            }, 3500);
          }

          setIsAiLoading(false);
          return;
        } catch (err) {
          console.warn("AI dynamic dialogue generation failed, falling back to local storyline:", err);
        }
      }

      if (entity && entity.storyline && entity.storyline.length > 0) {
        const stageIndex = entityStageMap[id] || 0;
        if (stageIndex < entity.storyline.length) {
          const step = entity.storyline[stageIndex];
          let stepOptions = step.options.map((opt: any, idx: number) => ({
            label: opt.label,
            action: `option_${idx}`
          }));

          if (stepOptions.length === 0 && !step.allowsFreeInput) {
            stepOptions.push({
              label: "👌 完成因果 (继续探索)",
              action: "close_and_advance_stage"
            });
          }

          setInteractionResult({
            text: step.text,
            options: stepOptions,
            allowsFreeInput: !!step.allowsFreeInput,
            soundHint: "",
            timeDelta: 0,
            isEarlyEnd: false
          });
          setIsAiLoading(false);
          return;
        } else {
          // Exhausted stages. Check if all other entities are also exhausted!
          const allExhausted = checkIfAllExhausted(entityStageMap);
          if (allExhausted) {
            setInteractionResult({
              text: `【时空维度闭合】「${name}」以及此处的其他因果极点已经全部通盘探索完毕（阶段均已完美收官），量子宇宙已没有更深层的随机选项。时光不待，直接开始最终极的时空评级与成就清算吧！`,
              options: [
                { label: "👑 进行终极神豪财富与宿命评估", action: "trigger_ending_via_exhaustion" }
              ],
              allowsFreeInput: false,
              soundHint: "alert",
              timeDelta: 0,
              isEarlyEnd: false
            });
          } else {
            setInteractionResult({
              text: `【时空波动稳定】「${name}」背后的因果世界线已被彻底固化（3个阶段已全部完美收官）。去寻找其他的因果锚点吧，时间一分一秒正在流逝！`,
              options: [
                { label: "👌 完成因果 (继续探索)", action: "close_after_advance" }
              ],
              allowsFreeInput: false,
              soundHint: "bling",
              timeDelta: 0,
              isEarlyEnd: false
            });
          }
          setIsAiLoading(false);
          return;
        }
      } else if (entity && (!entity.storyline || entity.storyline.length === 0)) {
        // AI dynamic lazy-loading path for entities without pre-generated storyline
        const stageIndex = entityStageMap[id] || 0;
        if (stageIndex >= 3) {
          const allExhausted = checkIfAllExhausted(entityStageMap);
          if (allExhausted) {
            setInteractionResult({
              text: `【时空维度闭合】「${name}」以及此处的其他因果极点已经全部通盘探索完毕（阶段均已完美收官），量子宇宙已没有更深层的随机选项。时光不待，直接开始最终极的时空评级与成就清算吧！`,
              options: [
                { label: "👑 进行终极神豪财富与宿命评估", action: "trigger_ending_via_exhaustion" }
              ],
              allowsFreeInput: false,
              soundHint: "alert",
              timeDelta: 0,
              isEarlyEnd: false
            });
          } else {
            setInteractionResult({
              text: `【时空波动稳定】「${name}」背后的因果世界线已被彻底固化（3个阶段已全部完美收官）。去寻找其他的因果锚点吧，时间一分一秒正在流逝！`,
              options: [
                { label: "👌 完成因果 (继续探索)", action: "close_after_advance" }
              ],
              allowsFreeInput: false,
              soundHint: "bling",
              timeDelta: 0,
              isEarlyEnd: false
            });
          }
          setIsAiLoading(false);
          return;
        }

        setInteractionResult({
          text: `正在与「${name}」进行量子波动咬合，加载背景构想...`,
          options: [],
          allowsFreeInput: false,
          soundHint: "",
          timeDelta: 0,
          isEarlyEnd: false
        });

        // Use pre-saved greeting dialogue/description from the model as the starting point
        const greetingText = (type === "NPC"
          ? (entity as NPC).dialogue
          : (entity as Item).description) || "空气中回荡起时空乱流的鸣响...";

        // Fetch options and dialogue progression from the interaction generation API
        const signal = getAbortSignal();
        const data = await generateInteraction({
          identity: worldScenario?.identity,
          theme: worldScenario?.theme,
          targetType: type,
          targetName: name,
          targetId: id,
          dialogueHistory: currentDialogueHistory,
          playerAction: `First approach (实体初次见面台词: "${greetingText}")`
        }, signal);

        let finalOptions = data.options.map((opt: any, idx: number) => ({
          label: opt.label,
          action: opt.action || `option_${idx}`
        }));

        if (finalOptions.length === 0 && !data.allowsFreeInput) {
          finalOptions.push({
            label: "👌 完成因果 (继续探索)",
            action: "close_and_advance_stage"
          });
        }

        setInteractionResult({
          text: `🎬 【${name}】：${greetingText}\n\n${data.text}`,
          options: finalOptions,
          allowsFreeInput: !!data.allowsFreeInput,
          soundHint: data.soundHint || "",
          timeDelta: 0,
          isEarlyEnd: !!data.isEarlyEnd
        });

        if (data.soundHint) {
          audio.playSound(data.soundHint);
        }

        if (data.isEarlyEnd) {
          setTimeout(() => {
            handleTriggerEnding();
          }, 3500);
        }
      }
    } catch (e) {
      setInteractionResult({
        text: `【蝴蝶效应激荡】你走向了 "${name}"，瞬间耳边回荡起高维时空的震动：你的钱太多了，这里似乎一切皆可购买！`,
        options: [
          { label: "拿支黄金支票把这个东西直接买下", action: "buy" },
          { label: "微服私访完毕，高贵退下", action: "exit" }
        ],
        allowsFreeInput: true,
        soundHint: "bling",
        timeDelta: -5,
        isEarlyEnd: false
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  // Choose branch option or type free text action
  const handleResolveAction = async (chosenActionText: string, actionKey?: string) => {
    if (isAiLoading || !lastInteractedEntity || !worldScenario) return;
    setIsAiLoading(true);

    audio.playSound("bling");

    const currentText = chosenActionText;
    setCustomActionValue("");

    const stageIndex = entityStageMap[lastInteractedEntity.id] || 0;

    // 1. Close overlay or trigger settlement
    if (actionKey === "close_and_advance_stage") {
      setInteractionResult(null);
      if (lastInteractedEntity) {
        const entityId = lastInteractedEntity.id;
        const currentStage = entityStageMap[entityId] || 0;
        setEntityStageMap(prev => ({
          ...prev,
          [entityId]: currentStage + 1
        }));
      }
      setLastInteractedEntity(null);
      setIsAiLoading(false);
      return;
    }

    if (actionKey === "close_after_advance") {
      setInteractionResult(null);
      setLastInteractedEntity(null);
      setIsAiLoading(false);
      return;
    }

    if (actionKey === "trigger_ending_via_exhaustion") {
      setInteractionResult(null);
      setLastInteractedEntity(null);
      setIsAiLoading(false);
      unlockAchievement("all_nodes");
      handleTriggerEnding();
      return;
    }

    if (actionKey === "trigger_ending_via_early_end") {
      setInteractionResult(null);
      setLastInteractedEntity(null);
      setIsAiLoading(false);
      unlockAchievement("early_end");
      handleTriggerEnding();
      return;
    }

    if (actionKey === "bailout") {
      setTimer(t => clampTimer(t - Math.max(15, t * 0.5)));
      appendHistoryLog({
        entity: lastInteractedEntity.name,
        action: "钞能力救赎",
        outcome: "你用一笔看不清位数的时空过路费买下了继续探索的资格，但倒计时被狠狠切走一大截。"
      });
      setInteractionResult(null);
      setLastInteractedEntity(null);
      setIsAiLoading(false);
      return;
    }

    // 2. Custom text input
    if (actionKey === "custom") {
      try {
        const signal = getAbortSignal();
        const data = await generateInteraction({
          identity: worldScenario.identity,
          theme: worldScenario.theme,
          targetType: lastInteractedEntity.type,
          targetName: lastInteractedEntity.name,
          targetId: lastInteractedEntity.id,
          dialogueHistory: [...currentDialogueHistory, `Action: ${currentText}`],
          playerAction: currentText
        }, signal);

        unlockAchievement("custom_action");
        appendHistoryLog({
          entity: lastInteractedEntity.name,
          action: currentText,
          outcome: data.text
        });

        const timeDelta = normalizeTimeDelta(data.timeDelta);
        if (timeDelta) {
          setTimer(t => {
            return clampTimer(t + timeDelta);
          });
        }

        const nextStageMap = {
          ...entityStageMap,
          [lastInteractedEntity.id]: stageIndex + 1
        };
        const allCompleted = checkIfAllExhausted(nextStageMap);

        setInteractionResult({
          text: `👉 【你自定义动作为】：${currentText}\n\n🎬 【时空后果】：${data.text}`,
          options: allCompleted ? [
            { label: "👑 精选选项已全部探索，直接开始神豪宿命评估结算", action: "trigger_ending_via_exhaustion" }
          ] : [
            { label: "👌 完成因果 (继续探索)", action: "close_after_advance" }
          ],
          allowsFreeInput: false,
          soundHint: data.soundHint || "bling",
          timeDelta,
          isEarlyEnd: !!data.isEarlyEnd
        });

        setEntityStageMap(nextStageMap);

        setCurrentDialogueHistory(h => [...h, `你选择: ${currentText}`, `反馈: ${data.text}`]);

        if (data.soundHint) {
          audio.playSound(data.soundHint);
        }

        if (data.isEarlyEnd) {
          setTimeout(() => {
            handleTriggerEnding();
          }, 3500);
        }
      } catch (e) {
        appendHistoryLog({
          entity: lastInteractedEntity.name,
          action: currentText,
          outcome: "由于时空扭曲风暴过强，该条因果线在一阵奢华金光中自我重组归于平静。"
        });
        setInteractionResult(null);
        setLastInteractedEntity(null);
      } finally {
        setIsAiLoading(false);
      }
      return;
    }

    // 3. Local pre-generated options OR dynamic AI lazy-loaded options
    try {
      const npc = worldScenario.npcs.find(n => n.id === lastInteractedEntity.id);
      const item = worldScenario.items.find(i => i.id === lastInteractedEntity.id);
      const entity = npc || item;

      const shouldTryAi = isVip && hasApiKey && !localMode;

      if (shouldTryAi && entity) {
        const maxStages = (entity.storyline && entity.storyline.length > 0) ? entity.storyline.length : 3;
        const isLastStep = stageIndex + 1 >= maxStages;

        try {
          const signal = getAbortSignal();
          const data = await generateInteraction({
            identity: worldScenario.identity,
            theme: worldScenario.theme,
            targetType: lastInteractedEntity.type,
            targetName: lastInteractedEntity.name,
            targetId: lastInteractedEntity.id,
            dialogueHistory: [...currentDialogueHistory, `选择: ${currentText}`],
            playerAction: currentText
          }, signal);

          const finalActionId = data.options?.[0]?.action || `action_${lastInteractedEntity.id}_${stageIndex}`;
          setActionSequence(prev => [...prev, finalActionId]);

          const timeDelta = normalizeTimeDelta(data.timeDelta);
          if (timeDelta) {
            setTimer(t => {
              return clampTimer(t + timeDelta);
            });
          }

          appendHistoryLog({
            entity: lastInteractedEntity.name,
            action: currentText,
            outcome: data.text
          });

          const nextStageMap = {
            ...entityStageMap,
            [lastInteractedEntity.id]: stageIndex + 1
          };
          const allCompleted = checkIfAllExhausted(nextStageMap) || isLastStep;

          setInteractionResult({
            text: `👉 【你选择】：${currentText}\n\n🎬 【时空后果】：${data.text}`,
            options: allCompleted ? [
              { label: "👑 精选选项已全部探索，直接开始神豪宿命评估结算", action: "trigger_ending_via_exhaustion" }
            ] : [
              { label: "👌 完成因果 (继续探索)", action: "close_after_advance" }
            ],
            allowsFreeInput: !isLastStep && !!data.allowsFreeInput,
            soundHint: data.soundHint || "bling",
            timeDelta,
            isEarlyEnd: !!data.isEarlyEnd
          });

          setEntityStageMap(nextStageMap);

          setCurrentDialogueHistory(h => [...h, `你选择: ${currentText}`, `反馈: ${data.text}`]);

          if (data.soundHint) {
            audio.playSound(data.soundHint);
          }

          if (data.isEarlyEnd) {
            setTimeout(() => {
              handleTriggerEnding();
            }, 3500);
          }

          setIsAiLoading(false);
          return;
        } catch (err) {
          console.warn("AI dynamic action resolution failed, falling back to local storyline resolution:", err);
        }
      }

      if (entity && entity.storyline && stageIndex < entity.storyline.length) {
        const step = entity.storyline[stageIndex];
        const optIndex = actionKey && actionKey.startsWith("option_")
          ? parseInt(actionKey.split("_")[1])
          : step.options.findIndex((o: any) => o.label === chosenActionText);

        const opt = step.options[optIndex >= 0 ? optIndex : 0];

        // Track choices for predetermined sequence and compound endings
        if (opt.actionId) {
          setActionSequence(prev => [...prev, opt.actionId]);
        }

        const timeDelta = normalizeTimeDelta(opt.timeDelta);
        if (timeDelta) {
          setTimer(t => {
            return clampTimer(t + timeDelta);
          });
        }

        if (opt.soundHint) {
          audio.playSound(opt.soundHint);
        }

        appendHistoryLog({
          entity: lastInteractedEntity.name,
          action: opt.label,
          outcome: opt.outcomeText
        });

        let targetNextStage = stageIndex + 1;
        if (opt.nextStage !== undefined) {
          if (typeof opt.nextStage === 'number') {
            targetNextStage = opt.nextStage === -1 ? entity.storyline.length : opt.nextStage;
          } else if (typeof opt.nextStage === 'string') {
            if (opt.nextStage.startsWith('ending') || opt.nextStage.startsWith('end')) {
              targetNextStage = entity.storyline.length;
            } else {
              const matchedIdx = entity.storyline.findIndex(s => s.id === opt.nextStage);
              if (matchedIdx >= 0) {
                targetNextStage = matchedIdx;
              } else {
                const numMatch = opt.nextStage.match(/\d+/);
                if (numMatch) {
                  const stageNum = parseInt(numMatch[0]);
                  const stageMatchedIdx = entity.storyline.findIndex(s => {
                    const sNumMatch = s.id?.match(/\d+/);
                    return sNumMatch ? parseInt(sNumMatch[0]) === stageNum : false;
                  });
                  if (stageMatchedIdx >= 0) {
                    targetNextStage = stageMatchedIdx;
                  } else {
                    targetNextStage = stageIndex + 1;
                  }
                } else {
                  targetNextStage = stageIndex + 1;
                }
              }
            }
          }
        }
        const nextStageMap = {
          ...entityStageMap,
          [lastInteractedEntity.id]: targetNextStage
        };
        const allCompleted = checkIfAllExhausted(nextStageMap);

        setInteractionResult({
          text: `👉 【你选择】：${opt.label}\n\n🎬 【时空后果】：${opt.outcomeText}`,
          options: allCompleted ? [
            { label: "👑 精选选项已全部探索，直接开始神豪宿命评估结算", action: "trigger_ending_via_exhaustion" }
          ] : [
            { label: "👌 完成因果 (继续探索)", action: "close_after_advance" }
          ],
          allowsFreeInput: false,
          soundHint: opt.soundHint || "bling",
          timeDelta,
          isEarlyEnd: !!opt.isEarlyEnd
        });

        setEntityStageMap(nextStageMap);

        setCurrentDialogueHistory(h => [...h, `你选择: ${opt.label}`, `反馈: ${opt.outcomeText}`]);

        if (opt.isEarlyEnd) {
          setTimeout(() => {
            handleTriggerEnding();
          }, 3500);
        }
      } else if (entity && (!entity.storyline || entity.storyline.length === 0) && stageIndex < 3) {
        // AI dynamic lazyloading chain for entities without storylines
        const isLastStep = stageIndex + 1 >= 3;

        const signal = getAbortSignal();
        const data = await generateInteraction({
          identity: worldScenario.identity,
          theme: worldScenario.theme,
          targetType: lastInteractedEntity.type,
          targetName: lastInteractedEntity.name,
          targetId: lastInteractedEntity.id,
          dialogueHistory: [...currentDialogueHistory, `选择: ${currentText}`],
          playerAction: currentText
        }, signal);

        const finalActionId = data.options?.[0]?.action || `action_${lastInteractedEntity.id}_${stageIndex}`;
        setActionSequence(prev => [...prev, finalActionId]);

        const timeDelta = normalizeTimeDelta(data.timeDelta);
        if (timeDelta) {
          setTimer(t => {
            return clampTimer(t + timeDelta);
          });
        }

        appendHistoryLog({
          entity: lastInteractedEntity.name,
          action: currentText,
          outcome: data.text
        });

        const nextStageMap = {
          ...entityStageMap,
          [lastInteractedEntity.id]: stageIndex + 1
        };
        const allCompleted = checkIfAllExhausted(nextStageMap) || isLastStep;

        setInteractionResult({
          text: `👉 【你选择】：${currentText}\n\n🎬 【时空后果】：${data.text}`,
          options: allCompleted ? [
            { label: "👑 精选选项已全部探索，直接开始神豪宿命评估结算", action: "trigger_ending_via_exhaustion" }
          ] : [
            { label: "👌 完成因果 (继续探索)", action: "close_after_advance" }
          ],
          allowsFreeInput: !isLastStep && !!data.allowsFreeInput,
          soundHint: data.soundHint || "bling",
          timeDelta,
          isEarlyEnd: !!data.isEarlyEnd
        });

        setEntityStageMap(nextStageMap);

        setCurrentDialogueHistory(h => [...h, `你选择: ${currentText}`, `反馈: ${data.text}`]);

        if (data.soundHint) {
          audio.playSound(data.soundHint);
        }

        if (data.isEarlyEnd) {
          setTimeout(() => {
            handleTriggerEnding();
          }, 3500);
        }
      } else {
        // Fallback action handle
        appendHistoryLog({
          entity: lastInteractedEntity.name,
          action: currentText,
          outcome: "时空节点已归顺，继续去探索其他锚点吧！"
        });
        setInteractionResult(null);
        setLastInteractedEntity(null);
      }
    } catch (e) {
      console.error(e);
      setInteractionResult(null);
      setLastInteractedEntity(null);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Dialogue closet
  const handleCloseDialogue = () => {
    audio.playSound("bling");
    abortControllerRef.current?.abort();
    setInteractionResult(null);
    setLastInteractedEntity(null);
    setIsAiLoading(false);
  };

  // Render Ending Assessment Screen
  const handleTriggerEnding = async () => {
    if (timer <= 10) {
      unlockAchievement("last_second");
    }

    // Capture screenshot of the pixel map first
    let screenshotUrl = "";
    const mapEl = document.getElementById("pixel-map-container");
    if (mapEl) {
      try {
        const canvas = await html2canvas(mapEl, {
          useCORS: true,
          backgroundColor: null,
          scale: 1.5, // higher resolution
        });
        screenshotUrl = canvas.toDataURL("image/png");
      } catch (err) {
        console.error("Failed to capture map screenshot:", err);
      }
    }

    setGameState("loading");
    audio.stopBGM();
    audio.playSound("explosion");

    try {
      const signal = getAbortSignal();
      const data = await generateEnding({
        identity: worldScenario?.identity || (selectedPreset?.name || "科技公司创始人"),
        theme: worldScenario?.theme || "一分钟富豪试炼",
        spentTime: 60 - timer,
        interactionLog: historyLog,
        actionSequence: actionSequence,
        fixedEndings: worldScenario?.fixedEndings || []
      }, signal);
      
      const endingWithScreenshot = { ...data, screenshot: screenshotUrl };
      setEndingResult(endingWithScreenshot);

      // Save to Collection in localStorage
      const newSavedEnding: SavedLife = {
        ...endingWithScreenshot,
        identityName: worldScenario?.identity || (selectedPreset?.name || "科技公司创始人"),
        identityType: (window.localStorage.getItem("currentIdentityType") as BossIdentityType) || "CEO",
        theme: worldScenario?.theme || "纳斯达克终极一分钟",
        timestamp: new Date().toLocaleDateString()
      };

      const updatedCollection = [newSavedEnding, ...savedEndings].slice(0, 15); // preserve top 15 records
      setSavedEndings(updatedCollection);
      localStorage.setItem("boss_minute_endings", JSON.stringify(updatedCollection));
      unlockAchievement("first_ending");
      if (updatedCollection.length >= 3) {
        unlockEasterEgg("archive_hoarder");
      }

      setGameState("ending");
    } catch (e) {
      // Fallback wacky ending
      const fallbackEnd: EndingResult = {
        id: "BOSS #E404",
        title: "高登神豪的虚空归宿",
        rank: "SSS 级: 降维打击",
        endingText: "在最后的几秒钟里，你既没有敲钟也没有完成滑雪。你把所有的资产换算成金条，一股脑堆在了公司门前。然而看门犬直接开启了时空巨型漩涡，将所有的美元和你吸入了虚无！你在高维度的像素迷宫里，继续做着你的百亿老板大梦。",
        achievements: ["时间浪费专家", "外星狗的干饭人"],
        stats: {
          wealthWasted: "$100,000,000,000",
          butterflyEffectIndex: "999% (超负荷)",
          insanityLevel: "无可救药级"
        },
        screenshot: screenshotUrl
      };
      setEndingResult(fallbackEnd);

      const cachedEnd: SavedLife = {
        ...fallbackEnd,
        identityName: worldScenario?.identity || (selectedPreset?.name || "科技公司创始人"),
        identityType: (window.localStorage.getItem("currentIdentityType") as BossIdentityType) || "CEO",
        theme: worldScenario?.theme || "一分钟终极回溯",
        timestamp: new Date().toLocaleDateString()
      };
      const updated = [cachedEnd, ...savedEndings];
      setSavedEndings(updated);
      localStorage.setItem("boss_minute_endings", JSON.stringify(updated));
      unlockAchievement("first_ending");
      if (updated.length >= 3) {
        unlockEasterEgg("archive_hoarder");
      }

      setGameState("ending");
    }
  };

  const handleOpenFollowToRewind = () => {
    audio.playSound("warn");
    setGameState("follow_unlock");
  };

  const handleConfirmFollowToRewind = () => {
    setTimer(35.0);
    setGameState("playing");
    unlockAchievement("rewind");
    if (worldScenario) {
      audio.playBGM(worldScenario.ambientMusic);
    }
    audio.playSound("bling");
    setSystemAlertMessage("时光机已开启：感谢关注阿伦，小老板已带着现有因果钥匙回到 35 秒。");
    setTimeout(() => setSystemAlertMessage(null), 4500);
  };

  // Clean social sharing summary generator
  const triggerCopyShareCard = () => {
    if (!endingResult) return;
    const txt = `💡【一分钟老板 像素人生成就】\n身份: ${worldScenario?.identity || "超级老板"}\n结局: ${endingResult.title} (${endingResult.id})\n降维评级: ${endingResult.rank}\n蝴蝶混沌指数: ${endingResult.stats.butterflyEffectIndex}\n已挥霍神豪资产: ${endingResult.stats.wealthWasted}\n成就解锁: [${endingResult.achievements.join(", ")}]\n“重新踏进时间的河流，体验不可思议的富豪一分钟！”`;
    navigator.clipboard.writeText(txt);
    setSystemAlertMessage("📣 独特的‘富豪人生结局卡’已排版并复制到剪贴板！快发给你的老友一睹有钱人的快乐吧！✨");
    audio.playSound("bling");
    setTimeout(() => {
      setSystemAlertMessage(null);
    }, 5000);
  };

  const handleBackToLobby = () => {
    audio.stopBGM();
    audio.playSound("bling");
    abortControllerRef.current?.abort();
    setIsAiLoading(false);
    setGameState("lobby");
    setWorldScenario(null);
    setInteractionResult(null);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    audio.playSound("walk");
    
    // Pass current modal inputs directly to test without saving
    const currentSettings: ApiSettings = {
      provider: settingsProvider,
      siliconFlowApiKey: sfApiKey.trim(),
      siliconFlowModel: sfModel.trim() || DEFAULT_SILICONFLOW_MODEL,
      minimaxApiKey: mmApiKey.trim(),
      minimaxModel: mmModel.trim() || "MiniMax-M2.5",
      deepseekApiKey: dsApiKey.trim(),
      deepseekModel: dsModel.trim() || "deepseek-chat",
      enableThinking,
      localMode,
    };
    
    try {
      const res = await testApiConnection(currentSettings);
      setTestResult({
        success: res.success,
        message: res.message
      });
      if (res.success) {
        audio.playSound("bling");
      } else {
        audio.playSound("sigh");
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        message: e.message || "测试发生未知错误"
      });
      audio.playSound("sigh");
    } finally {
      setIsTesting(false);
    }
  };

  const filteredMaps = allMaps.filter((m) => {
    const matchesCategory = mapCategory === "featured" ? m.isFeatured : !m.isFeatured;
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const previewResourcePack = worldScenario?.resourcePack || getResourcePack(
    activeTab === "normal" ? "CEO" : (selectedPreset?.type || "CEO"),
    worldScenario?.theme || (selectedPreset?.name || "科技公司创始人")
  );
  const activeApiSettings = getApiSettings();
  const activeProviderDisplayName = getProviderDisplayName(activeApiSettings.provider);
  const activeWorldDescription = activeApiSettings.localMode
    ? "本产品当前使用本地离线引擎运行像素世界动态生成，无剧情限制。"
    : `本产品使用 ${activeProviderDisplayName} 模型在云端运行全量像素世界动态生成，无剧情限制。`;
  const activeWorldEngineLabel = activeApiSettings.localMode
    ? "Local Offline Dynamic World"
    : `${activeProviderDisplayName} Dynamic World`;
  const unlockedAchievementCount = ACHIEVEMENT_DEFS.filter(item => unlockedAchievementIds.includes(item.id)).length;
  const unlockedEasterEggCount = EASTER_EGG_DEFS.filter(item => unlockedEasterEggIds.includes(item.id)).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between overflow-x-hidden relative selection:bg-emerald-500 selection:text-black">
      
      {/* Absolute high-contrast pixelated header and banner */}
      <header className="bg-slate-900/85 backdrop-blur-md border-b border-slate-800 py-3 px-4 shadow-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer select-none active:scale-95 transition-all" onClick={handleLogoClick}>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center border-3 border-[#2D3436] bg-[#FFD93D] shadow-[2.5px_2.5px_0px_#2A2A2A] overflow-hidden shrink-0">
              <img src={logoUrl} alt="一分钟老板 Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-sans text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-1.5 leading-none select-none" style={{ color: '#FFD93D', WebkitTextStroke: '1.2px #FF9F1C', textShadow: '2.5px 2.5px 0px #2A2A2A' }}>
                一分钟老板 <span className="text-[9px] bg-[#EAF6FF] text-[#4D96FF] border-2 border-[#4D96FF] px-2 py-0.5 rounded-full font-black tracking-widest leading-none" style={{ color: '#4D96FF', WebkitTextStroke: '0px', textShadow: 'none' }}>AI NATIVE</span>
              </h1>
              <p className="text-[9px] text-[#FF9F1C] font-mono tracking-widest font-black mt-1">ONE MINUTE BOSS • PIXEL ADVENTURE</p>
            </div>
          </div>

          {/* Scrolling Ticker Indicator */}
          <div className="flex-1 max-w-lg hidden md:block bg-slate-950 border border-slate-800 rounded-xl px-4 py-1.5 font-mono text-[11px] overflow-hidden whitespace-nowrap text-amber-300 relative after:absolute after:inset-y-0 after:right-0 after:w-16 after:bg-gradient-to-l after:from-slate-950">
            <span className="inline-block animate-[bounce_10s_infinite_margin] text-ellipsis">
              ⚡ 网红简报: {METADATA_TICKERS[tickerIndex]}
            </span>
          </div>

          {/* Setting API secrets, mute option */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMute}
              className={`p-2 rounded-xl border transition duration-150 active:scale-90 cursor-pointer flex items-center justify-center ${
                isAudioMuted
                  ? "bg-slate-850 text-slate-500 border-slate-800"
                  : "bg-emerald-950/40 text-emerald-400 border-emerald-800/80 neon-glow-emerald"
              }`}
              title={isAudioMuted ? "播放声音" : "静音"}
            >
              {isAudioMuted ? <VolumeX size={18} /> : <Volume2 size={18} className="animate-pulse" />}
            </button>

            <button
              onClick={() => {
                const nextMode = !localMode;
                setLocalMode(nextMode);
                const settings = getRawStoredSettings();
                saveApiSettings({
                  provider: settings.provider || "siliconflow",
                  siliconFlowApiKey: settings.siliconFlowApiKey || "",
                  siliconFlowModel: settings.siliconFlowModel || "",
                  minimaxApiKey: settings.minimaxApiKey || "",
                  minimaxModel: settings.minimaxModel || "",
                  deepseekApiKey: settings.deepseekApiKey || "",
                  deepseekModel: settings.deepseekModel || "",
                  enableThinking: settings.enableThinking || false,
                  localMode: nextMode,
                });
                audio.playSound("walk");
              }}
              className={`p-2 rounded-xl border transition duration-150 active:scale-90 cursor-pointer flex items-center justify-center ${
                localMode
                  ? "bg-amber-950/40 text-amber-400 border-amber-800/80"
                  : "bg-violet-950/40 text-violet-400 border-violet-800/80"
              }`}
              title={localMode ? "本地模式 (离线秒开)" : "AI模式 (联网生成)"}
            >
              {localMode ? <WifiOff size={18} /> : <Wifi size={18} />}
            </button>

            <button
              onClick={() => {
                const resolved = getApiSettings();
                const stored = getRawStoredSettings();
                setSettingsProvider(resolved.provider || "siliconflow");
                setSfApiKey(stored.siliconFlowApiKey || "");
                setSfModel(stored.siliconFlowModel || "");
                setMmApiKey(stored.minimaxApiKey || "");
                setMmModel(stored.minimaxModel || "");
                setDsApiKey(stored.deepseekApiKey || "");
                setDsModel(stored.deepseekModel || "");
                setEnableThinking(stored.enableThinking !== undefined ? stored.enableThinking : false);
                setLocalMode(stored.localMode || false);
                setTestResult(null);
                setIsTesting(false);
                setShowSettingsModal(true);
                audio.playSound("walk");
              }}
              className="p-2 rounded-xl border bg-slate-800/80 hover:bg-slate-750 text-amber-400 border-slate-700 transition duration-150 active:scale-90 cursor-pointer flex items-center justify-center"
              title="API设置"
            >
              <Settings size={18} />
            </button>

            {!hasApiKey && (
              <span className="text-[10px] bg-rose-500/10 text-rose-450 border border-rose-500/20 px-2.5 py-1 rounded font-mono animate-pulse">
                ⚠️ SECRET KEY 缺失
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-5xl mx-auto my-4">

          {/* SYSTEM GLOBAL ALERT BANNER */}
          {systemAlertMessage && (
            <div className="mb-4 p-4 bg-slate-900 border-l-4 border-emerald-500 rounded-r shadow-md font-mono text-xs flex items-start gap-3">
              <span className="text-emerald-400 font-bold text-sm">💡 提示:</span>
              <p className="text-slate-200 leading-relaxed flex-1">{systemAlertMessage}</p>
              <button
                onClick={() => setSystemAlertMessage(null)}
                className="text-slate-500 hover:text-slate-350 font-bold ml-2 font-mono"
              >
                ✕
              </button>
            </div>
          )}

          <AnimatePresence>
            {unlockToast && (
              <motion.div
                initial={{ opacity: 0, y: -16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.96 }}
                className={`fixed top-24 right-4 z-[60] w-[min(360px,calc(100vw-32px))] border-3 border-[#2D3436] rounded-2xl p-4 shadow-[5px_5px_0px_#2D3436] ${
                  unlockToast.kind === "achievement" ? "bg-[#E8F8F5]" : "bg-[#FFF3BF]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white border-2 border-[#2D3436] flex items-center justify-center text-xl shrink-0 shadow-[2px_2px_0px_#2D3436]">
                    {unlockToast.icon}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-mono font-black uppercase tracking-widest text-[#4D96FF] flex items-center gap-1">
                      {unlockToast.kind === "achievement" ? <Trophy size={12} /> : <PartyPopper size={12} />}
                      {unlockToast.kind === "achievement" ? "成就解锁" : "彩蛋触发"}
                    </span>
                    <h4 className="text-sm font-black text-[#2D3436] mt-1">{unlockToast.name}</h4>
                    <p className="text-[10px] text-slate-600 font-bold leading-relaxed mt-1">{unlockToast.description}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 1. LOBBY STATE */}
          {gameState === "lobby" && (
            <div className="max-w-3xl mx-auto animate-fade-in">
              
              {/* Main Panel: Selector and prompt */}
              <div className="rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden neon-glow-emerald glass-panel">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full filter blur-2xl pointer-events-none"></div>

                <div className="mb-6">
                  <span className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-3 py-1 font-mono font-bold tracking-wider uppercase inline-block animate-pulse">
                    🎮 2D 顶视高阶像素探索
                  </span>
                  <h2 className="text-2xl md:text-3xl font-mono font-black text-white mt-3 leading-tight">
                    60秒，体验一次你可能根本想象不到的富豪人生
                  </h2>
                  <p className="text-xs text-slate-400 mt-2 font-serif italic">
                    “有钱人的快乐，可能真的超出你的想象。”
                  </p>
                </div>

                {/* Tab layout selectors */}
                <div className="flex border-b border-slate-800/60 mb-6 font-mono text-xs overflow-x-auto whitespace-nowrap gap-2 scrollbar-none">
                  <button
                    onClick={() => {
                      setActiveTab("normal");
                      audio.playSound("walk");
                    }}
                    className={`pb-3 px-3 font-bold transition-all duration-200 border-b-2 cursor-pointer flex items-center gap-1.5 rounded-t-lg ${
                      activeTab === "normal"
                        ? "border-emerald-450 text-emerald-450 bg-emerald-500/5"
                        : "border-transparent text-slate-450 hover:text-slate-200 hover:bg-slate-800/20"
                    }`}
                  >
                    <Compass size={14} /> 普通人随机人生
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("presets");
                      audio.playSound("walk");
                    }}
                    className={`pb-3 px-3 font-bold transition-all duration-200 border-b-2 cursor-pointer flex items-center gap-1.5 rounded-t-lg ${
                      activeTab === "presets"
                        ? "border-emerald-450 text-emerald-450 bg-emerald-500/5"
                        : "border-transparent text-slate-450 hover:text-slate-200 hover:bg-slate-800/20"
                    }`}
                  >
                    <Crown size={14} /> 世袭尊贵身份 {!isVip && "🔒"}
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("daily");
                      audio.playSound("walk");
                    }}
                    className={`pb-3 px-3 font-bold transition-all duration-200 border-b-2 cursor-pointer flex items-center gap-1.5 rounded-t-lg ${
                      activeTab === "daily"
                        ? "border-emerald-450 text-emerald-450 bg-emerald-500/5"
                        : "border-transparent text-slate-450 hover:text-slate-200 hover:bg-slate-800/20"
                    }`}
                  >
                    <Clock size={14} /> 每日特色人生 {!isVip && "🔒"}
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("album");
                      audio.playSound("walk");
                    }}
                    className={`pb-3 px-3 font-bold transition-all duration-200 border-b-2 cursor-pointer flex items-center gap-1.5 rounded-t-lg ${
                      activeTab === "album"
                        ? "border-emerald-450 text-emerald-450 bg-emerald-500/5"
                        : "border-transparent text-slate-450 hover:text-slate-200 hover:bg-slate-800/20"
                    }`}
                  >
                    <BookOpen size={14} /> 人生传承馆 ({savedEndings.length})
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("achievements");
                      audio.playSound("walk");
                    }}
                    className={`pb-3 px-3 font-bold transition-all duration-200 border-b-2 cursor-pointer flex items-center gap-1.5 rounded-t-lg ${
                      activeTab === "achievements"
                        ? "border-emerald-450 text-emerald-450 bg-emerald-500/5"
                        : "border-transparent text-slate-450 hover:text-slate-200 hover:bg-slate-800/20"
                    }`}
                  >
                    <Trophy size={14} /> 成就彩蛋 ({unlockedAchievementCount + unlockedEasterEggCount})
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("vip");
                      audio.playSound("walk");
                    }}
                    className={`pb-3 px-3 font-bold transition-all duration-200 border-b-2 cursor-pointer flex items-center gap-1.5 rounded-t-lg ${
                      activeTab === "vip"
                        ? "border-emerald-450 text-emerald-455 bg-emerald-500/5"
                        : "border-transparent text-slate-450 hover:text-slate-200 hover:bg-slate-800/20"
                    }`}
                  >
                    <Coins size={14} /> 商业权力特许
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {/* TAB 0: ORDINARY NORMAL PERSON */}
                  {activeTab === "normal" && (
                    <motion.div
                      key="normal"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4 relative overflow-hidden shadow-inner">
                        <div className="text-[10px] bg-emerald-500/10 text-emerald-405 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold absolute top-4 right-4 uppercase">
                          🌱 默认普通通道
                        </div>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-emerald-500/25 bg-slate-900 shadow-md">
                          <SpriteRenderer type="ceo" size={32} className="animate-[bounce_2s_infinite]" />
                        </div>
                        <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                          普通人背景：花光三百万败家对赌
                        </h3>
                        
                        <p className="text-xs text-slate-300 leading-relaxed font-serif bg-slate-900/60 border border-slate-850 p-4 rounded-xl shadow-inner">
                          你是王多鱼，你的二爷给你留下了巨额遗产，但很不幸，你需要先花光这三百万才能继承，现在，放手一搏吧！
                        </p>

                        {/* Interactive custom business input */}
                        <div className="space-y-2 pt-2">
                          <label className="block text-xs font-mono font-bold text-slate-350 uppercase tracking-widest flex items-center justify-between">
                            <span>开启你的商业构想输入框:</span>
                            <span className="text-[9px] text-emerald-455 font-semibold uppercase font-mono">写下你的败家构想</span>
                          </label>
                          <textarea
                            value={wangDuoyuConcept}
                            onChange={(e) => setWangDuoyuConcept(e.target.value)}
                            placeholder="输入让大聪明和钱总目瞪口呆的项目：如“北极冰川海水航拉至撒哈拉”、“推行全城减肥放电脂肪保险”、“组建首富太空哈士奇间谍队”！"
                            className="w-full h-24 bg-slate-900 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-white focus:outline-none focus:border-emerald-500 placeholder-slate-600 resize-none transition shadow-inner"
                          />
                        </div>

                        <div className="flex items-center gap-2.5 p-3.5 bg-slate-900/60 border border-slate-850 rounded-xl text-[10px] text-slate-400 font-mono">
                          <Info size={14} className="text-emerald-500 shrink-0" />
                          <span>游戏开始后，你将完全随机零时传送到以下一个精彩瞬间：开会、滑雪、上厕所、给员工发裁员通知！</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 1: PRESETS */}
                  {activeTab === "presets" && (
                    <motion.div
                      key="presets"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      {!isVip ? (
                        <div className="text-center py-10 px-4 bg-slate-955/85 border border-rose-500/20 rounded-2xl space-y-4 shadow-2xl">
                          <div className="w-14 h-14 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/30 mx-auto animate-pulse">
                            <Crown size={28} className="text-rose-450" />
                          </div>
                          <div className="space-y-1.5">
                            <h4 className="font-mono text-xs font-bold text-white">🔒 世袭尊贵血脉已锁定</h4>
                            <p className="text-[10px] font-mono text-slate-400 max-w-sm mx-auto leading-relaxed">
                              世袭神豪身份（如米其林名厨、太空旅行富商等）为尊贵的 VIP 会员特权。普通人默认开启王多鱼随机人生！
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              audio.playSound("bling");
                              setShowFollowModal(true);
                            }}
                            className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-350 hover:to-yellow-450 text-slate-955 font-mono font-black text-[10px] rounded-xl transition duration-150 active:scale-95 shadow-md shadow-amber-955/40 cursor-pointer inline-block border-b-2 border-amber-600 animate-pulse"
                          >
                            💳 零元尊享：一键免费升级 VIP
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between pb-1 pt-1 border-b border-slate-850/60">
                            {/* Category Filter Tabs */}
                            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-850 shrink-0 select-none">
                              <button
                                onClick={() => {
                                  setMapCategory("featured");
                                  audio.playSound("walk");
                                }}
                                className={`px-4 py-1.5 font-mono text-[10px] rounded-lg transition-all duration-200 cursor-pointer ${
                                  mapCategory === "featured"
                                    ? "bg-slate-850 text-white font-bold shadow-md"
                                    : "text-slate-500 hover:text-slate-350"
                                }`}
                              >
                                🔥 官方推荐
                              </button>
                              <button
                                onClick={() => {
                                  setMapCategory("custom");
                                  audio.playSound("walk");
                                }}
                                className={`px-4 py-1.5 font-mono text-[10px] rounded-lg transition-all duration-200 cursor-pointer ${
                                  mapCategory === "custom"
                                    ? "bg-slate-850 text-white font-bold shadow-md"
                                    : "text-slate-500 hover:text-slate-350"
                                }`}
                              >
                                🌀 时空裂隙
                              </button>
                            </div>

                            {/* Search bar */}
                            <div className="relative flex-1">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={13} />
                              <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="搜索地图名称、ID或描述..."
                                className="w-full pl-9 pr-4 py-1.5 bg-slate-955 border border-slate-850 focus:border-emerald-500 text-white font-mono text-[10px] rounded-xl focus:outline-none placeholder-slate-600 transition shadow-inner"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1.5 scrollbar-thin">
                            {filteredMaps.length > 0 ? (
                              filteredMaps.map((p) => (
                                <button
                                  key={p.type}
                                  onClick={() => {
                                    setSelectedPreset(p as any);
                                    audio.playSound("walk");
                                  }}
                                  className={`p-4 rounded-2xl border text-left transition-all duration-300 active:scale-95 cursor-pointer relative overflow-hidden group flex items-start gap-4 ${
                                    selectedPreset?.type === p.type
                                      ? "bg-slate-800 border-emerald-450 shadow-xl shadow-emerald-955/50 text-emerald-350 scale-[1.02] ring-1 ring-emerald-500/30 neon-glow-emerald"
                                      : "bg-slate-950/45 border-slate-850 hover:border-slate-700 text-slate-300 hover:bg-slate-850/60"
                                  }`}
                                >
                                  {/* Absolute subtle decorative background glow */}
                                  <div className={`absolute top-0 right-0 w-16 h-16 -mr-4 -mt-4 rounded-full blur-xl transition-all duration-300 ${
                                    selectedPreset?.type === p.type ? "bg-emerald-500/15" : "bg-transparent group-hover:bg-slate-700/10"
                                  }`} />

                                  {/* Left Side: Pixel Art character slot */}
                                  <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-300 ${
                                    selectedPreset?.type === p.type
                                      ? "bg-slate-950 border-emerald-450/50 scale-105 shadow-inner"
                                      : "bg-slate-900 border-slate-850 group-hover:border-slate-700 shadow"
                                  }`}>
                                    <SpriteRenderer type="ceo" size={32} className="group-hover:scale-110 transition-transform duration-200" />
                                  </div>

                                  {/* Right Side: metadata & naming */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 justify-between">
                                      <h4 className="font-mono font-bold text-xs truncate text-white group-hover:text-emerald-350 transition-colors">
                                        {p.name}
                                      </h4>
                                      <span className="text-[8px] bg-slate-955 px-1.5 py-0.5 border border-slate-850 font-mono text-slate-500 rounded uppercase flex items-center gap-1">
                                        <span>{p.icon}</span>
                                        <span className="text-[7px]">{p.type.startsWith("fallback_world_") ? p.type.replace("fallback_world_", "#") : p.type}</span>
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 mt-0.5">
                                      <span className="text-[8px] text-amber-400 font-bold font-mono">
                                        难度: {"⭐".repeat(p.difficulty || 3)}
                                      </span>
                                    </div>
                                    <p className="text-[9px] text-slate-450 mt-1 lines-clamp-2 leading-relaxed">
                                      {p.description}
                                    </p>
                                  </div>
                                </button>
                              ))
                            ) : (
                              <div className="col-span-1 md:col-span-2 text-center py-12 font-mono text-[10px] text-slate-555">
                                🔍 未找到任何匹配的地图
                              </div>
                            )}
                          </div>

                          {/* Beautiful dedicated narrative lore container */}
                          {selectedPreset && (
                            <div className="mt-4 p-4 bg-gradient-to-r from-slate-955 to-slate-900 rounded-xl border border-slate-850 text-xs text-slate-450 leading-relaxed font-mono relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full filter blur-xl pointer-events-none" />
                              <span className="text-[10px] bg-emerald-400/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider block w-fit mb-2">
                                🔮 极尊特权时空画卷 (Active Identity Lore)
                              </span>
                              <p className="text-slate-350">
                                时空穿梭已锚定扮演：<span className="text-emerald-450 font-extrabold underline decoration-emerald-500/40 underline-offset-4">{selectedPreset?.name || "科技公司创始人"}</span>。{selectedPreset?.description || "IPO上市前60秒，金钱、名誉与外星特工看门狗一网打尽"}。AI 时空天线将基于您的多重交互来推演专属的富豪六十秒微缩景观。
                              </p>
                            </div>
                          )}

                          {/* Custom Identity Prompt modifier */}
                          <div className="space-y-2 pt-3">
                            <label className="block text-xs font-mono font-bold text-slate-350 uppercase tracking-widest flex items-center justify-between">
                              <span>自定义神豪特征 (AI专属定制线):</span>
                              <span className="text-[9px] text-emerald-450">高度自由</span>
                            </label>
                            <textarea
                              value={customIdentityInput}
                              onChange={(e) => setCustomIdentityInput(e.target.value)}
                              placeholder="例如: 此时他兜里揣着一颗在月球捡到的巧克力豆、或者这艘游艇其实是他昨天用1美分在垃圾场换的高科技宇宙飞艇..."
                              className="w-full h-20 bg-slate-955 border border-slate-850 rounded-xl p-3.5 font-mono text-xs text-white focus:outline-none focus:border-emerald-500 placeholder-slate-655 resize-none transition shadow-inner"
                            />
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}

                  {/* TAB 2: DAILY CHALLENGES */}
                  {activeTab === "daily" && (
                    <motion.div
                      key="daily"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      {!isVip ? (
                        <div className="text-center py-10 px-4 bg-slate-955/85 border border-rose-500/20 rounded-2xl space-y-4 shadow-2xl">
                          <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/30 mx-auto animate-pulse">
                            <Clock size={28} className="text-rose-450" />
                          </div>
                          <div className="space-y-1.5">
                            <h4 className="font-mono text-xs font-bold text-white">🔒 每日特色人生已锁定</h4>
                            <p className="text-[10px] font-mono text-slate-400 max-w-sm mx-auto leading-relaxed">
                              每日特色对决剧本为尊贵的 VIP 会员专属特权组合。普通市民可在“普通人”中爽快败家！
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              audio.playSound("bling");
                              setShowFollowModal(true);
                            }}
                            className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-350 hover:to-yellow-450 text-slate-955 font-mono font-black text-[10px] rounded-xl transition duration-150 active:scale-95 shadow-md shadow-amber-955/40 cursor-pointer inline-block border-b-2 border-amber-600 animate-pulse"
                          >
                            💳 零元尊享：一键免费升级 VIP
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="p-5 bg-gradient-to-r from-emerald-955/30 to-slate-950 border border-emerald-500/20 rounded-2xl shadow-inner">
                            <span className="text-[9px] bg-emerald-400 text-slate-955 font-black px-2 py-0.5 rounded uppercase font-mono tracking-widest shadow">
                              DAILY PRESET
                            </span>
                            <h3 className="text-lg font-mono font-black text-white mt-3">
                              {getDailyChallenge().title}
                            </h3>
                            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                              {getDailyChallenge().description}
                            </p>
                            
                            <div className="mt-4 p-3.5 bg-slate-900 border border-slate-850 rounded-xl">
                              <span className="text-[10px] text-amber-300 block font-mono font-bold">⚡ 推荐AI演进线:</span>
                              <p className="text-xs font-mono italic text-slate-355 mt-1 leading-relaxed">
                                &quot;{getDailyChallenge().customPrompt}&quot;
                              </p>
                            </div>

                            <button
                              onClick={() => handleStartGame(getDailyChallenge().customPrompt, getDailyChallenge().identityType)}
                              className="w-full mt-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-955 font-mono font-black rounded-xl transition active:scale-95 select-none cursor-pointer flex items-center justify-center gap-1.5 text-xs shadow-md border-b-2 border-emerald-600"
                            >
                              <Play size={14} className="fill-current" /> 接受今日推荐人生挑战
                            </button>
                          </div>

                          <div className="flex items-center gap-2 p-3 bg-slate-955 border border-slate-850 rounded-xl text-[10px] text-slate-455 font-mono">
                            <Info size={12} className="text-emerald-500 shrink-0" />
                            <span>每日挑战根据真实世界突发事件重组，成功通关可解锁世界树纪念馆卡券。</span>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}

                  {/* TAB 3: COLLECTIBLES COLLECTION ALBUM */}
                  {activeTab === "album" && (
                    <motion.div
                      key="album"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      {savedEndings.length === 0 ? (
                        <div className="text-center py-12 bg-slate-950/70 border border-slate-850 rounded-2xl font-mono text-xs text-slate-505 space-y-2 shadow-inner">
                          <span>🌌 你的“人生传承馆”目前空空如也呢。</span>
                          <p className="text-[10px] text-slate-600">完成一次一分钟神豪失败或救世探索，即可在此永久收集你的命运纪念卡牌！</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
                          {savedEndings.map((save, index) => (
                            <div
                              key={`${save.id}-${index}`}
                              className="p-4 bg-slate-955/70 border border-slate-850 rounded-2xl relative overflow-hidden group hover:border-emerald-500/50 transition cursor-pointer shadow hover:shadow-lg"
                            >
                              <div className="flex justify-between items-center gap-2">
                                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 rounded">
                                  {save.id}
                                </span>
                                <span className="text-[9px] font-mono text-slate-550">{save.timestamp}</span>
                              </div>
                              <h4 className="font-mono text-xs font-bold text-white mt-2 line-clamp-1">{save.title}</h4>
                              <p className="text-[9px] font-mono text-amber-400 mt-0.5 line-clamp-1">身份: {save.identityName}</p>
                              
                              {save.screenshot && (
                                <div className="mt-2.5 border border-slate-800 rounded-lg overflow-hidden max-h-[100px] shadow-sm select-none">
                                  <img 
                                    src={save.screenshot} 
                                    alt="时空印记" 
                                    className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity"
                                  />
                                </div>
                              )}

                              <p className="text-[10px] text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                                {save.endingText}
                              </p>

                              <div className="mt-2.5 flex items-center justify-between text-[8px] font-mono border-t border-slate-850/80 pt-2.5">
                                <span className="text-slate-505 font-bold">评级: <span className="text-rose-400 font-extrabold">{save.rank}</span></span>
                                <span className="text-slate-505 font-bold">累计挥霍: <span className="text-white font-extrabold">{save.stats.wealthWasted}</span></span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* TAB 4: ACHIEVEMENTS AND EASTER EGGS */}
                  {activeTab === "achievements" && (
                    <motion.div
                      key="achievements"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-slate-950/70 border border-emerald-500/25 rounded-2xl shadow-inner">
                          <span className="text-[9px] text-emerald-400 font-mono font-black uppercase">Achievements</span>
                          <strong className="block text-2xl font-mono text-white mt-1">
                            {unlockedAchievementCount}/{ACHIEVEMENT_DEFS.length}
                          </strong>
                          <p className="text-[10px] text-slate-450 mt-1">老板行为档案解锁进度</p>
                        </div>
                        <div className="p-4 bg-slate-950/70 border border-amber-500/25 rounded-2xl shadow-inner">
                          <span className="text-[9px] text-amber-400 font-mono font-black uppercase">Easter Eggs</span>
                          <strong className="block text-2xl font-mono text-white mt-1">
                            {unlockedEasterEggCount}/{EASTER_EGG_DEFS.length}
                          </strong>
                          <p className="text-[10px] text-slate-450 mt-1">隐藏荒诞触发点进度</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-mono font-black text-white flex items-center gap-1.5">
                            <Trophy size={14} className="text-emerald-400" /> 因果成就
                          </h4>
                          <span className="text-[9px] text-slate-500 font-mono">特定玩法行为触发</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[190px] overflow-y-auto pr-1">
                          {ACHIEVEMENT_DEFS.map(item => {
                            const unlocked = unlockedAchievementIds.includes(item.id);
                            return (
                              <div
                                key={item.id}
                                className={`p-3 rounded-2xl border shadow-sm transition ${
                                  unlocked
                                    ? "bg-emerald-500/10 border-emerald-500/35"
                                    : "bg-slate-950/50 border-slate-850 opacity-65"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{unlocked ? item.icon : "🔒"}</span>
                                  <div className="min-w-0">
                                    <h5 className={`text-[11px] font-mono font-black truncate ${unlocked ? "text-emerald-400" : "text-slate-500"}`}>
                                      {unlocked ? item.name : "未解锁成就"}
                                    </h5>
                                    <p className="text-[9px] text-slate-450 leading-relaxed mt-0.5">
                                      {item.description}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-mono font-black text-white flex items-center gap-1.5">
                            <Gift size={14} className="text-amber-400" /> 隐藏彩蛋
                          </h4>
                          <span className="text-[9px] text-slate-500 font-mono">用离谱条件触发</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[150px] overflow-y-auto pr-1">
                          {EASTER_EGG_DEFS.map(item => {
                            const unlocked = unlockedEasterEggIds.includes(item.id);
                            return (
                              <div
                                key={item.id}
                                className={`p-3 rounded-2xl border shadow-sm transition ${
                                  unlocked
                                    ? "bg-amber-500/10 border-amber-500/35"
                                    : "bg-slate-950/50 border-slate-850 opacity-65"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{unlocked ? item.icon : "❔"}</span>
                                  <div className="min-w-0">
                                    <h5 className={`text-[11px] font-mono font-black truncate ${unlocked ? "text-amber-400" : "text-slate-500"}`}>
                                      {unlocked ? item.name : "隐藏彩蛋"}
                                    </h5>
                                    <p className="text-[9px] text-slate-450 leading-relaxed mt-0.5">
                                      {unlocked ? item.description : "条件未知，继续乱点和乱玩。"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 4: MONETIZATION COMMERCIAL */}
                  {activeTab === "vip" && (
                    <motion.div
                      key="vip"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <div className="p-4 bg-slate-950/70 border border-slate-855 rounded-2xl space-y-4 shadow-inner">
                        <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                          <span className="text-xs font-mono font-bold text-slate-350 uppercase tracking-widest">
                            👑 VIP 尊尚特权大厅
                          </span>
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-extrabold ${isVip ? "bg-amber-400 text-slate-955 shadow-sm animate-pulse" : "bg-slate-800 text-slate-555"}`}>
                            {isVip ? "★ PREMIUM VIP 尊贵会员" : "普通市民"}
                          </span>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-amber-500/10 to-yellow-600/5 border border-amber-500/25 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div>
                            <h4 className="text-xs font-mono font-bold text-amber-400">一键升级永久「星际特许 VIP」大王卡</h4>
                            <p className="text-[10px] text-slate-450 mt-1 leading-relaxed">
                              彻底解放“世袭尊贵身份”以及“每日定制推荐剧本”，获得无上败家气势，神豪光环普照宇宙！
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              audio.playSound("bling");
                              if (isVip) {
                                setIsVip(false);
                                setSystemAlertMessage("🔇 已回到质朴可亲的普通人视角。");
                              } else {
                                setShowFollowModal(true);
                              }
                            }}
                            className={`px-4 py-2.5 font-mono font-black text-[10px] rounded-xl shrink-0 transition active:scale-95 cursor-pointer border-b-2 ${
                              isVip
                                ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                                : "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md shadow-amber-900/40 border-amber-600 animate-pulse"
                            }`}
                          >
                            {isVip ? "🔒 注销回到市民身份" : "✨ 一键免费激活永久 VIP"}
                          </button>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-950 border border-slate-855 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div 
                          onClick={() => {
                            if (!isVip) {
                              audio.playSound("bling");
                              setShowFollowModal(true);
                            }
                          }}
                          className={`p-3.5 bg-slate-900 border border-emerald-500/20 rounded-xl relative overflow-hidden transition ${
                            !isVip ? "cursor-pointer hover:bg-slate-850 hover:border-emerald-500/40" : ""
                          }`}
                        >
                          <span className="absolute top-1 right-2 font-mono text-[8px] text-emerald-450 animate-pulse bg-emerald-950 px-1.5 rounded">
                            {isVip ? "已激活" : "HOT 免费开通"}
                          </span>
                          <h4 className="text-xs font-mono font-bold text-white flex items-center gap-1">
                            <Plus size={14} className="text-emerald-500" /> 时空观察者 (月卡)
                          </h4>
                          <p className="text-[9px] text-slate-450 mt-1.5 leading-relaxed">解锁高维观察日志、无限时光回溯特权以及每日不限次数平行世界探寻。</p>
                          <span className="text-xs font-mono text-emerald-450 block mt-2 font-extrabold">
                            {isVip ? "已获得尊享特权" : "¥0.00 / 极乐体验"}
                          </span>
                        </div>

                        <div className="p-3.5 bg-slate-900 border border-amber-500/20 rounded-xl relative overflow-hidden">
                          <span className="absolute top-1 right-2 font-mono text-[8px] text-amber-455 bg-amber-955 px-1.5 rounded">
                            UPCOMING
                          </span>
                          <h4 className="text-xs font-mono font-bold text-white flex items-center gap-1">
                            <CompassIcon size={14} className="text-amber-500" /> 诸神黄昏剧本包
                          </h4>
                          <p className="text-[9px] text-slate-450 mt-1.5 leading-relaxed">解锁诸神黄昏特殊背景、荒诞神明对话选项及北欧神话隐藏彩蛋物品。</p>
                          <span className="text-xs font-mono text-amber-455 block mt-2 font-extrabold">开发中·敬请期待</span>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-[11px] font-mono text-slate-400 space-y-1">
                        <span className="text-white block font-bold">🛒 【商业折旧法】超级福利:</span>
                        <p>让每一笔失败人生都可以封装成数字藏品收藏或时光回转！</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submitting play */}
                <div className="pt-6 border-t border-slate-800/60 mt-6">
                  {(() => {
                    const currentInput = activeTab === "normal" ? wangDuoyuConcept : customIdentityInput;
                    const hasInput = currentInput.trim().length > 0;
                    return (
                      <button
                        onClick={handleLobbyStartClick}
                        disabled={isStreamingConcept}
                        className={`w-full py-4 font-mono font-bold tracking-widest text-sm rounded-xl transition duration-150 shadow-md cursor-pointer flex items-center justify-center gap-2 select-none ${
                          isStreamingConcept
                            ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 active:scale-98 shadow-emerald-900/20"
                        }`}
                      >
                        {isStreamingConcept ? (
                          <>
                            <span className="inline-block w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                            ⚡ 正在构思奇妙创业...
                          </>
                        ) : hasInput ? (
                          <><Sparkles size={16} className="animate-spin" /> 开启你的一分钟富豪命运</>
                        ) : (
                          <><Sparkles size={16} className="animate-bounce" /> 随机进入一个世界</>
                        )}
                      </button>
                    );
                  })()}
                  <p className="text-center font-mono text-[9px] text-slate-500 mt-3">
                    *{activeWorldDescription}
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* 2. LOADING STATE */}
          {gameState === "loading" && (
            <div className="border-3 border-[#2D3436] rounded-3xl p-10 shadow-[6px_6px_0px_#2D3436] text-center max-w-md mx-auto space-y-6 bg-[#EAF6FF] text-[#2D3436]">
              <div className="relative inline-block hover:scale-105 transition-transform duration-200">
                <div className="w-20 h-20 rounded-full border-4 border-[#2D3436] border-t-[#FFD93D] animate-spin"></div>
                <img src={logoUrl} alt="一分钟老板 Logo" className="absolute inset-2 w-16 h-16 rounded-full object-cover border-2 border-[#2D3436]" />
              </div>
              
              <div className="space-y-4">
                <h3 className="font-mono text-base font-black uppercase tracking-wider text-[#2D3436]">
                  时空因果链对流装载中...
                </h3>

                {/* 卡通立体进度条组件 */}
                <div className="space-y-2">
                  <div className="w-full h-6 bg-white border-3 border-[#2D3436] rounded-full overflow-hidden shadow-inner relative flex items-center">
                    {/* 进度条填充 */}
                    <div 
                      className="h-full bg-gradient-to-r from-[#FFD93D] to-[#FF9F1C] border-r-3 border-[#2D3436] transition-all duration-150 ease-out"
                      style={{ width: `${loadingProgress}%` }}
                    />
                    {/* 进度百分比文字 */}
                    <span className="absolute inset-0 flex items-center justify-center font-mono font-black text-xs text-[#2D3436]">
                      {loadingProgress}%
                    </span>
                  </div>
                  
                  {/* 幽默搞笑文案 */}
                  <p className="text-[10px] text-[#FF9F1C] bg-[#FFF8E7] border-2 border-[#2D3436] py-2 px-3 rounded-xl font-bold min-h-[40px] flex items-center justify-center shadow-[2.5px_2.5px_0px_#2D3436]">
                    {loadingText}
                  </p>
                </div>

                <p className="text-[9px] text-slate-500 leading-relaxed font-bold font-mono pt-2">
                  “一分钟不长，但足够你在量子荒野里来回挥霍几十个来回。”
                </p>
              </div>
            </div>
          )}

          {/* 3. PLAYING STATE */}
          {gameState === "playing" && worldScenario && (
            <div className="space-y-4">
              
              {/* Gameplay Top Status HUD */}
              <div className="rounded-2xl p-4 flex items-center justify-between shadow-lg glass-panel">
                <div className="space-y-0.5">
                  <span className="text-[9px] bg-slate-950 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded uppercase font-mono font-bold tracking-wider">
                    {worldScenario.identity}
                  </span>
                  <h3 className="text-xs md:text-sm font-mono font-bold text-white mt-1">
                    {worldScenario.theme}
                  </h3>
                </div>

                {/* Ticking Tense Countdown Clock widget */}
                <div className="flex items-center gap-3 bg-slate-950 rounded-xl px-4 py-2 border border-slate-800/80 shadow-inner">
                  <Timer className={`w-5 h-5 ${timer < 15 ? "text-rose-500 animate-pulse" : "text-amber-400"}`} />
                  <div className="font-mono text-right">
                    <span className={`text-xl md:text-2xl font-bold tracking-widest ${timer < 15 ? "text-rose-500 font-black animate-ping-once" : "text-amber-300"}`}>
                      {timer.toFixed(1)}s
                    </span>
                    <span className="text-[8px] text-slate-500 block uppercase">时间余存</span>
                  </div>
                </div>
              </div>

              {/* Optional Local Quantum Fallback Engine Warning Banner */}
              {worldScenario.isFallback && (
                <div className="bg-amber-500/10 border-2 border-dashed border-amber-500/30 text-amber-300 rounded-xl p-3 md:px-4 font-mono text-xs flex items-center gap-3 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0"></div>
                  <div className="flex-1">
                    <span className="font-bold">⚠️ 【因果天线阻塞】</span>
                    已启动离线高维沙盒模拟引擎（Offline High-Fidelity Engine）维持时空运转！部分幽默剧情已预先合成完毕。
                  </div>
                </div>
              )}

              {/* World Layout exploration (Interactive map) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Visual grid layout */}
                <div className="lg:col-span-8 flex justify-center">
                  <PixelMap
                    tiles={worldScenario.mapLayout.tiles}
                    playerPosition={playerPos}
                    npcs={worldScenario.npcs}
                    items={worldScenario.items}
                    onMove={(pos) => setPlayerPos(pos)}
                    onInteract={(type, id, name) => handleInteractionDetected(type, id, name)}
                    activeInteractionId={interactionResult ? lastInteractedEntity?.id || "dialogue" : null}
                  />
                </div>

                {/* Right gameplay list or active encounters panel */}
                <div className="lg:col-span-4 h-full flex flex-col gap-4">
                  {/* NPC and Items anchors status list */}
                  <div className="rounded-2xl p-4 shadow-xl border-2 border-[#2D3436] bg-[#EAF6FF] flex-grow flex flex-col min-h-[220px] max-h-[300px] overflow-hidden">
                    <div className="border-b border-[#2D3436]/15 pb-1.5 mb-2 flex items-center justify-between text-[11px] font-mono text-[#2D3436] font-black uppercase">
                      <span>📍 时空因果节点进度</span>
                      <span className="text-[9px] bg-[#FF9F1C] text-white px-1.5 py-0.5 rounded-full">探索中</span>
                    </div>
                    <div className="space-y-2 overflow-y-auto pr-1 flex-grow scrollbar-thin">
                      {worldScenario.npcs.map(npc => {
                        const stage = entityStageMap[npc.id] || 0;
                        const total = npc.storyline?.length || 3;
                        return (
                          <div key={npc.id} className="flex items-center justify-between p-2 bg-[#FFF8E7] rounded-xl border-2 border-[#2D3436] shadow-[2px_2px_0px_#2D3436] text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-base">👥</span>
                              <div className="font-bold text-[#2D3436]">
                                {npc.name}
                                <span className="text-[8px] font-normal text-slate-505 block">特征: {npc.sprite}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-black text-[10px] text-[#FF9F1C]">
                                {stage >= total ? "✅ 固化" : `${stage}/${total}`}
                              </span>
                              <div className="flex gap-0.5">
                                {[...Array(total)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full border border-[#2D3436] ${
                                      i < stage ? "bg-[#6BCB77]" : "bg-white"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {worldScenario.items.map(item => {
                        const stage = entityStageMap[item.id] || 0;
                        const total = item.storyline?.length || 3;
                        return (
                          <div key={item.id} className="flex items-center justify-between p-2 bg-[#EAF6FF] rounded-xl border-2 border-[#2D3436] shadow-[2px_2px_0px_#2D3436] text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-base">🔍</span>
                              <div className="font-bold text-[#2D3436]">
                                {item.name}
                                <span className="text-[8px] font-normal text-slate-505 block">特征: {item.sprite}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-black text-[10px] text-[#4D96FF]">
                                {stage >= total ? "✅ 固化" : `${stage}/${total}`}
                              </span>
                              <div className="flex gap-0.5">
                                {[...Array(total)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full border border-[#2D3436] ${
                                      i < stage ? "bg-[#6BCB77]" : "bg-white"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active inventory traces logs */}
                  <div className="rounded-2xl p-4 shadow-xl border-2 border-[#2D3436] bg-[#FFF8E7] flex flex-col justify-between min-h-[160px] max-h-[220px]">
                    <div className="border-b border-[#2D3436]/15 pb-1.5 mb-2 flex items-center justify-between text-[11px] font-mono text-[#2D3436] font-black uppercase">
                      <span>📜 老板因果印记</span>
                      <span>已记录 {historyLog.length} 条</span>
                    </div>

                    <div className="space-y-2 overflow-y-auto max-h-[150px] pr-1 scrollbar-thin font-mono text-[10px] text-[#2D3436] leading-snug">
                      {historyLog.length === 0 ? (
                        <div className="text-center py-6 text-slate-400 italic">
                          暂无时空印记。走去和人搭话吧！
                        </div>
                      ) : (
                        historyLog.map((log, i) => (
                          <div key={i} className="p-2 bg-white rounded-xl border border-[#2D3436]/30 shadow-[1px_1px_0px_#2D3436]/30 animate-fade-in">
                            <div className="font-black text-[#FF9F1C] flex justify-between">
                              <span>🎯 {log.entity}</span>
                              <span className="text-[8px] text-slate-400 font-normal">#{i + 1}</span>
                            </div>
                            <p className="mt-1 font-bold text-slate-755">抉择: {log.action}</p>
                            <p className="mt-0.5 text-slate-500">{log.outcome}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Encounter Dialogue Modal Dialog (Overlay Popup) */}
              <AnimatePresence>
                {interactionResult && lastInteractedEntity && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/60"
                  >
                    <motion.div
                      initial={{ scale: 0.9, y: 20, opacity: 0 }}
                      animate={{ scale: 1, y: 0, opacity: 1 }}
                      exit={{ scale: 0.9, y: 20, opacity: 0 }}
                      className="w-full max-w-lg border-3 border-[#2D3436] shadow-[6px_6px_0px_#2D3436] rounded-3xl p-6 bg-[#EAF6FF] relative overflow-hidden flex flex-col gap-4 text-[#2D3436]"
                    >
                      {/* Corner decors */}
                      <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-[#2D3436] opacity-30"></div>
                      <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-[#2D3436] opacity-30"></div>
                      <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-[#2D3436] opacity-30"></div>
                      <div className="absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 border-[#2D3436] opacity-30"></div>

                      <div className="flex items-center justify-between border-b-2 border-[#2D3436]/15 pb-2">
                        <span className="text-[10px] font-mono bg-[#4D96FF] text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                          {lastInteractedEntity.type === "NPC" ? "👥 面对面因果" : "🔍 物品机密"}
                        </span>
                        <span className="text-xs font-black text-[#2D3436]/80">
                          {lastInteractedEntity.name}
                        </span>
                      </div>

                      <div className="text-sm font-bold leading-relaxed bg-[#FFF8E7] p-4 rounded-2xl border-2 border-[#2D3436] shadow-[2px_2px_0px_#2D3436] max-h-[160px] overflow-y-auto scrollbar-thin">
                        <p className="whitespace-pre-line leading-relaxed">{interactionResult.text}</p>
                      </div>

                      {/* Time penalty alert if any */}
                      {interactionResult.timeDelta !== 0 && (
                        <div className="text-[10px] font-bold text-rose-500 bg-rose-500/10 border border-rose-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
                          <span>⚠️ 此时空决策导致时间损耗: </span>
                          <strong className="font-mono font-black">{interactionResult.timeDelta}秒</strong>
                        </div>
                      )}

                      {/* Interactive Branches options */}
                      <div className="space-y-3">
                        {interactionResult.isEarlyEnd ? (
                          <div className="p-4 bg-rose-500/15 border-2 border-rose-500/40 rounded-2xl text-center space-y-3">
                            <span className="text-sm text-rose-500 font-black block animate-bounce">
                              🚨 【时空坍缩警告】因果线彻底碎裂！
                            </span>
                            <p className="text-[11px] font-bold text-slate-600 leading-relaxed">
                              老板！这个行为太荒谬了，时空奇点正疯狂吞噬您的百亿资产与公司未来！您必须立刻抉择：
                            </p>
                            <div className="space-y-2 pt-2">
                              <button
                                onClick={() => handleResolveAction("钞能力救赎", "bailout")}
                                className="w-full text-left p-3.5 bg-[#FFD93D] hover:bg-[#FF9F1C] text-[#2D3436] text-xs font-black border-2 border-[#2D3436] rounded-xl transition shadow-[3px_3px_0px_#2D3436] active:scale-95 flex items-center justify-between cursor-pointer"
                              >
                                <span>💸 豪掷千金：支付时空过路费强行续命</span>
                                <span className="text-[9px] bg-slate-900 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                                  -{(Math.max(15, timer * 0.5)).toFixed(1)}s
                                </span>
                              </button>
                              <button
                                onClick={() => handleResolveAction("顺应天意", "trigger_ending_via_early_end")}
                                className="w-full text-left p-3 bg-white hover:bg-slate-50 text-[#2D3436] text-xs font-bold border-2 border-[#2D3436] rounded-xl transition shadow-[3px_3px_0px_#2D3436] active:scale-95 flex items-center justify-between cursor-pointer"
                              >
                                <span>👑 顺应天意：结算我的神豪财富终局</span>
                                <ChevronRight size={14} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {isAiLoading ? (
                              <div className="text-center py-4 font-mono text-xs text-[#FF9F1C] font-black tracking-wider animate-pulse">
                                <span>🚀 时空对流计算中，请端庄呼吸...</span>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {interactionResult.options.map((opt, i) => (
                                  <button
                                    key={i}
                                    onClick={() => handleResolveAction(opt.label, opt.action)}
                                    className="w-full text-left p-3 bg-[#FFD93D] hover:bg-[#FF9F1C] text-[#2D3436] text-xs font-bold border-2 border-[#2D3436] rounded-xl transition-all duration-200 shadow-[3px_3px_0px_#2D3436] active:scale-95 flex items-center justify-between group cursor-pointer"
                                  >
                                    <span className="group-hover:translate-x-1 transition-all">{opt.label}</span>
                                    <ChevronRight size={14} />
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* Free text prompt input */}
                            {interactionResult.allowsFreeInput && !isAiLoading && (
                              <div className="flex gap-2 pt-2 border-t-2 border-[#2D3436]/10">
                                <input
                                  type="text"
                                  value={customActionValue}
                                  onChange={(e) => setCustomActionValue(e.target.value)}
                                  placeholder="输入自定义荒诞动作..."
                                  className="flex-1 bg-[#ffffff] border-2 border-[#2D3436] rounded-xl px-3 py-2 font-mono text-xs text-[#2D3436] focus:outline-none focus:border-[#4D96FF] transition shadow-inner font-bold"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && customActionValue.trim()) {
                                      handleResolveAction(customActionValue.trim(), "custom");
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => {
                                    if (customActionValue.trim()) {
                                      handleResolveAction(customActionValue.trim(), "custom");
                                    }
                                  }}
                                  className="px-4 py-2 bg-[#6BCB77] hover:bg-[#52a35e] text-white rounded-xl font-mono text-xs font-bold active:scale-95 cursor-pointer flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#2D3436] border-2 border-[#2D3436]"
                                >
                                  <ArrowRight size={16} />
                                </button>
                              </div>
                            )}

                            <button
                              onClick={handleCloseDialogue}
                              className="w-full py-2 bg-white hover:bg-slate-50 text-[#2D3436] border-2 border-[#2D3436] rounded-xl text-[10px] font-mono font-black shadow-[2px_2px_0px_#2D3436] mt-1 cursor-pointer transition select-none"
                            >
                              回到探索地图
                            </button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Forced manual settle button if player is bored */}
              <div className="text-center pt-2">
                <button
                  onClick={() => {
                    unlockAchievement("early_end");
                    handleTriggerEnding();
                  }}
                  className="font-mono text-xs text-slate-500 hover:text-rose-400 hover:underline cursor-pointer flex items-center justify-center gap-1 mx-auto"
                >
                  <RotateCcw size={12} /> 提前中断并结算此生 (看透浮名)
                </button>
              </div>

            </div>
          )}

          {/* 4. FOLLOW TO UNLOCK TIME MACHINE */}
          {gameState === "follow_unlock" && (
            <div className="max-w-3xl mx-auto border-4 border-amber-500 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 glass-panel">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs bg-amber-500 text-slate-950 font-bold px-2 rounded font-mono tracking-widest flex items-center gap-1">
                  <ScanLine size={12} /> 关注阿伦开启时光机
                </span>
                <span className="font-mono text-xs text-amber-500 font-bold animate-pulse">FOLLOW TO REWIND</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-black text-white">小红书</span>
                    <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-bold">可能是阿伦</span>
                  </div>
                  <img
                    src={xiaohongshuQrUrl}
                    alt="阿伦小红书二维码"
                    className="w-full rounded-xl border border-slate-800 bg-[#ffffff] object-contain max-h-[360px]"
                  />
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-black text-white">抖音</span>
                    <span className="text-[10px] bg-slate-800 text-slate-200 px-2 py-0.5 rounded-full font-bold">可能是阿伦</span>
                  </div>
                  <img
                    src={douyinQrUrl}
                    alt="阿伦抖音二维码"
                    className="w-full rounded-xl border border-slate-800 bg-[#ffffff] object-contain max-h-[360px]"
                  />
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold block">GitHub</span>
                  <p className="text-xs font-mono text-slate-300 mt-1">关注 unknownparticles，开启这台不太讲道理的时光机。</p>
                </div>
                <a
                  href="https://github.com/unknownparticles"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-3 bg-[#FFD93D] hover:bg-[#FF9F1C] text-[#2D3436] rounded-xl font-mono text-xs font-black active:scale-95 transition flex items-center justify-center gap-2 border-2 border-[#2D3436] shadow-[2px_2px_0px_#2A2A2A]"
                >
                  <Github size={16} /> 打开 GitHub
                </a>
              </div>

              <button
                onClick={handleConfirmFollowToRewind}
                className="w-full py-4 bg-[#FFD93D] hover:bg-[#FF9F1C] text-[#2D3436] font-mono font-black text-sm rounded-xl transition active:scale-95 cursor-pointer flex items-center justify-center gap-2 border-3 border-[#2D3436] shadow-[3px_3px_0px_#2A2A2A]"
              >
                <CheckCircle2 size={18} /> 我已关注，开启时光机回到 35 秒
              </button>

              <button
                onClick={() => setGameState("ending")}
                className="w-full py-2 bg-[#FF9F1C] hover:bg-[#FFD93D] text-[#2D3436] border-2 border-[#2D3436] rounded-xl text-[10px] font-mono font-black shadow-[2px_2px_0px_#2A2A2A] cursor-pointer transition"
              >
                暂不回溯，返回结局卡
              </button>
            </div>
          )}

          {/* 5. ENDING ASSESS STATE */}
          {gameState === "ending" && endingResult && (
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
              
              {/* Glorious high-contrast pixel collectible trading card */}
              <motion.div
                initial={{ 
                  opacity: 0, 
                  scale: 0.94, 
                  y: 35,
                  filter: "contrast(40%) sepia(80%) brightness(1.4) saturate(20%)" 
                }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  y: 0,
                  filter: "contrast(100%) sepia(0%) brightness(1) saturate(100%)"
                }}
                transition={{ 
                  duration: 1.5, 
                  ease: "easeOut" 
                }}
                className="border-4 border-double border-emerald-450 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden neon-glow-emerald glass-panel"
              >
                {/* CRT screen glow overlay */}
                <div className="absolute inset-0 bg-radial-gradient from-transparent to-black pointer-events-none opacity-40"></div>
                <div className="crt-flicker-overlay" />
                
                {/* Holographic light sweeping effect */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl z-30">
                  <div 
                    className="absolute -inset-[100%] bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-60 animate-sweep" 
                    style={{ mixBlendMode: "overlay" }}
                  ></div>
                </div>
                
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4 mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] bg-slate-950 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold tracking-wider">
                        {endingResult.id}
                      </span>
                      {endingResult.isFallback && (
                        <span className="text-[8px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono font-bold animate-pulse">
                          ★ 离线高维模拟
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl md:text-2xl font-mono font-bold text-white tracking-tight mt-1">
                      {endingResult.title}
                    </h2>
                  </div>

                  <div className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-amber-600 rounded-xl text-center shadow border border-red-500/20">
                    <span className="text-[8px] text-white block uppercase opacity-80 select-none">量子降维评级</span>
                    <strong className="font-mono text-xs md:text-sm text-yellow-300 font-black tracking-widest">{endingResult.rank}</strong>
                  </div>
                </div>

                {/* Main plot retrospective */}
                <div className="space-y-4">
                  {endingResult.screenshot && (
                    <div className="border border-slate-800 rounded-2xl overflow-hidden shadow-[2.5px_2.5px_0px_#2D3436] bg-slate-950/80 p-1 flex items-center justify-center max-w-lg mx-auto select-none">
                      <img 
                        src={endingResult.screenshot} 
                        alt="时空节点纪念印记" 
                        className="w-full h-auto object-cover rounded-xl"
                      />
                    </div>
                  )}

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 font-mono text-xs md:text-sm text-slate-200 leading-relaxed">
                    <span className="text-emerald-400 font-bold block mb-2 font-mono text-[11px]">❖ 蝴蝶效应全记录:</span>
                    <p className="whitespace-pre-line font-serif italic text-slate-100">{endingResult.endingText}</p>
                  </div>

                  {/* Stats items side-by-side */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 text-center font-mono">
                      <span className="text-[8px] text-slate-500 block uppercase">浪费资产值</span>
                      <strong className="text-xs text-white block mt-1">{endingResult.stats.wealthWasted}</strong>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 text-center font-mono">
                      <span className="text-[8px] text-slate-500 block uppercase">混沌干涉度</span>
                      <strong className="text-xs text-emerald-400 block mt-1">{endingResult.stats.butterflyEffectIndex}</strong>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 text-center font-mono">
                      <span className="text-[8px] text-slate-500 block uppercase">魂系疯狂分</span>
                      <strong className="text-xs text-amber-300 block mt-1">{endingResult.stats.insanityLevel}</strong>
                    </div>
                  </div>

                  {/* Achievements lists */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">🔓 解锁因果成就:</span>
                    <div className="flex flex-wrap gap-2">
                      {endingResult.achievements.map((ach, index) => (
                        <span
                          key={index}
                          className="text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-full flex items-center gap-1"
                        >
                          ✔ {ach}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="absolute top-2 right-4 text-[9px] font-mono text-slate-700 select-none">
                  ONE MINUTE BOSS ARCHIVE CODE
                </div>
              </motion.div>

              {/* Philosophical End Statement */}
              <div className="p-4 bg-slate-950/80 border border-slate-850 rounded-2xl text-center space-y-1.5 shadow-inner">
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-slate-500 block">时空终末观察判定</span>
                <p className="text-xs md:text-sm font-serif italic text-amber-300 font-medium">
                  “ 此人生已经结束。你无法再次踏入同一条时间河流（除非你有时光机）。 ”
                </p>
              </div>

              {/* Action grid dashboard */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={triggerCopyShareCard}
                  className="p-3 bg-slate-900 hover:bg-slate-850 text-emerald-400 font-mono font-bold text-xs rounded-xl border border-slate-800 transition active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                >
                  <Share2 size={14} /> 展示富豪人生结局卡
                </button>

                {/* Follow gate rewind trigger */}
                <button
                  onClick={handleOpenFollowToRewind}
                  className="p-3 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-mono font-bold text-xs rounded-xl transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  title="关注阿伦开启时光机"
                >
                  <ScanLine size={14} /> 关注阿伦开启时光机
                </button>

                <button
                  onClick={handleBackToLobby}
                  className="p-3 bg-slate-800 hover:bg-slate-750 text-white font-mono font-bold text-xs rounded-xl border border-slate-700 transition active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                >
                  <Grid size={14} /> 开启全新平行人生
                </button>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* 4. VIP FOLLOW TO UNLOCK MODAL */}
      <AnimatePresence>
        {showFollowModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/60"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="w-full max-w-lg border-3 border-[#2D3436] shadow-[6px_6px_0px_#2D3436] rounded-3xl p-6 bg-[#EAF6FF] relative overflow-hidden flex flex-col gap-4 text-[#2D3436]"
            >
              {/* Corner decors */}
              <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-[#2D3436] opacity-30"></div>
              <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-[#2D3436] opacity-30"></div>
              <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-[#2D3436] opacity-30"></div>
              <div className="absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 border-[#2D3436] opacity-30"></div>

              <div className="flex items-center justify-between border-b-2 border-[#2D3436]/15 pb-2">
                <span className="text-[10px] font-mono bg-[#FF9F1C] text-white px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                  👑 VIP 特许开通契约
                </span>
                <button 
                  onClick={() => setShowFollowModal(false)}
                  className="text-xs font-black text-slate-500 hover:text-slate-800"
                >
                  [关闭]
                </button>
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-sm font-black text-[#2D3436]">
                  扫码关注阿伦的自媒体账号，一键免费激活永久 VIP 特权！
                </h3>
                <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                  神豪血脉、每日挑战等全部高级玩法已打包封存。扫码支持作者，即可当场继承无上财富血脉！
                </p>
              </div>

              {/* 二维码展示区 */}
              <div className="grid grid-cols-2 gap-4 my-2">
                {/* 抖音 */}
                <div className="p-3 bg-white border-2 border-[#2D3436] rounded-2xl shadow-[3px_3px_0px_#2D3436] text-center flex flex-col items-center gap-2">
                  <span className="text-[9px] bg-slate-900 text-white px-2 py-0.5 rounded-full font-black font-mono">
                    🎵 抖音扫码
                  </span>
                  <img 
                    src={douyinQrUrl} 
                    alt="抖音二维码" 
                    className="w-28 h-28 object-cover border border-[#2D3436]/30 rounded-lg shadow-inner" 
                  />
                  <span className="text-[8px] text-slate-500 font-bold font-mono">
                    抖音号: 阿伦的开发室
                  </span>
                </div>

                {/* 小红书 */}
                <div className="p-3 bg-white border-2 border-[#2D3436] rounded-2xl shadow-[3px_3px_0px_#2D3436] text-center flex flex-col items-center gap-2">
                  <span className="text-[9px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-black font-mono">
                    📕 小红书扫码
                  </span>
                  <img 
                    src={xiaohongshuQrUrl} 
                    alt="小红书二维码" 
                    className="w-28 h-28 object-cover border border-[#2D3436]/30 rounded-lg shadow-inner" 
                  />
                  <span className="text-[8px] text-slate-500 font-bold font-mono">
                    小红书: 阿伦AI实验室
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    setIsVip(true);
                    setShowFollowModal(false);
                    unlockAchievement("vip_unlock");
                    audio.playSound("bling");
                    setSystemAlertMessage("👑 激活成功！永久星际尊享 VIP 特权包已装载！您可以任意解锁神豪角色与每日剧本！");
                  }}
                  className="w-full py-3 bg-[#6BCB77] hover:bg-[#52a35e] text-white text-xs font-black border-2 border-[#2D3436] rounded-xl transition shadow-[3px_3px_0px_#2D3436] active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 size={14} /> 我已关注，一键极速激活永久 VIP
                </button>
                <button
                  onClick={() => setShowFollowModal(false)}
                  className="w-full py-2 bg-white hover:bg-slate-50 text-[#2D3436] border-2 border-[#2D3436] rounded-xl text-[10px] font-mono font-black shadow-[2px_2px_0px_#2D3436] cursor-pointer transition"
                >
                  我再看看，回到普通人败家人生
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. 大模型 API 配置设置面板 */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/60"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="w-full max-w-lg border-3 border-[#2D3436] shadow-[6px_6px_0px_#2D3436] rounded-3xl p-6 bg-[#EAF6FF] relative overflow-hidden flex flex-col gap-4 text-[#2D3436]"
            >
              {/* Corner decors */}
              <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-[#2D3436] opacity-30"></div>
              <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-[#2D3436] opacity-30"></div>
              <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-[#2D3436] opacity-30"></div>
              <div className="absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 border-[#2D3436] opacity-30"></div>

              <div className="flex items-center justify-between border-b-2 border-[#2D3436]/15 pb-2">
                <span className="text-xs font-mono bg-[#FF9F1C] text-white px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                  ⚙️ 大模型时空网关配置
                </span>
                <button 
                  onClick={() => {
                    setShowSettingsModal(false);
                    audio.playSound("walk");
                  }}
                  className="text-xs font-black text-slate-500 hover:text-slate-800"
                >
                  [关闭]
                </button>
              </div>

              {/* Provider Selection */}
              <div className="space-y-2">
                <label className="text-xs font-black text-[#2D3436] block">时空网关提供商：</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      setSettingsProvider("siliconflow");
                      audio.playSound("walk");
                    }}
                    className={`py-2 px-2 border-2 border-[#2D3436] rounded-xl font-bold text-xs transition duration-150 active:scale-95 shadow-[2px_2px_0px_#2D3436] cursor-pointer text-center ${
                      settingsProvider === "siliconflow"
                        ? "bg-[#FFD93D] text-[#2D3436]"
                        : "bg-white text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    ⚡ SiliconFlow
                  </button>
                  <button
                    onClick={() => {
                      setSettingsProvider("minimax");
                      audio.playSound("walk");
                    }}
                    className={`py-2 px-2 border-2 border-[#2D3436] rounded-xl font-bold text-xs transition duration-150 active:scale-95 shadow-[2px_2px_0px_#2D3436] cursor-pointer text-center ${
                      settingsProvider === "minimax"
                        ? "bg-[#FFD93D] text-[#2D3436]"
                        : "bg-white text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    🚀 MiniMax
                  </button>
                  <button
                    onClick={() => {
                      setSettingsProvider("deepseek");
                      audio.playSound("walk");
                    }}
                    className={`py-2 px-2 border-2 border-[#2D3436] rounded-xl font-bold text-xs transition duration-150 active:scale-95 shadow-[2px_2px_0px_#2D3436] cursor-pointer text-center ${
                      settingsProvider === "deepseek"
                        ? "bg-[#FFD93D] text-[#2D3436]"
                        : "bg-white text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    🐋 DeepSeek
                  </button>
                </div>
              </div>

              {/* Conditional Inputs */}
              <div className="bg-white/50 border border-[#2D3436]/10 p-4 rounded-2xl space-y-3 shadow-inner">
                {settingsProvider === "siliconflow" ? (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-black text-[#2D3436]">SiliconFlow API Key</label>
                        {hasEnvApiKey("siliconflow") ? (
                          <span className="text-[9px] text-[#117A65] font-mono font-bold">🟢 已从环境变量安全载入</span>
                        ) : (
                          <span className="text-[9px] text-slate-400 font-mono">优先级: 本地配置优先</span>
                        )}
                      </div>
                      <input
                        type="password"
                        value={sfApiKey}
                        onChange={(e) => setSfApiKey(e.target.value)}
                        placeholder={
                          hasEnvApiKey("siliconflow")
                            ? "系统已配环境变量（隐藏保护中），在此输入可覆盖"
                            : "sk-..."
                        }
                        className="w-full p-2.5 text-xs border-2 border-[#2D3436] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD93D] font-mono bg-[#ffffff] text-[#2D3436]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-[#2D3436] block">SiliconFlow Model</label>
                      <input
                        type="text"
                        value={sfModel}
                        onChange={(e) => setSfModel(e.target.value)}
                        placeholder={DEFAULT_SILICONFLOW_MODEL}
                        className="w-full p-2.5 text-xs border-2 border-[#2D3436] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD93D] font-mono bg-[#ffffff] text-[#2D3436]"
                      />
                    </div>
                    <label className="flex items-center gap-2.5 p-2.5 bg-slate-50 border border-[#2D3436]/15 rounded-xl cursor-pointer select-none hover:bg-amber-50 transition">
                      <input
                        type="checkbox"
                        checked={enableThinking}
                        onChange={(e) => setEnableThinking(e.target.checked)}
                        className="w-3.5 h-3.5 accent-amber-500 cursor-pointer"
                      />
                      <span className="text-[11px] font-bold text-[#2D3436] leading-tight">
                        启用思考模式 (思维链)<br />
                        <span className="text-[9px] font-normal text-slate-500">仅对 DeepSeek 系列生效。默认关闭以加速响应。</span>
                      </span>
                    </label>
                  </div>
                ) : settingsProvider === "minimax" ? (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-black text-[#2D3436]">MiniMax API Key</label>
                        {hasEnvApiKey("minimax") ? (
                          <span className="text-[9px] text-[#117A65] font-mono font-bold">🟢 已从环境变量安全载入</span>
                        ) : (
                          <span className="text-[9px] text-slate-400 font-mono">优先级: 本地配置优先</span>
                        )}
                      </div>
                      <input
                        type="password"
                        value={mmApiKey}
                        onChange={(e) => setMmApiKey(e.target.value)}
                        placeholder={
                          hasEnvApiKey("minimax")
                            ? "系统已配环境变量（隐藏保护中），在此输入可覆盖"
                            : "输入你的 MiniMax API 秘钥"
                        }
                        className="w-full p-2.5 text-xs border-2 border-[#2D3436] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD93D] font-mono bg-[#ffffff] text-[#2D3436]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-[#2D3436] block">MiniMax Model</label>
                      <input
                        type="text"
                        value={mmModel}
                        onChange={(e) => setMmModel(e.target.value)}
                        placeholder="MiniMax-M2.5"
                        className="w-full p-2.5 text-xs border-2 border-[#2D3436] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD93D] font-mono bg-[#ffffff] text-[#2D3436]"
                      />
                    </div>
                  </div>
                ) : (
                  /* DeepSeek direct provider */
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-black text-[#2D3436]">DeepSeek API Key</label>
                        {hasEnvApiKey("deepseek") ? (
                          <span className="text-[9px] text-[#117A65] font-mono font-bold">🟢 已从环境变量安全载入</span>
                        ) : (
                          <span className="text-[9px] text-slate-400 font-mono">优先级: 本地配置优先</span>
                        )}
                      </div>
                      <input
                        type="password"
                        value={dsApiKey}
                        onChange={(e) => setDsApiKey(e.target.value)}
                        placeholder={
                          hasEnvApiKey("deepseek")
                            ? "系统已配环境变量（隐藏保护中），在此输入可覆盖"
                            : "sk-..."
                        }
                        className="w-full p-2.5 text-xs border-2 border-[#2D3436] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD93D] font-mono bg-[#ffffff] text-[#2D3436]"
                      />
                      <p className="text-[9px] text-slate-400 font-mono mt-1">
                        直连 api.deepseek.com，无需中转，支持 deepseek-chat / deepseek-reasoner
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-[#2D3436] block">DeepSeek Model</label>
                      <input
                        type="text"
                        value={dsModel}
                        onChange={(e) => setDsModel(e.target.value)}
                        placeholder="deepseek-chat"
                        className="w-full p-2.5 text-xs border-2 border-[#2D3436] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD93D] font-mono bg-[#ffffff] text-[#2D3436]"
                      />
                    </div>
                    <label className="flex items-center gap-2.5 p-2.5 bg-slate-50 border border-[#2D3436]/15 rounded-xl cursor-pointer select-none hover:bg-amber-50 transition">
                      <input
                        type="checkbox"
                        checked={enableThinking}
                        onChange={(e) => setEnableThinking(e.target.checked)}
                        className="w-3.5 h-3.5 accent-amber-500 cursor-pointer"
                      />
                      <span className="text-[11px] font-bold text-[#2D3436] leading-tight">
                        启用思考模式 (Reasoner)<br />
                        <span className="text-[9px] font-normal text-slate-500">使用 deepseek-reasoner 时建议开启，deepseek-chat 无需开启。</span>
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Connection Test Section */}
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={isTesting}
                  onClick={handleTestConnection}
                  className={`w-full py-2 bg-[#FFD93D] hover:bg-[#F4D03F] text-[#2D3436] text-xs font-black border-2 border-[#2D3436] rounded-xl transition shadow-[2px_2px_0px_#2D3436] active:translate-y-[1px] active:shadow-[1px_1px_0px_#2D3436] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isTesting ? (
                    <>⏳ 正在测试网关连通性...</>
                  ) : (
                    <>⚡ 一键测试网关连接</>
                  )}
                </button>

                {testResult && (
                  <div
                    className={`p-3 border-2 border-[#2D3436] rounded-xl text-xs font-bold shadow-[2px_2px_0px_#2D3436] transition-all animate-fade-in ${
                      testResult.success
                        ? "bg-[#E8F8F5] text-[#117A65]"
                        : "bg-[#FDEDEC] text-[#922B21]"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-sm shrink-0">{testResult.success ? "✅" : "❌"}</span>
                      <div className="leading-relaxed">
                        <p className="font-black text-[11px] uppercase tracking-wider">
                          {testResult.success ? "时空网关正常" : "时空网关受阻"}
                        </p>
                        <p className="text-[10px] font-mono mt-0.5 whitespace-pre-wrap break-all">
                          {testResult.message}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tips */}
              <div className="text-[10px] text-slate-500 font-bold leading-relaxed bg-[#EAF6FF] p-2 border border-[#2D3436]/10 rounded-xl">
                💡 <b>提示:</b> 密钥将安全地保存在你本地浏览器的 LocalStorage 中，不会泄露。若不配置，将默认读取环境变量中系统分配的公共 Key (如存在的话)。
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    const settingsToSave = {
                      provider: settingsProvider,
                      siliconFlowApiKey: sfApiKey.trim(),
                      siliconFlowModel: sfModel.trim() || DEFAULT_SILICONFLOW_MODEL,
                      minimaxApiKey: mmApiKey.trim(),
                      minimaxModel: mmModel.trim() || "MiniMax-M2.5",
                      deepseekApiKey: dsApiKey.trim(),
                      deepseekModel: dsModel.trim() || "deepseek-chat",
                      enableThinking,
                      localMode,
                    };
                    saveApiSettings(settingsToSave);
                    setHasApiKey(hasSiliconFlowKey());
                    setShowSettingsModal(false);
                    audio.playSound("bling");
                    setSystemAlertMessage(`🎉 网关配置更新成功！当前已切换至：${
                      settingsProvider === "minimax" ? "MiniMax (海螺AI)"
                      : settingsProvider === "deepseek" ? "DeepSeek (深度求索)"
                      : "SiliconFlow (硅基流动)"
                    }。`);
                  }}
                  className="w-full py-3 bg-[#6BCB77] hover:bg-[#52a35e] text-white text-xs font-black border-2 border-[#2D3436] rounded-xl transition shadow-[3px_3px_0px_#2D3436] active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 size={14} /> 保存时空网关配置
                </button>
                <button
                  onClick={() => {
                    setShowSettingsModal(false);
                    audio.playSound("walk");
                  }}
                  className="w-full py-2 bg-white hover:bg-slate-50 text-[#2D3436] border-2 border-[#2D3436] rounded-xl text-[10px] font-mono font-black shadow-[2px_2px_0px_#2D3436] cursor-pointer transition"
                >
                  取消，保持原有配置
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-slate-900 border-t-2 border-slate-800 py-4 px-4 text-center text-xs text-slate-500 font-mono relative z-40">
        <div className="max-w-7xl mx-auto space-y-2">
          <p>© 2026 《一分钟老板》AI探索实验室. 有钱人的快乐往往比你想象得更无厘头。</p>
          <div className="flex justify-center items-center gap-3">
            <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">Coded in Cloud Run</span>
            <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{activeWorldEngineLabel}</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
