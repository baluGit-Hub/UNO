import { type Card, type CardColor, type CardValue } from "./types";

const colors: CardColor[] = ["Red", "Green", "Blue", "Yellow"];

export function createDeck(): Card[] {
  const deck: Card[] = [];
  let idCounter = 0;

  colors.forEach((color) => {
    // One '0' card
    deck.push({ id: `card-${idCounter++}`, color, value: "0" });
    // Two of each number 1-9
    for (let i = 1; i <= 9; i++) {
      deck.push({ id: `card-${idCounter++}`, color, value: i.toString() as CardValue });
      deck.push({ id: `card-${idCounter++}`, color, value: i.toString() as CardValue });
    }
    // Two of each action card
    ["Skip", "Reverse", "Draw Two"].forEach((value) => {
      deck.push({ id: `card-${idCounter++}`, color, value: value as CardValue });
      deck.push({ id: `card-${idCounter++}`, color, value: value as CardValue });
    });
  });

  // Four Wild cards and four Wild Draw Four cards
  for (let i = 0; i < 4; i++) {
    deck.push({ id: `card-${idCounter++}`, color: "Wild", value: "Wild" });
    deck.push({ id: `card-${idCounter++}`, color: "Wild", value: "Draw Four" });
  }

  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function canPlayCard(card: Card, topCard: Card, chosenColor: CardColor | null, playerHand: Card[]): boolean {
  if (card.color === "Wild") {
    if (card.value === "Draw Four") {
      const playableColor = chosenColor || topCard.color;
      // Player can't have any other card that matches the current color
      return !playerHand.some(c => c.color === playableColor);
    }
    return true;
  }
  if (chosenColor) {
    return card.color === chosenColor;
  }
  return card.color === topCard.color || card.value === topCard.value;
}
