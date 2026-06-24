import React, { useState, useEffect } from 'react';
import { 
  PlayerStats, 
  SkillCategory, 
  CategoryProficiency, 
  Skill, 
  Item, 
  InventoryItem, 
  Equipment, 
  Quest, 
  GameState, 
  ITEMS, 
  MONSTERS 
} from './types';
import { StatusPanel } from './components/StatusPanel';
import { ShopPanel } from './components/ShopPanel';
import { QuestPanel } from './components/QuestPanel';
import { ExplorationPanel } from './components/ExplorationPanel';
import { retroAudio } from './lib/audioManager';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coins, 
  Award, 
  ShoppingBag, 
  Compass, 
  User, 
  BookOpen, 
  Heart, 
  Zap, 
  Save, 
  RefreshCw, 
  ShieldAlert, 
  Crown, 
  Coffee, 
  ChevronRight, 
  Flame, 
  Gift, 
  CheckCircle2, 
  VolumeX, 
  Volume2,
  Sparkles
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'proficiency_rpg_save_v1';

const INITIAL_SKILLS: Skill[] = [
  // 剣術 (Swordplay)
  {
    id: 'heavy_slash',
    name: 'ヘビースラッシュ',
    description: '力を溜めて渾身の大振りを放つ（物理ダメージ:力×2.0 / AGI速度依存）',
    category: 'sword',
    unlockLevel: 0,
    mpCost: 4,
    basePower: 2.0,
    element: 'physical',
    target: 'single',
    type: 'attack',
    isUnlocked: true,
    proficiencyLevel: 1,
    proficiencyExp: 0,
    proficiencyNextExp: 10,
  },
  {
    id: 'helm_splitter',
    name: '兜割り',
    description: '相手の脳天を砕き、守りを弱体化（物理ダメージ:力×2.8 / 敵DEFを部分防御無視）',
    category: 'sword',
    unlockLevel: 3,
    mpCost: 9,
    basePower: 2.8,
    element: 'physical',
    target: 'single',
    type: 'attack',
    isUnlocked: false,
    proficiencyLevel: 1,
    proficiencyExp: 0,
    proficiencyNextExp: 15,
  },
  {
    id: 'thousand_swords',
    name: '十方剣舞',
    description: '目にも留まらぬ高速連撃を繰り出す剣王の絶技（物理ダメージ:力×4.5）',
    category: 'sword',
    unlockLevel: 7,
    mpCost: 18,
    basePower: 4.5,
    element: 'physical',
    target: 'single',
    type: 'attack',
    isUnlocked: false,
    proficiencyLevel: 1,
    proficiencyExp: 0,
    proficiencyNextExp: 30,
  },

  // 魔術 (Magic)
  {
    id: 'fireball',
    name: 'ファイアボール',
    description: '基本の火球魔法。標的を燃え盛る炎で包み滅ぼす（魔法ダメージ:知力×2.2）',
    category: 'magic',
    unlockLevel: 0,
    mpCost: 6,
    basePower: 2.2,
    element: 'fire',
    target: 'single',
    type: 'attack',
    isUnlocked: true,
    proficiencyLevel: 1,
    proficiencyExp: 0,
    proficiencyNextExp: 10,
  },
  {
    id: 'ice_needle',
    name: 'アイスニードル',
    description: '冷気を凝縮した鋭い氷の錐を放つ極氷魔導（魔法ダメージ:知力×2.8）',
    category: 'magic',
    unlockLevel: 3,
    mpCost: 11,
    basePower: 2.8,
    element: 'water',
    target: 'single',
    type: 'attack',
    isUnlocked: false,
    proficiencyLevel: 1,
    proficiencyExp: 0,
    proficiencyNextExp: 15,
  },
  {
    id: 'thunderstorm',
    name: 'ライトニングボルト',
    description: '雷雲を召喚し敵に苛烈な極大落雷を見舞う（魔法ダメージ:知力×4.2）',
    category: 'magic',
    unlockLevel: 7,
    mpCost: 20,
    basePower: 4.2,
    element: 'wind',
    target: 'single',
    type: 'attack',
    isUnlocked: false,
    proficiencyLevel: 1,
    proficiencyExp: 0,
    proficiencyNextExp: 25,
  },

  // 盾術 (Shieldcraft)
  {
    id: 'shield_bash',
    name: 'シールドバッシュ',
    description: '強力な盾の突き出しで衝撃を与える（物理ダメージ:体力×1.8 / 敵行動遅延）',
    category: 'shield',
    unlockLevel: 0,
    mpCost: 4,
    basePower: 1.8,
    element: 'physical',
    target: 'single',
    type: 'attack',
    isUnlocked: true,
    proficiencyLevel: 1,
    proficiencyExp: 0,
    proficiencyNextExp: 10,
  },
  {
    id: 'iron_wall',
    name: 'アイアンウォール',
    description: '金剛の防護シールドを展開する（自身の物理＆魔法防御力を3ターンの間著しく倍加）',
    category: 'shield',
    unlockLevel: 3,
    mpCost: 8,
    basePower: 2.5,
    element: 'none',
    target: 'single',
    type: 'buff',
    isUnlocked: false,
    proficiencyLevel: 1,
    proficiencyExp: 0,
    proficiencyNextExp: 15,
  },
  {
    id: 'provoke',
    name: 'ディバインオーラ',
    description: '全身を眩い光盾で包み込み、防御しつつ負傷をケア（回復量:体力×2.2 ＋ 防御ブースト）',
    category: 'shield',
    unlockLevel: 6,
    mpCost: 12,
    basePower: 2.2,
    element: 'light',
    target: 'single',
    type: 'heal',
    isUnlocked: false,
    proficiencyLevel: 1,
    proficiencyExp: 0,
    proficiencyNextExp: 20,
  },

  // 神聖 (Holy)
  {
    id: 'heal',
    name: 'ヒール',
    description: '神聖なる光の粒子で肉体の破損を補強回復する（回復量:知力×2.5）',
    category: 'holy',
    unlockLevel: 0,
    mpCost: 5,
    basePower: 2.5,
    element: 'light',
    target: 'single',
    type: 'heal',
    isUnlocked: true,
    proficiencyLevel: 1,
    proficiencyExp: 0,
    proficiencyNextExp: 10,
  },
  {
    id: 'regeneration',
    name: 'ホーリーセイント',
    description: '天上の祝福を呼び寄せ、生命力と魔力回路を一度にリフレッシュ（HPを100, MPを20即時回復）',
    category: 'holy',
    unlockLevel: 4,
    mpCost: 10,
    basePower: 100,
    element: 'light',
    target: 'single',
    type: 'heal',
    isUnlocked: false,
    proficiencyLevel: 1,
    proficiencyExp: 0,
    proficiencyNextExp: 15,
  },
  {
    id: 'judgement',
    name: 'ジャッジメントレイ',
    description: '邪を焼き払う裁きの光束を天空より召喚する（神聖ダメージ:知力×4.0）',
    category: 'holy',
    unlockLevel: 8,
    mpCost: 24,
    basePower: 4.0,
    element: 'light',
    target: 'single',
    type: 'attack',
    isUnlocked: false,
    proficiencyLevel: 1,
    proficiencyExp: 0,
    proficiencyNextExp: 30,
  },
];

