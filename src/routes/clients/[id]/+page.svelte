<script lang="ts">
  import { page } from '$app/state';
  import { dataStore } from '$lib/stores/data.svelte';
  import { goto } from '$app/navigation';

  const clientId = $derived(Number(page.params.id));
  const client = $derived(dataStore.getClientById(clientId));
  const projects = $derived(dataStore.getAllProjects().filter(p => p.client_id === clientId));

  let editing = $state(false);
  let saving = $state(false);
  let editCompanyName = $state('');
  let editContactPerson = $state('');
  let editContactEmail = $state('');
  let editContactPhone = $state('');
  let editAddress = $state('');
  let editCompanySize = $state('');
  let editBio = $state('');

  const statusColors: Record<string, string> = {
    active: 'bg-success-light text-success',
    planned: 'bg-info-light text-info',
    completed: 'bg-surface-hover text-ink-muted'
  };

  function startEdit() {
    if (!client) return;
    editCompanyName = client.company_name;
    editContactPerson = client.contact_person || '';
    editContactEmail = client.contact_email || '';
    editContactPhone = client.contact_phone || '';
    editAddress = client.address || '';
    editCompanySize = client.company_size || '';
    editBio = client.bio || '';
    editing = true;
  }

  function cancelEdit() {
    editing = false;
  }

  async function saveEdit() {
    saving = true;
    try {
      await dataStore.updateClient(clientId, {
        company_name: editCompanyName,
        contact_person: editContactPerson || null,
        contact_email: editContactEmail || null,
        contact_phone: editContactPhone || null,
        address: editAddress || null,
        company_size: editCompanySize || null,
        bio: editBio || null
      });
      editing = false;
    } catch (err) {
      console.error('Failed to update client:', err);
    } finally {
      saving = false;
    }
  }

  async function deleteClient() {
    if (confirm('Delete this client?')) {
      await dataStore.deleteClient(clientId);
      goto('/clients');
    }
  }
</script>

