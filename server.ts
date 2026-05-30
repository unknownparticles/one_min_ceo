import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { getFallbackScenario } from "./serverFallback";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK lazily to prevent startup crash if GEMINI_API_KEY is not immediately provided
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Ensure the server doesn't crash on startup if API key is not yet set
app.use((req, res, next) => {
  // Simple check for secrets availability
  next();
});

// ==========================================
// API Endpoint 1: Generate Boss World
// ==========================================
app.post("/api/boss/generate-world", async (req, res) => {
  try {
    const { identity, customPrompt } = req.body;
    const ai = getGeminiClient();

    const systemPrompt = `You are the master pixel world generator for "One Minute Boss" (一分钟老板).
Generate a completely unique retro top-down tile-map scenario based on the player's identity (or randomized identity if none or "random" is selected).
Identities could be: CEO, Skiing Champion (滑雪冠军), Deep-sea Diver (深海潜水员), Private Jet Captain (私人飞机机长), Master Chef (名厨), Wilderness Explorer (荒野探险家), Space Traveler (太空探索者), World's Richest Person (世界首富), etc.

Ensure you place 4 to 6 NPCs and 4 to 6 interactive items with proper coordinates that DO NOT collide with the player's coordinates or each other. Keep coords within x in [1, 14] and y in [1, 10] to avoid spawning in border walls.
The map grid is 16 columns (x from 0 to 15) and 12 rows (y from 0 to 11).
Tiles must contain keywords: 'floor', 'wall', 'carpet', 'grass', 'snow', 'water', 'deck', 'road', 'metal_plate'. Keep tiles visually matched to the scene (e.g. Ski Champion gets snow/floor, CEO gets floor/carpet/wall, Diver gets deck/water, Space Traveler gets metal_plate/wall, etc.).

CRITICAL RESOLUTION RULES:
1. For EVERY SINGLE NPC and Item, pre-generate their entire interactive branching storyline (exactly 3 sequential StorySteps).
2. For EVERY option inside options array of each StoryStep, assigning a unique, highly descriptive semantic code to "actionId" (e.g. "kick_dog", "pet_dog", "beat_investor", "soothe_investor", "ignite_fire", "open_sprinkler", "dial_alien"). This actionId tracks choices and triggers ending combinations.
3. Pre-generate 4 to 6 completely unique "fixedEndings" (固定结局) for this scenario!
   These fixed endings reflect the combinations and chronological order of choices chosen by the player.
   Define specific outcomes with 'triggerRules':
     - Single key action trigger (e.g., mustInclude contains "kick_dog").
     - Multi-action combination (e.g., mustInclude contains "beat_investor" AND "kick_dog").
     - Sequential order trigger (e.g., requiredSequence is ["ignite_fire", "open_sprinkler"] triggers "firefighting hero ending", while requiredSequence is ["open_sprinkler", "ignite_fire"] triggers "foolish drowned engine ending").
     - Define "priority" score: priority is 1-2 for simple single triggers, and 3+ for combinations or sequence triggers. Higher priority matches first!

Reference assets from design sources:
- NPCs: 'secretary' (助理), 'butler' (管家/保镖), 'investor' (投资人), 'robot' (机器人/哈士奇), 'alien' (外星人/科学家), 'guard' (保卫员).
- Items: 'desk' (办公桌), 'pen' (百亿钢笔), 'coffee' (高能咖啡机), 'chest' (保险箱), 'golf_ball' (定位高尔夫球), 'shoe' (金鞋), 'lever' (拉杆), 'rocket_button' (火箭按钮), 'egg' (外星蛋).
Ensure everything returned is structured, funny, and full of butterfly effects!`;

    const userPrompt = `Generate a world. Identity selected: "${identity || "random"}". Custom modifiers: "${customPrompt || "None"}".
Choose an exact awesome theme based on this (e.g., IPO上市前60秒, 滑雪比赛开始前60秒, 深海潜水前60秒, 私人飞机起降前60秒, etc.).
Make it full of bizarre twists, pre-generate 3 unique stages of story choices with custom actionIds, and 4 to 6 logical fixedEndings defining sequential/combinational butterfly effects.`;

    const storyStepSchema = {
      type: Type.OBJECT,
      required: ["id", "text", "options", "allowsFreeInput"],
      properties: {
        id: { type: Type.STRING, description: "e.g., 'stage1', 'stage2', 'stage3'" },
        text: { type: Type.STRING, description: "Hilarious narrative description or character statement for this step/interaction event." },
        allowsFreeInput: { type: Type.BOOLEAN },
        options: {
          type: Type.ARRAY,
          description: "Exactly 2 or 3 completely unique, creative choice options",
          items: {
            type: Type.OBJECT,
            required: ["label", "outcomeText", "timeDelta", "actionId"],
            properties: {
              label: { type: Type.STRING, description: "Unique choice text/action" },
              outcomeText: { type: Type.STRING, description: "Unique consequence narrative" },
              timeDelta: { type: Type.INTEGER, description: "Time impact (0 or negative integer representing cost e.g. -5, -10)" },
              actionId: { type: Type.STRING, description: "Descriptive semantic slug, e.g., 'kick_dog', 'soothe_investor', 'beat_investor', 'ignite_fire', 'open_sprinkler'" },
              isEarlyEnd: { type: Type.BOOLEAN },
              soundHint: { type: Type.STRING }
            }
          }
        }
      }
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["identity", "theme", "mapLayout", "playerPosition", "npcs", "items", "introText", "ambientMusic", "fixedEndings"],
          properties: {
            identity: { type: Type.STRING, description: "The specific career/rich identity of the player (e.g., 纳斯达克终极老板)" },
            theme: { type: Type.STRING, description: "The core challenge theme (e.g., IPO上市前倒计时60秒)" },
            mapLayout: {
              type: Type.OBJECT,
              required: ["tiles", "width", "height"],
              properties: {
                width: { type: Type.INTEGER, description: "Must be 16" },
                height: { type: Type.INTEGER, description: "Must be 12" },
                tiles: {
                  type: Type.ARRAY,
                  description: "Grid matrix of tile tags (e.g. 'floor', 'wall', 'carpet', 'snow', 'water', 'deck', 'metal_plate')",
                  items: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                }
              }
            },
            playerPosition: {
              type: Type.OBJECT,
              required: ["x", "y"],
              properties: {
                x: { type: Type.INTEGER },
                y: { type: Type.INTEGER }
              }
            },
            npcs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["id", "name", "sprite", "x", "y", "dialogue", "storyline"],
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  sprite: { type: Type.STRING, description: "Sprite type: 'secretary', 'dog', 'butler', 'investor', 'robot', 'alien', 'guard'" },
                  x: { type: Type.INTEGER },
                  y: { type: Type.INTEGER },
                  dialogue: { type: Type.STRING, description: "Introductory humorous or bizarre dialogue line" },
                  storyline: {
                    type: Type.ARRAY,
                    description: "Complete 3-stage pre-generated storyline list",
                    items: storyStepSchema
                  }
                }
              }
            },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["id", "name", "sprite", "x", "y", "description", "storyline"],
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  sprite: { type: Type.STRING, description: "Sprite type: 'desk', 'pen', 'coffee', 'chest', 'golf_ball', 'shoe', 'lever', 'rocket_button', 'egg'" },
                  x: { type: Type.INTEGER },
                  y: { type: Type.INTEGER },
                  description: { type: Type.STRING, description: "A humorous description of what happens if walked into" },
                  storyline: {
                    type: Type.ARRAY,
                    description: "Complete 3-stage pre-generated storyline list",
                    items: storyStepSchema
                  }
                }
              }
            },
            fixedEndings: {
              type: Type.ARRAY,
              description: "A list of 4 to 6 logical predetermined endings with specific action rules, combination patterns, and order sequences",
              items: {
                type: Type.OBJECT,
                required: ["endingId", "title", "description", "priority", "triggerRules"],
                properties: {
                  endingId: { type: Type.STRING },
                  title: { type: Type.STRING, description: "E.g. '公司破产且流落街头', '救火英雄宇宙功臣'" },
                  description: { type: Type.STRING, description: "Highly cinematic description explaining the ironic outcome based on the specific combination of actions" },
                  priority: { type: Type.INTEGER, description: "Priority score (e.g. 1 for simple triggers, 3 for combination or sequence triggers, higher priority match overrides lower ones)" },
                  triggerRules: {
                    type: Type.OBJECT,
                    required: ["mustInclude"],
                    properties: {
                      mustInclude: {
                        type: Type.ARRAY,
                        description: "List of actionId strings that must have been selected to trigger",
                        items: { type: Type.STRING }
                      },
                      forbidInclude: {
                        type: Type.ARRAY,
                        description: "List of actionId strings that must NOT have been selected to trigger",
                        items: { type: Type.STRING }
                      },
                      requiredSequence: {
                        type: Type.ARRAY,
                        description: "List of actionId strings in chronological relative order. E.g. ['ignite_fire', 'open_sprinkler']. If present, they must be triggered in this exact order.",
                        items: { type: Type.STRING }
                      }
                    }
                  }
                }
              }
            },
            introText: { type: Type.STRING, description: "Dramatic scrolling introduction setting the stage for the 60-second choice" },
            ambientMusic: { type: Type.STRING, description: "Style of chiptune generated, e.g. 'corporate-jazz', 'yacht-relax', 'alpine-speed', 'space-ambient'" }
          }
        }
      }
    });

    const worldData = JSON.parse(response.text || "{}");
    res.json(worldData);
  } catch (error: any) {
    console.warn("Generate World Error (using high-quality offline fallback scenario due to API rate limits):", error);
    try {
      const fallbackData = getFallbackScenario(req.body.identity);
      res.json({ ...fallbackData, isFallback: true });
    } catch (fallbackErr: any) {
      console.error("Critical Fallback Error:", fallbackErr);
      res.status(500).json({ error: error.message || "Failed to generate world scenario. Please check API Key and try again." });
    }
  }
});

