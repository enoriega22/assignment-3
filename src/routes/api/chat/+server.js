import { json } from '@sveltejs/kit';
import { RouterOrchestrator } from '$lib/orchestrators/RouterOrchestrator.js';
import { SynthesizerOrchestrator } from '$lib/orchestrators/SynthesizerOrchestrator.js';

/**
 * Handle chat POST requests for a single-turn pipeline execution.
 *
 * Parameters: ({ request }) SvelteKit request wrapper.
 * Returns: JSON response with pipeline output or error.
 */
export async function POST({ request, url }) {
  const body = await request.json();
  const { history, mode } = body || {};

  if (!Array.isArray(history)) {
    return json({ error: 'history array is required' }, { status: 400 });
  }

  try {
    const useSynth = (typeof mode === 'string' ? mode : (url.searchParams.get('mode') || '')).toLowerCase() === 'synth';
    const orchestrator = useSynth ? new SynthesizerOrchestrator() : new RouterOrchestrator();
    const contents = history.map((m) => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] }));
    
    const { assistantMessage, frameSet, agent, reasons } = await orchestrator.orchestrate(contents);
    
    return json({ assistantMessage, replierInput: { frameSet, contextCount: history.length, agent, reasons }, mode: useSynth ? 'synth' : 'router' });
  } catch (err) {
    const msg = String(err?.message || err || '').toLowerCase();
    if (msg.includes('gemini_api_key') || msg.includes('gemini') || msg.includes('api key')) {
      return json({ error: 'Gemini API key not found' }, { status: 400 });
    }
    return json({ error: 'Pipeline error', details: String(err?.message || err) }, { status: 500 });
  }
}
