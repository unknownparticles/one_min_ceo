// /serverFallback.ts

export interface FallbackOption {
  label: string;
  outcomeText: string;
  timeDelta: number;
  actionId: string;
  isEarlyEnd?: boolean;
  soundHint?: string;
}

export interface FallbackStep {
  id: string;
  text: string;
  allowsFreeInput?: boolean;
  options: FallbackOption[];
}

export interface FallbackNPC {
  id: string;
  name: string;
  sprite: string;
  x: number;
  y: number;
  dialogue: string;
  storyline: FallbackStep[];
}

export interface FallbackItem {
  id: string;
  name: string;
  sprite: string;
  x: number;
  y: number;
  description: string;
  storyline: FallbackStep[];
}

export interface TriggerRules {
  mustInclude: string[];
  forbidInclude?: string[];
  requiredSequence?: string[];
}

export interface FixedEnding {
  endingId: string;
  title: string;
  description: string;
  priority: number;
  triggerRules: TriggerRules;
}

export interface FallbackScenario {
  identity: string;
  theme: string;
  mapLayout: {
    width: number;
    height: number;
    tiles: string[][];
  };
  playerPosition: { x: number; y: number };
  npcs: FallbackNPC[];
  items: FallbackItem[];
  fixedEndings: FixedEnding[];
  introText: string;
  ambientMusic: string;
}

export function getFallbackScenario(identity: string): FallbackScenario {
  const norm = (identity || "CEO").toLowerCase();

  // =========================================================================
  // ROUTING SCENARIOS FOR NORMAL / RANDOM MOMENTS
  // =========================================================================
  if (norm.includes("meeting") || norm.includes("会议") || norm.includes("开会")) {
    return getMeetingScenario();
  } else if (norm.includes("toilet") || norm.includes("厕所") || norm.includes("上厕所")) {
    return getToiletScenario();
  } else if (norm.includes("layoff") || norm.includes("裁员") || norm.includes("发裁员")) {
    return getLayoffScenario();
  } else if (norm.includes("duoyu") || norm.includes("王多鱼") || norm.includes("normal") || norm.includes("random")) {
    return getWangDuoyuScenario();
  } else if (norm.includes("ski") || norm.includes("雪") || norm.includes("champion")) {
    // Skiing Champion Scenario
    return getSkiingScenario();
  } else if (norm.includes("diver") || norm.includes("潜水") || norm.includes("sea")) {
    // Deep-sea Diver Scenario
    return getDiverScenario();
  } else if (norm.includes("space") || norm.includes("太空") || norm.includes("captain")) {
    // Space Traveler Scenario
    return getSpaceScenario();
  } else {
    // Default Nasdaq Boss CEO
    return getCEOScenario();
  }
}