// ==========================================
// API Endpoint 2: Interact with NPC/Item
// ==========================================
app.post("/api/boss/interact", async (req, res) => {
  try {
    const { identity, theme, targetType, targetName, targetId, dialogueHistory, playerAction } = req.body;
    const ai = getGeminiClient();

    const systemPrompt = `You are the chaotic interaction director of "One Minute Boss" (一分钟老板).
The player just collided or interacted with an entity on their retro map.
Entity Type: ${targetType} (NPC or Item)
Entity Name: ${targetName}
Target ID: ${targetId}

Based on the current theme "${theme}" and identity "${identity}", generate a hilarious, highly absurd, and butter-fly effect triggering narrative response of this interaction.
Also suggest options for where this goes next. These options should be extremely creative (e.g., feeding the CEO pen to the alien watch-dog, pressing a hidden emergency hyper-drive button, bribing a secretary with a golden shoe).
Include options where they can make a choice, and optionally allow for custom typed action.

You can also deduct time (seconds) from their 60-second countdown for activities that 'waste time' (e.g. reading a terms of service wastes 15 seconds, drinking special supercharged espresso consumes 5 seconds, petting the secret dog consumes 8 seconds). Return this delta as a negative number (e.g., -5, -15).
If the action is critical or fatal, you can trigger an early end by returning 'isEarlyEnd: true'.`;

    const userPrompt = `Player interact with ${targetType}: "${targetName}".
Dialogue History so far: ${JSON.stringify(dialogueHistory || [])}
Player custom or selected action chosen: "${playerAction || "First touch/Greeting"}".`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["text", "options", "allowsFreeInput", "soundHint", "timeDelta", "isEarlyEnd"],
          properties: {
            text: { type: Type.STRING, description: "Narrative response description of the comedic or absurd outcome of the interaction." },
            options: {
              type: Type.ARRAY,
              description: "2 or 3 weird responses/choices for the player",
              items: {
                type: Type.OBJECT,
                required: ["label", "action"],
                properties: {
                  label: { type: Type.STRING, description: "Absurd choice text" },
                  action: { type: Type.STRING, description: "A unique slug parameter describing the selected path" }
                }
              }
            },
            allowsFreeInput: { type: Type.BOOLEAN, description: "Allow player to enter custom text if they want to try anything crazy" },
            soundHint: { type: Type.STRING, description: "An audio effect cue name, e.g. 'laser', 'bling', 'explosion', 'dog_bark', 'drink', 'sigh', 'alert'" },
            timeDelta: { type: Type.INTEGER, description: "Time cost. Negative integer to deduct game timer. (e.g. -5, -8, -15, or 0)" },
            isEarlyEnd: { type: Type.BOOLEAN, description: "Set to true if this interaction triggered an immediate termination of the 60 seconds (game over due to absurdity!)" }
          }
        }
      }
    });

    const interactionData = JSON.parse(response.text || "{}");
    res.json(interactionData);
  } catch (error: any) {
    console.warn("Interact API Error (falling back to hilarious generic response):", error);
    res.json({
      text: `由于纳斯达克大楼网络信号瞬间极其拥堵（或者是你的宇宙粒子天线信号欠费，服务端429限制），你刚才草率说出的「${req.body.playerAction || "想做点奇奇怪怪的事"}」引起了整个量子宇宙安全局的信息流警报！不过，你的总裁光环保护了你！`,
      options: [
        { label: "🧘 回归当下，继续一分钟最后的狂野试炼", action: "continue_trial" }
      ],
      allowsFreeInput: true,
      soundHint: "alert",
      timeDelta: -5,
      isEarlyEnd: false,
      isFallback: true
    });
  }
});

