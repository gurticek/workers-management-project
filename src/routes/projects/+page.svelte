<script lang="ts">
  import { dataStore } from '$lib/stores/data.svelte';
  const projects = $derived(dataStore.getAllProjects());
  const statusColors: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700',
    planned: 'bg-blue-100 text-blue-700',
    completed: 'bg-slate-100 text-slate-700'
  };
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-2xl font-bold text-slate-900">Projects</h2>
      <p class="text-slate-500 mt-1">{projects.length} projects</p>
    </div>
    <a href="/projects/new" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">+ New Project</a>
  </div>

  {#if projects.length === 0}
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
      <p class="text-4xl mb-3">📁</p>
      <p class="text-slate-600 font-medium">No projects yet</p>
      <p class="text-slate-400 text-sm mt-1 mb-4">Create your first project to start tracking work</p>
      <a href="/projects/new" class="inline-block bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Create your first project →</a>
    </div>
  {:else}
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="text-left px-5 py-3 font-medium text-slate-600">Project</th>
              <th class="text-left px-5 py-3 font-medium text-slate-600">Client</th>
              <th class="text-left px-5 py-3 font-medium text-slate-600">Status</th>
              <th class="text-right px-5 py-3 font-medium text-slate-600">Value</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            {#each projects as project}
              <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-5 py-3">
                  <a href="/projects/{project.id}" class="font-medium text-blue-600 hover:text-blue-700">{project.name}</a>
                  {#if project.start_date}
                    <p class="text-xs text-slate-400 mt-0.5">{project.start_date} → {project.end_date || '...'}</p>
                  {/if}
                </td>
                <td class="px-5 py-3 text-slate-600">{project.client_name || '—'}</td>
                <td class="px-5 py-3">
                  <span class="text-xs px-2.5 py-1 rounded-full font-medium {statusColors[project.status]}">{project.status}</span>
                </td>
                <td class="px-5 py-3 text-right font-medium text-slate-900">
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
