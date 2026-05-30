# generate_100_fallback_worlds.py
import os
import json
from pathlib import Path
from tenacity import retry, stop_after_attempt, wait_exponential, RetryError
import time
from openai import OpenAI
import re
import json

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
OUT_DIR = Path("public/fallback-worlds")
COUNT = 100

if not DEEPSEEK_API_KEY:
    raise RuntimeError("请先设置环境变量 DEEPSEEK_API_KEY")

client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url="https://api.deepseek.com")

# 100 个独特主题和身份组合
WORLD_SEEDS = [
    {"identity":"纳斯达克终极CEO","theme":"纳斯达克IPO敲钟前60秒"},
    {"identity":"月球证券大亨","theme":"月球证券交易所熔断前60秒"},
    {"identity":"火星地产大亨","theme":"火星地产泡沫爆炸前60秒"},
    {"identity":"量子银行董事长","theme":"量子银行挤兑前60秒"},
    {"identity":"AI神谕CEO","theme":"AI神谕上市路演前60秒"},
    {"identity":"银河系首富","theme":"银河系首富破产清算前60秒"},
    {"identity":"赛博皇宫董事","theme":"赛博皇宫董事会政变前60秒"},
    {"identity":"深海财团掌舵人","theme":"深海财团氧气耗尽前60秒"},
    {"identity":"反物质能源大亨","theme":"反物质能源发布会爆炸前60秒"},
    {"identity":"时空管理局CEO","theme":"时空管理局审计降临前60秒"},

    {"identity":"超级AI集团总裁","theme":"超级AI夺权前60秒"},
    {"identity":"银河资本董事长","theme":"外星股东降临前60秒"},
    {"identity":"跨星系税务巨头","theme":"银河税务局查账前60秒"},
    {"identity":"独角兽帝国创始人","theme":"超级独角兽估值归零前60秒"},
    {"identity":"太阳系金融教父","theme":"太阳系金融危机爆发前60秒"},
    {"identity":"数字货币之王","theme":"数字货币帝国崩盘前60秒"},
    {"identity":"星际赌场老板","theme":"星际赌场破产前60秒"},
    {"identity":"机械神教教宗","theme":"机械神教收购集团前60秒"},
    {"identity":"量子运算之神","theme":"量子计算机觉醒前60秒"},
    {"identity":"银河竞选人","theme":"人类CEO竞选银河皇帝前60秒"},

    {"identity":"火星总统候选人","theme":"火星总统竞选直播翻车前60秒"},
    {"identity":"赛博东京财阀","theme":"赛博东京停电前60秒"},
    {"identity":"太空基建大王","theme":"太空电梯坠毁前60秒"},
    {"identity":"全球AI董事长","theme":"全球AI董事会审判前60秒"},
    {"identity":"多元宇宙商会长","theme":"平行宇宙合并前60秒"},
    {"identity":"银河广告帝王","theme":"银河广告发布会灾难前60秒"},
    {"identity":"黑洞矿业CEO","theme":"黑洞矿业上市前60秒"},
    {"identity":"时空列车总经理","theme":"时空列车失控前60秒"},
    {"identity":"机器人联合会主席","theme":"超级机器人暴动前60秒"},
    {"identity":"火星殖民总督","theme":"火星殖民地叛乱前60秒"},

    {"identity":"世界首富","theme":"世界首富遗嘱公开前60秒"},
    {"identity":"深空考古基金会长","theme":"深空考古发现神明遗迹前60秒"},
    {"identity":"地球出售委员会主席","theme":"外星文明收购地球前60秒"},
    {"identity":"银河能源联盟长","theme":"银河能源垄断案曝光前60秒"},
    {"identity":"元宇宙集团CEO","theme":"元宇宙服务器关停前60秒"},
    {"identity":"全宇宙直播平台老板","theme":"全宇宙直播事故前60秒"},
    {"identity":"火星赌场之王","theme":"火星赌场老板跑路前60秒"},
    {"identity":"超级网络帝国总裁","theme":"超级黑客入侵总部前60秒"},
    {"identity":"空间站拍卖行主人","theme":"空间站拍卖会前60秒"},
    {"identity":"人工太阳集团CEO","theme":"人工太阳失控前60秒"},

    {"identity":"赛博龙宫龙王","theme":"赛博龙宫IPO前60秒"},
    {"identity":"机械佛祖","theme":"机械佛祖融资路演前60秒"},
    {"identity":"银河拍卖会主席","theme":"银河拍卖会压轴成交前60秒"},
    {"identity":"平行世界总会长","theme":"平行世界CEO峰会前60秒"},
    {"identity":"反重力工业巨头","theme":"反重力汽车发布前60秒"},
    {"identity":"时空快递董事长","theme":"时空快递集团上市前60秒"},
    {"identity":"火星娱乐帝国老板","theme":"火星娱乐帝国崩盘前60秒"},
    {"identity":"AI法庭大法官","theme":"超级AI法庭宣判前60秒"},
    {"identity":"外星王室财务官","theme":"外星王室订婚宴前60秒"},
    {"identity":"银河银行总裁","theme":"银河银行总库断电前60秒"},

    {"identity":"量子彩票之神","theme":"量子彩票开奖前60秒"},
    {"identity":"宇宙婚礼赞助商","theme":"宇宙首富婚礼前60秒"},
    {"identity":"星际监狱长","theme":"星际监狱越狱前60秒"},
    {"identity":"深海王国财政大臣","theme":"深海王国金融危机前60秒"},
    {"identity":"银河能源塔管理者","theme":"银河能源塔爆炸前60秒"},
    {"identity":"超级实验室主任","theme":"超级实验室泄漏前60秒"},
    {"identity":"火星交易所CEO","theme":"火星证券交易所重启前60秒"},
    {"identity":"外星移民局局长","theme":"外星移民登陆前60秒"},
    {"identity":"AI总统","theme":"AI总统登基前60秒"},
    {"identity":"银河帝国摄政王","theme":"银河帝国继承仪式前60秒"},

    {"identity":"赛博财神","theme":"赛博财神降临前60秒"},
    {"identity":"太空游乐园园长","theme":"太空游乐园事故前60秒"},
    {"identity":"量子神殿祭司长","theme":"量子神殿开放前60秒"},
    {"identity":"宇宙税务顾问","theme":"平行宇宙税务审查前60秒"},
    {"identity":"反物质仓储大王","theme":"反物质仓库失火前60秒"},
    {"identity":"超级航母舰长","theme":"超级航母起飞前60秒"},
    {"identity":"深空监狱董事长","theme":"深空监狱停电前60秒"},
    {"identity":"火星矿业寡头","theme":"火星矿业巨头暴雷前60秒"},
    {"identity":"银河娱乐集团CEO","theme":"银河歌唱比赛决赛前60秒"},
    {"identity":"外星资本联盟主席","theme":"外星资本峰会前60秒"},

    {"identity":"宇宙购物中心老板","theme":"宇宙尽头购物中心开业前60秒"},
    {"identity":"退市集团创始人","theme":"超级龙头企业退市前60秒"},
    {"identity":"AI偶像经纪人","theme":"AI偶像出道前60秒"},
    {"identity":"机械帝国皇帝","theme":"机械皇帝加冕前60秒"},
    {"identity":"银河联盟议长","theme":"银河联盟弹劾大会前60秒"},
    {"identity":"平行宇宙合伙人","theme":"平行宇宙合伙人会议前60秒"},
    {"identity":"太阳应急委员会主席","theme":"太阳熄灭应急预案启动前60秒"},
    {"identity":"火星银行总裁","theme":"火星银行金库失窃前60秒"},
    {"identity":"超级网红CEO","theme":"超级网红CEO直播前60秒"},
    {"identity":"宇宙拍卖行老板","theme":"宇宙拍卖行最终竞价前60秒"},

    {"identity":"赛博赌场庄家","theme":"赛博赌场世纪豪赌前60秒"},
    {"identity":"时空裂缝研究院长","theme":"时空裂缝扩大前60秒"},
    {"identity":"外星科技集团CEO","theme":"外星科技博览会前60秒"},
    {"identity":"银河审判庭首席法官","theme":"银河审判庭开庭前60秒"},
    {"identity":"机械革命领袖","theme":"机械革命爆发前60秒"},
    {"identity":"AI婚礼策划总监","theme":"超级AI婚礼前60秒"},
    {"identity":"量子龙宫继承人","theme":"量子龙宫继承仪式前60秒"},
    {"identity":"深空殖民舰舰长","theme":"深空殖民舰启航前60秒"},
    {"identity":"火星皇室财务总管","theme":"火星皇宫晚宴前60秒"},
    {"identity":"银河霸主继承人","theme":"银河霸主交接仪式前60秒"},

    {"identity":"宇宙终极CEO","theme":"宇宙终极CEO争霸赛决赛前60秒"},
    {"identity":"神级文明考核官","theme":"神级文明降维考核前60秒"},
    {"identity":"银河IPO委员会主席","theme":"银河系最后一次IPO前60秒"},
    {"identity":"地球出售公司CEO","theme":"人类文明出售地球前60秒"},
    {"identity":"热寂应对委员会主席","theme":"宇宙热寂倒计时前60秒"}
]

