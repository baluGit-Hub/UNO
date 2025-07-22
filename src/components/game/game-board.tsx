
"use client";

import { type GameState, type Card as CardType } from "@/lib/types";
import { PlayerHand } from "./player-hand";
import { Opponent } from "./opponent";
import { Card } from "./card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogOut, SkipForward, Volume2, VolumeX } from "lucide-react";
import { useRouter } from 'next/navigation';
import { canPlayCard } from "@/lib/game";
import { useState } from "react";

interface GameBoardProps {
  gameState: GameState;
  onPlayCard: (card: CardType) => void;
  onDrawCard: () => void;
  onPassTurn: () => void;
  onUnoClick: () => void;
  isPlayerTurn: boolean;
  playerId: string;
  hasDrawn: boolean;
}

export function GameBoard({ gameState, onPlayCard, onDrawCard, onPassTurn, onUnoClick, isPlayerTurn, playerId, hasDrawn }: GameBoardProps) {
  const router = useRouter();
  const [muted, setMuted] = useState(false);
  const player = gameState.players.find(p => p.id === playerId);
  const playerIndex = gameState.players.findIndex(p => p.id === playerId);
  const topCard = gameState.discardPile[gameState.discardPile.length - 1];
  const numPlayers = gameState.players.length;

  // Arrange players: current player at bottom, others clockwise
  const arrangedPlayers = [
    ...gameState.players.slice(playerIndex),
    ...gameState.players.slice(0, playerIndex)
  ];

  // Board positions for up to 6 players
  const positions = [
    { name: 'bottom', style: 'absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center' },
    { name: 'left', style: 'absolute left-4 top-1/2 transform -translate-y-1/2 flex flex-col items-center' },
    { name: 'top', style: 'absolute top-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center' },
    { name: 'right', style: 'absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col items-center' },
    { name: 'top-left', style: 'absolute top-20 left-20 flex flex-col items-center' },
    { name: 'top-right', style: 'absolute top-20 right-20 flex flex-col items-center' },
  ];

  if (!player) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-blue-800 text-white">
        Joining game...
      </div>
    );
  }

  const canDraw = isPlayerTurn && !hasDrawn && !player.hand.some(card => canPlayCard(card, topCard, gameState.chosenColor, player.hand));

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 overflow-hidden">
      {/* Quit and Mute buttons */}
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        <Button variant="destructive" onClick={() => router.push('/')}> <LogOut className="mr-2"/> QUIT </Button>
      </div>
      <div className="absolute top-4 right-4 z-20">
        <Button variant="ghost" onClick={() => setMuted(m => !m)}>{muted ? <VolumeX /> : <Volume2 />}</Button>
      </div>

      {/* Player hands around the board */}
      {arrangedPlayers.map((p, idx) => {
        const pos = positions[idx] || positions[positions.length-1];
        const isCurrent = idx === 0;
        return (
          <div key={p.id} className={pos.style + (isCurrent ? ' z-10' : ' z-0') + ' min-w-[180px]'}>
            <div className={cn("mb-2 text-center text-white font-bold text-lg", isCurrent && "text-yellow-300 text-2xl")}>{p.name} {isCurrent && "(You)"}</div>
            <div className="mb-1 text-center text-white/80 text-sm">★ 0</div>
            {isCurrent ? (
              <PlayerHand player={p} onPlayCard={onPlayCard} gameState={gameState} isPlayerTurn={isPlayerTurn}/>
            ) : (
              <div className="flex flex-row gap-[-24px]">{p.hand.map((_, i) => <Card key={i} card="back" />)}</div>
            )}
          </div>
        );
      })}

      {/* Center play area */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4 z-10">
        <div className="flex flex-row items-center gap-8">
          <button onClick={onDrawCard} disabled={!canDraw} className="rounded-lg ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <Card card="back" />
          </button>
          <Card card={topCard} />
        </div>
        {gameState.chosenColor && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-white font-semibold">Chosen Color:</span>
            <div className={cn("w-6 h-6 rounded-full border-2 border-white", 
              gameState.chosenColor === 'Red' && 'bg-red-500',
              gameState.chosenColor === 'Green' && 'bg-green-500',
              gameState.chosenColor === 'Blue' && 'bg-blue-500',
              gameState.chosenColor === 'Yellow' && 'bg-yellow-500')}></div>
          </div>
        )}
        <div className="flex flex-row gap-4 mt-2">
          <Button onClick={onPassTurn} disabled={!isPlayerTurn || !hasDrawn}>Pass Turn <SkipForward className="ml-2"/></Button>
        </div>
      </div>

      {/* UNO button */}
      {isPlayerTurn && player.hand.length === 2 && !player.saidUno && (
        <div className="absolute bottom-1/2 right-10 z-20">
          <Button onClick={onUnoClick} className="bg-yellow-400 text-black hover:bg-yellow-500 text-2xl font-bold py-8 px-10 rounded-full shadow-lg animate-bounce">
            UNO!
          </Button>
        </div>
      )}
    </div>
  );
}
