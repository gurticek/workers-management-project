import { getClientById } from '$lib/server/db/clients.js';
import { getAllProjects } from '$lib/server/db/projects.js';
import { error } from '@sveltejs/kit';

export function load({ params }) {
  const client = getClientById(Number(params.id));
  if (!client) throw error(404, 'Client not found');
  const projects = getAllProjects().filter(p => p.client_id === client.id);
  return { client, projects };
}