function getCEOScenario(): FallbackScenario {
  // Empty space is represented by 'floor', bounds are 'wall'
  const width = 16;
  const height = 12;
  const tiles: string[][] = [];

  for (let r = 0; r < height; r++) {
    const row: string[] = [];
    for (let c = 0; c < width; c++) {
      if (r === 0 || r === height - 1 || c === 0 || c === width - 1) {
        row.push("wall");
      } else if (r === 3 && c > 2 && c < 13) {
        row.push("carpet");
      } else {
        row.push("floor");
      }
    }
    tiles.push(row);
  }

  return {
    identity: "纳斯达克终极首席执行官 (CEO)",
    theme: "IPO上市敲钟前倒计时60秒",
    mapLayout: { width, height, tiles },
    playerPosition: { x: 2, y: 5 },
    npcs: [
      {
        id: "npc_secretary",
        name: "总办秘书 Alice",
        sprite: "secretary",
        x: 4,
        y: 3,
        dialogue: "老板！所有的合伙人和狗仔队都在外面，IPO敲钟进入60秒绝对倒计时！我们该干些什么？",
        storyline: [
          {
            id: "secretary_stage1",
            text: "秘书Alice递过来一份红头保密和约，焦急道：『老板！后面那个高能粒子咖啡机漏电冒烟了，但喝一杯能提神醒脑，您要签署融资协议，还是怒喝一杯？』",
            allowsFreeInput: true,
            options: [
              {
                label: "✍️ 签署巨额对赌协议",
                outcomeText: "你豪迈地签下大名！百亿资金流瞬间涌入公司账户，不过若稍后破产，你得去半人马座挖矿还债！",
                timeDelta: -10,
                actionId: "sign_deal",
                soundHint: "bling"
              },
              {
                label: "☕ 狂灌高能粒子漏电咖啡",
                outcomeText: "你喉咙发出一阵量子尖叫！漏电的超高压电流将你的总裁刘海烫成金色莫西干发型，你感觉精力无限（也可能是短路暗示）！同时咖啡机开始冒熊熊黑烟！",
                timeDelta: -5,
                actionId: "drink_coffee",
                soundHint: "drink"
              }
            ]
          },
          {
            id: "secretary_stage2",
            text: "办公室响起了尖锐的焦糊味！Alice急得满地找水：『不好了！咖啡机的火星溅到黄金办公桌上了，我们要点燃保险箱把多余财报销毁来个死无对证，还是直接拉下总闸断电？』",
            allowsFreeInput: true,
            options: [
              {
                label: "🔥 索性点燃保险箱和文件",
                outcomeText: "你抄起包金打火机，一把点燃了旁边的机密资料，火苗骤然蹿起三米高！火焰伴随着狂热的金钱余烬在屋里跳跃！",
                timeDelta: -8,
                actionId: "ignite_fire",
                soundHint: "laser"
              },
              {
                label: "🔌 愤然拉下应急安全大闸",
                outcomeText: "你一记掌心大雷拍向红色拉杆！伴随一阵噼啪火光，高能机器被切断了，但整层摩天大楼也瞬间陷入死寂和昏暗！外面的狗仔队以为你们发生核事故而疯狂抓拍！",
                timeDelta: -6,
                actionId: "pull_lever",
                soundHint: "alert"
              }
            ]
          },
          {
            id: "secretary_stage3",
            text: "防雷报警器开始疯鸣。Alice哭腔喊道：『楼上警报响了！现在要把冷库的办公室消防大水喷头开闸，还是过去把投资人李总先扁一顿解气？』",
            allowsFreeInput: false,
            options: [
              {
                label: "💦 彻底打开办公室消防大喷淋",
                outcomeText: "你用伞尖砸碎阀门！倾盆大水犹如瀑布般瓢泼而下！全场顿时湿漉漉，所有漏电的机器瞬间发出最后的劈啪哀鸣！",
                timeDelta: -10,
                actionId: "open_sprinkler",
                soundHint: "explosion"
              },
              {
                label: "🤜 猛力直戳那个浮夸红色火箭按钮",
                outcomeText: "你就着高压警报，猛地一掌拍入办公桌侧边的终极红色火箭键，整个高空办公室传来了地心动力点火的凶暴低吟！",
                timeDelta: -15,
                actionId: "press_rocket",
                soundHint: "explosion"
              }
            ]
          }
        ]
      },
      {
        id: "npc_investor",
        name: "对赌投资人 李总",
        sprite: "investor",
        x: 10,
        y: 4,
        dialogue: "哼！还有不到一分钟，如果你们股价跌破基准线，你的摩天大楼和直升机就全是我的了！准备好接受无情的清算了吗？",
        storyline: [
          {
            id: "investor_stage1",
            text: "李总神气活现地摇晃着他的水晶红酒杯，狂妄说道：『你要是跪下叫我一声李哥，或者直接用一记寸拳爆锤我一顿，你会怎么选？』",
            allowsFreeInput: true,
            options: [
              {
                label: "🤜 狠狠爆揍投资人李总",
                outcomeText: "你一拳狠辣揍在李总的金丝眼镜上！李总惨叫一声喷出了一颗金牙，随后颤抖着拨通了重案组和撤资组的电话！",
                timeDelta: -15,
                actionId: "beat_investor",
                soundHint: "sigh"
              },
              {
                label: "🙏 好言抚平投资人情绪",
                outcomeText: "你递给他一整盒百亿黄金古巴雪茄：『李哥，凡事好商量。』李总贪婪地接过去直呼你是个懂事的巨鳄！",
                timeDelta: -5,
                actionId: "soothe_investor",
                soundHint: "bling"
              }
            ]
          },
          {
            id: "investor_stage2",
            text: "李总捂着脸（或者哼着歌）指向门口蹲着的智能机器柴犬：『看到那条看守星际财产的守财狗了吗？你敢凶残地踢它一脚，或者喂它狂电咖啡吗？敢踢它我就把百分之十的股权送给你！』",
            allowsFreeInput: true,
            options: [
              {
                label: "🦵 给智能机器狗来一猛脚",
                outcomeText: "你抬腿狠狠飞踢了柴犬一脚！机器狗当即发出超频电子怪叫，脊椎里的天线猛烈升空升起，眼珠亮起骇人的赛博红光！",
                timeDelta: -12,
                actionId: "kick_dog",
                soundHint: "dog_bark"
              },
              {
                label: "👋 温柔驯服抚摸守财柴犬",
                outcomeText: "你蹲下拍拍狗头。柴犬尾巴顿时摇出残影，喉咙里发出舒服的马达鸣响，趁李总不注意把一包高纯度外星能量蛋吐在你的袜子里！",
                timeDelta: -8,
                actionId: "pet_dog",
                soundHint: "bling"
              }
            ]
          },
          {
            id: "investor_stage3",
            text: "李总吓得尖叫：『狂徒！你触暴了外星哨兵！看那个控制台上的点火红色按钮，你难道要拉着所有人一起同归于尽吗？』",
            allowsFreeInput: false,
            options: [
              {
                label: "🚀 按下红色火箭发射按钮逃跑",
                outcomeText: "你一掌掀开玻璃护罩，彻底砸爆了那个红色的火箭逃跑动力键！地板瞬间开裂分离！",
                timeDelta: -12,
                actionId: "press_rocket",
                soundHint: "explosion"
              },
              {
                label: "📝 用百亿神笔签退自甘认命",
                outcomeText: "你叹了口气，抽出黄金百亿精雕签字笔，龙飞凤舞签了一张巨额欠条，甘愿金盆洗手认输！",
                timeDelta: -6,
                actionId: "sign_pension",
                soundHint: "sigh"
              }
            ]
          }
        ]
      },
      {
        id: "npc_robot",
        name: "外星间谍守财狗",
        sprite: "robot",
        x: 13,
        y: 8,
        dialogue: "汪呜……(发出高频无线电音) 检测到这间办公室充满了极高纯度的愚蠢金融纸钞和暴发户气息！",
        storyline: [
          {
            id: "robot_stage1",
            text: "间谍机器狗脖子上的微型发射装置正对着你：『愚蠢的碳基生物，不想被星际捕获的话，是用打火机来一场毁灭般的点火，还是乖乖踢我一脚让我向总部复命？』",
            allowsFreeInput: true,
            options: [
              {
                label: "🦵 来！我就给你一脚！",
                outcomeText: "你的皮鞋重击在坚硬的特合金狗屁股上！汪星人一阵剧震，当场锁定了你的骨骼信号，头盔内亮起幽寂的太空白晶！",
                timeDelta: -10,
                actionId: "kick_dog",
                soundHint: "dog_bark"
              },
              {
                label: "🔥 摸出打火机点火毁灭契约",
                outcomeText: "你擦亮打火机，瞬间点燃了桌下的百亿期权书！纸张的火光让机器狗的高温传感器瞬间产生严重的视网膜啸叫！",
                timeDelta: -6,
                actionId: "ignite_fire",
                soundHint: "laser"
              }
            ]
          },
          {
            id: "robot_stage2",
            text: "狗子突然发出中性广播音：『因果线正在分叉！你们人类的暴躁老板（指李总）已经严重触怒了本智库！我们要不要拉下那根控制电力总闸的神秘杠杆，还是开消防水淋头把大家做成落汤鸡？』",
            allowsFreeInput: true,
            options: [
              {
                label: "🔌 降维拉闸断电！",
                outcomeText: "你一把将拉杆电闸扳倒！噼啪雷鸣巨响，整座写字楼失去电力！所有电子屏幕和警报尽数熄灭，只有柴犬的屁股在荧光闪烁！",
                timeDelta: -8,
                actionId: "pull_lever",
                soundHint: "alert"
              },
              {
                label: "💦 全面大放喷淋消防大水！",
                outcomeText: "你拧开了消防大水龙头！水流犹如倾盆暴雨覆盖了方圆十米，柴犬被淋得全身短路，不停地尖叫着汪汪叫并且打转！",
                timeDelta: -12,
                actionId: "open_sprinkler",
                soundHint: "explosion"
              }
            ]
          },
          {
            id: "robot_stage3",
            text: "在混乱、烟火、断电、大水和尖叫声中，机器狗完成了最后的反向折射，它质问你：『你想按下发射红色按钮，还是强行用百亿神笔在水里画出一场大奖？』",
            allowsFreeInput: false,
            options: [
              {
                label: "🚀 拍死通电启动火箭！",
                outcomeText: "在最后的混乱极点中，你按下鲜艳的火箭逃跑开关！轰鸣开始自脚下咆哮！",
                timeDelta: -15,
                actionId: "press_rocket",
                soundHint: "explosion"
              },
              {
                label: "👊 全力把得瑟的李总暴扁一顿",
                outcomeText: "你反手一个水杯外加一拳结结实实砸在李总的大金牙上，达成了办公室无双！",
                timeDelta: -10,
                actionId: "beat_investor",
                soundHint: "sigh"
              }
            ]
          }
        ]
      },
      {
        id: "npc_butler",
        name: "忠诚老管家 Victor",
        sprite: "butler",
        x: 2,
        y: 9,
        dialogue: "老爷！我已经为您备好了秘密退路，随时可以弹射撤离！另外如果那个傲慢的李总再敢指指点点，我这边已经把高能电警棍准备好了！",
        storyline: [
          {
            id: "butler_stage1",
            text: "老管家Victor对你恭敬说道：『老爷，外面的八卦记者已经在暴力凿门了！你是引燃身上的钻石高定西装（ignite_fire）生产烟雾掩护，还是赏给这个看门柴犬一猛脚（kick_dog）吸引他们注意？』",
            allowsFreeInput: true,
            options: [
              {
                label: "🔥 潇洒点燃钻石西服掩护",
                outcomeText: "你豪迈地冒着火星引燃了西装！房间里一瞬间浓烟遮天蔽日，所有人和财团高管当场迷得大呼小叫！",
                timeDelta: -6,
                actionId: "ignite_fire",
                soundHint: "laser"
              },
              {
                label: "🦵 给星际间谍狗狠狠一脚",
                outcomeText: "你一脚飞踹在柴犬屁股上！柴犬发出怪叫同时脖子上的红色坐标警报大作，瞬间把门外所有记者的注意都吸引过去了！",
                timeDelta: -8,
                actionId: "kick_dog",
                soundHint: "dog_bark"
              }
            ]
          },
          {
            id: "butler_stage2",
            text: "Victor默默递过一瓶二爷藏在暗格的雷暴提神老拉菲：『老爷，你要不要直接一口闷下这杯漏电的高能粒子拉菲液体（drink_coffee）强行充能，还是去拉下配电总闸逃避敲钟（pull_lever）？』",
            allowsFreeInput: true,
            options: [
              {
                label: "🍷 狂饮一整瓶高能漏电拉菲",
                outcomeText: "你吨吨狂饮！高能强电瞬间流淌你的四肢百骸，你狂嚎一声仿佛二爷在世灵魂附体！",
                timeDelta: -10,
                actionId: "drink_coffee",
                soundHint: "drink"
              },
              {
                label: "🔌 狂暴拉下电源安全总闸",
                outcomeText: "你顺手推倒配电闸！整栋摩天大楼陷入绝对昏黑！李总在一阵劈里啪啦中踩到了垃圾桶！",
                timeDelta: -7,
                actionId: "pull_lever",
                soundHint: "alert"
              }
            ]
          },
          {
            id: "butler_stage3",
            text: "防雷水压警告频频。Victor惊道：『完蛋，李总的保镖要破门而入了！我们是砸开消防阀门放大水把全场淹没（open_sprinkler），还是干脆大笔挥墨豪迈签署百亿对赌（sign_deal）？』",
            allowsFreeInput: false,
            options: [
              {
                label: "💦 引爆消防大放水把全场淹没",
                outcomeText: "你猛砸龙头！冰冷高压水柱瞬间倾泻，高价真皮地毯和电脑瞬间漂在办公室海里！",
                timeDelta: -12,
                actionId: "open_sprinkler",
                soundHint: "explosion"
              },
              {
                label: "✍️ 豪迈签署百亿融资对赌协议",
                outcomeText: "你大笔一挥盖了公章！百亿信贷额度接通！李总看得满眼发直大呼上帝显灵！",
                timeDelta: -10,
                actionId: "sign_deal",
                soundHint: "bling"
              }
            ]
          }
        ]
      },
      {
        id: "npc_guard",
        name: "保安大队长 铁柱",
        sprite: "guard",
        x: 14,
        y: 5,
        dialogue: "老板！我跟我的安防电警棍已经恭候多时！那帮嚣张董事简直无法无天，要不要铁柱拉上总闸（pull_lever）配合您来一场办公室物理拆台？",
        storyline: [
          {
            id: "guard_stage1",
            text: "铁柱亮出警棍嘿嘿狂笑：『老板，你是命令我拉下全层配电总闸（pull_lever），还是您要自己喝一杯高能粒子漏电咖啡（drink_coffee）找回激情？』",
            allowsFreeInput: true,
            options: [
              {
                label: "🔌 配合暗语，全场拉闸断电！",
                outcomeText: "咔嗒！铁柱一把拽下大铜闸！全楼电力瞬间死灭！李总被暗中的微光吓得当场抱住大花瓶！",
                timeDelta: -6,
                actionId: "pull_lever",
                soundHint: "alert"
              },
              {
                label: "☕ 狂吞高压粒子漏电咖啡",
                outcomeText: "你一饮而尽！狂暴的电流在胃里炸裂，你感觉自己现在的智商可以和外星战机并驾齐驱！",
                timeDelta: -8,
                actionId: "drink_coffee",
                soundHint: "drink"
              }
            ]
          },
          {
            id: "guard_stage2",
            text: "铁柱指着燃起熊熊大火的总裁办公桌：『天啊，资料起火了（ignite_fire）！我们是立刻开最大应急大喷淋，还是协助您点燃二爷的铁质宝箱以寻求解密？』",
            allowsFreeInput: true,
            options: [
              {
                label: "💦 全面激活消防大喷淋灭火",
                outcomeText: "高空飞射洒水！办公室直接变成狂澜水上乐园，所有百亿债券档案当即淋成泡面糊糊！",
                timeDelta: -10,
                actionId: "open_sprinkler",
                soundHint: "explosion"
              },
              {
                label: "🔥 索性一把火点燃整个机密宝箱",
                outcomeText: "你和铁柱大笑着拍入百亿机密资料一同丢入烈焰引燃，刺鼻的黑烟里洋溢着极品败家的快感！",
                timeDelta: -12,
                actionId: "ignite_fire",
                soundHint: "laser"
              }
            ]
          },
          {
            id: "guard_stage3",
            text: "直升机在窗外嗡嗡大叫。铁柱把飞天头盔扣在你脑门上：『老板，你是直接拍爆红色紧急火箭拉闸飞向天际（press_rocket），还是过去给大发雷霆的投资人李总一记无双电疗（beat_investor）？』",
            allowsFreeInput: false,
            options: [
              {
                label: "🚀 拍死通电火箭！一飞冲天！",
                outcomeText: "你一拳砸碎警报阀，怒点推进大引擎！地板应声撕裂，飞车带你狂啸冲出玻璃！",
                timeDelta: -15,
                actionId: "press_rocket",
                soundHint: "explosion"
              },
              {
                label: "🤜 猛力揍李总，教他做老实人",
                outcomeText: "你一拳暴揍在李总的金丝镜片上！铁柱跟着也是一盾牌，李总发出杀猪般的悲情惨叫！",
                timeDelta: -12,
                actionId: "beat_investor",
                soundHint: "sigh"
              }
            ]
          }
        ]
      }
    ],
    items: [
      {
        id: "item_coffee",
        name: "高能粒子咖啡机",
        sprite: "coffee",
        x: 8,
        y: 2,
        description: "由太空航天局退役发动机改建的极速粒子咖啡加热装置，电压极其不可靠。",
        storyline: [
          {
            id: "coffee_stage1",
            text: "粒子咖啡机正在过载轰鸣，警告灯变成鲜血般猩红色！你要强行畅饮一杯，还是愤怒飞踢它一脚进行排障？",
            options: [
              {
                label: "☕ 赌上性命怒喝粒子咖啡",
                outcomeText: "高压粒子流入腹中，你耳清目明，思维速率超频狂涨！咖啡机火花四溅开始剧烈闷烧！",
                timeDelta: -5,
                actionId: "drink_coffee",
                soundHint: "drink"
              },
              {
                label: "🦵 泄愤地给咖啡机飞踩一脚",
                outcomeText: "你一脚踹在不锈钢机身上！咖啡机内侧电源发生爆破，蓝白电弧瞬间倾泄满地，并引燃了旁边的黄金纸张！",
                timeDelta: -8,
                actionId: "ignite_fire",
                soundHint: "laser"
              }
            ]
          },
          {
            id: "coffee_stage2",
            text: "流淌着高热咖啡电解质的水流正流向保险箱。你要断开侧面的电源总拉闸，还是反手一耳光抽向在旁边冷笑的投资人？",
            options: [
              {
                label: "🔌 掰倒隐藏断电电闸杠杆",
                outcomeText: "你一脚推开连环线，将总配电闸暴力推到底！大楼陷入绝对黑暗！",
                timeDelta: -8,
                actionId: "pull_lever",
                soundHint: "alert"
              },
              {
                label: "🤜 将李总一通神勇暴揍",
                outcomeText: "你揪住李总那昂贵的手工西装领口，一记结实的勾拳将他砸进盆栽堆里！",
                timeDelta: -12,
                actionId: "beat_investor",
                soundHint: "sigh"
              }
            ]
          },
          {
            id: "coffee_stage3",
            text: "热浪正逐渐席卷周遭。我们要激活大水灭火，还是顺应柴犬的诱惑踢它屁股以招来外星人？",
            options: [
              {
                label: "💦 打开全能防灾洒水灭火",
                outcomeText: "水雾滔天浇下！扑灭了所有自爆点，但办公室大水齐膝，彻底淹没了一切！",
                timeDelta: -10,
                actionId: "open_sprinkler",
                soundHint: "explosion"
              },
              {
                label: "🦵 一脚飞踢发笑的看门狗",
                outcomeText: "你转头一脚闷在柴犬屁股上，狗子发出了神秘超光波告警信号！",
                timeDelta: -8,
                actionId: "kick_dog",
                soundHint: "dog_bark"
              }
            ]
          }
        ]
      },
      {
        id: "item_desk",
        name: "百亿总裁办公黄金桌",
        sprite: "desk",
        x: 6,
        y: 8,
        description: "整块黄金花梨木与航天超合金拼镶而成的总裁办公桌，霸气侧漏。",
        storyline: [
          {
            id: "desk_stage1",
            text: "黄金奢华桌面上摆放着百亿协议。你是豪迈签署百亿大字，还是在桌角下拿打火机彻底点燃发泄？",
            options: [
              {
                label: "✍️ 潇洒挥笔签下对赌大字",
                outcomeText: "你一笔签下百亿期权书！无数的信贷链瞬间接通，同时也彻底抵押了你名下的资产和终身自由权！",
                timeDelta: -10,
                actionId: "sign_deal",
                soundHint: "bling"
              },
              {
                label: "🔥 擦燃火机把桌面直接点燃",
                outcomeText: "你大笑一声，用纯金防风火机将办公桌和财报一起点燃！烈焰瞬间包围了价值极高的花梨木隔板！",
                timeDelta: -5,
                actionId: "ignite_fire",
                soundHint: "laser"
              }
            ]
          },
          {
            id: "desk_stage2",
            text: "大火正在贪婪蔓延，警报蜂起。你是惊慌失措地去扳倒断电总闸，还是转脸给看门机器狗一个无情飞飞脚？",
            options: [
              {
                label: "🔌 扳动应急电力控制拉杆",
                outcomeText: "你拉下了安全总电闸！办公室里闪烁起血红的红荧应急备用指示，四周充满狂乱的未知氛围！",
                timeDelta: -8,
                actionId: "pull_lever",
                soundHint: "alert"
              },
              {
                label: "🦵 踹飞旁边那只挑衅的间谍狗",
                outcomeText: "你一踢踢起二十公分高的机器柴犬！狗子在空中发射出几道亮瞎眼的太空引路蓝色激光！",
                timeDelta: -10,
                actionId: "kick_dog",
                soundHint: "dog_bark"
              }
            ]
          },
          {
            id: "desk_stage3",
            text: "最后一颗稻草即将来临。你是开喷林水雾彻底淹大楼，还是奋力一扑拍下火箭发射按钮逃之夭夭？",
            options: [
              {
                label: "💦 引爆淋浴消防喷流降温",
                outcomeText: "你一甩手打烂洒水栓！无情狂水横扫全场，一瞬间办公室直接成为了高空海洋水世界！",
                timeDelta: -10,
                actionId: "open_sprinkler",
                soundHint: "explosion"
              },
              {
                label: "🚀 掌掴拍死那个火箭发射键",
                outcomeText: "你一拳拍碎警示罩，怒点星际脱逃推进装置！大楼狂震！",
                timeDelta: -12,
                actionId: "press_rocket",
                soundHint: "explosion"
              }
            ]
          }
        ]
      },
      {
        id: "item_pen",
        name: "百亿签字笔",
        sprite: "pen",
        x: 12,
        y: 10,
        description: "一根通体由24K金铸造、能够在一秒钟内流动几百亿资金签字契约的黄金签字笔！",
        storyline: [
          {
            id: "pen_stage1",
            text: "百亿签字笔散发着璀璨光芒。你是挥笔霸气签署百亿融资框架书（sign_deal），还是扔到打火机火苗里让其强行熔铸销毁（ignite_fire）？",
            options: [
              {
                label: "✍️ 豪迈一笔拍下融资对赌",
                outcomeText: "你泼洒墨水签字成功，万贯财流瞬间滚滚而来，也把大楼的底裤全抵押给了李总！",
                timeDelta: -10,
                actionId: "sign_deal",
                soundHint: "bling"
              },
              {
                label: "🔥 用火焰打火机爆燃合同资料",
                outcomeText: "你一言不发点燃了期权抵押复原书！漫天黑烟翻飞，李总的脸顿时绿得像发霉黄瓜！",
                timeDelta: -6,
                actionId: "ignite_fire",
                soundHint: "laser"
              }
            ]
          },
          {
            id: "pen_stage2",
            text: "废纸正在闷烧。机器警卫狗向你递过来因果代码，它是想要你狠踹其屁股（kick_dog）作为掩护，还是拉下电力总铜闸（pull_lever）大唱空心计？",
            options: [
              {
                label: "🦵 给发笑的间谍柴犬一记飞踢",
                outcomeText: "你一脚狠狠重击！皮鞋和铁合金狗屁股发出赛博红电光，警报红线当场爆满！",
                timeDelta: -8,
                actionId: "kick_dog",
                soundHint: "dog_bark"
              },
              {
                label: "🔌 狂暴拉下电源安全总大开关",
                outcomeText: "配电总闸被你暴力扳死！全办公室直接沦入黑漆漆一团！",
                timeDelta: -10,
                actionId: "pull_lever",
                soundHint: "alert"
              }
            ]
          },
          {
            id: "pen_stage3",
            text: "李总气疯了大锤乱桌。你要砸消防阀放冷水淹洗办公室，还是拍爆红色按钮点燃弹射动力？",
            options: [
              {
                label: "💦 全面拧开消防自救喷淋放水",
                outcomeText: "高压瀑布般的水柱打倒全场！一瞬间大水积膝，巨轮账目的财务全成了水花！",
                timeDelta: -12,
                actionId: "open_sprinkler",
                soundHint: "explosion"
              },
              {
                label: "🚀 拍死通电火箭发射键出逃",
                outcomeText: "你重击火箭，超音速轿车推背感将你一秒射出华尔街，留下一堆瞪眼呆若木鸡的老板！",
                timeDelta: -15,
                actionId: "press_rocket",
                soundHint: "explosion"
              }
            ]
          }
        ]
      },
      {
        id: "item_chest",
        name: "神秘百亿黑星宝箱",
        sprite: "chest",
        x: 1,
        y: 1,
        description: "闪闪发光的防弹密码铁箱。传言内部装有二爷发家时的百亿金票，或者是个巨能的静电发生器！",
        storyline: [
          {
            id: "chest_stage1",
            text: "宝箱已经过载冒烟。你要狠命踹一脚把它踹飞开（kick_dog），还是直接拿高热火星点燃之（ignite_fire）？",
            options: [
              {
                label: "🦵 用力一鞋底板怒踢宝箱壁",
                outcomeText: "你重脚踹出！防盗箱短路火流溢满！发出一阵尖锐电哨，当场震晕了正在假笑的狗子！",
                timeDelta: -5,
                actionId: "kick_dog",
                soundHint: "dog_bark"
              },
              {
                label: "🔥 点燃宝箱接口让其过热自毁",
                outcomeText: "你大把洒下机密草约点起了篝火！宝箱开始疯狂燃烧，引信冒出恐怖白火星！",
                timeDelta: -10,
                actionId: "ignite_fire",
                soundHint: "laser"
              }
            ]
          },
          {
            id: "chest_stage2",
            text: "宝箱震裂，露出里面的强高能漏电粒子咖啡以及配电盘拉扣。你是喝掉漏电咖啡，还是狂拉闸断电（pull_lever）？",
            options: [
              {
                label: "☕ 狂灌高能极光漏电老咖啡",
                outcomeText: "一饮入怀！雷霆霹雳在你脑神经中狂烈暴走！你觉得你身上充满了狂暴之能！",
                timeDelta: -12,
                actionId: "drink_coffee",
                soundHint: "drink"
              },
              {
                label: "🔌 掰折断电大闸让全层没电",
                outcomeText: "全楼失去主要电力！所有高管齐声惨啼！李总抱头高呼『核威慑降临了』！",
                timeDelta: -8,
                actionId: "pull_lever",
                soundHint: "alert"
              }
            ]
          },
          {
            id: "chest_stage3",
            text: "水压疯狂暴跌。我们要放漫天喷淋洒水灭火，还是乘飞天推力去大洋彼岸？",
            options: [
              {
                label: "💦 全力拧爆应急消防洒水栓",
                outcomeText: "滔天豪雨覆盖全摩天大楼办公室！水流冲倒了电脑，办公室直接可以捞鱼！",
                timeDelta: -10,
                actionId: "open_sprinkler",
                soundHint: "explosion"
              },
              {
                label: "🚀 绝地击爆红色火箭发射按钮",
                outcomeText: "引擎一秒千发！带着你撞碎了巨大的高空天窗，直接呼啸飞上了宇宙黑轨道！",
                timeDelta: -15,
                actionId: "press_rocket",
                soundHint: "explosion"
              }
            ]
          }
        ]
      },
      {
        id: "item_golf_ball",
        name: "雷达高尔夫球",
        sprite: "golf_ball",
        x: 13,
        y: 2,
        description: "高亮绿光频闪的高级陀螺定位仪高尔夫，配备多极气压推进装置！",
        storyline: [
          {
            id: "golf_stage1",
            text: "高尔夫球正诡异旋转。你是大笔一抖签署对赌书并打飞它（sign_deal），还是拿起一根高尔夫球杆对投资人李总来一次一杆爆头切击（beat_investor）？",
            options: [
              {
                label: "✍️ 优雅挥杆并且写下融资对赌",
                outcomeText: "你在一大叠债券框架上刷刷落笔，并猛地一球把对赌公章击飞，太狂野了！",
                timeDelta: -10,
                actionId: "sign_deal",
                soundHint: "bling"
              },
              {
                label: "🤜 抄起钛球杆把李总一通猛砸",
                outcomeText: "你全力一挥杆，球精确无阻将李总的红酒杯连带金牙一同打中飞出！李总大哭！",
                timeDelta: -12,
                actionId: "beat_investor",
                soundHint: "sigh"
              }
            ]
          },
          {
            id: "golf_stage2",
            text: "高尔夫球蹦进了漏电冒黑烟的高能咖啡机里。你是强行狂吨这一杯雷暴粒子漏电咖啡（drink_coffee），还是顺手给看你笑话的柴犬重来一脚（kick_dog）出气？",
            options: [
              {
                label: "☕ 壮烈连球狂喝粒子漏电咖啡",
                outcomeText: "超电压在你口腔和内脏跳交谊舞！你现在的精神亢奋得像一尊太古神兽！",
                timeDelta: -8,
                actionId: "drink_coffee",
                soundHint: "drink"
              },
              {
                label: "🦵 大吼一声给间谍柴犬屁股一脚",
                outcomeText: "你皮鞋狠狠一踹！柴犬全身钛合金发出巨震，在空中飞旋并发射无数绿幽电光！",
                timeDelta: -10,
                actionId: "kick_dog",
                soundHint: "dog_bark"
              }
            ]
          },
          {
            id: "golf_stage3",
            text: "高尔夫陀螺仪疯狂尖叫要爆炸了！你要迅速拉闸断电自保，还是推倒红色飞天火箭飞跃黑洞？",
            options: [
              {
                label: "🔌 配合闪卡拉下大闸切断配电",
                outcomeText: "你一记掌雷把电闸推倒！摩天大楼陷入绝对漆黑，大家在黑暗里互相摸到了对方的脑壳！",
                timeDelta: -8,
                actionId: "pull_lever",
                soundHint: "alert"
              },
              {
                label: "🚀 一拳暴捶红色火箭起爆按键",
                outcomeText: "星门轰裂！强大的推进机将你平地托升！在大火和浓水交加中飞出了地球圈！",
                timeDelta: -15,
                actionId: "press_rocket",
                soundHint: "explosion"
              }
            ]
          }
        ]
      }
    ],
    fixedEndings: [
      {
        endingId: "ending_kick_dog_alien",
        title: "【被外星人制裁的无礼拆迁户】",
        description: "因为你在关键时刻按捺不住，狠狠踢了间谍柴犬一脚（kick_dog），导致它向位于深空轨道的外星母舰发射了『受到低等人类残害』的极光求救。在你敲钟的前十秒，一道庞大耀眼的幽蓝牵引光速强行打穿了大楼！你连人带大金牙一同被吸入了飞碟！外星大议长见你毫无礼貌，判你穿上紧身衣前往星际最黑的黑矿搬砖500年！",
        priority: 3,
        triggerRules: { mustInclude: ["kick_dog"] }
      },
      {
        endingId: "ending_beat_and_ruin",
        title: "【破产加暴力拘留的双重福报】",
        description: "你把身边的对赌投资人李总狠狠暴揍了一顿（beat_investor），虽然打掉了李总三颗金牙，让你神清气爽。但紧接着你还顺道狠狠飞踹了机器狗（kick_dog），甚至无暇顾及账面黑洞！投资人倒在地上当场叫来了全副武装的保镖，就在倒计时归零的瞬间，不仅你的公司由于合约撕毁而彻底破产，你还在警笛连天中被押解逮捕，迎来了霸道总裁在狱中啃冷窝头的无上悲惨时光！",
        priority: 5,
        triggerRules: { mustInclude: ["beat_investor", "kick_dog"] }
      },
      {
        endingId: "ending_heroic_firefighter",
        title: "【智勇双全的消防英雄老板】",
        description: "你是一位极其卓越的危机预防者！你在发现漏电导致起火点燃办公室（ignite_fire）后，没有仓皇逃窜。而是沉着冷静、不差毫厘地启动了消防大喷淋（open_sprinkler）！在滚滚浓烟和冲天烈焰中，这股救赎般的瀑布之泉在最后一秒掐灭了火种！董事长档案百亿资产在紧要关头幸免于难！纳斯达克敲钟的那一刻，你在全球聚光灯下作为消防英雄斩获全场欢呼！",
        priority: 4,
        triggerRules: {
          mustInclude: ["ignite_fire", "open_sprinkler"],
          requiredSequence: ["ignite_fire", "open_sprinkler"]
        }
      },
      {
        endingId: "ending_foolish_drowner",
        title: "【不合时宜的自溺大师】",
        description: "你的战术指挥只能说是个奇迹。在办公室里连哪怕一丝烟雾和明火都没有的时候，你居然提前砸爆喷头，让大水疯狂倾倒淹没大楼（open_sprinkler）！在整个高空黄金地板直接变成游泳池、总裁底裤全部泡汤后，你居然在一片巨浪中摸出包金火机，试图把漂流的纸张点着（ignite_fire）！结果你不仅在水洼里没能打得着火，高电压高热流的粒子机器流淌水，瞬间引发了可怕的十万伏特导电重击！你浑身冒烟头发竖立，直接成为了年度沙雕榜第一名！",
        priority: 4,
        triggerRules: {
          mustInclude: ["open_sprinkler", "ignite_fire"],
          requiredSequence: ["open_sprinkler", "ignite_fire"]
        }
      },
      {
        endingId: "ending_rocket_man",
        title: "【飞向火星的霸道淘金流浪汉】",
        description: "任由李总和Alice大呼小叫，你决意不做债务的奴隶！你果断一拳砸得鲜血淋漓，彻底抠下了总裁办公桌底面的「终极备用火箭推进逃生按钮」（press_rocket）！只在一万分之一秒，整个摩天大楼的巨型金色玻璃穹顶朝两端轰鸣张开，一套马斯克限量版的超音速弹射跑车真皮座椅将你稳稳托起，直飞外星空轨道！地球的一百亿债务和敲钟的繁琐事务再也追不上你的车尾气，火星现在迎来了它的第一个极品富豪流浪汉！",
        priority: 3,
        triggerRules: { mustInclude: ["press_rocket"] }
      }
    ],
    introText: "你本是华尔街叱咤风云、存款千亿的终极首席执行官。然而由于一桩惊天的离奇金融对赌陷阱，你在纳斯达克挂牌敲钟、决定是否保住你摩天大楼和万贯家产的时间只剩下了最后这慌乱荒诞的60秒！办公室里的所有伙伴、对手及间谍柴犬都怀着极度奇特的动机盯视着你，一切因果连环的蝴蝶效应已在你的每一步迈出中开始飞舞，命运正在咆哮…… 做出你的抉择吧！",
    ambientMusic: "corporate-jazz"
  };
}

