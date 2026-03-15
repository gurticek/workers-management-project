import { json } from '@sveltejs/kit';
import { getProjectById, updateProject, deleteProject } from '$lib/server/db/projects.js';

export function GET({ params }) {
  const project = getProjectById(Number(params.id));
  if (!project) return json({ error: 'Not found' }, { status: 404 });
  return json(project);
}

export async function PUT({ params, request }) {
  const data = await request.json();
  const project = updateProject(Number(params.id), data);
  if (!project) return json({ error: 'Not found' }, { status: 404 });
  return json(project);
}

export function DELETE({ params }) {
  const ok = deleteProject(Number(params.id));
  if (!ok) return json({ error: 'Not found' }, { status: 404 });
  return json({ success: true });
}
