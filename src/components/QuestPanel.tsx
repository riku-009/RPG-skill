import React from 'react';
import { PlayerStats, Quest, Item } from '../types';
import { Award, CheckCircle2, ShieldAlert, Circle, Coins, BookOpen, Skull, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface QuestPanelProps {
  player: PlayerStats;
  availableQuests: Quest[];
  activeQuests: Quest[];
  onAcceptQuest: (questId: string) => void;
  onCompleteQuest: (questId: string) => void;
  onAbandonQuest: (questId: string) => void;
}

export const QuestPanel: React.FC<QuestPanelProps> = ({
  player,
  availableQuests,
  activeQuests,
  onAcceptQuest,
  onCompleteQuest,
  onAbandonQuest,
}) => {
  const getDifficultyColor = (diff: Quest['difficulty']) => {
    switch (diff) {
      case '★': return 'text-emerald-400';
      case '★★': return 'text-sky-400';
      case '★★★': return 'text-amber-400';
      case '★★★★': return 'text-orange-400';
      case '★★★★★': return 'text-rose-500 font-bold';
    }
  };

  const getItemColorByRarity = (rarity: Item['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-stone-400 border-stone-800 bg-stone-900/30';
      case 'rare': return 'text-sky-400 border-sky-900/30 bg-sky-900/10';
      case 'epic': return 'text-fuchsia-400 border-fuchsia-900/30 bg-fuchsia-900/10 font-medium';
      case 'legendary': return 'text-amber-400 border-amber-500/30 bg-amber-500/10 font-bold';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
      
      {/* LEFT COLUMN: ACCEPTED ACTIVE QUESTS */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <div className="bg-stone-900/95 border border-amber-950/40 rounded-xl p-5 shadow-lg shadow-black/30">
          <h3 className="font-semibold text-amber-200 border-b border-amber-500/10 pb-2.5 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            受注中のクエスト ({activeQuests.length} / 4)
          </h3>

          <p className="text-xs text-stone-400 leading-relaxed mb-4">
            ギルドで受注したクエストです。探索中に対象の敵を討伐するとカウントが進みます。完了条件を達成後、<strong>「報酬を受け取る」</strong>ことで経験値やゴールドを受け取れます。
          </p>

          {activeQuests.length === 0 ? (
            <div className="text-center py-10 bg-stone-950/40 border border-dashed border-stone-800 rounded-lg">
              <ShieldAlert className="w-8 h-8 text-stone-600 mx-auto mb-2" />
              <p className="text-stone-500 text-xs font-sans">現在受注している依頼はありません</p>
              <p className="text-[10px] text-stone-600 mt-1">右側の掲示板から依頼を受けましょう</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeQuests.map((quest) => {
                const isReady = quest.progress >= quest.targetCount;
                const percent = Math.min(100, (quest.progress / quest.targetCount) * 100);

                return (
                  <div 
                    key={quest.id} 
                    className={`bg-stone-950/80 border rounded-xl p-3.5 transition-colors ${
                      isReady ? 'border-emerald-800/60 bg-emerald-950/10' : 'border-stone-800'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1 font-mono">
                      <span className="font-bold text-xs text-stone-200">{quest.title}</span>
                      <span className={`text-[10px] ${getDifficultyColor(quest.difficulty)}`}>
                        {quest.difficulty}
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-400 mb-3 leading-relaxed">
                      {quest.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-3.5 font-mono">
                      <div className="flex justify-between text-[10px] text-stone-500 mb-1">
                        <span className="flex items-center gap-1">
                          <Skull className="w-3 h-3 text-stone-600" />
                          討伐進捗
                        </span>
                        <span className={`font-bold ${isReady ? 'text-emerald-400' : 'text-stone-400'}`}>
                          {quest.progress} / {quest.targetCount}
                        </span>
                      </div>
                      <div className="w-full bg-stone-900 h-1.5 rounded-full overflow-hidden border border-stone-800">
                        <div 
                          className={`h-full transition-all duration-300 ${isReady ? 'bg-emerald-500 animate-pulse' : 'bg-amber-600/70'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Rewards detail snippet in quest tracker */}
                    <div className="flex justify-between items-center pt-2.5 border-t border-stone-900 text-[10px] font-mono">
                      <div className="flex gap-2">
                        <span className="text-amber-500 font-bold">{quest.rewardGold}G</span>
                        <span className="text-purple-400 font-bold">{quest.rewardExp}EXP</span>
                      </div>
                      {isReady ? (
                        <button
                          onClick={() => onCompleteQuest(quest.id)}
                          className="px-2.5 py-1 bg-emerald-900/30 hover:bg-emerald-500 hover:text-stone-950 text-emerald-400 font-bold border border-emerald-800/80 rounded transition"
                        >
                          報告完了！
                        </button>
                      ) : (
                        <button
                          onClick={() => onAbandonQuest(quest.id)}
                          className="text-[10px] text-stone-600 hover:text-rose-400 transition"
                        >
                          破棄する
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: GUILD BULLETIN BOARD (AVAILABLE QUESTS) */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        <div className="bg-stone-900/95 border border-amber-950/40 rounded-xl p-5 shadow-lg shadow-black/30">
          <div className="flex items-center justify-between border-b border-amber-500/10 pb-2.5 mb-4">
            <div>
              <h3 className="font-semibold text-lg text-amber-200 flex items-center gap-2">
                <Award className="w-5.5 h-5.5 text-amber-500" />
                冒険者ギルドの依頼板
              </h3>
              <p className="text-xs text-stone-400">Accept contracts from citizens to earn rewards and build combat experience</p>
            </div>
            <span className="text-[11px] font-mono bg-amber-950 border border-amber-900/50 text-amber-300 px-2 py-0.5 rounded-full">
              ギルド所属：F級冒険者
            </span>
          </div>

          {availableQuests.length === 0 ? (
            <div className="text-center py-16 bg-stone-950/20 border border-dashed border-stone-900 rounded-xl">
              <CheckCircle2 className="w-12 h-12 text-stone-600 mx-auto mb-3" />
              <p className="text-stone-400 text-sm">現在、登録されている依頼はありません</p>
              <p className="text-xs text-stone-600 mt-1">すべての依頼を受託したか、解決済みです</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableQuests.map((quest) => {
                const questIdHash = `quest-${quest.id}`;
                return (
                  <div 
                    key={quest.id} 
                    className="bg-stone-950/70 hover:bg-stone-950 border border-stone-800/80 hover:border-amber-900/30 rounded-xl p-4 flex flex-col justify-between gap-4 transition duration-200.5"
                  >
                    <div>
                      {/* Quest Title & Difficulty */}
                      <div className="flex justify-between items-start mb-2.5">
                        <span className="font-bold text-stone-100 text-sm">{quest.title}</span>
                        <div className="flex items-center gap-1 text-[11px] font-mono">
                          <span className="text-stone-500 text-[10px]">難易度</span>
                          <span className={getDifficultyColor(quest.difficulty)}>{quest.difficulty}</span>
                        </div>
                      </div>

                      {/* Brief description */}
                      <p className="text-stone-400 text-xs leading-relaxed mb-3">
                        {quest.description}
                      </p>

                      {/* Items Reward description if exists */}
                      {quest.rewardItem && (
                        <div className="flex items-center gap-1.5 mb-2 font-mono">
                          <span className="text-[10px] text-stone-500">特別報酬:</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded border border-dashed uppercase ${getItemColorByRarity(quest.rewardItem.rarity)}`}>
                            🎁 {quest.rewardItem.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bottom row: rewards list + Accept action */}
                    <div className="flex justify-between items-center pt-2.5 border-t border-stone-900/60 font-mono">
                      <div className="flex gap-3 text-xs">
                        <div className="flex items-center text-amber-500 font-bold">
                          <span>{quest.rewardGold}</span>
                          <span className="text-[9px] text-stone-500 font-normal ml-0.5">G</span>
                        </div>
                        <div className="flex items-center text-purple-400 font-bold">
                          <span>{quest.rewardExp}</span>
                          <span className="text-[9px] text-stone-500 font-normal ml-0.5">EXP</span>
                        </div>
                      </div>

                      <button
                        onClick={() => onAcceptQuest(quest.id)}
                        disabled={activeQuests.length >= 4}
                        className="flex items-center gap-1 px-3 py-1.5 bg-amber-950/60 hover:bg-amber-500 hover:text-stone-950 text-amber-300 font-bold text-xs border border-amber-900/40 rounded-lg transition disabled:opacity-30 disabled:hover:bg-amber-950/60 disabled:hover:text-amber-300"
                        id={questIdHash}
                      >
                        依頼を受ける
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
