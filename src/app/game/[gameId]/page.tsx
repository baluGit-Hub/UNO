
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { type GameState, type Player, type Card as CardType, type CardColor } from "@/lib/types";
import { createDeck, shuffleDeck, canPlayCard } from "@/lib/game";
import { GameBoard } from "@/components/game/game-board";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ColorPicker } from "@/components/game/color-picker";
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { db } from "@/lib/firebase";
import { ref, onValue, set, get } from "firebase/database";

type GameStage = "loading" | "waiting" | "playing" | "gameOver";

export default function GamePage() {
  const [gameStage, setGameStage] = useState<GameStage>("loading");
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [cardToPlay, setCardToPlay] = useState<CardType | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [hasDrawn, setHasDrawn] = useState(false);

  const { toast } = useToast();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const gameId = params.gameId as string;
  const playerName = searchParams.get('playerName');
  const isNewGame = searchParams.get('newGame') === 'true';
  const maxPlayers = parseInt(searchParams.get('maxPlayers') || '4', 10);
  const gameRef = useMemo(() => ref(db, `games/${gameId}`), [gameId]);

  useEffect(() => {
    if (!playerName) {
        router.push('/');
        return;
    }
    // Use localStorage to keep playerId stable across reloads for the same user in the same browser tab
    let storedPlayerId = localStorage.getItem(`uno-player-id-${gameId}`);
    if (!storedPlayerId) {
        storedPlayerId = `player-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem(`uno-player-id-${gameId}`, storedPlayerId);
    }
    setPlayerId(storedPlayerId);
  }, [playerName, router, gameId]);

  const updateGameState = useCallback((newState: GameState) => {
    return set(gameRef, newState);
  }, [gameRef]);

  const handleStartGame = useCallback(async () => {
    if (!isNewGame || !playerId || !playerName) return;

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
        maxPlayers,
    };
    
    await updateGameState(newGameState);
  }, [isNewGame, gameId, playerName, playerId, maxPlayers, updateGameState]);


  const joinGame = useCallback(async () => {
    if (isNewGame || !playerId || !playerName) return;

    const snapshot = await get(gameRef);
    if (snapshot.exists()) {
        const existingState: GameState = snapshot.val();
        
        const playerInGame = existingState.players.find(p => p.id === playerId);

        if (!playerInGame && existingState.players.length < existingState.maxPlayers) {
            let deck = existingState.deck;
            const hand = deck.splice(0,7);
            const newPlayer: Player = { id: playerId, name: playerName!, hand, isAI: false };
            const newPlayers = [...existingState.players, newPlayer];
            const newGameState = {...existingState, players: newPlayers, deck };
            await updateGameState(newGameState);
        } else if (existingState.players.length >= existingState.maxPlayers && !playerInGame) {
            toast({title: "Game is full", variant: "destructive"});
            router.push('/');
        }
    } else {
        toast({title: "Game not found", variant: "destructive"});
        router.push('/');
    }
  }, [isNewGame, playerName, playerId, gameRef, router, toast, updateGameState]);


  useEffect(() => {
    if (!playerId || !playerName) return;

    if (isNewGame) {
        handleStartGame();
    } else {
        joinGame();
    }
  }, [isNewGame, handleStartGame, joinGame, playerId, playerName]);
  
  // Firebase listener
  useEffect(() => {
    const unsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setGameState(data);
        setHasDrawn(false);
        if (data.isGameOver) {
          setGameStage("gameOver");
        } else if (data.players.length < data.maxPlayers && !data.isGameOver) {
          setGameStage("waiting");
        }
        else {
          setGameStage("playing");
        }
      } else if (!isNewGame) {
        // This might be too aggressive if a game is deleted.
        // setGameStage("loading");
      }
    });

    return () => unsubscribe();
  }, [gameRef, isNewGame, maxPlayers]);

  const advanceTurn = useCallback((players: Player[], currentIndex: number, direction: 'clockwise' | 'counterclockwise') => {
    if (direction === 'clockwise') {
      return (currentIndex + 1) % players.length;
    } else {
      return (currentIndex - 1 + players.length) % players.length;
    }
  }, []);
  
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
      await updateGameState(newState);
      return;
    }

    let nextPlayerIndex = newState.currentPlayerIndex;

    switch (card.value) {
      case 'Reverse':
        newState.gameDirection = newState.gameDirection === 'clockwise' ? 'counterclockwise' : 'clockwise';
        // With 2 players, reverse is like a skip
        if(newState.players.length === 2) {
            nextPlayerIndex = advanceTurn(newState.players, nextPlayerIndex, newState.gameDirection);
        }
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

    await updateGameState(newState);
    setCardToPlay(null);
    setIsColorPickerOpen(false);
  }, [gameState, advanceTurn, toast, updateGameState]);


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
    
    if (card.color === 'Wild') {
      setCardToPlay(card);
      setIsColorPickerOpen(true);
    } else {
      await processCardPlay(card, null);
    }
  }, [gameState, toast, playerId, processCardPlay]);

  const handleDrawCard = useCallback(async () => {
    if (!gameState || !playerId) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.id !== playerId) return;


    let newState = { ...gameState };
    if (newState.deck.length === 0) {
      // reshuffle discard pile into deck
       if (newState.discardPile.length > 1) {
            const topCard = newState.discardPile.pop()!;
            newState.deck = shuffleDeck(newState.discardPile);
            newState.discardPile = [topCard];
       } else {
            toast({ title: "No cards to draw!", variant: 'destructive' });
            return;
       }
    }

    const drawnCard = newState.deck.shift()!;
    newState.players[newState.currentPlayerIndex].hand.push(drawnCard);
    setHasDrawn(true);
    await updateGameState(newState);
    toast({ title: "Card Drawn", description: `You drew a ${drawnCard.color} ${drawnCard.value}.`});

  }, [gameState, toast, playerId, updateGameState]);

  const handlePassTurn = useCallback(async () => {
    if (!gameState || !playerId || !hasDrawn) return;
     const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.id !== playerId) return;

    let newState = {...gameState};
    newState.currentPlayerIndex = advanceTurn(newState.players, newState.currentPlayerIndex, newState.gameDirection);
    newState.turnMessage = `${newState.players[newState.currentPlayerIndex].name}'s turn...`;
    await updateGameState(newState);
    setHasDrawn(false);
  }, [gameState, playerId, advanceTurn, updateGameState, hasDrawn]);
  
  const handleColorSelect = useCallback(async (color: CardColor) => {
    setIsColorPickerOpen(false);
    if(cardToPlay) {
      await processCardPlay(cardToPlay, color);
    }
    setCardToPlay(null);
  }, [processCardPlay, cardToPlay]);
  
  const handleUnoClick = useCallback(async () => {
    console.log("UNO clicked");
  }, []);

  const renderContent = () => {
    switch (gameStage) {
      case "loading":
        return <p>Loading game...</p>;
      case "waiting":
         return gameState ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Waiting for players...</h2>
            <p className="mb-2">Share this Game ID: <span className="font-mono bg-muted px-2 py-1 rounded">{gameState.gameId}</span></p>
            <p className="mb-4">{gameState.players.length} of {gameState.maxPlayers} players have joined.</p>
            <ul className="list-disc list-inside">
              {gameState.players.map(p => <li key={p.id}>{p.name}</li>)}
            </ul>
          </div>
        ) : <p>Creating game...</p>;
      case "playing":
      case "gameOver":
        return gameState && playerId ? (
          <>
            <GameBoard
              gameState={gameState}
              onPlayCard={handlePlayCard}
              onDrawCard={handleDrawCard}
              onPassTurn={handlePassTurn}
              onUnoClick={handleUnoClick}
              isPlayerTurn={gameState.players[gameState.currentPlayerIndex].id === playerId}
              playerId={playerId}
              hasDrawn={hasDrawn}
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
