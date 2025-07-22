"use client";

import { type Card as CardType, type Player, type GameState } from "@/lib/types";
import { Card } from "./card";
import { canPlayCard } from "@/lib/game";

interface PlayerHandProps {
  player: Player;
  onPlayCard: (card: CardType) => void;
  gameState: GameState;
  isPlayerTurn: boolean;
}

export function PlayerHand({ player, onPlayCard, gameState, isPlayerTurn }: PlayerHandProps) {
  const topCard = gameState.discardPile[gameState.discardPile.length - 1];
  
  return (
    <div className="flex justify-center items-end h-48">
       <div className="relative flex justify-center items-end" style={{ height: '160px' }}>
        {player.hand.map((card, index) => {
            const isPlayable = isPlayerTurn && canPlayCard(card, topCard, gameState.chosenColor);
            const totalWidth = player.hand.length * 40;

            return (
                <div
                    key={card.id}
                    className="absolute transition-transform duration-300 ease-in-out"
                    style={{
                        transform: `translateX(${(index - (player.hand.length - 1) / 2) * 40}px) ${isPlayable ? 'translateY(-1rem)' : ''}`,
                        zIndex: index
                    }}
                >
                    <Card card={card} onClick={onPlayCard} isPlayable={isPlayable} />
                </div>
            )
        })}
       </div>
    </div>
  );
}
