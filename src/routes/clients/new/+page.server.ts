import { createClient } from '$lib/server/db/clients.js';
import { redirect } from '@sveltejs/kit';

export const actions = {
  default: async ({ request }) => {
    const form = await request.formData();
    const client = createClient({
      company_name: form.get('company_name') as string,
      contact_person: (form.get('contact_person') as string) || null,
      contact_email: (form.get('contact_email') as string) || null,
      contact_phone: (form.get('contact_phone') as string) || null,
      address: (form.get('address') as string) || null,
      company_size: (form.get('company_size') as string) || null,
      bio: (form.get('bio') as string) || null
    });
    throw redirect(303, `/clients/${client.id}`);
  }
};
