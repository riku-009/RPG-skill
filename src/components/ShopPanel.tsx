import React, { useState } from 'react';
import { PlayerStats, Item, InventoryItem, Equipment, ITEMS } from '../types';
import { ShoppingBag, Coins, ShieldCheck, Zap, HelpCircle, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ShopPanelProps {
  player: PlayerStats;
  inventory: InventoryItem[];
  equipment: Equipment;
  onBuyItem: (item: Item) => void;
  onSellItem: (itemId: string) => void;
  onEquipItem: (item: Item) => void;
  onUnequipItem: (slot: 'weapon' | 'armor' | 'accessory') => void;
  onUseItem?: (item: Item) => void; // Support consumption inside inventory
}

export const ShopPanel: React.FC<ShopPanelProps> = ({
  player,
  inventory,
  equipment,
  onBuyItem,
  onSellItem,
  onEquipItem,
  onUnequipItem,
  onUseItem,
}) => {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'equip'>('buy');
  const [shopCategory, setShopCategory] = useState<'all' | 'equipment' | 'potions'>('all');

  // Items for sale in the shop
  const shopItems = Object.values(ITEMS);

  const filteredShopItems = shopItems.filter((item) => {
    if (shopCategory === 'all') return true;
    if (shopCategory === 'equipment') return item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory';
    if (shopCategory === 'potions') return item.type === 'potion';
    return true;
  });

  const getRarityBadgeColor = (rarity: Item['rarity']) => {
    switch (rarity) {
      case 'common': return 'border-stone-700 bg-stone-900 text-stone-400';
      case 'rare': return 'border-sky-900/40 bg-sky-900/10 text-sky-400';
      case 'epic': return 'border-fuchsia-900/40 bg-fuchsia-900/15 text-fuchsia-400 font-semibold';
      case 'legendary': return 'border-amber-500/30 bg-amber-500/10 text-amber-400 font-bold animate-pulse';
    }
  };

  const getRarityBgColorClass = (rarity: Item['rarity']) => {
    switch (rarity) {
      case 'common': return 'hover:bg-stone-900/30';
      case 'rare': return 'hover:bg-sky-950/20';
      case 'epic': return 'hover:bg-fuchsia-950/25';
      case 'legendary': return 'hover:bg-amber-950/25';
    }
  };

  const getItemStatsSpan = (item: Item) => {
    const list: string[] = [];
    if (item.addAtk) list.push(`攻撃力 +${item.addAtk}`);
    if (item.addDef) list.push(`防御力 +${item.addDef}`);
    if (item.addMag) list.push(`魔力 +${item.addMag}`);
    if (item.addAgi) {
      const isPos = item.addAgi > 0;
      list.push(`先制速度 ${isPos ? '+' : ''}${item.addAgi}`);
    }
    if (item.addLuk) list.push(`運 +${item.addLuk}`);
    if (item.addMaxHP) list.push(`最大HP +${item.addMaxHP}`);
    if (item.addMaxMP) list.push(`最大MP +${item.addMaxMP}`);
    if (item.healHP) list.push(`HP回復 +${item.healHP}`);
    if (item.healMP) list.push(`MP回復 +${item.healMP}`);

    if (list.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1 mt-1.5">
        {list.map((stat, idx) => (
          <span 
            key={idx} 
            className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
              stat.includes('回復') ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/30' :
              stat.includes('+') ? 'bg-amber-950/30 text-amber-300 border-amber-900/20' : 
              'bg-rose-950/30 text-rose-400 border-rose-900/20'
            }`}
          >
            {stat}
          </span>
        ))}
      </div>
    );
  };

  const handleUseConsumable = (inventoryItem: InventoryItem) => {
    if (onUseItem && inventoryItem.item.type === 'potion') {
      onUseItem(inventoryItem.item);
    }
  };

  return (
    <div className="bg-stone-900/95 border border-amber-950/40 rounded-xl p-5 shadow-lg shadow-black/30 w-full">
      {/* SHOP HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-amber-500/10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-900/15 text-amber-400 rounded-lg">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold text-xl text-amber-200">王都レムリアの大商店</h2>
            <p className="text-xs text-stone-400">Buy potions, legendary equipment, and manage inventory</p>
          </div>
        </div>

        {/* Player Wallet Widget */}
        <div className="flex items-center gap-2.5 bg-stone-950/90 border border-amber-500/20 px-4 py-2 rounded-xl font-mono">
          <Coins className="w-5 h-5 text-amber-400 animate-spin-slow" />
          <span className="text-stone-400 text-xs">所持金:</span>
          <span className="text-amber-400 font-bold text-lg">{player.gold}</span>
          <span className="text-stone-400 text-xs">G</span>
        </div>
      </div>

      {/* TABS (BUY, SELL, EQUIP) */}
      <div className="flex border-b border-stone-800 gap-1.5 mb-5 font-mono">
        <button
          onClick={() => setActiveTab('buy')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-transform ${
            activeTab === 'buy'
              ? 'bg-amber-950/60 border-t border-x border-amber-900/50 text-amber-200 -mb-[1px]'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/40'
          }`}
          id="btn-shop-buy"
        >
          道具屋 (購入)
        </button>
        <button
          onClick={() => setActiveTab('sell')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-transform ${
            activeTab === 'sell'
              ? 'bg-amber-950/60 border-t border-x border-amber-900/50 text-amber-200 -mb-[1px]'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/40'
          }`}
          id="btn-shop-sell"
        >
          買取処 (売却)
        </button>
        <button
          onClick={() => setActiveTab('equip')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-transform ${
            activeTab === 'equip'
              ? 'bg-amber-950/60 border-t border-x border-amber-900/50 text-amber-200 -mb-[1px]'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/40'
          }`}
          id="btn-shop-equip"
        >
          現用装備 · カバン
        </button>
      </div>

      {/* TAB CONTENT: BUY */}
      {activeTab === 'buy' && (
        <div>
          {/* Shop categories */}
          <div className="flex gap-2 mb-4 text-xs font-mono">
            <button
              onClick={() => setShopCategory('all')}
              className={`px-3 py-1 rounded-md border ${
                shopCategory === 'all'
                  ? 'bg-amber-900/20 text-amber-300 border-amber-900/40'
                  : 'bg-stone-950/40 border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              すべて表示
            </button>
            <button
              onClick={() => setShopCategory('equipment')}
              className={`px-3 py-1 rounded-md border ${
                shopCategory === 'equipment'
                  ? 'bg-amber-900/20 text-amber-300 border-amber-900/40'
                  : 'bg-stone-950/40 border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              装備品
            </button>
            <button
              onClick={() => setShopCategory('potions')}
              className={`px-3 py-1 rounded-md border ${
                shopCategory === 'potions'
                  ? 'bg-amber-900/20 text-amber-300 border-amber-900/40'
                  : 'bg-stone-950/40 border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              消耗品 (薬)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredShopItems.map((item) => {
              const meetsPrice = player.gold >= item.price;
              return (
                <div
                  key={item.id}
                  className={`bg-stone-950/70 border border-stone-800/80 rounded-xl p-4 flex flex-col justify-between gap-3 transition-colors duration-200 shadow-sm ${getRarityBgColorClass(item.rarity)}`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="font-bold text-stone-100 text-sm">{item.name}</span>
                      <span className={`text-[9px] uppercase border px-1.5 py-0.5 rounded font-mono ${getRarityBadgeColor(item.rarity)}`}>
                        {item.rarity}
                      </span>
                    </div>

                    <p className="text-stone-400 text-xs leading-relaxed min-h-[32px]">
                      {item.description}
                    </p>

                    {/* Stats modifiers list */}
                    {getItemStatsSpan(item)}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-stone-900 font-mono">
                    <div className="flex items-center gap-1">
                      <span className="text-amber-400 text-sm font-bold">{item.price}</span>
                      <span className="text-stone-500 text-[11px]">G</span>
                    </div>

                    <button
                      onClick={() => onBuyItem(item)}
                      disabled={!meetsPrice}
                      className="px-3.5 py-1.5 bg-amber-900/20 hover:bg-amber-500 hover:text-stone-950 font-bold text-xs border border-amber-900/40 rounded-lg text-amber-300 transition duration-150 disabled:opacity-30 disabled:hover:bg-amber-900/20 disabled:hover:text-amber-300"
                    >
                      購入する
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: SELL */}
      {activeTab === 'sell' && (
        <div>
          {inventory.length === 0 ? (
            <div className="text-center py-12 bg-stone-950/40 border border-dashed border-stone-800 rounded-xl">
              <Package className="w-10 h-10 text-stone-600 mx-auto mb-3" />
              <p className="text-stone-400 text-sm font-sans">カバンの中に売却可能なアイテムがありません</p>
              <p className="text-xs text-stone-600 mt-1">手に入れた武器や不要な薬を売って換金しましょう</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {inventory.map((invItem) => {
                const item = invItem.item;
                return (
                  <div
                    key={invItem.item.id}
                    className="bg-stone-950/70 border border-stone-800/80 rounded-xl p-4 flex flex-col justify-between gap-3 transition-colors hover:bg-stone-900/20"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-stone-100 text-sm">{item.name}</span>
                          <span className="text-xs text-stone-500 ml-1.5 font-mono">× {invItem.quantity}</span>
                        </div>
                        <span className={`text-[9px] uppercase border px-1.5 py-0.5 rounded font-mono ${getRarityBadgeColor(item.rarity)}`}>
                          {item.rarity}
                        </span>
                      </div>

                      <p className="text-stone-400 text-xs mt-1.5 leading-relaxed">
                        {item.description}
                      </p>

                      {getItemStatsSpan(item)}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-stone-900 font-mono">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-stone-500">買取価格 (1個あたり)</span>
                        <div className="flex items-center gap-1">
                          <span className="text-amber-500 text-sm font-bold">{item.sellPrice}</span>
                          <span className="text-stone-600 text-[10px]">G</span>
                        </div>
                      </div>

                      <button
                        onClick={() => onSellItem(item.id)}
                        className="px-3.5 py-1.5 bg-rose-950/20 hover:bg-rose-500 hover:text-stone-950 font-bold text-xs border border-rose-900/30 rounded-lg text-rose-300 transition duration-150"
                      >
                        1個売却
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: EQUIPMENT & BAG */}
      {activeTab === 'equip' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
          
          {/* EQUIPPED SLOTS (LEFT) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <h3 className="font-semibold text-sm text-stone-400 border-b border-stone-800 pb-1.5 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              現在の装備スロット
            </h3>

            <div className="space-y-3 font-mono">
              {/* WEAPON SLOT */}
              <div className="bg-stone-950/80 border border-stone-800 p-3 rounded-xl">
                <span className="text-stone-500 text-[11px] block mb-1">武器 (WEAPON)</span>
                {equipment.weapon ? (
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-sm text-stone-200">{equipment.weapon.name}</span>
                      {getItemStatsSpan(equipment.weapon)}
                    </div>
                    <button
                      onClick={() => onUnequipItem('weapon')}
                      className="text-xs bg-stone-900 hover:bg-rose-950/30 border border-stone-800 hover:border-rose-900 hover:text-rose-400 px-2.5 py-1 rounded text-stone-400 transition"
                    >
                      外す
                    </button>
                  </div>
                ) : (
                  <span className="text-stone-600 text-xs block italic py-1">未装備 (素手)</span>
                )}
              </div>

              {/* ARMOR SLOT */}
              <div className="bg-stone-950/80 border border-stone-800 p-3 rounded-xl">
                <span className="text-stone-500 text-[11px] block mb-1">防具 (ARMOR)</span>
                {equipment.armor ? (
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-sm text-stone-200">{equipment.armor.name}</span>
                      {getItemStatsSpan(equipment.armor)}
                    </div>
                    <button
                      onClick={() => onUnequipItem('armor')}
                      className="text-xs bg-stone-900 hover:bg-rose-950/30 border border-stone-800 hover:border-rose-900 hover:text-rose-400 px-2.5 py-1 rounded text-stone-400 transition"
                    >
                      外す
                    </button>
                  </div>
                ) : (
                  <span className="text-stone-600 text-xs block italic py-1">未装備 (普段着)</span>
                )}
              </div>

              {/* ACCESSORY SLOT */}
              <div className="bg-stone-950/80 border border-stone-800 p-3 rounded-xl">
                <span className="text-stone-500 text-[11px] block mb-1">装飾品 (ACCESSORY)</span>
                {equipment.accessory ? (
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-sm text-stone-200">{equipment.accessory.name}</span>
                      {getItemStatsSpan(equipment.accessory)}
                    </div>
                    <button
                      onClick={() => onUnequipItem('accessory')}
                      className="text-xs bg-stone-900 hover:bg-rose-950/30 border border-stone-800 hover:border-rose-900 hover:text-rose-400 px-2.5 py-1 rounded text-stone-400 transition"
                    >
                      外す
                    </button>
                  </div>
                ) : (
                  <span className="text-stone-600 text-xs block italic py-1">未装備</span>
                )}
              </div>
            </div>
          </div>

          {/* BAG / INVENTORY ACTIONS (RIGHT) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <h3 className="font-semibold text-sm text-stone-400 border-b border-stone-800 pb-1.5 flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-500" />
              手荷物カバンの中身 (アイテム使用·装備)
            </h3>

            {inventory.length === 0 ? (
              <div className="text-center py-10 bg-stone-950/40 border border-dashed border-stone-800 rounded-xl font-sans">
                <p className="text-stone-500 text-xs">カバンが空っぽです</p>
              </div>
            ) : (
              <div className="space-y-2.5 font-mono">
                {inventory.map((invItem) => {
                  const item = invItem.item;
                  const isPotion = item.type === 'potion';

                  return (
                    <div 
                      key={item.id} 
                      className="bg-stone-950/60 border border-stone-800/80 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-stone-100">{item.name}</span>
                          <span className="text-[10px] bg-stone-900 px-1.5 py-0.5 rounded text-amber-400 font-semibold font-mono">
                            残 {invItem.quantity} 個
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">{item.description}</p>
                        {getItemStatsSpan(item)}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isPotion ? (
                          <button
                            onClick={() => handleUseConsumable(invItem)}
                            className="w-full sm:w-auto px-3.5 py-1 bg-emerald-900/20 hover:bg-emerald-500 hover:text-stone-950 font-bold text-xs border border-emerald-950 rounded-lg text-emerald-300 transition duration-150"
                          >
                            今すぐ使う
                          </button>
                        ) : (
                          <button
                            onClick={() => onEquipItem(item)}
                            className="w-full sm:w-auto px-3.5 py-1 bg-amber-900/20 hover:bg-amber-500 hover:text-stone-950 font-bold text-xs border border-amber-950 rounded-lg text-amber-200 transition duration-150"
                          >
                            身につける
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
      )}
    </div>
  );
};