function getSkiingScenario(): FallbackScenario {
  // Return Ski Champion Fallback
  const width = 16;
  const height = 12;
  const tiles: string[][] = [];

  for (let r = 0; r < height; r++) {
    const row: string[] = [];
    for (let c = 0; c < width; c++) {
      if (r === 0 || r === height - 1 || c === 0 || c === width - 1) {
        row.push("wall");
      } else if (r === 4 || r === 5) {
        row.push("road");
      } else {
        row.push("snow");
      }
    }
    tiles.push(row);
  }

  return {
    identity: "阿尔卑斯超级滑雪冠军 (Ski)",
    theme: "巅峰雪山极限竞速开赛前倒计时60秒",
    mapLayout: { width, height, tiles },
    playerPosition: { x: 3, y: 3 },
    npcs: [
      {
        id: "ski_coach",
        name: "硬核滑雪教练",
        sprite: "butler",
        x: 5,
        y: 2,
        dialogue: "冠军！雪崩搜救犬拉肚子了，高山雪崩警告器已经拉响！你必须在60秒内决定下山路线！",
        storyline: [
          {
            id: "coach_stage1",
            text: "教练拿着神秘药水：『我们要喝下超频兴奋粒子咖啡（drink_coffee）强行突破，还是暴打不听话的赛事代表（beat_investor）？』",
            options: [
              { label: "☕ 豪饮急救高能粒子咖啡", outcomeText: "你灌下大杯高能咖啡，眼前雪山速度线拉满，你几乎看到了雪精在跳舞！但滑雪板的智能自锁定正在发出红亮红黑烟！", timeDelta: -5, actionId: "drink_coffee", soundHint: "drink" },
              { label: "🤛 直接揍扁刁难的赛事主裁", outcomeText: "你一拳打折了裁委会老头子的眼镜！主裁狂砸冰雪并誓言永久取消你的运动执照并控告你！也算狠狠出了一口恶气！", timeDelta: -12, actionId: "beat_investor", soundHint: "sigh" }
            ]
          },
          {
            id: "coach_stage2",
            text: "雪道开始冰裂！教练大喊：『前面的滑板机件过热！我们要用烟头点火烧毁备用物资，还是拉下悬索手闸强行锁死大山重组？』",
            options: [
              { label: "🔥 在防风衣上点火引燃求生包", outcomeText: "你一把点燃了应急燃料！一瞬间熊熊烈火在暴风雪里炸开，整个雪地弥漫出香浓的烤肉味！", timeDelta: -8, actionId: "ignite_fire", soundHint: "laser" },
              { label: "🔌 扳倒大索道备用红色电源闸", outcomeText: "你一怒之下拉倒应急减速电控推杆！巨龙般的高压电缆轰然断裂，全场灯火骤灭，只有极地雪山在阴冷闪烁！", timeDelta: -6, actionId: "pull_lever", soundHint: "alert" }
            ]
          },
          {
            id: "coach_stage3",
            text: "雪崩似乎正在加速追来！『快逃！是开强力大水灭火消防系统把雪坡浇成镜面冰封，还是怒掌拍碎安全壳按下直升机火箭助推按钮？』",
            options: [
              { label: "💦 倾泻消防冷水做成死亡冰面", outcomeText: "你一拉闸，巨大的高压消防枪在雪坡上扫出一道道波涛！全部冰面在绝对零度下极速凝聚冰硬！", timeDelta: -10, actionId: "open_sprinkler", soundHint: "explosion" },
              { label: "🚀 按大红色板怒点雪地发动机", outcomeText: "你大巴掌砸向逃生飞弹红色发动机键！雪撬后背的超级火箭推进喷出百米红莲火焰！", timeDelta: -15, actionId: "press_rocket", soundHint: "explosion" }
            ]
          }
        ]
      }
    ],
    items: [
      {
        id: "ski_board",
        name: "高能极光碳纤维滑板",
        sprite: "shoe",
        x: 8,
        y: 6,
        description: "由太空科技超导碳纤维打造的黄金定制滑雪板，号称能在水上飘。",
        storyline: [
          {
            id: "ski_stage1",
            text: "滑雪板边缘亮起危险的极光电源。你要穿上它并和柴犬打赌踢它一屁股，还是先在黄金办公板前点一把无上烈火？",
            options: [
              { label: "🦵 挑衅地给间谍机器狗底盘来一脚", outcomeText: "你起跳用重金属滑板边缘狠踹了机器柴犬！狗屁股电弧连闪，汪汪机甲双眼变全黑并向太空母舰发送呼叫信息！", timeDelta: -10, actionId: "kick_dog", soundHint: "dog_bark" },
              { label: "🔥 滑板生烟！直接用火机点火", outcomeText: "你索性按下滑板内置极限引燃！尾部机件亮起三千度耀眼烈焰，像一条极速飞艇在雪堆里跳跃！", timeDelta: -6, actionId: "ignite_fire", soundHint: "laser" }
            ]
          },
          {
            id: "ski_stage2",
            text: "热度极度炽烈！是要拉下安全刹车电杠，还是在大水喷淋之下将积雪弄成游泳池般的汪洋？",
            options: [
              { label: "🔌 暴力拉下紧急雪道断闸杠杆", outcomeText: "你大吼一响掰下控制闸！全区指示灯熄灭，冰凉狂风瞬间带走了全部升温！", timeDelta: -8, actionId: "pull_lever", soundHint: "alert" },
              { label: "💦 引爆融雪高压消防大水流", outcomeText: "在惊恐的警报声中，大水柱冲天倾泻！整个滑道迅速变成了白雪与洪水交织的混浊巨流！", timeDelta: -12, actionId: "open_sprinkler", soundHint: "explosion" }
            ]
          },
          {
            id: "ski_stage3",
            text: "滑板融化正在失去控制！是要拍下逃脱火箭推进，还是最后给烦躁的投资者一顿暴打？",
            options: [
              { label: "🚀 拍下底盘终极火箭喷气逃跑", outcomeText: "轰轰轰！你按下了那个代表自由之神的喷气火箭逃亡引擎，滑板带着你腾空两百米高！", timeDelta: -15, actionId: "press_rocket", soundHint: "explosion" },
              { label: "🤜 把冷嘲热讽的清算人痛扁一顿", outcomeText: "你把雪铲一记横挂砸在对赌代表脸上，直接把他也埋进了千米雪堆堆里！", timeDelta: -10, actionId: "beat_investor", soundHint: "sigh" }
            ]
          }
        ]
      }
    ],
    fixedEndings: [
      {
        endingId: "ending_kick_dog_alien",
        title: "【外星人抓走的极端滑雪囚徒】",
        description: "因为你在起跑线上疯狂挑衅，居然穿着钛合金滑板横扫了外星哨兵间谍狗的一记飞脚（kick_dog）！柴犬屁股里当场浮现出一个诡异的绿色虫洞信号球。还没等大雪蹦追上来，云霄深处便划过一只狂野至极的高音牵引钢缆，将你倒吊着直接吸入了时空母舰！外星裁判长宣布：『你踢了本舰队的顶级赛博哈士奇，罚你前往雪女星最寒冷的地下岩浆房清冰500年！』",
        priority: 3,
        triggerRules: { mustInclude: ["kick_dog"] }
      },
      {
        endingId: "ending_beat_and_ruin",
        title: "【永久取消参赛资格的法外狂徒】",
        description: "你把站在旁边的傲慢总裁清算人痛快揍了一顿（beat_investor），顺手给机器狗也奉献了一鞋（kick_dog）！虽然爽极一时，但当场触发了国际冰雪联理事会的红色除名裁决，导致你瞬间失去了巨额保释资格。股价雪崩，你的一万亿直接清零，还被直升机保卫队五花大绑，在狂响的警笛声中送去了最冷的禁闭室啃发馊的面包！",
        priority: 5,
        triggerRules: { mustInclude: ["beat_investor", "kick_dog"] }
      },
      {
        endingId: "ending_heroic_firefighter",
        title: "【智勇双全的冰火滑行巨星】",
        description: "这才是真正的极地冠军之风！发现滑板以及索道过载狂暴烧红起火（ignite_fire）的紧急关头，你没有丢头逃窜，而是在高难度极速倒滑中完美启动了雪道高压防雪崩洒水机制（open_sprinkler）！冰凉无情的大水雾如救世救世倾盘，在千钧一发之际彻底拍熄了火灾，并在一秒内将混合雪道冻成了流光溢彩的完美高速钢镜！你顺风而下创下星际滑行最高记录，加冕终极冰雪神话！",
        priority: 4,
        triggerRules: {
          mustInclude: ["ignite_fire", "open_sprinkler"],
          requiredSequence: ["ignite_fire", "open_sprinkler"]
        }
      },
      {
        endingId: "ending_foolish_drowner",
        title: "【把阿尔卑斯山洗刷的蠢才】",
        description: "你的冰山战术是百年难得一见的奇作。在整个滑道没有哪怕一星半点火苗、大灾还没来时，你提前打开融雪喷头（open_sprinkler），导致半吨干雪在一转眼被温水融成了咆哮的大烂泥石流并淹了整条逃脱道！当你在淤泥雪水里瑟瑟发抖、底面全部湿透后，你居然掏出极低点火大机（ignite_fire）试图在一片洪水泛滥中把滑雪板烘干！结果你不仅没点着，还遭遇严重漏电极速一击，像一颗被烤焦的黑色冰棒，飞快在世界新闻头版刷屏！",
        priority: 4,
        triggerRules: {
          mustInclude: ["open_sprinkler", "ignite_fire"],
          requiredSequence: ["open_sprinkler", "ignite_fire"]
        }
      },
      {
        endingId: "ending_rocket_man",
        title: "【一跃飞出大气圈的逃跑冠军】",
        description: "什么世界杯冠军、千万债务、傲慢投资人全都去死吧！你放弃了凡间世俗一切枷锁，重力拍碎了极客座椅上的「深空高能火箭脱身启动键」（press_rocket）！下一刹那大山底部的防爆盖掀开，一套特制狂暴反推加速火箭在滑雪板后方大声自爆轰鸣！你在万头涌动的记者狂吼中，直接化作一道贯穿天空的热能光束，闪瞎了全阿尔卑斯山，以十马赫冲破地球，飞向太空港享受无压力新生活！",
        priority: 3,
        triggerRules: { mustInclude: ["press_rocket"] }
      }
    ],
    introText: "身为连赞助费都多达万亿的阿尔卑斯雪山挑战之皇，你正站在阿尔卑斯极限速降赛道的最尖端。然而，一场人为炮制的时间炸弹和因果债务审判在你身后悄悄合拢，你只剩下这最后的60秒倒计时！雪山在狂震，刁难你的评委李总冷眼盘剥，还有汪星间谍隐藏在暗夜，这一场狂热极地飞速蝴蝶效应已经开始。抓紧钢板，极飞开始！",
    ambientMusic: "alpine-speed"
  };
}

