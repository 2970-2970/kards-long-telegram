
(function(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LongTelegram = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
'use strict';
const AI=typeof module!=='undefined'&&module.exports?require('./ai-planner.js'):globalThis.LongTelegramAI;
const LIB={
  p:[
    {key:'marines9',n:'9TH MARINES',zh:'第9海军陆战团',rarity:'limited',t:'infantry',c:1,o:3,a:2,h:4,kw:['guard'],d:'Guard',retreatGrowth:2,text:'Whenever a unit retreats, this unit gets +2+2.',zhText:'每有1个单位撤退，本单位获得+2+2。'},
    {key:'bobcats5',n:'5TH BOBCATS',zh:'第5山猫团',rarity:'limited',t:'infantry',c:1,o:1,a:2,h:3,destruction:'drawTank',text:'Destruction: Draw a tank from your deck.',zhText:'亡计：从卡组抽1张坦克牌。'},
    {key:'m48',n:'M48 PATTON',zh:'M48巴顿',rarity:'limited',t:'tank',c:6,o:2,a:5,h:6,deployRepairInfantry:true,text:'Deployment: Fully repair a friendly infantry unit and give it Shock.',zhText:'部署：完全修复1个友方步兵，使其获得冲击。'},
    {key:'m60',n:'M60 PATTON',zh:'M60巴顿',rarity:'elite',elite:true,t:'tank',c:8,o:2,a:6,h:7,kw:['heavyArmor','shock'],d:'Heavy Armor 1 · Shock',armor:1,afterShockSmoke:true,deploySpawn:'m48',relatedCards:['usa:2'],text:'Deployment: Add an M48 PATTON to your support line.\nAfter this unit uses Shock, gain Smokescreen.',zhText:'部署：将1个“M48巴顿”加入友方支援阵线。\n本单位使用冲击后，获得烟幕。'},
    {key:'infantry28',n:'28TH INFANTRY REGIMENT',zh:'第28步兵团',rarity:'standard',t:'infantry',c:2,o:1,a:3,h:2},
    {key:'sabre',n:'F-86 SABRE',zh:'F-86佩刀',rarity:'standard',t:'fighter',c:3,o:1,a:3,h:3},
    {key:'phantom',n:'F-4 PHANTOM II',zh:'F-4鬼怪II',rarity:'special',t:'fighter',c:5,o:2,a:4,h:5,kw:['heavyArmor'],d:'Heavy Armor 1',armor:1,deployDamage:2,text:'Deployment: Deal 2 damage to an enemy target.',zhText:'部署：对1个敌方目标造成2点伤害。'},
    {key:'b52',n:'B-52 STRATOFORTRESS',zh:'B-52同温层堡垒',rarity:'elite',elite:true,t:'bomber',c:10,o:4,a:8,h:8,kw:['heavyArmor'],d:'Heavy Armor 1',armor:1,deployDamage:4,deploySupportTarget:true,bomberAttack:1,bomberGuard:true,text:'Deployment: Deal 4 damage to an enemy target in the support line.\nOther friendly bombers have +1 attack and Guard.',zhText:'部署：对敌方支援阵线的1个目标造成4点伤害。\n其他友方轰炸机获得+1攻击力和守卫。'},
    {key:'marshall',n:'MARSHALL PLAN',zh:'马歇尔计划',rarity:'standard',t:'order',c:2,fx:'marshall',choices:['draw','kredits'],text:'Lose a Kredit slot. Choose: Draw 3 cards or gain 3 Kredits at the start of your next turn.',zhText:'失去1个指挥点槽。抉择：抽3张牌或下个友方回合开始时，获得3个指挥点。'},
    {key:'cia',n:'CIA OPERATION',zh:'中情局行动',rarity:'limited',t:'order',c:2,fx:'cia',text:'Retreat a friendly frontline unit. Deal 2 damage to a random enemy unit in the support line. Deal 4 instead if it has a combat keyword.',zhText:'使前线1个友方单位撤退。对敌方支援阵线1个随机单位造成2点伤害。若其具有对战词条，则改为造成4点伤害。'},
    {key:'airStrike',n:'AIR STRIKE',zh:'空袭',rarity:'standard',t:'order',c:3,fx:'strike',text:'Deal 4 damage to target enemy unit.',zhText:'对1个敌方单位造成4点伤害。'},
    {key:'nato',n:'NATO REINFORCEMENTS',zh:'北约增援',rarity:'special',t:'order',c:5,fx:'nato',text:'Fully repair all friendly units and give them +2 defense.',zhText:'完全修复所有友方单位，使其获得+2防御力。'},
    {key:'wolfhounds',n:'WOLFHOUNDS',zh:'猎狼犬团',rarity:'special',t:'infantry',c:3,o:2,a:3,h:4,fighterDeployCopy:true,text:'When a friendly fighter is deployed, add a Suppressed copy of this unit to your support line.',zhText:'友方战斗机部署时，将1个本单位被抑制的复制加入友方支援阵线。'},
    {key:'bulldogs',n:'BASTOGNE BULLDOGS',zh:'巴斯托涅斗牛犬',rarity:'special',t:'infantry',c:5,o:1,a:2,h:4,veteranTrigger:'supportedFront',text:'Becomes Veteran when this unit moves into the frontline while you control another unit there.',zhText:'移入已有其他友方单位的前线时，升为老兵。',
      veteranForm:{a:5,h:4,kw:['veteran'],d:'Veteran',text:'When this unit becomes Veteran, add a PRESIDENTIAL UNIT CITATION to your hand.',zhText:'升为老兵时，将1张“总统部队嘉奖”加入手中。'},veteranReward:'citation'},
    {key:'canberra',n:'B-57B CANBERRA',zh:'B-57B堪培拉',rarity:'standard',t:'bomber',c:4,o:2,a:3,h:3,killDraw:1,text:'When this unit destroys an enemy unit, draw a card.',zhText:'本单位消灭敌方单位时，抽1张牌。'},
    {key:'interdiction',n:'INTERDICTION',zh:'拦截',rarity:'special',t:'order',c:4,fx:'interdiction',text:'The enemy loses 1 Kredit slot. For each friendly air unit, give a friendly ground unit +1 attack.',zhText:'敌方失去1个指挥点槽。每有1个友方空军，使1个友方陆军获得+1攻击力。'},
    {key:'searchAndDestroy',n:'SEARCH AND DESTROY',zh:'搜寻与歼灭',rarity:'elite',elite:true,t:'order',c:8,fx:'searchAndDestroy',text:'Choose up to 3 ground units in your hand. Give them Blitz and add them to your support line. They gain -1 operation cost this turn.',zhText:'选择手中至多3个陆军单位，使其获得闪击并加入友方支援阵线。本回合其获得-1行动花费。'},
    {key:'thunderchief',n:'F-105 THUNDERCHIEF',zh:'F-105雷公',rarity:'limited',t:'bomber',c:5,o:2,a:4,h:3,deployGenerate:'rollingThunder',relatedCards:['rollingThunder'],destruction:'damageHQ',destructionDamage:2,text:'Deployment: Add an OPERATION ROLLING THUNDER to your hand.\nDestruction: Deal 2 damage to the enemy HQ.',zhText:'部署：将1张“滚雷行动”加入手中。\n亡计：对敌方总部造成2点伤害。'},
    {key:'blackhorse',n:'BLACKHORSE REGIMENT',zh:'黑马团',rarity:'standard',t:'infantry',c:3,o:1,a:3,h:4,deployTankGuard:true,text:'Deployment: If you control a tank, gain Guard and +1+1.',zhText:'部署：若友方有坦克，获得守卫和+1+1。'},
    {key:'iroquois',n:'UH-1 IROQUOIS',zh:'UH-1易洛魁',rarity:'limited',t:'fighter',c:1,o:2,a:2,h:2,deployRetreatInfantry:true,text:'Deployment: Retreat an infantry unit.',zhText:'部署：使1个步兵单位撤退。'},
    {key:'antiwar',n:'ANTIWAR MOVEMENT',zh:'反战运动',rarity:'standard',t:'order',c:3,fx:'antiwar',text:'Retreat 2 units.',zhText:'使2个单位撤退。'},
    {key:'kadena',n:'KADENA AIR BASE',zh:'嘉手纳空军基地',rarity:'limited',t:'order',c:1,fx:'kadena',text:'Draw an air unit.',zhText:'抽1张空军牌。'},
    {key:'longTelegram',n:'LONG TELEGRAM',zh:'长电报',rarity:'standard',t:'order',c:1,fx:'longTelegram',text:'Draw a card. Set a friendly infantry unit’s attack equal to its defense.',zhText:'抽1张牌。使1个友方步兵的攻击力等同于其防御力。'},
    {key:'containment',n:'CONTAINMENT',zh:'遏制战略',rarity:'limited',t:'order',c:5,fx:'containment',text:'Suppress an enemy unit. Deal 2 damage to its adjacent targets.',zhText:'抑制1个敌方单位。对其相邻目标造成2点伤害。'},
    {key:'limitedWar',n:'LIMITED WAR',zh:'有限战争',rarity:'limited',t:'order',c:2,fx:'limitedWar',text:'All ground units have -2 attack this turn.',zhText:'本回合，所有陆军单位具有-2攻击力。'},
    {key:'brettonWoods',n:'BRETTON WOODS SYSTEM',zh:'布雷顿森林体系',rarity:'standard',t:'order',c:1,fx:'brettonWoods',text:'Gain 2 Kredits at the start of your next turn.',zhText:'下个友方回合开始时，获得2个指挥点。'}
  ],
  e:[
    {n:'MOTOR RIFLES',t:'infantry',c:2,o:1,a:2,h:3,kw:['guard'],d:'Guard'},
    {n:'VDV AIRBORNE',t:'infantry',c:3,o:1,a:3,h:3,kw:['blitz'],d:'Blitz'},
    {n:'T-54',t:'tank',c:3,o:2,a:3,h:4},
    {n:'T-62',t:'tank',c:5,o:2,a:5,h:5},
    {n:'2S1 SPG',t:'artillery',c:4,o:2,a:4,h:3},
    {n:'MIG-15',t:'fighter',c:3,o:1,a:3,h:2},
    {n:'MIG-21',t:'fighter',c:5,o:2,a:5,h:4},
    {n:'TU-95',t:'bomber',c:6,o:3,a:6,h:4},
    {n:'PACT AID',t:'order',c:2,fx:'heal'},
    {n:'KGB OPERATION',t:'order',c:2,fx:'draw'},
    {n:'MISSILE STRIKE',t:'order',c:3,fx:'strike'},
    {n:'DEEP BATTLE',t:'order',c:4,fx:'buff'}
  ]
};

LIB.soviet=[
  {key:'rifles16',n:'16TH GUARDS MOTORIZED RIFLES',zh:'第16近卫机动步兵团',rarity:'elite',t:'infantry',c:3,o:1,a:2,h:5,veteranTurns:3,relatedCards:['ussr:21'],text:'At the start of its third turn on the battlefield, this unit becomes Veteran.',zhText:'在场上的第3回合开始时，升为老兵。',
    veteranForm:{a:4,h:5,kw:['veteran','ambush'],d:'Veteran · Ambush',destruction:'generate',destructionCard:'guards6',text:'When this unit becomes Veteran, gain Ambush.\nDestruction: Add a 6TH GUARDS TANK REGIMENT to your hand.',zhText:'升为老兵时，获得伏击。\n亡计：将1张“第6近卫坦克团”加入手中。'}},
  {key:'guards68',n:'68TH GUARDS TANK REGIMENT',zh:'第68近卫坦克团',rarity:'special',t:'infantry',c:5,o:1,a:3,h:5,kw:['shock'],d:'Shock',deployGenerate:'fightingGirlfriend',relatedCards:['fightingGirlfriend'],text:'Deployment: Add a FIGHTING GIRLFRIEND to your hand.',zhText:'部署：将1张“战斗女友”加入手中。'},
  {key:'rifles17',n:'17TH GUARDS MOTORIZED RIFLES',zh:'第17近卫机动步兵团',rarity:'limited',t:'infantry',c:3,o:2,a:1,h:6,kw:['guard'],d:'Guard',deployGenerate:'closedCity',relatedCards:['closedCity'],text:'Deployment: Add a CLOSED CITY to your hand.',zhText:'部署：将1张“封闭城市”加入手中。'},
  {key:'rifles92',n:'92ND MOTORIZED RIFLES',zh:'第92机动步兵团',rarity:'standard',t:'infantry',c:1,o:0,a:2,h:2,deployFront:true,text:'Deployment: Move to the frontline.',zhText:'部署：移至前线。'},
  {key:'cavalry11',n:'11TH SEPARATE CAVALRY',zh:'第11独立骑兵团',rarity:'elite',t:'infantry',c:2,o:0,a:0,h:3,kw:['smokescreen'],d:'Smokescreen',veteranTrigger:'friendlyDestroyed',veteranResurrect:true,text:'Becomes Veteran when another friendly unit is destroyed.',zhText:'其他友方单位被消灭时，升为老兵。',
    veteranForm:{a:4,h:3,kw:['veteran','smokescreen'],d:'Veteran · Smokescreen',text:'When this unit becomes Veteran, add the last friendly ground unit destroyed to your support line.',zhText:'升为老兵时，将上1个被消灭的友方陆军单位加入支援阵线。'}},
  {key:'rifles276',n:'276TH MOTORIZED RIFLES',zh:'第276机动步兵团',rarity:'standard',t:'infantry',c:1,o:1,a:2,h:3},
  {key:'t54',deckId:'ussr:22',n:'T-54',zh:'T-54',rarity:'limited',t:'tank',c:5,o:2,a:5,h:4,kw:['heavyArmor'],d:'Heavy Armor 1',armor:1,antiTankAttack:2,text:'Has +2 attack against tanks.',zhText:'对抗坦克时，具有+2攻击力。'},
  {key:'victoriousFebruary',deckId:'ussr:23',n:'VICTORIOUS FEBRUARY',zh:'胜利二月',rarity:'special',t:'order',c:3,fx:'victoriousFebruary',text:'Draw 2 cards. Give 2 enemy units +2 operation cost.',zhText:'抽2张牌。使2个敌方单位获得+2行动花费。'},
  {key:'czechHedgehog',deckId:'ussr:24',n:'CZECH HEDGEHOG',zh:'捷克刺猬',rarity:'standard',t:'order',c:1,fx:'czechHedgehog',text:'Pin an enemy ground unit. If it is a tank costing 3 or less, destroy it.',zhText:'压制1个敌方陆军单位。若其为花费不大于3的坦克，将其消灭。'},
  {key:'mig21',deckId:'ussr:25',n:'MiG-21',zh:'米格-21',rarity:'standard',t:'fighter',c:4,o:2,a:4,h:4,kw:['blitz'],d:'Blitz',deployOtherAirDiscount:true,text:'Deployment: If there is another air unit on the battlefield, gain -1 operation cost.',zhText:'部署：若战场上有其他空军单位，获得-1行动花费。'},
  {key:'thoseDays',deckId:'ussr:26',n:'THOSE DAYS',zh:'那些日子',rarity:'limited',t:'order',c:2,fx:'thoseDays',text:'Deal 4 damage to your HQ. Ground units in your hand cost 2 less this turn.',zhText:'对友方总部造成4点伤害。本回合，手牌中的所有陆军单位具有-2花费。'},
  {key:'t64a',deckId:'ussr:27',n:'T-64A',zh:'T-64A',rarity:'elite',t:'tank',c:7,o:2,a:7,h:5,kw:['blitz','fury','heavyArmor'],d:'Blitz · Fury · Heavy Armor 2',armor:2,killArmorLoss:1,text:'When this unit destroys an enemy unit, lose 1 Heavy Armor.',zhText:'本单位消灭1个敌方单位时，获得-1重甲。'},
  {key:'t62Tank',deckId:'ussr:28',n:'T-62',zh:'T-62',rarity:'special',t:'tank',c:6,o:2,a:6,h:5,kw:['guard','heavyArmor'],d:'Guard · Heavy Armor 1',armor:1,friendlyTankFight:true,text:'When a friendly tank is destroyed, fight a random enemy frontline unit.',zhText:'友方坦克被消灭时，随机与前线1个敌方单位战斗。'},
  {key:'azpS60',deckId:'ussr:29',n:'AZP-S60',zh:'AZP-S60',rarity:'standard',t:'artillery',c:2,o:2,a:3,h:1,enemyAirOperationDamage:1,text:'After an enemy air unit operates, deal 1 damage to it.',zhText:'敌方空军单位行动后，对其造成1点伤害。'},
  {key:'obiekt279',deckId:'ussr:30',n:'OBIEKT 279',zh:'279工程',rarity:'elite',t:'tank',c:8,o:3,a:7,h:7,kw:['blitz','heavyArmor'],d:'Blitz · Heavy Armor 2',armor:2,combatDiscardOrder:true,text:'After this unit fights and survives, the enemy discards a random order.',zhText:'本单位交战并存活后，敌方随机弃1张指令牌。'}
];
LIB.france=[
  {
    "key": "fr_rep",
    "n": "2nd Foreign Parachute Regiment",
    "zh": "第2外籍伞兵团",
    "t": "infantry",
    "c": 3,
    "o": 1,
    "a": 3,
    "h": 3,
    "kw": [
      "blitz"
    ],
    "d": "Blitz",
  },
  {
    "key": "fr_marines",
    "n": "Marine Infantry Regiment",
    "zh": "海军陆战步兵团",
    "t": "infantry",
    "c": 3,
    "o": 1,
    "a": 3,
    "h": 5,
    "kw": [
      "guard"
    ],
    "d": "Guard",
    "deployHQHeal": 2,
    "text": "Deployment: Restore 2 health to your HQ.",
    "zhText": "部署：友方总部恢复2生命。",
  },
  {
    "key": "fr_amx13",
    "n": "AMX-13",
    "zh": "AMX-13",
    "t": "tank",
    "c": 3,
    "o": 1,
    "a": 3,
    "h": 3,
    "kw": [
      "blitz"
    ],
    "d": "Blitz",
    "firstFrontDraw": 1,
    "text": "The first time this unit enters the frontline, draw a card.",
    "zhText": "第一次进入前线时，抽1张牌。",
  },
  {
    "key": "fr_amx30",
    "n": "AMX-30",
    "zh": "AMX-30",
    "t": "tank",
    "c": 5,
    "o": 2,
    "a": 5,
    "h": 6,
    "kw": [],
    "deployTankHeal": 2,
    "text": "Deployment: Restore 2 defense to each other friendly tank.",
    "zhText": "部署：其他所有友方坦克各恢复2防御。",
  },
  {
    "key": "fr_mirage",
    "n": "Mirage III",
    "zh": "幻影III",
    "t": "fighter",
    "c": 4,
    "o": 1,
    "a": 4,
    "h": 3,
    "kw": [],
    "deployAirAttack": 1,
    "text": "Deployment: Friendly air units gain +1 attack this turn.",
    "zhText": "部署：友方空军本回合获得+1攻击。",
  },
  {
    "key": "fr_vautour",
    "n": "Vautour IIB",
    "zh": "秃鹰IIB",
    "t": "bomber",
    "c": 5,
    "o": 2,
    "a": 5,
    "h": 4,
    "kw": [],
  },
  {
    "key": "fr_f3",
    "n": "AMX-13 F3",
    "zh": "AMX-13 F3自行火炮",
    "t": "artillery",
    "c": 4,
    "o": 2,
    "a": 3,
    "h": 3,
    "kw": [],
    "deployDrawFront": 1,
    "text": "Deployment: If you control the frontline, draw a card.",
    "zhText": "部署：若你控制前线，抽1张牌。",
  },
  {
    "key": "fr_workshop",
    "n": "Mobile Workshop",
    "zh": "机动维修站",
    "t": "order",
    "c": 2,
    "fx": "workshop",
    "text": "Restore 3 defense to a friendly unit, then draw a card.",
    "zhText": "为一个友方单位恢复3防御，然后抽1张牌。",
  },
  {
    "key": "fr_air",
    "n": "Air Coordination",
    "zh": "空中协同",
    "t": "order",
    "c": 2,
    "fx": "airbuff",
    "text": "Friendly air units gain +1+1.",
    "zhText": "所有友方空军获得+1+1。",
  },
  {
    "key": "fr_rapid",
    "n": "Rapid Redeployment",
    "zh": "快速调遣",
    "t": "order",
    "c": 2,
    "fx": "rapid",
    "text": "A friendly ground unit gains Blitz this turn. Its next move this turn costs 0 K.",
    "zhText": "一个友方地面单位本回合获得闪击，且本回合下一次移动费用为0 K。",
  }
];
LIB.drv=[
  {
    "key": "vn_308",
    "n": "308th Division",
    "zh": "第308师",
    "t": "infantry",
    "c": 3,
    "o": 1,
    "a": 3,
    "h": 5,
    "kw": [
      "guard"
    ],
    "d": "Guard",
    "deployHQHeal": 1,
    "text": "Deployment: Restore 1 health to your HQ.",
    "zhText": "部署：友方总部恢复1生命。",
  },
  {
    "key": "vn_312",
    "n": "312th Division",
    "zh": "第312师",
    "t": "infantry",
    "c": 2,
    "o": 1,
    "a": 3,
    "h": 3,
    "kw": [],
    "firstFrontAttack": 1,
    "text": "The first time this unit enters the frontline, gain +1 attack this turn.",
    "zhText": "第一次进入前线时，本回合获得+1攻击。",
  },
  {
    "key": "vn_320",
    "n": "320th Division",
    "zh": "第320师",
    "t": "infantry",
    "c": 4,
    "o": 1,
    "a": 4,
    "h": 5,
    "kw": [],
    "deployCounterBlitz": true,
    "text": "Deployment: If the enemy controls the frontline, gain Blitz.",
    "zhText": "部署：若敌军控制前线，获得闪击。",
  },
  {
    "key": "vn_recon",
    "n": "Reconnaissance Company",
    "zh": "侦察连",
    "t": "infantry",
    "c": 1,
    "o": 1,
    "a": 1,
    "h": 2,
    "kw": [
      "blitz"
    ],
    "d": "Blitz",
    "firstFrontDraw": 1,
    "text": "The first time this unit enters the frontline, draw a card.",
    "zhText": "第一次进入前线时，抽1张牌。",
  },
  {
    "key": "vn_type59",
    "n": "Type 59",
    "zh": "59式坦克",
    "t": "tank",
    "c": 4,
    "o": 2,
    "a": 4,
    "h": 5,
    "kw": [],
    "deployCounterBlitz": true,
    "text": "Deployment: If the enemy controls the frontline, gain Blitz.",
    "zhText": "部署：若敌军控制前线，获得闪击。",
  },
  {
    "key": "vn_mig17",
    "n": "MiG-17",
    "zh": "米格-17",
    "t": "fighter",
    "c": 3,
    "o": 1,
    "a": 3,
    "h": 3,
    "kw": [],
    "deployDrawInfantry": 1,
    "text": "Deployment: If you control an infantry unit, draw a card.",
    "zhText": "部署：若你控制步兵，抽1张牌。",
  },
  {
    "key": "vn_d74",
    "n": "D-74 Battery",
    "zh": "D-74火炮连",
    "t": "artillery",
    "c": 4,
    "o": 1,
    "a": 3,
    "h": 3,
    "kw": [],
    "splash": 1,
    "text": "When attacking a frontline unit, deal 1 damage to each enemy adjacent to the target.",
    "zhText": "攻击前线单位时，对与目标相邻的每个敌军各造成1伤害。",
  },
  {
    "key": "vn_trail",
    "n": "Trail Logistics",
    "zh": "小道补给",
    "t": "order",
    "c": 2,
    "fx": "draw",
    "text": "Draw 2 cards.",
    "zhText": "抽2张牌。",
  },
  {
    "key": "vn_relief",
    "n": "Field Dispensary",
    "zh": "战地医护站",
    "t": "order",
    "c": 2,
    "fx": "relief",
    "text": "Restore 4 health to your HQ and 1 defense to each friendly infantry unit.",
    "zhText": "友方总部恢复4生命，所有友方步兵各恢复1防御。",
  },
  {
    "key": "vn_assault",
    "n": "Coordinated Assault",
    "zh": "协同攻势",
    "t": "order",
    "c": 3,
    "fx": "assault",
    "text": "Friendly ground units gain +2 attack this turn.",
    "zhText": "所有友方地面单位本回合获得+2攻击。",
  }
];
const other = side => side === 'p' ? 'e' : 'p';
const FACTIONS={
  usa:{name:'美国',label:'USA',hq:'WEST BERLIN',city:'西柏林',emblem:'★',library:'p',opponent:'ussr'},
  ussr:{name:'苏联',label:'USSR',hq:'KALININGRAD',city:'加里宁格勒',emblem:'☭',library:'soviet',opponent:'usa'},
  france:{name:'法国',label:'FRA',hq:'PARIS',city:'巴黎',emblem:'⚜',library:'france',allyOnly:true},
  drv:{name:'越南民主共和国',label:'DRV',hq:'HANOI',city:'河内',emblem:'★',library:'drv',allyOnly:true}
};

const RARITIES={standard:{limit:4,piece:'pawn'},limited:{limit:3,piece:'knight'},special:{limit:2,piece:'rook'},elite:{limit:1,piece:'queen'}};
LIB.soviet.forEach(c=>{c.elite=c.rarity==='elite';});
for(const [faction,f] of Object.entries(FACTIONS))LIB[f.library].forEach((c,i)=>{c.faction=faction;c.deckId??=faction+':'+i;c.rarity??='standard';});
const GENERATED_CARDS={
 guards6:{key:'guards6',deckId:'ussr:21',faction:'ussr',generated:true,n:'6TH GUARDS TANK REGIMENT',zh:'第6近卫坦克团',t:'infantry',c:5,o:1,a:5,h:6,kw:['shock'],d:'Shock',tankArmor:1,text:'Friendly tanks have Heavy Armor 1.',zhText:'友方坦克拥有重甲1。'},
 citation:{key:'citation',deckId:'generated:presidential-unit-citation',n:'PRESIDENTIAL UNIT CITATION',zh:'总统部队嘉奖',faction:'usa',generated:true,t:'order',c:3,fx:'retreatFront',text:'Retreat all units in the frontline.',zhText:'使前线所有单位撤退。'},
 rollingThunder:{key:'rollingThunder',deckId:'generated:rolling-thunder',n:'OPERATION ROLLING THUNDER',zh:'滚雷行动',faction:'usa',generated:true,t:'order',c:3,fx:'rollingThunder',text:'Destroy 1–3 random units across both support lines.',zhText:'随机消灭双方支援阵线合计1–3个单位。'},
 closedCity:{key:'closedCity',deckId:'generated:closed-city',n:'CLOSED CITY',zh:'封闭城市',faction:'ussr',generated:true,t:'order',c:2,fx:'closedCity',text:'Pin 2 random ground units in the frontline.',zhText:'随机压制前线2个陆军单位。'},
 fightingGirlfriend:{key:'fightingGirlfriend',deckId:'generated:fighting-girlfriend',n:'FIGHTING GIRLFRIEND',zh:'战斗女友',faction:'ussr',generated:true,t:'order',c:2,fx:'fightingGirlfriend',text:'Give all friendly ground units +2+2 until the end of the round.',zhText:'所有友方陆军单位获得+2+2，直到回合结束。'}
};
const copyLimit=c=>c?.generated?0:(RARITIES[c?.rarity||'standard']?.limit??0);
const MAIN_NATIONS=['usa','ussr'];
const HEADQUARTERS={
  'west-berlin':{id:'west-berlin',faction:'usa',city:'西柏林',name:'West Berlin',hp:20,deckId:'hq:west-berlin'},
  kaliningrad:{id:'kaliningrad',faction:'ussr',city:'加里宁格勒',name:'Kaliningrad',hp:20,deckId:'hq:kaliningrad'}
};
const headquartersFor=faction=>Object.values(HEADQUARTERS).filter(h=>h.faction===faction);
const headquarters=q=>HEADQUARTERS[q.hqId]||headquartersFor(q.faction||q.main)[0];
const DECK_SIZE=40,NORMAL_DECK_SIZE=DECK_SIZE-1;
const handCount=q=>q.hand.length;
function catalog(main,ally=null){
  if(!MAIN_NATIONS.includes(main))return [];
  return [...LIB[FACTIONS[main].library],...(ally&&ally!==main&&Object.hasOwn(FACTIONS,ally)?LIB[FACTIONS[ally].library]:[])];
}
function deckIssue(plan,complete=true){
  if(!plan||!MAIN_NATIONS.includes(plan.main))return 'deck.invalidMain';
  if(plan.ally!=null&&(!Object.hasOwn(FACTIONS,plan.ally)||plan.ally===plan.main))return 'deck.invalidAlly';
  if(plan.hqId!=null&&(!Object.hasOwn(HEADQUARTERS,plan.hqId)||HEADQUARTERS[plan.hqId].faction!==plan.main))return 'deck.invalidHq';
  if(!plan.counts||typeof plan.counts!=='object'||Array.isArray(plan.counts))return 'deck.invalidCards';
  const allowed=new Map(catalog(plan.main,plan.ally).map(c=>[c.deckId,c]));let total=0,primary=0;
  for(const [id,n] of Object.entries(plan.counts)){
    if(!allowed.has(id))return 'deck.wrongNation';
    if(!Number.isInteger(n)||n<0||n>copyLimit(allowed.get(id)))return 'deck.rarityLimit';
    total+=n;if(allowed.get(id).faction===plan.main)primary+=n;
  }
  if(total>NORMAL_DECK_SIZE)return 'deck.tooMany';
  if(total-primary>12)return 'deck.allyLimit';
  if(complete&&!mainReady(plan.main))return 'deck.mainUnavailable';
  if(complete&&total!==NORMAL_DECK_SIZE)return 'deck.needComplete';
  if(complete&&!primary)return 'deck.needMain';
  return '';
}
const deckCapacity=nation=>LIB[FACTIONS[nation].library].reduce((n,c)=>n+copyLimit(c),0);
const mainReady=main=>MAIN_NATIONS.includes(main)&&deckCapacity(main)>=27;
const DECK_RECIPES={
 usa:[['marines9',3],['iroquois',3],['wolfhounds',2],['sabre',4],['kadena',3],['antiwar',3],['cia',2],['brettonWoods',3],['marshall',2],['m60',1],['searchAndDestroy',1],['m48',3],['nato',2],['containment',2],['limitedWar',1],['blackhorse',2],['b52',1],['phantom',1]],
 france:[['fr_amx13',4],['fr_rapid',3],['fr_workshop',3],['fr_rep',2]],
 drv:[['vn_recon',3],['vn_312',3],['vn_assault',3],['vn_trail',3]],
 ussr:[['rifles92',4],['rifles276',4],['azpS60',4],['t54',3],['t62Tank',2],['t64a',1],['obiekt279',1],['thoseDays',3],['czechHedgehog',3],['victoriousFebruary',2],['mig21',4],['rifles17',3],['guards68',2],['rifles16',1],['cavalry11',1],['czechHedgehog',1]]
};
function presetDeck(main,ally=null){
  if(!MAIN_NATIONS.includes(main)||ally===main||ally&&!Object.hasOwn(FACTIONS,ally))throw new Error('deck.invalidMain');
  const plan={main,ally,hqId:headquartersFor(main)[0]?.id,counts:{},rulesVersion:9};
  function fill(nation,total){
    const pool=LIB[FACTIONS[nation].library],byKey=new Map(pool.map(c=>[c.key,c]));
    function add(c,n){if(!c)return;const have=plan.counts[c.deckId]||0,take=Math.min(n,copyLimit(c)-have,total);if(take>0){plan.counts[c.deckId]=have+take;total-=take;}}
    const recipe=DECK_RECIPES[nation];
    for(const [key,n] of recipe||[])add(byKey.get(key),n);
    for(const c of pool)add(c,copyLimit(c));
  }
  fill(main,ally?27:NORMAL_DECK_SIZE);if(ally)fill(ally,12);return plan;
}
function opponentDeck(plan){
  const preferred=FACTIONS[plan.main].opponent,main=mainReady(preferred)?preferred:MAIN_NATIONS.find(mainReady);
  return presetDeck(main,main===preferred?(plan.ally?(main==='usa'?'france':'drv'):null):'france');
}
function migrateDeck(saved){
  if(!saved||deckIssue({...saved,counts:{}},false))return null;
  if(!saved.counts||typeof saved.counts!=='object'||Array.isArray(saved.counts))return null;
  const plan=JSON.parse(JSON.stringify(saved)),pool=catalog(plan.main,plan.ally),allowed=new Map(pool.map(c=>[c.deckId,c]));
  let oldTotal=0;
  for(const [id,n] of Object.entries(plan.counts)){
    if(!Number.isInteger(n)||n<0||n>4)return null;
    oldTotal+=n;
    if(!allowed.has(id)){if((saved.rulesVersion||0)<7&&id==='ussr:21'||(saved.rulesVersion||0)<6&&/^ussr:(?:[6-9]|1[0-9]|20)$/.test(id)){delete plan.counts[id];continue;}return null;}
    if(plan.rulesVersion!==9){

      if((saved.rulesVersion||0)<3&&(id==='usa:1'||id==='usa:4'))delete plan.counts[id];
      else plan.counts[id]=Math.min(n,copyLimit(allowed.get(id)));
    }
  }
  if(oldTotal>NORMAL_DECK_SIZE&&(saved.rulesVersion>=9||oldTotal>45))return null;
  let total=Object.values(plan.counts).reduce((a,b)=>a+b,0),allies=pool.filter(c=>c.faction!==plan.main).reduce((n,c)=>n+(plan.counts[c.deckId]||0),0);
  for(const c of [...pool].reverse())while((plan.counts[c.deckId]||0)>0&&(total>NORMAL_DECK_SIZE||c.faction!==plan.main&&allies>12)){plan.counts[c.deckId]--;total--;if(c.faction!==plan.main)allies--;}
  if(plan.rulesVersion!==9&&(oldTotal===39||oldTotal===45||saved.rulesVersion!==2&&oldTotal===40)){
    let remaining=NORMAL_DECK_SIZE-Object.values(plan.counts).reduce((a,b)=>a+b,0);
    for(const c of [...planTemplates(presetDeck(plan.main,plan.ally)),...pool])while(remaining>0&&(c.faction===plan.main||allies<12)&&(plan.counts[c.deckId]||0)<copyLimit(c)){plan.counts[c.deckId]=(plan.counts[c.deckId]||0)+1;remaining--;if(c.faction!==plan.main)allies++;}
  }
  plan.hqId??=headquartersFor(plan.main)[0].id;plan.rulesVersion=9;
  return deckIssue(plan,false)?null:plan;
}
function planTemplates(plan){return catalog(plan.main,plan.ally).flatMap(c=>Array(plan.counts[c.deckId]||0).fill(c));}
let nextId = 0;
function card(template) {
  const printed={...template};delete printed.printed;
  return {...template,printed, id:'c'+(++nextId), kw:[...(template.kw || [])],
    baseA:template.a, baseH:template.h, max:template.h,
    sleeping:false, moved:false, attacked:false,attacks:0};
}
function shuffle(array, random = Math.random) {
  for (let i=array.length-1; i>0; i--) {
    const j=Math.floor(random()*(i+1));
    [array[i],array[j]]=[array[j],array[i]];
  }
  return array;
}
function makeDeck(faction, random,plan=null) {
  const templates=planTemplates(plan||presetDeck(faction));
  return shuffle(templates.map(card),random);
}
function player(faction,random,plan=null) {
  plan={...(plan||presetDeck(faction)),hqId:plan?.hqId||headquartersFor(faction)[0].id};
  return {faction,hqId:plan.hqId,ally:plan.ally||null,deckPlan:JSON.parse(JSON.stringify(plan)),deckSize:DECK_SIZE,hp:HEADQUARTERS[plan.hqId].hp,k:0,maxK:0,turns:0,fatigue:0,deck:makeDeck(faction,random,plan),
    hand:[],support:[],front:[],hqIndex:0,graveyard:[]};
}
function createGame(random=Math.random,faction='usa',plan=null,enemyPlan=null,{mulligan=false}={}) {
  plan??=presetDeck(faction);
  {const issue=deckIssue(plan);if(issue)throw new Error(issue);faction=plan.main;}
  enemyPlan??=opponentDeck(plan);
  if(enemyPlan){const issue=deckIssue(enemyPlan);if(issue)throw new Error(issue);}
  if(!MAIN_NATIONS.includes(faction))throw new Error('未知阵营');
  const s={turn:'p',round:1,over:false,winner:null,history:[],p:player(faction,random,plan),e:player(enemyPlan?.main||FACTIONS[faction].opponent,random,enemyPlan)};
  s.randomState=(Math.floor(random()*4294967296)>>>0)||0x6d2b79f5;
  draw(s,'p',5);draw(s,'e',5);
  s.opening=mulligan?{p:false,e:false}:null;
  if(!mulligan){s.p.turns=1;s.p.maxK=1;s.p.k=1;}
  return s;
}
function mulligan(s,side,ids=[]){
  if(!['p','e'].includes(side)||!s.opening||s.opening[side]||s.over)return {ok:false,error:'opening.closed',events:[]};
  const q=s[side];
  if(!Array.isArray(ids)||new Set(ids).size!==ids.length||ids.some(id=>!q.hand.some(c=>c.id===id))||ids.length>q.deck.length)return {ok:false,error:'opening.invalid',events:[]};
  const selected=new Set(ids),returned=q.hand.filter(c=>selected.has(c.id)),events=[];
  q.hand=q.hand.map(c=>{
    if(!selected.has(c.id))return c;
    const replacement=q.deck.shift();events.push({kind:'draw',side,id:replacement.id,amount:1});return replacement;
  });
  if(returned.length){q.deck.push(...returned);shuffle(q.deck,()=>randomIndex(s,4294967296)/4294967296);}
  s.opening[side]=true;
  if(s.opening.p&&s.opening.e){s.opening=null;s.p.turns=1;s.p.maxK=1;s.p.k=1;}
  return {ok:true,events};
}
function chooseMulligan(s,side){
  const hand=s[side].hand,kept=[],replace=[];
  for(const c of [...hand].sort((a,b)=>a.c-b.c)){
    const cheapUnit=c.t!=='order'&&c.c<=3;
    const removal=c.t==='order'&&c.fx==='strike'&&c.c<=3&&kept.some(u=>u.t!=='order');
    const curveUnit=c.t!=='order'&&c.c===4&&kept.filter(u=>u.t!=='order').length>=2;
    if((cheapUnit||removal||curveUnit)&&kept.filter(u=>u.key===c.key).length<2)kept.push(c);
    else replace.push(c.id);
  }
  return replace;
}
function loc(s,side,id) {
  for (const zone of ['support','front']) {
    const index=s[side][zone].findIndex(u=>u.id===id);
    if(index>=0)return {side,zone,index,u:s[side][zone][index]};
  }
  return null;
}
function row(s,side,zone) {
  const q=s[side],list=q[zone].map(u=>({side,zone,id:u.id,u}));
  if(zone==='support')list.splice(q.hqIndex,0,{side,zone,id:'hq',u:null});
  return list;
}
function target(s,side,id) {
  return id==='hq'?{side,zone:'support',id:'hq',u:null}:loc(s,side,id);
}
function guardSources(s,side,zone,id) {
  const list=row(s,side,zone),i=list.findIndex(x=>x.id===id);
  if(i<0||list[i].u&&effectiveKeywords(list[i].u,s).includes('guard'))return [];
  return [list[i-1],list[i+1]].filter(x=>x?.u?.h>0&&effectiveKeywords(x.u,s).includes('guard')).map(x=>x.u);
}
const ignoresGuard=u=>['artillery','bomber'].includes(u.t);
const longRange=u=>['artillery','fighter','bomber'].includes(u.t);
function interceptorSources(s,side,zone,id) {
  const d=target(s,side,id);
  if(!d || d.u?.t==='fighter')return [];
  return s[side][zone].filter(u=>u.t==='fighter'&&u.h>0);
}
function turnError(s,side) {
  if(s.over)return '本局已结束';
  if(s.opening)return 'opening.wait';
  if(s.turn!==side)return '还没有轮到你';
  return '';
}
const ground=u=>['infantry','tank','artillery'].includes(u.t);
const units=(s,side)=>[...s[side].support,...s[side].front];
function adjacent(s,side,zone,id){
  const list=row(s,side,zone),i=list.findIndex(x=>x.id===id);
  return [list[i-1],list[i+1]].filter(x=>x?.u&&x.u.h>0).map(x=>x.u);
}
function attackCount(u){return u.attacked?Math.max(1,u.attacks||0):0;}
function normalAction(u,kind){
  if(kind==='move')return !u.moved&&!u.attacked;
  return attackCount(u)<(u.fury||u.kw.includes('fury')?2:1)&&(!u.moved||u.t==='tank');
}
function operationCost(s,side,u,kind,options={}){
  if(!u)return 0;
  let cost=u.o+(u.opBonus||0)+(u.combatTurnOpBonus||0);
  if(kind==='attack'&&!u.suppressed&&u.key==='t72'&&!u.moved&&!u.attacked)cost=Math.max(0,cost-1);
  if(!normalAction(u,kind)&&(u.extraActions||0)>0)cost++;
  if(u.freeOperations||u.freeAction||(kind==='move'&&u.freeMove))cost=0;
  return Math.max(0,cost+(kind==='attack'&&options.boost&&!u.suppressed&&u.key==='t54a'?1:0));
}
function bomberBonus(s,u){
  if(!s||u.t!=='bomber')return 0;
  const side=['p','e'].find(side=>units(s,side).some(c=>c.id===u.id));
  return side?units(s,side).filter(c=>c.h>0&&c.id!==u.id).reduce((n,c)=>n+(c.bomberAttack||0),0):0;
}
function attackValue(u,defender=null,options={},s=null){
  return Math.max(0,u.a+bomberBonus(s,u)+(u.tempAttack||0)+(u.nextAttackBonus||0)+(ground(u)?s?.groundAttackPenalty||0:0)+(defender?.t==='tank'?u.antiTankAttack||0:0)+(!u.suppressed&&u.key==='t62'&&defender?.t==='tank'?2:0)+(options.boost&&!u.suppressed&&u.key==='t54a'?2:0));
}
function activityError(s,side,u,kind,options={}) {
  const err=turnError(s,side);
  if(err)return err;
  if(!u || u.h<=0)return '单位已不在战场';
  if(u.pinned)return 'Pinned units cannot move or attack.';
  if(u.sleeping)return '刚部署的单位需等待下一回合（闪击除外）';
  if(u.locked)return 'Concentrated Support: this unit cannot act this turn.';
  if(!normalAction(u,kind)&&!(u.extraActions>0))return '本回合已经行动';
  const cost=operationCost(s,side,u,kind,options);
  if(s[side].k<cost)return '行动需要 '+cost+' K，当前仅剩 '+s[side].k+' K';
  return '';
}
function attackError(s,side,id,targetId,options={}) {
  const a=loc(s,side,id),d=target(s,other(side),targetId);
  const err=activityError(s,side,a?.u,'attack',options);
  if(err)return err;
  if(!d)return '目标已不在战场';
  if(options.boost&&(a.u.key!=='t54a'||a.u.suppressed))return 'This unit has no paid attack ability.';
  if(d.u?.kw.includes('smokescreen'))return 'Smokescreen: this unit cannot be attacked until it moves or attacks.';
  if(attackValue(a.u,d.u,options,s)<=0)return '攻击力为 0，无法攻击';
  if(a.u.t==='bomber' && interceptorSources(s,d.side,d.zone,targetId).length)
    return '战斗机拦截：必须先攻击或消灭目标阵线上的战斗机';
  if(guardSources(s,d.side,d.zone,targetId).length && !ignoresGuard(a.u))
    return '目标受到同一阵线相邻守卫的保护';
  if(!longRange(a.u) && a.zone==='support' && d.zone!=='front')
    return '地面单位需进入前线才能攻击敌方后方；闪击不改变射程';
  return '';
}
function moveError(s,side,id) {
  const a=loc(s,side,id),err=activityError(s,side,a?.u,'move');
  if(err)return err;
  if(a.zone!=='support')return '单位已经位于前线';
  if(s[other(side)].front.length)return '先消灭敌方前线部队';
  if(s[side].front.length>=5)return '前线已满（最多 5 个单位）';
  return '';
}
function playBaseError(s,side,id,options={}) {
  const err=turnError(s,side);if(err)return err;
  const c=s[side].hand.find(x=>x.id===id);
  if(!c)return '这张牌已不在手牌中';
  if(options.boost&&c.key!=='t80')return 'This card has no paid deployment ability.';
  const cost=c.c+(options.boost?2:0);
  if(s[side].k<cost)return '部署需要 '+cost+' K，当前仅剩 '+s[side].k+' K';
  if(c.t!=='order' && s[side].support.length>=4)return '后方阵线已满（总部之外最多 4 个单位）';
  if(c.fx==='repair'&&!(s[side].graveyard||[]).some(t=>t.t==='tank'&&!t.elite))return 'No destroyed non-Elite tank to recover.';
  if(c.fx==='echelon'&&s[side].support.length>=4)return 'The support line must have a free unit slot.';
  return '';
}
function targetSteps(s,side,c){
  if(c.fx==='antiwar')return Array(Math.min(2,units(s,'p').concat(units(s,'e')).filter(u=>u.h>0).length)).fill('Choose a unit to retreat.');
  if(c.fx==='victoriousFebruary')return Array(Math.min(2,units(s,other(side)).filter(u=>u.h>0).length)).fill('Choose an enemy unit to gain +2 operation cost.');
  if(c.fx==='containment')return ['Choose an enemy unit.'];
  if(c.fx==='czechHedgehog')return ['Choose an enemy ground unit.'];
  if(c.fx==='longTelegram'&&units(s,side).some(u=>u.h>0&&u.t==='infantry'))return ['Choose a friendly infantry unit.'];
  if(c.deployRetreatInfantry&&['p','e'].some(who=>units(s,who).some(u=>u.t==='infantry'&&u.h>0)))return ['Choose an infantry unit to retreat.'];
  if(c.fx==='searchAndDestroy')return Array(Math.min(3,Math.max(0,4-s[side].support.length),s[side].hand.filter(ground).length)).fill('Choose a ground unit from your hand.');
  if(c.fx==='cia')return ['Choose a friendly frontline unit to retreat.'];
  if(c.fx==='interdiction')return units(s,side).some(u=>ground(u)&&u.h>0)?units(s,side).filter(u=>['fighter','bomber'].includes(u.t)&&u.h>0).map(()=> 'Choose a friendly ground unit to gain +1 attack.'):[];
  if(c.deployRepairInfantry&&units(s,side).some(u=>u.t==='infantry'&&u.h>0))return ['Choose a friendly infantry unit.'];
  if(c.deploySupportTarget)return ['Choose an enemy support-line target.'];
  if(c.deployDamage)return ['Choose an enemy target.'];
  if(c.fx==='workshop')return ['Choose a friendly unit to repair.'];
  if(c.fx==='rapid')return ['Choose a friendly ground unit.'];
  if(c.fx==='ammo')return ['Choose a friendly unit that has attacked this turn.'];
  if(c.fx==='support')return ['Choose the friendly unit that will stop acting this turn.','Choose a different friendly unit to protect from retaliation.'];
  if(c.fx==='echelon')return ['Choose a friendly frontline unit to withdraw.','Choose another friendly ground unit for Blitz and a free move.'];
  if(c.fx==='stavka')return ['Choose a friendly unit costing 6 K or more.'];
  return [];
}
function targetCandidates(s,side,c,picked=[]){
  if(picked.length>=targetSteps(s,side,c).length)return [];
  if(c.fx==='antiwar')return ['p','e'].flatMap(who=>units(s,who).filter(u=>u.h>0&&!picked.includes(u.id)).map(u=>u.id));
  if(['victoriousFebruary','czechHedgehog','containment'].includes(c.fx))return units(s,other(side)).filter(u=>u.h>0&&!picked.includes(u.id)&&(c.fx!=='czechHedgehog'||ground(u))).map(u=>u.id);
  if(c.deployRetreatInfantry)return ['p','e'].flatMap(who=>units(s,who).filter(u=>u.t==='infantry'&&u.h>0).map(u=>u.id));
  if(c.fx==='searchAndDestroy')return s[side].hand.filter(u=>ground(u)&&!picked.includes(u.id)).map(u=>u.id);
  if(c.deploySupportTarget)return [...s[other(side)].support.filter(u=>u.h>0).map(u=>u.id),'hq'];
  if(c.deployDamage)return [...units(s,other(side)).filter(u=>u.h>0).map(u=>u.id),'hq'];
  return units(s,side).filter(u=>(c.fx==='interdiction'||!picked.includes(u.id))&&u.h>0).filter(u=>{
    if(c.fx==='cia')return s[side].front.includes(u);
    if(c.fx==='interdiction')return ground(u);
    if(c.deployRepairInfantry||c.fx==='longTelegram')return u.t==='infantry';
    if(c.fx==='workshop')return true;
    if(c.fx==='rapid')return ground(u);
    if(c.fx==='ammo')return u.attacked;
    if(c.fx==='stavka')return u.c>=6;
    if(c.fx==='echelon')return picked.length?ground(u):s[side].front.includes(u)&&units(s,side).some(v=>v.id!==u.id&&ground(v));
    if(c.fx==='support')return picked.length>0||units(s,side).length>=2;
    return false;
  }).map(u=>u.id);
}
function playError(s,side,id,targetId,options={}){
  const err=playBaseError(s,side,id,options);if(err)return err;
  const c=s[side].hand.find(x=>x.id===id);
  if(c.choices&&!c.choices.includes(options.choice))return 'Choose an option.';
  if(c.fx==='strike'&&!loc(s,other(side),targetId))return '请选择一个敌方单位；此指令不能攻击总部';
  const picked=options.targets||[],steps=targetSteps(s,side,c);
  for(let i=0;i<(c.fx==='searchAndDestroy'?picked.length:steps.length);i++)if(!targetCandidates(s,side,c,picked.slice(0,i)).includes(picked[i]))return steps[i]||'Too many targets.';
  if(picked.length>steps.length)return 'Too many targets.';
  return '';
}
function removeFrom(s,side,zone,index) {
  const q=s[side],u=q[zone][index];
  if(zone==='support' && index<q.hqIndex)q.hqIndex--;
  q[zone].splice(index,1);
  return u;
}
function cleanup(s,events=[]) {

  for(;;){
    const dead=[];
    for(const side of [s.turn,other(s.turn)])for(const zone of ['support','front'])
      for(const u of [...s[side][zone]])if(u.h<=0){
        removeFrom(s,side,zone,s[side][zone].indexOf(u));
        (s[side].graveyard??=[]).push({...u.printed,kw:[...(u.printed?.kw||[])]});
        dead.push({side,u});events.push({kind:'destroy',side,id:u.id,name:u.n});
      }
    if(!dead.length)break;
    for(const {side,u} of dead){
      if(u.destruction==='drawTank'){
        effect(side,u,'Destruction: draw a tank.',events);drawType(s,side,'tank',events);
      }
      if(u.destruction==='destroyKiller'){
        const killer=u.destroyedBy&&loc(s,u.destroyedBy.side,u.destroyedBy.id)?.u;
        if(killer?.h>0){killer.h=0;killer.destroyedBy={side,id:u.id};effect(side,u,'Destruction: destroy the killer.',events);}
      }
      if(u.destruction==='damageHQ'){
        s[other(side)].hp-=u.destructionDamage;
        events.push({kind:'damage',side:other(side),id:'hq',amount:u.destructionDamage,reason:'destruction'});
      }
      if(u.destruction==='generate')generateCard(s,side,u.destructionCard,events);
      for(const watcher of units(s,side))if(watcher.h>0&&watcher.veteranTrigger==='friendlyDestroyed')promoteVeteran(s,side,watcher,events);
      if(u.t==='tank')for(const watcher of [...units(s,side)])if(watcher.h>0&&watcher.friendlyTankFight){
        const pool=s[other(side)].front.filter(v=>v.h>0);if(pool.length)resolveCombat(s,side,{id:watcher.id,target:pool[randomIndex(s,pool.length)].id},events,true);
      }
    }
  }
}
function retreat(s,side,id,events=[]){
  const a=loc(s,side,id);if(!a||a.u.h<=0)return;
  const q=s[side],u=a.u;let to=a.zone==='front'?'support':'hand';
  if(to==='support'?q.support.filter(c=>c.h>0).length>=4:handCount(q)>=9){
    u.h=0;delete u.destroyedBy;to='destroyed';
  }else{
    removeFrom(s,side,a.zone,a.index);
    if(to==='support')q.support.push(u);
    else q.hand.push({...card(u.printed),id:u.id});
  }
  events.push({kind:'retreat',side,id,name:u.n,to});
  for(const who of ['p','e'])for(const watcher of units(s,who))if(watcher.h>0&&watcher.retreatGrowth){
    const amount=Number(watcher.retreatGrowth);watcher.a+=amount;watcher.h+=amount;watcher.max+=amount;events.push({kind:'buff',side:who,id:watcher.id,amount,reason:'retreat',triggerId:id});
  }
}

function publicSnapshot(s){
  const result={turn:s.turn,round:s.round,over:s.over,winner:s.winner,winReason:s.winReason};
  for(const side of ['p','e']){
    const q=s[side];
    result[side]={faction:q.faction,hqId:q.hqId,hp:q.hp,k:q.k,maxK:q.maxK,handCount:q.hand.length,deckCount:q.deck.length};
    for(const zone of ['support','front'])result[side][zone]=row(s,side,zone).map(x=>
      x.id==='hq'?{id:'hq',n:headquarters(q).city+'总部',h:q.hp,t:'hq'}:
      {id:x.u.id,n:x.u.n,a:attackValue(x.u,null,{},s),h:x.u.h,t:x.u.t,o:operationCost(s,side,x.u,'attack'),status:unitStatus(x.u)});
  }
  return result;
}
function describeAction(s,side,action){
  const q=s[side],enemy=other(side),c=action.type==='play'?q.hand.find(c=>c.id===action.id):loc(s,side,action.id)?.u;
  const targetName=action.target==='hq'?headquarters(s[enemy]).city+'总部':loc(s,enemy,action.target)?.u.n;
  if(action.type==='attack')return c.n+' → '+targetName;
  if(action.type==='move')return c.n+' 推进前线';
  if(action.type==='end')return '结束回合';
  const friends=(action.targets||[]).map(id=>id==='hq'?headquarters(s[enemy]).city+'总部':loc(s,side,id)?.u.n||loc(s,enemy,id)?.u.n||q.hand.find(u=>u.id===id)?.n).filter(Boolean);
  return (c.t==='order'?'使用指令 ':'部署 ')+c.n+(targetName?' → '+targetName:friends.length?' → '+friends.join(' / '):'')+(action.boost?' [Boost]':'');
}
function unitStatus(u){
  const opBonus=(u.opBonus||0)+(u.combatTurnOpBonus||0);
  return [u.pinned?'Pinned.':null,u.kw.includes('ambush')?(u.ambushUsed?'Ambush used this round':'Ambush ready'):null,
    u.fury?'Fury':null,u.locked?'Cannot act this turn':null,u.noCounter?'No retaliation on next attack':null,
    u.extraActions?'Extra actions: '+u.extraActions:null,u.freeOperations?'Operations cost 0 this turn.':null,u.freeAction?'Next action: 0 K':null,u.freeMove?'Next move: 0 K':null,
    u.tempAttack?'Attack +'+u.tempAttack+' this turn':null,u.nextAttackBonus?'Next attack +'+u.nextAttackBonus:null,
    opBonus?'Operations '+(opBonus>0?'+':'')+opBonus+' this turn':null,u.stavka?'Stavka: draw on kill this turn':null,u.tempBlitz?'Blitz this turn':null].filter(Boolean);
}
function effect(side,u,text,events){const event={kind:'effect',side,id:u.id,name:u.n,text};events.push(event);return event;}
function healUnit(side,u,amount,events){
  if(!u||u.h<=0)return;
  const healed=Math.max(0,Math.min(amount,u.max-u.h));u.h+=healed;
  if(healed)events.push({kind:'heal',side,id:u.id,name:u.n,amount:healed});
}
function enterFront(s,side,u,events){
  if(u.veteranTrigger==='supportedFront'&&s[side].front.some(v=>v.id!==u.id&&v.h>0))promoteVeteran(s,side,u,events);
  if(!u.suppressed&&u.key==='pt76'){draw(s,side,1,false,events);u.opBonus=(u.opBonus||0)+1;effect(side,u,'Reconnaissance: operations +1 this turn.',events);}
  if(!u.enteredFront&&u.firstFrontDraw)draw(s,side,u.firstFrontDraw,false,events);
  if(!u.enteredFront&&u.firstFrontAttack){u.tempAttack=(u.tempAttack||0)+u.firstFrontAttack;effect(side,u,'Forward assault: +1 attack this turn.',events);}
  u.enteredFront=true;
}
function consumeAction(s,side,u,kind,options){
  s[side].k-=operationCost(s,side,u,kind,options);
  if(!normalAction(u,kind))u.extraActions--;
  if(u.freeAction)u.freeAction=false;
  if(kind==='move'){u.moved=true;u.freeMove=false;}
  else{u.attacks=attackCount(u)+1;u.attacked=true;}
  if(u.kw.includes('smokescreen')){u.kw=u.kw.filter(k=>k!=='smokescreen');u.smokescreenUsed=true;}
}
function restoreHandCost(c){if(c.handTurnDiscount){c.c+=c.handTurnDiscount;delete c.handTurnDiscount;}}
function expireTurn(s,side){
  delete s.groundAttackPenalty;
  for(const c of s[side].hand)restoreHandCost(c);
  for(const who of ['p','e'])for(const u of units(s,who))delete u.combatTurnOpBonus;
  if(side==='e')for(const who of ['p','e'])for(const u of units(s,who))if(u.untilRoundEnd){u.a-=u.untilRoundEnd;u.max-=u.untilRoundEnd;u.h=Math.min(u.h,u.max);delete u.untilRoundEnd;}
  for(const u of units(s,side)){
    if(u.pinned&&(s[side].turns||0)>=u.pinnedUntilTurn){delete u.pinned;delete u.pinnedUntilTurn;}
    const expired=[...(u.tempBlitz?['blitz']:[]),...(u.fury?['fury']:[])];
    if(expired.length)u.spentKeywords=[...new Set([...(u.spentKeywords||[]),...expired])];
    for(const key of ['tempAttack','opBonus','extraActions','fury','locked','freeAction','freeOperations','freeMove','stavka','tempBlitz'])delete u[key];
  }
}
function drawType(s,side,type,events){
  const q=s[side],i=q.deck.findIndex(c=>type==='air'?['fighter','bomber'].includes(c.t):c.t===type);
  if(i<0)return;
  const c=q.deck.splice(i,1)[0];
  if(handCount(q)<9){q.hand.push(c);events.push({kind:'draw',side,id:c.id,amount:1});}
  else events.push({kind:'burn',side,id:c.id,fromDeck:true});
}
function drawOrder(s,side,events){drawType(s,side,'order',events);}
function checkEnd(s) {
  if(s.p.hp<=0 || s.e.hp<=0) {
    s.over=true;
    s.winner=s.p.hp<=0 && s.e.hp<=0?'draw':s.p.hp<=0?'e':'p';
  }
}
function draw(s,side,n=1,atTurnStart=false,events=[]) {
  const q=s[side];
  for(let i=0;i<n && !s.over;i++) {
    if(!q.deck.length) {
      if(atTurnStart || q.fatigue===0)q.fatigue++;
      const damage=q.fatigue;
      q.hp-=damage;events.push({kind:'damage',side,id:'hq',amount:damage,reason:'fatigue'});
    } else {
      const c=q.deck.shift();
      if(handCount(q)<9){q.hand.push(c);events.push({kind:'draw',side,id:c.id,amount:1});}
      else events.push({kind:'burn',side,id:c.id,fromDeck:true});
    }
    checkEnd(s);
  }
}
function promoteVeteran(s,side,u,events=[]){
    if(u.h<=0||u.veteran||u.suppressed||!u.veteranForm)return;
    const form=u.veteranForm,attackBonus=u.a-u.baseA,healthBonus=u.max-u.baseH;
    u.veteranBase={...u.printed,kw:[...(u.printed.kw||[])]};
    const gained=u.kw.filter(k=>!(u.printed.kw||[]).includes(k)),spentSmoke=u.smokescreenUsed;

    Object.assign(u,form,{veteran:true,kw:[...new Set([...form.kw,...gained])].filter(k=>k!=='smokescreen'||!spentSmoke),baseA:form.a,baseH:form.h,
      a:form.a+attackBonus,h:form.h+healthBonus,max:form.h+healthBonus});
    u.printed={...u.printed,...form,kw:[...form.kw],veteran:true};
    effect(side,u,'Promoted to Veteran.',events).transition='veteran';
    if(u.veteranReward){
      const reward=card(GENERATED_CARDS[u.veteranReward]);
      if(handCount(s[side])<9){s[side].hand.push(reward);events.push({kind:'generate',side,id:reward.id,name:reward.n});}
      else events.push({kind:'burn',side});
    }
    if(u.veteranResurrect&&s[side].support.filter(c=>c.h>0).length<4){
      const template=[...(s[side].graveyard||[])].reverse().find(ground);
      if(template){const restored=card(template);restored.sleeping=!restored.kw.includes('blitz');s[side].support.push(restored);events.push({kind:'spawn',side,id:restored.id,name:restored.n});}
    }
}
function readyUnits(s,side,events=[]) {
  for(const u of units(s,side)){
    if(u.untilNextTurn){const amount=u.untilNextTurn;u.a-=amount;u.max-=amount;u.h=Math.min(u.h,u.max);delete u.untilNextTurn;}
    u.sleeping=false;u.attacked=false;u.attacks=0;u.moved=false;u.ambushUsed=false;
    u.turnsOnBoard=(u.turnsOnBoard||0)+1;
    if(u.veteranForm&&!u.veteran&&!u.suppressed&&!u.veteranTrigger&&u.turnsOnBoard>=(u.veteranTurns||1))promoteVeteran(s,side,u,events);
  }
}
function beginTurn(s,side,events=[]) {
  s.turn=side;
  const q=s[side];q.turns++;s.round=q.turns;
  q.maxK=Math.min(12,q.maxK+1);q.k=q.maxK;
  if(q.pendingKredits){q.k+=q.pendingKredits;events.push({kind:'kredits',side,amount:q.pendingKredits});q.pendingKredits=0;}
  readyUnits(s,side,events);
  draw(s,side,1,true,events);
}
function generateCard(s,side,key,events){
  const template=GENERATED_CARDS[key]||Object.values(FACTIONS).flatMap(f=>LIB[f.library]).find(c=>c.key===key);
  if(!template)return;const c=card(template);
  if(handCount(s[side])<9){s[side].hand.push(c);events.push({kind:'generate',side,id:c.id,name:c.n});}
  else events.push({kind:'burn',side});
}
function randomIndex(s,length){
  let x=s.randomState||0x6d2b79f5;x^=x<<13;x^=x>>>17;x^=x<<5;s.randomState=x>>>0;
  return Math.floor(s.randomState/4294967296*length);
}
const COMBAT_KEYWORDS=['ambush','blitz','fury','guard','heavyArmor','shock','smokescreen'];
function armorValue(u,s=null){
 const side=s&&['p','e'].find(side=>units(s,side).some(c=>c.id===u.id));
 const aura=side&&u.t==='tank'?Math.max(0,...units(s,side).filter(c=>c.h>0).map(c=>c.tankArmor||0)):0;
 return Math.max(u.kw?.includes('heavyArmor')?u.armor||0:0,aura);
}
function bomberGuard(s,u){return !!(s&&u.t==='bomber'&&['p','e'].some(side=>units(s,side).some(c=>c.id===u.id)&&units(s,side).some(c=>c.id!==u.id&&c.h>0&&c.bomberGuard)));}
function effectiveKeywords(u,s=null){return [...new Set([...(u.kw||[]),...(bomberGuard(s,u)?['guard']:[]),...(u.tempBlitz?['blitz']:[]),...(u.fury?['fury']:[]),...(armorValue(u,s)?['heavyArmor']:[])])];}
function hasCombatKeyword(u,s=null){return effectiveKeywords(u,s).some(k=>COMBAT_KEYWORDS.includes(k)&&!(k==='ambush'&&u.ambushUsed));}
function pin(s,side,u,events=[]){
 if(!u||u.h<=0)return;
 u.pinned=true;u.pinnedUntilTurn=Math.max(u.pinnedUntilTurn||0,(s[side].turns||0)+1);
 effect(side,u,'Pinned.',events);
}
function suppress(s,side,u,events=[]){
 if(!u||u.h<=0)return;
 const icons=[...new Set([...(u.suppressedIcons||[]),...(u.spentKeywords||[]),...effectiveKeywords(u,s),...(u.shockUsed?['shock']:[]),...(u.smokescreenUsed?['smokescreen']:[]),...(u.destruction?['destruction']:[])])];
 const keep=new Set(['id','key','deckId','n','zh','faction','t','c','o','a','h','baseA','baseH','max','printed','rarity','elite','art','deploySfx','veteran','veteranBase','sleeping','moved','attacked','attacks','turnsOnBoard','pinned','pinnedUntilTurn']);
 for(const key of Object.keys(u))if(!keep.has(key))delete u[key];
 Object.assign(u,{kw:[],a:u.baseA,max:u.baseH,h:u.baseH,c:u.printed.c,o:u.printed.o,suppressed:true,suppressedIcons:icons});
 effect(side,u,'Suppressed.',events);
}
function loseKreditSlots(s,side,amount,events){
  const q=s[side],lost=Math.min(q.maxK,amount);q.maxK-=lost;q.k=Math.min(q.k,q.maxK);
  if(lost)events.push({kind:'kreditSlots',side,amount:-lost});
}
function doPlay(s,side,action,events) {
  const q=s[side],index=q.hand.findIndex(c=>c.id===action.id),c=q.hand[index];
  q.k-=c.c+(action.boost?2:0);q.hand.splice(index,1);restoreHandCost(c);
  const picked=(action.targets||[]).map(id=>loc(s,side,id)?.u||loc(s,other(side),id)?.u);
  if(c.t!=='order') {
    const gap=Number.isInteger(action.gap)?Math.max(0,Math.min(q.support.length+1,action.gap)):q.hqIndex;
    const insertIndex=gap<=q.hqIndex?gap:gap-1;
    if(gap<=q.hqIndex)q.hqIndex++;
    c.sleeping=!c.kw.includes('blitz');c.attacked=false;c.moved=false;
    q.support.splice(insertIndex,0,c);
    events.push({kind:'deploy',side,id:c.id,name:c.n});
    if(c.deployTankGuard&&units(s,side).some(u=>u.t==='tank'&&u.h>0)){
      if(!c.kw.includes('guard'))c.kw.push('guard');c.a++;c.h++;c.max++;events.push({kind:'buff',side,id:c.id,amount:1});
    }
    if(c.deployRetreatInfantry&&action.targets?.length){const id=action.targets[0],who=loc(s,side,id)?side:other(side);retreat(s,who,id,events);}
    if(c.deployRepairInfantry&&picked[0]){healUnit(side,picked[0],picked[0].max,events);if(!picked[0].kw.includes('shock'))picked[0].kw.push('shock');picked[0].shockUsed=false;effect(side,picked[0],'Gained Shock.',events);}
    if(c.deploySpawn&&q.support.length<4){
      const spawned=card(LIB.p.find(t=>t.key===c.deploySpawn));spawned.sleeping=!spawned.kw.includes('blitz');
      q.support.push(spawned);events.push({kind:'spawn',side,id:spawned.id,name:spawned.n});
    }
    if(c.deployTempOperation)c.opBonus=(c.opBonus||0)+c.deployTempOperation;
    if(c.deployOtherAirDiscount&&['p','e'].some(who=>units(s,who).some(u=>u.id!==c.id&&u.h>0&&['fighter','bomber'].includes(u.t))))c.o=Math.max(0,c.o-1);
    if(c.deployGenerate)generateCard(s,side,c.deployGenerate,events);
    if(c.deployDamage){
      const id=action.targets[0],enemy=other(side);
      if(id==='hq')s[enemy].hp-=c.deployDamage;
      else {const victim=loc(s,enemy,id).u;victim.h-=c.deployDamage;if(victim.h<=0)victim.destroyedBy={side,id:c.id};}
      events.push({kind:'damage',side:enemy,id,amount:c.deployDamage});
    }
    if(c.deployFront&&!s[other(side)].front.length&&q.front.length<5){const at=loc(s,side,c.id);removeFrom(s,side,at.zone,at.index);q.front.push(c);events.push({kind:'move',side,id:c.id});enterFront(s,side,c,events);}
    if(c.deployHQHeal){q.hp+=c.deployHQHeal;events.push({kind:'heal',side,id:'hq',amount:c.deployHQHeal});}
    if(c.deployTankHeal)for(const u of units(s,side).filter(u=>u.id!==c.id&&u.t==='tank'))healUnit(side,u,c.deployTankHeal,events);
    if(c.deployAirAttack)for(const u of units(s,side).filter(u=>['fighter','bomber'].includes(u.t))){u.tempAttack=(u.tempAttack||0)+c.deployAirAttack;effect(side,u,'Air superiority: +1 attack this turn.',events);}
    if(c.deployDrawFront&&q.front.length)draw(s,side,c.deployDrawFront,false,events);
    if(c.deployDrawInfantry&&units(s,side).some(u=>u.t==='infantry'))draw(s,side,c.deployDrawInfantry,false,events);
    if(c.deployCounterBlitz&&s[other(side)].front.length){c.kw.push('blitz');c.sleeping=false;effect(side,c,'Counteroffensive: gained Blitz.',events);}
    if(c.key==='t80'&&action.boost){c.fury=true;effect(side,c,'Fury this turn (+2 K).',events);}
    if(c.t==='fighter')for(const watcher of units(s,side).filter(u=>u.h>0&&u.fighterDeployCopy)){
      if(q.support.filter(u=>u.h>0).length>=4)break;
      const copy=card(watcher.printed);suppress(s,side,copy,events);copy.sleeping=true;
      q.support.push(copy);events.push({kind:'spawn',side,id:copy.id,name:copy.n,sourceId:watcher.id});
    }
  } else if(c.fx==='strike') {
    const d=loc(s,other(side),action.target);
    d.u.h-=4;events.push({kind:'damage',side:d.side,id:d.u.id,amount:4});
  } else if(c.fx==='heal') {
    const healed=4;q.hp+=healed;
    events.push({kind:'heal',side,id:'hq',amount:healed});
  } else if(c.fx==='draw') {
    draw(s,side,2,false,events);
  } else if(c.fx==='buff') {
    for(const u of [...q.support,...q.front]) {
      u.a++;u.h++;u.max++;events.push({kind:'buff',side,id:u.id,amount:1});
    }
  } else if(c.fx==='nato'){
    for(const u of units(s,side).filter(u=>u.h>0)){
      healUnit(side,u,u.max,events);u.h+=2;u.max+=2;events.push({kind:'buff',side,id:u.id,amount:2,defenseOnly:true});
    }
  } else if(c.fx==='marshall'){
    loseKreditSlots(s,side,1,events);
    if(action.choice==='draw')draw(s,side,3,false,events);else q.pendingKredits=(q.pendingKredits||0)+3;
    effect(side,c,action.choice==='draw'?'choice.draw':'choice.kredits',events);
  } else if(c.fx==='cia'){
    retreat(s,side,picked[0].id,events);
    const enemy=other(side),pool=s[enemy].support.filter(u=>u.h>0);
    if(pool.length){const u=pool[randomIndex(s,pool.length)],amount=hasCombatKeyword(u,s)?4:2;u.h-=amount;events.push({kind:'damage',side:enemy,id:u.id,amount});}
  } else if(c.fx==='interdiction'){
    loseKreditSlots(s,other(side),1,events);
    for(const u of picked){u.a++;effect(side,u,'Attack +1.',events);}
  } else if(c.fx==='searchAndDestroy'){
    for(const id of action.targets||[]){
      const u=q.hand.splice(q.hand.findIndex(u=>u.id===id),1)[0];restoreHandCost(u);
      if(!u.kw.includes('blitz'))u.kw.push('blitz');
      u.sleeping=false;u.attacked=false;u.attacks=0;u.moved=false;u.opBonus=(u.opBonus||0)-1;
      q.support.push(u);events.push({kind:'spawn',side,id:u.id,name:u.n});
    }
  } else if(c.fx==='retreatFront'){
    for(const who of [side,other(side)])for(const u of [...s[who].front])retreat(s,who,u.id,events);
  } else if(c.fx==='rollingThunder'){
    const pool=['p','e'].flatMap(who=>s[who].support.filter(u=>u.h>0).map(u=>({who,u})));
    const count=Math.min(pool.length,1+randomIndex(s,3));
    for(let i=0;i<count;i++){const {who,u}=pool.splice(randomIndex(s,pool.length),1)[0];u.h=0;delete u.destroyedBy;}
  } else if(c.fx==='closedCity'){
    const pool=['p','e'].flatMap(who=>s[who].front.filter(u=>u.h>0&&ground(u)).map(u=>({who,u})));
    for(let i=0,n=Math.min(2,pool.length);i<n;i++){const {who,u}=pool.splice(randomIndex(s,pool.length),1)[0];pin(s,who,u,events);}
  } else if(c.fx==='fightingGirlfriend'){
    for(const u of units(s,side).filter(u=>u.h>0&&ground(u))){u.a+=2;u.h+=2;u.max+=2;u.untilRoundEnd=(u.untilRoundEnd||0)+2;events.push({kind:'buff',side,id:u.id,amount:2});}
  } else if(c.fx==='antiwar'){
    for(const u of picked)retreat(s,loc(s,side,u.id)?side:other(side),u.id,events);
  } else if(c.fx==='kadena'){
    drawType(s,side,'air',events);
  } else if(c.fx==='longTelegram'){
    draw(s,side,1,false,events);if(picked[0]){picked[0].a=picked[0].h-(picked[0].tempAttack||0);effect(side,picked[0],'Attack equals defense.',events);}
  } else if(c.fx==='victoriousFebruary'){
    draw(s,side,2,false,events);for(const u of picked){u.o+=2;effect(other(side),u,'Gain +2 operation cost.',events);}
  } else if(c.fx==='czechHedgehog'){
    const u=picked[0];pin(s,other(side),u,events);if(u.t==='tank'&&u.c<=3){u.h=0;delete u.destroyedBy;}
  } else if(c.fx==='thoseDays'){
    q.hp-=4;events.push({kind:'damage',side,id:'hq',amount:4});for(const u of q.hand.filter(ground)){const discount=Math.min(2,u.c);u.c-=discount;u.handTurnDiscount=(u.handTurnDiscount||0)+discount;}
  } else if(c.fx==='containment'){
    const enemy=other(side),u=picked[0],at=loc(s,enemy,u.id),list=row(s,enemy,at.zone),index=list.findIndex(t=>t.id===u.id),neighbors=[list[index-1],list[index+1]].filter(Boolean);
    suppress(s,enemy,u,events);for(const t of neighbors){if(t.id==='hq')s[enemy].hp-=2;else t.u.h-=2;events.push({kind:'damage',side:enemy,id:t.id,amount:2});}
  } else if(c.fx==='limitedWar'){
    s.groundAttackPenalty=(s.groundAttackPenalty||0)-2;effect(side,c,'Ground units have -2 attack this turn.',events);
  } else if(c.fx==='brettonWoods'){
    q.pendingKredits=(q.pendingKredits||0)+2;effect(side,c,'Gain 2 Kredits at the start of your next turn.',events);
  } else if(c.fx==='workshop'){
    healUnit(side,picked[0],3,events);draw(s,side,1,false,events);
  } else if(c.fx==='rapid'){
    picked[0].tempBlitz=true;picked[0].sleeping=false;picked[0].freeMove=true;effect(side,picked[0],'Rapid Redeployment: Blitz and next move costs 0 K this turn.',events);
  } else if(c.fx==='airbuff'){
    for(const u of units(s,side).filter(u=>['fighter','bomber'].includes(u.t))){u.a++;u.h++;u.max++;events.push({kind:'buff',side,id:u.id,amount:1});}
  } else if(c.fx==='relief'){
    q.hp+=4;events.push({kind:'heal',side,id:'hq',amount:4});for(const u of units(s,side).filter(u=>u.t==='infantry'))healUnit(side,u,1,events);
  } else if(c.fx==='assault'){
    for(const u of units(s,side).filter(ground)){u.tempAttack=(u.tempAttack||0)+2;effect(side,u,'Coordinated Assault: +2 attack this turn.',events);}
  } else if(c.fx==='ammo'){
    picked[0].extraActions=(picked[0].extraActions||0)+1;effect(side,picked[0],'Reserve Ammunition: one extra action this turn; extra action costs +1 K.',events);
  } else if(c.fx==='repair'){
    const template=[...q.graveyard].reverse().find(t=>t.t==='tank'&&!t.elite);
    const recovered=card({...template,c:template.c+1});q.hand.push(recovered);
    events.push({kind:'recover',side,name:recovered.n,amount:recovered.c});
  } else if(c.fx==='support'){
    picked[0].locked=true;picked[1].noCounter=true;
    effect(side,picked[0],'Concentrated Support: cannot act this turn.',events);
    effect(side,picked[1],'Concentrated Support: no retaliation on next attack.',events);
  } else if(c.fx==='echelon'){
    retreat(s,side,picked[0].id,events);
    picked[1].tempBlitz=true;picked[1].sleeping=false;picked[1].freeMove=true;
    effect(side,picked[1],'Second Echelon: Blitz and next move costs 0 K this turn.',events);
  } else if(c.fx==='stavka'){
    healUnit(side,picked[0],picked[0].max,events);picked[0].freeAction=true;picked[0].stavka=true;
    effect(side,picked[0],'Stavka: next action costs 0 K; draw a card on each kill this turn.',events);
  }
}
function resolveCombat(s,side,action,events,forced=false){
    const a=loc(s,side,action.id),d=target(s,other(side),action.target),damage=attackValue(a.u,d.u,action,s);
    const casualties=[];
    const hurt=(victim,vside,amount,killer,kside)=>{
      amount=combatDamage(amount,victim,s);
      const wasAlive=victim.h>0;victim.h-=amount;
      if(amount)events.push({kind:'damage',side:vside,id:victim.id,name:victim.n,amount});
      if(wasAlive&&victim.h<=0){victim.destroyedBy={side:kside,id:killer.id};casualties.push({killer,kside,victim});}
    };
    if(!forced)consumeAction(s,side,a.u,'attack',action);
    else {if(a.u.kw.includes('smokescreen')){a.u.kw=a.u.kw.filter(k=>k!=='smokescreen');a.u.smokescreenUsed=true;}events.push({kind:'battle',side,id:a.u.id,target:action.target,targetSide:d.side});}
    if(action.boost)effect(side,a.u,'Full Firepower: +2 attack for this attack (+1 K).',events);
    if((!a.u.suppressed&&a.u.key==='grad'||a.u.splash)&&d.zone==='front'){
      for(const neighbor of adjacent(s,d.side,d.zone,action.target))hurt(neighbor,d.side,1,a.u,side);
    }
    if(d.id==='hq')s[d.side].hp-=damage;
    else {
      const counter=retaliation(a.u,d.u,s);
      if(d.u.kw.includes('ambush')&&!d.u.ambushUsed){
        d.u.ambushUsed=true;
        effect(d.side,d.u,'Ambush used this round',events);
        hurt(a.u,side,counter,d.u,d.side);
        if(a.u.h>0)hurt(d.u,d.side,damage,a.u,side);
      }else{
        hurt(d.u,d.side,damage,a.u,side);hurt(a.u,side,counter,d.u,d.side);
      }
    }
    if(d.id==='hq')events.push({kind:'damage',side:d.side,id:'hq',amount:damage});
    else if(a.u.kw.includes('shock')){a.u.kw=a.u.kw.filter(k=>k!=='shock');a.u.shockUsed=true;if(a.u.h>0&&a.u.afterShockSmoke){if(!a.u.kw.includes('smokescreen'))a.u.kw.push('smokescreen');a.u.smokescreenUsed=false;effect(side,a.u,'Gained Smokescreen.',events);}}
    a.u.nextAttackBonus=0;a.u.noCounter=false;
    for(const {killer,kside,victim} of casualties){
      if(killer.killArmorLoss){killer.armor=Math.max(0,(killer.armor||0)-killer.killArmorLoss);if(!killer.armor){killer.kw=killer.kw.filter(k=>k!=='heavyArmor');killer.spentKeywords=[...new Set([...(killer.spentKeywords||[]),'heavyArmor'])];}effect(kside,killer,'Lost 1 Heavy Armor.',events);}
      if(killer.killDraw)draw(s,kside,killer.killDraw,false,events);
      if(killer===a.u&&!a.u.suppressed&&a.u.key==='t62'&&victim===d.u)healUnit(side,a.u,1,events);
      if(killer.stavka&&kside===s.turn)draw(s,kside,1,false,events);
    }
    if(d.u)for(const [u,who] of [[a.u,side],[d.u,d.side]])if(u.h>0&&u.combatDiscardOrder){const enemy=other(who),orders=s[enemy].hand.filter(c=>c.t==='order');if(orders.length){const card=orders[randomIndex(s,orders.length)];s[enemy].hand.splice(s[enemy].hand.indexOf(card),1);events.push({kind:'discard',side:enemy,id:card.id,name:card.n});}}
    if(d.u)for(const [u,who] of [[a.u,side],[d.u,d.side]])if(u.h>0&&u.combatOperationDiscount){u.combatTurnOpBonus=(u.combatTurnOpBonus||0)-u.combatOperationDiscount;effect(who,u,'Gain -1 operation cost this turn.',events);}
}
function act(s,side,action,{record=true}={}) {
  let error=turnError(s,side);
  if(!error) {
    if(action.type==='play')error=playError(s,side,action.id,action.target,action);
    else if(action.type==='move')error=moveError(s,side,action.id);
    else if(action.type==='attack')error=attackError(s,side,action.id,action.target,action);
    else if(action.type!=='end')error='未知操作';
  }
  if(error)return {ok:false,error,events:[]};
  const before=record?publicSnapshot(s):null,summary=record?describeAction(s,side,action):'',round=s.round;
  const source=action.type==='play'?s[side].hand.find(c=>c.id===action.id):loc(s,side,action.id)?.u;
  const cost=action.type==='end'?0:action.type==='play'?source.c+(action.boost?2:0):operationCost(s,side,source,action.type,action);
  const events=[];
  if(action.type==='play')doPlay(s,side,action,events);
  if(action.type==='move') {
    const a=loc(s,side,action.id),u=a.u;
    consumeAction(s,side,u,'move',action);removeFrom(s,side,'support',a.index);
    const gap=Number.isInteger(action.gap)?Math.max(0,Math.min(s[side].front.length,action.gap)):s[side].front.length;
    s[side].front.splice(gap,0,u);events.push({kind:'move',side,id:u.id});
    enterFront(s,side,u,events);
  }
  if(action.type==='attack')resolveCombat(s,side,action,events);
  if(['move','attack'].includes(action.type)&&source?.h>0&&['fighter','bomber'].includes(source.t))for(const watcher of units(s,other(side)).filter(u=>u.h>0&&u.enemyAirOperationDamage)){if(source.h<=0)break;source.h-=watcher.enemyAirOperationDamage;if(source.h<=0)source.destroyedBy={side:other(side),id:watcher.id};events.push({kind:'damage',side,id:source.id,amount:watcher.enemyAirOperationDamage});}
  cleanup(s,events);checkEnd(s);
  if(action.type==='end'&&!s.over){expireTurn(s,side);beginTurn(s,other(side),events);}
  if(record){if(!s.history)s.history=[];
  s.history.push({step:s.history.length+1,round,side,faction:s[side].faction,type:action.type,
    summary,cost,events:events.map(e=>({...e})),before,after:publicSnapshot(s)});
  }
  return {ok:true,error:'',events};
}
const combatDamage=(amount,defender,s=null)=>Math.max(0,amount-(defender?armorValue(defender,s):0));
function retaliation(attacker,defender,s=null) {
  if(attacker.noCounter||attacker.kw.includes('shock'))return 0;
  if(defender.t==='bomber')return 0;
  if(attacker.t==='artillery')return 0;
  if(attacker.t==='bomber' && defender.t!=='fighter')return 0;
  return attackValue(defender,attacker,{},s);
}
function legalAttacks(s,side,id) {
  return [...s[other(side)].support,...s[other(side)].front].map(u=>u.id).concat('hq')
    .filter(targetId=>!attackError(s,side,id,targetId));
}
function playActions(s,side,c){
  if(playBaseError(s,side,c.id))return [];
  if(c.fx==='strike')return units(s,other(side)).map(u=>({type:'play',id:c.id,target:u.id}));
  let paths=[[]],optional=[[]];
  for(let i=0;i<targetSteps(s,side,c).length;i++){
    paths=paths.flatMap(p=>targetCandidates(s,side,c,p).filter(id=>!p.length||!['searchAndDestroy','interdiction','antiwar','victoriousFebruary'].includes(c.fx)||id>=p[p.length-1]).map(id=>[...p,id]));
    if(c.fx==='searchAndDestroy')optional.push(...paths);
  }
  if(c.fx==='searchAndDestroy')paths=optional;
  return paths.flatMap(targets=>{
    const base={type:'play',id:c.id,targets,gap:s[side].hqIndex};
    if(c.choices)return c.choices.map(choice=>({...base,choice}));
    return c.key==='t80'&&!playBaseError(s,side,c.id,{boost:true})?[base,{...base,boost:true}]:[base];
  }).filter(a=>!playError(s,side,c.id,a.target,a));
}
function chooseAI(s,side) {
  if(turnError(s,side))return null;
  const savedId=nextId;
  try{return AI.choose(s,side,api);}finally{nextId=savedId;}
}
const api={bomberBonus,armorValue,effectiveKeywords,pin,suppress,COMBAT_KEYWORDS,hasCombatKeyword,LIB,FACTIONS,RARITIES,GENERATED_CARDS,copyLimit,combatDamage,retreat,HEADQUARTERS,headquartersFor,headquarters,MAIN_NATIONS,DECK_SIZE,NORMAL_DECK_SIZE,handCount,migrateDeck,catalog,deckIssue,presetDeck,opponentDeck,mainReady,card,createGame,publicSnapshot,other,loc,row,target,guardSources,interceptorSources,ignoresGuard,longRange,
  attackError,moveError,playError,playBaseError,targetSteps,targetCandidates,playActions,operationCost,attackValue,unitStatus,activityError,readyUnits,act,chooseAI,legalAttacks,retaliation,draw,mulligan,chooseMulligan};
return api;
});
