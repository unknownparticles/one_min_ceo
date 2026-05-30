/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
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
  Tv,
  ArrowRight
} from "lucide-react";
import { PixelMap } from "./components/PixelMap";
import { SpriteRenderer } from "./components/SpriteRenderer";
import { Position, NPC, Item, WorldScenario, InteractionResult, EndingResult, SavedLife, DailyChallenge, BossIdentityType } from "./types";
import { getDailyChallenge } from "./utils/dailyPresets";
import { audio } from "./utils/audio";
import { generateEnding, generateInteraction, generateWorld, hasSiliconFlowKey } from "./utils/siliconFlow";
import { getResourcePack } from "./utils/resourceKit";

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

export default function App() {
  // Game States
  const [gameState, setGameState] = useState<"lobby" | "loading" | "playing" | "ending" | "ad_sim">("lobby");
  
  // Custom or pre-selected choices
  const [selectedPreset, setSelectedPreset] = useState<typeof PRESETS[0]>(PRESETS[0]);
  const [customIdentityInput, setCustomIdentityInput] = useState<string>("");
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  
  // Lobby Subtabs
  const [activeTab, setActiveTab] = useState<"normal" | "presets" | "album" | "daily" | "vip">("normal");
  const [isVip, setIsVip] = useState<boolean>(false);
  const [wangDuoyuConcept, setWangDuoyuConcept] = useState<string>("");

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
  
  // UI audio state
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [systemAlertMessage, setSystemAlertMessage] = useState<string | null>(null);

  // Ticker text cycles
  const [tickerIndex, setTickerIndex] = useState<number>(0);
  
  // Simulated Time Machine Bribes / Ads state
  const [simulatedAdCountdown, setSimulatedAdCountdown] = useState<number>(5);
  const [simulatedAdText, setSimulatedAdText] = useState<string>("");

  const AD_PITCHES = [
    "🚀 【马斯克星际植发诊所】: 只要两微克小行星尘埃，让您的秀发在真空宇宙里依然飘逸！首单买一送一，带上你的私人保镖更有8折折扣！",
    "🧀 【梵蒂冈至臻奶酪集团】: 选用世界首富自家养殖的快乐阿尔卑斯彩虹牛，配以红衣主教颂唱。一口，升华你的名流味蕾！",
    "💼 【开曼群岛保密信托：后悔良药版】: 只要看5秒广告，您的资产就能在宇宙大爆炸中完美转移，不可追溯！",
    "🛸 【天星观察狗狗零食商】: 为隐藏在地球各个角落的智能外星特工狗制造的奢华零食。喂它一颗，拯救地球的一分钟！"
  ];

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

    // Load saved ending cards
    const cached = localStorage.getItem("boss_minute_endings");
    if (cached) {
      try {
        setSavedEndings(JSON.parse(cached));
      } catch (e) {
        setSavedEndings([]);
      }
    }

    // Ticker timer interval
    const tInterval = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % METADATA_TICKERS.length);
    }, 6000);

    return () => clearInterval(tInterval);
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
  const handleStartGame = async (dailyPrompt?: string, dailyType?: BossIdentityType) => {
    // Play entry bling
    audio.playSound("bling");
    setGameState("loading");
    setTimer(60.0);
    setHistoryLog([]);
    setCurrentDialogueHistory([]);
    setLastInteractedEntity(null);
    setInteractionResult(null);
    setEntityStageMap({});
    setActionSequence([]);

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
      finalPrompt = `你是普通人王多鱼，大发横财需要败光三百万！当前的随机时间瞬间落在：『${randMoment.title}』，你的创业败家商业构思是：${wangDuoyuConcept.trim() || '把北极融化的冰用游艇运到沙特卖，或者推行减肥放电脂肪险'}`;
    } else {
      chosenIdentity = dailyType || selectedPreset.type;
      finalPrompt = dailyPrompt || customIdentityInput;
    }

    window.localStorage.setItem("currentIdentityType", chosenIdentity);

    try {
      const worldData = await generateWorld(chosenIdentity, finalPrompt);
      setWorldScenario(worldData);
      setPlayerPos(worldData.playerPosition);
      setGameState("playing");

      // Play thematic BGM synthesiser
      audio.playBGM(worldData.ambientMusic || "corporate-jazz");
    } catch (error: any) {
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

    try {
      // Find local pre-generated storyline
      const npc = worldScenario?.npcs?.find(n => n.id === id);
      const item = worldScenario?.items?.find(it => it.id === id);
      const entity = npc || item;

      if (entity && entity.storyline && entity.storyline.length > 0) {
        const stageIndex = entityStageMap[id] || 0;
        if (stageIndex < entity.storyline.length) {
          const step = entity.storyline[stageIndex];
          setInteractionResult({
            text: step.text,
            options: step.options.map((opt: any, idx: number) => ({
              label: opt.label,
              action: `option_${idx}`
            })),
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
      }

      const data = await generateInteraction({
        identity: worldScenario?.identity,
        theme: worldScenario?.theme,
        targetType: type,
        targetName: name,
        targetId: id,
        dialogueHistory: currentDialogueHistory,
        playerAction: "First approach"
      });
      setInteractionResult(data);

      if (data.soundHint) {
        audio.playSound(data.soundHint);
      }

      if (data.isEarlyEnd) {
        setTimeout(() => {
          handleTriggerEnding();
        }, 3500);
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
      handleTriggerEnding();
      return;
    }

    // 2. Custom text input
    if (actionKey === "custom") {
      try {
        const data = await generateInteraction({
          identity: worldScenario.identity,
          theme: worldScenario.theme,
          targetType: lastInteractedEntity.type,
          targetName: lastInteractedEntity.name,
          targetId: lastInteractedEntity.id,
          dialogueHistory: [...currentDialogueHistory, `Action: ${currentText}`],
          playerAction: currentText
        });

        // Log custom reaction
        setHistoryLog(prev => [
          ...prev,
          {
            entity: lastInteractedEntity.name,
            action: currentText,
            outcome: data.text
          }
        ]);

        if (data.timeDelta) {
          setTimer(t => {
            const next = Math.max(0, t + data.timeDelta);
            return parseFloat(next.toFixed(1));
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
          timeDelta: data.timeDelta || 0,
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
        setHistoryLog(prev => [
          ...prev,
          {
            entity: lastInteractedEntity.name,
            action: currentText,
            outcome: "由于时空扭曲风暴过强，该条因果线在一阵奢华金光中自我重组归于平静。"
          }
        ]);
        setInteractionResult(null);
        setLastInteractedEntity(null);
      } finally {
        setIsAiLoading(false);
      }
      return;
    }

    // 3. Local pre-generated options
    try {
      const npc = worldScenario.npcs.find(n => n.id === lastInteractedEntity.id);
      const item = worldScenario.items.find(i => i.id === lastInteractedEntity.id);
      const entity = npc || item;

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

        // Deduct time
        if (opt.timeDelta) {
          setTimer(t => {
            const next = Math.max(0, t + opt.timeDelta);
            return parseFloat(next.toFixed(1));
          });
        }

        if (opt.soundHint) {
          audio.playSound(opt.soundHint);
        }

        // Log choice
        setHistoryLog(prev => [
          ...prev,
          {
            entity: lastInteractedEntity.name,
            action: opt.label,
            outcome: opt.outcomeText
          }
        ]);

        const nextStageMap = {
          ...entityStageMap,
          [lastInteractedEntity.id]: stageIndex + 1
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
          timeDelta: opt.timeDelta || 0,
          isEarlyEnd: !!opt.isEarlyEnd
        });

        setEntityStageMap(nextStageMap);

        setCurrentDialogueHistory(h => [...h, `你选择: ${opt.label}`, `反馈: ${opt.outcomeText}`]);

        if (opt.isEarlyEnd) {
          setTimeout(() => {
            handleTriggerEnding();
          }, 3500);
        }
      } else {
        // Fallback action handle
        setHistoryLog(prev => [
          ...prev,
          {
            entity: lastInteractedEntity.name,
            action: currentText,
            outcome: "时空节点已归顺，继续去探索其他锚点吧！"
          }
        ]);
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
    setInteractionResult(null);
    setLastInteractedEntity(null);
  };

  // Render Ending Assessment Screen
  const handleTriggerEnding = async () => {
    setGameState("loading");
    audio.stopBGM();
    audio.playSound("explosion");

    try {
      const data = await generateEnding({
        identity: worldScenario?.identity || selectedPreset.name,
        theme: worldScenario?.theme || "一分钟富豪试炼",
        spentTime: 60 - timer,
        interactionLog: historyLog,
        actionSequence: actionSequence,
        fixedEndings: worldScenario?.fixedEndings || []
      });
      setEndingResult(data);

      // Save to Collection in localStorage
      const newSavedEnding: SavedLife = {
        ...data,
        identityName: worldScenario?.identity || selectedPreset.name,
        identityType: (window.localStorage.getItem("currentIdentityType") as BossIdentityType) || "CEO",
        theme: worldScenario?.theme || "纳斯达克终极一分钟",
        timestamp: new Date().toLocaleDateString()
      };

      const updatedCollection = [newSavedEnding, ...savedEndings].slice(0, 15); // preserve top 15 records
      setSavedEndings(updatedCollection);
      localStorage.setItem("boss_minute_endings", JSON.stringify(updatedCollection));

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
        }
      };
      setEndingResult(fallbackEnd);

      const cachedEnd: SavedLife = {
        ...fallbackEnd,
        identityName: worldScenario?.identity || selectedPreset.name,
        identityType: (window.localStorage.getItem("currentIdentityType") as BossIdentityType) || "CEO",
        theme: worldScenario?.theme || "一分钟终极回溯",
        timestamp: new Date().toLocaleDateString()
      };
      const updated = [cachedEnd, ...savedEndings];
      setSavedEndings(updated);
      localStorage.setItem("boss_minute_endings", JSON.stringify(updated));

      setGameState("ending");
    }
  };

  // Time Machine Simulated Bribe Ad Watch
  const handleWatchAdToRewind = () => {
    audio.playSound("warn");
    setGameState("ad_sim");
    setSimulatedAdCountdown(5);
    // Draw a random funny ad pitch
    const pitch = AD_PITCHES[Math.floor(Math.random() * AD_PITCHES.length)];
    setSimulatedAdText(pitch);

    const timer = setInterval(() => {
      setSimulatedAdCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Rewind game to 35 seconds remainder on map!
          setTimer(35.0);
          setGameState("playing");
          if (worldScenario) {
            audio.playBGM(worldScenario.ambientMusic);
          }
          audio.playSound("bling");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
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
    setGameState("lobby");
    setWorldScenario(null);
    setInteractionResult(null);
  };

  const previewResourcePack = worldScenario?.resourcePack || getResourcePack(
    activeTab === "normal" ? "CEO" : selectedPreset.type,
    worldScenario?.theme || selectedPreset.name
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between overflow-x-hidden relative selection:bg-emerald-500 selection:text-black">
      
      {/* Absolute high-contrast pixelated header and banner */}
      <header className="bg-slate-900/85 backdrop-blur-md border-b border-slate-800 py-3 px-4 shadow-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer select-none active:scale-95 transition-all" onClick={handleBackToLobby}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center border border-emerald-300/70 bg-slate-950 shadow neon-glow-emerald overflow-hidden">
              <img src="/logo.svg" alt="一分钟老板 Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-mono text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                一分钟老板 <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-black tracking-widest animate-pulse">AI NATIVE</span>
              </h1>
              <p className="text-[9px] text-slate-450 font-mono tracking-widest">ONE MINUTE BOSS • PIXEL ADVENTURE</p>
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

          {/* 1. LOBBY STATE */}
          {gameState === "lobby" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
              
              {/* Left Column: Selector and prompt */}
              <div className="lg:col-span-7 bg-slate-900 rounded-3xl border border-slate-800/80 p-6 md:p-8 shadow-2xl relative overflow-hidden neon-glow-emerald glass-panel">
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
                              setIsVip(true);
                              audio.playSound("bling");
                              setSystemAlertMessage("📣 恭喜！您已成功假冒并一键激活【永久尊贵VIP特权】！世袭权贵选项已可以自由调遣！");
                            }}
                            className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-350 hover:to-yellow-450 text-slate-955 font-mono font-black text-[10px] rounded-xl transition duration-150 active:scale-95 shadow-md shadow-amber-955/40 cursor-pointer inline-block border-b-2 border-amber-600 animate-pulse"
                          >
                            💳 零元尊享：一键免费升级 VIP
                          </button>
                        </div>
                      ) : (
                        <>
                          <label className="block text-xs font-mono font-bold text-slate-350 uppercase tracking-widest">
                            选择你的天生神豪血脉:
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-1">
                            {PRESETS.map((p) => (
                              <button
                                key={p.type}
                                onClick={() => {
                                  setSelectedPreset(p as any);
                                  audio.playSound("walk");
                                }}
                                className={`p-4 rounded-2xl border text-left transition-all duration-300 active:scale-95 cursor-pointer relative overflow-hidden group flex items-start gap-4 ${
                                  selectedPreset.type === p.type
                                    ? "bg-slate-800 border-emerald-450 shadow-xl shadow-emerald-955/50 text-emerald-350 scale-[1.02] ring-1 ring-emerald-500/30 neon-glow-emerald"
                                    : "bg-slate-950/45 border-slate-850 hover:border-slate-700 text-slate-300 hover:bg-slate-850/60"
                                }`}
                              >
                                {/* Absolute subtle decorative background glow */}
                                <div className={`absolute top-0 right-0 w-16 h-16 -mr-4 -mt-4 rounded-full blur-xl transition-all duration-300 ${
                                  selectedPreset.type === p.type ? "bg-emerald-500/15" : "bg-transparent group-hover:bg-slate-700/10"
                                }`} />

                                {/* Left Side: Pixel Art character slot */}
                                <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-300 ${
                                  selectedPreset.type === p.type
                                    ? "bg-slate-950 border-emerald-450/50 scale-105 shadow-inner"
                                    : "bg-slate-900 border-slate-850 group-hover:border-slate-700 shadow"
                                }`}>
                                  <SpriteRenderer type={p.type.toLowerCase()} size={32} className="group-hover:scale-110 transition-transform duration-200" />
                                </div>

                                {/* Right Side: metadata & naming */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 justify-between">
                                    <h4 className="font-mono font-bold text-xs truncate text-white group-hover:text-emerald-350 transition-colors">
                                      {p.name}
                                    </h4>
                                    <span className="text-[8px] bg-slate-955 px-1 border border-slate-850 font-mono text-slate-500 rounded uppercase">
                                      {p.type}
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
                            ))}
                          </div>

                          {/* Beautiful dedicated narrative lore container */}
                          <div className="mt-4 p-4 bg-gradient-to-r from-slate-955 to-slate-900 rounded-xl border border-slate-850 text-xs text-slate-450 leading-relaxed font-mono relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full filter blur-xl pointer-events-none" />
                            <span className="text-[10px] bg-emerald-400/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider block w-fit mb-2">
                              🔮 极尊特权时空画卷 (Active Identity Lore)
                            </span>
                            <p className="text-slate-350">
                              时空穿梭已锚定扮演：<span className="text-emerald-450 font-extrabold underline decoration-emerald-500/40 underline-offset-4">{selectedPreset.name}</span>。{selectedPreset.description}。AI 时空天线将基于您的多重交互来推演专属的富豪六十秒微缩景观。
                            </p>
                          </div>

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
                              setIsVip(true);
                              audio.playSound("bling");
                              setSystemAlertMessage("📣 恭喜！您已成功开通并在时空法庭冒充【永久尊贵VIP超级勋爵】！每日挑战剧本包已完全解锁！");
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
                              setIsVip(!isVip);
                              audio.playSound("bling");
                              setSystemAlertMessage(isVip ? "🔇 已回到质朴可亲的普通人视角。" : "📣 极速尊享！已开启永久高级VIP特许契约！");
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
                        <div className="p-3.5 bg-slate-900 border border-emerald-500/20 rounded-xl relative overflow-hidden">
                          <span className="absolute top-1 right-2 font-mono text-[8px] text-emerald-450 animate-pulse bg-emerald-950 px-1.5 rounded">
                            HOT 免费开通
                          </span>
                          <h4 className="text-xs font-mono font-bold text-white flex items-center gap-1">
                            <Plus size={14} className="text-emerald-500" /> 时空观察者 (月卡)
                          </h4>
                          <p className="text-[9px] text-slate-450 mt-1.5 leading-relaxed">解锁高维观察日志、无限时光回溯特权以及每日不限次数平行世界探寻。</p>
                          <span className="text-xs font-mono text-emerald-450 block mt-2 font-extrabold">¥0.00 / 极乐体验</span>
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
                  <button
                    onClick={() => handleStartGame()}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-mono font-bold tracking-widest text-sm rounded-xl transition duration-150 active:scale-98 shadow-md shadow-emerald-900/20 cursor-pointer flex items-center justify-center gap-2 select-none"
                  >
                    <Sparkles size={16} className="animate-spin" />
                    开启你的一分钟富豪命运
                  </button>
                  <p className="text-center font-mono text-[9px] text-slate-500 mt-3">
                    *本产品使用 SiliconFlow 模型在云端运行全量像素世界动态生成，无剧情限制。
                  </p>
                </div>

              </div>

              {/* Right Column: Visual Poster Card representation */}
              <div className="lg:col-span-5 bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col justify-between aspect-auto">
                <div className="space-y-4">
                  <div className="bg-slate-950 p-2 border border-slate-800 rounded flex justify-between items-center text-[10px] font-mono text-slate-500">
                    <span>系统状态: 接入神功</span>
                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> 实时就绪</span>
                  </div>

                  <div className="bg-slate-950 border-2 border-slate-850 rounded-xl relative overflow-hidden p-4 group">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.04)_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                    <div className="relative z-10 flex items-start gap-4">
                      <img src="/logo.svg" alt="一分钟老板资源标识" className="w-20 h-20 rounded-2xl border border-emerald-500/40 shadow-lg shadow-emerald-950/60 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase">
                          RESOURCE KIT
                        </span>
                        <h3 className="font-mono text-sm font-bold text-white mt-2 leading-tight">
                          {previewResourcePack.posterTitle}
                        </h3>
                        <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                          {previewResourcePack.posterSubtitle}
                        </p>
                      </div>
                    </div>

                    <div className="relative z-10 grid grid-cols-4 gap-2 mt-4">
                      {Object.entries(previewResourcePack.palette).map(([name, color]) => (
                        <div key={name} className="h-10 rounded-lg border border-slate-800 shadow-inner" style={{ backgroundColor: color }} title={`${name}: ${color}`}>
                          <span className="sr-only">{name}</span>
                        </div>
                      ))}
                    </div>

                    <div className="relative z-10 mt-4 grid grid-cols-3 gap-2">
                      {previewResourcePack.spriteSet.slice(0, 6).map(sprite => (
                        <div key={sprite} className="h-16 bg-slate-900/85 border border-slate-800 rounded-lg flex flex-col items-center justify-center gap-1">
                          <SpriteRenderer type={sprite} size={28} />
                          <span className="text-[8px] font-mono text-slate-500 uppercase">{sprite}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-mono text-[11px] font-bold text-slate-300 uppercase tracking-wider block">生成资源规格:</h4>
                    <div className="grid grid-cols-1 gap-2 text-[10px] font-mono">
                      <div className="p-2.5 bg-slate-950 border border-slate-850 rounded-lg">
                        <span className="text-emerald-400 font-bold block">地块</span>
                        <p className="text-slate-450 mt-1">{previewResourcePack.tileSet.join(" / ")}</p>
                      </div>
                      <div className="p-2.5 bg-slate-950 border border-slate-850 rounded-lg">
                        <span className="text-amber-400 font-bold block">物件</span>
                        <p className="text-slate-450 mt-1">{previewResourcePack.propSet.slice(0, 8).join(" / ")}</p>
                      </div>
                      <div className="p-2.5 bg-slate-950 border border-slate-850 rounded-lg">
                        <span className="text-sky-400 font-bold block">氛围</span>
                        <p className="text-slate-450 mt-1">{previewResourcePack.ambiance.slice(0, 3).join(" / ")}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl mt-6 text-center">
                  <span className="text-[10px] text-emerald-400 font-mono font-bold block">💡 想开启更离奇人生吗？</span>
                  <p className="text-[9px] font-mono text-slate-450 mt-1">
                    在左侧“自定义特征”中随心所欲输入你的背景吧，AI 将自动融合至生成的地图与互动物体中。
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* 2. LOADING STATE */}
          {gameState === "loading" && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 shadow-2xl text-center max-w-md mx-auto space-y-8 animate-pulse">
              <div className="relative inline-block">
                <div className="w-16 h-16 rounded-full border-4 border-slate-850 border-t-emerald-500 animate-spin"></div>
                <img src="/logo.svg" alt="一分钟老板 Logo" className="absolute inset-2 rounded-full" />
              </div>
              <div className="space-y-3">
                <h3 className="font-mono text-lg font-bold text-white">时空资源包正在链上组装...</h3>
                <p className="text-xs text-emerald-400 font-mono">
                  [
                  {["正在贿赂纳斯达克签约代表...", 
                    "正在测试皇家游艇紧急呼叫浮油瓶...", 
                    "正在给外星特工狗喂养高级罐头...", 
                    "正在微调阿尔卑斯雪道的重力透镜...", 
                    "正在将所有美元转换成原子能燃料..."][Math.floor(Date.now() / 2000) % 5]}
                  ]
                </p>
                <p className="text-[10px] text-slate-450 leading-relaxed font-mono pt-4">
                  “一分钟不长，但足够你在量子荒野里来回挥霍几十个来回。”
                </p>
              </div>
            </div>
          )}

          {/* 3. PLAYING STATE */}
          {gameState === "playing" && worldScenario && (
            <div className="space-y-4">
              
              {/* Gameplay Top Status HUD */}
              <div className="bg-slate-900 rounded-2xl border border-slate-850 p-4 flex items-center justify-between shadow-lg">
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
                  
                  {/* Encounter dialogue box */}
                  <div className="bg-slate-955/90 border-2 border-emerald-500/40 shadow-2xl rounded-3xl p-5 flex-grow flex flex-col justify-between min-h-[300px] relative overflow-hidden neon-glow-emerald">
                    {/* Corner decors */}
                    <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-emerald-400 opacity-60"></div>
                    <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-emerald-400 opacity-60"></div>
                    <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-emerald-400 opacity-60"></div>
                    <div className="absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 border-emerald-400 opacity-60"></div>
                    
                    {!interactionResult ? (
                      <div className="text-center py-12 px-4 space-y-3 font-mono">
                        <div className="text-2xl animate-pulse">🛰️</div>
                        <h4 className="text-xs font-bold text-slate-300">雷达因果网络</h4>
                        <p className="text-[10px] text-slate-550 leading-relaxed">
                          当前没有进行中的事件。请移动屏幕中的老板角色（金色头饰），走到
                          <span className="text-amber-400 font-bold">【互动物品】</span> 或
                          <span className="text-sky-400 font-bold">【NPC人物】</span> 正上方来引发不可预期的蝴蝶因果吧！
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col justify-between h-full space-y-4">
                        <div>
                          <div className="flex items-center justify-between border-b border-slate-850 pb-2 mb-3">
                            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-bold">
                              {lastInteractedEntity?.type === "NPC" ? "👥 面对面因果" : "🔍 物品机密"}
                            </span>
                            <span className="text-[10px] text-slate-450 font-mono">
                              {lastInteractedEntity?.name}
                            </span>
                          </div>

                          <div className="text-xs font-mono text-slate-200 leading-relaxed bg-slate-950/65 p-3.5 rounded-xl border border-slate-850 max-h-[140px] overflow-y-auto">
                            {/* Simple dynamic typewriter simulation */}
                            <p className="whitespace-pre-line leading-relaxed">{interactionResult.text}</p>
                          </div>

                          {/* Time penalty alert if any */}
                          {interactionResult.timeDelta !== 0 && (
                            <div className="mt-2 text-[9px] font-mono text-rose-400 bg-rose-950/20 border border-rose-900/30 px-2 py-0.5 rounded flex items-center gap-1 shadow">
                              <span>⚠️ 此时空决策导致时间损耗: </span>
                              <strong className="font-bold">{interactionResult.timeDelta}秒</strong>
                            </div>
                          )}
                        </div>

                        {/* Interactive Branches options */}
                        <div className="space-y-3">
                          
                          {/* If early end, show caution */}
                          {interactionResult.isEarlyEnd ? (
                            <div className="p-3 bg-red-950/30 border border-red-500/25 rounded-2xl text-center space-y-1.5">
                              <span className="text-[10px] text-red-400 font-mono font-bold block animate-bounce">
                                🚨 因果彻底碎裂！
                              </span>
                              <p className="text-[9px] font-mono text-slate-400">
                                这个举动太荒谬了，导致资产在时空奇点中提前蒸发！正在结算传奇终章卡片...
                              </p>
                            </div>
                          ) : (
                            <>
                              {isAiLoading ? (
                                <div className="text-center py-4 font-mono text-[10px] text-emerald-400 tracking-wider">
                                  <span>🚀 时空对流计算中，请端庄呼吸...</span>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {interactionResult.options.map((opt, i) => (
                                    <button
                                      key={i}
                                      onClick={() => handleResolveAction(opt.label, opt.action)}
                                      className="w-full text-left p-3 bg-slate-900 hover:bg-emerald-950/40 text-xs text-white border border-slate-800 hover:border-emerald-500/50 rounded-2xl transition-all duration-200 active:scale-98 shadow flex items-center justify-between group cursor-pointer"
                                    >
                                      <span className="group-hover:text-emerald-350 transition-colors">{opt.label}</span>
                                      <ChevronRight size={14} className="text-slate-500 group-hover:text-emerald-450 group-hover:translate-x-1 transition-all shrink-0" />
                                    </button>
                                  ))}
                                </div>
                              )}

                              {/* Free text prompt input */}
                              {interactionResult.allowsFreeInput && !isAiLoading && (
                                <div className="flex gap-2 pt-2 border-t border-slate-850/60">
                                  <input
                                    type="text"
                                    value={customActionValue}
                                    onChange={(e) => setCustomActionValue(e.target.value)}
                                    placeholder="输入自定义荒诞动作..."
                                    className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 font-mono text-xs text-white focus:outline-none focus:border-emerald-500 transition shadow-inner"
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
                                    className="px-3 py-2 bg-emerald-500 hover:bg-emerald-450 text-slate-950 rounded-xl font-mono text-xs font-bold active:scale-95 cursor-pointer flex items-center justify-center shrink-0 shadow-md border-b-2 border-emerald-600"
                                  >
                                    <ArrowRight size={16} />
                                  </button>
                                </div>
                              )}

                              <button
                                onClick={handleCloseDialogue}
                                className="w-full py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-450 rounded-xl text-[10px] font-mono hover:text-white mt-1 cursor-pointer transition select-none"
                              >
                                回到探索地图
                              </button>
                            </>
                          )}

                        </div>

                      </div>
                    )}

                  </div>

                  {/* Active inventory traces logs */}
                  <div className="bg-slate-900 rounded-2xl border border-slate-850 p-4 shadow-xl flex flex-col justify-between max-h-[220px]">
                    <div className="border-b border-slate-850 pb-1.5 mb-2 flex items-center justify-between text-[10px] font-mono text-slate-450 uppercase">
                      <span>📜 老板因果印记</span>
                      <span>已记录 {historyLog.length} 条</span>
                    </div>

                    <div className="space-y-2 overflow-y-auto max-h-[160px] pr-1 scrollbar-none font-mono text-[10px] text-slate-400 leading-snug">
                      {historyLog.length === 0 ? (
                        <p className="text-slate-600 text-center py-4">您的这一分钟尚未产生深层的时空刻痕。</p>
                      ) : (
                        historyLog.map((log, index) => (
                          <div key={index} className="p-1.5 bg-slate-950/40 rounded border border-slate-850">
                            <span className="text-emerald-400">❖ {log.entity}</span>
                            <p className="text-slate-300 italic pl-2">你选择做: &quot;{log.action}&quot;</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>

              </div>

              {/* Forced manual settle button if player is bored */}
              <div className="text-center pt-2">
                <button
                  onClick={handleTriggerEnding}
                  className="font-mono text-xs text-slate-500 hover:text-rose-400 hover:underline cursor-pointer flex items-center justify-center gap-1 mx-auto"
                >
                  <RotateCcw size={12} /> 提前中断并结算此生 (看透浮名)
                </button>
              </div>

            </div>
          )}

          {/* 4. ADVERTISING TIME MACHINE SIMULATION */}
          {gameState === "ad_sim" && (
            <div className="max-w-md mx-auto bg-slate-900 border-4 border-amber-500 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs bg-amber-500 text-slate-950 font-bold px-2 rounded font-mono tracking-widest flex items-center gap-1">
                  <Tv size={12} /> 时空宽带广告特许
                </span>
                <div className="font-mono text-xs text-amber-500 font-bold animate-pulse">
                  广告倒计时: {simulatedAdCountdown} 秒
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl relative overflow-hidden space-y-3">
                <span className="text-2xl block animate-bounce">📺</span>
                <p className="text-xs font-mono font-bold text-white tracking-tight">今日富豪后悔特供赞助:</p>
                <p className="text-xs font-mono text-slate-300 leading-relaxed italic bg-slate-900 p-3 rounded border border-slate-850">
                  {simulatedAdText}
                </p>
              </div>

              <div className="bg-emerald-950/20 border border-emerald-500/20 p-3 rounded-xl text-center">
                <span className="text-[10px] font-mono text-emerald-400 font-bold block animate-bounce">⏳ 广告结束后自动回溯:</span>
                <p className="text-[9px] font-mono text-slate-450 mt-1">
                  你将重回人生中段！携带已有的蝴蝶钥匙，回到最后 30.0 秒 重新来过！
                </p>
              </div>

              <span className="text-[9px] font-mono text-slate-600 block text-center">
                *这只是纯本土单机广告讽刺模拟，无真实广告弹出。
              </span>
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
                className="bg-slate-900 border-4 border-double border-emerald-450 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden neon-glow-emerald"
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

                {/* Rewind ad trigger */}
                <button
                  onClick={handleWatchAdToRewind}
                  className="p-3 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-mono font-bold text-xs rounded-xl transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  title="模拟看广告重来"
                >
                  <Tv size={14} /> 后悔良药 (时光机重来)
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

      {/* Footer */}
      <footer className="bg-slate-900 border-t-2 border-slate-800 py-4 px-4 text-center text-xs text-slate-500 font-mono relative z-40">
        <div className="max-w-7xl mx-auto space-y-2">
          <p>© 2026 《一分钟老板》AI探索实验室. 有钱人的快乐往往比你想象得更无厘头。</p>
          <div className="flex justify-center items-center gap-3">
            <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">Coded in Cloud Run</span>
            <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">SiliconFlow Dynamic World</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
