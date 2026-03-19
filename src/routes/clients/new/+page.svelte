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

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const form = new FormData(e.target as HTMLFormElement);
    const client = await dataStore.createClient({
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

<div class="max-w-xl space-y-6">
  <div class="flex items-center gap-3">
    <a href="/clients" class="text-ink-muted hover:text-ink transition-colors">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
    </a>
    <h1 class="font-heading text-2xl font-700 text-ink tracking-tight">Add Client</h1>
  </div>

  <form onsubmit={handleSubmit} class="space-y-5">
    {#each fields as field}
      <div>
        <label for={field.name} class="block text-sm font-medium text-ink-secondary mb-1.5">{field.label}{#if field.required}<span class="text-danger ml-0.5">*</span>{/if}</label>
        <input id={field.name} name={field.name} type={field.type} required={field.required}
          class="w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-ink placeholder:text-ink-muted"/>
      </div>
    {/each}
    <div>
      <label for="bio" class="block text-sm font-medium text-ink-secondary mb-1.5">About / Bio</label>
      <textarea id="bio" name="bio" rows="3" class="w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-ink placeholder:text-ink-muted"></textarea>
    </div>
    <div class="flex gap-3 pt-2">
      <button type="submit" class="bg-primary text-primary-text px-5 py-2 rounded-md text-sm font-600 hover:bg-primary-hover transition-colors">Save Client</button>
      <a href="/clients" class="px-5 py-2 rounded-md text-sm font-medium text-ink-secondary border border-border hover:bg-surface-hover transition-colors">Cancel</a>
    </div>
  </form>
</div>
