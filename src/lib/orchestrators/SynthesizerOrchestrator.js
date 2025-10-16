import { HistorianAgent } from '../agents/HistorianAgent.js';
import { ComedianAgent } from '../agents/ComedianAgent.js';
import { PoetAgent } from '../agents/PoetAgent.js';
import { geminiGenerate } from '../gemini.js';

function choosePattern(latestText) {
	const t = (latestText || '').toLowerCase();
	if (t.includes('haiku') || t.includes('sonnet') || t.includes('poem')) return 'form-request';
	if (t.includes('why') || t.includes('when') || t.includes('where')) return 'lead-color';
	if (t.includes('sad') || t.includes('grief') || t.includes('heavy')) return 'mood-repair';
	return 'two-sides-bridge';
}

export class SynthesizerOrchestrator {
	constructor() {
		this.name = 'synthesizer';
		this.historian = new HistorianAgent();
		this.comedian = new ComedianAgent();
		this.poet = new PoetAgent();
	}

	async orchestrate(contents) {
		const latestText = contents?.[contents.length - 1]?.parts?.[0]?.text || '';
		const [h, p, c] = await Promise.all([
			this.historian.respond(contents),
			this.poet.respond(contents),
			this.comedian.respond(contents)
		]);

		const pattern = choosePattern(latestText);
		const systemPrompt = `You merge three agent outputs into one reply.
Follow SPEAKING End goals. Keep frames distinct, but coherent.
Use one pattern:
1) Lead + Color: Historian facts → Poet resonance → Comedian tag.
2) Two-sides + Bridge: Historian vs Comedian tension, Poet braids them.
3) Form request: Poet leads (requested form), Historian adds one-line sidebar, Comedian closes with gentle tag.
4) Mood repair: Poet empathy → Historian clarity → Comedian uplift.
Constraints:
- 6–10 sentences max, or 2–6 lines if form-led.
- Preserve factual accuracy from Historian; limit Comedian to ≤2 jokes; keep Poet concise.
Return only the merged reply.`;
		const userParts = [ { text: `Historian:\n${h.text}\n\nPoet:\n${p.text}\n\nComedian:\n${c.text}\n\nPattern:\n${pattern}` } ];
		const { text } = await geminiGenerate({ contents: [{ role: 'user', parts: userParts }], systemPrompt });
		const frameSet = {
			frames: {
				persona: { value: 'synthesized', rationale: [ `Pattern: ${pattern}` ] },
				key: 'balanced',
				genre: 'blended orchestration',
				norms: ['preserve facts','≤2 jokes','concise verse'],
				end: 'clear + resonant + engaging'
			}
		};
		return { assistantMessage: text || '', frameSet, agent: 'synthesizer', reasons: `Pattern: ${pattern}` };
	}
}


