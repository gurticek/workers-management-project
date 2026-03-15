import { getWorkerById } from '$lib/server/db/workers.js';
import { getProjectsByWorker } from '$lib/server/db/project-workers.js';
import { error } from '@sveltejs/kit';

export function load({ params }) {
  const worker = getWorkerById(Number(params.id));
  if (!worker) throw error(404, 'Worker not found');
  const projects = getProjectsByWorker(worker.id);
  return { worker, projects };
}
