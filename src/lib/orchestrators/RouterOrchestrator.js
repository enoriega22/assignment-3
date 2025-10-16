import { HistorianAgent } from '../agents/HistorianAgent.js';
import { ComedianAgent } from '../agents/ComedianAgent.js';
import { PoetAgent } from '../agents/PoetAgent.js';

function detectIntentAndSentiment(latestText) {
	const t = (latestText || '').toLowerCase();
	const historianKeys = ['when','why','where','history','timeline','cause','consequence','define','origin','background'];
	const poetKeys = ['poem','poetic','metaphor','haiku','verse','lyric','stanza'];
	const humorKeys = ['joke','funny','make me laugh','lighten','meme'];

	const negWords = ['sad','stressed','anxious','frustrated','tired','overwhelmed','angry','down'];
	const solemnWords = ['grief','loss','mourning','reflect','contemplate','quiet','solemn','tender'];

	const contains = (list) => list.some(k => t.includes(k));

	const requestPoet = contains(poetKeys);
	const requestHistorian = contains(historianKeys);
	const requestHumor = contains(humorKeys);

	const negative = contains(negWords);
	const solemn = contains(solemnWords);

	let route = 'historian';
	if (requestPoet) route = 'poet';
	else if (requestHumor) route = 'comedian';
	else if (requestHistorian) route = 'historian';
	else if (negative) route = 'comedian';
	else if (solemn) route = 'poet';
	else route = 'historian';

	const reasons = [];
	if (requestPoet) reasons.push('User requested figurative/poetic form');
	if (requestHumor) reasons.push('User requested humor/lightness');
	if (requestHistorian) reasons.push('User asked info/when/why/where');
	if (negative) reasons.push('Negative sentiment → supportive humor');
	if (solemn) reasons.push('Solemn tone → reflective verse');
	if (!reasons.length) reasons.push('Defaulted to facts/clarity');

	return { route, reasons };
}

export class RouterOrchestrator {
	constructor() {
		this.name = 'router';
		this.agents = {
			historian: new HistorianAgent(),
			comedian: new ComedianAgent(),
			poet: new PoetAgent()
		};
	}

	async orchestrate(contents) {
		const latestText = contents?.[contents.length - 1]?.parts?.[0]?.text || '';
		const { route, reasons } = detectIntentAndSentiment(latestText);
		const agent = this.agents[route] || this.agents.historian;
		const { text, frame } = await agent.respond(contents);
		const frameSet = { frames: { persona: { value: route, rationale: reasons }, key: frame?.key, genre: frame?.genre, norms: frame?.norms, end: frame?.end } };
		return { assistantMessage: text || '', frameSet, agent: route, reasons: reasons.join('; ') };
	}
}


