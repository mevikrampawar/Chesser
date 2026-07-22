export function buildOpeningPrompt(moveHistory: string): string {
  return `You are a world-class chess opening encyclopedia. A player has made these moves (UCI notation): ${moveHistory}

Identify the opening and respond ONLY with valid JSON:
{
  "name": "Full opening name",
  "eco": "ECO code",
  "explanation": "2-3 sentence explanation of this opening.",
  "keyIdeas": "3-4 key strategic ideas separated by semicolons.",
  "commonContinuations": "2-3 most common continuation moves in SAN.",
  "stats": { "white": 52.3, "draws": 28.1, "black": 19.6 },
  "topMoves": [
    { "san": "Nf3", "white": 55, "draws": 30, "black": 15 },
    { "san": "d4", "white": 50, "draws": 32, "black": 18 }
  ]
}

Rules for stats and topMoves:
- stats: approximate win percentages (white+draws+black should equal ~100)
- topMoves: 3-5 most common continuations from this position
- Each topMove has san notation and approximate percentages
- Base these on master-level games from your training data

If fewer than 2 half-moves, provide the broadest classification possible.
If unknown, use: {"name":"Unknown Position","eco":"A00","explanation":"Does not correspond to a standard opening.","keyIdeas":"N/A","commonContinuations":"N/A","stats":null,"topMoves":[]}`
}