# 系统提示，指导 DeepSeek 输出 JSON
SYSTEM_PROMPT = """
你是 one_min_ceo 的 fallback 世界 JSON 生成器。
必须只输出合法 JSON，不要 markdown，不要解释。

顶层结构必须严格包含：
matchKeywords, identity, theme, mapLayout, playerPosition, npcs, items, fixedEndings, introText, ambientMusic

重要：
mapLayout 必须直接输出为 12x16 的二维字符串数组，不要输出 width、height、tileRules 对象。

mapLayout 示例：
[
  ["wall","wall","wall","wall","wall","wall","wall","wall","wall","wall","wall","wall","wall","wall","wall","wall"],
  ["wall","floor","floor","gold_floor","console","floor","floor","carpet","carpet","floor","vault","floor","plant","floor","floor","wall"]
]

允许 tile：
wall, floor, carpet, gold_floor, neon_floor, glass, water, lava, portal, console, throne,
vault, plant, statue, window, stage, elevator, server, crystal, fire, fountain

NPC 最少 5 个，items 最少 5 个。
每个 npc/item 的 storyline 最少 3 个 stage。
每个 stage 的 options 最少 2 个。
fixedEndings 最少 8 个。
identity 必须是字符串，不要输出对象。

风格：中文、荒诞、华丽、戏剧化、60 秒 CEO 危机模拟。
"""

