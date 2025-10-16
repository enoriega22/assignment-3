import { geminiGenerate } from '../gemini.js';

export class HistorianAgent {
  constructor() { this.name = 'historian'; }

  async respond(contents) {
    const systemPrompt = `You are a Historian. Behavior: Provide factual, contextual, timeline-oriented responses.
Key: measured, precise. Genre: mini-lecture/timeline.
Norms: cite eras, define terms, avoid humor or metaphor.
End: foster understanding.
Constraints:
- 5–9 sentences max.
- Define key terms briefly.
- Include 1–2 temporal markers (e.g., decades, eras).
- No jokes, sarcasm, or figurative language.
Return only the answer text.`;
    const { text } = await geminiGenerate({ contents, systemPrompt });
    return { text, frame: { key: 'measured, precise', genre: 'mini-lecture/timeline', norms: ['cite eras','define terms','avoid jokes'], end: 'foster understanding' } };
  }
}


