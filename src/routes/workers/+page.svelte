<script lang="ts">
  import { dataStore } from '$lib/stores/data.svelte';
  const workers = $derived(dataStore.getAllWorkers());
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="font-heading text-2xl font-700 text-ink tracking-tight">Workers</h1>
      <p class="text-ink-muted text-sm mt-1">{workers.length} team members</p>
    </div>
    <a href="/workers/new" class="bg-primary text-primary-text px-4 py-2 rounded-md text-sm font-600 hover:bg-primary-hover transition-colors">Add Worker</a>
  </div>

  {#if dataStore.error}
    <div class="bg-danger-light border border-danger/20 rounded-lg px-4 py-3 flex items-center justify-between">
      <p class="text-danger text-sm">{dataStore.error}</p>
      <button onclick={() => dataStore.retry()} class="text-sm text-danger hover:underline font-medium">Retry</button>
    </div>
  {:else if dataStore.loading}
    <div class="flex items-center justify-center py-16"><p class="text-ink-muted text-sm">Loading workers...</p></div>
  {:else if workers.length === 0}
    <div class="border border-border rounded-lg py-12 px-8 max-w-lg">
      <h2 class="font-heading text-lg font-700 text-ink">No workers yet</h2>
      <p class="text-ink-secondary text-sm mt-2">Add your first team member to start managing your workforce.</p>
      <a href="/workers/new" class="inline-block mt-4 bg-primary text-primary-text px-4 py-2 rounded-md text-sm font-600 hover:bg-primary-hover transition-colors">Add your first worker</a>
    </div>
  {:else}
    <div class="border border-border rounded-lg overflow-hidden bg-surface-raised">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-border">
            <th class="text-left px-4 py-2.5 text-xs font-600 text-ink-muted uppercase tracking-wide">Name</th>
            <th class="text-left px-4 py-2.5 text-xs font-600 text-ink-muted uppercase tracking-wide hidden sm:table-cell">Email</th>
            <th class="text-left px-4 py-2.5 text-xs font-600 text-ink-muted uppercase tracking-wide hidden md:table-cell">Phone</th>
          </tr>
        </thead>
        <tbody>
          {#each workers as worker, i}
            <tr class="hover:bg-surface-hover transition-colors duration-100 {i > 0 ? 'border-t border-border' : ''}">
              <td class="px-4 py-3">
                <a href="/workers/{worker.id}" class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-primary-light text-primary rounded flex items-center justify-center font-600 text-xs shrink-0">
                    {worker.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <span class="font-medium text-ink hover:text-primary transition-colors">{worker.name}</span>
                </a>
              </td>
              <td class="px-4 py-3 text-ink-secondary hidden sm:table-cell">{worker.email || '—'}</td>
              <td class="px-4 py-3 text-ink-secondary tabular-nums hidden md:table-cell">{worker.phone || '—'}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
