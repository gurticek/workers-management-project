<script lang="ts">
  import { dataStore } from '$lib/stores/data.svelte';
  const projects = $derived(dataStore.getAllProjects());
  const statusColors: Record<string, string> = {
    active: 'bg-success-light text-success',
    planned: 'bg-info-light text-info',
    completed: 'bg-surface-hover text-ink-muted'
  };
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="font-heading text-2xl font-700 text-ink tracking-tight">Projects</h1>
      <p class="text-ink-muted text-sm mt-1">{projects.length} projects</p>
    </div>
    <a href="/projects/new" class="bg-primary text-primary-text px-4 py-2 rounded-md text-sm font-600 hover:bg-primary-hover transition-colors">New Project</a>
  </div>

  {#if dataStore.error}
    <div class="bg-danger-light border border-danger/20 rounded-lg px-4 py-3 flex items-center justify-between">
      <p class="text-danger text-sm">{dataStore.error}</p>
      <button onclick={() => dataStore.retry()} class="text-sm text-danger hover:underline font-medium">Retry</button>
    </div>
  {:else if dataStore.loading}
    <div class="flex items-center justify-center py-16"><p class="text-ink-muted text-sm">Loading projects...</p></div>
  {:else if projects.length === 0}
    <div class="border border-border rounded-lg py-12 px-8 max-w-lg">
      <h2 class="font-heading text-lg font-700 text-ink">No projects yet</h2>
      <p class="text-ink-secondary text-sm mt-2">Create your first project to start tracking work.</p>
      <a href="/projects/new" class="inline-block mt-4 bg-primary text-primary-text px-4 py-2 rounded-md text-sm font-600 hover:bg-primary-hover transition-colors">Create your first project</a>
    </div>
  {:else}
    <div class="border border-border rounded-lg overflow-hidden bg-surface-raised">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border">
              <th class="text-left px-4 py-2.5 text-xs font-600 text-ink-muted uppercase tracking-wide">Project</th>
              <th class="text-left px-4 py-2.5 text-xs font-600 text-ink-muted uppercase tracking-wide hidden sm:table-cell">Client</th>
              <th class="text-left px-4 py-2.5 text-xs font-600 text-ink-muted uppercase tracking-wide hidden md:table-cell">Status</th>
              <th class="text-right px-4 py-2.5 text-xs font-600 text-ink-muted uppercase tracking-wide">Value</th>
            </tr>
          </thead>
          <tbody>
            {#each projects as project, i}
              <tr class="hover:bg-surface-hover transition-colors duration-100 {i > 0 ? 'border-t border-border' : ''}">
                <td class="px-4 py-3">
                  <a href="/projects/{project.id}" class="font-medium text-ink hover:text-primary transition-colors">{project.name}</a>
                  {#if project.start_date}
                    <p class="text-xs text-ink-muted mt-0.5 tabular-nums">{project.start_date} → {project.end_date || '...'}</p>
                  {/if}
                </td>
                <td class="px-4 py-3 text-ink-secondary hidden sm:table-cell">{project.client_name || '—'}</td>
                <td class="px-4 py-3 hidden md:table-cell">
                  <span class="text-[0.6875rem] px-2 py-0.5 rounded font-medium {statusColors[project.status]}">{project.status}</span>
                </td>
                <td class="px-4 py-3 text-right font-medium text-ink tabular-nums">
                  {project.value ? `€${project.value.toLocaleString()}` : '—'}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>