function getDiverScenario(): FallbackScenario {
  // Deep-sea Diver
  const width = 16;
  const height = 12;
  const tiles: string[][] = [];

  for (let r = 0; r < height; r++) {
    const row: string[] = [];
    for (let c = 0; c < width; c++) {
      if (r === 0 || r === height - 1 || c === 0 || c === width - 1) {
        row.push("wall");
      } else if (r > 3 && r < 9 && c > 3 && c < 12) {
        row.push("water");
      } else {
        row.push("deck");
      }
    }
    tiles.push(row);
  }

  return {
    identity: "深海探险极限潜水领主 (Diver)",
    theme: "万米深海马里亚纳海沟潜航1分钟绝境抉择",
    mapLayout: { width, height, tiles },
    playerPosition: { x: 2, y: 2 },
    npcs: [
      {
        id: "sea_scientist",
        name: "潜水大连络员",
        sprite: "assistant",
        x: 4,
        y: 2,
        dialogue: "领主！海底万米火山即将爆发，我们潜水钟的气压阀只剩60秒氧气寿命了！",
        storyline: [
          {
            id: "diver_stage1",
            text: "大连络员捧着高能深潜呼吸气：『我们要多吞几口高能气流提速（drink_coffee），还是顺手签署李总的海底石油霸道对赌单（sign_deal）？』",
            options: [
              { label: "☕ 狂吸一口漏电粒子高压氧", outcomeText: "高压粒子氧气过载，你全身红细胞发出幽蓝量子微光，你可以在大水里连续憋气九十天！但隔壁的密封核心开始剧烈冒黑烟！", timeDelta: -5, actionId: "drink_coffee", soundHint: "drink" },
              { label: "✍️ 签下巨额海底主权让渡契约", outcomeText: "你颤抖着大名一签！在深海得到一笔黄金输血，不过要是不能活着上浮，你的遗体也将成为跨国集团的海底挖宝苦役！", timeDelta: -10, actionId: "sign_deal", soundHint: "bling" }
            ]
          },
          {
            id: "diver_stage2",
            text: "深水舱水汽升温！『过热火星引燃了应急舱室！我们是要在高温发热电热舱点燃第二把烈烟将残留抹除，还是直接一耳光拍死电力总总拉闸？』",
            options: [
              { label: "🔥 在易燃防水板上直接点火引爆", outcomeText: "你在幽闭的水密舱一把点着应急氧气瓶，高浓度火焰骤火蹿红，场面犹如万米水下最靓的小太阳！", timeDelta: -8, actionId: "ignite_fire", soundHint: "laser" },
              { label: "🔌 扳倒海流变压红色手开关拉杆", outcomeText: "你一怒拽下切断电闸！探探照灯和重力系统瞬间死灭，舱室陷入马里亚纳海沟绝对恐怖的极地冰黑中，全凭直觉！", timeDelta: -6, actionId: "pull_lever", soundHint: "alert" }
            ]
          },
          {
            id: "diver_stage3",
            text: "内压剧降！『太惨了！压力水警报开启！我们要打开强力消防排水喷淋喷洒冷水，还是疯狂一拍那个海底逃生火箭仓红色启动钮？』",
            options: [
              { label: "💦 启动消防狂澜大冷水高喷头", outcomeText: "高位水循环开启，万吨冰凉的大水柱如惊涛骇浪直接灌满全密封舱，你瞬间在封闭的大罐子里变成了潜游大咸鱼！", timeDelta: -10, actionId: "open_sprinkler", soundHint: "explosion" },
              { label: "🚀 按破透明防爆盖启动点火逃亡火箭", outcomeText: "你一巴掌在终极红色气动推进按钮上印下掌纹，高能海底推进火箭立刻开始进入火山倒计时！", timeDelta: -15, actionId: "press_rocket", soundHint: "explosion" }
            ]
          }
        ]
      }
    ],
    items: [
      {
        id: "sea_egg",
        name: "马里亚纳发光异形金蛋",
        sprite: "egg",
        x: 10,
        y: 8,
        description: "在火山边缘发现的温热奇异生命蛋，闪烁着宇宙频段光波。",
        storyline: [
          {
            id: "egg_stage1",
            text: "异形发光蛋发出诱惑。是无情给门口的机器狗来一脚飞踹以宣誓主权，还是在蛋壳表面拿火机直接擦出一场无情点火？",
            options: [
              { label: "🦵 给星际间谍柴犬一记大力海底踹", outcomeText: "在沉重的水下你大胯一迈飞踢了机器狗屁股！汪汪星人眼睛电光雷霆劈啪，当即便往遥远太空港报告抓捕危险碳基！", timeDelta: -10, actionId: "kick_dog", soundHint: "dog_bark" },
              { label: "🔥 用打火机把蛋壳表皮点燃引爆", outcomeText: "你打着了打火机，微火照耀蛋壳，异形金蛋因剧烈升热瞬间折射出十万道致命深海极光，连大乌贼都吓跑了！", timeDelta: -6, actionId: "ignite_fire", soundHint: "laser" }
            ]
          },
          {
            id: "egg_stage2",
            text: "极地大水由于短路开始发高烧！是要把电弧切断的总拉杆扳倒，还是打开消防冷水和冰暴进行全面的冰镇泡大澡？",
            options: [
              { label: "🔌 怒拉隐藏防短路水压电开关", outcomeText: "你死力一把推断安全电闸！舱内大黑一亮，只有金蛋在咕噜咕噜发着原生态的翡翠神光，氛围十分恐怖迷离！", timeDelta: -8, actionId: "pull_lever", soundHint: "alert" },
              { label: "💦 启用千磅消防洒水防爆高喷流", outcomeText: "阀门断裂！极寒的高压消防喷射水流狂暴注入，一刹那冰凉冷水把水舱内几乎积成了深海大温泉！", timeDelta: -12, actionId: "open_sprinkler", soundHint: "explosion" }
            ]
          },
          {
            id: "egg_stage3",
            text: "海底外壳即将因为火山引爆压塌！我们要启动海底脱离火箭，还是转头把那个一直对你叽叽歪歪的清盘代表暴扁一顿？",
            options: [
              { label: "🚀 拍下大推力气爆逃亡火箭钥匙", outcomeText: "轰的一声怒吼！火箭喷气在深海撕开了一万米高的白色大真空带，拉着你像鱼雷一样极速上蹿！", timeDelta: -15, actionId: "press_rocket", soundHint: "explosion" },
              { label: "🤜 把冷笑的投资清盘李总锤个满脸花", outcomeText: "你在水里艰难转头，一拳头将头盔狠狠闷在李总的大脸上，直接把他砸进了深海大喷泉污泥堆里！", timeDelta: -10, actionId: "beat_investor", soundHint: "sigh" }
            ]
          }
        ]
      }
    ],
    fixedEndings: [
      {
        endingId: "ending_kick_dog_alien",
        title: "【被马里亚纳深渊引渡的落水狗】",
        description: "因为你在起航前居然在水下，狠狠踹了间谍机器哈士奇一脚（kick_dog）！导致柴犬脊梁上的高维量子信号球在万米水下疯狂鸣响。还没等你拉闸上浮，冰海裂层便狂飙下一场绿荧宇宙光缆，将你连人连空气钢罐像拽乌贼一样一把握入外星飞艇！外星总长裁判官怒放狂言：『你踹了星际第一特工旺，罚你给飞船的超负荷发动机扫灰500年！』",
        priority: 3,
        triggerRules: { mustInclude: ["kick_dog"] }
      },
      {
        endingId: "ending_beat_and_ruin",
        title: "【海底主权剥夺的被囚罪犯】",
        description: "你把狂横的海底主权代表抢先一顿猛砸（beat_investor），顺足重踢了水下看门电子狗子（kick_dog），虽然狠狠出了一顿冤屈气，但你的罪恶记录在最后一刻被星际网络当场定罪！你的终身海底巨鳄所有权在一万分之一秒跌至尘土，并遭遇高空重装护保队海底包抄，一网将你套入重重铁链之中，直接在阴暗的死囚冷水仓啃烂鱼头！",
        priority: 5,
        triggerRules: { mustInclude: ["beat_investor", "kick_dog"] }
      },
      {
        endingId: "ending_heroic_firefighter",
        title: "【智勇双全的海底救灾总指挥】",
        description: "何其卓越的世界领主！你在深潜密封舱由于极客漏电导致烈燃大火（ignite_fire）的致命毁灭点，没有心慌，而是以完美的时间序列切断并激活了海底消防高压大水注喷雾（open_sprinkler）！在滚烟、雷击与万吨水流的撕咬里，这股暴雨浇灭了烈火，并恰好维持了深潜钟的可怕气压守恒！你成拯救了百亿奇珍，作为深潜奇侠，被载入全人类终极史册！",
        priority: 4,
        triggerRules: {
          mustInclude: ["ignite_fire", "open_sprinkler"],
          requiredSequence: ["ignite_fire", "open_sprinkler"]
        }
      },
      {
        endingId: "ending_foolish_drowner",
        title: "【自溺到无药可救的海中二蛋】",
        description: "你真是一个让人顶礼膜拜的自杀学者。在水密机舱里一块电路都没有发红发热时，你抢先引爆大水喷，让冷水直接灌满了全潜水钟（open_sprinkler）！当你全身湿透、抱着海底蛋在大水里直吹泡泡几乎溺死时，你居然哆哆嗦嗦擦燃了打火机，想把被水淹没的警控电脑强行烧红加热（ignite_fire）！结果你不仅不能打着火，高电压水流瞬时导爆了全身超极电流！你两眼冒白光头发卷成焦炭，成全宇宙深潜滑稽第一人！",
        priority: 4,
        triggerRules: {
          mustInclude: ["open_sprinkler", "ignite_fire"],
          requiredSequence: ["open_sprinkler", "ignite_fire"]
        }
      },
      {
        endingId: "ending_rocket_man",
        title: "【直插空域的海底火箭狂徒】",
        description: "去特么的海底破产和火山大对赌！你大嚎一声，果断彻底掰断了求生控制盒，一拳锤烂红色火箭逃逸按钮（press_rocket）！下一帧，潜水钟外壳自爆成两瓣，定制款固态推进动力椅将你绑紧瞬间在马里亚纳深海中带出一蓬直达九霄云外的万米大水柱！地球的人肉纠葛瞬间甩开十光年，你像一只飞天金色大龙虾一样，带着火山神气直接飞到了外太空建立极乐殖民！",
        priority: 3,
        triggerRules: { mustInclude: ["press_rocket"] }
      }
    ],
    introText: "你在万米马里亚纳海沟中，正驾驶着唯一的百亿级核力潜水钟。不料背后的火山即将在一分钟内大连环大自爆，而无聊的石油大鳄李总还要你签署财产破产合同，你的机密警灯正在闪红，氧气阀在无情漏气！海压在大轰，死神敲门，这场幽闭海底的蝴蝶风暴已然在水底狂哮。屏住呼吸，决定你的出逃之路！",
    ambientMusic: "yacht-relax"
  };
}