// ==========================================
// API Endpoint 3: Compute Ending Profile
// ==========================================
app.post("/api/boss/generate-ending", async (req, res) => {
  try {
    const { identity, theme, spentTime, interactionLog, actionSequence, fixedEndings } = req.body;
    const ai = getGeminiClient();

    let matchedEnding = null;
    if (fixedEndings && Array.isArray(fixedEndings) && actionSequence && Array.isArray(actionSequence)) {
      // Sort endings by descending priority to check complex combinations first
      const sorted = [...fixedEndings].sort((a, b) => (b.priority || 0) - (a.priority || 0));
      for (const ending of sorted) {
        if (!ending.triggerRules) continue;
        let isMatch = true;

        // 1. Check mustInclude rules (All must be present)
        if (Array.isArray(ending.triggerRules.mustInclude) && ending.triggerRules.mustInclude.length > 0) {
          for (const requiredAct of ending.triggerRules.mustInclude) {
            if (!actionSequence.includes(requiredAct)) {
              isMatch = false;
              break;
            }
          }
        }

        // 2. Check forbidInclude rules (None must be present)
        if (isMatch && Array.isArray(ending.triggerRules.forbidInclude) && ending.triggerRules.forbidInclude.length > 0) {
          for (const forbiddenAct of ending.triggerRules.forbidInclude) {
            if (actionSequence.includes(forbiddenAct)) {
              isMatch = false;
              break;
            }
          }
        }

        // 3. Check requiredSequence rules (Order matching)
        if (isMatch && Array.isArray(ending.triggerRules.requiredSequence) && ending.triggerRules.requiredSequence.length >= 2) {
          for (let i = 0; i < ending.triggerRules.requiredSequence.length - 1; i++) {
            const first = ending.triggerRules.requiredSequence[i];
            const second = ending.triggerRules.requiredSequence[i + 1];
            const idx1 = actionSequence.indexOf(first);
            const idx2 = actionSequence.indexOf(second);
            if (idx1 === -1 || idx2 === -1 || idx1 >= idx2) {
              isMatch = false;
              break;
            }
          }
        }

        if (isMatch) {
          matchedEnding = ending;
          break; // Since sorted by descending priority, the highest priority match is our official outcome!
        }
      }
    }

    let systemPrompt = `You are the chief legacy assessor of "One Minute Boss" (一分钟老板).
Assess the player's final fate based on what occurred to them during their super rich 60-second life.
Theme: "${theme}"
Identity: "${identity}"
Survived/Surrendered: ${spentTime} seconds.
Here is the interaction trace log of the player's actions in this life:
${JSON.stringify(interactionLog || [])}
`;

    if (matchedEnding) {
      systemPrompt += `\nCRITICAL RULE TRIGGERED MATCH:
The player's exact sequence of choices triggers a predetermined FIXED ENDING!
Ending ID: ${matchedEnding.endingId}
Ending Title: "${matchedEnding.title}"
Outcome Script / core storyline: "${matchedEnding.description}"

You MUST write the 'endingText' strictly aligning with the matched fixed ending. Explain and narrative describe how their choice combo/sequence (${actionSequence.join(" -> ")}) produced this exact ironic outcome! Maintain the dramatic, comedic, or disastrous spirit of this outcome.`;
    } else {
      systemPrompt += `\nNo specific fixed ending rules match. Write a hilarious, retrospective ending summarizing the butterfly effect of their bizarre choices. Show how they succeeded or catastrophically failed in spending their money/time.`;
    }

    systemPrompt += `\n\nGenerate:
1. A unique ID code starting with identity shorthand and a randomized hex tag: (e.g., CEO #F941, HELI #Z302, CHEF #B771).
2. A glorious, wacky, cosmic title (If matchedEnding is present, you should reuse or beautify their title: "${matchedEnding ? matchedEnding.title : ""}").
3. A funny, dramatic, retrospective ending in 'endingText' based on the guidelines above.
4. An absurd S-Class/A-Class/B-Class/Wait-what Rank rating for their life.
5. Stats representation (Butterfly Index, Wealth Splutters).
6. Absurd achievements unlocked (e.g., "踢了特工狗一脚", "用百亿钢笔撕裂虚空").`;

    const userPrompt = `Compute the final destiny of this 60 seconds of wealth. Player actions sequence: ${JSON.stringify(actionSequence || [])}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["id", "title", "rank", "endingText", "achievements", "stats"],
          properties: {
            id: { type: Type.STRING, description: "Unique catalog ID like 'CEO #A701' or 'SKI #B199'" },
            title: { type: Type.STRING, description: "Hilarious or highly cosmic ending name" },
            rank: { type: Type.STRING, description: "Absurd rank (e.g., SSS+ 降维打击级, AAA+ 时光飞逝级, SS 荒诞传奇级)" },
            endingText: { type: Type.STRING, description: "Full descriptive summary narrative recounting their dramatic sequence of butterfly effects" },
            achievements: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            stats: {
              type: Type.OBJECT,
              required: ["wealthWasted", "butterflyEffectIndex", "insanityLevel"],
              properties: {
                wealthWasted: { type: Type.STRING, description: "e.g., '$5,000,000,000' or '99%'" },
                butterflyEffectIndex: { type: Type.STRING, description: "e.g., '620% (爆表)'" },
                insanityLevel: { type: Type.STRING, description: "e.g., '宇宙观测级' or '绝无仅有'" }
              }
            }
          }
        }
      }
    });

    const endingData = JSON.parse(response.text || "{}");
    res.json(endingData);
  } catch (error: any) {
    console.warn("Ending Gen Error (using local high-fidelity rules-based evaluator fallback):", error);
    try {
      const { identity, theme, spentTime, actionSequence, fixedEndings } = req.body;
      
      let matchedEnding = null;
      if (fixedEndings && Array.isArray(fixedEndings) && actionSequence && Array.isArray(actionSequence)) {
        const sorted = [...fixedEndings].sort((a, b) => (b.priority || 0) - (a.priority || 0));
        for (const ending of sorted) {
          if (!ending.triggerRules) continue;
          let isMatch = true;

          // 1. check mustInclude rules
          if (Array.isArray(ending.triggerRules.mustInclude) && ending.triggerRules.mustInclude.length > 0) {
            for (const requiredAct of ending.triggerRules.mustInclude) {
              if (!actionSequence.includes(requiredAct)) {
                isMatch = false;
                break;
              }
            }
          }

          // 2. check forbidInclude rules
          if (isMatch && Array.isArray(ending.triggerRules.forbidInclude) && ending.triggerRules.forbidInclude.length > 0) {
            for (const forbiddenAct of ending.triggerRules.forbidInclude) {
              if (actionSequence.includes(forbiddenAct)) {
                isMatch = false;
                break;
              }
            }
          }

          // 3. check requiredSequence rules
          if (isMatch && Array.isArray(ending.triggerRules.requiredSequence) && ending.triggerRules.requiredSequence.length >= 2) {
            for (let i = 0; i < ending.triggerRules.requiredSequence.length - 1; i++) {
              const first = ending.triggerRules.requiredSequence[i];
              const second = ending.triggerRules.requiredSequence[i + 1];
              const idx1 = actionSequence.indexOf(first);
              const idx2 = actionSequence.indexOf(second);
              if (idx1 === -1 || idx2 === -1 || idx1 >= idx2) {
                isMatch = false;
                break;
              }
            }
          }

          if (isMatch) {
            matchedEnding = ending;
            break;
          }
        }
      }

      // Generate funny offline telemetry
      const randTag = Math.floor(Math.random() * 8999 + 1000).toString(16).toUpperCase();
      const shorthand = (identity || "BOSS").slice(0, 3).toUpperCase();
      const computedId = `${shorthand} #${randTag}`;

      const title = matchedEnding ? matchedEnding.title : "【平平无奇的星际富豪】";
      const endingText = matchedEnding 
        ? matchedEnding.description 
        : `你在「${theme}」的这场大混乱中，共坚持探索了 ${spentTime} 秒。由于你的行动轨迹（${actionSequence.join(" -> ") || "平稳摸鱼"}）巧妙地避开了所有的主因果宇宙灾难，管理局给你判定“功过参半”，你拍拍身上的灰尘，继续戴着大钻戒过快活富豪生活！`;

      const rank = matchedEnding 
        ? (matchedEnding.priority >= 4 ? "SSS 降维打击级" : "SS 荒诞传奇级") 
        : "A- 稳扎稳打级";

      const localAchievements = [
        "因果线的织梦者",
        matchedEnding ? `达成特定结局：${matchedEnding.title.replace(/[【】]/g, "")}` : "避开宿命的过客"
      ];
      if (actionSequence.includes("kick_dog")) localAchievements.push("踢狗特工勋章");
      if (actionSequence.includes("beat_investor")) localAchievements.push("暴揍李总的铁拳");
      if (actionSequence.includes("open_sprinkler")) localAchievements.push("消防系统浇灌达人");

      res.json({
        id: computedId,
        title,
        rank,
        endingText,
        achievements: localAchievements,
        stats: {
          wealthWasted: matchedEnding ? "100% 满重力耗损" : "30% 适度花销",
          butterflyEffectIndex: matchedEnding ? "999% (爆表)" : "120% (微澜)",
          insanityLevel: matchedEnding ? "星际观测级" : "循规蹈矩"
        },
        isFallback: true
      });
    } catch (fallbackErr: any) {
      console.error("Critical Ending Fallback Error:", fallbackErr);
      res.status(500).json({ error: error.message || "Failed to generate your unique ending story." });
    }
  }
});

// ==========================================
// API Endpoint 4: Get Key Availability status
// ==========================================
app.get("/api/config/status", (req, res) => {
  res.json({
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// Serve frontend assets in production; Vite handles this in development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[一分钟老板 Server] Successfully booted on port ${PORT}`);
  });
}

startServer();
