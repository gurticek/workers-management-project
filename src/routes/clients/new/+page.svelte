<script lang="ts">
  import { dataStore } from '$lib/stores/data.svelte';
  import { goto } from '$app/navigation';

  const fields = [
    { name: 'company_name', label: 'Company Name', type: 'text', required: true },
    { name: 'contact_person', label: 'Contact Person', type: 'text', required: false },
    { name: 'contact_email', label: 'Contact Email', type: 'email', required: false },
    { name: 'contact_phone', label: 'Contact Phone', type: 'tel', required: false },
    { name: 'address', label: 'Address', type: 'text', required: false },
    { name: 'company_size', label: 'Company Size', type: 'text', required: false }
  ];

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const form = new FormData(e.target as HTMLFormElement);
    const client = dataStore.createClient({
      company_name: form.get('company_name') as string,
      contact_person: (form.get('contact_person') as string) || null,
      contact_email: (form.get('contact_email') as string) || null,
      contact_phone: (form.get('contact_phone') as string) || null,
      address: (form.get('address') as string) || null,
      company_size: (form.get('company_size') as string) || null,
      bio: (form.get('bio') as string) || null
    });
    goto(`/clients/${client.id}`);
  }
</script>

<div class="max-w-2xl space-y-6">
  <div class="flex items-center gap-4">
    <a href="/clients" class="text-slate-400 hover:text-slate-600">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
    </a>
    <h2 class="text-2xl font-bold text-slate-900">Add Client</h2>
  </div>

  <form onsubmit={handleSubmit} class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
    {#each fields as field}
      <div>
        <label for={field.name} class="block text-sm font-medium text-slate-700 mb-1">{field.label}</label>
        <input id={field.name} name={field.name} type={field.type} required={field.required}
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
      </div>
    {/each}
    <div>
      <label for="bio" class="block text-sm font-medium text-slate-700 mb-1">About / Bio</label>
      <textarea id="bio" name="bio" rows="3" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
    </div>
    <div class="flex gap-3 pt-2">
      <button type="submit" class="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Save Client</button>
      <a href="/clients" class="px-5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Cancel</a>
    </div>
  </form>
</div>
