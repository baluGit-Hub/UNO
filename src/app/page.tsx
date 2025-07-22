"use client";

import { useState, useEffect, useCallback } from "react";
import { type GameState, type Player, type Card as CardType, type CardColor } from "@/lib/types";
import { createDeck, shuffleDeck, canPlayCard } from "@/lib/game";
import { GameBoard } from "@/components/game/game-board";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/icons/logo";
import { useToast } from "@/hooks/use-toast";
import { ColorPicker } from "@/components/game/color-picker";
import { useRouter, useSearchParams } from 'next/navigation';

type GameStage = "setup" | "playing" | "gameOver";

export default function Home() {
  const [playerName, setPlayerName] = useState("");
  const [gameId, setGameId] = useState("");
  const [isNewGame, setIsNewGame] = useState(true);

  const router = useRouter();

  const handleJoinGame = () => {
    if (playerName && gameId) {
      router.push(`/game/${gameId}?playerName=${playerName}`);
    }
  };

  const handleCreateGame = () => {
    if (playerName) {
      const newGameId = Math.random().toString(36).substr(2, 9);
      router.push(`/game/${newGameId}?playerName=${playerName}&newGame=true`);
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 font-sans">
      <div className="flex flex-col items-center space-y-8">
        <Logo />
        <Card className="p-8 w-full max-w-md shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Join or Create Game</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="player-name" className="text-lg">Your Name</Label>
              <Input
                id="player-name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="game-id" className="text-lg">Game ID</Label>
                <Input
                  id="game-id"
                  value={gameId}
                  onChange={(e) => setGameId(e.target.value)}
                  placeholder="Enter game ID to join"
                />
              </div>
              <Button onClick={handleJoinGame} className="w-full text-lg py-6" size="lg" disabled={!playerName || !gameId}>
                Join Game
              </Button>
            </div>
            
            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                    Or
                    </span>
                </div>
            </div>

            <Button onClick={handleCreateGame} className="w-full text-lg py-6" size="lg" variant="secondary" disabled={!playerName}>
              Create New Game
            </Button>

          </CardContent>
        </Card>
      </div>
    </main>
  );
}
