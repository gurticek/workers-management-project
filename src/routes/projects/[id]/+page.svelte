<script lang="ts">
  import { page } from '$app/state';
  import { dataStore } from '$lib/stores/data.svelte';
  import { goto } from '$app/navigation';

  const projectId = $derived(Number(page.params.id));
  const project = $derived(dataStore.getProjectById(projectId));
  const workers = $derived(dataStore.getWorkersByProject(projectId));

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700',
    planned: 'bg-blue-100 text-blue-700',
    completed: 'bg-slate-100 text-slate-700'
  };

  function deleteProject() {
    if (confirm('Delete this project?')) {
      dataStore.deleteProject(projectId);
      goto('/projects');
    }
  }
</script>

{#if project}
<div class="space-y-6">
  <div class="flex items-center gap-4">
    <a href="/projects" class="text-slate-400 hover:text-slate-600">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
    </a>
    <div class="flex-1">
      <div class="flex items-center gap-3">
        <h2 class="text-2xl font-bold text-slate-900">{project.name}</h2>
        <span class="text-xs px-2.5 py-1 rounded-full font-medium {statusColors[project.status]}">{project.status}</span>
      </div>
      <p class="text-slate-500 mt-1">{project.client_name || 'No client'}</p>
    </div>
    <button onclick={deleteProject} class="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="lg:col-span-2 space-y-6">
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 class="font-semibold text-slate-900 mb-4">Project Details</h3>
        {#if project.description}
          <p class="text-slate-700 mb-4">{project.description}</p>
        {/if}
        <dl class="grid grid-cols-2 gap-4">
          <div><dt class="text-sm text-slate-500">Start Date</dt><dd class="font-medium text-slate-900 mt-0.5">{project.start_date || '—'}</dd></div>
          <div><dt class="text-sm text-slate-500">End Date</dt><dd class="font-medium text-slate-900 mt-0.5">{project.end_date || '—'}</dd></div>
          <div><dt class="text-sm text-slate-500">Value</dt><dd class="font-medium text-slate-900 mt-0.5">{project.value ? `€${project.value.toLocaleString()}` : '—'}</dd></div>
          <div><dt class="text-sm text-slate-500">Currency</dt><dd class="font-medium text-slate-900 mt-0.5">{project.currency}</dd></div>
        </dl>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200">
        <div class="px-6 py-4 border-b border-slate-100">
          <h3 class="font-semibold text-slate-900">Team ({workers.length})</h3>
        </div>
        {#if workers.length === 0}
          <p class="p-6 text-slate-500 text-sm">No workers assigned yet.</p>
        {:else}
          <div class="divide-y divide-slate-100">
            {#each workers as pw}
              <div class="px-6 py-3 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-xs">
                    {pw.worker_name?.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <p class="font-medium text-slate-900">{pw.worker_name}</p>
                    <p class="text-xs text-slate-500">{pw.role || 'No role'}</p>
                  </div>
                </div>
                <div class="text-right text-sm">
                  <p class="font-medium text-slate-900">{pw.allocated_hours || 0}h</p>
                  <p class="text-xs text-slate-500">€{pw.hourly_rate || 0}/h</p>
                </div>
              </div>
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
            <span class="text-sm text-slate-500">Team Size</span>
            <span class="font-semibold text-slate-900">{workers.length}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-slate-500">Total Hours</span>
            <span class="font-semibold text-slate-900">{workers.reduce((s: number, w: any) => s + (w.allocated_hours || 0), 0)}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-slate-500">Labor Cost</span>
            <span class="font-semibold text-slate-900">€{workers.reduce((s: number, w: any) => s + (w.allocated_hours || 0) * (w.hourly_rate || 0), 0).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
{:else}
  <p class="text-slate-500">Project not found.</p>
{/if}
