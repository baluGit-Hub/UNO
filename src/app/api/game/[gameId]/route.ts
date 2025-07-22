import { NextResponse } from 'next/server';
import { getGame, setGame } from '@/lib/local-db';
import { type GameState } from '@/lib/types';

export async function GET(
  request: Request,
  { params }: { params: { gameId: string } }
) {
  const gameId = params.gameId;
  const game = getGame(gameId);
  if (game) {
    return NextResponse.json(game);
  } else {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { gameId: string } }
) {
  const gameId = params.gameId;
  try {
    const body: GameState = await request.json();
    setGame(gameId, body);
    return NextResponse.json(body);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
} 