"use client";

import { type Player } from "@/lib/types";
import { Card as UICard, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { User } from 'lucide-react';

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
  const textPositionClasses = {
    top: "text-center",
    left: "text-left",
    right: "text-right",
  };

  return (
    <div className={cn("flex flex-col gap-2 w-32", positionClasses[position])}>
       <UICard className={cn("p-2 bg-card/80 backdrop-blur-sm", isCurrentPlayer && "ring-2 ring-accent shadow-lg shadow-accent/50")}>
        <CardContent className="p-2 flex items-center justify-center gap-2">
            <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground"><User /></AvatarFallback>
            </Avatar>
            <div className={cn("flex flex-col", textPositionClasses[position])}>
                <p className="font-bold text-sm truncate">{player.name}</p>
                <p className="text-xs text-muted-foreground">{player.hand.length} cards</p>
            </div>
        </CardContent>
       </UICard>
       <div className="flex -space-x-12 justify-center">
        {player.hand.slice(0, 5).map((_, index) => (
            <div key={index} className="w-12 h-16 rounded-md bg-primary flex items-center justify-center shadow-md border border-primary-foreground/30" />
        ))}
       </div>
    </div>
  );
}