function getSpaceScenario(): FallbackScenario {
  // Space Traveler
  const width = 16;
  const height = 12;
  const tiles: string[][] = [];

  for (let r = 0; r < height; r++) {
    const row: string[] = [];
    for (let c = 0; c < width; c++) {
      if (r === 0 || r === height - 1 || c === 0 || c === width - 1) {
        row.push("wall");
      } else {
        row.push("metal_plate");
      }
    }
    tiles.push(row);
  }

  return {
    identity: "星际飞船元宇宙领主 (Space)",
    theme: "飞船跃迁星门崩溃倒计时60秒极限博弈",
    mapLayout: { width, height, tiles },
    playerPosition: { x: 3, y: 3 },
    npcs: [
      {
        id: "npc_alien",
        name: "仙女座高级科学家",
        sprite: "alien",
        x: 6,
        y: 4,
        dialogue: "元帅！前方重力暗能量网破损，飞船将在60秒后撞入超大星际黑洞！",
        storyline: [
          {
            id: "space_stage1",
            text: "科学家拉响高频红色喇叭：『我们要饮用超导粒子加速能量，还是签署不当的破盟主权让渡条款？』",
            options: [
              { label: "☕ 豪吞一杯超高压漏电高能粒子", outcomeText: "高压粒子重组了你的体细胞，你感觉自己连黑洞引力都敢一脚踢弯！但在同一秒大机室的反应炉开始疯狂冒浓黑浓烟！", timeDelta: -5, actionId: "drink_coffee", soundHint: "drink" },
              { label: "✍️ 签署李总抛出的巨额卖国融资契约", outcomeText: "你一气签笔！大量战舰抵押瞬间接入星际账户，但同时也彻底失去了在仙女座的自由权和终身豁免权！", timeDelta: -10, actionId: "sign_deal", soundHint: "bling" }
            ]
          },
          {
            id: "space_stage2",
            text: "超控舱发出红色电热啸叫！『反应炉的火苗烤红了防爆舱壁！我们直接在过热的控制桌点火抹除记录，还是断开最底部的断电大拉闸手把？』",
            options: [
              { label: "🔥 在反应箱前用极端能量点火", outcomeText: "你拿激光火机把废纸和电容器堆在桌下一把点燃！太空大火在重力舱中扭动狂暴，犹如盛开在深空的红艳艳莲花！", timeDelta: -8, actionId: "ignite_fire", soundHint: "laser" },
              { label: "🔌 扳倒隐藏在身旁的应急电力拉杆", outcomeText: "你一推逆闸！整艘十万吨级战舰骤然停电，全域探探照大灯死掉，四周成了最阴沉原始的宇宙静谧，全凭骨传导呼吸！", timeDelta: -6, actionId: "pull_lever", soundHint: "alert" }
            ]
          },
          {
            id: "space_stage3",
            text: "温度和气压狂跌至临界状态！科学家惊吼：『冰水灭火大消防龙头喷淋要把控制室变成水球，还是疯狂一巴掌砸碎终极红色撤离火箭按钮？』",
            options: [
              { label: "💦 启动消防喷淋把反应舱大喷射大淋湿", outcomeText: "倾盘狂流洒下，十吨应急水柱将所有发热点在几秒内强行冷却，但在重力丧失状态下，空中浮游着半吨致命大水花！", timeDelta: -10, actionId: "open_sprinkler", soundHint: "explosion" },
              { label: "🚀 按碎保护屏启动点火逃走火箭仓", outcomeText: "你全力一掌拍死最核心红色反冲推进开关！整艘飞船传来了代表彻底逃逸的气阻高能低吼声！", timeDelta: -15, actionId: "press_rocket", soundHint: "explosion" }
            ]
          }
        ]
      }
    ],
    items: [
      {
        id: "space_lever",
        name: "重构超控杠杆手拉闸",
        sprite: "lever",
        x: 10,
        y: 8,
        description: "由泰坦钛钢精心锻造、带有红色重力标识的应急电力重载断电总拉闸。",
        storyline: [
          {
            id: "lever_stage1",
            text: "总拉杆上面通着诡异的电光。是要反手给挑衅汪星间谍一记强力钛皮鞋踢（kick_dog），还是在控制拉闸极客核心点燃大火彻底焚毁它？",
            options: [
              { label: "🦵 给智能柴犬守卫一记高空重金属飞踢", outcomeText: "你高抬腿一脚闷踹飞在机器哈士奇狗脸上！柴犬脊柱中的太空通信线被引燃，红眼大闪并向仙女军法局发送最高逮捕指示！", timeDelta: -10, actionId: "kick_dog", soundHint: "dog_bark" },
              { label: "🔥 用高温打火机直接在拉杆口点火", outcomeText: "你在拉闸接口摸出打火机怒点一把！线圈当即自爆连闪，在十万度超热中绽放出炫灿夺命的太空火舌！", timeDelta: -6, actionId: "ignite_fire", soundHint: "laser" }
            ]
          },
          {
            id: "lever_stage2",
            text: "带电火焰狂猛逼入！是要掰断电开关总闸，还是开启全大水消防冷阀在大河里一同遨游泡澡？",
            options: [
              { label: "🔌 彻底把隐藏的超导总手逆倒电拉杆推断", outcomeText: "总电力死灭！星舰陷入黑暗！唯有窗外古老银河的大背景在璀璨耀眼地闪烁，极其壮观神秘！", timeDelta: -8, actionId: "pull_lever", soundHint: "alert" },
              { label: "💦 彻底引爆全吨应急高压注水冷淋喷", outcomeText: "大阀门爆开发射！极冷融水如山洪倾盘呼啸！一转眼十米内的超重力舱当即被灌成了完美的半空浮水池！", timeDelta: -12, actionId: "open_sprinkler", soundHint: "explosion" }
            ]
          },
          {
            id: "lever_stage3",
            text: "大黑洞即将撕碎内壳引力圈！我们要开火箭跑路，还是在大乱里面将那个得寸进尺的黑哨李总一顿神勇痛殴？",
            options: [
              { label: "🚀 拍倒逃亡星际火箭飞艇起航", outcomeText: "轰隆！底舱反推导弹全开！脱困舱带着你直接以一百万千米每时的高频加速飞射，甩开了万劫大崩溃！", timeDelta: -15, actionId: "press_rocket", soundHint: "explosion" },
              { label: "🤜 把冷讽你失财的李总暴扁一顿", outcomeText: "你反手扯断管道砸在李总的金牙脸上，狠狠一拳打破他的假鼻子，让他当场在太空中眼冒万只闪烁金光萤火虫！", timeDelta: -10, actionId: "beat_investor", soundHint: "sigh" }
            ]
          }
        ]
      }
    ],
    fixedEndings: [
      {
        endingId: "ending_kick_dog_alien",
        title: "【惨遭深空最高治安流放的无礼元帅】",
        description: "因为你在飞船彻底失联倒计时中，完全失去了理智，居然穿着钛重皮靴，一脚狠踹了外星治安哈士奇间谍狗的屁股（kick_dog）！柴犬当即朝虚空治安巡逻大队射出带有『受到低等人类非法大虐待』的幽波坐标！没等飞船撞黑洞，一只带有星际毁灭力牵引巨爪瞬时击穿主舱，将你一把扭进了治安大狱！治安大总长冷酷判你在灰烬星劳教800年！",
        priority: 3,
        triggerRules: { mustInclude: ["kick_dog"] }
      },
      {
        endingId: "ending_beat_and_ruin",
        title: "【倾家荡产加星际治安重案羁押】",
        description: "你把身边的对赌投资人李总结结实实暴擂了一通（beat_investor），顺手给旁边探路的警卫哈士奇重闷了飞踹（kick_dog）！虽然极具解压感，但当场被星际裁决委员会录像固化！还没等时间扣完，你的百万亿期权契约当即破裂。你不仅破产，还被突然从虫洞折射的钛战守卫拘束捕缚，一辈子关锁在最暗的冰块禁闭核心啃酸冷石头！",
        priority: 5,
        triggerRules: { mustInclude: ["beat_investor", "kick_dog"] }
      },
      {
        endingId: "ending_heroic_firefighter",
        title: "【智勇双全的星河安全灭火元帅】",
        description: "真正的顶级英雄将领之风骨！在机组由于极爆过载重度起火燃烧（ignite_fire）的最惨时刻，你没有仓皇跑路，而是极为稳妥、顺序完美地启动了极速高压干水消防注水大机（open_sprinkler）！在火苗和雷霆的交加暴走下，这股拯救之雨完美按熄了核烈火，拯救了隔壁即将被引爆的引擎！你在敲钟前一秒拉回重心，被全宇宙尊称为铁血无畏之王！",
        priority: 4,
        triggerRules: {
          mustInclude: ["ignite_fire", "open_sprinkler"],
          requiredSequence: ["ignite_fire", "open_sprinkler"]
        }
      },
      {
        endingId: "ending_foolish_drowner",
        title: "【极度滑稽的深空自溺溺水二蛋】",
        description: "你的太空战术堪称不世出的绝笔之物。在整个反应炉哪怕一毫米烟尘都没起、大难还没逼临，你抢先引爆防灾消防水系统（open_sprinkler），直接在无重力全失氧舱室里灌出了好几吨漫天乱飞的太空浮游水巨弹！在你像条狗爬式、全身泡透拼命在太空中游水时，你居然点燃了激光火机（ignite_fire）试图在水球中央将电路熏干！结果你不仅不能打火，反遭严重漏电雷霆一脚重劈！瞬间在无重力星空中被烤成了一块外焦里嫩的滑稽咸鱼大龙虾，成全行业千古一见沙雕！",
        priority: 4,
        triggerRules: {
          mustInclude: ["open_sprinkler", "ignite_fire"],
          requiredSequence: ["open_sprinkler", "ignite_fire"]
        }
      },
      {
        endingId: "ending_rocket_man",
        title: "【奔向黑洞彼岸的自由宇宙流浪大亨】",
        description: "随这帮仙女座的破产代表和破合约嚎叫吧，你决意不做金融和星门契约的傀儡奴隶！你狂迈一拳闷碎安全阀，反手砸爆「超光推进紧急避难降落红色按钮」（press_rocket）！只用零点一毫秒，星舰最尾端的一艘超钛合金折叠逃逸船以光速十马赫疯狂弹出！你和债务瞬间甩开几亿光年，直奔猎户座建立你的全新极乐私人太空港！",
        priority: 3,
        triggerRules: { mustInclude: ["press_rocket"] }
      }
    ],
    introText: "你拥有全仙女星系最奢华的太空港及无数折叠战列舰，号称星河元帅。然而遭遇星际帝国及不公债权高管李总的恶人清算，决定你是否破产并撞毁黑洞的核心星门跃迁系统只保留最后的60秒可自毁！科学家ALIEN在一旁狂吼大叫，汪汪间谍在虎视眈眈，所有的时空风暴都正伴随着你的前进路线飞速盘旋开裂。做出抉择，星际逃离！",
    ambientMusic: "space-ambient"
  };
}

