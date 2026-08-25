import React from 'react';
import { useGame } from '../../state/gameStore';
import { RoomType } from '../../types/game';
import { Skull, Gift, Zap, Sparkles, ChevronRight, Check, HelpCircle } from 'lucide-react';

export const MiniRoomGraph: React.FC = React.memo(() => {
  const { currentDungeon, currentRoomId, selectNextRoom, monsters, roomEventClaimed, pendingExitRoomId } = useGame();
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
      case 'normal': return '웨이브';
      case 'elite': return '엘리트';
      case 'treasure': return '보물';
      case 'rune': return '룬제단';
      case 'shrine': return '성소';
      case 'boss': return '보스';
    }
  };

  const isEventRoom = currentRoom.type === 'treasure' || currentRoom.type === 'rune' || currentRoom.type === 'shrine';
  const isEncounterDone = monsters.length === 0 && (!isEventRoom || roomEventClaimed);

  return (
    <div className="bg-iron-900/95 border border-brass-600/30 rounded p-1.5 sm:p-2.5 text-xs shadow select-none">
      <div className="flex items-center justify-between mb-1 pb-1 border-b border-iron-750">
        <div className="flex items-center gap-1.5 font-cinzel font-black text-gray-100 text-[11px] sm:text-xs">
          <span className="text-blood-400">❖</span>
          <span>룸 미니맵 ({currentRoom.id}/{rooms.length})</span>
        </div>
        <div className="text-[10px] sm:text-xs text-gray-200 font-mono font-bold">
          {currentRoom.revealed ? currentRoom.title : '???'}{' '}
          {isEncounterDone
            ? <span className="text-emerald-400 font-black">[소탕]</span>
            : monsters.length === 0 && isEventRoom
            ? <span className="text-amber-300 font-black">[수령]</span>
            : <span className="text-blood-400 font-black">[전투]</span>}
        </div>
      </div>

      <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-0.5 scrollbar-thin">
        {rooms.map((room, idx) => {
          const isCurrent = room.id === currentRoomId;
          const isAccessible = currentRoom.connections.includes(room.id);
          const isPassed = room.cleared && !isCurrent;
          const isPending = pendingExitRoomId === room.id;
          const fogged = !room.revealed && !isCurrent;

          return (
            <React.Fragment key={room.id}>
              {idx > 0 && (
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-iron-600 flex-shrink-0" />
              )}
              <button
                onClick={() => {
                  if (isAccessible && isEncounterDone) {
                    selectNextRoom(room.id);
                  }
                }}
                disabled={!isAccessible || !isEncounterDone}
                className={`relative flex-shrink-0 flex flex-col items-center justify-center w-10 sm:w-14 h-8 sm:h-11 rounded border transition shadow ${
                  isCurrent
                    ? 'bg-blood-950 border-blood-400 text-white ring-1 sm:ring-2 ring-blood-400/80 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                    : isPending && isEncounterDone
                    ? 'bg-iron-850 border-brass-400 text-brass-200 ring-1 ring-brass-400'
                    : isPassed
                    ? 'bg-iron-950 border-iron-700 text-gray-400 opacity-70'
                    : isAccessible && isEncounterDone
                    ? 'bg-iron-850 border-iron-600 text-gray-300 hover:bg-iron-800 cursor-pointer'
                    : 'bg-iron-950 border-iron-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                <div className="scale-75 sm:scale-100">
                  {fogged ? <HelpCircle className="w-4 h-4 text-gray-400" /> : getRoomIcon(room.type)}
                </div>
                <span className="text-[8px] sm:text-[10px] font-bold leading-none">
                  {fogged ? '?' : getRoomLabel(room.type)}
                </span>

                {isCurrent && (
                  <span className="absolute -top-1 -right-1 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-blood-500 rounded-full animate-ping" />
                )}
                {isPassed && (
                  <Check className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-emerald-400 absolute -top-1 -right-1 bg-iron-950 rounded-full border border-emerald-500" />
                )}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {isEncounterDone && (currentRoom.connections?.length || 0) > 0 && (
        <div className="mt-1 text-center text-[10px] sm:text-xs text-brass-200 font-bold bg-brass-500/20 py-0.5 sm:py-1 rounded border border-brass-400 shadow">
          {(currentRoom.connections.length > 1)
            ? '←/→ 길 선택 · [Space] 진행'
            : '[Space] 다음 방 진행'}
        </div>
      )}
    </div>
  );
});
MiniRoomGraph.displayName = 'MiniRoomGraph';
