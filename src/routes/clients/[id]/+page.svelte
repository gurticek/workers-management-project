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
    active: 'bg-emerald-100 text-emerald-700',
    planned: 'bg-blue-100 text-blue-700',
    completed: 'bg-slate-100 text-slate-700'
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
<div class="space-y-6">
  <div class="flex items-center gap-4">
    <a href="/clients" class="text-slate-400 hover:text-slate-600">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
    </a>
    <div class="flex-1">
      {#if editing}
        <input bind:value={editCompanyName} class="text-2xl font-bold text-slate-900 border border-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      {:else}
        <h2 class="text-2xl font-bold text-slate-900">{client.company_name}</h2>
      {/if}
      <p class="text-slate-500">{client.contact_person || 'No contact person'}</p>
    </div>
    <div class="flex items-center gap-3">
      {#if editing}
        <button onclick={saveEdit} disabled={saving} class="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">{saving ? 'Saving...' : 'Save'}</button>
        <button onclick={cancelEdit} class="px-4 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
      {:else}
        <button onclick={startEdit} class="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
        <button onclick={deleteClient} class="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
      {/if}
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="lg:col-span-2 space-y-6">
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 class="font-semibold text-slate-900 mb-4">Company Information</h3>
        {#if editing}
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-slate-500">Contact Person</label>
              <input bind:value={editContactPerson} type="text" class="w-full mt-0.5 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="text-sm text-slate-500">Contact Email</label>
              <input bind:value={editContactEmail} type="email" class="w-full mt-0.5 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="text-sm text-slate-500">Contact Phone</label>
              <input bind:value={editContactPhone} type="tel" class="w-full mt-0.5 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="text-sm text-slate-500">Company Size</label>
              <input bind:value={editCompanySize} type="text" class="w-full mt-0.5 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div class="sm:col-span-2">
              <label class="text-sm text-slate-500">Address</label>
              <input bind:value={editAddress} type="text" class="w-full mt-0.5 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-slate-100">
            <label class="text-sm text-slate-500">About / Bio</label>
            <textarea bind:value={editBio} rows="3" class="w-full mt-0.5 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
          </div>
        {:else}
          <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {#each [['Contact Email', client.contact_email], ['Contact Phone', client.contact_phone], ['Address', client.address], ['Company Size', client.company_size]] as [label, value]}
              <div>
                <dt class="text-sm text-slate-500">{label}</dt>
                <dd class="font-medium text-slate-900 mt-0.5">{value || '—'}</dd>
              </div>
            {/each}
          </dl>
          {#if client.bio}
            <div class="mt-4 pt-4 border-t border-slate-100">
              <dt class="text-sm text-slate-500">About</dt>
              <dd class="text-slate-700 mt-1">{client.bio}</dd>
            </div>
          {/if}
        {/if}
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200">
        <div class="px-6 py-4 border-b border-slate-100">
          <h3 class="font-semibold text-slate-900">Projects ({projects.length})</h3>
        </div>
        {#if projects.length === 0}
          <p class="p-6 text-slate-500 text-sm">No projects yet.</p>
        {:else}
          <div class="divide-y divide-slate-100">
            {#each projects as project}
              <a href="/projects/{project.id}" class="block px-6 py-3 hover:bg-slate-50 transition-colors">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium text-slate-900">{project.name}</p>
                    <p class="text-xs text-slate-500">{project.start_date || '—'} → {project.end_date || '...'}</p>
                  </div>
                  <span class="text-xs px-2.5 py-1 rounded-full font-medium {statusColors[project.status]}">{project.status}</span>
                </div>
              </a>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <div>
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 class="font-semibold text-slate-900 mb-3">Summary</h3>
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-sm text-slate-500">Projects</span>
            <span class="font-semibold text-slate-900">{projects.length}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-slate-500">Total Value</span>
            <span class="font-semibold text-slate-900">€{projects.reduce((s: number, p: any) => s + (p.value || 0), 0).toLocaleString()}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-slate-500">Client Since</span>
            <span class="font-semibold text-slate-900">{new Date(client.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
{:else}
  <p class="text-slate-500">Client not found.</p>
{/if}