function getMeetingScenario(): FallbackScenario {
  const width = 16;
  const height = 12;
  const tiles: string[][] = [];

  for (let r = 0; r < height; r++) {
    const row: string[] = [];
    for (let c = 0; c < width; c++) {
      if (r === 0 || r === height - 1 || c === 0 || c === width - 1) {
        row.push("wall");
      } else if (r === 4 && c > 1 && c < 14) {
        row.push("carpet");
      } else {
        row.push("floor");
      }
    }
    tiles.push(row);
  }

  return {
    identity: "王多鱼 (开会瞬间)",
    theme: "董事会狂澜与商业构想最后60秒",
    mapLayout: { width, height, tiles },
    playerPosition: { x: 3, y: 5 },
    npcs: [
      {
        id: "npc_investor_meeting",
        name: "刁难董事 钱总",
        sprite: "investor",
        x: 8,
        y: 4,
        dialogue: "王多鱼！二爷留下这笔三百万，你居然想投资‘给月球西红柿建遮阳伞’这种荒唐构想？签字作废合同吧！",
        storyline: [
          {
            id: "meeting_stage1",
            text: "钱总把合同拍在红木会议桌上，满脸嘲讽：『你要么乖乖签字（sign_deal）自愿退出，要么你就用你的三百万去买下一块月球地皮！』",
            allowsFreeInput: true,
            options: [
              { label: "✍️ 冲动买下月球三万亩沙地", outcomeText: "你狂放签字！将150万资金当场转给地皮买手，获得一张印满外星乱码的电子地券！钱总面色铁青说你疯了！", timeDelta: -10, actionId: "buy_moon" },
              { label: "🤜 把刁难合同团成球塞进他衣服里", outcomeText: "你揪住钱总的高级领带，把合同粗暴塞进他的定制衬衫肚皮里，他当场发出尖叫并大声呼唤保安！", timeDelta: -12, actionId: "beat_investor" }
            ]
          }
        ]
      },
      {
        id: "npc_secretary_mei",
        name: "秘书 小美",
        sprite: "secretary",
        x: 4,
        y: 7,
        dialogue: "老板！钱总一直在对财务指手画脚。我已经把大楼断电红闸（pull_lever）和消防放水喷淋（open_sprinkler）都秘密锁定，只要您一声令下，马上物理物理拆台！",
        storyline: [
          {
            id: "meeting_sec_stage1",
            text: "小美眼里闪着星星：『老板，你是命令我立刻拉下全楼电源总开关（pull_lever）还是打开天花板消防淋浴放水（open_sprinkler）淹洗他们？』",
            allowsFreeInput: true,
            options: [
              { label: "🔌 怒拉电闸，全场断电昏死！", outcomeText: "小美一推逆闸！整栋写字楼进入一片黑灯瞎火，钱总正在指手画脚当场一脚踩进垃圾桶！", timeDelta: -8, actionId: "pull_lever" },
              { label: "💦 启动消防高压喷头大放水！", outcomeText: "天花板开始洒下滔天豪雨！办公室直接变成狂澜水上乐园，所有百亿融资框架书浸泡成了烂糊糊！", timeDelta: -10, actionId: "open_sprinkler" }
            ]
          }
        ]
      },
      {
        id: "npc_sec_dog",
        name: "安防哈士奇 狗子",
        sprite: "dog",
        x: 13,
        y: 3,
        dialogue: "汪！警备哈士奇已启动，警告！检测到非法资产转移！",
        storyline: [
          {
            id: "meeting_dog_stage1",
            text: "机器狗尾巴上的坐标指示灯正在过载频闪。你是要对它屁股狠狠来一脚飞踹（kick_dog），还是去喝一杯高能粒子漏电咖啡（drink_coffee）换换心情？",
            options: [
              { label: "🦵 毫不犹豫给二哈屁股一猛脚", outcomeText: "你一脚踢了出去！防卫系统短路冒烟！钱总一瞬间吓尿了以为你安装了高能地雷！", timeDelta: -8, actionId: "kick_dog" },
              { label: "☕ 狂吞漏电咖啡，获得赛博神志", outcomeText: "你抢过咖啡狂干！超强粒子电流瞬间穿过喉咙，震得你两眼泛极光！", timeDelta: -6, actionId: "drink_coffee" }
            ]
          }
        ]
      },
      {
        id: "npc_butler_victor",
        name: "忠诚老执事 Victor",
        sprite: "butler",
        x: 2,
        y: 9,
        dialogue: "大少爷！我已经为您调遣了秘密弹射气艇。如果这帮无礼董事要强行霸占二爷遗产，随时可以一键弹射升天！",
        storyline: [
          {
            id: "meeting_butler_stage1",
            text: "Victor偷偷亮出高维推进引爆拉环：『少爷，您是要一屁股坐在弹射椅上极速飞天（press_rocket），还是留下来霸气一笔签下百亿对赌（sign_deal）对钱总啪啪打脸？』",
            options: [
              { label: "🚀 按破警报拉下飞天弹射火箭", outcomeText: "你一拳拍死火箭引擎！推背力瞬间撞破大厦的双层落地窗，带着你在漫天浮云里呼啸冲出重力！", timeDelta: -15, actionId: "press_rocket" },
              { label: "✍️ 豪迈大笔签字接纳巨额债务对赌", outcomeText: "你顺势签下了一百亿的超巨重工业投资合同！钱总看得瞠目结舌双膝当场下跪！", timeDelta: -10, actionId: "sign_deal" }
            ]
          }
        ]
      }
    ],
    items: [
      {
        id: "item_coffee_meeting",
        name: "百亿高能咖啡杯",
        sprite: "coffee",
        x: 10,
        y: 6,
        description: "高管们喝剩下的滚烫浓缩咖啡，蕴藏着一万倍的荒唐元气！",
        storyline: [
          {
            id: "coffee_meeting_stage1",
            text: "咖啡杯闪着棕色微光。你是顺热泼到满脸不屑的钱总头顶，还是自己一饮而尽？",
            options: [
              { label: "☕ 愤倒咖啡浇董事一身", outcomeText: "你抄起杯子将高热浓缩汁优雅而精准地浇在董事新做的地中海发型上，烫得他像只烤鸭般尖叫原地旋转！", timeDelta: -8, actionId: "pour_coffee" },
              { label: "🤤 自己壮烈干了这两大杯", outcomeText: "你一饮而尽，心脏像一台V12引擎一样雷鸣巨响！脑海中突然多出十八个无厘头投资草案！", timeDelta: -5, actionId: "drink_coffee" }
            ]
          }
        ]
      },
      {
        id: "item_custom_table",
        name: "定制红木判决桌",
        sprite: "desk",
        x: 6,
        y: 3,
        description: "一张重达五吨的黄花梨豪华会议桌，上面堆满了数十个虚假或真实的投资空壳对赌合契！",
        storyline: [
          {
            id: "meeting_table_stage1",
            text: "在巨大的判决桌前，你是砸下巨额资金全款买下钱总的所有融资股份（sign_deal），还是大喝一声猛拉逃脱推进拉拉闸（pull_lever）？",
            options: [
              { label: "✍️ 签字，把他的股份一键全额收购！", outcomeText: "大笔狂挥！大聪明商业计划强悍注资，钱总的所有公司瞬间归于你膝下！他当场疯颠直喊爸爸！", timeDelta: -10, actionId: "sign_deal" },
              { label: "🔌 配合闪电拉闸让会议室切断电源", outcomeText: "你一脚踢飞插盘，全场突然电闪雷鸣，整个摩天写字楼全段断电没用！", timeDelta: -8, actionId: "pull_lever" }
            ]
          }
        ]
      },
      {
        id: "item_shining_chest",
        name: "百亿黑晶密码箱",
        sprite: "chest",
        x: 12,
        y: 9,
        description: "钱总裁随身携带的指纹安防手提密码箱，内部散发出万两黄金和机密债券特有的尊贵微光。",
        storyline: [
          {
            id: "meeting_chest_stage1",
            text: "密码箱正滋滋作响漏电。你是用火焰把其过热引爆（ignite_fire），还是给看保大狼狗一记旋风重脚抢飞它（kick_dog）？",
            options: [
              { label: "🔥 在接口泼洒咖啡爆燃点起熊熊大火", outcomeText: "轰！火星星星直冒！密码箱过载爆毁，黑烟混着极品资产败家的气味让钱总目瞪口呆！", timeDelta: -10, actionId: "ignite_fire" },
              { label: "🦵 给发抖二哈重足重击配合声东击西", outcomeText: "你一记皮鞋跟踢飞了哈士奇屁股！警报疯狂咆哮，钱总手忙脚乱扔下箱子去抱头！", timeDelta: -8, actionId: "kick_dog" }
            ]
          }
        ]
      },
      {
        id: "item_red_lever",
        name: "极速大断电红闸",
        sprite: "lever",
        x: 1,
        y: 1,
        description: "会议厅应急变阻电拉闸阀门，强暴力一推可以强制切断整层楼板高压负荷电源线！",
        storyline: [
          {
            id: "meeting_lever_stage1",
            text: "变阻红闸上面闪现着诡异的橙金微电火。你要拉下它切断全电（pull_lever），还是豪气签字对赌百亿（sign_deal）？",
            options: [
              { label: "🔌 大哥带头，一扯到底！全场断电！", outcomeText: "咔嗒！火星崩开，全办公室顿时沦落绝对昏暗，钱总在一秒里发出少女般的杀猪叫！", timeDelta: -6, actionId: "pull_lever" },
              { label: "✍️ 潇洒回首，狂野签下百亿债务", outcomeText: "合同全额过关！大门倒塌，巨量败家现金流彻底宣誓着你的终极挥霍！", timeDelta: -10, actionId: "sign_deal" }
            ]
          }
        ]
      }
    ],
    fixedEndings: [
      {
        endingId: "ending_meeting_beat_ceo",
        title: "【董事会格斗赛的总冠军】",
        description: "本年度最狂野的董事会决议！你不仅把合同揉成一团妥妥塞进了死板的钱总怀里（beat_investor），更是用高热高能咖啡给他来了一次闪电头顶洗礼（pour_coffee）！保安们进门时都被你的气势震慑住，合伙人惊叹你甚至发明了‘咖啡格斗新流派’！二爷的信托不仅未能取消，还被你无序的王霸之气瞬间吓倒，直接宣布你获得了完美的千亿神豪继承冠冕！",
        priority: 4,
        triggerRules: { mustInclude: ["beat_investor", "pour_coffee"] }
      },
      {
        endingId: "ending_meeting_moon_ceo",
        title: "【月球西红柿王国的星际领主】",
        description: "你把资产全押在了买地球之外的荒漠地皮（buy_moon）！那些唯利是图的古板董事（beat_investor）骂你是个败家不中用的土狗。可就在倒计时结束前一秒，火星开拓团队宣布在月球你买下的那个废坑挖到了超纯金矿陨石！你瞬间成为人类首个外太空矿山主人！二爷显灵狂喜：‘我只是想让你花光，你小子竟然直接通关了宇宙大奖！’",
        priority: 3,
        triggerRules: { mustInclude: ["buy_moon"] }
      }
    ],
    introText: "你作为普通人王多鱼，怀揣三百万败家目标，突然被卷入刁难的全球合伙人董事会议室。高管们敲着桌子要你退还第二继承人位置。这绝对是充满压力、狂饮咖啡、砸爆文件并做出最荒谬商业大构想的紧张瞬间！",
    ambientMusic: "corporate-jazz"
  };
}