const INITIAL_QUESTS: Quest[] = [
  {
    id: 'q_slime',
    title: '宿場町を脅かすプニプニ',
    description: '街道周辺に増えすぎた「スライム」を3匹討伐し、通商路の安全を確保してください。初心者向け。',
    difficulty: '★',
    targetMonsterId: 'slime',
    targetCount: 3,
    rewardExp: 35,
    rewardGold: 100,
    progress: 0,
    isCompleted: false,
    isAccepted: false,
  },
  {
    id: 'q_goblin',
    title: '裏山バイパスの盗賊団',
    description: '行商を襲う小鬼「ゴブリン」を2体退治せよ。武器の扱いに慣れた冒険者に推奨。',
    difficulty: '★★',
    targetMonsterId: 'goblin',
    targetCount: 2,
    rewardExp: 70,
    rewardGold: 180,
    rewardItem: ITEMS.potion_hp_medium,
    progress: 0,
    isCompleted: false,
    isAccepted: false,
  },
  {
    id: 'q_wolf',
    title: '晶洞近くに潜む狂犬',
    description: '鋭い魔牙を持ち家畜を襲う「ファングウルフ」を2体排除してください。牙は硬く先制攻撃に注意が必要。',
    difficulty: '★★',
    targetMonsterId: 'wolf',
    targetCount: 2,
    rewardExp: 110,
    rewardGold: 240,
    rewardItem: ITEMS.potion_mp_medium,
    progress: 0,
    isCompleted: false,
    isAccepted: false,
  },
  {
    id: 'q_skeleton',
    title: '未復帰のアンデッド兵士',
    description: '禁奥の谷から這い出た防衛騎士の骨「スケルトンガード」を2体討伐してください。硬い防具を装備しています。',
    difficulty: '★★★',
    targetMonsterId: 'skeleton',
    targetCount: 2,
    rewardExp: 180,
    rewardGold: 380,
    progress: 0,
    isCompleted: false,
    isAccepted: false,
  },
  {
    id: 'q_orc',
    title: '討伐特命：オークコマンダー',
    description: '獣魔の禁谷を統率し危害を画策している豪傑「オークコマンダー」を1体征伐せよ。強烈な破壊力が特徴。',
    difficulty: '★★★★',
    targetMonsterId: 'orc',
    targetCount: 1,
    rewardExp: 300,
    rewardGold: 600,
    rewardItem: ITEMS.acc_ring_atk,
    progress: 0,
    isCompleted: false,
    isAccepted: false,
  },
  {
    id: 'q_dragon',
    title: '終極依頼：古代火山竜の制覇',
    description: '焦熱火山にて長年眠りにつき、大地の熱動を引き起こす伝説のボス「古代の赤竜」を討伐してください。',
    difficulty: '★★★★★',
    targetMonsterId: 'dragon_boss',
    targetCount: 1,
    rewardExp: 1200,
    rewardGold: 2500,
    rewardItem: ITEMS.weapon_excalibur,
    progress: 0,
    isCompleted: false,
    isAccepted: false,
  },
];

