
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.LongTelegramI18n=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const messages={
'Triggered ability':{zh:'触发能力',en:'Triggered ability'},
'deck.mainUnavailable':{zh:'苏联卡池暂未补齐，暂时不能作为主国开始对局。',en:'The Soviet card pool is incomplete. USSR is temporarily unavailable as a main nation.'},
'deck.nationFilter':{zh:'国家',en:'Nation'},
'deck.costFilter':{zh:'费用',en:'Cost'},
'deck.rarityFilter':{zh:'稀有度',en:'Rarity'},
'deck.allCosts':{zh:'全部费用',en:'All costs'},
'deck.allRarities':{zh:'全部稀有度',en:'All rarities'},
"deck.remainingCount":{"zh":"剩余 {n} 张","en":"{n} copies available"},
"deck.selectedCount":{"zh":"已选 {n} 张","en":"{n} copies selected"},
"opening.title":{"zh":"起始手牌","en":"OPENING HAND"},
"opening.hint":{"zh":"选择要置换的牌，再次点击即可保留。","en":"Choose cards to replace. Select again to keep them."},
"opening.keep":{"zh":"保留","en":"KEEP"},
"opening.replace":{"zh":"置换","en":"REPLACE"},
"opening.confirm":{"zh":"置换 {n} 张并开始","en":"REPLACE {n} & START"},
"opening.keepAll":{"zh":"全部保留并开始","en":"KEEP ALL & START"},
"opening.dealing":{"zh":"正在抽牌…","en":"DRAWING CARDS…"},
"opening.wait":{"zh":"请先完成起始手牌置换。","en":"Finish choosing your opening hand first."},
"opening.closed":{"zh":"起始手牌已确认。","en":"The opening hand has already been confirmed."},
"opening.invalid":{"zh":"请选择有效的起始手牌。","en":"Choose valid cards from your opening hand."},
"result.victory":{"zh":"胜利","en":"VICTORY"},
"result.defeat":{"zh":"失败","en":"DEFEAT"},
"result.draw":{"zh":"平局","en":"DRAW"},
"result.restart":{"zh":"重新开始","en":"RESTART"},
"hq.destroyed":{"zh":"被摧毁的总部","en":"Destroyed headquarters"},
"Promoted to Veteran.":{"zh":"已升级为老兵。","en":"Promoted to Veteran."},
"Ambush ready":{"zh":"伏击就绪","en":"Ambush ready"},
"Ambush used this round":{"zh":"本轮伏击已使用","en":"Ambush used this round"},
"西柏林":{"zh":"西柏林","en":"West Berlin"},
"加里宁格勒":{"zh":"加里宁格勒","en":"Kaliningrad"},
"deck.hq":{"zh":"3 · 选择总部","en":"3 · Headquarters"},
"deck.invalidHq":{"zh":"请选择属于主国的总部。","en":"Choose a headquarters belonging to your main nation."},
"fx.hqDestroyed":{"zh":"总部被摧毁","en":"HEADQUARTERS DESTROYED"},
"sound.title":{"zh":"音效与背景音乐","en":"Sound & music"},
"sound.enabled":{"zh":"播放音效与背景音乐","en":"Play sounds & music"},
"sound.volume":{"zh":"音量","en":"Volume"},
"法国":{"zh": "法国", "en": "France"},"越南民主共和国":{"zh": "越南民主共和国", "en": "Democratic Republic of Vietnam"},"巴黎":{"zh": "巴黎", "en": "Paris"},"河内":{"zh": "河内", "en": "Hanoi"},"deck.title":{"zh": "组建你的卡组", "en": "Build your deck"},"deck.main":{"zh": "1 · 选择主国", "en": "1 · Main nation"},"deck.ally":{"zh": "2 · 选择辅助国家", "en": "2 · Ally nation"},"deck.cards":{"zh": "4 · 选择卡牌", "en": "4 · Choose cards"},"deck.none":{"zh": "不选盟国", "en": "No ally"},"deck.preset":{"zh": "载入推荐卡组", "en": "Load suggested deck"},"deck.clear":{"zh": "清空卡组", "en": "Clear deck"},"deck.collection":{"zh": "可用卡牌", "en": "Card collection"},"deck.selected":{"zh": "已选卡组", "en": "Your deck"},"deck.search":{"zh": "搜索卡名或技能", "en": "Search name or ability"},"deck.all":{"zh": "全部国家", "en": "All nations"},"deck.rule":{"zh": "39张牌＋1张总部 · 普通4／限定3／特殊2／精英1", "en": "39 cards + 1 HQ · Standard 4 / Limited 3 / Special 2 / Elite 1"},"deck.changeHint":{"zh": "切换国家后可重新组牌，也可载入推荐卡组。", "en": "Choose cards after changing nations, or load a suggested deck."},"deck.ready":{"zh": "卡组已就绪", "en": "Ready to deploy"},"deck.add":{"zh": "加入 {name}", "en": "Add {name}"},"deck.remove":{"zh": "移除 {name}", "en": "Remove {name}"},"deck.empty":{"zh": "尚未加入卡牌。", "en": "No cards selected."},"deck.noResults":{"zh": "没有匹配的卡牌。", "en": "No matching cards."},"deck.mainCount":{"zh": "主国 {main} · 辅国 {ally}", "en": "Main {main} · Ally {ally}"},"deck.ai":{"zh": "对手：{main}{ally} · AI", "en": "Opponent: {main}{ally} · AI"},"deck.rebuild":{"zh": "卡组与阵营", "en": "Deck & nations"},"deck.invalidMain":{"zh": "请选择美国或苏联作为主国。", "en": "Choose USA or USSR as your main nation."},"deck.invalidAlly":{"zh": "辅助国家必须与主国不同。", "en": "Your ally must differ from your main nation."},"deck.invalidCards":{"zh": "卡组数据无效。", "en": "Invalid deck data."},"deck.wrongNation":{"zh": "卡组中有不属于所选国家的卡牌。", "en": "Some cards do not belong to the selected nations."},"deck.fourCopies":{"zh": "按稀有度限制投入：普通4、限定3、特殊2、精英1。", "en": "Copy limits: Standard 4, Limited 3, Special 2, Elite 1."},"deck.tooMany":{"zh": "卡组不能超过39张。", "en": "A deck cannot exceed 39 cards + 1 HQ."},"deck.needForty":{"zh": "请组成完整的39张卡组再开始。", "en": "Complete your 39-card deck to start."},"deck.needMain":{"zh": "至少加入1张主国卡牌。", "en": "Include at least one main-nation card."},"Choose a friendly unit to repair.":{"zh": "选择一个友方单位进行修复。", "en": "Choose a friendly unit to repair."},"Choose a friendly ground unit.":{"zh": "选择一个友方地面单位。", "en": "Choose a friendly ground unit."},"Forward assault: +1 attack this turn.":{"zh": "前沿突击：本回合攻击+1。", "en": "Forward assault: +1 attack this turn."},"Air superiority: +1 attack this turn.":{"zh": "制空协同：本回合攻击+1。", "en": "Air superiority: +1 attack this turn."},"Rapid Redeployment: Blitz and next move costs 0 K this turn.":{"zh": "快速调遣：本回合获得闪击，下次移动为0 K。", "en": "Rapid Redeployment: Blitz and next move costs 0 K this turn."},"Coordinated Assault: +2 attack this turn.":{"zh": "协同攻势：本回合攻击+2。", "en": "Coordinated Assault: +2 attack this turn."},
"Smokescreen":{"zh": "烟幕", "en": "Smokescreen"},"Veteran":{"zh": "老兵", "en": "Veteran"},"Ambush":{"zh": "伏击", "en": "Ambush"},"Heavy Armor":{"zh": "重甲", "en": "Heavy Armor"},"ruleGuide":{"zh": "兵种与关键词", "en": "Unit types & keywords"},"unitTypes":{"zh": "兵种", "en": "Unit types"},"keywords":{"zh": "关键词", "en": "Keywords"},"referenceOnly":{"zh": "规则参考 · 当前卡池暂无", "en": "Reference · Not in the current card pool"},"officialRules":{"zh": "官方规则", "en": "Official rules"},"localRules":{"zh": "本作调整：总部治疗可超过20生命；技能减费最低为0 K。", "en": "Local rules: HQ healing can exceed 20; cost reductions can reach 0 K."},
 "drawEffect":{"zh":"抽 2 张牌。","en":"Draw 2 cards."},
  "设置":{"zh":"设置","en":"Settings"},
  "返回":{"zh":"返回","en":"Back"},
  "语言":{"zh":"语言","en":"Language"},
  "美国": {
    "zh": "美国",
    "en": "United States"
  },
  "United States": {
    "zh": "美国",
    "en": "United States"
  },
  "苏联": {
    "zh": "苏联",
    "en": "Soviet Union"
  },
  "Soviet Union": {
    "zh": "苏联",
    "en": "Soviet Union"
  },
  "华盛顿": {
    "zh": "华盛顿",
    "en": "Washington"
  },
  "Washington": {
    "zh": "华盛顿",
    "en": "Washington"
  },
  "莫斯科": {
    "zh": "莫斯科",
    "en": "Moscow"
  },
  "Moscow": {
    "zh": "莫斯科",
    "en": "Moscow"
  },
  "步兵": {
    "zh": "步兵",
    "en": "Infantry"
  },
  "Infantry": {
    "zh": "步兵",
    "en": "Infantry"
  },
  "坦克": {
    "zh": "坦克",
    "en": "Tank"
  },
  "Tank": {
    "zh": "坦克",
    "en": "Tank"
  },
  "火炮": {
    "zh": "火炮",
    "en": "Artillery"
  },
  "Artillery": {
    "zh": "火炮",
    "en": "Artillery"
  },
  "战斗机": {
    "zh": "战斗机",
    "en": "Fighter"
  },
  "Fighter": {
    "zh": "战斗机",
    "en": "Fighter"
  },
  "轰炸机": {
    "zh": "轰炸机",
    "en": "Bomber"
  },
  "Bomber": {
    "zh": "轰炸机",
    "en": "Bomber"
  },
  "指令": {
    "zh": "指令",
    "en": "Order"
  },
  "Order": {
    "zh": "指令",
    "en": "Order"
  },
  "总部": {
    "zh": "总部",
    "en": "HQ"
  },
  "HQ": {
    "zh": "总部",
    "en": "HQ"
  },
  "守卫": {
    "zh": "守卫",
    "en": "Guard"
  },
  "Guard": {
    "zh": "守卫",
    "en": "Guard"
  },
  "闪击": {
    "zh": "闪击",
    "en": "Blitz"
  },
  "Blitz": {
    "zh": "闪击",
    "en": "Blitz"
  },
  "狂怒": {
    "zh": "狂怒",
    "en": "Fury"
  },
  "Fury": {
    "zh": "狂怒",
    "en": "Fury"
  },
  "技能": {
    "zh": "技能",
    "en": "SKILL"
  },
  "SKILL": {
    "zh": "技能",
    "en": "SKILL"
  },
  "远程": {
    "zh": "远程",
    "en": "Ranged"
  },
  "Ranged": {
    "zh": "远程",
    "en": "Ranged"
  },
  "空军": {
    "zh": "空军",
    "en": "Air unit"
  },
  "Air unit": {
    "zh": "空军",
    "en": "Air unit"
  },
  "主战坦克": {
    "zh": "主战坦克",
    "en": "Main battle tank"
  },
  "Main battle tank": {
    "zh": "主战坦克",
    "en": "Main battle tank"
  },
  "重装突击": {
    "zh": "重装突击",
    "en": "Heavy assault"
  },
  "Heavy assault": {
    "zh": "重装突击",
    "en": "Heavy assault"
  },
  "总部恢复 4": {
    "zh": "总部恢复 4",
    "en": "Restore 4 HQ health"
  },
  "Restore 4 HQ health": {
    "zh": "总部恢复 4",
    "en": "Restore 4 HQ health"
  },
  "抽 2 张牌": {
    "zh": "抽 2 张牌",
    "en": "Draw 2 cards"
  },
  "Draw 2 cards": {
    "zh": "抽 2 张牌",
    "en": "Draw 2 cards"
  },
  "对敌军造成 4": {
    "zh": "对敌军造成 4",
    "en": "Deal 4 to an enemy unit"
  },
  "Deal 4 to an enemy unit": {
    "zh": "对敌军造成 4",
    "en": "Deal 4 to an enemy unit"
  },
  "全军 +1+1": {
    "zh": "全军 +1+1",
    "en": "All allies +1+1"
  },
  "All allies +1+1": {
    "zh": "全军 +1+1",
    "en": "All allies +1+1"
  },
  "友方": {
    "zh": "友方",
    "en": "Friendly"
  },
  "Friendly": {
    "zh": "友方",
    "en": "Friendly"
  },
  "敌方": {
    "zh": "敌方",
    "en": "Enemy"
  },
  "Enemy": {
    "zh": "敌方",
    "en": "Enemy"
  },
  "手牌": {
    "zh": "手牌",
    "en": "Hand"
  },
  "Hand": {
    "zh": "手牌",
    "en": "Hand"
  },
  "前线": {
    "zh": "前线",
    "en": "Frontline"
  },
  "Frontline": {
    "zh": "前线",
    "en": "Frontline"
  },
  "后方": {
    "zh": "后方",
    "en": "Support"
  },
  "Support": {
    "zh": "后方",
    "en": "Support"
  },
  "行动": {
    "zh": "行动",
    "en": "Operation"
  },
  "Operation": {
    "zh": "行动",
    "en": "Operation"
  },
  "攻击": {
    "zh": "攻击",
    "en": "Attack"
  },
  "Attack": {
    "zh": "攻击",
    "en": "Attack"
  },
  "防御": {
    "zh": "防御",
    "en": "Defense"
  },
  "Defense": {
    "zh": "防御",
    "en": "Defense"
  },
  "生命": {
    "zh": "生命",
    "en": "Health"
  },
  "Health": {
    "zh": "生命",
    "en": "Health"
  },
  "精英": {
    "zh": "精英",
    "en": "ELITE"
  },
  "ELITE": {
    "zh": "精英",
    "en": "ELITE"
  },
  "结束回合": {
    "zh": "结束回合",
    "en": "END TURN"
  },
  "END TURN": {
    "zh": "结束回合",
    "en": "END TURN"
  },
  "选择阵营": {
    "zh": "选择阵营",
    "en": "Choose faction"
  },
  "Choose faction": {
    "zh": "选择阵营",
    "en": "Choose faction"
  },
  "行动记录": {
    "zh": "行动记录",
    "en": "Action history"
  },
  "Action history": {
    "zh": "行动记录",
    "en": "Action history"
  },
  "新对局与阵营选择": {
    "zh": "新对局与阵营选择",
    "en": "New match and faction selection"
  },
  "New match and faction selection": {
    "zh": "新对局与阵营选择",
    "en": "New match and faction selection"
  },
  "取消": {
    "zh": "取消",
    "en": "Cancel"
  },
  "Cancel": {
    "zh": "取消",
    "en": "Cancel"
  },
  "再来一局": {
    "zh": "再来一局",
    "en": "Play again"
  },
  "Play again": {
    "zh": "再来一局",
    "en": "Play again"
  },
  "查看记录": {
    "zh": "查看记录",
    "en": "View history"
  },
  "View history": {
    "zh": "查看记录",
    "en": "View history"
  },
  "最新一步": {
    "zh": "最新一步",
    "en": "Latest step"
  },
  "Latest step": {
    "zh": "最新一步",
    "en": "Latest step"
  },
  "返回对局": {
    "zh": "返回对局",
    "en": "Back to match"
  },
  "Back to match": {
    "zh": "返回对局",
    "en": "Back to match"
  },
  "回合 · 阵营": {
    "zh": "回合 · 阵营",
    "en": "Turn · Faction"
  },
  "Turn · Faction": {
    "zh": "回合 · 阵营",
    "en": "Turn · Faction"
  },
  "行动与结果": {
    "zh": "行动与结果",
    "en": "Action and result"
  },
  "Action and result": {
    "zh": "行动与结果",
    "en": "Action and result"
  },
  "消耗": {
    "zh": "消耗",
    "en": "Cost"
  },
  "Cost": {
    "zh": "消耗",
    "en": "Cost"
  },
  "对局开始后，每一步行动都会记录在这里。": {
    "zh": "对局开始后，每一步行动都会记录在这里。",
    "en": "Every action will appear here once the match begins."
  },
  "Every action will appear here once the match begins.": {
    "zh": "对局开始后，每一步行动都会记录在这里。",
    "en": "Every action will appear here once the match begins."
  },
  "行动前后的场面": {
    "zh": "行动前后的场面",
    "en": "Board before and after the action"
  },
  "Board before and after the action": {
    "zh": "行动前后的场面",
    "en": "Board before and after the action"
  },
  "选择你的阵营": {
    "zh": "选择你的阵营",
    "en": "Choose your faction"
  },
  "Choose your faction": {
    "zh": "选择你的阵营",
    "en": "Choose your faction"
  },
  "可选阵营": {
    "zh": "可选阵营",
    "en": "Available factions"
  },
  "Available factions": {
    "zh": "可选阵营",
    "en": "Available factions"
  },
  "双方各 40 张牌": {
    "zh": "双方各 40 张牌",
    "en": "40 cards per side"
  },
  "40 cards per side": {
    "zh": "双方各 40 张牌",
    "en": "40 cards per side"
  },
  "继续当前对局": {
    "zh": "继续当前对局",
    "en": "Resume match"
  },
  "Resume match": {
    "zh": "继续当前对局",
    "en": "Resume match"
  },
  "开始对局": {
    "zh": "开始对局",
    "en": "Start match"
  },
  "Start match": {
    "zh": "开始对局",
    "en": "Start match"
  },
  "开始新对局": {
    "zh": "开始新对局",
    "en": "Start new match"
  },
  "Start new match": {
    "zh": "开始新对局",
    "en": "Start new match"
  },
  "战场": {
    "zh": "战场",
    "en": "Battlefield"
  },
  "Battlefield": {
    "zh": "战场",
    "en": "Battlefield"
  },
  "部署": {
    "zh": "部署",
    "en": "Deploy"
  },
  "Deploy": {
    "zh": "部署",
    "en": "Deploy"
  },
  "推进": {
    "zh": "推进",
    "en": "Advance"
  },
  "Advance": {
    "zh": "推进",
    "en": "Advance"
  },
  "中立": {
    "zh": "中立",
    "en": "NEUTRAL"
  },
  "NEUTRAL": {
    "zh": "中立",
    "en": "NEUTRAL"
  },
  "回合": {
    "zh": "回合",
    "en": "TURN"
  },
  "TURN": {
    "zh": "回合",
    "en": "TURN"
  },
  "牌库": {
    "zh": "牌库",
    "en": "Deck"
  },
  "Deck": {
    "zh": "牌库",
    "en": "Deck"
  },
  "战略胜利": {
    "zh": "战略胜利",
    "en": "STRATEGIC VICTORY"
  },
  "STRATEGIC VICTORY": {
    "zh": "战略胜利",
    "en": "STRATEGIC VICTORY"
  },
  "总部失守": {
    "zh": "总部失守",
    "en": "HEADQUARTERS LOST"
  },
  "HEADQUARTERS LOST": {
    "zh": "总部失守",
    "en": "HEADQUARTERS LOST"
  },
  "同归于尽": {
    "zh": "同归于尽",
    "en": "MUTUAL DESTRUCTION"
  },
  "MUTUAL DESTRUCTION": {
    "zh": "同归于尽",
    "en": "MUTUAL DESTRUCTION"
  },
  "双方总部同时被摧毁。": {
    "zh": "双方总部同时被摧毁。",
    "en": "Both headquarters were destroyed."
  },
  "Both headquarters were destroyed.": {
    "zh": "双方总部同时被摧毁。",
    "en": "Both headquarters were destroyed."
  },
  "刚部署：等待下一回合": {
    "zh": "刚部署：等待下一回合",
    "en": "Newly deployed: wait until next turn"
  },
  "Newly deployed: wait until next turn": {
    "zh": "刚部署：等待下一回合",
    "en": "Newly deployed: wait until next turn"
  },
  "本回合已攻击": {
    "zh": "本回合已攻击",
    "en": "Already attacked this turn"
  },
  "Already attacked this turn": {
    "zh": "本回合已攻击",
    "en": "Already attacked this turn"
  },
  "仍可再次攻击": {
    "zh": "仍可再次攻击",
    "en": "Can attack again"
  },
  "Can attack again": {
    "zh": "仍可再次攻击",
    "en": "Can attack again"
  },
  "已移动，仍可攻击": {
    "zh": "已移动，仍可攻击",
    "en": "Moved; can still attack"
  },
  "Moved; can still attack": {
    "zh": "已移动，仍可攻击",
    "en": "Moved; can still attack"
  },
  "本回合已移动": {
    "zh": "本回合已移动",
    "en": "Already moved this turn"
  },
  "Already moved this turn": {
    "zh": "本回合已移动",
    "en": "Already moved this turn"
  },
  "等待友方回合": {
    "zh": "等待友方回合",
    "en": "Waiting for your side's turn"
  },
  "Waiting for your side's turn": {
    "zh": "等待友方回合",
    "en": "Waiting for your side's turn"
  },
  "可行动": {
    "zh": "可行动",
    "en": "Ready to act"
  },
  "Ready to act": {
    "zh": "可行动",
    "en": "Ready to act"
  },
  "行动点不足": {
    "zh": "行动点不足",
    "en": "Not enough K"
  },
  "Not enough K": {
    "zh": "行动点不足",
    "en": "Not enough K"
  },
  "战斗机掩护：轰炸机不可直接攻击": {
    "zh": "战斗机掩护：轰炸机不可直接攻击",
    "en": "Fighter cover: bombers cannot attack directly"
  },
  "Fighter cover: bombers cannot attack directly": {
    "zh": "战斗机掩护：轰炸机不可直接攻击",
    "en": "Fighter cover: bombers cannot attack directly"
  },
  "行动前": {
    "zh": "行动前",
    "en": "Before"
  },
  "Before": {
    "zh": "行动前",
    "en": "Before"
  },
  "行动后": {
    "zh": "行动后",
    "en": "After"
  },
  "After": {
    "zh": "行动后",
    "en": "After"
  },
  "空": {
    "zh": "空",
    "en": "Empty"
  },
  "Empty": {
    "zh": "空",
    "en": "Empty"
  },
  "平局": {
    "zh": "平局",
    "en": "Draw"
  },
  "Draw": {
    "zh": "平局",
    "en": "Draw"
  },
  "部署完成": {
    "zh": "部署完成",
    "en": "Deployed"
  },
  "Deployed": {
    "zh": "部署完成",
    "en": "Deployed"
  },
  "进入前线": {
    "zh": "进入前线",
    "en": "Entered the frontline"
  },
  "Entered the frontline": {
    "zh": "进入前线",
    "en": "Entered the frontline"
  },
  "回合交接": {
    "zh": "回合交接",
    "en": "Turn passed"
  },
  "Turn passed": {
    "zh": "回合交接",
    "en": "Turn passed"
  },
  "疲劳": {
    "zh": "疲劳",
    "en": "Fatigue"
  },
  "Fatigue": {
    "zh": "疲劳",
    "en": "Fatigue"
  },
  "待命": {
    "zh": "待命",
    "en": "WAIT"
  },
  "WAIT": {
    "zh": "待命",
    "en": "WAIT"
  },
  "已用": {
    "zh": "已用",
    "en": "USED"
  },
  "USED": {
    "zh": "已用",
    "en": "USED"
  },
  "已移动": {
    "zh": "已移动",
    "en": "MOVED"
  },
  "MOVED": {
    "zh": "已移动",
    "en": "MOVED"
  },
  "就绪": {
    "zh": "就绪",
    "en": "READY"
  },
  "READY": {
    "zh": "就绪",
    "en": "READY"
  },
  "额外行动": {
    "zh": "额外行动",
    "en": "EXTRA"
  },
  "EXTRA": {
    "zh": "额外行动",
    "en": "EXTRA"
  },
  "禁止行动": {
    "zh": "禁止行动",
    "en": "LOCKED"
  },
  "LOCKED": {
    "zh": "禁止行动",
    "en": "LOCKED"
  },
  "守卫保护": {
    "zh": "守卫保护",
    "en": "Guard protection"
  },
  "Guard protection": {
    "zh": "守卫保护",
    "en": "Guard protection"
  },
  "战斗机拦截": {
    "zh": "战斗机拦截",
    "en": "Fighter interception"
  },
  "Fighter interception": {
    "zh": "战斗机拦截",
    "en": "Fighter interception"
  },
  "部署到最左侧": {
    "zh": "部署到最左侧",
    "en": "Deploy on the far left"
  },
  "Deploy on the far left": {
    "zh": "部署到最左侧",
    "en": "Deploy on the far left"
  },
  "部署到最右侧": {
    "zh": "部署到最右侧",
    "en": "Deploy on the far right"
  },
  "Deploy on the far right": {
    "zh": "部署到最右侧",
    "en": "Deploy on the far right"
  },
  "无效目标": {
    "zh": "无效目标",
    "en": "Invalid target"
  },
  "Invalid target": {
    "zh": "无效目标",
    "en": "Invalid target"
  },
  "请把这张指令拖到或点击一个敌方单位": {
    "zh": "从手牌拉出箭头，或点击1个敌方单位。",
    "en": "Aim an arrow from your hand, or select an enemy unit."
  },
  "Drag this order onto an enemy unit, or select one.": {
    "zh": "从手牌拉出箭头，或点击1个敌方单位。",
    "en": "Aim an arrow from your hand, or select an enemy unit."
  },
  "请选择高亮的友方单位。": {
    "zh": "请选择高亮的友方单位。",
    "en": "Choose a highlighted friendly unit."
  },
  "Choose a highlighted friendly unit.": {
    "zh": "请选择高亮的友方单位。",
    "en": "Choose a highlighted friendly unit."
  },
  "没有有效的友方目标。": {
    "zh": "没有有效的友方目标。",
    "en": "No valid friendly targets."
  },
  "No valid friendly targets.": {
    "zh": "没有有效的友方目标。",
    "en": "No valid friendly targets."
  },
  "未知阵营": {
    "zh": "未知阵营",
    "en": "Unknown faction"
  },
  "Unknown faction": {
    "zh": "未知阵营",
    "en": "Unknown faction"
  },
  "本局已结束": {
    "zh": "本局已结束",
    "en": "The match has ended."
  },
  "The match has ended.": {
    "zh": "本局已结束",
    "en": "The match has ended."
  },
  "还没有轮到你": {
    "zh": "还没有轮到你",
    "en": "It is not your turn."
  },
  "It is not your turn.": {
    "zh": "还没有轮到你",
    "en": "It is not your turn."
  },
  "单位已不在战场": {
    "zh": "单位已不在战场",
    "en": "The unit is no longer on the board."
  },
  "The unit is no longer on the board.": {
    "zh": "单位已不在战场",
    "en": "The unit is no longer on the board."
  },
  "刚部署的单位需等待下一回合（闪击除外）": {
    "zh": "刚部署的单位需等待下一回合（闪击除外）",
    "en": "Newly deployed units must wait until next turn, unless they have Blitz."
  },
  "Newly deployed units must wait until next turn, unless they have Blitz.": {
    "zh": "刚部署的单位需等待下一回合（闪击除外）",
    "en": "Newly deployed units must wait until next turn, unless they have Blitz."
  },
  "本回合已经行动": {
    "zh": "本回合已经行动",
    "en": "This unit has already acted this turn."
  },
  "This unit has already acted this turn.": {
    "zh": "本回合已经行动",
    "en": "This unit has already acted this turn."
  },
  "目标已不在战场": {
    "zh": "目标已不在战场",
    "en": "The target is no longer on the board."
  },
  "The target is no longer on the board.": {
    "zh": "目标已不在战场",
    "en": "The target is no longer on the board."
  },
  "攻击力为 0，无法攻击": {
    "zh": "攻击力为 0，无法攻击",
    "en": "A unit with 0 attack cannot attack."
  },
  "A unit with 0 attack cannot attack.": {
    "zh": "攻击力为 0，无法攻击",
    "en": "A unit with 0 attack cannot attack."
  },
  "战斗机拦截：必须先攻击或消灭目标阵线上的战斗机": {
    "zh": "战斗机拦截：必须先攻击或消灭目标阵线上的战斗机",
    "en": "Fighter interception: attack or destroy the fighters in the target's line first."
  },
  "Fighter interception: attack or destroy the fighters in the target's line first.": {
    "zh": "战斗机拦截：必须先攻击或消灭目标阵线上的战斗机",
    "en": "Fighter interception: attack or destroy the fighters in the target's line first."
  },
  "目标受到同一阵线相邻守卫的保护": {
    "zh": "目标受到同一阵线相邻守卫的保护",
    "en": "An adjacent Guard in the same line protects this target."
  },
  "An adjacent Guard in the same line protects this target.": {
    "zh": "目标受到同一阵线相邻守卫的保护",
    "en": "An adjacent Guard in the same line protects this target."
  },
  "地面单位需进入前线才能攻击敌方后方；闪击不改变射程": {
    "zh": "地面单位需进入前线才能攻击敌方后方；闪击不改变射程",
    "en": "Ground units must enter the frontline to attack enemy support. Blitz does not change range."
  },
  "Ground units must enter the frontline to attack enemy support. Blitz does not change range.": {
    "zh": "地面单位需进入前线才能攻击敌方后方；闪击不改变射程",
    "en": "Ground units must enter the frontline to attack enemy support. Blitz does not change range."
  },
  "单位已经位于前线": {
    "zh": "单位已经位于前线",
    "en": "This unit is already in the frontline."
  },
  "This unit is already in the frontline.": {
    "zh": "单位已经位于前线",
    "en": "This unit is already in the frontline."
  },
  "空军在后方阵线攻击，无需进入前线": {
    "zh": "空军在后方阵线攻击，无需进入前线",
    "en": "Air units attack from support and do not enter the frontline."
  },
  "Air units attack from support and do not enter the frontline.": {
    "zh": "空军在后方阵线攻击，无需进入前线",
    "en": "Air units attack from support and do not enter the frontline."
  },
  "先消灭敌方前线部队": {
    "zh": "先消灭敌方前线部队",
    "en": "Destroy the enemy frontline units first."
  },
  "Destroy the enemy frontline units first.": {
    "zh": "先消灭敌方前线部队",
    "en": "Destroy the enemy frontline units first."
  },
  "前线已满（最多 5 个单位）": {
    "zh": "前线已满（最多 5 个单位）",
    "en": "The frontline is full (5 units maximum)."
  },
  "The frontline is full (5 units maximum).": {
    "zh": "前线已满（最多 5 个单位）",
    "en": "The frontline is full (5 units maximum)."
  },
  "这张牌已不在手牌中": {
    "zh": "这张牌已不在手牌中",
    "en": "This card is no longer in your hand."
  },
  "This card is no longer in your hand.": {
    "zh": "这张牌已不在手牌中",
    "en": "This card is no longer in your hand."
  },
  "后方阵线已满（总部之外最多 4 个单位）": {
    "zh": "后方阵线已满（总部之外最多 4 个单位）",
    "en": "The support line is full (4 units plus HQ)."
  },
  "The support line is full (4 units plus HQ).": {
    "zh": "后方阵线已满（总部之外最多 4 个单位）",
    "en": "The support line is full (4 units plus HQ)."
  },
  "请选择一个敌方单位；此指令不能攻击总部": {
    "zh": "请选择一个敌方单位；此指令不能攻击总部",
    "en": "Choose an enemy unit. This order cannot target HQ."
  },
  "Choose an enemy unit. This order cannot target HQ.": {
    "zh": "请选择一个敌方单位；此指令不能攻击总部",
    "en": "Choose an enemy unit. This order cannot target HQ."
  },
  "未知操作": {
    "zh": "未知操作",
    "en": "Unknown action."
  },
  "Unknown action.": {
    "zh": "未知操作",
    "en": "Unknown action."
  },
  "集中支援：本单位本回合不能行动。": {
    "zh": "集中支援：本单位本回合不能行动。",
    "en": "Concentrated Support: this unit cannot act this turn."
  },
  "Concentrated Support: this unit cannot act this turn.": {
    "zh": "集中支援：本单位本回合不能行动。",
    "en": "Concentrated Support: this unit cannot act this turn."
  },
  "此单位没有付费攻击技能。": {
    "zh": "此单位没有付费攻击技能。",
    "en": "This unit has no paid attack ability."
  },
  "This unit has no paid attack ability.": {
    "zh": "此单位没有付费攻击技能。",
    "en": "This unit has no paid attack ability."
  },
  "此卡没有付费部署技能。": {
    "zh": "此卡没有付费部署技能。",
    "en": "This card has no paid deployment ability."
  },
  "This card has no paid deployment ability.": {
    "zh": "此卡没有付费部署技能。",
    "en": "This card has no paid deployment ability."
  },
  "没有可抢修的被摧毁非精英坦克。": {
    "zh": "没有可抢修的被摧毁非精英坦克。",
    "en": "No destroyed non-Elite tank to recover."
  },
  "No destroyed non-Elite tank to recover.": {
    "zh": "没有可抢修的被摧毁非精英坦克。",
    "en": "No destroyed non-Elite tank to recover."
  },
  "后方阵线必须有一个空位。": {
    "zh": "后方阵线必须有一个空位。",
    "en": "The support line must have a free unit slot."
  },
  "The support line must have a free unit slot.": {
    "zh": "后方阵线必须有一个空位。",
    "en": "The support line must have a free unit slot."
  },
  "选择的目标过多。": {
    "zh": "选择的目标过多。",
    "en": "Too many targets."
  },
  "Too many targets.": {
    "zh": "选择的目标过多。",
    "en": "Too many targets."
  },
  "选择一个本回合已经攻击过的友方单位。": {
    "zh": "选择一个本回合已经攻击过的友方单位。",
    "en": "Choose a friendly unit that has attacked this turn."
  },
  "Choose a friendly unit that has attacked this turn.": {
    "zh": "选择一个本回合已经攻击过的友方单位。",
    "en": "Choose a friendly unit that has attacked this turn."
  },
  "选择本回合将不能行动的友方单位。": {
    "zh": "选择本回合将不能行动的友方单位。",
    "en": "Choose the friendly unit that will stop acting this turn."
  },
  "Choose the friendly unit that will stop acting this turn.": {
    "zh": "选择本回合将不能行动的友方单位。",
    "en": "Choose the friendly unit that will stop acting this turn."
  },
  "选择另一个友方单位，使其免受反击。": {
    "zh": "选择另一个友方单位，使其免受反击。",
    "en": "Choose a different friendly unit to protect from retaliation."
  },
  "Choose a different friendly unit to protect from retaliation.": {
    "zh": "选择另一个友方单位，使其免受反击。",
    "en": "Choose a different friendly unit to protect from retaliation."
  },
  "选择一个撤回后方的友方前线单位。": {
    "zh": "选择一个撤回后方的友方前线单位。",
    "en": "Choose a friendly frontline unit to withdraw."
  },
  "Choose a friendly frontline unit to withdraw.": {
    "zh": "选择一个撤回后方的友方前线单位。",
    "en": "Choose a friendly frontline unit to withdraw."
  },
  "选择另一个友方地面单位，使其获得闪击和一次免费移动。": {
    "zh": "选择另一个友方地面单位，使其获得闪击和一次免费移动。",
    "en": "Choose another friendly ground unit for Blitz and a free move."
  },
  "Choose another friendly ground unit for Blitz and a free move.": {
    "zh": "选择另一个友方地面单位，使其获得闪击和一次免费移动。",
    "en": "Choose another friendly ground unit for Blitz and a free move."
  },
  "选择一个部署费用至少为 6 K 的友方单位。": {
    "zh": "选择一个部署费用至少为 6 K 的友方单位。",
    "en": "Choose a friendly unit costing 6 K or more."
  },
  "Choose a friendly unit costing 6 K or more.": {
    "zh": "选择一个部署费用至少为 6 K 的友方单位。",
    "en": "Choose a friendly unit costing 6 K or more."
  },
  "本回合不能行动": {
    "zh": "本回合不能行动",
    "en": "Cannot act this turn"
  },
  "Cannot act this turn": {
    "zh": "本回合不能行动",
    "en": "Cannot act this turn"
  },
  "下次攻击不受反击": {
    "zh": "下次攻击不受反击",
    "en": "No retaliation on next attack"
  },
  "No retaliation on next attack": {
    "zh": "下次攻击不受反击",
    "en": "No retaliation on next attack"
  },
  "下次行动：0 K": {
    "zh": "下次行动：0 K",
    "en": "Next action: 0 K"
  },
  "Next action: 0 K": {
    "zh": "下次行动：0 K",
    "en": "Next action: 0 K"
  },
  "下次移动：0 K": {
    "zh": "下次移动：0 K",
    "en": "Next move: 0 K"
  },
  "Next move: 0 K": {
    "zh": "下次移动：0 K",
    "en": "Next move: 0 K"
  },
  "最高统帅部：本回合消灭单位时抽牌": {
    "zh": "最高统帅部：本回合消灭单位时抽牌",
    "en": "Stavka: draw on kill this turn"
  },
  "Stavka: draw on kill this turn": {
    "zh": "最高统帅部：本回合消灭单位时抽牌",
    "en": "Stavka: draw on kill this turn"
  },
  "本回合获得闪击": {
    "zh": "本回合获得闪击",
    "en": "Blitz this turn"
  },
  "Blitz this turn": {
    "zh": "本回合获得闪击",
    "en": "Blitz this turn"
  },
  "预备反击：下次攻击 +2。": {
    "zh": "预备反击：下次攻击 +2。",
    "en": "Prepared response: next attack +2."
  },
  "Prepared response: next attack +2.": {
    "zh": "预备反击：下次攻击 +2。",
    "en": "Prepared response: next attack +2."
  },
  "塔曼支援：本回合攻击 +1。": {
    "zh": "塔曼支援：本回合攻击 +1。",
    "en": "Taman support: +1 attack this turn."
  },
  "Taman support: +1 attack this turn.": {
    "zh": "塔曼支援：本回合攻击 +1。",
    "en": "Taman support: +1 attack this turn."
  },
  "前线增援：+0+2。": {
    "zh": "前线增援：+0+2。",
    "en": "Frontline reinforcement: +0+2."
  },
  "Frontline reinforcement: +0+2.": {
    "zh": "前线增援：+0+2。",
    "en": "Frontline reinforcement: +0+2."
  },
  "侦察：本回合获得+1行动花费。": {
    "zh": "侦察：本回合获得+1行动花费。",
    "en": "Reconnaissance: operations +1 this turn."
  },
  "Reconnaissance: operations +1 this turn.": {
    "zh": "侦察：本回合获得+1行动花费。",
    "en": "Reconnaissance: operations +1 this turn."
  },
  "反攻：获得闪击。": {
    "zh": "反攻：获得闪击。",
    "en": "Counteroffensive: gained Blitz."
  },
  "Counteroffensive: gained Blitz.": {
    "zh": "反攻：获得闪击。",
    "en": "Counteroffensive: gained Blitz."
  },
  "本回合获得狂怒（额外支付 2 K）。": {
    "zh": "本回合获得狂怒（额外支付 2 K）。",
    "en": "Fury this turn (+2 K)."
  },
  "Fury this turn (+2 K).": {
    "zh": "本回合获得狂怒（额外支付 2 K）。",
    "en": "Fury this turn (+2 K)."
  },
  "预备弹药：本回合增加一次额外行动；额外获得+1行动花费。": {
    "zh": "预备弹药：本回合增加一次额外行动；额外获得+1行动花费。",
    "en": "Reserve Ammunition: one extra action this turn; extra action costs +1 K."
  },
  "Reserve Ammunition: one extra action this turn; extra action costs +1 K.": {
    "zh": "预备弹药：本回合增加一次额外行动；额外获得+1行动花费。",
    "en": "Reserve Ammunition: one extra action this turn; extra action costs +1 K."
  },
  "集中支援：本回合不能行动。": {
    "zh": "集中支援：本回合不能行动。",
    "en": "Concentrated Support: cannot act this turn."
  },
  "Concentrated Support: cannot act this turn.": {
    "zh": "集中支援：本回合不能行动。",
    "en": "Concentrated Support: cannot act this turn."
  },
  "集中支援：下次攻击不受反击。": {
    "zh": "集中支援：下次攻击不受反击。",
    "en": "Concentrated Support: no retaliation on next attack."
  },
  "Concentrated Support: no retaliation on next attack.": {
    "zh": "集中支援：下次攻击不受反击。",
    "en": "Concentrated Support: no retaliation on next attack."
  },
  "第二梯队：本回合获得闪击，下次移动费用为 0 K。": {
    "zh": "第二梯队：本回合获得闪击，下次移动费用为 0 K。",
    "en": "Second Echelon: Blitz and next move costs 0 K this turn."
  },
  "Second Echelon: Blitz and next move costs 0 K this turn.": {
    "zh": "第二梯队：本回合获得闪击，下次移动费用为 0 K。",
    "en": "Second Echelon: Blitz and next move costs 0 K this turn."
  },
  "最高统帅部：下次行动费用为 0 K；本回合每消灭一个单位抽1张牌。": {
    "zh": "最高统帅部：下次行动费用为 0 K；本回合每消灭一个单位抽1张牌。",
    "en": "Stavka: next action costs 0 K; draw a card on each kill this turn."
  },
  "Stavka: next action costs 0 K; draw a card on each kill this turn.": {
    "zh": "最高统帅部：下次行动费用为 0 K；本回合每消灭一个单位抽1张牌。",
    "en": "Stavka: next action costs 0 K; draw a card on each kill this turn."
  },
  "火力全开：本次攻击 +2（额外支付 1 K）。": {
    "zh": "火力全开：本次攻击 +2（额外支付 1 K）。",
    "en": "Full Firepower: +2 attack for this attack (+1 K)."
  },
  "Full Firepower: +2 attack for this attack (+1 K).": {
    "zh": "火力全开：本次攻击 +2（额外支付 1 K）。",
    "en": "Full Firepower: +2 attack for this attack (+1 K)."
  },
  "火力全开": {
    "zh": "火力全开",
    "en": "Full Firepower"
  },
  "Full Firepower": {
    "zh": "火力全开",
    "en": "Full Firepower"
  },
  "火力全开：额外支付 1 K，本次攻击 +2。": {
    "zh": "火力全开：额外支付 1 K，本次攻击 +2。",
    "en": "Full Firepower: pay 1 extra K for +2 attack on this attack."
  },
  "Full Firepower: pay 1 extra K for +2 attack on this attack.": {
    "zh": "火力全开：额外支付 1 K，本次攻击 +2。",
    "en": "Full Firepower: pay 1 extra K for +2 attack on this attack."
  },
  "无额外效果。": {
    "zh": "无额外效果。",
    "en": "No additional effect."
  },
  "No additional effect.": {
    "zh": "无额外效果。",
    "en": "No additional effect."
  },
  "守卫：保护同一阵线中相邻的友方单位或总部；火炮和轰炸机无视守卫。": {
    "zh": "守卫：保护同一阵线中相邻的友方单位或总部；火炮和轰炸机无视守卫。",
    "en": "Guard: protects adjacent friendly units or HQ in the same line. Artillery and bombers ignore Guard."
  },
  "Guard: protects adjacent friendly units or HQ in the same line. Artillery and bombers ignore Guard.": {
    "zh": "守卫：保护同一阵线中相邻的友方单位或总部；火炮和轰炸机无视守卫。",
    "en": "Guard: protects adjacent friendly units or HQ in the same line. Artillery and bombers ignore Guard."
  },
  "闪击：部署当回合即可移动或攻击，但仍须支付行动费并遵守射程。坦克闪击可先移动再攻击。": {
    "zh": "闪击：部署当回合即可移动或攻击，但仍须支付行动费并遵守射程。坦克闪击可先移动再攻击。",
    "en": "Blitz: may move or attack on the deployment turn. Operation costs and range still apply. Tanks may move then attack."
  },
  "Blitz: may move or attack on the deployment turn. Operation costs and range still apply. Tanks may move then attack.": {
    "zh": "闪击：部署当回合即可移动或攻击，但仍须支付行动费并遵守射程。坦克闪击可先移动再攻击。",
    "en": "Blitz: may move or attack on the deployment turn. Operation costs and range still apply. Tanks may move then attack."
  },
  "火炮：可从后方跨越前线攻击任意敌方单位或总部；攻击时不会受到反击。": {
    "zh": "火炮：可从后方跨越前线攻击任意敌方单位或总部；攻击时不会受到反击。",
    "en": "Artillery: can attack units or HQ in any line, ignores Guard, and takes no retaliation when attacking."
  },
  "Artillery: can attack units or HQ in any line, ignores Guard, and takes no retaliation when attacking.": {
    "zh": "火炮：可从后方跨越前线攻击任意敌方单位或总部；攻击时不会受到反击。",
    "en": "Artillery: can attack units or HQ in any line, ignores Guard, and takes no retaliation when attacking."
  },
  "战斗机：可攻击任意阵线；拦截轰炸机对同一阵线其他友军或总部的攻击。不能无视守卫，也不能获得烟幕。": {
    "zh": "战斗机：可攻击任意阵线；拦截轰炸机对同一阵线其他友军或总部的攻击。不能无视守卫，也不能获得烟幕。",
    "en": "Fighter: can attack any line. Intercepts bombers targeting other allies or HQ in the same line. Does not ignore Guard and cannot gain Smokescreen."
  },
  "Fighter: can attack any line. Intercepts bombers targeting other allies or HQ in the same line. Does not ignore Guard and cannot gain Smokescreen.": {
    "zh": "战斗机：可攻击任意阵线；拦截轰炸机对同一阵线其他友军或总部的攻击。不能无视守卫，也不能获得烟幕。",
    "en": "Fighter: can attack any line. Intercepts bombers targeting other allies or HQ in the same line. Does not ignore Guard and cannot gain Smokescreen."
  },
  "轰炸机：可攻击任意阵线并无视守卫；攻击非战斗机时不受反击。被攻击时不造成反击伤害。同一目标阵线上的战斗机会拦截。": {
    "zh": "轰炸机：可攻击任意阵线并无视守卫；攻击非战斗机时不受反击。被攻击时不造成反击伤害。同一目标阵线上的战斗机会拦截。",
    "en": "Bomber: can attack any line and ignores Guard. Only fighters retaliate against its attacks. Does not retaliate when attacked. Fighters in the target line intercept it."
  },
  "Bomber: can attack any line and ignores Guard. Only fighters retaliate against its attacks. Does not retaliate when attacked. Fighters in the target line intercept it.": {
    "zh": "轰炸机：可攻击任意阵线并无视守卫；攻击非战斗机时不受反击。被攻击时不造成反击伤害。同一目标阵线上的战斗机会拦截。",
    "en": "Bomber: can attack any line and ignores Guard. Only fighters retaliate against its attacks. Does not retaliate when attacked. Fighters in the target line intercept it."
  },
  "总部：生命降至 0 时战败；可受到同阵线相邻守卫及战斗机的保护。": {
    "zh": "总部：生命降至 0 时战败；可受到同阵线相邻守卫及战斗机的保护。",
    "en": "HQ: you lose when its health reaches 0. Adjacent Guards and fighters in the same line can protect it."
  },
  "HQ: you lose when its health reaches 0. Adjacent Guards and fighters in the same line can protect it.": {
    "zh": "总部：生命降至 0 时战败；可受到同阵线相邻守卫及战斗机的保护。",
    "en": "HQ: you lose when its health reaches 0. Adjacent Guards and fighters in the same line can protect it."
  },
  "步兵：只能攻击相邻阵线；从后方攻击敌方前线，进入前线后可攻击敌方后方。每回合移动或攻击一次。": {
    "zh": "步兵：只能攻击相邻阵线；从后方攻击敌方前线，进入前线后可攻击敌方后方。每回合移动或攻击一次。",
    "en": "Infantry: attacks only an adjacent line. Attack the enemy frontline from support, or enemy support from the frontline. May move or attack once per turn."
  },
  "Infantry: attacks only an adjacent line. Attack the enemy frontline from support, or enemy support from the frontline. May move or attack once per turn.": {
    "zh": "步兵：只能攻击相邻阵线；从后方攻击敌方前线，进入前线后可攻击敌方后方。每回合移动或攻击一次。",
    "en": "Infantry: attacks only an adjacent line. Attack the enemy frontline from support, or enemy support from the frontline. May move or attack once per turn."
  },
  "坦克：攻击相邻阵线；同一回合可先移动到前线再攻击，每次行动分别支付行动费。": {
    "zh": "坦克：攻击相邻阵线；同一回合可先移动到前线再攻击，每次行动分别支付行动费。",
    "en": "Tank: attacks an adjacent line. May move to the frontline then attack in the same turn, paying separately for each action."
  },
  "Tank: attacks an adjacent line. May move to the frontline then attack in the same turn, paying separately for each action.": {
    "zh": "坦克：攻击相邻阵线；同一回合可先移动到前线再攻击，每次行动分别支付行动费。",
    "en": "Tank: attacks an adjacent line. May move to the frontline then attack in the same turn, paying separately for each action."
  },
  "healEffect": {
    "zh": "效果：友方总部恢复 4 点生命。",
    "en": "Restore 4 health to your HQ."
  },
  "Restore 4 health to your HQ.": {
    "zh": "效果：友方总部恢复 4 点生命。",
    "en": "Restore 4 health to your HQ."
  },
  "效果：抽 2 张牌；手牌上限为 9。": {
    "zh": "效果：抽 2 张牌；手牌上限为 9。",
    "en": "Draw 2 cards. The hand limit is 9."
  },
  "Draw 2 cards. The hand limit is 9.": {
    "zh": "效果：抽 2 张牌；手牌上限为 9。",
    "en": "Draw 2 cards. The hand limit is 9."
  },
  "效果：选择一个敌方单位并造成 4 点伤害。": {
    "zh": "效果：选择一个敌方单位并造成 4 点伤害。",
    "en": "Choose an enemy unit and deal 4 damage to it."
  },
  "Choose an enemy unit and deal 4 damage to it.": {
    "zh": "效果：选择一个敌方单位并造成 4 点伤害。",
    "en": "Choose an enemy unit and deal 4 damage to it."
  },
  "效果：所有友方单位获得 +1 攻击和 +1 防御。": {
    "zh": "效果：所有友方单位获得 +1 攻击和 +1 防御。",
    "en": "All friendly units gain +1 attack and +1 defense."
  },
  "All friendly units gain +1 attack and +1 defense.": {
    "zh": "效果：所有友方单位获得 +1 攻击和 +1 防御。",
    "en": "All friendly units gain +1 attack and +1 defense."
  },
  "turn": {
    "zh": "{side} · 第 {n} 回合",
    "en": "{side} · TURN {n}"
  },
  "decks": {
    "zh": "牌库 {own} / {total} · 敌方 {enemy} / {enemyTotal}",
    "en": "Deck {own} / {total} · Enemy {enemy} / {enemyTotal}"
  },
  "hqName": {
    "zh": "{city}总部",
    "en": "{city} HQ"
  },
  "hqLost": {
    "zh": "{city}总部被摧毁。",
    "en": "{city} HQ was destroyed."
  },
  "hiddenHand": {
    "zh": "{side}手牌（未公开）",
    "en": "{side} hand (hidden)"
  },
  "yourHand": {
    "zh": "{side} · 你的手牌",
    "en": "{side} · Your hand"
  },
  "inspect": {
    "zh": "{side} {name}，查看卡牌详情",
    "en": "{side} {name}, view card details"
  },
  "guardedBy": {
    "zh": "守卫保护：{names}",
    "en": "Protected by Guard: {names}"
  },
  "gap": {
    "zh": "部署到 {left} 与 {right} 之间",
    "en": "Deploy between {left} and {right}"
  },
  "boostDeploy": {
    "zh": "额外支付 2 K，本回合获得狂怒。支付后剩余 {n} K；每次移动或攻击仍需 3 K。",
    "en": "Pay 2 extra K for Fury this turn. This leaves {n} K. Each move or attack still costs 3 K."
  },
  "step": {
    "zh": "第 {n} 步 · {summary}",
    "en": "Step {n} · {summary}"
  },
  "heal": {
    "zh": "{name} 恢复 {n}",
    "en": "{name} restored {n}"
  },
  "destroy": {
    "zh": "{name} 被摧毁",
    "en": "{name} destroyed"
  },
  "burn": {
    "zh": "{side}手牌已满，弃置抽到的牌",
    "en": "{side}: hand full; drawn card discarded"
  },
  "draw": {
    "zh": "{side}抽 {n} 张",
    "en": "{side} drew {n}"
  },
  "buff": {
    "zh": "{side} {n} 个单位 +{amount}+{amount}",
    "en": "{side}: {n} units gained +{amount}+{amount}"
  },
  "recover": {
    "zh": "抢修 {name} · 部署费用 {n} K",
    "en": "Recovered {name} · Deployment {n} K"
  },
  "retreat": {
    "zh": "{name} 撤回后方",
    "en": "{name} withdrew to support"
  },
  "win": {
    "zh": "{side}获胜",
    "en": "{side} wins"
  },
  "counts": {
    "zh": "手牌 {hand} · 牌库 {deck}",
    "en": "Hand {hand} · Deck {deck}"
  },
  "operationCost": {
    "zh": "行动需要 {cost} K，当前仅剩 {available} K",
    "en": "Operation costs {cost} K; only {available} K available."
  },
  "deploymentCost": {
    "zh": "部署需要 {cost} K，当前仅剩 {available} K",
    "en": "Deployment costs {cost} K; only {available} K available."
  },
  "extraActions": {
    "zh": "额外行动：{n}",
    "en": "Extra actions: {n}"
  },
  "tempAttack": {
    "zh": "本回合攻击 +{n}",
    "en": "Attack +{n} this turn"
  },
  "nextAttack": {
    "zh": "下次攻击 +{n}",
    "en": "Next attack +{n}"
  },
  "opBonus": {
    "zh": "本回合获得+{n}行动花费",
    "en": "Gain +{n} operation cost this turn"
  },
  "战斗机 · 拦截": {
    "zh": "战斗机 · 拦截",
    "en": "Fighter · Interception"
  },
  "Fighter · Interception": {
    "zh": "战斗机 · 拦截",
    "en": "Fighter · Interception"
  },
  "轰炸机 · 战略打击": {
    "zh": "轰炸机 · 战略打击",
    "en": "Bomber · Strategic strike"
  },
  "Bomber · Strategic strike": {
    "zh": "轰炸机 · 战略打击",
    "en": "Bomber · Strategic strike"
  },
  "可攻击任意阵线。拦截敌方轰炸机对同一阵线其他友军的攻击。": {
    "zh": "可攻击任意阵线。拦截敌方轰炸机对同一阵线其他友军的攻击。",
    "en": "Can attack any line. Intercepts bombers attacking other allies in the same line."
  },
  "Can attack any line. Intercepts bombers attacking other allies in the same line.": {
    "zh": "可攻击任意阵线。拦截敌方轰炸机对同一阵线其他友军的攻击。",
    "en": "Can attack any line. Intercepts bombers attacking other allies in the same line."
  },
  "可攻击任意阵线并无视守卫；仅战斗机会对其攻击造成反击。被攻击时不造成反击伤害。": {
    "zh": "可攻击任意阵线并无视守卫；仅战斗机会对其攻击造成反击。被攻击时不造成反击伤害。",
    "en": "Can attack any line and ignores Guard. Only fighters retaliate against its attacks. Does not retaliate when attacked."
  },
  "Can attack any line and ignores Guard. Only fighters retaliate against its attacks. Does not retaliate when attacked.": {
    "zh": "可攻击任意阵线并无视守卫；仅战斗机会对其攻击造成反击。被攻击时不造成反击伤害。",
    "en": "Can attack any line and ignores Guard. Only fighters retaliate against its attacks. Does not retaliate when attacked."
  }
};
Object.assign(messages,{
 'Choose an infantry unit to retreat.':{zh:'选择1个步兵单位撤退。',en:'Choose an infantry unit to retreat.'},
 'search.confirm':{zh:'确认选择',en:'Confirm selection'},
 'search.selection':{zh:'已选{n}/{max}个陆军 · 再次点击可取消选择',en:'{n}/{max} ground units selected · Click again to deselect'},
 'Choose a ground unit from your hand.':{zh:'选择手中的1个陆军单位。',en:'Choose a ground unit from your hand.'},
 'Operations cost 0 this turn.':{zh:'本回合行动花费为0。',en:'Operations cost 0 this turn.'},
 'effects':{zh:'效果与触发',en:'Effects & triggers'},
 'ruleGuide':{zh:'兵种与卡牌规则',en:'Unit types & card rules'},
 'terminal.subtitle':{zh:'战略指挥部',en:'Strategic command'},
 'terminal.enemyLine':{zh:'01 / 敌方支援阵线',en:'01 / Enemy support line'},
 'terminal.ownLine':{zh:'03 / 友方支援阵线',en:'03 / Friendly support line'},
 'deck.allyLimit':{zh:'盟国卡牌最多12张。',en:'Include at most 12 ally cards.'},
 'Choose a unit to retreat.':{zh:'选择1个单位撤退。',en:'Choose a unit to retreat.'},
 'Choose an enemy unit to gain +2 operation cost.':{zh:'选择1个敌方单位，使其获得+2行动花费。',en:'Choose an enemy unit to gain +2 operation cost.'},
 'Choose an enemy ground unit.':{zh:'选择1个敌方陆军单位。',en:'Choose an enemy ground unit.'},
 'Attack equals defense.':{zh:'攻击力等同于防御力。',en:'Attack equals defense.'},
 'Gain +2 operation cost.':{zh:'获得+2行动花费。',en:'Gain +2 operation cost.'},
 'Gained Smokescreen.':{zh:'获得烟幕。',en:'Gained Smokescreen.'},
 'deck.rule':{zh:'39张牌＋1张总部 · 盟国最多12张 · 普通4／限定3／特殊2／精英1',en:'39 cards + 1 HQ · Up to 12 ally cards · Standard 4 / Limited 3 / Special 2 / Elite 1'},
 'deck.mainCount':{zh:'主国 {main} · 辅国 {ally}',en:'Main {main} · Ally {ally}'},
 'deck.tooMany':{zh:'最多选择39张牌＋1张总部。',en:'Choose at most 39 cards + 1 HQ.'},
 'deck.needComplete':{zh:'请选满39张牌＋1张总部再开始对局。',en:'Choose 39 cards + 1 HQ to start a match.'},
});
const cards={
  "US MARINES": {
    "n": "美国海军陆战队"
  },
  "101ST AIRBORNE": {
    "n": "第101空降师"
  },
  "M48 PATTON": {
    "n": "M48“巴顿”"
  },
  "M60 PATTON": {
    "n": "M60“巴顿”"
  },
  "M109 SPG": {
    "n": "M109自行榴弹炮"
  },
  "F-86 SABRE": {
    "n": "F-86“佩刀”"
  },
  "F-4 PHANTOM": {
    "n": "F-4“鬼怪”"
  },
  "B-52": {
    "n": "B-52轰炸机"
  },
  "MARSHALL PLAN": {
    "n": "马歇尔计划"
  },
  "CIA OPERATION": {
    "n": "中央情报局行动"
  },
  "AIR STRIKE": {
    "n": "空袭"
  },
  "NATO REINFORCEMENT": {
    "n": "北约增援"
  },
  "MOTOR RIFLES": {
    "n": "摩托化步兵"
  },
  "VDV AIRBORNE": {
    "n": "苏联空降兵"
  },
  "T-54": {
    "n": "T-54"
  },
  "T-62": {
    "n": "T-62",
    "text": "攻击坦克时，本次攻击获得+2攻击。若消灭攻击目标，本单位恢复1点防御。"
  },
  "2S1 SPG": {
    "n": "2S1自行榴弹炮"
  },
  "MIG-15": {
    "n": "米格-15"
  },
  "MIG-21": {
    "n": "米格-21"
  },
  "TU-95": {
    "n": "图-95"
  },
  "PACT AID": {
    "n": "华约援助"
  },
  "KGB OPERATION": {
    "n": "克格勃行动"
  },
  "MISSILE STRIKE": {
    "n": "导弹打击"
  },
  "DEEP BATTLE": {
    "n": "大纵深作战"
  },
  "PT-76 Amphibious Recon Tank": {
    "n": "PT-76两栖侦察坦克",
    "text": "每次进入前线时，抽1张牌，随后本单位本回合获得+1行动花费。"
  },
  "T-54A": {
    "n": "T-54A",
    "text": "攻击时可额外支付1 K，使本次攻击获得+2攻击。"
  },
  "T-72 Ural": {
    "n": "T-72“乌拉尔”",
    "text": "若本回合尚未移动，本回合第一次攻击获得-1行动花费。"
  },
  "T-80U": {
    "n": "T-80U",
    "text": "部署：可额外支付2 K，本回合获得狂怒。"
  },
  "Reserve Ammunition": {
    "n": "预备弹药",
    "text": "选择一个本回合已经攻击过的友方单位。它本回合可额外行动1次；该次额外获得+1行动花费。"
  },
  "Battlefield Recovery": {
    "n": "战场抢修",
    "text": "将本局最近被摧毁的一辆非精英友方坦克的复制加入手牌；部署费用+1。战斗损伤和增益不会被复制。"
  },
  "Concentrated Support": {
    "n": "集中支援",
    "text": "选择两个不同的友方单位。第一个本回合不能行动；第二个下一次攻击时不会受到反击伤害。"
  },
  "Second Echelon": {
    "n": "第二梯队",
    "text": "将一个友方前线单位撤回后方阵线。另一个友方地面单位本回合获得闪击，且本回合下一次移动费用为0 K。"
  },
  "Stavka Directive": {
    "n": "最高统帅部指令",
    "text": "选择一个部署费用至少6 K的友方单位，将其恢复至满防御。它本回合下一次行动费用为0 K；本回合每消灭一个敌方单位，抽1张牌。"
  },
  "BM-21 Grad": {
    "n": "BM-21“冰雹”",
    "text": "攻击前线单位时，对与目标相邻的每个敌方单位各造成1点伤害。"
  },
  "2S7 Pion": {
    "n": "2S7“芍药”"
  }
};
const engine=typeof module!=='undefined'&&module.exports?require('./engine.js'):globalThis.LongTelegram;
for(const nation of ['p','france','drv'])for(const c of engine.LIB[nation])cards[c.n]={n:c.zh,text:c.zhText||''};
for(const c of engine.LIB.soviet)if(c.zh)cards[c.n]={n:c.zh,text:c.zhText||''};
for(const c of Object.values(engine.GENERATED_CARDS))cards[c.n]={n:c.zh,text:c.zhText||''};
Object.assign(messages,{
 'Deployment':{zh:'部署',en:'Deployment'},'Destruction':{zh:'亡计',en:'Destruction'},'Retreat':{zh:'撤退',en:'Retreat'},
 'Choose an option.':{zh:'请选择1项效果。',en:'Choose an option.'},
 'choice.draw':{zh:'抽3张牌',en:'Draw 3 cards'},'choice.kredits':{zh:'下个友方回合开始时，获得3个指挥点',en:'Gain 3 Kredits at the start of your next turn'},
 'Choose an enemy unit.':{zh:'选择1个敌方单位。',en:'Choose an enemy unit.'},'Choose an enemy support-line target.':{zh:'选择敌方支援阵线的1个目标。',en:'Choose an enemy support-line target.'},
 'Gained Shock.':{zh:'获得冲击。',en:'Gained Shock.'},'Lost 1 Heavy Armor.':{zh:'获得-1重甲。',en:'Lost 1 Heavy Armor.'},
 'Ground units have -2 attack this turn.':{zh:'本回合，所有陆军单位具有-2攻击力。',en:'Ground units have -2 attack this turn.'},'Gain 2 Kredits at the start of your next turn.':{zh:'下个友方回合开始时，获得2个指挥点。',en:'Gain 2 Kredits at the start of your next turn.'},
 'gainedKredits':{zh:'{side}获得{n}个指挥点。',en:'{side} gained {n} Kredits.'},'discardedCard':{zh:'{side}弃掉“{name}”。',en:'{side} discarded {name}.'},
 'Pin':{zh:'压制',en:'Pin'},'Pinned.':{zh:'已被压制。',en:'Pinned.'},'Pinned units cannot move or attack.':{zh:'被压制的单位无法移动或攻击。',en:'Pinned units cannot move or attack.'},
 'Shock':{zh:'冲击',en:'Shock'},'Suppress':{zh:'抑制',en:'Suppress'},'Suppressed.':{zh:'已被抑制。',en:'Suppressed.'},'Guard protection':{zh:'守卫保护',en:'Guard protection'},
 'Smokescreen: this unit cannot be attacked until it moves or attacks.':{zh:'烟幕：本单位移动或攻击前，不能成为攻击目标。',en:'Smokescreen: this unit cannot be attacked until it moves or attacks.'},
 'standard':{zh:'普通',en:'Standard'},'limited':{zh:'限定',en:'Limited'},'special':{zh:'特殊',en:'Special'},'elite':{zh:'精英',en:'Elite'},
 'deck.rarityLimit':{zh:'单卡投入上限：普通4、限定3、特殊2、精英1。数量须为非负整数。',en:'Copy limits: Standard 4, Limited 3, Special 2, Elite 1. Use non-negative whole counts.'},
 'deck.rule':{zh:'39张牌＋1张总部 · 盟国最多12张 · 普通4／限定3／特殊2／精英1',en:'39 cards + 1 HQ · Up to 12 ally cards · Standard 4 / Limited 3 / Special 2 / Elite 1'},
 'deck.copyCap':{zh:'{rarity} · 最多{n}张',en:'{rarity} · Max {n} copies'},
 'deck.insufficientPool':{zh:'该国家可用卡牌不足以组成完整卡组。',en:'This nation has insufficient legal cards for a complete deck.'},
 'Choose a friendly unit.':{zh:'选择1个友方单位。',en:'Choose a friendly unit.'},
 'Destruction: draw a tank.':{zh:'亡计：从卡组抽1张坦克牌。',en:'Destruction: draw a tank.'},
 'Destruction: destroy the killer.':{zh:'亡计：消灭摧毁本单位的单位。',en:'Destruction: destroy the killer.'},
 'Choose a friendly frontline unit to retreat.':{zh:'选择前线1个友方单位撤退。',en:'Choose a friendly frontline unit to retreat.'},
 'Choose a friendly ground unit to gain +1 attack.':{zh:'选择1个友方陆军获得+1攻击力，可重复选择。',en:'Choose a friendly ground unit to gain +1 attack. You may choose the same unit again.'},
 'Attack +1.':{zh:'攻击力+1。',en:'Attack +1.'},
 'kreditSlots':{zh:'{side}失去{n}个指挥点槽。',en:'{side} lost {n} Kredit slots.'},
 'Choose a friendly infantry unit.':{zh:'选择1个友方步兵。',en:'Choose a friendly infantry unit.'},
 'Choose an enemy target.':{zh:'选择1个敌方目标。',en:'Choose an enemy target.'},
 'Choose a highlighted target.':{zh:'请选择高亮的目标。',en:'Choose a highlighted target.'},
 'No valid targets.':{zh:'没有符合条件的目标。',en:'No valid targets.'},
 'Gain -1 operation cost this turn.':{zh:'本回合获得-1行动花费。',en:'Gain -1 operation cost this turn.'},
 'Gain -1 operation cost.':{zh:'获得-1行动花费。',en:'Gain -1 operation cost.'},
 'spawn':{zh:'{side}将{name}加入支援阵线。',en:'{side} added {name} to the support line.'},
 'generate':{zh:'{side}获得了{name}。',en:'{side} added {name} to hand.'}
});
const glossary=[
  {
    "id": "infantry",
    "group": "unitTypes",
    "title": "步兵",
    "zh": "只能攻击相邻阵线：后方可打敌方前线，前线可打敌方后方。通常每回合移动或攻击一次；额外行动依卡牌技能。",
    "en": "Attacks an adjacent line: from support into the enemy frontline, or from the frontline into enemy support. Normally moves or attacks once per turn; card abilities may grant extra actions.",
    "source": "https://support.kards.com/hc/en-us/articles/360026757171-Battlefield-elements-The-Support-Line",
    "reference": false
  },
  {
    "id": "tank",
    "group": "unitTypes",
    "title": "坦克",
    "zh": "攻击相邻阵线。同回合可先移动再攻击，两次分别支付行动费。普通部署当回合仍需等待，除非有闪击。",
    "en": "Attacks an adjacent line. Can move and then attack in one turn, paying for each action. Normally waits on its deployment turn unless it has Blitz.",
    "source": "https://support.kards.com/hc/en-us/articles/360026414011-Unit-ability-Blitz",
    "reference": false
  },
  {
    "id": "artillery",
    "group": "unitTypes",
    "title": "火炮",
    "zh": "可攻击任意阵线的单位或总部，无视守卫；主动攻击时不受反击。仍可移入前线，移动通常会用掉本回合行动。",
    "en": "Can attack units or HQ in any line, bypasses Guard, and takes no retaliation when attacking. Can enter the frontline; moving normally uses its action for the turn.",
    "source": "https://support.kards.com/hc/en-us/articles/360026757171-Battlefield-elements-The-Support-Line",
    "reference": false
  },
  {
    "id": "fighter",
    "group": "unitTypes",
    "title": "战斗机",
    "zh": "可攻击任意阵线，也可进入前线。拦截轰炸机对同一阵线其他友军或总部的攻击；移到前线后不再保护后方。不能无视守卫，不能获得烟幕。",
    "en": "Can attack any line and enter the frontline. Intercepts bombers targeting other allies or HQ in its own line; moving to the frontline stops it covering support. Does not bypass Guard and cannot gain Smokescreen.",
    "source": "https://support.kards.com/hc/en-us/articles/360026757171-Battlefield-elements-The-Support-Line",
    "reference": false
  },
  {
    "id": "bomber",
    "group": "unitTypes",
    "title": "轰炸机",
    "zh": "可攻击任意阵线并无视守卫，也可进入前线。攻击时只有战斗机会反击；被攻击时不反击。目标阵线上的战斗机会拦截。",
    "en": "Can attack any line, bypass Guard, and enter the frontline. Only fighters retaliate against its attacks; it does not retaliate when attacked. Fighters in the target line intercept it.",
    "source": "https://support.kards.com/hc/en-us/articles/360026757171-Battlefield-elements-The-Support-Line",
    "reference": false
  },
  {
    "id": "guard",
    "group": "keywords",
    "title": "Guard",
    "zh": "保护同一阵线紧邻左右两侧的非守卫友军，包括总部。守卫单位本身不能被其他守卫保护。火炮和轰炸机可绕过守卫；不阻挡指令。位置或单位变化后，保护范围立即更新。",
    "en": "Protects immediately adjacent non-Guard allies in its own line, including HQ. Guard units cannot themselves be guarded. Artillery and bombers bypass Guard; orders are not blocked. Protection updates as positions or units change.",
    "source": "https://support.kards.com/hc/en-us/articles/360026238532-Unit-ability-Guard",
    "reference": false
  },
  {
    "id": "blitz",
    "group": "keywords",
    "title": "Blitz",
    "zh": "部署当回合即可行动，仍须付行动费并遵守射程。步兵通常移动或攻击一次；坦克可先移动再攻击。",
    "en": "May act on its deployment turn. Operation costs and range still apply. Infantry normally moves or attacks once; tanks can move then attack.",
    "source": "https://support.kards.com/hc/en-us/articles/360026414011-Unit-ability-Blitz",
    "reference": false
  },
  {
    "id": "fury",
    "group": "keywords",
    "title": "Fury",
    "zh": "每回合可攻击两次，每次分别支付行动费。是否临时获得狂怒，以卡牌技能写明的持续时间为准。",
    "en": "May attack twice each turn, paying separately for each attack. If granted temporarily, its duration follows the card ability.",
    "source": "https://support.kards.com/hc/en-us/articles/360026228852-Unit-ability-Fury",
    "reference": false
  },
  {
    "id": "smokescreen",
    "group": "keywords",
    "title": "Smokescreen",
    "zh": "带烟幕的单位不能被其他单位直接攻击；一旦移动或攻击便失去烟幕。烟幕不阻挡指令造成的伤害。",
    "en": "A unit with Smokescreen cannot be directly attacked by other units. Moving or attacking removes it. Orders can still damage the unit.",
    "source": "https://support.kards.com/hc/en-us/articles/360026341232-Unit-ability-Smokescreen",
    "reference": false
  },
  {
    "id": "veteran",
    "group": "keywords",
    "title": "Veteran",
    "zh": "表示已经晋升的老兵单位。晋升条件写在原始形态的技能中。",
    "en": "Identifies a unit that has already become Veteran. Its original form states the promotion condition.",
    "source": "https://www.kards.com/article/brothers-in-arms-kick-off",
    "reference": false
  },
  {
    "id": "ambush",
    "group": "keywords",
    "title": "Ambush",
    "zh": "每轮第一次受到攻击时先造成防御伤害；若因此消灭攻击者，则自身不受本次攻击伤害。本轮之后的攻击正常结算。",
    "en": "On the first attack against it in a round, deals defensive damage first. If that destroys the attacker, it takes no damage from that attack. Later attacks that round resolve normally.",
    "source": "https://support.kards.com/hc/en-us/articles/360026413871-Unit-ability-Ambush",
    "reference": false
  },
  {
    "id": "heavyArmor",
    "group": "keywords",
    "title": "Heavy Armor",
    "zh": "重甲后的数值表示减伤量，例如重甲1。减少来自单位的战斗伤害；指令伤害不受此减伤影响。",
    "en": "The number after Heavy Armor indicates damage reduction, such as Heavy Armor 1. Reduces combat damage from units; order damage is not reduced.",
    "source": "https://support.kards.com/hc/en-us/articles/360026532571-Unit-ability-Heavy-Armor",
    "reference": false
  },
  {
    id:'shock',group:'keywords',title:'Shock',reference:false,
    zh:'首次攻击单位时不受反击伤害，包括伏击单位。攻击单位后失去冲击；攻击总部不会消耗冲击。',
    en:'Takes no retaliation damage on its first attack against a unit, including a unit with Ambush. Loses Shock after attacking a unit; attacking HQ does not consume Shock.',
    source:'https://www.kards.com/news/blood-iron-shock'
  },
  {
    id:'pin',group:'effects',title:'Pin',reference:false,
    zh:'被压制的单位无法移动或攻击，持续至其控制者下个回合结束。仍能反击，保留攻防数值、词条与技能。返回手牌后解除压制。',
    en:'A Pinned unit cannot move or attack until the end of its controller’s next turn. It can still retaliate and retains its stats, keywords and abilities. Returning to hand removes Pin.',
    source:'https://www.kards.com/news/kards-winter-war-kickoff-23'
  },
  {
    id:'suppress',group:'effects',title:'Suppress',reference:false,
    zh:'移除单位的词条、技能和增减益，将攻击力、部署及行动花费恢复为原始值，防御上限恢复为原始值。当前防御力也恢复为原始值。返回手牌后解除抑制。',
    en:'Removes keywords, abilities and modifiers. Resets attack, deployment and operation costs and maximum defense to printed values and current defense to printed values. Returning to hand removes Suppressed.',
    source:'https://store.steampowered.com/news/posts/?appids=544810&enddate=1705574527&feed=steam_community_announcements'
  },
  {
    id:'destruction',group:'effects',title:'Destruction',reference:false,
    zh:'亡计：单位被消灭后触发卡牌注明的效果，也可在敌方回合触发。',
    en:'Destruction: triggers the listed effect when the unit is destroyed, including during the enemy turn.',
    source:'https://support.kards.com/hc/en-us/articles/900001547843-Drawing-cards-out-of-turn'
  },
  {
    id:'retreat',group:'effects',title:'Retreat',reference:false,
    zh:'使单位后退一线：从前线返回友方支援阵线，从支援阵线返回手牌。目的地没有空位则消灭该单位。前线撤退保留伤害、增益和本回合行动状态；撤退不是一次付费移动。',
    en:'Moves a unit one step back: frontline to its support line, or support line to hand. If the destination is full, destroy it. Retreating from the frontline preserves damage, buffs and actions already used this turn; it is not a paid move.',
    source:'https://support.kards.com/hc/en-us/articles/360026464712-Battlefield-elements-The-Frontline'
  }
];
let language='zh';
function setLanguage(value){language=value==='en'?'en':'zh';return language}
function t(key,vars={}){const template=messages[key]?.[language]??key;return String(template).replace(/\{(\w+)\}/g,(_,k)=>vars[k]??'{'+k+'}')}
function name(c){const n=typeof c==='string'?c:c.n;for(const city of ['西柏林','加里宁格勒'])if(n===city+'总部')return t('hqName',{city:t(city)});if(n==='华盛顿总部'||n==='Washington HQ')return t('hqName',{city:t('华盛顿')});if(n==='莫斯科总部'||n==='Moscow HQ')return t('hqName',{city:t('莫斯科')});return language==='zh'?(cards[n]?.n??n):n}
function short(c){return keywordLabels(c).join(' · ')}
function text(c){
 if(c.veteran)return language==='zh'?(c.veteranForm?.zhText??t(c.text||'')):t(c.text||'');
 return language==='zh'?(cards[c.n]?.text??t(c.text||'')):t(c.text||'');
}

