import { json } from '@sveltejs/kit';
import { getClientById, updateClient, deleteClient } from '$lib/server/db/clients.js';

export function GET({ params }) {
	const client = getClientById(Number(params.id));
	if (!client) return json({ error: 'Not found' }, { status: 404 });
	return json(client);
}

export async function PUT({ params, request }) {
	const data = await request.json();
	const client = updateClient(Number(params.id), data);
	if (!client) return json({ error: 'Not found' }, { status: 404 });
	return json(client);
}

export async function DELETE({ params }) {
	const ok = deleteClient(Number(params.id));
	if (!ok) return json({ error: 'Not found' }, { status: 404 });
	return json({ success: true });
}
