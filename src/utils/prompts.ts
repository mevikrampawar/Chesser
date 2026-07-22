export function buildOpeningPrompt(movesSan: string): string {
  return `You are a grandmaster-level chess opening expert. Identify this opening precisely.

Moves played: ${movesSan}

You MUST respond with ONLY valid JSON (no markdown, no explanation):
{
  "name": "Exact standard opening name (e.g. London System, Sicilian Defense, Queen's Gambit)",
  "eco": "ECO code (e.g. D00, B90, D20)",
  "explanation": "2-3 sentences explaining this opening's character and purpose.",
  "keyIdeas": "3-4 key strategic ideas separated by semicolons.",
  "commonContinuations": "2-3 most common continuation moves in SAN notation.",
  "stats": { "white": 52.3, "draws": 28.1, "black": 19.6 },
  "topMoves": [
    { "san": "Nf3", "white": 55, "draws": 30, "black": 15 },
    { "san": "d4", "white": 50, "draws": 32, "black": 18 }
  ]
}

Critical rules:
- name must be the PRECISE standard opening name used in master-level chess
- 1.d4 d5 2.Nf3 Nf6 3.Bf4 = London System (D00)
- 1.e4 c5 = Sicilian Defense (B20)
- 1.d4 d5 2.c4 = Queen's Gambit (D30)
- 1.e4 e5 2.Nf3 Nc6 2.Bb5 = Ruy Lopez (C60)
- stats: approximate win percentages from master games (should sum to ~100)
- topMoves: 3-5 best continuations with approximate W/D/L percentages
- If fewer than 2 half-moves, give the broadest classification
- If truly unknown, use: {"name":"Unknown Position","eco":"A00","explanation":"Does not correspond to a standard named opening.","keyIdeas":"N/A","commonContinuations":"N/A","stats":null,"topMoves":[]}`
}
