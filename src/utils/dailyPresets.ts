import { DailyChallenge, BossIdentityType } from "../types";

export const dailyChallenges: DailyChallenge[] = [
  {
    id: "daily-1",
    title: "今日特惠：便利店老板的一分钟",
    identityType: "CEO",
    identityName: "神级便利店巨鳄",
    customPrompt: "一个拥有全球10万家便利店，但此时此刻在最破的一家分店亲自当收银员，距离抢劫犯进门还有60秒。",
    description: "手握全球便利店帝国的钥匙，今天你伪装成了深夜店员，收银台里有一支金色的热狗和一台能黑进五角大楼的扫描枪。",
    dateString: "2026-05-30",
  },
  {
    id: "daily-2",
    title: "今日特惠：太空旅行者的深空流浪",
    identityType: "SPACE",
    identityName: "半人马座采矿大亨",
    customPrompt: "在个人豪华宇宙飞船被引力波拉向视界前，最后一分钟决定在舰长茶水间煮一杯咖啡。",
    description: "黑洞拉扯着飞船外壳，你在最高档的星空吧台，面前是一头基因变异的虚空犬和一颗高维度恐龙蛋，开始你的选择！",
    dateString: "2026-05-31",
  },
  {
    id: "daily-3",
    title: "今日特惠：落魄名厨的米其林保卫战",
    identityType: "CHEF",
    identityName: "黄金餐勺继承人",
    customPrompt: "距离顶级美食大亨评级委员会代表咬下第一口鹅肝还有60秒。你的后厨有一只外星老鼠和一支神秘药丸。",
    description: "这是决定你帝国繁荣的终极一分钟，你会选择听从神秘老鼠的命令，还是把黄金勺子塞进评委的嘴里？",
    dateString: "2026-06-01",
  },
];

export function getDailyChallenge(dateStr?: string): DailyChallenge {
  const currentLocalTime = dateStr || new Date().toISOString().split("T")[0];
  const found = dailyChallenges.find((c) => c.dateString === currentLocalTime);
  return found || dailyChallenges[0];
}
