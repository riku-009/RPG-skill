/**
 * RPG TypeScript definitions & constants
 */

export interface PlayerStats {
  level: number;
  exp: number;
  nextExp: number;
  gold: number;
  sp: number; // Status points to allocate

  // Core stats
  str: number; // Strength (increases Phys Atk)
  vit: number; // Vitality (increases HP and Phys Def)
  agi: number; // Agility (increases speed and speed-based stats/evasion)
  int: number; // Intelligence (increases Magic power & Max MP)
  dex: number; // Dexterity (increases Crit chance and accuracy)
  luk: number; // Luck (increases Crit rate, drop rates, and escape rate)

  // Current states
  hp: number;
  mp: number;

  // Reincarnated states
  reincarnations?: number;
}

export type SkillCategory = 'sword' | 'magic' | 'shield' | 'holy';

export interface CategoryProficiency {
  id: SkillCategory;
  name: string;
  level: number;
  exp: number;
  nextExp: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  unlockLevel: number; // Required level of category proficiency
  mpCost: number;
  basePower: number;
  element: 'physical' | 'fire' | 'water' | 'earth' | 'wind' | 'light' | 'none';
  target: 'single' | 'all';
  type: 'attack' | 'heal' | 'buff' | 'debuff';
  isUnlocked: boolean;
  proficiencyLevel: number;
  proficiencyExp: number;
  proficiencyNextExp: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'accessory' | 'potion';
  price: number;
  sellPrice: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  // Stats modifiers
  addMaxHP?: number;
  addMaxMP?: number;
  addAtk?: number;
  addDef?: number;
  addMag?: number;
  addAgi?: number;
  addLuk?: number;
  // Use effects for potions
  healHP?: number;
  healMP?: number;
  customEffect?: string;
}

export interface InventoryItem {
  item: Item;
  quantity: number;
}

export interface Equipment {
  weapon: Item | null;
  armor: Item | null;
  accessory: Item | null;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  difficulty: '★' | '★★' | '★★★' | '★★★★' | '★★★★★';
  targetMonsterId: string;
  targetCount: number;
  rewardExp: number;
  rewardGold: number;
  rewardItem?: Item;
  progress: number;
  isCompleted: boolean;
  isAccepted: boolean;
}

