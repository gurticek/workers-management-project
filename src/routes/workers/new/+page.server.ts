import { createWorker } from '$lib/server/db/workers.js';
import { redirect } from '@sveltejs/kit';

export const actions = {
  default: async ({ request }) => {
    const form = await request.formData();
    const worker = createWorker({
      name: form.get('name') as string,
      address: (form.get('address') as string) || null,
      phone: (form.get('phone') as string) || null,
      email: (form.get('email') as string) || null,
      notes: (form.get('notes') as string) || null,
      photo_url: null
    });
    throw redirect(303, `/workers/${worker.id}`);
  }
};
