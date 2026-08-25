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
        return <span className="text-[9px] font-black">시작</span>;
      case 'normal':
        return <Skull className="w-3 h-3 text-gray-300" />;
      case 'elite':
        return <Skull className="w-3 h-3 text-orange-400 fill-orange-400/40" />;
      case 'treasure':
        return <Gift className="w-3 h-3 text-yellow-300" />;
      case 'rune':
      case 'shrine':
        return <Sparkles className="w-3 h-3 text-purple-300" />;
      case 'boss':
        return <Skull className="w-3.5 h-3.5 text-red-400 fill-red-500/50" />;
      default:
        return <Zap className="w-3 h-3" />;
    }
  };

  const isEventRoom = currentRoom.type === 'treasure' || currentRoom.type === 'rune' || currentRoom.type === 'shrine';
  const isEncounterDone = monsters.length === 0 && (!isEventRoom || roomEventClaimed);

  return (
    <div className="flex items-center gap-1 select-none overflow-x-auto scrollbar-none py-0.5">
      <span className="text-[10px] font-mono text-gray-400 font-bold flex-shrink-0">
        R{currentRoom.id}/{rooms.length}
      </span>

      <div className="flex items-center gap-1">
        {rooms.map((room, idx) => {
          const isCurrent = room.id === currentRoomId;
          const isAccessible = currentRoom.connections.includes(room.id);
          const isPassed = room.cleared && !isCurrent;
          const isPending = pendingExitRoomId === room.id;
          const fogged = !room.revealed && !isCurrent;

          return (
            <React.Fragment key={room.id}>
              {idx > 0 && (
                <ChevronRight className="w-2.5 h-2.5 text-iron-700 flex-shrink-0" />
              )}
              <button
                onClick={() => {
                  if (isAccessible && isEncounterDone) {
                    selectNextRoom(room.id);
                  }
                }}
                disabled={!isAccessible || !isEncounterDone}
                className={`relative flex-shrink-0 flex items-center justify-center w-6 sm:w-7 h-5 sm:h-6 rounded border transition shadow-sm ${
                  isCurrent
                    ? 'bg-blood-900 border-blood-400 text-white ring-1 ring-blood-400 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
                    : isPending && isEncounterDone
                    ? 'bg-amber-950 border-amber-400 text-amber-200 ring-1 ring-amber-400 animate-pulse'
                    : isPassed
                    ? 'bg-iron-950 border-iron-800 text-gray-500 opacity-60'
                    : isAccessible && isEncounterDone
                    ? 'bg-iron-850 border-iron-600 text-gray-300 hover:bg-iron-800 cursor-pointer'
                    : 'bg-iron-950/80 border-iron-850 text-gray-600 cursor-not-allowed'
                }`}
                title={fogged ? '미탐색 방' : `${room.title} (${room.type})`}
              >
                {fogged ? <HelpCircle className="w-2.5 h-2.5 text-gray-500" /> : getRoomIcon(room.type)}
                {isPassed && (
                  <Check className="w-2 h-2 text-emerald-400 absolute -top-0.5 -right-0.5 bg-iron-950 rounded-full border border-emerald-500" />
                )}
                {isCurrent && (
                  <span className="w-1.5 h-1.5 bg-blood-400 rounded-full absolute -top-0.5 -right-0.5 animate-ping" />
                )}
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
});

MiniRoomGraph.displayName = 'MiniRoomGraph';
