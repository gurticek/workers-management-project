<script lang="ts">
  import { dataStore } from '$lib/stores/data.svelte';
  const clients = $derived(dataStore.getAllClients());
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="font-heading text-2xl font-700 text-ink tracking-tight">Clients</h1>
      <p class="text-ink-muted text-sm mt-1">{clients.length} clients</p>
    </div>
    <a href="/clients/new" class="bg-primary text-primary-text px-4 py-2 rounded-md text-sm font-600 hover:bg-primary-hover transition-colors">Add Client</a>
  </div>

  {#if dataStore.error}
    <div class="bg-danger-light border border-danger/20 rounded-lg px-4 py-3 flex items-center justify-between">
      <p class="text-danger text-sm">{dataStore.error}</p>
      <button onclick={() => dataStore.retry()} class="text-sm text-danger hover:underline font-medium">Retry</button>
    </div>
  {:else if dataStore.loading}
    <div class="flex items-center justify-center py-16"><p class="text-ink-muted text-sm">Loading clients...</p></div>
  {:else if clients.length === 0}
    <div class="border border-border rounded-lg py-12 px-8 max-w-lg">
      <h2 class="font-heading text-lg font-700 text-ink">No clients yet</h2>
      <p class="text-ink-secondary text-sm mt-2">Add your first client to start managing projects.</p>
      <a href="/clients/new" class="inline-block mt-4 bg-primary text-primary-text px-4 py-2 rounded-md text-sm font-600 hover:bg-primary-hover transition-colors">Add your first client</a>
    </div>
  {:else}
    <div class="border border-border rounded-lg overflow-hidden bg-surface-raised">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-border">
            <th class="text-left px-4 py-2.5 text-xs font-600 text-ink-muted uppercase tracking-wide">Company</th>
            <th class="text-left px-4 py-2.5 text-xs font-600 text-ink-muted uppercase tracking-wide hidden sm:table-cell">Contact</th>
            <th class="text-left px-4 py-2.5 text-xs font-600 text-ink-muted uppercase tracking-wide hidden md:table-cell">Location</th>
            <th class="text-right px-4 py-2.5 text-xs font-600 text-ink-muted uppercase tracking-wide hidden lg:table-cell">Size</th>
          </tr>
        </thead>
        <tbody>
          {#each clients as client, i}
            <tr class="hover:bg-surface-hover transition-colors duration-100 {i > 0 ? 'border-t border-border' : ''}">
              <td class="px-4 py-3">
                <a href="/clients/{client.id}" class="font-medium text-ink hover:text-primary transition-colors">{client.company_name}</a>
              </td>
              <td class="px-4 py-3 text-ink-secondary hidden sm:table-cell">{client.contact_person || '—'}</td>
              <td class="px-4 py-3 text-ink-secondary hidden md:table-cell truncate max-w-[200px]">{client.address || '—'}</td>
              <td class="px-4 py-3 text-ink-secondary text-right hidden lg:table-cell">{client.company_size || '—'}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
