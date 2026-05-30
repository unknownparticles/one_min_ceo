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
  // 1. DEFAULT: CEO / NASDAG IPO BLOCKBUSTERS (纳斯达克敲钟倒计时60秒)
  // =========================================================================
  if (norm.includes("ski") || norm.includes("雪") || norm.includes("champion")) {
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
