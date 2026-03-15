import { getProjectById } from '$lib/server/db/projects.js';
import { getWorkersByProject } from '$lib/server/db/project-workers.js';
import { error } from '@sveltejs/kit';

export function load({ params }) {
  const project = getProjectById(Number(params.id));
  if (!project) throw error(404, 'Project not found');
  const workers = getWorkersByProject(project.id);
  return { project, workers };
}
