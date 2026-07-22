export function buildOpeningPrompt(moveHistory: string): string {
  return `You are a world-class chess opening expert. A player has made these moves (UCI notation): ${moveHistory}

Identify the opening. Respond ONLY with valid JSON:
{
  "name": "Full opening name",
  "eco": "ECO code",
  "explanation": "2-3 sentence explanation of this opening.",
  "keyIdeas": "3-4 key strategic ideas separated by semicolons.",
  "commonContinuations": "2-3 most common continuation moves in SAN."
}

If fewer than 2 half-moves, provide the broadest classification possible.
If unknown, use: {"name":"Unknown Position","eco":"A00","explanation":"Does not correspond to a standard opening.","keyIdeas":"N/A","commonContinuations":"N/A"}`
}
