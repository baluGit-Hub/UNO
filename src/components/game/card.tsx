"use client";

import { type Card as CardType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Flame, Ban, RefreshCw, Plus, Shuffle } from "lucide-react";

interface CardProps {
  card: CardType | "back";
  onClick?: (card: CardType) => void;
  isPlayable?: boolean;
}

const colorClasses = {
  Red: "bg-red-500 hover:bg-red-600",
  Green: "bg-green-500 hover:bg-green-600",
  Blue: "bg-blue-500 hover:bg-blue-600",
  Yellow: "bg-yellow-400 hover:bg-yellow-500",
  Wild: "bg-gray-800 from-red-500 via-blue-500 to-yellow-500",
};

const iconMap = {
  Skip: Ban,
  Reverse: RefreshCw,
  "Draw Two": Plus,
  "Draw Four": Plus,
  Wild: Shuffle,
};

export function Card({ card, onClick, isPlayable = false }: CardProps) {
  if (card === "back") {
    return (
      <div className="w-24 h-36 md:w-28 md:h-40 rounded-lg bg-primary flex items-center justify-center shadow-lg border-2 border-primary-foreground/50">
        <Flame className="h-12 w-12 text-primary-foreground" />
      </div>
    );
  }

  const Icon = iconMap[card.value as keyof typeof iconMap];

  const handleCardClick = () => {
    if (onClick && isPlayable) {
      onClick(card);
    }
  };

  return (
    <button
      onClick={handleCardClick}
      disabled={!isPlayable}
      className={cn(
        "w-24 h-36 md:w-28 md:h-40 rounded-lg p-2 flex flex-col justify-between text-white shadow-lg transition-all duration-200 ease-in-out transform",
        colorClasses[card.color],
        isPlayable ? "cursor-pointer hover:-translate-y-2 hover:shadow-2xl ring-4 ring-accent ring-offset-2 ring-offset-background" : "cursor-not-allowed",
        card.color === 'Wild' && 'bg-gradient-to-br'
      )}
    >
      <div className="text-left font-bold text-2xl">{card.value.startsWith('Draw') ? `+${card.value.slice(-1)}`: card.value.length > 1 ? '' : card.value}</div>
      <div className="flex items-center justify-center">
        {Icon ? <Icon className="h-10 w-10" /> : <span className="font-bold text-5xl">{card.value}</span>}
      </div>
      <div className="text-right font-bold text-2xl self-end transform rotate-180">{card.value.startsWith('Draw') ? `+${card.value.slice(-1)}`: card.value.length > 1 ? '' : card.value}</div>
    </button>
  );
}