const INITIAL_ACHIEVEMENTS = [
  { id: 'ach_sword_3', title: '免許皆伝の若剣士', description: '剣術熟練等級(剣術Rank)が 3 以上に到達した', isUnlocked: false },
  { id: 'ach_magic_3', title: '魔導の深淵の入り口', description: '魔術熟練等級(魔術Rank)が 3 以上に到達した', isUnlocked: false },
  { id: 'ach_shield_3', title: '堅牢なるアイアンガード', description: '盾術熟練等級(盾術Rank)が 3 以上に到達した', isUnlocked: false },
  { id: 'ach_holy_3', title: '白銀聖騎士の受勲', description: '神聖熟練等級(神聖Rank)が 3 以上に到達した', isUnlocked: false },
  { id: 'ach_gold_1500', title: '富豪冒険者への道', description: '所持金が 1,500 ゴールド(G)に到達した', isUnlocked: false },
  { id: 'ach_dragon_slayer', title: '伝説のドラゴンスレイヤー', description: '最深部の「古代の赤竜」討伐を公式に達成した', isUnlocked: false },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'town' | 'explore' | 'status' | 'shop' | 'quests'>('town');
  const [isMuted, setIsMuted] = useState(retroAudio.getMutedState());
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  
  // Entire Game Core states
  const [player, setPlayer] = useState<PlayerStats>({
    level: 1,
    exp: 0,
    nextExp: 100,
    gold: 200, // Starts off with pocket money
    sp: 3, // Initial starting allocation points
    str: 10,
    vit: 10,
    agi: 10,
    int: 10,
    dex: 10,
    luk: 10,
    hp: 90, // Calculated dynamically but synced for recovery checks
    mp: 70,
  });

  const [proficiencies, setProficiencies] = useState<Record<SkillCategory, CategoryProficiency>>({
    sword: { id: 'sword', name: '剣術熟練度', level: 1, exp: 0, nextExp: 10 },
    magic: { id: 'magic', name: '魔術熟練度', level: 1, exp: 0, nextExp: 10 },
    shield: { id: 'shield', name: '盾術熟練度', level: 1, exp: 0, nextExp: 10 },
    holy: { id: 'holy', name: '神聖熟練度', level: 1, exp: 0, nextExp: 10 },
  });

  const [skills, setSkills] = useState<Skill[]>(INITIAL_SKILLS);
  
  const [inventory, setInventory] = useState<InventoryItem[]>([
    { item: ITEMS.potion_hp_small, quantity: 3 },
    { item: ITEMS.potion_mp_small, quantity: 2 },
  ]);

  const [equipment, setEquipment] = useState<Equipment>({
    weapon: null,
    armor: null,
    accessory: null,
  });

  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [achievements, setAchievements] = useState(INITIAL_ACHIEVEMENTS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Derived stats incorporating Equipment modifiers
  const getAtkBonus = () => (equipment.weapon?.addAtk || 0) + (equipment.armor?.addAtk || 0) + (equipment.accessory?.addAtk || 0);
  const getDefBonus = () => (equipment.weapon?.addDef || 0) + (equipment.armor?.addDef || 0) + (equipment.accessory?.addDef || 0);
  const getMagBonus = () => (equipment.weapon?.addMag || 0) + (equipment.armor?.addMag || 0) + (equipment.accessory?.addMag || 0);
  const getAgiBonus = () => (equipment.weapon?.addAgi || 0) + (equipment.armor?.addAgi || 0) + (equipment.accessory?.addAgi || 0);
  const getHpBonus = () => (equipment.weapon?.addMaxHP || 0) + (equipment.armor?.addMaxHP || 0) + (equipment.accessory?.addMaxHP || 0);
  const getMpBonus = () => (equipment.weapon?.addMaxMP || 0) + (equipment.armor?.addMaxMP || 0) + (equipment.accessory?.addMaxMP || 0);

  const getMaxHp = () => player.vit * 5 + 40 + getHpBonus();
  const getMaxMp = () => player.int * 5 + 20 + getMpBonus();

  // Load game from local storage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.player) setPlayer(parsed.player);
        if (parsed.proficiencies) setProficiencies(parsed.proficiencies);
        if (parsed.skills) setSkills(parsed.skills);
        if (parsed.inventory) setInventory(parsed.inventory || []);
        if (parsed.equipment) setEquipment(parsed.equipment);
        if (parsed.quests) setQuests(parsed.quests);
        if (parsed.achievements) setAchievements(parsed.achievements);
        showToast('💾 セーブデータをロードしました！前回の続きから遊べます。');
      }
    } catch (e) {
      console.warn("Failed to retrieve local storage save data.", e);
    }
  }, []);

  // System alert toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Toggle BGM mute status
  const handleToggleMute = () => {
    const nextMuted = retroAudio.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      retroAudio.playSFX('click');
      if (activeTab !== 'explore') {
        retroAudio.playTrack('town');
      }
    }
  };

  // Auto-play / Resume on first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!isMuted) {
        if (activeTab !== 'explore') {
          retroAudio.playTrack('town');
        }
      }
      window.removeEventListener('click', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction);
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
    };
  }, [activeTab, isMuted]);

  // Synchronise audio track with non-exploring tabs
  useEffect(() => {
    if (!isMuted) {
      if (activeTab !== 'explore') {
        retroAudio.playTrack('town');
      }
    } else {
      retroAudio.playTrack('none');
    }
  }, [activeTab, isMuted]);

  // MANUALLY SAVE PROGRESS
  const handleSaveGame = () => {
    const dataToSave = {
      player,
      proficiencies,
      skills,
      inventory,
      equipment,
      quests,
      achievements
    };
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
      showToast('💾 冒険の進捗状況を魔導日誌（ブラウザストレージ）に記録セーブしました！');
    } catch (e) {
      showToast('❌ 保存エラー：ストレージ領域が不足している可能性があります。');
    }
  };

  // ERASE RECORD & RESET GAME
  const handleResetGame = () => {
    setIsResetModalOpen(true);
    retroAudio.playSFX('click');
  };

  // 1. HARD RESET
  const executeHardReset = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setPlayer({
      level: 1,
      exp: 0,
      nextExp: 100,
      gold: 200,
      sp: 3,
      str: 10,
      vit: 10,
      agi: 10,
      int: 10,
      dex: 10,
      luk: 10,
      hp: 90,
      mp: 70,
      reincarnations: 0,
    });
    setProficiencies({
      sword: { id: 'sword', name: '剣術熟練度', level: 1, exp: 0, nextExp: 10 },
      magic: { id: 'magic', name: '魔術熟練度', level: 1, exp: 0, nextExp: 10 },
      shield: { id: 'shield', name: '盾術熟練度', level: 1, exp: 0, nextExp: 10 },
      holy: { id: 'holy', name: '神聖熟練度', level: 1, exp: 0, nextExp: 10 },
    });
    setSkills(INITIAL_SKILLS);
    setInventory([
      { item: ITEMS.potion_hp_small, quantity: 3 },
      { item: ITEMS.potion_mp_small, quantity: 2 },
    ]);
    setEquipment({
      weapon: null,
      armor: null,
      accessory: null,
    });
    setQuests(INITIAL_QUESTS);
    setAchievements(INITIAL_ACHIEVEMENTS);
    setActiveTab('town');
    setIsResetModalOpen(false);
    showToast('🔄 ニューゲーム：すべてのデータを完全初期化し、新たに旅立ちました！');
  };

  // 2. REINCARNATION PRESTIGE
  const executeReincarnate = () => {
    if (player.level < 12) {
      showToast('❌ 転生の儀式：レベル12以上に達していないため、まだ魂の転生を行えません。');
      return;
    }

    const nextReincarnations = (player.reincarnations || 0) + 1;
    // Boost starting bonus status points by +5 per reincarnation count!
    const bonusStartingSp = 3 + (nextReincarnations * 5);

    // Keep: Gold, Inventory, Equipment, Proficiencies, Skills
    // Reset: Level to 1, Exp to 0, Stats back to baseline + Reincarnation SP
    setPlayer(prev => ({
      ...prev,
      level: 1,
      exp: 0,
      nextExp: 100,
      sp: bonusStartingSp,
      // Restore base stats to 10
      str: 10,
      vit: 10,
      agi: 10,
      int: 10,
      dex: 10,
      luk: 10,
      hp: 90,
      mp: 70,
      reincarnations: nextReincarnations,
    }));

    // Trigger shiny ascension SFX!
    retroAudio.playSFX('reincarnate');
    setActiveTab('status'); // navigate to Allocate Points screen immediately so they can feel powerful!
    setIsResetModalOpen(false);
    showToast(`✨ 魂の転生儀式に成功！ 転生 ${nextReincarnations}回目 の恩恵として、初期SPが +${nextReincarnations * 5} 獲得されました！`);
  };

  // INN HEALING STATION ACTION
  const handleRestAtInn = () => {
    const cost = 10;
    const isFree = player.level <= 3 || player.gold < cost;
    
    if (!isFree && player.gold < cost) {
      showToast('❌ 宿屋の宿泊代「10G」が足りません！');
      return;
    }

    const nextGold = isFree ? player.gold : player.gold - cost;
    const finalHp = getMaxHp();
    const finalMp = getMaxMp();

    setPlayer(prev => ({
      ...prev,
      hp: finalHp,
      mp: finalMp,
      gold: nextGold,
    }));

    showToast(`💤 宿屋の一等室で熟睡した…… 傷が完全にふさがり、HP・MPが最大まで全回復しました！ ${isFree ? '（初心者・救済無料貸出！）' : ' (所持金 -10 G)'}`);
  };

  // STATUS ALLOTMENT
  const handleAllocateStat = (statName: keyof Omit<PlayerStats, 'level' | 'exp' | 'nextExp' | 'gold' | 'sp' | 'hp' | 'mp'>) => {
    if (player.sp <= 0) return;

    setPlayer(prev => {
      const updatedValue = prev[statName] + 1;
      const nextSp = prev.sp - 1;

      // Recalculate dynamic hp/mp bound changes immediately
      const nextObj = {
        ...prev,
        [statName]: updatedValue,
        sp: nextSp,
      };

      // If Vit or Int rose, add the HP/MP offset increment to current pools
      if (statName === 'vit') {
        nextObj.hp = Math.min(prev.hp + 5, prev.vit * 5 + 45 + getHpBonus());
      }
      if (statName === 'int') {
        nextObj.mp = Math.min(prev.mp + 5, prev.int * 5 + 25 + getMpBonus());
      }

      return nextObj;
    });

    // Check achievement for Gold holding
    checkGoldAchievement(player.gold);
  };

  // STABILITY SP RESETTER
  const handleResetStats = () => {
    const totalSpToRegain = (player.level - 1) * 5 + 3 + (player.str - 10) + (player.vit - 10) + (player.agi - 10) + (player.int - 10) + (player.dex - 10) + (player.luk - 10);
    setPlayer(prev => ({
      ...prev,
      str: 10,
      vit: 10,
      agi: 10,
      int: 10,
      dex: 10,
      luk: 10,
      sp: totalSpToRegain,
      hp: 90,
      mp: 70,
    }));
    showToast('🔄 すべてのSPを初期値にリセットし、ポイントを全充当しました！');
  };

  // MERCHANT: BUY ITEM
  const handleBuyItem = (item: Item) => {
    if (player.gold < item.price) {
      showToast('❌ 所持金が足りません！');
      return;
    }

    // Deduct Gold and register item inside inventory
    setPlayer(prev => ({ ...prev, gold: prev.gold - item.price }));
    
    setInventory(prev => {
      const existing = prev.find(i => i.item.id === item.id);
      if (existing) {
        return prev.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { item, quantity: 1 }];
    });

    showToast(`🛍️ 「${item.name}」を購入し、カバンに入れました！`);
    
    // Check gold threshold achievements
    checkGoldAchievement(player.gold - item.price);
  };

  // MERCHANT: SELL ITEM
  const handleSellItem = (itemId: string) => {
    let soldItem: Item | null = null;

    setInventory(prev => {
      const match = prev.find(i => i.item.id === itemId);
      if (!match) return prev;
      soldItem = match.item;

      if (match.quantity <= 1) {
        return prev.filter(i => i.item.id !== itemId);
      }
      return prev.map(i => i.item.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
    });

    if (soldItem) {
      const goldAmt = (soldItem as Item).sellPrice;
      setPlayer(prev => ({ ...prev, gold: prev.gold + goldAmt }));
      showToast(`💰 「${(soldItem as Item).name}」を売却し、${goldAmt} G を獲得しました！`);
      checkGoldAchievement(player.gold + goldAmt);
    }
  };

  // EQUIP ITEM SLOT
  const handleEquipItem = (item: Item) => {
    if (item.type === 'potion') return;

    setEquipment(prev => {
      const slot = item.type;
      const currentEquipped = prev[slot];

      // Remove 1 quantity of the item we are about to equip
      setInventory(bag => {
        // If there was something already equipped, return it back to the bag
        let cleanBag = bag;
        if (currentEquipped) {
          const slotExists = bag.find(i => i.item.id === currentEquipped.id);
          if (slotExists) {
            cleanBag = bag.map(i => i.item.id === currentEquipped.id ? { ...i, quantity: i.quantity + 1 } : i);
          } else {
            cleanBag = [...bag, { item: currentEquipped, quantity: 1 }];
          }
        }

        // Deduct the item that we are equipping
        const equipExists = cleanBag.find(i => i.item.id === item.id);
        if (equipExists) {
          if (equipExists.quantity <= 1) {
            return cleanBag.filter(i => i.item.id !== item.id);
          }
          return cleanBag.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity - 1 } : i);
        }
        return cleanBag;
      });

      return {
        ...prev,
        [slot]: item,
      };
    });

    showToast(`🛡️ 「${item.name}」を身につけました（基礎補正パラメータがアップ！）`);
  };

  // UNEQUIP ITEM SLOT
  const handleUnequipItem = (slot: 'weapon' | 'armor' | 'accessory') => {
    const itemToUnequip = equipment[slot];
    if (!itemToUnequip) return;

    setEquipment(prev => ({ ...prev, [slot]: null }));
    
    setInventory(prev => {
      const existing = prev.find(i => i.item.id === itemToUnequip.id);
      if (existing) {
        return prev.map(i => i.item.id === itemToUnequip.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { item: itemToUnequip, quantity: 1 }];
    });

    showToast(`🎒 「${itemToUnequip.name}」を外し、カバンに戻しました。`);
  };

  // HP/MP CONSUME ACTION FROM INVENTORY (POTIONS)
  const handleUseItemInTown = (item: Item) => {
    if (item.type !== 'potion') return;

    let success = false;
    if (item.healHP) {
      if (player.hp >= getMaxHp()) {
        showToast('❌ すでにHPは最大全快です！');
        return;
      }
      setPlayer(prev => ({
        ...prev,
        hp: Math.min(getMaxHp(), prev.hp + item.healHP!),
      }));
      success = true;
    } else if (item.healMP) {
      if (player.mp >= getMaxMp()) {
        showToast('❌ すでにMPは最大全快です！');
        return;
      }
      setPlayer(prev => ({
        ...prev,
        mp: Math.min(getMaxMp(), prev.mp + item.healMP!),
      }));
      success = true;
    }

    if (success) {
      setInventory(bag => {
        const itemInBag = bag.find(i => i.item.id === item.id);
        if (!itemInBag) return bag;
        if (itemInBag.quantity <= 1) return bag.filter(i => i.item.id !== item.id);
        return bag.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity - 1 } : i);
      });
      showToast(`🧪 「${item.name}」を服用しました！回復が適用されました。`);
    }
  };

  // TRIGGER PROGRESSION ON ACTIONS (BATTLE ACTION -> EXP FOR CLASS CATEGORIES)
  const handleTriggerProficiencyGain = (category: SkillCategory, expGain: number): string[] => {
    const logs: string[] = [];
    
    setProficiencies(prev => {
      const prof = prev[category];
      if (!prof) return prev;

      let nextExp = prof.exp + expGain;
      let nextLevel = prof.level;
      let targetNextRequired = prof.nextExp;
      let didLevelUp = false;

      if (nextExp >= targetNextRequired) {
        didLevelUp = true;
        nextLevel += 1;
        nextExp = nextExp - targetNextRequired;
        targetNextRequired = Math.floor(targetNextRequired * 1.5) + 5;
        logs.push(`【${prof.name}】が Rank Up! (等級 ${prof.level} ➔ ${nextLevel})`);
      }

      const updatedProf = {
        ...prof,
        level: nextLevel,
        exp: nextExp,
        nextExp: targetNextRequired,
      };

      // Trigger achievement unlocks if level 3 or above reached
      if (nextLevel >= 3) {
        unlockAchievement(`ach_${category}_3`);
      }

      // Automatically scan and unlock individual skills unlocked under this categories level!
      if (didLevelUp) {
        setSkills(skillsList => {
          return skillsList.map(skill => {
            if (skill.category === category && !skill.isUnlocked && skill.unlockLevel <= nextLevel) {
              logs.push(`🎉 新たな秘技スキル 【${skill.name}】 を体得しました！`);
              return { ...skill, isUnlocked: true };
            }
            return skill;
          });
        });
      }

      return {
        ...prev,
        [category]: updatedProf,
      };
    });

    return logs;
  };

  // TRIGGER SKILL SPECIFIC PROFICIENCY GAIN (SKILL USE -> LEVEL UP FOR INDIVIDUAL SKILL)
  const handleTriggerSkillProficiencyGain = (skillId: string, expGain: number): string[] => {
    const logs: string[] = [];

    setSkills(prev => {
      return prev.map(skill => {
        if (skill.id !== skillId) return skill;

        let nextExp = skill.proficiencyExp + expGain;
        let nextLevel = skill.proficiencyLevel;
        let required = skill.proficiencyNextExp;

        if (nextExp >= required) {
          nextLevel += 1;
          nextExp = nextExp - required;
          required = Math.floor(required * 1.8) + 8;
          logs.push(`【${skill.name}】の習熟Lvがアップ！ (熟練度 Lv.${skill.proficiencyLevel} ➔ Lv.${nextLevel}) 威力＋消費MP軽減率向上！`);
        }

        return {
          ...skill,
          proficiencyLevel: nextLevel,
          proficiencyExp: nextExp,
          proficiencyNextExp: required,
        };
      });
    });

    return logs;
  };

  // QUEST ACCEPT
  const handleAcceptQuest = (questId: string) => {
    setQuests(prev => {
      // Check limits
      const acceptedCount = prev.filter(q => q.isAccepted && !q.isCompleted).length;
      if (acceptedCount >= 4) {
        showToast('❌ 同時に受けられるクエストは最大 4 つまでです！');
        return prev;
      }
      
      showToast(`📝 クエストを受けました。討伐数を稼いで完了させましょう！`);
      return prev.map(q => q.id === questId ? { ...q, isAccepted: true } : q);
    });
  };

  // QUEST ABANDON
  const handleAbandonQuest = (questId: string) => {
    setQuests(prev => prev.map(q => q.id === questId ? { ...q, isAccepted: false, progress: 0 } : q));
    showToast('🍂 ギルド規約に則り、受注依頼を破棄してボードに戻しました。');
  };

  // QUEST COMPLETED - DISTRIBUTE COINS AND EXP
  const handleCompleteQuest = (questId: string) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest) return;

    let expGain = quest.rewardExp;
    let goldGain = quest.rewardGold;
    let rewardItem = quest.rewardItem;

    // Allocate gold/exp inside player stats
    let nextExp = player.exp + expGain;
    let nextLevel = player.level;
    let nextNextRequired = player.nextExp;
    let leveledUp = false;
    let goldTotal = player.gold + goldGain;

    if (nextExp >= nextNextRequired) {
      leveledUp = true;
      nextLevel += 1;
      nextExp = nextExp - nextNextRequired;
      nextNextRequired = Math.floor(nextNextRequired * 1.6) + 50;
    }

    setPlayer(prev => ({
      ...prev,
      level: nextLevel,
      exp: nextExp,
      nextExp: nextNextRequired,
      gold: goldTotal,
      sp: leveledUp ? prev.sp + 5 : prev.sp,
    }));

    // Add unique item rewards to bag
    if (rewardItem) {
      setInventory(prev => {
        const hasSame = prev.find(i => i.item.id === rewardItem!.id);
        if (hasSame) {
          return prev.map(i => i.item.id === rewardItem!.id ? { ...i, quantity: i.quantity + 1 } : i);
        }
        return [...prev, { item: rewardItem!, quantity: 1 }];
      });
    }

    // Toggle quests states, remove from Board completely
    setQuests(prev => prev.filter(q => q.id !== questId));

    showToast(`🎉 クエスト「${quest.title}」報告完了！ 【+${goldGain} G】【+${expGain} EXP】を獲得！ ${leveledUp ? '✨さらにLv. Up! SP+5 獲得！' : ''}`);
    if (rewardItem) {
      showToast(`🎁 クエスト特典品「${rewardItem.name}」をカバンに獲得！`);
    }

    // Checking achievements
    checkGoldAchievement(goldTotal);
  };

  // MONSTER SLAIN TRIGGER: INCREMENTS QUEST PROGRESS
  const handleMonsterDefeatedReg = (monsterId: string) => {
    setQuests(prev => {
      return prev.map(quest => {
        if (quest.isAccepted && quest.targetMonsterId === monsterId && quest.progress < quest.targetCount) {
          const nextProgress = quest.progress + 1;
          const isDone = nextProgress >= quest.targetCount;
          if (isDone) {
            showToast(`🔔 クエスト【${quest.title}】が完了報告可能になりました！ギルドで報告しましょう。`);
          }
          return { ...quest, progress: nextProgress };
        }
        return quest;
      });
    });

    // Boss Achievements
    if (monsterId === 'dragon_boss') {
      unlockAchievement('ach_dragon_slayer');
    }
  };

  // PENALTY ON DEFEAT
  const handleDefeatedPenalty = (): string => {
    // Loss of 15% gold as medical fine, but HP completely healed back to town
    const lossAmt = Math.floor(player.gold * 0.15);
    const goldClaimed = Math.max(0, player.gold - lossAmt);

    // Save HP state statically
    setPlayer(prev => ({
      ...prev,
      gold: goldClaimed,
      hp: getMaxHp(), // Fully healed at hospital
      mp: getMaxMp(),
    }));

    return `治療院に搬送され全生命・魔力回路が保護されましたが、治療実費として所持金から【-${lossAmt} ゴールド】が差し引かれました。`;
  };

  // ACHIEVEMENT UNLOCKER HELPER
  const unlockAchievement = (id: string) => {
    setAchievements(prev => {
      const match = prev.find(a => a.id === id);
      if (match && !match.isUnlocked) {
        showToast(`🏆 業績達成：【${match.title}】を解放しました！`);
        return prev.map(a => a.id === id ? { ...a, isUnlocked: true, unlockedAt: new Date().toLocaleTimeString() } : a);
      }
      return prev;
    });
  };

  const checkGoldAchievement = (currentGold: number) => {
    if (currentGold >= 1500) {
      unlockAchievement('ach_gold_1500');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans select-none antialiased selection:bg-indigo-950 selection:text-indigo-200">
      
      {/* GLOBAL HEADER BAR */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/50 px-4 md:px-6 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl text-white border-2 border-indigo-400/30 shadow-md">
            S
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-black tracking-tight text-white font-display">熟練試練者 SOREN</h1>
            <p className="text-indigo-400 text-[10px] md:text-xs font-bold uppercase tracking-widest leading-none mt-1">Level {player.level} · Void Seeker</p>
          </div>
        </div>

        {/* Core Global Profile Widget info */}
        <div className="flex items-center gap-3 md:gap-5">
          <div className="hidden md:flex items-center gap-6 text-xs font-mono">
            <div className="flex flex-col items-end">
              <span className="text-slate-400 font-bold block text-right">LEVEL {player.level}</span>
              <div className="h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full bg-indigo-500" 
                  style={{ width: `${Math.min(100, (player.exp / player.nextExp) * 100)}%` }}
                />
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block text-right">Currency</span>
              <span className="text-amber-400 font-mono font-bold text-base">{player.gold}G</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleSaveGame}
              className="text-xs bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 p-2.5 rounded-xl text-indigo-400 hover:text-indigo-300 transition-all flex items-center gap-1.5 font-bold shadow-sm"
              title="データをセーブする"
              id="btn-save-progress"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">魔導書保存</span>
            </button>

            <button
              onClick={handleToggleMute}
              className={`text-xs p-2.5 rounded-xl border transition-all flex items-center gap-1.5 font-bold shadow-sm ${
                isMuted 
                  ? 'bg-slate-950/40 text-slate-500 border-slate-800/80 hover:text-indigo-400 hover:border-indigo-900/40 hover:bg-slate-950' 
                  : 'bg-indigo-950/25 text-indigo-300 border-indigo-500/20 hover:bg-indigo-950/40'
              }`}
              title={isMuted ? 'BGMを再生する (ミュート解除)' : 'BGMを一時停止する (音量オフ)'}
              id="btn-toggle-bgm"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-500" /> : <Volume2 className="w-3.5 h-3.5 text-indigo-400 animate-bounce" />}
              <span className="hidden md:inline">{isMuted ? '消音中' : 'BGM奏中'}</span>
            </button>

            <button
              onClick={handleResetGame}
              className="text-xs bg-slate-950 hover:bg-rose-950/20 border border-slate-800 hover:border-rose-900/30 p-2.5 rounded-xl text-slate-500 hover:text-rose-450 transition-all shadow-sm"
              title="初期化ニューゲーム"
              id="btn-reset-game"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* TOAST PANEL BAR */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 backdrop-blur-md border border-indigo-500/40 px-5 py-3 rounded-2xl shadow-2xl font-mono text-xs max-w-lg text-indigo-200 text-center flex items-center gap-2"
          >
            <span className="text-indigo-400">⚡</span>
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* CORE WRAPPER CONTAINER GRID */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6">
        
        {/* TOP STATUS RIBBONHUD */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl p-5 flex flex-wrap gap-4 items-center justify-between font-mono backdrop-blur-md shadow-md">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Quick parameter bars for desktop */}
            <div className="flex items-center gap-3 bg-slate-950 p-2 px-4 rounded-2xl border border-slate-800/75 max-w-[170px] flex-1 min-w-[140px]">
              <Heart className="w-4 h-4 text-rose-500 animate-pulse shrink-0" />
              <div className="flex-1">
                <span className="text-[10px] text-slate-500 block leading-none font-bold">LIFE HP</span>
                <span className="text-xs font-bold text-slate-200">{player.hp} / {getMaxHp()}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-950 p-2 px-4 rounded-2xl border border-slate-800/75 max-w-[170px] flex-1 min-w-[140px]">
              <Zap className="w-4 h-4 text-cyan-500 shrink-0" />
              <div className="flex-1">
                <span className="text-[10px] text-slate-500 block leading-none font-bold">MANA MP</span>
                <span className="text-xs font-bold text-slate-200">{player.mp} / {getMaxMp()}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-950 p-2 px-4 rounded-2xl border border-slate-800/75 max-w-[170px] flex-1 min-w-[140px]">
              <Crown className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="flex-1">
                <span className="text-[10px] text-slate-500 block leading-none font-bold">EXP POINT</span>
                <span className="text-xs font-bold text-slate-200">{player.exp} / {player.nextExp}</span>
              </div>
            </div>
            
            {player.sp > 0 && (
              <div className="bg-indigo-950/80 text-indigo-300 text-[10px] px-3 py-1.5 rounded-full border border-indigo-500/40 font-bold uppercase tracking-wider animate-bounce">
                ★ SP振り分け可能！ (+{player.sp})
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 hidden lg:inline">現在の現役装備：</span>
            <div className="flex gap-1.5 text-xs">
              <span className="bg-slate-950 border border-slate-800/80 px-3 py-1.5 rounded-xl text-slate-300 block max-w-[120px] truncate" title={equipment.weapon?.name || '素手'}>
                🗡️ {equipment.weapon?.name || '素手'}
              </span>
              <span className="bg-slate-950 border border-slate-800/80 px-3 py-1.5 rounded-xl text-slate-300 block max-w-[120px] truncate" title={equipment.armor?.name || '素服'}>
                🛡️ {equipment.armor?.name || '素服'}
              </span>
            </div>
          </div>
        </div>

        {/* GENERAL TAB BUTTONS PREVIEWS NAVIGATION */}
        <div className="flex overflow-x-auto pb-1 gap-2 border-b border-slate-850 font-sans tracking-wide">
          <button
            onClick={() => setActiveTab('town')}
            className={`px-6 py-3 text-xs md:text-sm font-bold rounded-t-2xl transition-all duration-150 shrink-0 flex items-center gap-2 border-x border-t ${
              activeTab === 'town'
                ? 'bg-slate-900 border-slate-800 text-white ring-2 ring-indigo-500/30'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/30'
            }`}
            id="tab-town"
          >
            <Coffee className="w-4 h-4 text-indigo-400" />
            王都の広場 (宿屋)
          </button>
          
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-6 py-3 text-xs md:text-sm font-bold rounded-t-2xl transition-all duration-150 shrink-0 flex items-center gap-2 border-x border-t ${
              activeTab === 'explore'
                ? 'bg-slate-900 border-slate-800 text-white ring-2 ring-indigo-500/30'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/30'
            }`}
            id="tab-explore"
          >
            <Compass className="w-4 h-4 text-rose-500 animate-pulse" />
            ダンジョン探索・戦闘
          </button>

          <button
            onClick={() => setActiveTab('status')}
            className={`px-6 py-3 text-xs md:text-sm font-bold rounded-t-2xl transition-all duration-150 shrink-0 flex items-center gap-2 border-x border-t ${
              activeTab === 'status'
                ? 'bg-slate-900 border-slate-800 text-white ring-2 ring-indigo-500/30'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/30'
            }`}
            id="tab-status"
          >
            <User className="w-4 h-4 text-sky-400" />
            ステータス・熟練秘技
          </button>

          <button
            onClick={() => setActiveTab('shop')}
            className={`px-6 py-3 text-xs md:text-sm font-bold rounded-t-2xl transition-all duration-150 shrink-0 flex items-center gap-2 border-x border-t ${
              activeTab === 'shop'
                ? 'bg-slate-900 border-slate-800 text-white ring-2 ring-indigo-500/30'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/30'
            }`}
            id="tab-shop"
          >
            <ShoppingBag className="w-4 h-4 text-amber-500" />
            大商店・カバン
          </button>

          <button
            onClick={() => setActiveTab('quests')}
            className={`px-6 py-3 text-xs md:text-sm font-bold rounded-t-2xl transition-all duration-150 shrink-0 flex items-center gap-2 border-x border-t ${
              activeTab === 'quests'
                ? 'bg-slate-900 border-slate-800 text-white ring-2 ring-indigo-500/30'
                : 'text-slate-400 border-transparent hover:text-slate-300 hover:bg-slate-900/30'
            }`}
            id="tab-quests"
          >
            <Award className="w-4 h-4 text-emerald-400" />
            ギルド依頼板
            {quests.filter(q => q.isAccepted && q.progress >= q.targetCount).length > 0 && (
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-ping" />
            )}
          </button>
        </div>

        {/* SWITCH PANEL ACTIVE DISPLAY CONTENT */}
        <div className="flex-grow">
          <AnimatePresence mode="wait">
            
            {/* TABS 1: INN & PLAZA */}
            {activeTab === 'town' && (
              <motion.div
                key="tab-panel-town"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
              >
                {/* LEFT CARD COLUMN: CHANCE HOSPITALITY */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  
                  {/* Inn station lodging */}
                  <div className="bento-card p-6 shadow-xl">
                    <div className="flex items-center gap-3.5 mb-5 pb-3 border-b border-slate-800">
                      <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                        <Coffee className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-white tracking-tight">王都の宿屋 「月光の癒庵」</h3>
                        <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Rest Station · Max HP/MP Restore</p>
                      </div>
                    </div>

                    <p className="text-slate-450 text-xs leading-relaxed mb-6">
                      温かいハーブスープと魔導寝具を完備した最高級宿。一泊【10G】で全損HP・MPを一度で完全回復させられます。（Lv.3以下の初心者や、一銭も持っていない無一文の難民は無料で宿をご利用頂けます）
                    </p>

                    <button
                      onClick={handleRestAtInn}
                      className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm rounded-2xl transition shadow-lg flex items-center justify-center gap-2 border border-indigo-500/20"
                      id="btn-rest-inn"
                    >
                      ベッドで熟睡して全回復する (10 G)
                    </button>
                  </div>

                  {/* Character stats quick peek card */}
                  <div className="bento-card p-6 shadow-xl text-xs font-mono text-slate-400 leading-normal">
                    <h4 className="text-indigo-400 font-bold mb-3 pb-2 border-b border-slate-800 tracking-wider uppercase text-[10px]">冒険者カード（現行補正値）</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-1 border-b border-slate-900">
                        <span className="text-slate-450">物理攻撃値 (STR+WEAPON)</span> 
                        <span className="text-white font-bold">{player.str + getAtkBonus()} pAtk</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-900">
                        <span className="text-slate-450">物理防護等 (VIT*1.5+ARMOR)</span> 
                        <span className="text-white font-bold">{Math.floor(player.vit * 1.5) + getDefBonus()} pDef</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-900">
                        <span className="text-slate-450">魔導干渉威力 (INT+MOD)</span> 
                        <span className="text-white font-bold">{player.int + getMagBonus()} mAtk</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-900">
                        <span className="text-slate-450">先制踏破速度 (AGI+MOD)</span> 
                        <span className="text-white font-bold">{player.agi + getAgiBonus()} spd</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-slate-450">致命打及び幸運 (LUK+MOD)</span> 
                        <span className="text-white font-bold">{player.luk + (equipment.accessory?.addLuk || 0)} luk</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* RIGHT CARD COLUMN: GAME EXPLANATIONS & TROPHY CASES */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  
                  {/* Interactive rules manual banner */}
                  <div className="bento-card p-6 shadow-xl">
                    <h3 className="font-extrabold text-lg text-white mb-4 flex items-center gap-2">
                      <span className="text-indigo-400">⚡</span> 熟練度成長システムのすゝめ
                    </h3>
                    
                    <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
                      <p>
                        この世界では、キャラクターの<strong>「実際の行動結果」がそのまま成長原動力</strong>となります。剣を振るうことによって物理的な腕が立ち、スペルを唱えることで神経細胞が魔法適応を高めていきます。
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2 font-mono">
                        <div className="bento-inner-panel p-4">
                          <span className="text-indigo-400 font-bold text-xs block mb-2 tracking-wide">① 系統熟練度の向上</span>
                          探索戦闘内で、対応した項目(通常攻撃/各色魔術/盾防御/白ヒールなど)を発動させるたびに経験値を得て、最大10系統のRankが上がります。スキルボードの段階に達すると、新たなアビリティスキルが自動で完全習得解锁されます！
                        </div>
                        <div className="bento-inner-panel p-4">
                          <span className="text-amber-400 font-bold text-xs block mb-2 tracking-wide">② 個別スキル熟練度の蓄積</span>
                          一度解放されたアビリティ技を何度も実戦使用することで、そのスキル自体の「個別Lv」が上昇。技威力の爆発的増幅と、消費MPリソースを【最大35%】引き下げる効果を発揮します。
                        </div>
                      </div>

                      <div className="text-slate-400 text-xs bento-inner-panel p-4 flex items-start gap-2.5">
                        <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        <span>
                          <strong>攻略のヒント:</strong> 中盤以降の敵は防御・魔力ともに高いため、大商店での「剛鉄の剣」や「ホーリーローブ」等の新武器を装備した上で、ステータスの「Str」や「Int」にSPを適切に allocation して対応しましょう。最深部には火山「古代の赤竜」が待ち構えています！
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* INGAME ACHIEVEMENT CORNER CABINET */}
                  <div className="bento-card p-6 shadow-xl">
                    <div className="flex items-center gap-3.5 mb-5 pb-3 border-b border-slate-800">
                      <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-white tracking-tight">アンロック業績・トロフィー閣</h3>
                        <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Honors & Achievements Hall</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {achievements.map((ach) => (
                        <div 
                          key={ach.id}
                          className={`p-4 rounded-2xl border flex gap-3.5 items-start transition-all duration-300 ${
                            ach.isUnlocked 
                              ? 'bg-indigo-600/5 border-indigo-500/25 text-slate-100 shadow-sm' 
                              : 'bg-slate-950/40 border-slate-900/60 text-slate-500 opacity-55'
                          }`}
                        >
                          <div className={`p-2.5 rounded-xl font-mono text-center shrink-0 ${ach.isUnlocked ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-slate-950 text-slate-600 border border-slate-900'}`}>
                            🏆
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-200">{ach.title}</span>
                              {ach.isUnlocked && (
                                <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-2 py-0.5 rounded-full font-bold font-mono">
                                  達成
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-450 mt-1 lines-clamp-2 leading-relaxed">{ach.description}</p>
                            {ach.isUnlocked && ach.unlockedAt && (
                              <span className="text-[9px] text-slate-550 font-mono block mt-1.5">
                                獲得時刻: {ach.unlockedAt}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB 2: EXPLORATION SCREEN */}
            {activeTab === 'explore' && (
              <motion.div
                key="tab-panel-explore"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                <ExplorationPanel
                  player={player}
                  skills={skills}
                  inventory={inventory}
                  equipment={equipment}
                  onUpdatePlayer={(updater) => setPlayer(prev => ({ ...prev, ...updater }))}
                  onAddInventoryItem={(item, qty) => {
                    setInventory(prev => {
                      const matchIdx = prev.findIndex(i => i.item.id === item.id);
                      if (matchIdx > -1) {
                        const newBag = [...prev];
                        newBag[matchIdx] = { ...newBag[matchIdx], quantity: newBag[matchIdx].quantity + qty };
                        return newBag;
                      }
                      return [...prev, { item, quantity: qty }];
                    });
                  }}
                  onRemoveInventoryItem={(itemId, qty) => {
                    setInventory(prev => {
                      const matchIdx = prev.findIndex(i => i.item.id === itemId);
                      if (matchIdx === -1) return prev;
                      const nextQty = prev[matchIdx].quantity - qty;
                      if (nextQty <= 0) {
                        return prev.filter(i => i.item.id !== itemId);
                      }
                      const newBag = [...prev];
                      newBag[matchIdx] = { ...newBag[matchIdx], quantity: nextQty };
                      return newBag;
                    });
                  }}
                  onTriggerProficiencyGain={handleTriggerProficiencyGain}
                  onTriggerSkillProficiencyGain={handleTriggerSkillProficiencyGain}
                  onMonsterDefeated={handleMonsterDefeatedReg}
                  onDefeatedPenalty={handleDefeatedPenalty}
                />
              </motion.div>
            )}

            {/* TAB 3: STATUS ALLOTMENT */}
            {activeTab === 'status' && (
              <motion.div
                key="tab-panel-status"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                <StatusPanel
                  player={player}
                  proficiencies={proficiencies}
                  skills={skills}
                  equipment={equipment}
                  onAllocateStat={handleAllocateStat}
                  onResetStats={handleResetStats}
                  maxHp={getMaxHp()}
                  maxMp={getMaxMp()}
                />
              </motion.div>
            )}

            {/* TAB 4: SHOPPING CABIN */}
            {activeTab === 'shop' && (
              <motion.div
                key="tab-panel-shop"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                <ShopPanel
                  player={player}
                  inventory={inventory}
                  equipment={equipment}
                  onBuyItem={handleBuyItem}
                  onSellItem={handleSellItem}
                  onEquipItem={handleEquipItem}
                  onUnequipItem={handleUnequipItem}
                  onUseItem={handleUseItemInTown}
                />
              </motion.div>
            )}

            {/* TAB 5: QUEST PANEL BOARDS */}
            {activeTab === 'quests' && (
              <motion.div
                key="tab-panel-quests"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                <QuestPanel
                  player={player}
                  availableQuests={quests.filter(q => !q.isAccepted)}
                  activeQuests={quests.filter(q => q.isAccepted)}
                  onAcceptQuest={handleAcceptQuest}
                  onCompleteQuest={handleCompleteQuest}
                  onAbandonQuest={handleAbandonQuest}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </main>

      {/* RITUAL OF RESET & REINCARNATION OVERLAY MODAL */}
      <AnimatePresence>
        {isResetModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative overflow-hidden text-slate-100"
            >
              {/* Radial glow */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-indigo-500 to-amber-500" />
              
              <div className="flex items-center gap-2 mb-4 text-indigo-400">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-spin" />
                <h3 className="font-sans font-bold text-lg tracking-tight uppercase">次元の石碑 - 境界の儀式</h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-6 font-sans">
                ここ次元の石碑では、魔導書の記録を浄化して時空を巻き戻すことができます。選択する道によって魂の継承が異なります。
              </p>

              <div className="space-y-4 mb-6">
                {/* CHOICE A: REINCARNATION */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  player.level >= 12
                    ? 'bg-amber-950/20 border-amber-500/30 hover:border-amber-400 cursor-pointer'
                    : 'bg-slate-950/50 border-slate-800/80 opacity-60'
                }`}
                onClick={() => {
                  if (player.level >= 12) {
                    executeReincarnate();
                  }
                }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                      🔯 宿命の異界転生 (強くてニューゲーム)
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      player.level >= 12 ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {player.level >= 12 ? '解放中' : '封印中 (要Lv.12)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                    現在のキャラクターレベル ({player.level}) から魂を抽出して転生します。<strong className="text-amber-400">すべての金貨、装備、カバンのアイテム、系統熟練度は維持</strong>したまま、Lv.1 に戻ります。
                  </p>
                  <div className="mt-2 text-[10px] bg-slate-950/80 p-2 rounded-lg font-mono text-amber-200">
                    🎁 転生特典: 初期付与ステータスSPに永久補正 <strong className="text-amber-400">+{((player.reincarnations || 0) + 1) * 5} SP</strong> が加えられます！ (現在の転生：{player.reincarnations || 0}回)
                  </div>
                </div>

                {/* CHOICE B: HARD RESET */}
                <div 
                  onClick={executeHardReset}
                  className="p-4 rounded-2xl bg-rose-950/15 border border-rose-900/35 hover:border-rose-500/40 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-bold text-rose-305 flex items-center gap-1.5">
                      💀 歴史の完全初期化 (最初からプレイ)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold font-mono">
                      危険
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-350 leading-relaxed font-sans">
                    これまでに築き上げたキャラクターレベル、ゴールド、全熟練レベル、カバンの装備品を<strong className="text-rose-400">完全に消滅させ、初期状態の無垢な冒険者に戻します。</strong>
                  </p>
                  <p className="text-[10px] text-rose-450 mt-1.5 font-mono">
                    ⚠️ 注意: ブラウザのセーブデータが完全消去され、元に戻せません。
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2.5">
                <button
                  onClick={() => setIsResetModalOpen(false)}
                  className="text-xs font-bold px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 transition-colors cursor-pointer"
                >
                  境界を立ち去る (閉じる)
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER METADATA CODES */}
      <footer className="bg-stone-900/40 border-t border-stone-850 mt-12 py-6 px-4 text-center text-xs text-stone-500 font-mono">
        <p>© 2026-06 熟練度成長試練 RPG - Local Storage Sandbox Built</p>
        <p className="text-[10px] text-stone-600 mt-1 leading-normal max-w-xl mx-auto">
          通常攻撃を振るって「剣術」を磨き、呪文を唱えて「魔術」「神聖治癒」を底上げる、行動蓄積型のアクション熟練度を組み合わせて強大な火山ボスや天空神殿ボスなどを攻略しましょう。
        </p>
      </footer>

    </div>
  );
}
