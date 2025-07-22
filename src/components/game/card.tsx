
"use client";

import { type Card as CardType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Ban, RefreshCw, Plus, Shuffle, Zap } from "lucide-react";

interface CardProps {
  card: CardType | "back";
  onClick?: (card: CardType) => void;
  isPlayable?: boolean;
}

const colorClasses = {
  Red: "bg-red-500 text-white",
  Green: "bg-green-500 text-white",
  Blue: "bg-blue-500 text-white",
  Yellow: "bg-yellow-400 text-black",
  Wild: "bg-black text-white",
};

const iconMap = {
  Skip: Ban,
  Reverse: RefreshCw,
  "Draw Two": (props: any) => <span {...props}>+2</span>,
  "Draw Four": (props: any) => <span {...props}>+4</span>,
  Wild: Shuffle,
};

function CardBack() {
  return (
    <div className="w-24 h-36 md:w-28 md:h-40 rounded-lg bg-black flex items-center justify-center shadow-lg border-2 border-neutral-700 relative overflow-hidden">
      <div className="absolute w-full h-full bg-gradient-to-br from-neutral-800 to-black opacity-50"></div>
      <div className="relative text-red-500">
        <h1 className="text-4xl font-bold">UNO</h1>
      </div>
    </div>
  );
}

export function Card({ card, onClick, isPlayable = false }: CardProps) {
  if (card === "back") {
    return <CardBack />;
  }

  const Icon = iconMap[card.value as keyof typeof iconMap];

  const handleCardClick = () => {
    if (onClick && isPlayable) {
      onClick(card);
    }
  };

  const isNumberCard = !isNaN(Number(card.value));

  return (
    <button
      onClick={handleCardClick}
      disabled={!isPlayable}
      className={cn(
        "w-24 h-36 md:w-28 md:h-40 rounded-lg p-2 flex flex-col justify-between shadow-lg transition-all duration-200 ease-in-out transform border-4 border-white dark:border-neutral-800",
        colorClasses[card.color],
        isPlayable ? "cursor-pointer hover:-translate-y-2 hover:shadow-2xl ring-4 ring-accent ring-offset-2 ring-offset-background" : "cursor-not-allowed",
        !isPlayable && card.color !== 'Wild' && 'opacity-70'
      )}
    >
      <div className="text-left font-bold text-2xl">{card.value}</div>
      <div className="flex items-center justify-center">
        {Icon ? <Icon className="h-10 w-10" /> : <span className="font-bold text-6xl drop-shadow-lg">{card.value}</span>}
      </div>
      <div className="text-right font-bold text-2xl self-end transform rotate-180">{card.value}</div>
    </button>
  );
}

    