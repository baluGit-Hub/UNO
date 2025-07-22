'use server';

/**
 * @fileOverview A simple AI opponent for the Card Party game.
 *
 * - getAiAction - A function that determines the AI's action based on the current game state.
 * - GetAiActionInput - The input type for the getAiAction function.
 * - GetAiActionOutput - The return type for the getAiAction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetAiActionInputSchema = z.object({
  playerCards: z.array(z.string()).describe('The cards in the AI opponent\'s hand.'),
  topCard: z.string().describe('The top card on the discard pile.'),
  currentPlayer: z.string().describe('The current player\'s name.'),
  gameDirection: z.enum(['clockwise', 'counterclockwise']).describe('The direction of the game.'),
});
export type GetAiActionInput = z.infer<typeof GetAiActionInputSchema>;

const GetAiActionOutputSchema = z.object({
  action: z.enum(['play', 'draw']).describe('The action the AI should take.'),
  cardToPlay: z.string().optional().describe('The card the AI should play, if playing.'),
});
export type GetAiActionOutput = z.infer<typeof GetAiActionOutputSchema>;

export async function getAiAction(input: GetAiActionInput): Promise<GetAiActionOutput> {
  return getAiActionFlow(input);
}

const getAiActionPrompt = ai.definePrompt({
  name: 'getAiActionPrompt',
  input: {schema: GetAiActionInputSchema},
  output: {schema: GetAiActionOutputSchema},
  prompt: `You are an AI opponent in the Card Party game (similar to UNO). It is the AI opponent's turn.

  The AI opponent\'s hand is: {{playerCards}}
  The top card on the discard pile is: {{topCard}}
  The current player is: {{currentPlayer}}
  The game direction is: {{gameDirection}}

  Determine whether the AI should play a card or draw a card. If the AI should play a card, determine which card to play.

  Here's how to determine the AI action:

  1.  First, check if the AI has a card that matches the color or number of the top card on the discard pile.
  2.  If there are multiple cards that can be played, play the first one.
  3.  If no card can be played, draw a card.

  Return a JSON object with the action and the card to play (if playing).
  `, config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  }
});

const getAiActionFlow = ai.defineFlow(
  {
    name: 'getAiActionFlow',
    inputSchema: GetAiActionInputSchema,
    outputSchema: GetAiActionOutputSchema,
  },
  async input => {
    const {output} = await getAiActionPrompt(input);
    return output!;
  }
);
