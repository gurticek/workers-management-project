<script lang="ts">
  import { dataStore } from '$lib/stores/data.svelte';
  const clients = $derived(dataStore.getAllClients());
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-2xl font-bold text-slate-900">Clients</h2>
      <p class="text-slate-500 mt-1">{clients.length} clients</p>
    </div>
    <a href="/clients/new" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">+ Add Client</a>
  </div>

  {#if dataStore.error}
    <div class="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
      <p class="text-red-700 text-sm">{dataStore.error}</p>
      <button onclick={() => dataStore.retry()} class="text-sm text-red-600 hover:text-red-800 underline font-medium">Retry</button>
    </div>
  {:else if dataStore.loading}
    <div class="flex items-center justify-center py-12"><p class="text-slate-500">Loading clients...</p></div>
  {:else if clients.length === 0}
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
      <p class="text-4xl mb-3">🏢</p>
      <p class="text-slate-600 font-medium">No clients yet</p>
      <p class="text-slate-400 text-sm mt-1 mb-4">Add your first client to start managing projects</p>
      <a href="/clients/new" class="inline-block bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Add your first client →</a>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      {#each clients as client}
        <a href="/clients/{client.id}" class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="font-semibold text-slate-900">{client.company_name}</h3>
              <p class="text-sm text-slate-500 mt-1">{client.contact_person || 'No contact'}</p>
            </div>
            {#if client.company_size}
              <span class="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">{client.company_size}</span>
            {/if}
          </div>
          {#if client.address}
            <p class="text-sm text-slate-500 mt-3 flex items-center gap-2">
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
              {client.address}
            </p>
          {/if}
        </a>
      {/each}
    </div>
  {/if}
</div>
