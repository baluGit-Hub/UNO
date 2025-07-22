"use client";

import { type GameState, type Card as CardType } from "@/lib/types";
import { PlayerHand } from "./player-hand";
import { Opponent } from "./opponent";
import { Card } from "./card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Info } from "lucide-react";

interface GameBoardProps {
  gameState: GameState;
  onPlayCard: (card: CardType) => void;
  onDrawCard: () => void;
  isPlayerTurn: boolean;
  playerId: string;
}

export function GameBoard({ gameState, onPlayCard, onDrawCard, isPlayerTurn, playerId }: GameBoardProps) {
  const player = gameState.players.find(p => p.id === playerId)!;
  const opponents = gameState.players.filter(p => p.id !== playerId);
  const topCard = gameState.discardPile[gameState.discardPile.length - 1];

  const opponentPositions: ("top" | "left" | "right")[] = ["top", "left", "right", "top"];

  return (
    <div className="w-full h-screen flex flex-col p-4 gap-4">
      {/* Opponents Area */}
      <div className="grid grid-cols-3 grid-rows-1 gap-4 items-start justify-items-center h-1/4">
        <div className="justify-self-start">
            {opponents[1] && <Opponent player={opponents[1]} position="left" isCurrentPlayer={gameState.players[gameState.currentPlayerIndex].id === opponents[1].id} />}
        </div>
        <div>
            {opponents[0] && <Opponent player={opponents[0]} position="top" isCurrentPlayer={gameState.players[gameState.currentPlayerIndex].id === opponents[0].id}/>}
        </div>
        <div className="justify-self-end">
            {opponents[2] && <Opponent player={opponents[2]} position="right" isCurrentPlayer={gameState.players[gameState.currentPlayerIndex].id === opponents[2].id}/>}
        </div>
      </div>

      {/* Center Area (Deck & Discard) */}
      <div className="flex-grow flex items-center justify-center gap-8">
        <div className="flex flex-col items-center gap-2">
           <p className="font-semibold text-sm">DECK</p>
            <button onClick={onDrawCard} disabled={!isPlayerTurn}>
                <Card card="back" />
            </button>
            <p className="text-xs text-muted-foreground">{gameState.deck.length} cards left</p>
        </div>

        <div className="flex flex-col items-center gap-2">
            <p className="font-semibold text-sm">PLAYED</p>
            <Card card={topCard} />
            {gameState.chosenColor && topCard.color === 'Wild' && (
                <p className="text-xs font-bold" style={{color: `var(--${gameState.chosenColor.toLowerCase()})`}}>
                    Color: {gameState.chosenColor}
                </p>
            )}
        </div>
      </div>
      
      <div className="flex items-center justify-center bg-card/50 backdrop-blur-sm rounded-lg p-2 max-w-md mx-auto">
        <Info className="w-5 h-5 mr-2 text-accent"/>
        <p className={cn("font-bold text-lg text-foreground", isPlayerTurn && "animate-pulse text-accent")}>
            {gameState.turnMessage}
        </p>
      </div>

      {/* Player Area */}
      <div className="h-1/3 flex flex-col justify-end">
        {player && <PlayerHand player={player} onPlayCard={onPlayCard} gameState={gameState} isPlayerTurn={isPlayerTurn}/>}
      </div>
    </div>
  );
}
