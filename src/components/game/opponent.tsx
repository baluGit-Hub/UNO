
"use client";

import { type Player } from "@/lib/types";
import { cn } from "@/lib/utils";
import { User } from 'lucide-react';
import { Card } from './card';

interface OpponentProps {
  player: Player;
  position: "top" | "left" | "right";
  isCurrentPlayer: boolean;
}

export function Opponent({ player, position, isCurrentPlayer }: OpponentProps) {
  const positionClasses = {
    top: "items-center",
    left: "items-start",
    right: "items-end",
  };
  const handPositionClasses = {
    top: "flex-row",
    left: "flex-col items-start -space-y-28",
    right: "flex-col items-end -space-y-28",
  };

  return (
    <div className={cn("flex flex-col gap-2 w-48", positionClasses[position])}>
       <div className={cn("p-2 rounded-lg bg-black/30 backdrop-blur-sm", isCurrentPlayer && "ring-2 ring-accent shadow-lg shadow-accent/50")}>
            <div className="flex flex-col items-center gap-1">
                <p className="font-bold text-sm truncate">{player.name}</p>
                <p className="text-xs text-muted-foreground">{player.hand.length} cards</p>
            </div>
       </div>
       <div className={cn("flex", handPositionClasses[position])} style={{transform: "scale(0.6)"}}>
            {player.hand.map((_, index) => (
                <div key={index} className={cn(position === 'top' ? "-mx-8" : "my-0")}>
                    <Card card="back" />
                </div>
            ))}
       </div>
    </div>
  );
}
