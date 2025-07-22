import type { GameState } from "./types";

// This object is in-memory on the server, shared across all API requests.
const games: Record<string, GameState> = {};

export function getGame(gameId: string): GameState | null {
  console.log('Current games on server:', Object.keys(games));
  return games[gameId] || null;
}

export function setGame(gameId: string, state: GameState) {
  console.log('Setting game on server:', gameId);
  games[gameId] = state;
} 