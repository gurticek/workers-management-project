import { json } from '@sveltejs/kit';
import { getAllWorkers, createWorker, searchWorkers } from '$lib/server/db/workers.js';

export function GET({ url }) {
	const q = url.searchParams.get('q');
	const workers = q ? searchWorkers(q) : getAllWorkers();
	return json(workers);
}

export async function POST({ request }) {
	const data = await request.json();
	if (!data.name) return json({ error: 'Name is required' }, { status: 400 });
	const worker = createWorker(data);
	return json(worker, { status: 201 });
}
