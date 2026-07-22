export function buildOpeningPrompt(moveHistory: string): string {
  return `You are a world-class chess opening expert and coach. A player has made the following moves in a chess game.

Moves (UCI notation): ${moveHistory}

Identify the chess opening being played. Respond ONLY with valid JSON in this exact format:
{
  "name": "Full opening name (e.g. 'Sicilian Defense: Najdorf Variation')",
  "eco": "ECO code (e.g. 'B90')",
  "explanation": "A clear 2-3 sentence explanation of this opening: what it is, who plays it, and why it's popular.",
  "keyIdeas": "3-4 key strategic ideas or plans for both sides in this opening, separated by semicolons.",
  "commonContinuations": "The 2-3 most common continuation moves in standard algebraic notation (SAN)."
}

If the moves are too few to identify a specific opening (fewer than 2 half-moves), provide the broadest classification possible and note that more moves are needed.

If the move sequence does not correspond to any known opening, respond with:
{
  "name": "Uncommon/Unknown Position",
  "eco": "A00",
  "explanation": "This move sequence does not correspond to a standard named opening.",
  "keyIdeas": "Unable to determine specific ideas from this move sequence.",
  "commonContinuations": "N/A"
}`
}

export function buildCoachingPrompt(moveHistory: string, openingName: string): string {
  return `You are a chess coach. The player has reached the "${openingName}" opening with these moves: ${moveHistory}.

Provide a brief coaching tip (2-3 sentences) about:
1. What should the player's next strategic priority be?
2. One common mistake to avoid in this position.

Be concise and actionable. Do not use markdown formatting.`
}