{#if client}
<div class="space-y-8">
  <!-- Header -->
  <div class="flex items-start gap-4">
    <a href="/clients" class="text-ink-muted hover:text-ink transition-colors mt-1">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
    </a>
    <div class="flex-1 min-w-0">
      {#if editing}
        <input bind:value={editCompanyName} class="font-heading text-xl font-700 text-ink border border-border rounded-md px-2 py-1 bg-surface-raised w-full max-w-sm" />
      {:else}
        <h1 class="font-heading text-xl font-700 text-ink tracking-tight">{client.company_name}</h1>
      {/if}
      <p class="text-sm text-ink-muted mt-0.5">{client.contact_person || 'No contact person'}</p>
    </div>
    <div class="flex items-center gap-2 shrink-0">
      {#if editing}
        <button onclick={saveEdit} disabled={saving} class="bg-primary text-primary-text px-4 py-1.5 rounded-md text-sm font-600 hover:bg-primary-hover disabled:opacity-50 transition-colors">{saving ? 'Saving...' : 'Save'}</button>
        <button onclick={cancelEdit} class="px-4 py-1.5 rounded-md text-sm font-medium text-ink-secondary border border-border hover:bg-surface-hover transition-colors">Cancel</button>
      {:else}
        <button onclick={startEdit} class="text-primary hover:text-primary-hover text-sm font-600">Edit</button>
        <button onclick={deleteClient} class="text-danger hover:text-danger/80 text-sm font-600">Delete</button>
      {/if}
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div class="lg:col-span-2 space-y-8">
      <!-- Company info -->
      <section>
        <h2 class="text-xs font-600 text-ink-muted uppercase tracking-wide mb-3">Company Information</h2>
        {#if editing}
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-ink-secondary mb-1.5">Contact Person</label>
              <input bind:value={editContactPerson} type="text" class="w-full border border-border rounded-md px-3 py-2 text-sm bg-surface-raised text-ink" />
            </div>
            <div>
              <label class="block text-sm font-medium text-ink-secondary mb-1.5">Contact Email</label>
              <input bind:value={editContactEmail} type="email" class="w-full border border-border rounded-md px-3 py-2 text-sm bg-surface-raised text-ink" />
            </div>
            <div>
              <label class="block text-sm font-medium text-ink-secondary mb-1.5">Contact Phone</label>
              <input bind:value={editContactPhone} type="tel" class="w-full border border-border rounded-md px-3 py-2 text-sm bg-surface-raised text-ink" />
            </div>
            <div>
              <label class="block text-sm font-medium text-ink-secondary mb-1.5">Company Size</label>
              <input bind:value={editCompanySize} type="text" class="w-full border border-border rounded-md px-3 py-2 text-sm bg-surface-raised text-ink" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-ink-secondary mb-1.5">Address</label>
              <input bind:value={editAddress} type="text" class="w-full border border-border rounded-md px-3 py-2 text-sm bg-surface-raised text-ink" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-ink-secondary mb-1.5">About / Bio</label>
              <textarea bind:value={editBio} rows="3" class="w-full border border-border rounded-md px-3 py-2 text-sm bg-surface-raised text-ink"></textarea>
            </div>
          </div>
        {:else}
          <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {#each [['Contact Email', client.contact_email], ['Contact Phone', client.contact_phone], ['Address', client.address], ['Company Size', client.company_size]] as [label, value]}
              <div>
                <dt class="text-xs text-ink-muted">{label}</dt>
                <dd class="text-sm font-medium text-ink mt-0.5">{value || '—'}</dd>
              </div>
            {/each}
          </dl>
          {#if client.bio}
            <div class="mt-4 pt-4 border-t border-border">
              <dt class="text-xs text-ink-muted">About</dt>
              <dd class="text-sm text-ink-secondary mt-1 leading-relaxed">{client.bio}</dd>
            </div>
          {/if}
        {/if}
      </section>

      <!-- Projects -->
      <section>
        <h2 class="text-xs font-600 text-ink-muted uppercase tracking-wide mb-3">Projects ({projects.length})</h2>
        {#if projects.length === 0}
          <p class="text-sm text-ink-muted py-4">No projects yet.</p>
        {:else}
          <div class="border border-border rounded-lg overflow-hidden bg-surface-raised">
            {#each projects as project, i}
              <a href="/projects/{project.id}" class="flex items-center justify-between px-4 py-3 hover:bg-surface-hover transition-colors duration-100 {i > 0 ? 'border-t border-border' : ''}">
                <div>
                  <p class="font-medium text-ink text-sm">{project.name}</p>
                  <p class="text-xs text-ink-muted mt-0.5">{project.start_date || '—'} → {project.end_date || '...'}</p>
                </div>
                <span class="text-[0.6875rem] px-2 py-0.5 rounded font-medium {statusColors[project.status]}">{project.status}</span>
              </a>
            {/each}
          </div>
        {/if}
      </section>
    </div>

    <!-- Summary sidebar -->
    <div>
      <h2 class="text-xs font-600 text-ink-muted uppercase tracking-wide mb-3">Summary</h2>
      <div class="border border-border rounded-lg bg-surface-raised px-4 py-4 space-y-3">
        <div class="flex justify-between items-baseline">
          <span class="text-sm text-ink-secondary">Projects</span>
          <span class="font-heading font-700 text-ink tabular-nums">{projects.length}</span>
        </div>
        <div class="flex justify-between items-baseline">
          <span class="text-sm text-ink-secondary">Total Value</span>
          <span class="font-heading font-700 text-ink tabular-nums">€{projects.reduce((s: number, p: any) => s + (p.value || 0), 0).toLocaleString()}</span>
        </div>
        <div class="flex justify-between items-baseline">
          <span class="text-sm text-ink-secondary">Client Since</span>
          <span class="text-sm font-medium text-ink">{new Date(client.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  </div>
</div>
{:else}
  <p class="text-ink-muted">Client not found.</p>
{/if}