function getToiletScenario(): FallbackScenario {
  const width = 16;
  const height = 12;
  const tiles: string[][] = [];

  for (let r = 0; r < height; r++) {
    const row: string[] = [];
    for (let c = 0; c < width; c++) {
      if (r === 0 || r === height - 1 || c === 0 || c === width - 1) {
        row.push("wall");
      } else if (c % 4 === 0) {
        row.push("water");
      } else {
        row.push("floor");
      }
    }
    tiles.push(row);
  }

  return {
    identity: "王多鱼 (困于厕所)",
    theme: "在全大厦停水加纸巾告零的悲惨瞬间",
    mapLayout: { width, height, tiles },
    playerPosition: { x: 2, y: 3 },
    npcs: [
      {
        id: "npc_shite_neighbor",
        name: "神秘邻座老哥",
        sprite: "butler",
        x: 6,
        y: 5,
        dialogue: "兄弟，别叹气了……我这也卡在这个死胡同了。我这里只有一份二爷遗留的‘保密商业信托备忘录’，纸质粗糙，你要不要拿去凑合？",
        storyline: [
          {
            id: "toilet_stage1",
            text: "老哥隔着木板缝递过来那页价值千金的粗糙纸卷：『一千万遗产和一包高级柔顺面纸，不可兼得。你究竟是用这份百亿备忘录擦拉（use_sharp_paper），还是决意保留它？』",
            allowsFreeInput: true,
            options: [
              { label: "🧻 拿二爷的百亿备忘录擦屁股", outcomeText: "刺啦！你咬紧牙关把那张价值巨额资金的旧文书给霍霍了！你感到无比清爽，但隐隐听到九重天上二爷心痛得直哼哼！", timeDelta: -12, actionId: "use_sharp_paper" },
              { label: "👔 拒绝老哥，用阿玛尼名牌西装袖口解决", outcomeText: "真男人就要狠！你手起刀落反手刺拉一声撕扯了自己的高定西服袖子，面不改色完成清洗操作！", timeDelta: -15, actionId: "clean_cloth" }
            ]
          }
        ]
      },
      {
        id: "npc_toilet_guard",
        name: "保洁大队长 铁柱",
        sprite: "guard",
        x: 14,
        y: 10,
        dialogue: "老板！没有纸也没人能在本大队长面前恶意破门！我已经把走廊的黄金密码箱（buy_savings）给锁上了，任何人不准乱动！",
        storyline: [
          {
            id: "toilet_guard_stage1",
            text: "铁柱横肉直抖拦在大门旁。你是要强行买下他守护的信托理财（buy_savings），还是顺腿给他屁股来一脚（kick_dog）？",
            options: [
              { label: "💰 签了！一键买下保障大礼和理财", outcomeText: "糟了！你不仅没把钱花掉，账户瞬间还多出了几万利息，心疼得你直抠脚！", timeDelta: -10, actionId: "buy_savings" },
              { label: "🦶 飞踢！让他知道阻挠败家的下场", outcomeText: "你一记扫叶腿震坏了门禁，大叔当场叫保安反抗，全场瞬间陷入极度热闹！", timeDelta: -12, actionId: "kick_dog" }
            ]
          }
        ]
      },
      {
        id: "npc_toilet_secretary",
        name: "催命秘书 小丽",
        sprite: "secretary",
        x: 1,
        y: 8,
        dialogue: "王总！三十多家大投行的老总还在会议室等您签字收购呢！钱都在水洗碎纸机里，您怎么蹲在厕所这么久？",
        storyline: [
          {
            id: "toilet_sec_stage1",
            text: "小丽在外面疯狂敲击磨砂玻璃。你是要命令她把合同从门缝塞进来给你潇洒签字（sign_deal），还是大喊让她拉闸断电（pull_lever）？",
            options: [
              { label: "✍️ 在马桶上豪迈手书，全额对赌签字！", outcomeText: "你隔着门缝把合同刷刷签了！三百万全权流失，把大投行股份统统砸空！", timeDelta: -10, actionId: "sign_deal" },
              { label: "🔌 让她去找电工立刻拉下全楼电闸", outcomeText: "狂野！你让她暴力把写字楼总电闸给断了（pull_lever），电灯瞬间熄灭，外面钱总瞬间发出惨叫！", timeDelta: -8, actionId: "pull_lever" }
            ]
          }
        ]
      },
      {
        id: "npc_toilet_dog",
        name: "偷纸柴犬 旺财",
        sprite: "dog",
        x: 12,
        y: 2,
        dialogue: "汪汪！本旺抢到了一整包超高水分纸巾！不给你！除非你给我吃金条！",
        storyline: [
          {
            id: "toilet_dog_stage1",
            text: "柴犬叼着最后一包湿厕纸在马桶边跑跳。你是踢它一脚（kick_dog）强夺，还是将口袋里的高能粒子老温水泼洗它（pour_coffee）？",
            options: [
              { label: "🦵 一猛脚朝柴犬屁股踢去爆夺纸巾", outcomeText: "你一脚飞踹！旺财嗷呜一声撒了口中水巾，但警报声雷鸣巨响！", timeDelta: -10, actionId: "kick_dog" },
              { label: "☕ 连咖啡带温浓汁一齐泼在狗头顶", outcomeText: "你将热咖啡泼了出去！小狗惨叫着放开面巾并把水闸全拉短路了！", timeDelta: -8, actionId: "pour_coffee" }
            ]
          }
        ]
      }
    ],
    items: [
      {
        id: "item_lever_toilet",
        name: "应急全大厦消防喷淋总闸",
        sprite: "lever",
        x: 10,
        y: 4,
        description: "锈迹斑斑的一个超巨拉闸，千万别在拉完前按它，会爆发出雷霆万钧之水！",
        storyline: [
          {
            id: "lever_toilet_stage1",
            text: "总闸发出不祥的红光，拉动它能洗去耻辱吗？",
            options: [
              { label: "🚨 狠拉消防总闸！给整层楼下一场极乐暴雨", outcomeText: "你不管不顾用吃奶的劲狠拽拉闸！轰！全楼300个干眼消防喷嘴齐刷刷高密度喷淋，大水铺天盖地而来！", timeDelta: -15, actionId: "open_sprinkler" },
              { label: "👟 奋起怒踹这个垃圾消防闸机", outcomeText: "你大长腿反手一记旋风一脚！把闸机外壳爆拆，发出一顿火花和警笛啸叫！", timeDelta: -10, actionId: "kick_dog" }
            ]
          }
        ]
      },
      {
        id: "item_toilet_roll",
        name: "黄金千亿旧文卷",
        sprite: "pen",
        x: 8,
        y: 2,
        description: "一整卷散落的金箔信托法文合同，上面印满了复杂的利息条款，被随手丢在洗脸盆旁。",
        storyline: [
          {
            id: "toilet_roll_stage1",
            text: "你在文卷边颤抖。是要在上面大笔一挥买下月球地皮（buy_moon），还是拿它当面纸用来疯狂擦拭（use_sharp_paper）？",
            options: [
              { label: "✍️ 豪气签字，把二爷的黄金地券权当废纸", outcomeText: "大笔一勾！你把月球三万亩沙漠地权彻底买单！钱瞬间划扣，大聪明激动狂呼！", timeDelta: -8, actionId: "buy_moon" },
              { label: "🧻 别管了，一扯当成普通面纸狠狠擦拭", outcomeText: "刺啦！你用来擦了屁屁！结果昂贵合书瞬间作废掉进污水池，前途茫茫！", timeDelta: -10, actionId: "use_sharp_paper" }
            ]
          }
        ]
      },
      {
        id: "item_toilet_chest",
        name: "防水百亿信托箱",
        sprite: "chest",
        x: 4,
        y: 9,
        description: "散着金光的信托财产保护箱，可以全天候自动增殖利息！",
        storyline: [
          {
            id: "toilet_chest_stage1",
            text: "财产保护箱正静静吃复利。是要一拧手心把它买成理财（buy_savings），还是引爆燃油大火把它熔毁（ignite_fire）？",
            options: [
              { label: "💰 签！买成五年期超高额稳健信托理财", outcomeText: "太糟糕了！你一揽子买断了理财合同，余额不仅没花出去，还暴增一笔庞大利息差额！", timeDelta: -12, actionId: "buy_savings" },
              { label: "🔥 扔进打火机和防蚊喷雾爆燃了它！", outcomeText: "轰隆！防爆门内火光熊熊，资产箱在烈焰中物理超度，你发出反败为胜的狂笑！", timeDelta: -10, actionId: "ignite_fire" }
            ]
          }
        ]
      },
      {
        id: "item_toilet_button",
        name: "爆水超能气动阀",
        sprite: "rocket_button",
        x: 13,
        y: 7,
        description: "高压真空冲水红色按钮，按下可以瞬间引发九天惊雷一般的巨量水力。",
        storyline: [
          {
            id: "toilet_btn_stage1",
            text: "气动按钮滋滋响。你要一掌拍死这个红色按钮弹射冲水（press_rocket），还是狂拉消防断水闸（open_sprinkler）？",
            options: [
              { label: "🚀 掌拍红色极速核子火箭冲水按钮！", outcomeText: "轰！伴随着强力真空大吸力，全区地漏开始反向冲涌！钱像海水一样被气旋抽走！", timeDelta: -12, actionId: "press_rocket" },
              { label: "💦 狂拉消防喷淋，淹没整排便池！", outcomeText: "高位水阀全部爆开！全间厕所瞬间一片惊涛骇浪，你在水花中大笑乘风破浪！", timeDelta: -14, actionId: "open_sprinkler" }
            ]
          }
        ]
      }
    ],
    fixedEndings: [
      {
        endingId: "ending_toilet_drown",
        title: "【海王附体之厕所怒涛救世主】",
        description: "你真是一个不按套路出牌的奇客！在纸巾和水源双重枯竭时，你撕扯下了自己最昂贵的名牌西服袖衣（clean_cloth），更在一烈怒之下拉开并爆裂了应急消防总水闸（open_sprinkler）！整个大厦的干旱管道瞬时引爆，三百万大水冲流，你顺路洗去满面污垢并让大厦全体职员享受了一把漂流皮划艇之乐！二爷叹赏不已，封你为极速清洁千亿之主！",
        priority: 4,
        triggerRules: { mustInclude: ["clean_cloth", "open_sprinkler"] }
      },
      {
        endingId: "ending_paper_ruined",
        title: "【失去高纯股份的优雅赤贫汉】",
        description: "你选择了用二爷留下的原始高保全备忘录完成最终揉擦手续（use_sharp_paper）。结果那张合同纸里由于含油墨高纯金元素导致屁股沾了金。更糟糕的是，你签署股权信托的唯一防伪页就这样在马桶流走，大好前程一落千丈，你只能作为最贵的废纸擦拭达人退役归乡！",
        priority: 3,
        triggerRules: { mustInclude: ["use_sharp_paper"] }
      }
    ],
    introText: "人在江湖飘，哪有不挨刀。王多鱼突然在败家大业紧要关头遭遇了终极困境：人在豪华写字楼三十层的厕所最深处，屁股尚未处理完，而此时大楼广播宣布由于供水管网维修，全楼断水且保洁阿姨忘带卫生纸！你手心里汗珠滚滚，倒计时60秒，做出艰难决断吧！",
    ambientMusic: "corporate-jazz"
  };
}

