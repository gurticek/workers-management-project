import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export const POST: RequestHandler = async ({ request }) => {
	if (!GEMINI_API_KEY) {
		return json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
	}

	const { text } = await request.json();
	if (!text || text.trim().length < 50) {
		return json({ error: 'This appears to be a scanned document or contains too little text. Scanned documents are not supported yet.' }, { status: 400 });
	}

	const systemPrompt = `You are a contract parser specializing in Slovak and Czech business contracts. Extract structured data from the contract text provided. Return ONLY valid JSON (no markdown, no code fences, no explanation) with this exact structure:
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
- Extract as much detail as possible from the contract text.`;

	try {
		const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				system_instruction: { parts: [{ text: systemPrompt }] },
				contents: [{ parts: [{ text: `Parse this contract:\n\n${text}` }] }],
				generationConfig: {
					temperature: 0.1,
					maxOutputTokens: 4096,
					responseMimeType: 'application/json'
				}
			})
		});

		if (!res.ok) {
			const err = await res.text();
			console.error('[parse-contract] Gemini error:', err);
			return json({ error: 'AI service error: ' + res.status }, { status: 500 });
		}

		const data = await res.json();
		const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
		if (!content) {
			return json({ error: 'Empty response from AI' }, { status: 500 });
		}

		const parsed = JSON.parse(content);
		return json(parsed);
	} catch (e: any) {
		console.error('[parse-contract] Error:', e);
		return json({ error: 'Failed to parse contract: ' + (e?.message || String(e)) }, { status: 500 });
	}
};
