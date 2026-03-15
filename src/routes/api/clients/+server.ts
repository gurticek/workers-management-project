import { json } from '@sveltejs/kit';
import { getAllClients, createClient } from '$lib/server/db/clients.js';

export function GET() {
	return json(getAllClients());
}

export async function POST({ request }) {
	const data = await request.json();
	if (!data.company_name) return json({ error: 'Company name is required' }, { status: 400 });
	const client = createClient(data);
	return json(client, { status: 201 });
}
