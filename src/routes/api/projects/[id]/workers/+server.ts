import { json } from '@sveltejs/kit';
import { getWorkersByProject, assignWorker, removeWorker } from '$lib/server/db/project-workers.js';

export function GET({ params }) {
  return json(getWorkersByProject(Number(params.id)));
}

export async function POST({ params, request }) {
  const data = await request.json();
  data.project_id = Number(params.id);
  const pw = assignWorker(data);
  return json(pw, { status: 201 });
}

export async function DELETE({ params, request }) {
  const { worker_id } = await request.json();
  const ok = removeWorker(Number(params.id), worker_id);
  if (!ok) return json({ error: 'Not found' }, { status: 404 });
  return json({ success: true });
}
