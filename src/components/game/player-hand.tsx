
"use client";

import { type Card as CardType, type Player, type GameState } from "@/lib/types";
import { Card } from "./card";
import { motion, AnimatePresence } from "framer-motion";
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
    <div className="flex justify-center items-end h-full">
      <AnimatePresence>
        <motion.div 
            className="flex flex-row justify-center items-end -space-x-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
          {player.hand.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 50, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: (index - (player.hand.length - 1) / 2) * 5 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -20, scale: 1.1, zIndex: 50, rotate: 0 }}
              className="relative"
            >
              <Card
                card={card}
                onClick={onPlayCard}
                isPlayable={isPlayerTurn && canPlayCard(card, topCard, gameState.chosenColor, player.hand || [])}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
