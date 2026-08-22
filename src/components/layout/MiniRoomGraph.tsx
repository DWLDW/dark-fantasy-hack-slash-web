import React from 'react';
import { useGame } from '../../state/gameStore';
import { DungeonRoom, RoomType } from '../../types/game';
import { Skull, Gift, Zap, Sparkles, ChevronRight, Check } from 'lucide-react';

export const MiniRoomGraph: React.FC = () => {
  const { currentDungeon, currentRoomId, selectNextRoom, monsters } = useGame();
  const rooms = currentDungeon.rooms;
  const currentRoom = rooms.find(r => r.id === currentRoomId) || rooms[0];

  const getRoomIcon = (type: RoomType) => {
    switch (type) {
      case 'start':
        return <div className="text-xs font-black">입구</div>;
      case 'normal':
        return <Skull className="w-4 h-4 text-gray-200" />;
      case 'elite':
        return <Skull className="w-4 h-4 text-orange-400 fill-orange-400/30" />;
      case 'treasure':
        return <Gift className="w-4 h-4 text-yellow-300" />;
      case 'rune':
      case 'shrine':
        return <Sparkles className="w-4 h-4 text-purple-300" />;
      case 'boss':
        return <Skull className="w-5 h-5 text-red-400 fill-red-500/40" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  const getRoomLabel = (type: RoomType) => {
    switch (type) {
      case 'start': return '입구';
      case 'normal': return '일반';
      case 'elite': return '엘리트';
      case 'treasure': return '보물';
      case 'rune': return '룬제단';
      case 'shrine': return '성소';
      case 'boss': return '보스';
    }
  };

  const isRoomCleared = monsters.length === 0;

  return (
    <div className="bg-iron-900 border-2 border-iron-750 rounded p-2.5 text-xs shadow-lg select-none">
      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-iron-750">
        <div className="flex items-center gap-2 font-cinzel font-black text-gray-100 text-xs md:text-sm">
          <span className="text-blood-400">❖</span>
          <span>던전 룸 미니맵 (Depth {currentRoom.id}/{rooms.length})</span>
        </div>
        <div className="text-xs text-gray-200 font-mono font-bold">
          {currentRoom.title} {isRoomCleared ? <span className="text-emerald-400 font-black">[소탕 완료]</span> : <span className="text-blood-400 font-black">[전투 진행 중]</span>}
        </div>
      </div>

      {/* Horizontal Scrollable Compact Node Flow */}
      <div className="flex items-center space-x-2 overflow-x-auto py-1 scrollbar-thin">
        {rooms.map((room, idx) => {
          const isCurrent = room.id === currentRoomId;
          const isAccessible = currentRoom.connections.includes(room.id);
          const isPassed = room.id < currentRoomId;

          return (
            <React.Fragment key={room.id}>
              {idx > 0 && (
                <ChevronRight className="w-4 h-4 text-iron-600 flex-shrink-0" />
              )}
              <button
                onClick={() => {
                  if (isAccessible && isRoomCleared) {
                    selectNextRoom(room.id);
                  }
                }}
                disabled={!isAccessible || !isRoomCleared}
                className={`relative flex-shrink-0 flex flex-col items-center justify-center w-14 h-12 rounded-lg border-2 transition shadow ${
                  isCurrent
                    ? 'bg-blood-950 border-blood-400 text-white ring-2 ring-blood-400/80 scale-105 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                    : isPassed
                    ? 'bg-iron-950 border-iron-700 text-gray-400 opacity-70'
                    : isAccessible && isRoomCleared
                    ? 'bg-iron-850 border-brass-400 text-brass-200 hover:bg-iron-800 cursor-pointer animate-pulse ring-1 ring-brass-400'
                    : 'bg-iron-950 border-iron-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                {getRoomIcon(room.type)}
                <span className="text-[10px] mt-0.5 font-bold">{getRoomLabel(room.type)}</span>
                
                {isCurrent && (
                  <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-blood-500 rounded-full animate-ping" />
                )}
                {isPassed && (
                  <Check className="w-3.5 h-3.5 text-emerald-400 absolute -top-1.5 -right-1.5 bg-iron-950 rounded-full border border-emerald-500" />
                )}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Action prompt if room is cleared */}
      {isRoomCleared && (
        <div className="mt-2 text-center text-xs text-brass-200 font-bold bg-brass-500/20 py-1.5 rounded border border-brass-400 shadow animate-pulse">
          ⚡ 룸 소탕 완료! 미니맵에서 깜빡이는 다음 방을 클릭하여 이동하세요.
        </div>
      )}
    </div>
  );
};
