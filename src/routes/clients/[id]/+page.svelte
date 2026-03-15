<script lang="ts">
  import { page } from '$app/state';
  import { dataStore } from '$lib/stores/data.svelte';
  import { goto } from '$app/navigation';

  const clientId = $derived(Number(page.params.id));
  const client = $derived(dataStore.getClientById(clientId));
  const projects = $derived(dataStore.getAllProjects().filter(p => p.client_id === clientId));

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700',
    planned: 'bg-blue-100 text-blue-700',
    completed: 'bg-slate-100 text-slate-700'
  };

  function deleteClient() {
    if (confirm('Delete this client?')) {
      dataStore.deleteClient(clientId);
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
      <h2 class="text-2xl font-bold text-slate-900">{client.company_name}</h2>
      <p class="text-slate-500">{client.contact_person || 'No contact person'}</p>
    </div>
    <button onclick={deleteClient} class="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="lg:col-span-2 space-y-6">
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 class="font-semibold text-slate-900 mb-4">Company Information</h3>
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