function skillText(c){
 if(c.text)return text(c);
 if(c.t!=='order')return '';
 const effects={heal:'healEffect',draw:'drawEffect',strike:'效果：选择一个敌方单位并造成 4 点伤害。',buff:'效果：所有友方单位获得 +1 攻击和 +1 防御。'};
 return effects[c.fx]?t(effects[c.fx]):'';
}

function skillShort(){return ''}
function keywordLabels(c){
 const keys=new Set(c.kw||[]);
 if(c.tempBlitz)keys.add('blitz');if(c.fury)keys.add('fury');
 const labels={guard:'Guard',blitz:'Blitz',fury:'Fury',smokescreen:'Smokescreen',veteran:'Veteran',ambush:'Ambush',heavyArmor:'Heavy Armor',shock:'Shock'};
 const result=Object.entries(labels).filter(([key])=>keys.has(key)).map(([key,label])=>t(label)+(key==='heavyArmor'&&c.armor?' '+c.armor:''));
 return result;
}
function message(raw){
 const discount=raw.match(/^Operations -(\d+) this turn$/);if(discount)return language==='zh'?'本回合获得-'+discount[1]+'行动花费。':'Gain -'+discount[1]+' operation cost this turn.';
 const patterns=[[/^行动需要 (\d+) K，当前仅剩 (\d+) K$/,'operationCost',['cost','available']],[/^部署需要 (\d+) K，当前仅剩 (\d+) K$/,'deploymentCost',['cost','available']],[/^Extra actions: (\d+)$/,'extraActions',['n']],[/^Attack \+(\d+) this turn$/,'tempAttack',['n']],[/^Next attack \+(\d+)$/,'nextAttack',['n']],[/^Operations \+(\d+) this turn$/,'opBonus',['n']]];
 for(const [regex,key,keys] of patterns){const m=raw.match(regex);if(m)return t(key,Object.fromEntries(keys.map((k,i)=>[k,m[i+1]])))}return t(raw);
}
function summary(entry){
 let result=entry.summary;

 for(const n of [...Object.keys(cards),'华盛顿总部','莫斯科总部','西柏林总部','加里宁格勒总部'].sort((a,b)=>b.length-a.length))result=result.split(n).join(name(n));
 if(language==='en')return result.replace(/^使用指令 /,'Order: ').replace(/^部署 /,'Deploy ').replace(/ 推进前线$/,' advanced to the frontline').replace(/^结束回合$/,'End turn');
 return result.replace(/\[Boost\]/g,'[强化]');
}
return {setLanguage,getLanguage:()=>language,t,name,short,text,skillText,skillShort,keywordLabels,glossary,message,summary,cards,messages};
});
