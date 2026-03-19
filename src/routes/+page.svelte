<script lang="ts">
  import { dataStore } from '$lib/stores/data.svelte';

  const workers = $derived(dataStore.workers);
  const projects = $derived(dataStore.projects);
  const clients = $derived(dataStore.clients);
  const activeProjects = $derived(projects.filter(p => p.status === 'active'));
  const totalValue = $derived(projects.reduce((sum, p) => sum + (p.value || 0), 0));
  const allProjects = $derived(dataStore.getAllProjects());

  const statusColors: Record<string, string> = {
    active: 'bg-success-light text-success',
    planned: 'bg-info-light text-info',
    completed: 'bg-surface-hover text-ink-muted'
  };
</script>

<div class="space-y-8">
  <div>
    <h1 class="font-heading text-2xl font-700 text-ink tracking-tight">Dashboard</h1>
    <p class="text-ink-muted text-sm mt-1">Workforce overview and active operations</p>
  </div>

  {#if dataStore.error}
    <div class="bg-danger-light border border-danger/20 rounded-lg px-4 py-3 flex items-center justify-between">
      <p class="text-danger text-sm">{dataStore.error}</p>
      <button onclick={() => dataStore.retry()} class="text-sm text-danger hover:underline font-medium">Retry</button>
    </div>
  {/if}

  {#if dataStore.loading}
    <div class="flex items-center justify-center py-16">
      <p class="text-ink-muted text-sm">Loading data...</p>
    </div>
  {:else}
    <!-- Metrics row — not cards, just numbers -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
      <a href="/workers" class="group">
        <p class="text-xs font-medium text-ink-muted uppercase tracking-wide">Workers</p>
        <p class="font-heading text-3xl font-700 text-ink mt-1 tabular-nums group-hover:text-primary transition-colors">{workers.length}</p>
        <div class="mt-2 h-0.5 w-8 bg-primary/40 group-hover:w-12 transition-all duration-200"></div>
      </a>
      <a href="/projects" class="group">
        <p class="text-xs font-medium text-ink-muted uppercase tracking-wide">Active Projects</p>
        <p class="font-heading text-3xl font-700 text-ink mt-1 tabular-nums group-hover:text-primary transition-colors">{activeProjects.length}</p>
        <div class="mt-2 h-0.5 w-8 bg-success/40 group-hover:w-12 transition-all duration-200"></div>
      </a>
      <a href="/clients" class="group">
        <p class="text-xs font-medium text-ink-muted uppercase tracking-wide">Clients</p>
        <p class="font-heading text-3xl font-700 text-ink mt-1 tabular-nums group-hover:text-primary transition-colors">{clients.length}</p>
        <div class="mt-2 h-0.5 w-8 bg-info/40 group-hover:w-12 transition-all duration-200"></div>
      </a>
      <a href="/projects" class="group">
        <p class="text-xs font-medium text-ink-muted uppercase tracking-wide">Portfolio Value</p>
        <p class="font-heading text-3xl font-700 text-ink mt-1 tabular-nums group-hover:text-primary transition-colors">€{totalValue.toLocaleString()}</p>
        <div class="mt-2 h-0.5 w-8 bg-warning/40 group-hover:w-12 transition-all duration-200"></div>
      </a>
    </div>

    {#if workers.length === 0 && projects.length === 0 && clients.length === 0}
      <div class="border border-border rounded-lg py-12 px-8 text-left max-w-lg">
        <h2 class="font-heading text-lg font-700 text-ink">Get started</h2>
        <p class="text-ink-secondary text-sm mt-2 leading-relaxed">Add workers, clients, and projects to start managing your workforce operations.</p>
        <div class="flex gap-3 mt-6 flex-wrap">
          <a href="/workers/new" class="bg-primary text-primary-text px-4 py-2 rounded-md text-sm font-600 hover:bg-primary-hover transition-colors">Add Worker</a>
          <a href="/clients/new" class="border border-border text-ink-secondary px-4 py-2 rounded-md text-sm font-600 hover:bg-surface-hover transition-colors">Add Client</a>
          <a href="/projects/new" class="border border-border text-ink-secondary px-4 py-2 rounded-md text-sm font-600 hover:bg-surface-hover transition-colors">New Project</a>
        </div>
      </div>
    {:else}
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <!-- Recent Projects — takes more space -->
        <div class="lg:col-span-3">
          <div class="flex items-baseline justify-between mb-3">
            <h2 class="font-heading text-sm font-700 text-ink uppercase tracking-wide">Recent Projects</h2>
            <a href="/projects" class="text-xs text-primary hover:text-primary-hover font-medium">View all →</a>
          </div>
          <div class="border border-border rounded-lg overflow-hidden bg-surface-raised">
            {#each allProjects.slice(0, 6) as project, i}
              <a href="/projects/{project.id}" class="flex items-center justify-between px-4 py-3 hover:bg-surface-hover transition-colors duration-100 {i > 0 ? 'border-t border-border' : ''}">
                <div class="min-w-0">
                  <p class="font-medium text-ink text-sm truncate">{project.name}</p>
                  <p class="text-xs text-ink-muted mt-0.5">{project.client_name || 'No client'}</p>
                </div>
                <span class="text-[0.6875rem] px-2 py-0.5 rounded font-medium shrink-0 ml-3 {statusColors[project.status]}">{project.status}</span>
              </a>
            {:else}
              <p class="px-4 py-6 text-sm text-ink-muted">No projects yet. <a href="/projects/new" class="text-primary hover:underline">Create one →</a></p>
            {/each}
          </div>
        </div>

        <!-- Team list -->
        <div class="lg:col-span-2">
          <div class="flex items-baseline justify-between mb-3">
            <h2 class="font-heading text-sm font-700 text-ink uppercase tracking-wide">Team</h2>
            <a href="/workers" class="text-xs text-primary hover:text-primary-hover font-medium">View all →</a>
          </div>
          <div class="border border-border rounded-lg overflow-hidden bg-surface-raised">
            {#each workers.slice(0, 6) as worker, i}
              <a href="/workers/{worker.id}" class="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-hover transition-colors duration-100 {i > 0 ? 'border-t border-border' : ''}">
                <div class="w-7 h-7 bg-primary-light text-primary rounded flex items-center justify-center font-600 text-xs shrink-0">
                  {worker.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div class="min-w-0">
                  <p class="font-medium text-ink text-sm truncate">{worker.name}</p>
                  <p class="text-xs text-ink-muted truncate">{worker.email || worker.phone || '—'}</p>
                </div>
              </a>
            {:else}
              <p class="px-4 py-6 text-sm text-ink-muted">No workers yet. <a href="/workers/new" class="text-primary hover:underline">Add one →</a></p>
            {/each}
          </div>
        </div>
      </div>
    {/if}
  {/if}
</div>