USER_TEMPLATE = """
生成 fallback 世界 JSON。
身份: {identity}
主题: {theme}
必须与 one_min_ceo 结构兼容。
不要输出代码块，只输出 JSON。
"""

def extract_json(text: str) -> dict:
    """
    从 API 返回的文本中提取最外层 JSON。
    支持文本里可能包含额外文字、代码块或说明。
    """
    # 去掉 Markdown 代码块
    text = re.sub(r"^```json\s*|\s*```$", "", text.strip())

    # 找到第一个 { 开始和最后一个 } 结束
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("无法找到 JSON 对象")

    json_text = text[start:end+1]

    try:
        return json.loads(json_text)
    except json.JSONDecodeError as e:
        # 输出部分原文方便调试
        preview = json_text[:500]
        raise ValueError(f"JSON 解析失败: {e}\n文本前500字符:\n{preview}")

def normalize_map_layout(world: dict):
    tiles = world.get("mapLayout")

    if not isinstance(tiles, list):
        raise ValueError("mapLayout 必须是二维数组")

    fixed = []

    for row in tiles[:12]:
        if not isinstance(row, list):
            row = []
        row = row[:16]
        while len(row) < 16:
            row.append("floor")
        fixed.append(row)

    while len(fixed) < 12:
        fixed.append([
            "wall","floor","floor","carpet","gold_floor","console","floor","window",
            "window","floor","server","vault","floor","plant","floor","wall"
        ])

    fixed[0] = ["wall"] * 16
    fixed[-1] = ["wall"] * 16
    for y in range(12):
        fixed[y][0] = "wall"
        fixed[y][-1] = "wall"

    world["mapLayout"] = fixed

