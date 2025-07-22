
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
  const handWidth = player.hand.length * 40;
  
  return (
    <div className="flex justify-center items-end w-full h-full">
       <div className="relative flex justify-center items-end" style={{ width: `${handWidth}px`, height: '160px' }}>
        {player.hand.map((card, index) => {
            const isPlayable = isPlayerTurn && canPlayCard(card, topCard, gameState.chosenColor);
            
            const numCards = player.hand.length;
            const cardOffset = 80; // Overlap in pixels
            const totalHandWidth = (numCards * 112) - ((numCards - 1) * cardOffset);
            const startX = -totalHandWidth / 2;
            const cardX = startX + index * (112 - cardOffset);
            
            return (
                <div
                    key={card.id}
                    className="absolute transition-transform duration-300 ease-in-out hover:-translate-y-4"
                    style={{
                        transform: `translateX(${cardX}px)`,
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
