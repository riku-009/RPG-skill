import React, { useState, useEffect, useRef } from 'react';
import { PlayerStats, SkillCategory, CategoryProficiency, Skill, Item, InventoryItem, Equipment, Monster, ITEMS, MONSTERS } from '../types';
import { Shield, Sword, Compass, AlertTriangle, ChevronRight, Gift, RotateCcw, Flame, Sparkles, AlertCircle, HelpCircle, User, Zap, ThumbsUp, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { retroAudio } from '../lib/audioManager';

interface Dungeon {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  recommendedLv: number;
  stepsMax: number;
  monsters: string[];
  hasBoss: boolean;
  bossId?: string;
  color: string;
}

const DUNGEONS: Dungeon[] = [
  {
    id: 'forest',
    name: '始まりの巨樹森林',
    description: '豊かな自然に恵まれた、比較的安全な森。温厚なスライムや、時折ゴブリンが出没する。',
    difficulty: '★☆☆☆☆',
    recommendedLv: 1,
    stepsMax: 6,
    monsters: ['slime', 'goblin'],
    hasBoss: false,
    color: 'from-emerald-950/50 to-green-950/20 text-emerald-300 border-emerald-900/30'
  },
  {
    id: 'cave',
    name: '忘却の晶鉱洞穴',
    description: 'かつて豊かな晶石を採掘していた廃鉱。今はファングウルフや獰猛な小鬼たちの住処。',
    difficulty: '★★☆☆☆',
    recommendedLv: 4,
    stepsMax: 10,
    monsters: ['goblin', 'wolf', 'skeleton'],
    hasBoss: false,
    color: 'from-cyan-950/50 to-slate-950/20 text-sky-300 border-cyan-900/30 font-semibold'
  },
  {
    id: 'valley',
    name: '昏き獣魔の禁忌谷',
    description: '不気味な瘴気が満ち満ちる深奥の谷。軍事訓練されたオークや邪悪な魔道士が行き来する。',
    difficulty: '★★★☆☆',
    recommendedLv: 8,
    stepsMax: 14,
    monsters: ['skeleton', 'orc', 'frenzied_mage'],
    hasBoss: false,
    color: 'from-purple-950/50 to-indigo-950/20 text-fuchsia-300 border-fuchsia-900/30 font-bold'
  },
  {
    id: 'dragon_mount',
    name: '古代竜の焦熱火山',
    description: '不気味な黒煙を吐く超巨大火山。最深部には何百年も生き続けている伝説の赤竜が君臨する。',
    difficulty: '★★★★★',
    recommendedLv: 12,
    stepsMax: 5,
    monsters: ['orc', 'frenzied_mage'],
    hasBoss: true,
    bossId: 'dragon_boss',
    color: 'from-rose-950/50 to-red-950/20 text-rose-300 border-rose-950/40 font-black font-sans'
  },
  {
    id: 'ice_ship',
    name: '氷晶に凍てつく亡霊沈没船',
    description: '極寒の氷海に閉ざされた氷の幽霊船。冷気で覆われた巨大なゴーレムが侵入者を阻む。',
    difficulty: '★★★★☆',
    recommendedLv: 15,
    stepsMax: 12,
    monsters: ['skeleton', 'frenzied_mage'],
    hasBoss: true,
    bossId: 'ice_golem',
    color: 'from-cyan-950/55 to-blue-950/20 text-cyan-300 border-cyan-850/30 font-bold'
  },
  {
    id: 'sky_temple',
    name: '極光そびえる浮遊天空神殿',
    description: '雲海を突き抜け静かに浮遊する神代の遺物。極光の魔力を操る気高き真鍮の騎士が守護する。',
    difficulty: '★★★★★',
    recommendedLv: 18,
    stepsMax: 15,
    monsters: ['frenzied_mage', 'ice_golem'],
    hasBoss: true,
    bossId: 'sky_guardian_boss',
    color: 'from-violet-950/55 to-purple-950/20 text-violet-300 border-violet-900/30 font-bold'
  },
  {
    id: 'abyss',
    name: '混沌を統べる常闇の冥界深淵',
    description: 'この世の全エーテルの終着地。底知れぬ深淵にて、究極の支配者ハデスが不敵に待ち構える。',
    difficulty: '★★★★★★',
    recommendedLv: 22,
    stepsMax: 18,
    monsters: ['orc', 'frenzied_mage', 'ice_golem'],
    hasBoss: true,
    bossId: 'abyss_demon_boss',
    color: 'from-slate-950/85 to-zinc-950/50 text-rose-300 border-rose-950/45 font-black uppercase tracking-wider'
  },
];

interface ExplorationPanelProps {
  player: PlayerStats;
  skills: Skill[];
  inventory: InventoryItem[];
  equipment: Equipment;
  onUpdatePlayer: (updater: Partial<PlayerStats>) => void;
  onAddInventoryItem: (item: Item, quantity: number) => void;
  onRemoveInventoryItem: (itemId: string, quantity: number) => void;
  onTriggerProficiencyGain: (category: SkillCategory, expGain: number) => string[];
  onTriggerSkillProficiencyGain: (skillId: string, expGain: number) => string[];
  onMonsterDefeated: (monsterId: string) => void;
  onDefeatedPenalty: () => string;
}

export const ExplorationPanel: React.FC<ExplorationPanelProps> = ({
  player,
  skills,
  inventory,
  equipment,
  onUpdatePlayer,
  onAddInventoryItem,
  onRemoveInventoryItem,
  onTriggerProficiencyGain,
  onTriggerSkillProficiencyGain,
  onMonsterDefeated,
  onDefeatedPenalty,
}) => {
  // Exploration flow states
  const [selectedDungeon, setSelectedDungeon] = useState<Dungeon | null>(null);
  const [exploringProgress, setExploringProgress] = useState<number>(0); // Current steps
  const [explorationLog, setExplorationLog] = useState<string[]>([]);
  
  // Interactive events states
  const [chestFoundItem, setChestFoundItem] = useState<Item | null>(null);
  const [chestFoundGold, setChestFoundGold] = useState<number | null>(null);
  const [fountainHPHeal, setFountainHPHeal] = useState<number | null>(null);
  const [fountainMPHeal, setFountainMPHeal] = useState<number | null>(null);

  // Combat States
  const [activeMonster, setActiveMonster] = useState<Monster | null>(null);
  const [playerCurrentHp, setPlayerCurrentHp] = useState<number>(player.hp);
  const [playerCurrentMp, setPlayerCurrentMp] = useState<number>(player.mp);
  const [isPlayerGuarding, setIsPlayerGuarding] = useState<boolean>(false);

  // Refs to prevent stale closures during setTimeout calls
  const hpRef = useRef<number>(player.hp);
  const mpRef = useRef<number>(player.mp);
  const guardRef = useRef<boolean>(false);

  // Synchronous State & Ref Updaters
  const updateHp = (newHp: number) => {
    hpRef.current = newHp;
    setPlayerCurrentHp(newHp);
  };

  const updateMp = (newMp: number) => {
    mpRef.current = newMp;
    setPlayerCurrentMp(newMp);
  };

  const updateGuard = (newGuard: boolean) => {
    guardRef.current = newGuard;
    setIsPlayerGuarding(newGuard);
  };

  const [battleLogs, setBattleLogs] = useState<string[]>([]);
  const [isSkillMenuOpen, setIsSkillMenuOpen] = useState<boolean>(false);
  const [isItemMenuOpen, setIsItemMenuOpen] = useState<boolean>(false);
  const [battleOutcome, setBattleOutcome] = useState<'victory' | 'defeat' | 'escaped' | null>(null);

  // Turn tracking log
  const [combatTurn, setCombatTurn] = useState<number>(1);
  const [growthAlerts, setGrowthAlerts] = useState<string[]>([]);

  // Logs terminal ref to keep scrolling low
  const logTerminalRef = useRef<HTMLDivElement>(null);
  const combatLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logTerminalRef.current) {
      logTerminalRef.current.scrollTop = logTerminalRef.current.scrollHeight;
    }
  }, [explorationLog]);

  useEffect(() => {
    if (combatLogRef.current) {
      combatLogRef.current.scrollTop = combatLogRef.current.scrollHeight;
    }
  }, [battleLogs]);

  // Sync HP/MP from parent state on initialization
  useEffect(() => {
    hpRef.current = player.hp;
    mpRef.current = player.mp;
    setPlayerCurrentHp(player.hp);
    setPlayerCurrentMp(player.mp);
  }, [player.hp, player.mp]);

  // Dynamic BGM transitions based on Exploration and Combat state
  useEffect(() => {
    if (!selectedDungeon) {
      retroAudio.playTrack('town');
      return;
    }

    if (activeMonster) {
      const isBoss = activeMonster.id.toLowerCase().includes('boss') || activeMonster.id.toLowerCase().includes('demon') || activeMonster.id.toLowerCase().includes('guardian');
      retroAudio.playTrack(isBoss ? 'boss' : 'battle');
    } else {
      retroAudio.playTrack('dungeon');
    }
  }, [selectedDungeon, activeMonster]);

  const addExploreLog = (msg: string) => {
    setExplorationLog(prev => [...prev, `[探索] ${msg}`]);
  };

  const addBattleLog = (msg: string) => {
    setBattleLogs(prev => [...prev, msg]);
  };

  // Get active stats from equipment + base player stats
  const getAtk = () => player.str + (equipment.weapon?.addAtk || 0) + (equipment.armor?.addAtk || 0) + (equipment.accessory?.addAtk || 0);
  const getDef = () => Math.floor(player.vit * 1.5) + (equipment.weapon?.addDef || 0) + (equipment.armor?.addDef || 0) + (equipment.accessory?.addDef || 0);
  const getMag = () => player.int + (equipment.weapon?.addMag || 0) + (equipment.armor?.addMag || 0) + (equipment.accessory?.addMag || 0);
  const getAgi = () => player.agi + (equipment.weapon?.addAgi || 0) + (equipment.armor?.addAgi || 0) + (equipment.accessory?.addAgi || 0);
  const getLuk = () => player.luk + (equipment.weapon?.addLuk || 0) + (equipment.armor?.addLuk || 0) + (equipment.accessory?.addLuk || 0);
  const getMaxHp = () => player.vit * 5 + 40 + (equipment.weapon?.addMaxHP || 0) + (equipment.armor?.addMaxHP || 0) + (equipment.accessory?.addMaxHP || 0);
  const getMaxMp = () => player.int * 5 + 20 + (equipment.weapon?.addMaxMP || 0) + (equipment.armor?.addMaxMP || 0) + (equipment.accessory?.addMaxMP || 0);

  // START DUNGEON
  const handleSelectDungeon = (dungeon: Dungeon) => {
    setSelectedDungeon(dungeon);
    setExploringProgress(0);
    setExplorationLog([]);
    setGrowthAlerts([]);
    setBattleOutcome(null);
    setIsSkillMenuOpen(false);
    setIsItemMenuOpen(false);
    
    // Quick status log
    setExplorationLog([
      `[${dungeon.name}] に足を踏み入れました。最深部（${dungeon.stepsMax}歩）の攻略を目指しましょう！`,
      `現在のコンディション: HP ${player.hp}/${getMaxHp()} | MP ${player.mp}/${getMaxMp()}`
    ]);
  };

  // LEAVE / ESCAPE DUNGEON BACK TO TOWN
  const handleLeaveDungeon = () => {
    // Save current HP/MP back to player state in parent
    onUpdatePlayer({ hp: hpRef.current, mp: mpRef.current });
    setSelectedDungeon(null);
    setExploringProgress(0);
    setActiveMonster(null);
    setBattleOutcome(null);
  };

  // ONE STEP FORWARD
  const handleTakeStep = () => {
    if (!selectedDungeon) return;

    // Reset temporary event overlays
    setChestFoundItem(null);
    setChestFoundGold(null);
    setFountainHPHeal(null);
    setFountainMPHeal(null);

    // Play walk click sfx
    retroAudio.playSFX('click');

    const nextStep = exploringProgress + 1;
    setExploringProgress(nextStep);

    // If step number matches maximum and dungeon is hasBoss, initiate Boss fight
    if (nextStep >= selectedDungeon.stepsMax && selectedDungeon.hasBoss && selectedDungeon.bossId) {
      addExploreLog(`🌋 空が急に血のような赤に染まった！最奥部の地に古代の気配が満ちる……！`);
      initiateBattle(selectedDungeon.bossId);
      return;
    }

    // Standard dungeon random action generator
    const rand = Math.random();

    if (nextStep >= selectedDungeon.stepsMax) {
      // Dungeon Cleared
      addExploreLog(`🏆 ${selectedDungeon.name} を完全に踏破しました！安全地帯に戻り、財宝や経験値を確認しましょう。`);
      retroAudio.playSFX('victory');
      
      // Select random item reward for complete clearance
      const isBossArea = selectedDungeon.id === 'dragon_mount' || selectedDungeon.id === 'sky_temple' || selectedDungeon.id === 'abyss';
      const clearanceGold = isBossArea ? 800 : (selectedDungeon.recommendedLv * 80 + 50);
      const clearanceExp = isBossArea ? 450 : (selectedDungeon.recommendedLv * 35 + 20);

      const itemsPool = [ITEMS.potion_hp_medium, ITEMS.potion_mp_medium, ITEMS.acc_ring_atk, ITEMS.acc_ring_mag];
      const randomRewardItem = itemsPool[Math.floor(Math.random() * itemsPool.length)];

      onUpdatePlayer({ 
         gold: player.gold + clearanceGold, 
         exp: player.exp + clearanceExp 
      });

      if (!isBossArea) {
        onAddInventoryItem(randomRewardItem, 1);
        addExploreLog(`特別踏破報酬：${clearanceGold} G と ${clearanceExp} EXP を獲得！ 報酬アイテム「${randomRewardItem.name}」をカバンにしまいました。`);
      } else {
        addExploreLog(`特別踏破報酬：${clearanceGold} G と ${clearanceExp} EXP を獲得！`);
      }

      // Automatically sync HP/MP
      onUpdatePlayer({ hp: hpRef.current, mp: mpRef.current });
      
      // Close selection
      return;
    }

    if (rand < 0.45) {
      // Enemy encounter!
      const availableMonsters = selectedDungeon.monsters;
      const monsterId = availableMonsters[Math.floor(Math.random() * availableMonsters.length)];
      initiateBattle(monsterId);
    } 
    else if (rand < 0.65) {
      // Treasure Chest found
      retroAudio.playSFX('heal');
      const isRare = Math.random() < 0.25;
      const goldReward = Math.floor(Math.random() * (selectedDungeon.recommendedLv * 25)) + 15;
      
      const potentialItems = isRare 
        ? [ITEMS.potion_hp_medium, ITEMS.potion_mp_medium, ITEMS.acc_ring_luck] 
        : [ITEMS.potion_hp_small, ITEMS.potion_mp_small];

      const itemReward = potentialItems[Math.floor(Math.random() * potentialItems.length)];
      
      setChestFoundGold(goldReward);
      setChestFoundItem(itemReward);

      onUpdatePlayer({ gold: player.gold + goldReward });
      onAddInventoryItem(itemReward, 1);
      
      addExploreLog(`📦 宝箱を発見しました！ [${goldReward} G] と回復アイテム「${itemReward.name}」を獲得！`);
    } 
    else if (rand < 0.82) {
      // Healing Fountain found
      retroAudio.playSFX('heal');
      const hpHeal = Math.floor(getMaxHp() * 0.35);
      const mpHeal = Math.floor(getMaxMp() * 0.30);
      
      const finalHp = Math.min(getMaxHp(), hpRef.current + hpHeal);
      const finalMp = Math.min(getMaxMp(), mpRef.current + mpHeal);

      setFountainHPHeal(hpHeal);
      setFountainMPHeal(mpHeal);
      updateHp(finalHp);
      updateMp(finalMp);
      
      onUpdatePlayer({ hp: finalHp, mp: finalMp });

      addExploreLog(`💧 清らかな癒しの魔力泉を発見！身体が暖かさに満ちる……（HPが ${hpHeal}、MPが ${mpHeal} 回復した）`);
    } 
    else {
      // Peaceful Event / Flavor text
      const events = [
        "周囲の茂みが風でさざめいている。鳥の鳴き声が聞こえる。",
        "モンスターの鳴き声が遠くから響くが、こちらには気づいていない。",
        "足元に珍しい魔法石が転がっていたが、すでに魔力は枯渇しているようだ。",
        "険しい山道を慎重に進む。周囲の地形に対する適応力が高まった気がする。"
      ];
      addExploreLog(events[Math.floor(Math.random() * events.length)]);
    }
  };

  // COMBAT INITIALIZATION
  const initiateBattle = (monsterId: string) => {
    const rawMonster = MONSTERS[monsterId];
    if (!rawMonster) return;

    // Create a dynamic instance of the monster for full HP tracking
    const monsterInstance: Monster = {
      ...rawMonster,
      hp: rawMonster.maxHp,
    };

    setActiveMonster(monsterInstance);
    setBattleOutcome(null);
    setCombatTurn(1);
    updateGuard(false);
    setGrowthAlerts([]);
    
    // Clear and build introductory logs
    setBattleLogs([
      `⚔️ [敵一匹との戦闘が開始！]`,
      `前方から凶暴な 「${monsterInstance.name}」 が襲いかかってきた！`,
      `「${monsterInstance.dialogue || 'ウガァァァー！'}」`
    ]);

    // Check pre-emptive attack
    const isPreemptive = getAgi() > monsterInstance.agi * 1.5 && Math.random() < 0.3;
    if (isPreemptive) {
      addBattleLog(`⚡️ あなたの神速の身のこなしにより、先制チャンスを得ました！`);
    }
  };

  // PLAYER MELEE SWORD ATTACK ACTION
  const handlePlayerAttack = () => {
    if (!activeMonster) return;
    updateGuard(false);

    // Play hit SFX
    retroAudio.playSFX('hit');

    const bonusLogs: string[] = [];

    // Damage calculations (Sword Attack is physical)
    // Physical Attack Power = base str + heavy weapon bonus
    const pAtk = getAtk();
    const eDef = activeMonster.def;

    let isCrit = Math.random() < (0.05 + getLuk() * 0.003 + (player.dex * 0.002));
    let baseDamage = pAtk * (isCrit ? 1.8 : 1.0) - Math.floor(eDef * 0.5);
    let finalDamage = Math.max(1, Math.floor(baseDamage * (0.9 + Math.random() * 0.2)));

    // Apply Damage to Monster
    const nextEnemyHp = Math.max(0, activeMonster.hp - finalDamage);
    const updatedMonster = { ...activeMonster, hp: nextEnemyHp };
    setActiveMonster(updatedMonster);

    addBattleLog(`⚔️ あなたの通常攻撃が炸裂！ ${isCrit ? '🔥クリティカルヒット！' : ''} 【${activeMonster.name}】に 【${finalDamage}】のダメージを与えた。`);

    // Using basic attack with Sword type increases Sword Category Proficiency!
    const categoryTriggers = onTriggerProficiencyGain('sword', 3);
    categoryTriggers.forEach(log => {
      bonusLogs.push(log);
      addBattleLog(`✨ 剣術の系統熟練蓄積：${log}`);
    });

    setGrowthAlerts(prev => [...prev, ...bonusLogs]);

    if (nextEnemyHp <= 0) {
      handleBattleVictory(updatedMonster, bonusLogs);
    } else {
      // Enemy Turn
      setTimeout(() => {
        executeEnemyTurn(updatedMonster);
      }, 500);
    }
  };

  // PLAYER EXECUTES ACTIVE SKILL
  const handlePlayerCastSkill = (skill: Skill) => {
    if (!activeMonster) return;
    setIsSkillMenuOpen(false);
    updateGuard(false);

    // Deduct MP dynamically
    const mpReduction = Math.min(35, Math.max(0, (skill.proficiencyLevel - 1) * 7));
    const finalMpCost = Math.max(1, Math.round(skill.mpCost * (1 - mpReduction / 100)));

    if (mpRef.current < finalMpCost) {
      addBattleLog(`❌ MPが不足しているため、[${skill.name}] を唱えられません！`);
      return;
    }

    const nextMp = Math.max(0, mpRef.current - finalMpCost);
    updateMp(nextMp);
    onUpdatePlayer({ mp: nextMp });

    let finalValue = 0;
    let isHealing = skill.type === 'heal';
    let isBuff = skill.type === 'buff';
    const bonusLogs: string[] = [];

    // Grow both the Parent Category AND the Individual Skill Proficiency themselves
    const skillExpGain = 4;
    const catExpGain = 5;

    const skillGrowth = onTriggerSkillProficiencyGain(skill.id, skillExpGain);
    skillGrowth.forEach(log => {
      bonusLogs.push(log);
      addBattleLog(`⭐ スキル上達：${log}`);
    });

    const categoryGrowth = onTriggerProficiencyGain(skill.category, catExpGain);
    categoryGrowth.forEach(log => {
      bonusLogs.push(log);
      addBattleLog(`✨ ${skill.category === 'sword' ? '剣術' : skill.category === 'magic' ? '魔術' : skill.category === 'shield' ? '盾術' : '神聖'}熟練蓄積：${log}`);
    });

    setGrowthAlerts(prev => [...prev, ...bonusLogs]);

    // Skill level power scaler: +10% damage/healing multiplier per proficiency level
    const levelPowerMultiplier = 1.0 + (skill.proficiencyLevel - 1) * 0.1;

    if (isHealing) {
      // Play heal SFX
      retroAudio.playSFX('heal');
      // Heal Spell calculations
      const healingPower = skill.category === 'holy' ? getMag() : getDef(); // shield provoke healing is def based
      const baseHeal = Math.floor(healingPower * skill.basePower * levelPowerMultiplier);
      const randHeal = Math.floor(baseHeal * (0.95 + Math.random() * 0.1));
      
      const finalHeal = Math.min(getMaxHp(), hpRef.current + randHeal);
      updateHp(finalHeal);
      onUpdatePlayer({ hp: finalHeal });

      addBattleLog(`💖 [${skill.name}] を詠唱！ 聖なるエーテルが身体を癒やす。HPが 【${randHeal}】点 回復。`);
      
      // Proceed directly to enemy turn
      setTimeout(() => {
        executeEnemyTurn(activeMonster);
      }, 500);

    } else if (isBuff) {
      // Play buff SFX
      retroAudio.playSFX('heal');
      // Buff Spell e.g. Iron Wall (Defense Up enormously)
      updateGuard(true); // Treat as an advanced guard/buff posture
      addBattleLog(`🛡️ [${skill.name}] を展開！ 物理防護シールドが展開され、極限防御の防備を固めた。`);

      // Proceed directly to enemy turn
      setTimeout(() => {
        executeEnemyTurn(activeMonster);
      }, 500);

    } else {
      // Play attack SFX
      retroAudio.playSFX('hit');
      // Attack Skill calculations (physical or magical)
      let relativeAtk = 0;
      let relativeDef = 0;

      if (skill.category === 'magic') {
        relativeAtk = getMag();
        relativeDef = activeMonster.mag; // Magic defense checks magic stat
      } else {
        relativeAtk = skill.category === 'shield' ? getDef() : getAtk(); // shield attack scales on def!
        relativeDef = activeMonster.def;
      }

      const totalPower = relativeAtk * skill.basePower * levelPowerMultiplier;
      let baseDamage = Math.max(1, totalPower - Math.floor(relativeDef * 0.5));
      let finalDamage = Math.floor(baseDamage * (0.9 + Math.random() * 0.2));

      // Specific skill effects
      if (skill.id === 'helm_splitter') {
        finalDamage = Math.floor(finalDamage * 1.1); // bonus impact
      }

      const nextEnemyHp = Math.max(0, activeMonster.hp - finalDamage);
      const updatedMonster = { ...activeMonster, hp: nextEnemyHp };
      setActiveMonster(updatedMonster);

      addBattleLog(`💥 技発動：[${skill.name}](Lv.${skill.proficiencyLevel})！ 敵に【${finalDamage}】の激烈なダメージを与えた。`);

      if (nextEnemyHp <= 0) {
        handleBattleVictory(updatedMonster, bonusLogs);
      } else {
        // Enemy Turn
        setTimeout(() => {
          executeEnemyTurn(updatedMonster);
        }, 500);
      }
    }
  };

  // PLAYER COMMAND: GUARD
  const handlePlayerGuard = () => {
    updateGuard(true);
    addBattleLog(`🛡️ あなたは盾を強く構え、敵の激突に対する確実な防御姿勢をとった！（受けるダメージを著しく軽減します）`);

    // Guard increases Shield category proficiency!
    const categoryTriggers = onTriggerProficiencyGain('shield', 4);
    categoryTriggers.forEach(log => {
      addBattleLog(`✨ 盾術の系統熟練蓄積：${log}`);
    });

    setTimeout(() => {
      executeEnemyTurn(activeMonster!);
    }, 500);
  };

  // PLAYER DRINKS HP OR MP POTION IN BATTLE
  const handlePlayerUseItemInBattle = (item: Item) => {
    setIsItemMenuOpen(false);

    // Play heal SFX
    retroAudio.playSFX('heal');

    if (item.healHP) {
      const finalHp = Math.min(getMaxHp(), hpRef.current + item.healHP);
      updateHp(finalHp);
      onUpdatePlayer({ hp: finalHp });
      addBattleLog(`🧪 カバンから「${item.name}」を取り出して飲んだ。 HPが 【${item.healHP}】回復した。`);
    } else if (item.healMP) {
      const finalMp = Math.min(getMaxMp(), mpRef.current + item.healMP);
      updateMp(finalMp);
      onUpdatePlayer({ mp: finalMp });
      addBattleLog(`🧪 カバンから「${item.name}」を取り出して飲んだ。 MPが 【${item.healMP}】回復した。`);
    }

    // Deduct 1 from inventory
    onRemoveInventoryItem(item.id, 1);

    // Consume turn!
    setTimeout(() => {
      executeEnemyTurn(activeMonster!);
    }, 500);
  };

  // PLAYER ATTEMPTS ESCAPE FROM ACTIVE ENEMY
  const handlePlayerEscape = () => {
    if (!activeMonster) return;

    // Boss cannot be escaped!
    const isBoss = activeMonster.id === 'dragon_boss';
    if (isBoss) {
      addBattleLog(`❌ 古代竜の放つ圧倒的な威圧感が周囲を支配している！ この状況から逃走することは不可能だ！`);
      return;
    }

    // Calculate escape chance
    const relativeSpeed = getAgi() / activeMonster.agi;
    const escapeChance = 0.5 + (getLuk() * 0.004) + (relativeSpeed * 0.1);
    const rand = Math.random();

    if (rand < escapeChance) {
      addBattleLog(`🏃 💨 あなたは隙を見て全力でバックステップを切り、モンスターの視野から安全に逃げ出した！`);
      retroAudio.playSFX('flee');
      setTimeout(() => {
        setBattleOutcome('escaped');
        setActiveMonster(null);
        addExploreLog(`💨 モンスター「${activeMonster.name}」から無事に逃走し、戦闘を離脱しました。`);
        // Sync HP/MP to system state
        onUpdatePlayer({ hp: hpRef.current, mp: mpRef.current });
      }, 700);
    } else {
      addBattleLog(`❌ 逃走に失敗！ モンスターに回り込まれ、退路を断たれてしまった！`);
      setTimeout(() => {
        executeEnemyTurn(activeMonster);
      }, 550);
    }
  };

  // EXECUTE ENEMY COUNTER-ACTION
  const executeEnemyTurn = (currentMonster: Monster) => {
    if (currentMonster.hp <= 0) return;

    const mAtk = currentMonster.atk;
    const pDef = getDef();

    // Damage on player
    let isMonsterCrit = Math.random() < 0.05;
    // Guard reduces received damage enormously: divide by 2.5
    const defenseMultiplier = guardRef.current ? 2.5 : 1.0;
    
    let baseDamage = mAtk * (isMonsterCrit ? 1.5 : 1.0) - Math.floor(pDef * 0.4);
    let rawDamage = Math.max(1, Math.floor(baseDamage / defenseMultiplier));
    let finalDamageOnPlayer = Math.floor(rawDamage * (0.95 + Math.random() * 0.1));

    // Evasion check: player evasion percent
    const playerEva = Math.min(0.35, 0.05 + (getAgi() - currentMonster.agi) * 0.015 + getLuk() * 0.001);
    const isEvaded = Math.random() < playerEva && !guardRef.current;

    if (isEvaded) {
      addBattleLog(`💨 敵の攻撃！ しかしあなたは卓越した敏捷性で身を翻し、攻撃を軽やかに回避した！`);
    } else {
      const nextPlayerHp = Math.max(0, hpRef.current - finalDamageOnPlayer);
      updateHp(nextPlayerHp);
      onUpdatePlayer({ hp: nextPlayerHp });

      addBattleLog(`💥 【${currentMonster.name}】の容赦ない攻撃！ ${isMonsterCrit ? '🔴痛恨の一撃！' : ''} あなたは 【${finalDamageOnPlayer}】のダメージを受けた。`);
      
      if (nextPlayerHp <= 0) {
        handleBattleDefeat();
        return;
      }
    }

    // Reset player defense posture
    updateGuard(false);
    setCombatTurn(prev => prev + 1);
  };

  // COMBAT VICTORY OUTCOME RESOLUTION
  const handleBattleVictory = (slainMonster: Monster, bonusLogs: string[]) => {
    setBattleOutcome('victory');

    // Experience, Gold boosts
    // LUK bonus on gold
    const luckGoldBonusPercent = 1.0 + (getLuk() * 0.01);
    const earnedGold = Math.floor(slainMonster.gold * luckGoldBonusPercent);
    const earnedExp = slainMonster.exp;

    // Check item drops
    let droppedItem: Item | null = null;
    if (slainMonster.droppedItemChance) {
      const dropRoll = Math.random();
      // Luck increases drop rate chance by +0.5% per LUK point!
      const finalDropChance = slainMonster.droppedItemChance.chance * (1.0 + getLuk() * 0.02);
      if (dropRoll < finalDropChance) {
        droppedItem = slainMonster.droppedItemChance.item;
        onAddInventoryItem(droppedItem, 1);
      }
    }

    // Check level up in player state
    const currentExp = player.exp + earnedExp;
    let finalLevel = player.level;
    let finalNextExp = player.nextExp;
    let finalSp = player.sp;
    let leveledUpAlert = false;

    if (currentExp >= finalNextExp) {
      leveledUpAlert = true;
      finalLevel += 1;
      finalSp += 5; // Gains 5 Status points
      finalNextExp = Math.floor(finalNextExp * 1.6) + 50; // next leveling curve
    }

    onUpdatePlayer({
      gold: player.gold + earnedGold,
      exp: currentExp,
      level: finalLevel,
      nextExp: finalNextExp,
      sp: finalSp,
      hp: hpRef.current,
      mp: mpRef.current,
    });

    // Notify Quest Board
    onMonsterDefeated(slainMonster.id);

    addBattleLog(`🏆 【勝利！】 敵を無力化し、戦闘を平定した！`);
    addBattleLog(`💎 獲得戦利品:`);
    addBattleLog(`・ 金貨 + ${earnedGold} G ${getLuk() > 15 ? '(幸運の恵み！)' : ''}`);
    addBattleLog(`・ 経験値 + ${earnedExp} EXP`);
    if (droppedItem) {
      addBattleLog(`・ 🎁 敵がレア品をドロップ！ カバンに 「${droppedItem.name}」 を手に入れた！`);
    }

    if (leveledUpAlert) {
      retroAudio.playSFX('levelUp');
      addBattleLog(`🎉── レベルアップ！ ──🎉`);
      addBattleLog(`👑 【Lv. ${finalLevel}】 に到達しました！ 【5】ポイントのステータスSPを獲得！`);
    } else {
      retroAudio.playSFX('victory');
    }

    // Add overview to exploration terminal logs
    const exploreFinishMsg = leveledUpAlert 
      ? `敵「${slainMonster.name}」を撃破！ Lv.${finalLevel}にアップ！ ${earnedGold}Gを獲得しました。`
      : `敵「${slainMonster.name}」を撃破！ ${earnedGold}Gと ${earnedExp}EXPを獲得しました。`;
    
    addExploreLog(`⚔️ ${exploreFinishMsg}`);
  };

  // PLAYER FAINTS OUTCOME (DEFEAT)
  const handleBattleDefeat = () => {
    setBattleOutcome('defeat');
    retroAudio.playSFX('defeat');
    addBattleLog(`💀 【眼前が暗くなっていく……】`);
    addBattleLog(`あなたの体力が完全に尽き、意識を失った。`);

    // Call state penalties in Parent - returns custom descriptive recovery message log
    const penaltyMsg = onDefeatedPenalty();
    addBattleLog(`🔔 ${penaltyMsg}`);
  };

  // CLOSE BATTLE OVERLAY BACK TO TOWN OR EXPLORE
  const handleCloseBattleOverlay = () => {
    setActiveMonster(null);
    setBattleOutcome(null);
    setBattleLogs([]);
    
    // Automatically update Hp/Mp to full if defeated
    if (hpRef.current <= 0) {
      updateHp(Math.max(5, player.hp));
      updateMp(player.mp);
      setSelectedDungeon(null); // Booted back to town
    }
  };

  const getDungeonRankBadge = (recommendedLv: number) => {
    if (recommendedLv <= 2) return 'border-emerald-900 bg-emerald-950/20 text-emerald-400';
    if (recommendedLv <= 5) return 'border-cyan-900 bg-cyan-950/20 text-cyan-400';
    if (recommendedLv <= 9) return 'border-purple-900 bg-purple-950/20 text-fuchsia-400 font-semibold';
    return 'border-red-500/20 bg-red-950/20 text-rose-500 font-extrabold animate-pulse';
  };

  return (
    <div className="w-full relative min-h-[500px]">
      <AnimatePresence mode="wait">
        
        {/* DUNGEON SELECTION SCREEN (selectedDungeon === null) */}
        {!selectedDungeon && (
          <motion.div
            key="selection-screen"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-6"
          >
            <div className="bg-stone-900/95 border border-amber-950/40 rounded-xl p-5 shadow-lg shadow-black/30">
              <div className="flex items-center gap-3 mb-4 pb-2 border-b border-amber-500/10">
                <div className="p-2.5 bg-amber-900/15 text-amber-500 rounded-lg">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-semibold text-xl text-amber-200">未開ダンジョンのゲート選択</h2>
                  <p className="text-xs text-stone-400">Select an ancient ruin or forest area to venture and train proficiencies</p>
                </div>
              </div>

              <p className="text-stone-300 text-xs leading-relaxed mb-6 bg-stone-950/50 p-3 rounded-lg border border-stone-800/80">
                探索を進め、戦闘で剣術（通常攻撃・剣技）、魔術、盾術、神聖のアクションを直接行うことで、各分野の<strong>系統および個別スキル熟練度（XP）</strong>が直接跳ね上がります！
                <span className="text-amber-300 text-xs ml-1 font-semibold">※体力または魔法力が危なくなったら、いつでも途中で「街へ無事に帰還」できます。</span>
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DUNGEONS.map((dungeon) => {
                  const meetsRecommended = player.level >= dungeon.recommendedLv;
                  return (
                    <div
                      key={dungeon.id}
                      className={`bg-stone-950 border rounded-xl p-4.5 flex flex-col justify-between gap-4 transition duration-200 hover:border-amber-900/50 hover:bg-stone-950/90`}
                    >
                      <div>
                        {/* Title & Badge */}
                        <div className="flex justify-between items-start mb-2 font-mono">
                          <span className="font-bold text-stone-100 text-sm md:text-base">{dungeon.name}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded border uppercase ${getDungeonRankBadge(dungeon.recommendedLv)}`}>
                            推奨 Lv.{dungeon.recommendedLv}+
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-stone-400 text-xs leading-relaxed mb-3 mt-1.5 font-sans min-h-[46px]">
                          {dungeon.description}
                        </p>

                        <div className="flex gap-2.5 text-[11px] font-mono text-stone-500">
                          <span>階層深度: <span className="text-stone-300">{dungeon.stepsMax} 歩</span></span>
                          <span>危険度: <span className="text-amber-500">{dungeon.difficulty}</span></span>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2 border-t border-stone-900">
                        <button
                          onClick={() => handleSelectDungeon(dungeon)}
                          className="px-4 py-1.5 bg-amber-900/30 hover:bg-amber-500 hover:text-stone-950 border border-amber-900/50 hover:border-amber-500 rounded-lg text-sm font-semibold text-amber-200 transition"
                          id={`btn-enter-${dungeon.id}`}
                        >
                          このダンジョンを探索
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* DUNGEON ACTIVE EXPLORING MAIN PANEL */}
        {selectedDungeon && !activeMonster && (
          <motion.div
            key="exploring-panel"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            
            {/* LEFT SIDEBAR: CURRENT ACTIVE CONDITION */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="bg-stone-900/95 border border-amber-950/40 rounded-xl p-5 shadow-lg shadow-black/30">
                <span className="text-[10px] bg-amber-900/10 border border-amber-900/30 px-2 py-0.5 rounded text-amber-400 font-mono font-bold">
                  探索中 MAP
                </span>
                <h3 className="font-bold text-stone-100 text-base mt-2">{selectedDungeon.name}</h3>

                {/* Status HUD Inside exploration */}
                <div className="mt-5 space-y-4 font-mono">
                  {/* Progress distance slider */}
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-stone-400">進行度:</span>
                      <span className="text-amber-400 font-bold">
                        {Math.floor((exploringProgress / selectedDungeon.stepsMax) * 100)}% ({exploringProgress} / {selectedDungeon.stepsMax} 歩)
                      </span>
                    </div>
                    <div className="w-full bg-stone-950 h-3 rounded-full overflow-hidden border border-stone-800">
                      <div 
                        className="bg-gradient-to-r from-amber-600 to-amber-400 h-full transition-all duration-300"
                        style={{ width: `${(exploringProgress / selectedDungeon.stepsMax) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* HP bar */}
                  <div className="bg-stone-950 px-3.5 py-2.5 rounded-lg border border-stone-800/60">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-rose-400 font-semibold flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5" />
                        現在 HP
                      </span>
                      <span className="text-stone-200 font-bold">{playerCurrentHp} / {getMaxHp()}</span>
                    </div>
                    <div className="w-full bg-stone-900 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-rose-500 h-full transition-all duration-200"
                        style={{ width: `${(playerCurrentHp / getMaxHp()) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* MP bar */}
                  <div className="bg-stone-950 px-3.5 py-2.5 rounded-lg border border-stone-800/60">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-cyan-400 font-semibold flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5" />
                        現在 MP
                      </span>
                      <span className="text-stone-200 font-bold">{playerCurrentMp} / {getMaxMp()}</span>
                    </div>
                    <div className="w-full bg-stone-900 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-cyan-500 h-full transition-all duration-200"
                        style={{ width: `${(playerCurrentMp / getMaxMp()) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-2.5">
                  <button
                    onClick={handleTakeStep}
                    className="w-full py-4 bg-gradient-to-r from-amber-800 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-stone-900 font-extrabold text-base rounded-xl border border-amber-600/30 shadow-lg hover:shadow-amber-500/10 transition flex items-center justify-center gap-1.5"
                    id="btn-take-step"
                  >
                    洞窟／森林を 一歩進む
                    <ChevronRight className="w-5 h-5 text-stone-950" />
                  </button>

                  <button
                    onClick={handleLeaveDungeon}
                    className="w-full py-2.5 bg-stone-950 hover:bg-stone-900 text-stone-400 hover:text-stone-200 font-semibold text-xs border border-stone-800 hover:border-stone-700 rounded-lg transition"
                    id="btn-escape-town"
                  >
                    探索を切り上げて 街に安全帰還
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR: LOG WINDOW & EVENT OVERLAYS */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              {/* INTERACTIVE EVENT SCREEN POPUPS */}
              <div className="bg-stone-900/95 border border-amber-950/40 rounded-xl p-5 shadow-lg shadow-black/30 min-h-[350px] flex flex-col justify-between">
                
                <div>
                  <h4 className="font-semibold text-xs text-stone-500 border-b border-stone-800 pb-1.5 mb-3 uppercase tracking-wider font-mono">
                    ダンジョンログ (Exploratory Text Feed)
                  </h4>

                  {/* Logs feed frame */}
                  <div 
                    ref={logTerminalRef}
                    className="bg-stone-950 p-4 rounded-xl border border-stone-850 h-[220px] overflow-y-auto space-y-2 font-mono text-xs leading-relaxed text-stone-300"
                  >
                    {explorationLog.length === 0 ? (
                      <p className="text-stone-600 italic">「一歩進む」ボタンをクリックして、探索を開始してください……</p>
                    ) : (
                      explorationLog.map((log, idx) => (
                        <p key={idx} className={
                          log.includes('宝箱を発見') ? 'text-amber-400 font-semibold' :
                          log.includes('魔力泉') ? 'text-cyan-400' :
                          log.includes('赤に染まった') || log.includes('気配') ? 'text-rose-500 font-bold' :
                          log.includes('撃破') ? 'text-emerald-400' : 'text-stone-300'
                        }>
                          {log}
                        </p>
                      ))
                    )}
                  </div>
                </div>

                {/* CURRENT ACTIVE ADVENTURE SCREEN GRAPHIC OVERLAYS */}
                <div className="mt-4">
                  <AnimatePresence>
                    {chestFoundItem && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-amber-950/20 border border-amber-900/40 p-4 rounded-xl flex items-center gap-3.5"
                      >
                        <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/10 animate-bounce">
                          <Gift className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs text-amber-200 font-bold font-mono">🎁 宝箱から貴重品を発見！</p>
                          <p className="text-xs text-stone-400 mt-1 leading-normal">
                            手荷物袋に <span className="font-bold text-stone-200">「{chestFoundItem.name}」</span> が保管されました。さらに <span className="text-amber-400 font-bold">{chestFoundGold}Gold</span> を財布に収めました！
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {fountainHPHeal && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-cyan-950/20 border border-cyan-900/40 p-4 rounded-xl flex items-center gap-3.5"
                      >
                        <div className="p-3 bg-cyan-500/10 rounded-lg text-cyan-400 border border-cyan-500/10">
                          <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
                        </div>
                        <div>
                          <p className="text-xs text-cyan-200 font-bold font-mono">💧 霊験あらたかな泉の効能！</p>
                          <p className="text-xs text-stone-400 mt-1 leading-normal">
                            湧き出るマナと活力素により、全身の疲労と魔力回路が一時回復した。（HP +{fountainHPHeal} / MP +{fountainMPHeal}）
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>
            </div>

          </motion.div>
        )}

        {/* COMBAT ACTIVE SCREEN IF FIGHTING */}
        {selectedDungeon && activeMonster && (
          <motion.div
            key="battle-screen"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-stone-900 border border-red-950/40 rounded-xl p-5 shadow-2xl shadow-black/80 max-w-4xl mx-auto overflow-hidden"
          >
            {/* ENEMY SCREEN AREA */}
            <div className={`p-6 rounded-xl border border-red-900/20 bg-gradient-to-b from-stone-950 to-stone-900/40 relative mb-4`}>
              {/* Backglow element in fire volcanos */}
              {selectedDungeon.id === 'dragon_mount' && (
                <div className="absolute inset-0 bg-red-900/5 mix-blend-color-dodge animate-pulse rounded-xl" />
              )}
              
              <div className="flex flex-col items-center text-center relative z-10 py-3.5 font-mono">
                {/* Boss unique label */}
                {activeMonster.id === 'dragon_boss' && (
                  <span className="text-[10px] tracking-wider px-2.5 py-0.5 bg-red-950 border border-red-800 text-rose-400 font-extrabold rounded-full animate-bounce mb-3 uppercase">
                    🌋 WARNING - ANCIENT TYRANT
                  </span>
                )}
                
                <h3 className="text-xl md:text-2xl font-black text-rose-400 tracking-tight flex items-center gap-2">
                  <Sword className="w-5.5 h-5.5 text-rose-500 animate-pulse" />
                  {activeMonster.name}
                </h3>
                <p className="text-stone-500 text-xs mt-1 leading-normal max-w-lg">
                  「{activeMonster.dialogue || 'ウガァァァー！'}」
                </p>

                {/* HP BAR OF ENEMY */}
                <div className="w-full max-w-sm mt-5">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-rose-400 font-bold">MONSTER HP</span>
                    <span className="text-stone-200 font-bold">{activeMonster.hp} / {activeMonster.maxHp}</span>
                  </div>
                  <div className="w-full bg-stone-950 h-3.5 rounded-md overflow-hidden border border-red-900/30">
                    <div 
                      className="bg-gradient-to-r from-red-700 to-rose-500 h-full transition-all duration-300"
                      style={{ width: `${(activeMonster.hp / activeMonster.maxHp) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-4 text-[11px] text-stone-500 mt-3 font-mono">
                  <span>ATK: <span className="text-stone-400 font-bold">{activeMonster.atk}</span></span>
                  <span>DEF: <span className="text-stone-400 font-bold">{activeMonster.def}</span></span>
                  <span>SPD (AGI): <span className="text-stone-400 font-bold">{activeMonster.agi}</span></span>
                </div>
              </div>
            </div>

            {/* INTERACTIVE BATTLE LOG / COMMAND CONTROLS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-4">
              
              {/* CURRENT COMBAT LOG (LEFT) */}
              <div className="md:col-span-7 flex flex-col">
                <div className="bg-stone-950 p-4 rounded-xl border border-stone-850 h-[210px] overflow-y-auto flex flex-col justify-between">
                  <div ref={combatLogRef} className="space-y-1.5 font-mono text-xs overflow-y-auto max-h-[190px]">
                    {battleLogs.map((log, idx) => (
                      <p key={idx} className={
                        log.includes('⚔️') ? 'text-indigo-400 text-xs' :
                        log.includes('💥') ? 'text-rose-400' :
                        log.includes('💖') || log.includes('治癒') ? 'text-emerald-400 font-medium' :
                        log.includes('⭐') || log.includes('系統') ? 'text-amber-400 font-semibold' :
                        log.includes('🎉') || log.includes('アップ') ? 'text-yellow-400 font-semibold' :
                        'text-stone-300'
                      }>
                        {log}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* HUD / PLAYER STAT SUMMARY CONTROL (RIGHT) */}
              <div className="md:col-span-5 flex flex-col justify-between bg-stone-950/60 p-4 rounded-xl border border-stone-850 font-mono">
                <div>
                  <div className="flex justify-between items-center text-xs pb-1.5 border-b border-stone-800/80 mb-2.5">
                    <span className="text-stone-400 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-stone-400" />
                      あなた (Lv. {player.level})
                    </span>
                    <span className="text-stone-500 font-mono">TURN {combatTurn}</span>
                  </div>

                  {/* Player HP */}
                  <div className="mb-2">
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-rose-400 font-bold">HP</span>
                      <span className="text-stone-200">{playerCurrentHp} / {getMaxHp()}</span>
                    </div>
                    <div className="w-full bg-stone-900 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-rose-500 h-full transition-all duration-200"
                        style={{ width: `${(playerCurrentHp / getMaxHp()) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Player MP */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-cyan-400 font-bold">MP</span>
                      <span className="text-stone-200">{playerCurrentMp} / {getMaxMp()}</span>
                    </div>
                    <div className="w-full bg-stone-900 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-cyan-500 h-full transition-all duration-200"
                        style={{ width: `${(playerCurrentMp / getMaxMp()) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-3.5 flex flex-wrap gap-1 bg-stone-900/30 p-2 border border-stone-800/40 rounded-lg text-[10px] text-stone-400 font-mono">
                  <div className="w-1/2">ATK: <span className="text-stone-200">{getAtk()}</span></div>
                  <div className="w-1/2">DEF: <span className="text-stone-200">{getDef()}</span></div>
                  <div className="w-1/2">MAG: <span className="text-stone-200">{getMag()}</span></div>
                  <div className="w-1/2">AGI: <span className="text-stone-200">{getAgi()}</span></div>
                </div>
              </div>

            </div>

            {/* BOTTOM COMMAND INTERFACES */}
            {!battleOutcome ? (
              <div className="space-y-3 relative z-20">
                
                {/* Default Action Options Row */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono">
                  <button
                    onClick={handlePlayerAttack}
                    className="py-3 bg-indigo-950/60 hover:bg-indigo-600 hover:text-stone-950 font-bold text-xs sm:text-sm border border-indigo-900/80 rounded-lg text-indigo-300 transition duration-150 flex items-center justify-center gap-1.5"
                    id="btn-battle-atk"
                  >
                    <Sword className="w-4 h-4" />
                    剣撃攻撃
                  </button>

                  <button
                    onClick={() => {
                      setIsSkillMenuOpen(prev => !prev);
                      setIsItemMenuOpen(false);
                    }}
                    className={`py-3 font-bold text-xs sm:text-sm border rounded-lg transition duration-150 flex items-center justify-center gap-1.5 ${
                      isSkillMenuOpen 
                        ? 'bg-amber-500 text-stone-950 border-amber-500' 
                        : 'bg-amber-950/30 hover:bg-amber-500 hover:text-stone-950 border-amber-900 text-amber-300'
                    }`}
                    id="btn-battle-skill"
                  >
                    <Flame className="w-4 h-4 animate-pulse" />
                    スキル発動
                  </button>

                  <button
                    onClick={() => {
                      setIsItemMenuOpen(prev => !prev);
                      setIsSkillMenuOpen(false);
                    }}
                    className={`py-3 font-bold text-xs sm:text-sm border rounded-lg transition duration-150 flex items-center justify-center gap-1.5 ${
                      isItemMenuOpen 
                        ? 'bg-emerald-500 text-stone-950 border-emerald-500' 
                        : 'bg-emerald-950/30 hover:bg-emerald-500 hover:text-stone-950 border-emerald-900 text-emerald-300'
                    }`}
                    id="btn-battle-items"
                  >
                    <Gift className="w-4 h-4" />
                    カバン薬
                  </button>

                  <button
                    onClick={handlePlayerGuard}
                    className="py-3 bg-stone-950 hover:bg-stone-850 font-bold text-xs sm:text-sm border border-stone-800 rounded-lg text-stone-300 transition duration-150 flex items-center justify-center gap-1.5"
                    id="btn-battle-guard"
                  >
                    <Shield className="w-4 h-4" />
                    鉄壁の防御
                  </button>

                  <button
                    onClick={handlePlayerEscape}
                    className="py-3 bg-stone-950 hover:bg-rose-950/20 font-bold text-xs sm:text-sm border border-stone-800 hover:border-rose-900/20 rounded-lg text-stone-400 hover:text-rose-400 transition duration-150 flex items-center justify-center gap-1"
                    id="btn-battle-escape"
                  >
                    逃走する
                  </button>
                </div>

                {/* DYNAMIC EXPANDABLE MENUS (SKILLS LIST) */}
                <AnimatePresence>
                  {isSkillMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-stone-950 border border-amber-900/30 p-3.5 rounded-xl space-y-2 mt-2 max-h-[220px] overflow-y-auto"
                    >
                      <h4 className="text-stone-400 text-[11px] font-bold border-b border-stone-900 pb-1.5 mb-2 font-mono">
                        発動可能な習得スキル一覧:
                      </h4>

                      {skills.filter(s => s.isUnlocked).length === 0 ? (
                        <p className="text-stone-600 text-xs italic py-2 font-sans">ロック解除されているスキルがありません。レベルや系統熟練度を上げましょう。</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {skills.filter(s => s.isUnlocked).map(skill => {
                            const mpReduction = Math.min(35, Math.max(0, (skill.proficiencyLevel - 1) * 7));
                            const finalMpCost = Math.max(1, Math.round(skill.mpCost * (1 - mpReduction / 100)));
                            const meetsMp = playerCurrentMp >= finalMpCost;

                            return (
                              <button
                                key={skill.id}
                                disabled={!meetsMp}
                                onClick={() => handlePlayerCastSkill(skill)}
                                className="p-2.5 bg-stone-900/90 hover:bg-amber-950/40 border border-stone-800 hover:border-amber-900/30 rounded-xl text-left transition disabled:opacity-30 flex justify-between items-center"
                              >
                                <div className="font-mono">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-xs text-stone-200">{skill.name}</span>
                                    <span className="text-[10px] text-amber-500 font-bold">Lv.{skill.proficiencyLevel}</span>
                                  </div>
                                  <p className="text-[10px] text-stone-500 mt-0.5 line-clamp-1">{skill.description}</p>
                                </div>
                                <span className={`text-[10px] shrink-0 font-bold py-1 px-2 rounded-md ${meetsMp ? 'bg-cyan-950 text-cyan-400' : 'bg-stone-950 text-stone-600'}`}>
                                  MP {finalMpCost}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* DYNAMIC EXPANDABLE MENUS (CONSUMABLE POTIONS LIST) */}
                  {isItemMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-stone-950 border border-emerald-900/30 p-3.5 rounded-xl space-y-2 mt-2 max-h-[220px] overflow-y-auto"
                    >
                      <h4 className="text-stone-400 text-[11px] font-bold border-b border-stone-900 pb-1.5 mb-2 font-mono">
                        カバンの中の回復薬をお使いください:
                      </h4>

                      {inventory.filter(i => i.item.type === 'potion').length === 0 ? (
                        <p className="text-stone-600 text-xs italic py-2 font-sans">回復薬を所持していません。大商店で購入して戻りましょう。</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono">
                          {inventory.filter(i => i.item.type === 'potion').map(invItem => (
                            <button
                              key={invItem.item.id}
                              onClick={() => handlePlayerUseItemInBattle(invItem.item)}
                              className="p-2.5 bg-stone-900/90 hover:bg-emerald-950/40 border border-stone-800 hover:border-emerald-900/30 rounded-xl text-left transition flex justify-between items-center"
                            >
                              <div>
                                <span className="font-bold text-xs text-stone-200">{invItem.item.name}</span>
                                <p className="text-[10px] text-stone-500 mt-0.5">{invItem.item.description}</p>
                              </div>
                              <span className="text-[11px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-bold shrink-0">
                                所持 {invItem.quantity}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            ) : (
              // BATTLE OVER MODAL OVERLAY INSTEAD OF COMMANDS
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-stone-950 border border-stone-800 p-5 rounded-2xl flex flex-col items-center text-center relative z-20 font-mono"
              >
                {battleOutcome === 'victory' && (
                  <div>
                    <div className="h-12 w-12 rounded-full bg-emerald-900/20 text-emerald-400 flex items-center justify-center mx-auto mb-3 animate-bounce border border-emerald-900">
                      <ThumbsUp className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-bold text-emerald-400">MONSTER DEFEATED</h4>
                    <p className="text-stone-400 text-xs mt-1.5 max-w-sm mx-auto">
                      戦闘に完全勝利しました！熟練修練および獲得したゴールド、経験値等が正確に反映されました。
                    </p>

                    {/* Show sub logs of proficiency up notifications */}
                    {growthAlerts.length > 0 && (
                      <div className="my-3.5 max-w-md mx-auto p-3.5 bg-amber-950/10 border border-amber-900/30 rounded-xl space-y-1 text-left text-xs text-amber-200">
                        <span className="font-bold text-stone-400 text-[10px] block mb-1 uppercase">熟練獲得成果:</span>
                        {growthAlerts.map((logStr, lIdx) => (
                          <div key={lIdx} className="flex items-center gap-1 text-yellow-300">
                            <span className="text-[10px]">⭐</span> {logStr}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {battleOutcome === 'defeat' && (
                  <div>
                    <div className="h-12 w-12 rounded-full bg-rose-900/20 text-rose-400 flex items-center justify-center mx-auto mb-3 border border-rose-900/40">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-bold text-rose-500">YOU FAINTED</h4>
                    <p className="text-stone-400 text-xs mt-1.5 max-w-sm mx-auto p-2 bg-stone-900 rounded border border-stone-850">
                      体力がつき、冒険者に救出されました。身安全のため王都の病院に護送され治療を受けましたが、罰金ペナルティ（所持Gの一部を喪失）が適用されました。
                    </p>
                  </div>
                )}

                {battleOutcome === 'escaped' && (
                  <div>
                    <h4 className="text-lg font-bold text-sky-400">ESCAPED BATTLE</h4>
                    <p className="text-stone-400 text-xs mt-1.5">
                      モンスターの視線から安全に離脱しました。
                    </p>
                  </div>
                )}

                <button
                  onClick={handleCloseBattleOverlay}
                  className="mt-5 px-6 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-850 text-stone-300 rounded-lg text-xs font-semibold transition"
                  id="btn-close-victory"
                >
                  探索を続行、または町に戻る
                </button>
              </motion.div>
            )}

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};