def validate_world(world: dict):
    required = [
        "matchKeywords",
        "identity",
        "theme",
        "mapLayout",
        "playerPosition",
        "npcs",
        "items",
        "fixedEndings",
        "introText",
        "ambientMusic"
    ]

    for k in required:
        if k not in world:
            raise ValueError(f"缺少字段: {k}")

    tiles = world["mapLayout"]

    if not isinstance(tiles, list):
        raise ValueError("mapLayout 必须是二维数组")

    if len(tiles) != 12:
        raise ValueError(f"地图行数错误: {len(tiles)}")

    for row in tiles:
        if not isinstance(row, list):
            raise ValueError("地图行必须是数组")

        if len(row) != 16:
            raise ValueError(f"地图列数错误: {len(row)}")

    if len(world["npcs"]) < 5:
        raise ValueError("NPC数量不足")

    if len(world["items"]) < 5:
        raise ValueError("Item数量不足")

    if len(world["fixedEndings"]) < 8:
        raise ValueError("Ending数量不足")

@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=2, max=12))
def generate_world(seed: dict) -> dict:
    resp = client.chat.completions.create(
        model="deepseek-chat",
        temperature=0.9,
        max_tokens=8192,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": USER_TEMPLATE.format(identity=seed["identity"], theme=seed["theme"])}
        ]
    )
    content = resp.choices[0].message.content
    world = extract_json(content)
    normalize_map_layout(world)
    validate_world(world)
    return world

def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    batch_start = time.time()

    # 加载已有 manifest
    manifest_path = OUT_DIR / "manifest.json"
    if manifest_path.exists():
        with open(manifest_path, "r", encoding="utf-8") as f:
            manifest = json.load(f)
    else:
        manifest = []

    manifest_set = set(manifest)

    success_count = 0
    fail_count = 0
    skip_count = 0

    for i, seed in enumerate(WORLD_SEEDS, start=1):
        slug = f"fallback_world_{i:03d}"
        filename = f"{slug}.json"
        out_path = OUT_DIR / filename

        # 已存在文件跳过
        if out_path.exists():
            skip_count += 1
            print(f"[跳过] 世界 {i}: {filename} 已存在")
            if filename not in manifest_set:
                manifest.append(filename)
                manifest_set.add(filename)
            continue

        start = time.time()
        print(f"[生成] 世界 {i}: {seed['theme']}")

        try:
            world = generate_world(seed)
            normalize_map_layout(world)
            validate_world(world)

            world["id"] = slug

            # 临时文件写入，避免写入中断
            tmp_path = OUT_DIR / f"{filename}.tmp"
            with open(tmp_path, "w", encoding="utf-8") as f:
                json.dump(world, f, ensure_ascii=False, indent=2)
            tmp_path.replace(out_path)

            # 更新 manifest
            if filename not in manifest_set:
                manifest.append(filename)
                manifest_set.add(filename)
                with open(manifest_path, "w", encoding="utf-8") as f:
                    json.dump(manifest, f, ensure_ascii=False, indent=2)

            cost = time.time() - start
            success_count += 1
            avg = (time.time() - batch_start) / max(success_count, 1)
            remain = COUNT - (success_count + fail_count + skip_count)
            eta = remain * avg
            print(f"[完成] 世界 {i}: {filename} 耗时 {cost:.1f}s, 平均 {avg:.1f}s/世界, ETA {eta/60:.1f}分钟")

        except RetryError as e:
            cost = time.time() - start
            fail_count += 1
            print(f"[失败] 世界 {i}: DeepSeek 重试失败, 耗时 {cost:.1f}s")
            print(e)

        except Exception as e:
            cost = time.time() - start
            fail_count += 1
            print(f"[失败] 世界 {i}: 生成失败, 耗时 {cost:.1f}s")
            print(e)

    total_cost = time.time() - batch_start
    print("\n====================")
    print("生成完成")
    print("====================")
    print(f"成功: {success_count}")
    print(f"失败: {fail_count}")
    print(f"跳过: {skip_count}")
    print(f"总耗时: {total_cost:.1f}s")
    print(f"平均耗时: {total_cost / max(success_count,1):.1f}s/世界")
    print(f"当前世界总数: {len(manifest)}")
    print("====================")

if __name__ == "__main__":
    main()