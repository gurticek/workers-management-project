import { createProject } from '$lib/server/db/projects.js';
import { getAllClients } from '$lib/server/db/clients.js';
import { redirect } from '@sveltejs/kit';

export function load() {
  return { clients: getAllClients() };
}

export const actions = {
  default: async ({ request }) => {
    const form = await request.formData();
    const project = createProject({
      name: form.get('name') as string,
      description: (form.get('description') as string) || null,
      client_id: form.get('client_id') ? Number(form.get('client_id')) : null,
      start_date: (form.get('start_date') as string) || null,
      end_date: (form.get('end_date') as string) || null,
      value: form.get('value') ? Number(form.get('value')) : null,
      currency: (form.get('currency') as string) || 'EUR',
      status: (form.get('status') as 'planned' | 'active' | 'completed') || 'planned'
    });
    throw redirect(303, `/projects/${project.id}`);
  }
};
