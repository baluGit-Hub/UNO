
"use client";

import { cn } from "@/lib/utils";
import { Card as CardType } from "@/lib/types";
import { GiCardPick, GiCardRandom, GiCardDraw, GiCardExchange } from "react-icons/gi";

const colorClasses: Record<string, string> = {
  Red: "bg-gradient-to-br from-red-500 to-red-700 border-red-700 text-white",
  Green: "bg-gradient-to-br from-green-400 to-green-700 border-green-700 text-white",
  Blue: "bg-gradient-to-br from-blue-400 to-blue-700 border-blue-700 text-white",
  Yellow: "bg-gradient-to-br from-yellow-300 to-yellow-500 border-yellow-500 text-black",
  Wild: "bg-gradient-to-br from-gray-200 to-gray-400 border-gray-500 text-black",
};

const iconMap = {
  "Skip": GiCardDraw,
  "Reverse": GiCardExchange,
  "Draw Two": GiCardPick,
  "Wild": GiCardRandom,
  "Draw Four": GiCardRandom,
};

export function Card({ card, onClick, isPlayable = false }: { card: CardType | "back"; onClick?: (card: CardType) => void; isPlayable?: boolean }) {
  if (card === "back") {
    return (
      <div className="w-20 h-32 md:w-24 md:h-36 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 border-4 border-white flex items-center justify-center shadow-lg">
        <span className="text-3xl font-bold text-white">UNO</span>
      </div>
    );
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
        "w-20 h-32 md:w-24 md:h-36 rounded-xl p-2 flex flex-col justify-between shadow-xl border-4 transition-all duration-200 ease-in-out transform",
        colorClasses[card.color],
        isPlayable ? "cursor-pointer hover:-translate-y-2 hover:shadow-2xl ring-4 ring-accent ring-offset-2 ring-offset-background scale-105" : "cursor-not-allowed opacity-70"
      )}
    >
      <div className="text-left font-extrabold text-2xl drop-shadow-lg">{card.value}</div>
      <div className="flex items-center justify-center">
        {Icon ? <Icon className="h-10 w-10" /> : <span className="font-extrabold text-5xl drop-shadow-lg">{card.value}</span>}
      </div>
      <div className="text-right font-extrabold text-2xl self-end transform rotate-180 drop-shadow-lg">{card.value}</div>
    </button>
  );
}

    