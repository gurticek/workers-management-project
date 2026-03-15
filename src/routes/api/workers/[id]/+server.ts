import { json } from '@sveltejs/kit';
import { getWorkerById, updateWorker, deleteWorker } from '$lib/server/db/workers.js';

export function GET({ params }) {
	const worker = getWorkerById(Number(params.id));
	if (!worker) return json({ error: 'Not found' }, { status: 404 });
	return json(worker);
}

export async function PUT({ params, request }) {
	const data = await request.json();
	const worker = updateWorker(Number(params.id), data);
	if (!worker) return json({ error: 'Not found' }, { status: 404 });
	return json(worker);
}

export async function DELETE({ params }) {
	const ok = deleteWorker(Number(params.id));
	if (!ok) return json({ error: 'Not found' }, { status: 404 });
	return json({ success: true });
}