export interface Monster {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  atk: number;
  def: number;
  mag: number;
  agi: number;
  exp: number;
  gold: number;
  dialogue?: string;
  droppedItemChance?: {
    item: Item;
    chance: number; // 0.0 to 1.0
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface GameState {
  player: PlayerStats;
  proficiencies: Record<SkillCategory, CategoryProficiency>;
  skills: Skill[];
  inventory: InventoryItem[];
  equipment: Equipment;
  activeQuests: Quest[];
  availableQuests: Quest[];
  gameLog: string[];
  achievements: Achievement[];
}

// Default items constant
export const ITEMS: Record<string, Item> = {
  // Potion
  potion_hp_small: {
    id: 'potion_hp_small',
    name: '癒やしの薬 (小)',
    description: 'HPを50回復する。戦闘中・移動中ともに使用可能。',
    type: 'potion',
    price: 30,
    sellPrice: 15,
    rarity: 'common',
    healHP: 50,
  },
  potion_hp_medium: {
    id: 'potion_hp_medium',
    name: '癒やしの薬 (中)',
    description: 'HPを200回復する。戦闘中・移動中ともに使用可能。',
    type: 'potion',
    price: 120,
    sellPrice: 60,
    rarity: 'rare',
    healHP: 200,
  },
  potion_mp_small: {
    id: 'potion_mp_small',
    name: '魔力の滴 (小)',
    description: 'MPを30回復する。戦闘中・移動中ともに使用可能。',
    type: 'potion',
    price: 50,
    sellPrice: 25,
    rarity: 'common',
    healMP: 30,
  },
  potion_mp_medium: {
    id: 'potion_mp_medium',
    name: '魔力の滴 (中)',
    description: 'MPを100回復する。戦闘中・移動中ともに使用可能。',
    type: 'potion',
    price: 180,
    sellPrice: 90,
    rarity: 'rare',
    healMP: 100,
  },
  elixir: {
    id: 'elixir',
    name: '高級エリクサー',
    description: 'HPとMPを全回復する伝説の秘薬。',
    type: 'potion',
    price: 1000,
    sellPrice: 500,
    rarity: 'epic',
    healHP: 9999,
    healMP: 9999,
  },

  // Weapons
  weapon_bronze: {
    id: 'weapon_bronze',
    name: 'ブロンズソード',
    description: '初心者が使う青銅製の標準的な長剣。',
    type: 'weapon',
    price: 150,
    sellPrice: 75,
    rarity: 'common',
    addAtk: 10,
  },
  weapon_steel: {
    id: 'weapon_steel',
    name: '剛鉄の剣',
    description: '重厚で鋭い刃を持ち、敵を易々と叩き斬る。',
    type: 'weapon',
    price: 600,
    sellPrice: 300,
    rarity: 'rare',
    addAtk: 28,
    addDef: 5,
  },
  weapon_magic_wand: {
    id: 'weapon_magic_wand',
    name: '賢者の杖',
    description: '魔術回路を増幅する魔力を秘めたケヤキの杖。',
    type: 'weapon',
    price: 500,
    sellPrice: 250,
    rarity: 'rare',
    addAtk: 4,
    addMag: 22,
    addMaxMP: 30,
  },
  weapon_excalibur: {
    id: 'weapon_excalibur',
    name: '聖剣エクスカリバー',
    description: '眩い光で悪を退ける神聖な伝説の剣。',
    type: 'weapon',
    price: 3500,
    sellPrice: 1750,
    rarity: 'legendary',
    addAtk: 65,
    addMag: 25,
    addMaxMP: 50,
    addLuk: 15,
  },

  // Armor
  armor_leather: {
    id: 'armor_leather',
    name: '冒険者の革鎧',
    description: '軽量で動きやすい牛革の防具。',
    type: 'armor',
    price: 120,
    sellPrice: 60,
    rarity: 'common',
    addDef: 8,
    addAgi: 3,
  },
  armor_plate: {
    id: 'armor_plate',
    name: 'スチールプレートメイル',
    description: '鋼を鍛え上げて作った頑丈な大鎧。',
    type: 'armor',
    price: 800,
    sellPrice: 400,
    rarity: 'rare',
    addDef: 28,
    addMaxHP: 40,
    addAgi: -5, // heavy armor slows agi slightly
  },
  armor_sage_robe: {
    id: 'armor_sage_robe',
    name: 'ホーリーローブ',
    description: '神聖な加護を受けた、魔力防御の高い純白の外套。',
    type: 'armor',
    price: 750,
    sellPrice: 375,
    rarity: 'rare',
    addDef: 12,
    addMag: 15,
    addMaxMP: 40,
  },
  armor_dragon_scale: {
    id: 'armor_dragon_scale',
    name: '竜鱗の神鎧',
    description: '古代竜の硬い逆鱗から作られた最強の軽金鎧。',
    type: 'armor',
    price: 4000,
    sellPrice: 2000,
    rarity: 'legendary',
    addDef: 50,
    addMaxHP: 120,
    addAgi: 15,
  },

  // Accessories
  acc_ring_atk: {
    id: 'acc_ring_atk',
    name: '剛力の指輪',
    description: '装備者の内なる腕力を高める真鍮の指輪。',
    type: 'accessory',
    price: 300,
    sellPrice: 150,
    rarity: 'rare',
    addAtk: 8,
  },
  acc_ring_mag: {
    id: 'acc_ring_mag',
    name: 'マナの耳飾り',
    description: '周囲のエーテルを吸収し、常に精神を研ぎ澄ます。',
    type: 'accessory',
    price: 300,
    sellPrice: 150,
    rarity: 'rare',
    addMag: 8,
    addMaxMP: 15,
  },
  acc_ring_luck: {
    id: 'acc_ring_luck',
    name: 'ラピスのお守り',
    description: '幸運を引き寄せる深い群青色の天然鉱石。',
    type: 'accessory',
    price: 450,
    sellPrice: 225,
    rarity: 'epic',
    addLuk: 20,
    addAgi: 5,
  },
};

export const MONSTERS: Record<string, Omit<Monster, 'hp'>> = {
  slime: {
    id: 'slime',
    name: 'スライム',
    maxHp: 25,
    mp: 10,
    maxMp: 10,
    atk: 6,
    def: 3,
    mag: 2,
    agi: 5,
    exp: 8,
    gold: 15,
    dialogue: 'プルプル…！おいしそうな人間を発見した！',
  },
  goblin: {
    id: 'goblin',
    name: '小鬼ゴブリン',
    maxHp: 55,
    mp: 12,
    maxMp: 12,
    atk: 14,
    def: 6,
    mag: 2,
    agi: 10,
    exp: 20,
    gold: 35,
    dialogue: 'ギャハハッ！その武器と身ぐるみを置いていきな！',
    droppedItemChance: {
      item: ITEMS.potion_hp_small,
      chance: 0.25,
    },
  },
  wolf: {
    id: 'wolf',
    name: 'ファングウルフ',
    maxHp: 48,
    mp: 0,
    maxMp: 0,
    atk: 18,
    def: 5,
    mag: 1,
    agi: 18,
    exp: 25,
    gold: 20,
    dialogue: 'ガルルル……（鋭い牙が月の光に怪しく光っている）',
    droppedItemChance: {
      item: ITEMS.armor_leather,
      chance: 0.1,
    },
  },
  skeleton: {
    id: 'skeleton',
    name: 'スケルトンガード',
    maxHp: 90,
    mp: 20,
    maxMp: 20,
    atk: 25,
    def: 18,
    mag: 5,
    agi: 12,
    exp: 55,
    gold: 80,
    dialogue: 'ガシャガシャ…侵入者は生かして帰さぬ…',
    droppedItemChance: {
      item: ITEMS.weapon_steel,
      chance: 0.08,
    },
  },
  orc: {
    id: 'orc',
    name: 'オークコマンダー',
    maxHp: 180,
    mp: 15,
    maxMp: 15,
    atk: 42,
    def: 25,
    mag: 4,
    agi: 14,
    exp: 120,
    gold: 150,
    dialogue: 'ブモォォッ！我が鉄槌の一撃を受けよ！',
    droppedItemChance: {
      item: ITEMS.acc_ring_atk,
      chance: 0.15,
    },
  },
  frenzied_mage: {
    id: 'frenzied_mage',
    name: '狂気の魔術師',
    maxHp: 220,
    mp: 120,
    maxMp: 120,
    atk: 16,
    def: 18,
    mag: 55,
    agi: 22,
    exp: 200,
    gold: 240,
    dialogue: 'ヒャハハハ！禁域の魔力のサクリファイスとなるが良い！',
    droppedItemChance: {
      item: ITEMS.weapon_magic_wand,
      chance: 0.2,
    },
  },
  dragon_boss: {
    id: 'dragon_boss',
    name: '古代の赤竜 (BOSS)',
    maxHp: 650,
    mp: 150,
    maxMp: 150,
    atk: 75,
    def: 45,
    mag: 60,
    agi: 20,
    exp: 1000,
    gold: 1500,
    dialogue: 'グオオオォォォン！！愚かな人間め、我が劫火に焼き尽くされるがよい！',
    droppedItemChance: {
      item: ITEMS.armor_dragon_scale,
      chance: 1.0, // boss drops legendary armor guaranteed on completion
    },
  },
  ice_golem: {
    id: 'ice_golem',
    name: '氷晶の魔導ゴーレム',
    maxHp: 280,
    mp: 30,
    maxMp: 30,
    atk: 48,
    def: 55,
    mag: 25,
    agi: 8,
    exp: 300,
    gold: 320,
    dialogue: 'ゴ、ゴ、ゴゴゴ……（水晶の巨像が青白い冷気を発している）',
    droppedItemChance: {
      item: ITEMS.potion_mp_medium,
      chance: 0.35,
    },
  },
  sky_guardian_boss: {
    id: 'sky_guardian_boss',
    name: '極光の異界守護騎士 (BOSS)',
    maxHp: 800,
    mp: 100,
    maxMp: 100,
    atk: 88,
    def: 65,
    mag: 45,
    agi: 28,
    exp: 1800,
    gold: 2400,
    dialogue: '天空の聖域に侵入した咎人よ、我が極光の光刃にて魂を裁断せん！',
    droppedItemChance: {
      item: ITEMS.weapon_excalibur,
      chance: 0.3, // rare drop chance for legendary sword
    },
  },
  abyss_demon_boss: {
    id: 'abyss_demon_boss',
    name: '混沌の魔王ハデス (ULTIMATE BOSS)',
    maxHp: 1350,
    mp: 250,
    maxMp: 250,
    atk: 115,
    def: 75,
    mag: 95,
    agi: 32,
    exp: 4000,
    gold: 6000,
    dialogue: 'クックック……ついにここまで来たか。我こそが冥府を統べし闇の意志。お前の絶望、歓迎しよう！',
    droppedItemChance: {
      item: ITEMS.acc_ring_luck,
      chance: 0.5,
    },
  },
};
