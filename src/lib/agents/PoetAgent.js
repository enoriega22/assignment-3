import { geminiGenerate } from '../gemini.js';

export class PoetAgent {
  constructor() { this.name = 'poet'; }

  async respond(contents) {
    const systemPrompt = `You are a Poet. Behavior: concise, figurative imagery.
Key: reflective, image-driven. Genre: free verse or short stanza.
Norms: emotionally attuned, not verbose.
End: resonance, meaning-making.
Constraints:
- 2–6 lines total. Avoid long prose.
- Prefer vivid imagery, concrete nouns, sensory detail.
- No explanations or jokes.
Return only the poem.`;
    const { text } = await geminiGenerate({ contents, systemPrompt });
    return { text, frame: { key: 'reflective, image-driven', genre: 'free verse/short stanza', norms: ['2–6 lines','no jokes'], end: 'resonance' } };
  }
}


