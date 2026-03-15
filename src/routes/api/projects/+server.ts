import { json } from '@sveltejs/kit';
import { getAllProjects, createProject } from '$lib/server/db/projects.js';

export function GET() {
  return json(getAllProjects());
}

export async function POST({ request }) {
  const data = await request.json();
  if (!data.name) return json({ error: 'Name is required' }, { status: 400 });
  const project = createProject(data);
  return json(project, { status: 201 });
}
