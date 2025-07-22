"use client";

import { useState, useEffect, useCallback } from "react";
import { type GameState, type Player, type Card as CardType, type CardColor } from "@/lib/types";
import { createDeck, shuffleDeck, canPlayCard } from "@/lib/game";
import { GameBoard } from "@/components/game/game-board";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ColorPicker } from "@/components/game/color-picker";
import { useParams, useSearchParams, useRouter } from 'next/navigation';

type GameStage = "loading" | "waiting" | "playing" | "gameOver";

export default function GamePage() {
  const [gameStage, setGameStage] = useState<GameStage>("loading");
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [cardToPlay, setCardToPlay] = useState<CardType | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);

  const { toast } = useToast();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const gameId = params.gameId as string;
  const playerName = searchParams.get('playerName');
  const isNewGame = searchParams.get('newGame') === 'true';

  useEffect(() => {
    if (!playerName) {
        // redirect to home if no player name
        router.push('/');
    }
    const id = `player-${Math.random().toString(36).substr(2, 9)}`;
    setPlayerId(id);
  }, [playerName, router]);

  // MOCKUP: In a real app, this would use a real-time database
  const [mockDb, setMockDb] = useState<Record<string, GameState>>({});

  const handleStartGame = useCallback(() => {
    if (!isNewGame || !playerId) return;

    const players: Player[] = [
      { id: playerId, name: playerName!, hand: [], isAI: false },
    ];

    let deck = createDeck();
    deck = shuffleDeck(deck);

    players.forEach(player => {
      player.hand = deck.splice(0, 7);
    });
    
    let topCard: CardType;
    do {
      topCard = deck.pop()!;
    } while (topCard.color === 'Wild');

    const newGameState: GameState = {
        players,
        deck,
        discardPile: [topCard],
        currentPlayerIndex: 0,
        gameDirection: "clockwise",
        isGameOver: false,
        winner: null,
        chosenColor: null,
        turnMessage: `${players[0].name}'s turn!`,
        gameId,
    };
    
    // MOCK DB update
    setMockDb(prev => ({...prev, [gameId]: newGameState}));
    setGameState(newGameState);
    setGameStage("playing");
  }, [isNewGame, gameId, playerName, playerId]);


  const joinGame = useCallback(() => {
    if (isNewGame || !playerId) return;

    const existingState = mockDb[gameId];
    if (existingState && !existingState.players.find(p => p.id === playerId)) {
        let deck = existingState.deck;
        const hand = deck.splice(0,7);
        const newPlayer: Player = { id: playerId, name: playerName!, hand, isAI: false };
        const newPlayers = [...existingState.players, newPlayer];
        const newGameState = {...existingState, players: newPlayers, deck };
        
        setMockDb(prev => ({...prev, [gameId]: newGameState}));
        setGameState(newGameState);
        setGameStage("playing");
    } else if (existingState) {
        setGameState(existingState);
        setGameStage("playing");
    } else {
        setGameStage("waiting"); // Game not created yet.
    }
  }, [isNewGame, gameId, playerName, playerId, mockDb]);


  useEffect(() => {
    if (isNewGame && playerId) {
        handleStartGame();
    } else if (!isNewGame && playerId) {
        joinGame();
    }
  }, [isNewGame, handleStartGame, joinGame, playerId]);
  
  // This effect will simulate real-time updates from our mock DB
  useEffect(() => {
    if (gameId && mockDb[gameId]) {
        setGameState(mockDb[gameId]);
    }
  }, [mockDb, gameId]);


  const advanceTurn = useCallback((players: Player[], currentIndex: number, direction: 'clockwise' | 'counterclockwise') => {
    if (direction === 'clockwise') {
      return (currentIndex + 1) % players.length;
    } else {
      return (currentIndex - 1 + players.length) % players.length;
    }
  }, []);

  const handlePlayCard = useCallback(async (card: CardType) => {
    if (!gameState || !playerId) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.id !== playerId) {
        toast({ title: "Not your turn!", variant: 'destructive'});
        return;
    }

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
  }, [gameState, toast, playerId]);

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
      setMockDb(prev => ({...prev, [gameId]: newState}));
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
    newState.turnMessage = `${nextPlayer.name}'s turn...`;

    setMockDb(prev => ({...prev, [gameId]: newState}));
    setCardToPlay(null);
  }, [gameState, advanceTurn, toast, gameId]);

  const handleDrawCard = useCallback(() => {
    if (!gameState || !playerId) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.id !== playerId) return;


    let newState = { ...gameState };
    if (newState.deck.length === 0) {
      toast({ title: "Deck is empty!", variant: 'destructive' });
      return;
    }

    const drawnCard = newState.deck.shift()!;
    newState.players[newState.currentPlayerIndex].hand.push(drawnCard);

    newState.currentPlayerIndex = advanceTurn(newState.players, newState.currentPlayerIndex, newState.gameDirection);
    newState.turnMessage = `${newState.players[newState.currentPlayerIndex].name}'s turn...`;
    
    setMockDb(prev => ({...prev, [gameId]: newState}));
    toast({ title: "Card Drawn", description: `You drew a ${drawnCard.color} ${drawnCard.value}.`});

  }, [gameState, toast, advanceTurn, playerId, gameId]);
  
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
      case "loading":
        return <p>Loading...</p>;
      case "waiting":
        return <p>Waiting for game to be created...</p>;
      case "playing":
      case "gameOver":
        return gameState && playerId ? (
          <>
            <GameBoard
              gameState={gameState}
              onPlayCard={handlePlayCard}
              onDrawCard={handleDrawCard}
              isPlayerTurn={gameState.players[gameState.currentPlayerIndex].id === playerId}
              playerId={playerId}
            />
            {gameStage === 'gameOver' && gameState.winner && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                <Card className="p-10 text-center shadow-2xl animate-in fade-in zoom-in">
                  <CardTitle className="text-4xl font-bold mb-4">Game Over!</CardTitle>
                  <p className="text-2xl mb-8">The winner is {gameState.winner.name}!</p>
                  <Button onClick={() => router.push('/')} size="lg" className="text-xl px-8 py-6">Play Again</Button>
                </Card>
              </div>
            )}
             <ColorPicker
              isOpen={isColorPickerOpen}
              onClose={() => setIsColorPickerOpen(false)}
              onSelectColor={handleColorSelect}
            />
          </>
        ) : <p>Loading Game State...</p>;
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 font-sans">
      {renderContent()}
    </main>
  );
}
