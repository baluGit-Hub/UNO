
"use client";

import { type GameState, type Card as CardType } from "@/lib/types";
import { PlayerHand } from "./player-hand";
import { Opponent } from "./opponent";
import { Card } from "./card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogOut, ArrowRight, SkipForward } from "lucide-react";
import { useRouter } from 'next/navigation';

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
  const player = gameState.players.find(p => p.id === playerId);
  const opponents = gameState.players.filter(p => p.id !== playerId);
  const topCard = gameState.discardPile[gameState.discardPile.length - 1];

  if (!player) {
    return <div>Joining game...</div>;
  }

  return (
    <div className="w-full h-screen flex flex-col p-4 gap-4 bg-background text-foreground relative">
        <div className="absolute top-4 left-4 z-20">
            <Button variant="destructive" onClick={() => router.push('/')}><LogOut className="mr-2"/> Quit</Button>
        </div>
        <div className="absolute top-4 right-4 z-20">
            <Button onClick={onPassTurn} disabled={!isPlayerTurn || !hasDrawn}>Pass Turn <SkipForward className="ml-2"/></Button>
        </div>

      {/* Opponents Area */}
      <div className="h-[20%] w-full flex justify-center items-start">
        <div className="flex flex-row flex-wrap justify-center gap-4">
         {opponents.map(opponent => (
            <Opponent 
              key={opponent.id} 
              player={opponent} 
              position="top" 
              isCurrentPlayer={gameState.players[gameState.currentPlayerIndex].id === opponent.id} 
            />
          ))}
        </div>
      </div>

      {/* Center Area (Deck & Discard) */}
      <div className="flex-grow flex items-center justify-center gap-8">
        <div className="flex flex-col items-center gap-2">
            <button onClick={onDrawCard} disabled={!isPlayerTurn || hasDrawn} className="rounded-lg ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <Card card="back" />
            </button>
        </div>
        <div className="flex flex-col items-center gap-2">
            <Card card={topCard} />
            {gameState.chosenColor && topCard.color === 'Wild' && (
                 <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm font-semibold">Chosen Color:</span>
                    <div className={cn("w-6 h-6 rounded-full", 
                        gameState.chosenColor === 'Red' && 'bg-red-500',
                        gameState.chosenColor === 'Green' && 'bg-green-500',
                        gameState.chosenColor === 'Blue' && 'bg-blue-500',
                        gameState.chosenColor === 'Yellow' && 'bg-yellow-500'
                    )}></div>
                 </div>
            )}
        </div>
      </div>
      
      {/* Player Area */}
      <div className="h-[40%] flex flex-col justify-end items-center">
        <div className="text-center mb-2">
            <p className="font-bold text-lg">{player?.name} (You)</p>
            { isPlayerTurn && <p className="text-accent animate-pulse">Your Turn</p> }
        </div>
        {player && <PlayerHand player={player} onPlayCard={onPlayCard} gameState={gameState} isPlayerTurn={isPlayerTurn}/>}
      </div>

       {player?.hand?.length === 1 && (
        <div className="absolute bottom-1/2 right-10 z-20">
          <Button onClick={onUnoClick} className="bg-yellow-400 text-black hover:bg-yellow-500 text-2xl font-bold py-8 px-10 rounded-full shadow-lg animate-bounce">
            UNO
          </Button>
        </div>
      )}
    </div>
  );
}
