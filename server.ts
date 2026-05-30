import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

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

You MUST choose or generate a unique ID identity and return map tiles in a grid (16 columns by 12 rows, to fit nicely in pixel ratio), along with NPCs, and interactive items.
The map grid is 16 columns (x from 0 to 15) and 12 rows (y from 0 to 11).
Tiles must contain keywords: 'floor', 'wall', 'carpet', 'grass', 'snow', 'water', 'deck', 'road', 'metal_plate'. Keep tiles visually matched to the scene (e.g. Ski Champion gets snow/floor, CEO gets floor/carpet/wall, Diver gets deck/water, Space Traveler gets metal_plate/wall, etc.).

Ensure you place 2 to 4 NPCs and 2 to 4 interactive items with proper coordinates that DO NOT collide with the player's coordinates or each other. Keep coords within x in [1, 14] and y in [1, 10] to avoid spawning in border walls.
Your output must be structured, logical, interesting, humorous, and full of absurd richness and possibilities!`;

    const userPrompt = `Generate a world. Identity selected: "${identity || "random"}". Custom modifiers: "${customPrompt || "None"}".
Choose an exact awesome theme based on this (e.g., IPO上市前60秒, 滑雪比赛开始前60秒, 深海潜水前60秒, 私人飞机起降前60秒, etc.).
Make it full of bizarre twists (e.g., an alien observing dog, custom high-tech coffee makers, a golden shoe, a secret button, a floating duck, etc.).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["identity", "theme", "mapLayout", "playerPosition", "npcs", "items", "introText", "ambientMusic"],
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
                required: ["id", "name", "sprite", "x", "y", "dialogue"],
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  sprite: { type: Type.STRING, description: "Sprite type: e.g. 'secretary', 'dog', 'butler', 'investor', 'robot', 'alien', 'guard', 'spectator'" },
                  x: { type: Type.INTEGER },
                  y: { type: Type.INTEGER },
                  dialogue: { type: Type.STRING, description: "Introductory humorous or bizarre dialogue line" }
                }
              }
            },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["id", "name", "sprite", "x", "y", "description"],
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  sprite: { type: Type.STRING, description: "Sprite type: e.g. 'desk', 'pen', 'coffee', 'chest', 'golf_ball', 'shoe', 'lever', 'rocket_button', 'egg', 'dog_food'" },
                  x: { type: Type.INTEGER },
                  y: { type: Type.INTEGER },
                  description: { type: Type.STRING, description: "A humorous description of what happens if walked into" }
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
    console.error("Generate World Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate world scenario." });
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
    console.error("Interact Error:", error);
    res.status(500).json({ error: error.message || "Failed to process interaction." });
  }
});

// ==========================================
// API Endpoint 3: Compute Ending Profile
// ==========================================
app.post("/api/boss/generate-ending", async (req, res) => {
  try {
    const { identity, theme, spentTime, interactionLog } = req.body;
    const ai = getGeminiClient();

    const systemPrompt = `You are the chief legacy assessor of "One Minute Boss" (一分钟老板).
Assess the player's final fate based on what occurred to them during their super rich 60-second life.
Theme: "${theme}"
Identity: "${identity}"
Survived/Surrendered: ${spentTime} seconds.
Here is the interaction trace log of the player's actions in this life:
${JSON.stringify(interactionLog || [])}

Generate:
1. A unique ID code starting with identity shorthand and a randomized hex tag: (e.g., CEO #F941, HELI #Z302, CHEF #B771).
2. A glorious, wacky, cosmic title (e.g., '超时空流浪汉', '被外星狗绑架的首席执行官', '无心滑雪的黑洞观测员').
3. A funny, dramatic, retrospective ending summarizing the butterfly effect of their bizarre choices. Show how they succeeded or catastrophically failed in spending their money/time.
4. An absurd S-Class/A-Class/B-Class/Wait-what Rank rating for their life.
5. Stats representation (Butterfly Index, Wealth Splutters).
6. Absurd achievements unlocked (e.g., "踢了特工狗一脚", "用百亿钢笔撕裂虚空").`;

    const userPrompt = `Compute the final destiny of this 60 seconds of wealth.`;

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
    console.error("Ending Gen Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate your unique ending story." });
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
