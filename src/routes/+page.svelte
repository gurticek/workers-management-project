<script lang="ts">
  import { dataStore } from '$lib/stores/data.svelte';

  const workers = $derived(dataStore.workers);
  const projects = $derived(dataStore.projects);
  const clients = $derived(dataStore.clients);
  const activeProjects = $derived(projects.filter(p => p.status === 'active'));
  const totalValue = $derived(projects.reduce((sum, p) => sum + (p.value || 0), 0));
  const allProjects = $derived(dataStore.getAllProjects());

  const statCards = $derived([
    { label: 'Total Workers', value: workers.length, color: 'bg-blue-500', href: '/workers', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { label: 'Active Projects', value: activeProjects.length, color: 'bg-emerald-500', href: '/projects', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Total Clients', value: clients.length, color: 'bg-violet-500', href: '/clients', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { label: 'Portfolio Value', value: `€${totalValue.toLocaleString()}`, color: 'bg-amber-500', href: '/projects', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
  ]);

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700',
    planned: 'bg-blue-100 text-blue-700',
    completed: 'bg-slate-100 text-slate-700'
  };
</script>

<div class="space-y-6">
  <div>
    <h2 class="text-2xl font-bold text-slate-900">Dashboard</h2>
    <p class="text-slate-500 mt-1">Overview of your workforce and projects</p>
  </div>

  {#if dataStore.error}
    <div class="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
      <p class="text-red-700 text-sm">{dataStore.error}</p>
      <button onclick={() => dataStore.retry()} class="text-sm text-red-600 hover:text-red-800 underline font-medium">Retry</button>
    </div>
  {/if}

  {#if dataStore.loading}
    <div class="flex items-center justify-center py-12">
      <p class="text-slate-500">Loading data...</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {#each statCards as card}
        <a href={card.href} class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-500">{card.label}</p>
              <p class="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
            </div>
            <div class="{card.color} p-3 rounded-lg">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d={card.icon}/>
              </svg>
            </div>
          </div>
        </a>
      {/each}
    </div>

    {#if workers.length === 0 && projects.length === 0 && clients.length === 0}
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <p class="text-4xl mb-3">🚀</p>
        <p class="text-slate-700 font-medium text-lg">Get started!</p>
        <p class="text-slate-500 text-sm mt-1 mb-5">Add workers, clients, and projects to start managing your workforce.</p>
        <div class="flex gap-3 justify-center flex-wrap">
          <a href="/workers/new" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">+ Add Worker</a>
          <a href="/clients/new" class="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700">+ Add Client</a>
          <a href="/projects/new" class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700">+ New Project</a>
        </div>
      </div>
    {:else}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl shadow-sm border border-slate-200">
          <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 class="font-semibold text-slate-900">Recent Projects</h3>
            <a href="/projects" class="text-sm text-blue-600 hover:text-blue-700">View all →</a>
          </div>
          <div class="divide-y divide-slate-100">
            {#each allProjects.slice(0, 5) as project}
              <a href="/projects/{project.id}" class="block px-5 py-3 hover:bg-slate-50 transition-colors">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium text-slate-900">{project.name}</p>
                    <p class="text-sm text-slate-500">{project.client_name || 'No client'}</p>
                  </div>
                  <span class="text-xs px-2.5 py-1 rounded-full font-medium {statusColors[project.status]}">{project.status}</span>
                </div>
              </a>
            {:else}
              <p class="px-5 py-4 text-sm text-slate-400">No projects yet. <a href="/projects/new" class="text-blue-600 hover:underline">Create one →</a></p>
            {/each}
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-slate-200">
          <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 class="font-semibold text-slate-900">Team Members</h3>
            <a href="/workers" class="text-sm text-blue-600 hover:text-blue-700">View all →</a>
          </div>
          <div class="divide-y divide-slate-100">
            {#each workers.slice(0, 5) as worker}
              <a href="/workers/{worker.id}" class="block px-5 py-3 hover:bg-slate-50 transition-colors">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                    {worker.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <p class="font-medium text-slate-900">{worker.name}</p>
                    <p class="text-sm text-slate-500">{worker.email || 'No email'}</p>
                  </div>
                </div>
              </a>
            {:else}
              <p class="px-5 py-4 text-sm text-slate-400">No workers yet. <a href="/workers/new" class="text-blue-600 hover:underline">Add one →</a></p>
            {/each}
          </div>
        </div>
      </div>
    {/if}
  {/if}
</div>
