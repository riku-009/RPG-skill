import React from 'react';
import { PlayerStats, CategoryProficiency, Skill, Item, Equipment } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sword, Flame, Sparkles, Plus, Award, User, RefreshCw, Zap, Star, Heart } from 'lucide-react';

interface StatusPanelProps {
  player: PlayerStats;
  proficiencies: Record<string, CategoryProficiency>;
  skills: Skill[];
  equipment: Equipment;
  onAllocateStat: (statName: keyof Omit<PlayerStats, 'level' | 'exp' | 'nextExp' | 'gold' | 'sp' | 'hp' | 'mp'>) => void;
  onResetStats?: () => void;
  maxHp: number;
  maxMp: number;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({
  player,
  proficiencies,
  skills,
  equipment,
  onAllocateStat,
  onResetStats,
  maxHp,
  maxMp,
}) => {
  // Helpers to fetch equipment bonuses
  const getEquipmentBonus = (statKey: 'atk' | 'def' | 'mag' | 'agi' | 'luk' | 'hp' | 'mp') => {
    let total = 0;
    const items = [equipment.weapon, equipment.armor, equipment.accessory];
    for (const item of items) {
      if (!item) continue;
      if (statKey === 'atk' && item.addAtk) total += item.addAtk;
      if (statKey === 'def' && item.addDef) total += item.addDef;
      if (statKey === 'mag' && item.addMag) total += item.addMag;
      if (statKey === 'agi' && item.addAgi) total += item.addAgi;
      if (statKey === 'luk' && item.addLuk) total += item.addLuk;
      if (statKey === 'hp' && item.addMaxHP) total += item.addMaxHP;
      if (statKey === 'mp' && item.addMaxMP) total += item.addMaxMP;
    }
    return total;
  };

  const getStatInfo = (name: string, value: number, bonus: number) => {
    return (
      <div className="flex justify-between items-center py-2.5 border-b border-amber-900/10">
        <span className="text-stone-300 font-medium text-sm">{name}</span>
        <div className="flex items-center gap-1.5 font-mono">
          <span className="text-stone-100 font-semibold">{value}</span>
          {bonus > 0 && (
            <span className="text-emerald-500 text-xs font-semibold">+{bonus}</span>
          )}
          {bonus < 0 && (
            <span className="text-rose-500 text-xs font-semibold">{bonus}</span>
          )}
        </div>
      </div>
    );
  };

  const getProfCategoryIcon = (id: string) => {
    switch (id) {
      case 'sword':
        return <Sword className="w-5 h-5 text-indigo-400" />;
      case 'magic':
        return <Flame className="w-5 h-5 text-orange-400" />;
      case 'shield':
        return <Shield className="w-5 h-5 text-emerald-400" />;
      case 'holy':
        return <Sparkles className="w-5 h-5 text-amber-400" />;
      default:
        return <User className="w-5 h-5 text-stone-400" />;
    }
  };

  const getElementColor = (element: string) => {
    switch (element) {
      case 'fire': return 'bg-amber-950 text-orange-400 border-orange-900/30';
      case 'water': return 'bg-indigo-950 text-sky-400 border-sky-900/30';
      case 'wind': return 'bg-teal-950 text-teal-400 border-teal-900/30';
      case 'light': return 'bg-yellow-950 text-amber-300 border-amber-800/30';
      case 'physical': return 'bg-stone-900 text-stone-300 border-stone-800';
      default: return 'bg-stone-900 text-stone-400 border-stone-800';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT: Core Status Allocation & Derived Stats */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        
        {/* Level and Core Info */}
        <div className="bento-card p-6 shadow-xl">
          <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 font-sans">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-white tracking-tight">主人公の基本情報</h3>
                <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Status & Parameters</p>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-slate-350 text-xs font-bold">
                Next <span className="text-indigo-400">{player.nextExp - player.exp}</span> EXP
              </div>
              <div className="w-28 bg-slate-950 h-2 rounded-full overflow-hidden mt-1.5 border border-slate-800/70">
                <div 
                  className="bg-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (player.exp / player.nextExp) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bento-inner-panel p-4 mb-5 font-mono">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">LEVEL</span>
              <span className="text-2xl font-black text-indigo-455">Lv. {player.level}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">所有ゴールド</span>
              <span className="text-2xl font-black text-amber-455">{player.gold}<span className="text-xs text-slate-400 ml-1 font-normal">G</span></span>
            </div>
          </div>

          {/* Quick stats: Max HP, MP, Attack, Defense */}
          <div className="grid grid-cols-2 gap-3 mb-3 text-sm font-mono">
            <div className="bento-inner-panel p-3">
              <div className="flex items-center gap-1.5 text-rose-500 mb-1">
                <Heart className="w-3.5 h-3.5 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-rose-455 font-sans">生命力 HP</span>
              </div>
              <div className="text-lg font-black text-slate-100">
                {maxHp} <span className="text-xs text-slate-500 font-normal">({player.hp}/{maxHp})</span>
              </div>
            </div>

            <div className="bento-inner-panel p-3">
              <div className="flex items-center gap-1.5 text-cyan-400 mb-1">
                <Zap className="w-3.5 h-3.5" />
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-405 font-sans">魔力 MP</span>
              </div>
              <div className="text-lg font-black text-slate-100">
                {maxMp} <span className="text-xs text-slate-500 font-normal">({player.mp}/{maxMp})</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2 text-center text-xs font-mono text-slate-450">
            <div className="p-2.5 bg-slate-950/40 border border-slate-900 rounded-xl">
              <span className="block text-slate-500 text-[9px] font-bold uppercase tracking-wider">物理攻撃力</span>
              <span className="font-extrabold text-slate-100 text-sm block mt-0.5">
                {player.str + getEquipmentBonus('atk')}
              </span>
            </div>
            <div className="p-2.5 bg-slate-950/40 border border-slate-900 rounded-xl">
              <span className="block text-slate-500 text-[9px] font-bold uppercase tracking-wider">物理防御力</span>
              <span className="font-extrabold text-slate-100 text-sm block mt-0.5">
                {Math.floor(player.vit * 1.5) + getEquipmentBonus('def')}
              </span>
            </div>
            <div className="p-2.5 bg-slate-950/45 border border-slate-900 rounded-xl">
              <span className="block text-slate-500 text-[9px] font-bold uppercase tracking-wider">魔法威能</span>
              <span className="font-extrabold text-slate-100 text-sm block mt-0.5">
                {player.int + getEquipmentBonus('mag')}
              </span>
            </div>
          </div>
        </div>

        {/* Ability Point Allocation */}
        <div className="bento-card p-6 shadow-xl">
          <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-extrabold text-white tracking-tight">ステータス割り振り</h3>
              <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Allocate raw abilities</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">残りSP:</span>
              <span className="font-mono font-black bg-indigo-950 border border-indigo-500/30 px-3 py-1 rounded-xl text-indigo-400 text-sm">
                {player.sp}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400 bento-inner-panel p-3.5 mb-5 leading-relaxed">
            レベルアップや一部クエストで獲得した<strong className="text-indigo-450 text-xs">SP（ステータスポイント）</strong>を自由に割り振って、独自のビルドを構築できます。<span className="text-indigo-300">力は剣攻撃、体力は耐久、知力は魔法、素早さは回避＆先制を強化します。</span>
          </p>

          <div className="space-y-3 font-mono">
            {/* STR */}
            <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-2xl border border-slate-850/60">
              <div>
                <span className="text-slate-100 font-extrabold text-sm block">【力】 力 (STR)</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">物理ダメージ倍率、HP・ATKの増加</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-100 font-black text-base">{player.str}</span>
                <button
                  onClick={() => onAllocateStat('str')}
                  disabled={player.sp <= 0}
                  className="p-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl disabled:opacity-30 transition-all shadow-md active:scale-95 flex items-center justify-center border border-indigo-500/20"
                  id="btn-alloc-str"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* VIT */}
            <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-2xl border border-slate-855/60">
              <div>
                <span className="text-slate-100 font-extrabold text-sm block">【体力】 耐久力 (VIT)</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">最大生命力、防御力の底上げ</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-100 font-black text-base">{player.vit}</span>
                <button
                  onClick={() => onAllocateStat('vit')}
                  disabled={player.sp <= 0}
                  className="p-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl disabled:opacity-30 transition-all shadow-md active:scale-95 flex items-center justify-center border border-indigo-500/20"
                  id="btn-alloc-vit"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* AGI */}
            <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-2xl border border-slate-855/60">
              <div>
                <span className="text-slate-100 font-extrabold text-sm block">【敏捷】 素早さ (AGI)</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">敵への先制率、確率の回避補正</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-100 font-black text-base">{player.agi}</span>
                <button
                  onClick={() => onAllocateStat('agi')}
                  disabled={player.sp <= 0}
                  className="p-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl disabled:opacity-30 transition-all shadow-md active:scale-95 flex items-center justify-center border border-indigo-500/20"
                  id="btn-alloc-agi"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* INT */}
            <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-2xl border border-slate-855/60">
              <div>
                <span className="text-slate-100 font-extrabold text-sm block">【知力】 魔力 (INT)</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">魔導威力、最大魔法力の著しい増加</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-100 font-black text-base">{player.int}</span>
                <button
                  onClick={() => onAllocateStat('int')}
                  disabled={player.sp <= 0}
                  className="p-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl disabled:opacity-30 transition-all shadow-md active:scale-95 flex items-center justify-center border border-indigo-500/20"
                  id="btn-alloc-int"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* DEX */}
            <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-2xl border border-slate-855/60">
              <div>
                <span className="text-slate-100 font-extrabold text-sm block">【器用】 器用さ (DEX)</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">攻撃命中係数、確率の致命打倍率</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-100 font-black text-base">{player.dex}</span>
                <button
                  onClick={() => onAllocateStat('dex')}
                  disabled={player.sp <= 0}
                  className="p-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl disabled:opacity-30 transition-all shadow-md active:scale-95 flex items-center justify-center border border-indigo-500/20"
                  id="btn-alloc-dex"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* LUK */}
            <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-2xl border border-slate-855/60">
              <div>
                <span className="text-slate-100 font-extrabold text-sm block">【幸運】 運 (LUK)</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">ドロップ選別優位、致命打、逃走成功率</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-100 font-black text-base">{player.luk}</span>
                <button
                  onClick={() => onAllocateStat('luk')}
                  disabled={player.sp <= 0}
                  className="p-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl disabled:opacity-30 transition-all shadow-md active:scale-95 flex items-center justify-center border border-indigo-500/20"
                  id="btn-alloc-luk"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          {onResetStats && (
            <div className="flex justify-end mt-5">
              <button 
                onClick={onResetStats}
                className="text-[11px] text-slate-500 hover:text-rose-450 flex items-center gap-1.5 border border-slate-850 hover:border-rose-900/40 bg-slate-950/40 px-3 py-1.5 rounded-xl transition-all font-sans font-bold shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                ステ振りをリセット (SP初期化)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: System Proficiencies & Skills Unlock State */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="bento-card p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-800">
            <div className="p-2.5 bg-indigo-950 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white tracking-tight">修練系統の熟練度</h3>
              <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Proficiency Categories</p>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed mb-6 bento-inner-panel p-3.5">
            戦闘中に該当アクションをとると、系譜ごとの<strong>「系統熟練度（XP）」</strong>が上昇します。
            レベルが上がると、その系統に対応した強力な<span className="text-indigo-300 font-bold">アクティブスキルが順次解放</span>されます。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
            {(Object.values(proficiencies) as CategoryProficiency[]).map((prof) => {
              const progressPercent = Math.min(100, (prof.exp / prof.nextExp) * 100);
              return (
                <div key={prof.id} className="bg-slate-950/40 border border-slate-850/60 p-4 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        {getProfCategoryIcon(prof.id)}
                        <span className="font-extrabold text-sm text-slate-100">{prof.name}</span>
                      </div>
                      <span className="text-indigo-400 font-black font-sans text-xs bg-indigo-950/80 px-2 py-0.5 rounded-lg border border-indigo-500/20">Rank {prof.level}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mb-4 ml-7 leading-relaxed">
                      {prof.id === 'sword' && '通常攻撃、物理スキル発動で成長'}
                      {prof.id === 'magic' && '火霊・氷晶・雷電魔導発動で成長'}
                      {prof.id === 'shield' && '防御、守守盾技、挑発などの発動で成長'}
                      {prof.id === 'holy' && '基本・聖陣治癒、光輝裁きの発動で成長'}
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1.5 font-mono">
                      <span className="text-slate-500 font-bold">熟練EXP</span>
                      <span className="font-extrabold">{prof.exp} / {prof.nextExp}</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800/40">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          prof.id === 'sword' ? 'bg-indigo-505 bg-gradient-to-r from-blue-500 to-indigo-500' :
                          prof.id === 'magic' ? 'bg-orange-505 bg-gradient-to-r from-amber-550 to-orange-500' :
                          prof.id === 'shield' ? 'bg-emerald-505 bg-gradient-to-r from-teal-500 to-emerald-500' : 'bg-pink-505 bg-gradient-to-r from-violet-500 to-pink-500'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mastered Skills List */}
        <div className="bento-card p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-950 text-indigo-400 rounded-xl border border-indigo-500/20">
                <Star className="w-5 h-5 text-indigo-455" />
              </div>
              <div>
                <h3 className="font-extrabold text-white tracking-tight">所持スキル & 個別スキル熟練度</h3>
                <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Skill proficiencies</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed mb-5 bento-inner-panel p-3.5">
            個別のスキルも戦闘で使用するたびに<strong>自身の習熟度（熟練度）</strong>が成長します。
            スキルレベルが上がると、<span className="text-indigo-300 font-bold">消費MPの軽減（最大35%減）</span>および<span className="text-indigo-200 font-bold">発動威力の大幅な向上</span>が恩恵として付与されます。
          </p>

          <div className="space-y-4">
            {skills.map((skill) => {
              const reqProfName = proficiencies[skill.category]?.name || '';
              const isLocked = !skill.isUnlocked;

              if (isLocked) {
                return (
                  <div key={skill.id} className="bg-slate-950/20 border border-slate-900/65 p-4 rounded-2xl flex justify-between items-center opacity-40 filter grayscale">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-sm font-extrabold">？？？？？</span>
                        <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-500 px-2 py-0.5 rounded-lg uppercase font-bold tracking-wider">
                          ロック
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 font-sans">
                        必要条件：<strong>{reqProfName}</strong> 熟練Rank {skill.unlockLevel} 以上
                      </p>
                    </div>
                    <div className="text-[10px] border border-dashed border-slate-800 text-slate-600 p-2 rounded-xl bg-slate-950/60 font-mono text-center font-bold">
                      未解放
                    </div>
                  </div>
                );
              }

              const skillPct = Math.min(100, (skill.proficiencyExp / skill.proficiencyNextExp) * 100);
              const mpReduction = Math.min(35, Math.max(0, (skill.proficiencyLevel - 1) * 7));
              const finalMp = Math.max(1, Math.round(skill.mpCost * (1 - mpReduction / 100)));

              return (
                <div key={skill.id} className="bg-slate-950/40 border border-slate-850/60 hover:border-indigo-500/20 p-4 rounded-2xl flex flex-col gap-3.5 transition-all duration-300 shadow-sm hover:shadow-md">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-slate-100 font-black text-sm tracking-tight">{skill.name}</span>
                      <span className={`text-[9px] border px-2 py-0.5 rounded-lg font-mono font-black tracking-wider uppercase ${getElementColor(skill.element)}`}>
                        {skill.category === 'sword' ? '剣術' :
                         skill.category === 'magic' ? '魔術' :
                         skill.category === 'shield' ? '盾術' : '神聖'}·{skill.element.toUpperCase()}
                      </span>
                      <span className="text-indigo-400 font-black text-xs font-mono bg-indigo-950/50 px-2 py-0.5 rounded-lg border border-indigo-500/10">
                        Lv.{skill.proficiencyLevel}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2.5 text-xs font-mono ml-auto md:ml-0">
                      {mpReduction > 0 && (
                        <span className="text-emerald-500 text-[10px] font-extrabold bg-emerald-950/30 px-1.5 py-0.5 rounded-md border border-emerald-900/10">MP-{mpReduction}%</span>
                      )}
                      <span className="text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded-lg border border-cyan-900/30 font-bold">
                        消費MP: <span className="line-through text-slate-600 mr-0.5 text-[10px]">{skill.mpCost}</span> {finalMp}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-400 text-xs leading-relaxed font-sans font-medium">
                    {skill.description}
                  </p>

                  <div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1.5 font-mono">
                      <span>スキル習熟度</span>
                      <span className="font-bold">Level EXP: {skill.proficiencyExp} / {skill.proficiencyNextExp}</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800/40">
                      <div 
                        className="bg-indigo-550 bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-300"
                        style={{ width: `${skillPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
