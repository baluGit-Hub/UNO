"use client";

import { useState, useEffect, useCallback } from "react";
import { type GameState, type Player, type Card as CardType, type CardColor } from "@/lib/types";
import { createDeck, shuffleDeck, canPlayCard } from "@/lib/game";
import { GameBoard } from "@/components/game/game-board";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/icons/logo";
import { getAiAction, type GetAiActionInput } from "@/ai/flows/simple-ai-opponent";
import { useToast } from "@/hooks/use-toast";
import { ColorPicker } from "@/components/game/color-picker";

type GameStage = "setup" | "playing" | "gameOver";

export default function Home() {
  const [numPlayers, setNumPlayers] = useState(2);
  const [gameStage, setGameStage] = useState<GameStage>("setup");
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [cardToPlay, setCardToPlay] = useState<CardType | null>(null);

  const { toast } = useToast();

  const handleStartGame = useCallback(() => {
    const players: Player[] = [
      { id: "player-1", name: "You", hand: [], isAI: false },
    ];
    for (let i = 1; i < numPlayers; i++) {
      players.push({ id: `player-${i + 1}`, name: `AI ${i}`, hand: [], isAI: true });
    }

    let deck = createDeck();
    deck = shuffleDeck(deck);

    players.forEach(player => {
      player.hand = deck.splice(0, 7);
    });
    
    let topCard: CardType;
    do {
      topCard = deck.pop()!;
    } while (topCard.color === 'Wild');


    setGameState({
      players,
      deck,
      discardPile: [topCard],
      currentPlayerIndex: 0,
      gameDirection: "clockwise",
      isGameOver: false,
      winner: null,
      chosenColor: null,
      turnMessage: "Your turn!",
    });
    setGameStage("playing");
  }, [numPlayers]);

  const advanceTurn = useCallback((players: Player[], currentIndex: number, direction: 'clockwise' | 'counterclockwise') => {
    if (direction === 'clockwise') {
      return (currentIndex + 1) % players.length;
    } else {
      return (currentIndex - 1 + players.length) % players.length;
    }
  }, []);

  const handlePlayCard = useCallback(async (card: CardType) => {
    if (!gameState) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.isAI) return;

    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
    if (!canPlayCard(card, topCard, gameState.chosenColor)) {
      toast({ title: "Invalid Move", description: "You can't play that card.", variant: 'destructive' });
      return;
    }
    
    setCardToPlay(card);

    if (card.color === 'Wild') {
      setIsColorPickerOpen(true);
    } else {
      await processCardPlay(card, null);
    }
  }, [gameState, toast]);

  const processCardPlay = useCallback(async (card: CardType, chosenColor: CardColor | null) => {
    if (!gameState) return;

    let newState = { ...gameState };
    const currentPlayer = newState.players[newState.currentPlayerIndex];

    const newHand = currentPlayer.hand.filter(c => c.id !== card.id);
    currentPlayer.hand = newHand;

    newState.discardPile.push(card);
    newState.chosenColor = chosenColor;

    if (newHand.length === 0) {
      newState.isGameOver = true;
      newState.winner = currentPlayer;
      setGameState(newState);
      setGameStage("gameOver");
      return;
    }

    let nextPlayerIndex = newState.currentPlayerIndex;

    switch (card.value) {
      case 'Reverse':
        newState.gameDirection = newState.gameDirection === 'clockwise' ? 'counterclockwise' : 'clockwise';
        break;
      case 'Skip':
        nextPlayerIndex = advanceTurn(newState.players, nextPlayerIndex, newState.gameDirection);
        break;
      case 'Draw Two':
        const playerToDrawTwo = advanceTurn(newState.players, nextPlayerIndex, newState.gameDirection);
        const drawnTwo = newState.deck.splice(0, 2);
        newState.players[playerToDrawTwo].hand.push(...drawnTwo);
        nextPlayerIndex = advanceTurn(newState.players, nextPlayerIndex, newState.gameDirection);
        toast({title: `${newState.players[playerToDrawTwo].name} drew 2 cards!`});
        break;
      case 'Draw Four':
        const playerToDrawFour = advanceTurn(newState.players, nextPlayerIndex, newState.gameDirection);
        const drawnFour = newState.deck.splice(0, 4);
        newState.players[playerToDrawFour].hand.push(...drawnFour);
        nextPlayerIndex = advanceTurn(newState.players, nextPlayerIndex, newState.gameDirection);
        toast({title: `${newState.players[playerToDrawFour].name} drew 4 cards!`});
        break;
    }

    nextPlayerIndex = advanceTurn(newState.players, nextPlayerIndex, newState.gameDirection);
    newState.currentPlayerIndex = nextPlayerIndex;
    const nextPlayer = newState.players[nextPlayerIndex];
    newState.turnMessage = nextPlayer.isAI ? `AI ${nextPlayer.name.split(' ')[1]}'s turn...` : "Your turn!";

    setGameState(newState);
    setCardToPlay(null);
  }, [gameState, advanceTurn, toast]);

  const handleDrawCard = useCallback(() => {
    if (!gameState || gameState.players[gameState.currentPlayerIndex].isAI) return;

    let newState = { ...gameState };
    if (newState.deck.length === 0) {
      toast({ title: "Deck is empty!", variant: 'destructive' });
      return;
    }

    const drawnCard = newState.deck.shift()!;
    newState.players[newState.currentPlayerIndex].hand.push(drawnCard);

    newState.currentPlayerIndex = advanceTurn(newState.players, newState.currentPlayerIndex, newState.gameDirection);
    newState.turnMessage = `${newState.players[newState.currentPlayerIndex].name}'s turn...`;
    
    setGameState(newState);
    toast({ title: "Card Drawn", description: `You drew a ${drawnCard.color} ${drawnCard.value}.`});

  }, [gameState, toast, advanceTurn]);
  
  const handleAiTurn = useCallback(async () => {
    if (!gameState || !gameState.players[gameState.currentPlayerIndex].isAI) return;
  
    const aiPlayer = gameState.players[gameState.currentPlayerIndex];
    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
  
    const aiActionInput: GetAiActionInput = {
      playerCards: aiPlayer.hand.map(c => `${c.color} ${c.value}`),
      topCard: `${topCard.color} ${topCard.value}`,
      currentPlayer: aiPlayer.name,
      gameDirection: gameState.gameDirection,
    };
  
    const aiResponse = await getAiAction(aiActionInput);
  
    if (aiResponse.action === 'play' && aiResponse.cardToPlay) {
      const cardToPlayStr = aiResponse.cardToPlay.split(' ');
      const cardColor = cardToPlayStr[0] as CardColor;
      const cardValue = cardToPlayStr.slice(1).join(' ');
      
      const card = aiPlayer.hand.find(c => c.color === cardColor && c.value === cardValue);
      
      if (card && canPlayCard(card, topCard, gameState.chosenColor)) {
        toast({ title: "AI Action", description: `${aiPlayer.name} played a ${card.color} ${card.value}` });
        if(card.color === 'Wild') {
            const colors: CardColor[] = ['Red', 'Green', 'Blue', 'Yellow'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            await processCardPlay(card, randomColor);
            toast({ title: "AI chose color", description: `${aiPlayer.name} chose ${randomColor}`});
        } else {
            await processCardPlay(card, null);
        }
      } else {
        // AI made a mistake, draw a card
        handleAiDraw();
      }
    } else {
      handleAiDraw();
    }
  }, [gameState, processCardPlay, toast]);

  const handleAiDraw = useCallback(() => {
    if (!gameState) return;
    let newState = { ...gameState };
    const aiPlayer = newState.players[newState.currentPlayerIndex];
    if (newState.deck.length === 0) {
        toast({ title: "Deck is empty!" });
        return;
    }
    const drawnCard = newState.deck.shift()!;
    aiPlayer.hand.push(drawnCard);
    toast({ title: "AI Action", description: `${aiPlayer.name} drew a card.` });
    
    newState.currentPlayerIndex = advanceTurn(newState.players, newState.currentPlayerIndex, newState.gameDirection);
    newState.turnMessage = `${newState.players[newState.currentPlayerIndex].name}'s turn...`;
    setGameState(newState);
  }, [gameState, toast, advanceTurn]);
  
  useEffect(() => {
    if (gameStage === "playing" && gameState?.players[gameState.currentPlayerIndex].isAI) {
      const timer = setTimeout(handleAiTurn, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState?.currentPlayerIndex, gameState?.players, gameStage, handleAiTurn]);
  
  const handleColorSelect = useCallback(async (color: CardColor) => {
    if(cardToPlay) {
      await processCardPlay(cardToPlay, color);
    }
    setIsColorPickerOpen(false);
    setCardToPlay(null);
    toast({title: `You chose ${color}`});
  }, [processCardPlay, cardToPlay, toast]);

  const renderContent = () => {
    switch (gameStage) {
      case "setup":
        return (
          <div className="flex flex-col items-center space-y-8">
            <Logo />
            <Card className="p-8 w-full max-w-md shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Game Setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="num-players" className="text-lg">Number of Players: {numPlayers}</Label>
                  <Slider
                    id="num-players"
                    min={2}
                    max={5}
                    step={1}
                    value={[numPlayers]}
                    onValueChange={(value) => setNumPlayers(value[0])}
                  />
                </div>
                <Button onClick={handleStartGame} className="w-full text-lg py-6" size="lg">
                  Start Game
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      case "playing":
      case "gameOver":
        return gameState ? (
          <>
            <GameBoard
              gameState={gameState}
              onPlayCard={handlePlayCard}
              onDrawCard={handleDrawCard}
              isPlayerTurn={gameState.players[gameState.currentPlayerIndex].id === 'player-1'}
            />
            {gameStage === 'gameOver' && gameState.winner && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                <Card className="p-10 text-center shadow-2xl animate-in fade-in zoom-in">
                  <CardTitle className="text-4xl font-bold mb-4">Game Over!</CardTitle>
                  <p className="text-2xl mb-8">The winner is {gameState.winner.name}!</p>
                  <Button onClick={() => setGameStage('setup')} size="lg" className="text-xl px-8 py-6">Play Again</Button>
                </Card>
              </div>
            )}
             <ColorPicker
              isOpen={isColorPickerOpen}
              onClose={() => setIsColorPickerOpen(false)}
              onSelectColor={handleColorSelect}
            />
          </>
        ) : null;
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 font-sans">
      {renderContent()}
    </main>
  );
}
