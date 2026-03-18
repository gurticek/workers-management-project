import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Anthropic from '@anthropic-ai/sdk';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

export const POST: RequestHandler = async ({ request }) => {
	if (!ANTHROPIC_API_KEY) {
		return json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
	}

	const { text } = await request.json();
	if (!text || text.trim().length < 50) {
		return json({ error: 'This appears to be a scanned document or contains too little text. Scanned documents are not supported yet.' }, { status: 400 });
	}

	const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

	const response = await client.messages.create({
		model: 'claude-sonnet-4-20250514',
		max_tokens: 4096,
		system: `You are a contract parser specializing in Slovak and Czech business contracts. Extract structured data from the contract text provided. Return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "client": {
    "company_name": "",
    "contact_person": "",
    "contact_email": "",
    "contact_phone": "",
    "address": "",
    "company_size": ""
  },
  "project": {
    "name": "",
    "description": "",
    "start_date": "",
    "end_date": "",
    "value": null,
    "currency": "EUR",
    "status": "planned"
  },
  "workers": [
    {
      "name": "",
      "role": "",
      "allocated_hours": null,
      "hourly_rate": null,
      "phone": "",
      "email": "",
      "address": "",
      "notes": ""
    }
  ]
}

Rules:
- Translate role names and descriptions to English. Keep names, addresses, and company names in their original language.
- If a field is not found, use null for numbers and "" for strings.
- Dates in YYYY-MM-DD format.
- For "value", extract the total contract/project value if mentioned.
- The "client" is the company ordering the work (objednávateľ/odberateľ). 
- Workers (zamestnanci/pracovníci) are the people assigned to do the work.
- If the contract mentions your/our company (dodávateľ/zhotoviteľ), that is NOT the client — skip it.
- Extract as much detail as possible from the contract text.`,
		messages: [{ role: 'user', content: `Parse this contract:\n\n${text}` }]
	});

	const content = response.content[0];
	if (content.type !== 'text') {
		return json({ error: 'Unexpected response from AI' }, { status: 500 });
	}

	try {
		const parsed = JSON.parse(content.text);
		return json(parsed);
	} catch {
		// Try to extract JSON from response if wrapped in text
		const match = content.text.match(/\{[\s\S]*\}/);
		if (match) {
			try {
				const parsed = JSON.parse(match[0]);
				return json(parsed);
			} catch {
				return json({ error: 'Failed to parse AI response', raw: content.text }, { status: 500 });
			}
		}
		return json({ error: 'Failed to parse AI response', raw: content.text }, { status: 500 });
	}
};
