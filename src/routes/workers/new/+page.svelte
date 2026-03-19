<script lang="ts">
  import { dataStore } from '$lib/stores/data.svelte';
  import { goto } from '$app/navigation';

  const fields = [
    { name: 'name', label: 'Full Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: false },
    { name: 'phone', label: 'Phone', type: 'tel', required: false },
    { name: 'address', label: 'Address', type: 'text', required: false }
  ];

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const form = new FormData(e.target as HTMLFormElement);
    const worker = await dataStore.createWorker({
      name: form.get('name') as string,
      address: (form.get('address') as string) || null,
      phone: (form.get('phone') as string) || null,
      email: (form.get('email') as string) || null,
      notes: (form.get('notes') as string) || null,
      photo_url: null
    });
    goto(`/workers/${worker.id}`);
  }
</script>

<div class="max-w-xl space-y-6">
  <div class="flex items-center gap-3">
    <a href="/workers" class="text-ink-muted hover:text-ink transition-colors">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
    </a>
    <h1 class="font-heading text-2xl font-700 text-ink tracking-tight">Add Worker</h1>
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
      <label for="notes" class="block text-sm font-medium text-ink-secondary mb-1.5">Notes</label>
      <textarea id="notes" name="notes" rows="3" class="w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-ink placeholder:text-ink-muted"></textarea>
    </div>
    <div class="flex gap-3 pt-2">
      <button type="submit" class="bg-primary text-primary-text px-5 py-2 rounded-md text-sm font-600 hover:bg-primary-hover transition-colors">Save Worker</button>
      <a href="/workers" class="px-5 py-2 rounded-md text-sm font-medium text-ink-secondary border border-border hover:bg-surface-hover transition-colors">Cancel</a>
    </div>
  </form>
</div>