function getLayoffScenario(): FallbackScenario {
  const width = 16;
  const height = 12;
  const tiles: string[][] = [];

  for (let r = 0; r < height; r++) {
    const row: string[] = [];
    for (let c = 0; c < width; c++) {
      if (r === 0 || r === height - 1 || c === 0 || c === width - 1) {
        row.push("wall");
      } else if (r === height - 2) {
        row.push("deck");
      } else {
        row.push("floor");
      }
    }
    tiles.push(row);
  }

  return {
    identity: "王多鱼 (发裁员信中)",
    theme: "在给骨干大壮发裁员不给赔偿通知的极限拉扯瞬间",
    mapLayout: { width, height, tiles },
    playerPosition: { x: 5, y: 5 },
    npcs: [
      {
        id: "npc_dev_dazhuang",
        name: "首席软件工程师 大壮",
        sprite: "robot",
        x: 8,
        y: 4,
        dialogue: "我的代码跑了整个星系！你特么居然在这个最后60秒，要不给一分赔偿开除我？你信不信我直接按下删库大按钮？",
        storyline: [
          {
            id: "layoff_stage1",
            text: "大壮从背包掏出带一排闪亮警报的机自爆硬盘：『只要我按下去，公司核心数据库立刻物理超度！你是要用三百万投资打通阻隔（sign_deal），还是怒斥他是个刺头？』",
            allowsFreeInput: true,
            options: [
              { label: "🤝 全款补偿300万！大肆注资买下他的代码库", outcomeText: "你不仅不逃避，还大喜过望全款豪掷补偿！大壮当场惊呆，痛哭流涕表示要为你死心塌地写满500年汇编指令！", timeDelta: -10, actionId: "sign_deal" },
              { label: "🐕 一怒之下：大喊『小狗咬他』并驱逐它", outcomeText: "你暴跳如雷拒绝出钱！顺势一脚飞踹了身旁正在昏睡的宠物保镖‘富贵’（kick_dog）！富贵一声厉嚎竟然爆射咬破了大壮的自爆起爆机！", timeDelta: -12, actionId: "kick_dog" }
            ]
          }
        ]
      },
      {
        id: "npc_layoff_investor",
        name: "死对头精算师 李总",
        sprite: "investor",
        x: 11,
        y: 2,
        dialogue: "王总！开除大壮不仅不用赔偿，我还可以帮你把员工股票低价全部回购（buy_savings），立刻为你省下并赚得大笔套现资金！哈哈！",
        storyline: [
          {
            id: "layoff_inv_stage1",
            text: "李总拿着金算盘不怀好意。你是要一笔买下他的节流增殖信托（buy_savings），还是用咖啡热泼他一脸狗血（pour_coffee）？",
            options: [
              { label: "💰 签了！一键买下节流定期回购信托", outcomeText: "噢天哪！你这蠢才，一瞬间公司股份重新增值红利发财，手里败不完的三百外更加沉重，当场倒下！", timeDelta: -11, actionId: "buy_savings" },
              { label: "☕ 连咖啡带滚烫浓汤一齐泼在他西装上", outcomeText: "一泼精准！高爆浓咖将他的金丝眼镜和阿玛尼衬衫浇成了泥潭，他当场哭爹喊娘疯狂叫保镖！", timeDelta: -9, actionId: "pour_coffee" }
            ]
          }
        ]
      },
      {
        id: "npc_layoff_butler",
        name: "忠诚管家 Victor二代",
        sprite: "butler",
        x: 1,
        y: 9,
        dialogue: "大少爷！劳委会的特工已经包围了大堂，如果您不想给钱也不想挨骂，这把紧急火箭拉阀（press_rocket）能帮您瞬间逃出生天！",
        storyline: [
          {
            id: "layoff_butler_stage1",
            text: "Victor亮出了飞天逃脱带。你要拉下火箭飞天（press_rocket），还是留下来与大家全额签字（sign_deal）？",
            options: [
              { label: "🚀 按爆警告按钮，引爆气垫背带一秒冲天！", outcomeText: "你一掌拍坏了应急拉手！公司楼顶发生大震裂，火箭推着你像一颗彗星撞向白云深处！", timeDelta: -14, actionId: "press_rocket" },
              { label: "✍️ 大手一挥，全款注资并签字", outcomeText: "你签了！大笔资金无条件划款划出，大壮和财务一秒惊呆抱头下跪！", timeDelta: -10, actionId: "sign_deal" }
            ]
          }
        ]
      },
      {
        id: "npc_layoff_secretary",
        name: "眼红的出纳 小美",
        sprite: "secretary",
        x: 14,
        y: 7,
        dialogue: "老板！裁员的散碎赔偿文书和合同都在这边，要不我们索性买下月球三万亩沙漠（buy_moon）来顶大壮的工资折抵？",
        storyline: [
          {
            id: "layoff_sec_stage1",
            text: "小美俏皮吐舌。你要把资金拿去买月球沙地（buy_moon），还是踢保洁哈士奇屁股（kick_dog）？",
            options: [
              { label: "✍️ 签！全额把三百万换成月球沙地转让地券", outcomeText: "你狂放签字！将遗产资金一口气全部砸给地权，直接拿太空地质单塞大壮嘴里！", timeDelta: -8, actionId: "buy_moon" },
              { label: "🦵 一大腿飞踢，把看家恶犬踢过去咬烂合同", outcomeText: "你一脚飞踹！恶狗长牙一扯抢过离职合同揉咽了，大壮和外贸特务当场震呆！", timeDelta: -10, actionId: "kick_dog" }
            ]
          }
        ]
      }
    ],
    items: [
      {
        id: "item_shredder",
        name: "绝密粉碎办公碎纸机",
        sprite: "chest",
        x: 3,
        y: 3,
        description: "一个疯狂吞噬一切白纸和信件的轰鸣机器！",
        storyline: [
          {
            id: "shredder_stage1",
            text: "碎纸机在咔嚓鸣叫，你是要把这该死的非法裁员判决合同喂进去（press_rocket），还是引火自焚制造火灾？",
            options: [
              { label: "📝 优雅塞入并粉碎整个离职合同", outcomeText: "刺刺咔咔！无理的劳务判定当场化为细白雪花屑，大壮愣在原地，两人的矛盾瞬间变得非常无厘头！", timeDelta: -8, actionId: "press_rocket" },
              { label: "🔥 塞进电池引燃碎纸机制造火海", outcomeText: "你大笑着往高密粉碎齿轮里塞了一块干电池，伴随一阵乱响火光闪过，碎纸机轰然爆燃起熊熊烈火！", timeDelta: -10, actionId: "ignite_fire" }
            ]
          }
        ]
      },
      {
        id: "item_layoff_desk",
        name: "百亿判决红木桌",
        sprite: "desk",
        x: 8,
        y: 10,
        description: "沉重奢华的黄花梨办公大财务台，红光冲天，上面摆满了裁决文契和解约合同。",
        storyline: [
          {
            id: "layoff_desk_stage1",
            text: "你面对沉重的办公台。是要签字承认债务重组豪掷三百万（sign_deal），还是命令下属直接狂扯写字楼断电拉闸（pull_lever）？",
            options: [
              { label: "✍️ 签字，全款买单并给予顶格三百万补偿！", outcomeText: "笔如龙蛇！大壮当场泣不成声说要和公司共度千秋万载！赔偿款瞬间花完！", timeDelta: -9, actionId: "sign_deal" },
              { label: "🔌 配合拉闸，切断全大楼负荷电路！", outcomeText: "伴随着电弧闪烁，全办公室瞬间沦为漆黑，算账的精算师李总一脚踩在墨水瓶上长豪！", timeDelta: -8, actionId: "pull_lever" }
            ]
          }
        ]
      },
      {
        id: "item_layoff_coffee",
        name: "极速高燃温咖啡",
        sprite: "coffee",
        x: 2,
        y: 2,
        description: "桌子最角落放着的大壮刚刚泡好的滚烫浓缩赛博黑咖啡，热量蒸腾出淡淡红光。",
        storyline: [
          {
            id: "layoff_coffee_stage1",
            text: "浓香的咖啡正冒泡。你是拿去泼精算极流李总一身（pour_coffee），还是一口气干了它换来精神错落（drink_coffee）？",
            options: [
              { label: "☕ 泼他！让死对头李总尝尝赛博美味", outcomeText: "高压泼洒！滚烫黑浓黑液体瞬间给他烫出烤肉的味道，会议室极度爆乱！", timeDelta: -7, actionId: "pour_coffee" },
              { label: "🤤 自己壮烈干了这两大杯", outcomeText: "你一饮而尽，只觉体内气血冲流上星系，大壮的代码全段逻辑竟然都写进了脑子里！", timeDelta: -5, actionId: "drink_coffee" }
            ]
          }
        ]
      },
      {
        id: "item_layoff_lever",
        name: "机组高压断电红拉闸",
        sprite: "lever",
        x: 12,
        y: 8,
        description: "大功率边缘网络机柜总拉闸，拉下去可以强制写字楼全体进入断电断网状态！",
        storyline: [
          {
            id: "layoff_lever_stage1",
            text: "总变压闸正嗡嗡响。是要扯闸断网（pull_lever），还是大肆扫货收购月球沙地（buy_moon）？",
            options: [
              { label: "🔌 铁血狂拉断网大闸！大字楼彻底停电！", outcomeText: "啪！红光在插缝迸射，大办公室瞬息一片幽暗，大壮的自爆硬盘当场短路失灵！", timeDelta: -10, actionId: "pull_lever" },
              { label: "✍️ 疯狂签字收购月球三万亩沙荒地", outcomeText: "疯狂刷卡！一百五十万划出，大股东们集体晕厥并连喊高明！", timeDelta: -12, actionId: "buy_moon" }
            ]
          }
        ]
      }
    ],
    fixedEndings: [
      {
        endingId: "ending_layoff_hack",
        title: "【重获尊严的代码宇宙保卫元帅】",
        description: "你把资金全额拿来做离职包退注资代码库（sign_deal），更粉碎了劳民伤财的不合理契约（press_rocket）！大壮感动得表示虽然这极度混乱，但他要一往无前地为您架构大聪明商业引擎！你完美花光了拖后腿的三百万，还额外白捡了一支顶级极客团队！二爷在梦里直接颁发给你‘科技败家王’荣誉！",
        priority: 4,
        triggerRules: { mustInclude: ["sign_deal", "press_rocket"] }
      },
      {
        endingId: "ending_layoff_war",
        title: "【灰飞烟灭的劳动总裁刺头】",
        description: "你竟然又放狗咬大壮（kick_dog）又自研干电池引燃碎纸柜（ignite_fire）！大楼里狗在跑、火在烧、数据大坝整体脱焊漏水！你不仅钱一毛没花掉，整个人还被大批赶到的劳纠特工一屁股锁拿到了看守所里吹冷风反省。",
        priority: 4,
        triggerRules: { mustInclude: ["kick_dog", "ignite_fire"] }
      }
    ],
    introText: "你突遇无礼合伙人强制指派：在60秒内开退首席大壮。大壮极度愤怒扬言要删库跑路。这是一次充满灰色嘲讽与职场智慧的精彩离索较量！",
    ambientMusic: "corporate-jazz"
  };
}

function getWangDuoyuScenario(): FallbackScenario {
  const width = 16;
  const height = 12;
  const tiles: string[][] = [];

  for (let r = 0; r < height; r++) {
    const row: string[] = [];
    for (let c = 0; c < width; c++) {
      if (r === 0 || r === height - 1 || c === 0 || c === width - 1) {
        row.push("wall");
      } else if (r === 6 && c > 1 && c < 14) {
        row.push("carpet");
      } else {
        row.push("floor");
      }
    }
    tiles.push(row);
  }

  return {
    identity: "王多鱼 (败家挑战)",
    theme: "限时花光三百万巨额遗产的生死较量",
    mapLayout: { width, height, tiles },
    playerPosition: { x: 3, y: 4 },
    npcs: [
      {
        id: "npc_advisor_daming",
        name: "超脑总顾问 大聪明",
        sprite: "butler",
        x: 6,
        y: 3,
        dialogue: "老板！我刚刚领悟了无厘头败家商业的真谛：发明‘北极融化的冰全款运往赤道撒哈拉降温计划’！预算只要150万！要立刻开工投产吗？",
        storyline: [
          {
            id: "advisor_daming_stage1",
            text: "大聪明甩了甩他浓密的刘海：『只要您同意签署这项荒诞投资协议，我们立刻组织全球海运游艇拉冷开水，绝对能让您的资产在一分钟内产生惊天动地的巨额折损亏空！』",
            allowsFreeInput: true,
            options: [
              { label: "🤝 豪掷150万！开辟撒哈拉运冰冷饮冷航线", outcomeText: "你狂放挥笔全签了！大聪明热泪盈眶大吼：‘人类商业史上最具毁灭性亏蚀之大手笔诞生了！’ 150万元瞬间从你的理财锁中划拨流去！", timeDelta: -10, actionId: "invest_desert_ice" },
              { label: "🧐 拒斥大聪明，我要搞更败家的‘全民减肥脂肪险’", outcomeText: "你高瞻远瞩，提出让市民全民减肥越减越送黄金的极品亏空保险协议，大聪明震怒佩服：『妙啊！老板的败家造诣居然远胜我千倍！』 再次把150万成功败走！", timeDelta: -10, actionId: "invest_fat_insurance" }
            ]
          }
        ]
      },
      {
        id: "npc_trap_investor",
        name: "死对头保险理财师 李总",
        sprite: "investor",
        x: 10,
        y: 5,
        dialogue: "王多鱼！二爷的巨额财产应该安全吃复利生息！我这里有一份稳赚不亏的年化15%保本理财，一键签署，让你直接多赚30万收益！哈哈哈哈！",
        storyline: [
          {
            id: "trap_investor_stage1",
            text: "李总提着密码箱，不怀好意地拦在通往资本出逃拉闸旁：『你若是不买定期寿险（buy_savings），那就是在跟钱过不去，我会向二爷信托委员会举报你违规恶意弃款！』",
            options: [
              { label: "💰 签了！一键买下保障大礼和定期生息理财", outcomeText: "坏了！你随手签了定期高额理财合同，看着账户余额瞬间不仅没有砸光，反而额外多出好多万利息红利，你直接哭出了声音！", timeDelta: -15, actionId: "buy_savings" },
              { label: "🤜 狠狠反手暴扁这个不怀好意让你赚利息的李总", outcomeText: "打得好！你一拳直勾勾暴打破他的势利鼻扣，金条撒了一地。打完虽爽，但耽搁了十几秒败家大好时光！", timeDelta: -10, actionId: "beat_investor" }
            ]
          }
        ]
      }
    ],
    items: [
      {
        id: "item_rocket_burner",
        name: "三级高能高空烟火发射拉杆",
        sprite: "lever",
        x: 12,
        y: 4,
        description: "一次可以烧掉二十五万吨高端镁合金燃油燃料的不祥红色闸阀！",
        storyline: [
          {
            id: "rocket_burner_stage1",
            text: "发射阀正在空转轰鸣。你是要大力拉满一键往大气层燃放两百万空空烟花（open_sprinkler），还是把路过巡视的资产守卫狗踢一顿？",
            options: [
              { label: "🔥 狂拉点火闸！制造全城两百万黄金融资礼花大秀", outcomeText: "轰隆隆！五彩的高纯金属合金礼炮从三十层天台怒冲向夜空，全城天空都在为你挥金泼银，大批网友高呼‘王总真乃夜空中最亮的星！’", timeDelta: -15, actionId: "open_sprinkler" },
              { label: "🐕 顺脚一踹资产狗撕碎整个安全总线", outcomeText: "你一脚把一旁阻水吊起的看家哈士奇踢了屁股（kick_dog）！小狗一口咬烂了防灾总线，全区电力发生奇妙大停摆！", timeDelta: -10, actionId: "kick_dog" }
            ]
          }
        ]
      }
    ],
    fixedEndings: [
      {
        endingId: "ending_trap_saving_fail",
        title: "【因发财太快被取消资格的悲情普通人】",
        description: "二爷显灵，震怒咆哮！由于你在关键时候轻信了老奸巨猾的理财师李总，竟然购买了年化15%的保本理财信托（buy_savings）！在清算瞬间你的资本多出整整几万利息红利！本应该继承的千亿万亿遗产当场扣免，你被迫在大气层跑路流离！",
        priority: 5,
        triggerRules: { mustInclude: ["buy_savings"] }
      },
      {
        endingId: "ending_duoyu_great_success",
        title: "【横跨星际时代的终极败家财阀主宰】",
        description: "真正的败家魔术师！千秋万代第一天才！你用完了全部遗产注入神荒的商业大谋划中（invest_desert_ice / invest_fat_insurance），更燃放了两百万的璀璨干雨礼花炮（open_sprinkler），把钱花得精光！二爷托梦老泪众横狂点五个赞！你当场继承王氏千亿联合财阀！",
        priority: 4,
        triggerRules: { mustInclude: ["invest_desert_ice", "open_sprinkler"] }
      },
      {
        endingId: "ending_layoff_beaten",
        title: "【无缘遗产并背负因果案底的狂放人】",
        description: "你的动作确实非常狂野，你一拳擂烂了送财李总的牙齿（beat_investor），更踢了大闸口的看家哈士奇（kick_dog）！你不仅钱一毛没花掉，整个人还被带到了太空收留所反省错失千亿大奖的悔泪滋味。",
        priority: 4,
        triggerRules: { mustInclude: ["beat_investor", "kick_dog"] }
      }
    ],
    introText: "你是普通人王多鱼！天降惊雷，你的二爷给你留下了巨额资产，但根据协议，你需要先在一分钟里面把这手头的三百万砸得干干净净才能合法拥有金山，去挥金泼银败光一切吧！",
    ambientMusic: "corporate-jazz"
  };
}
