<script lang="ts">
  import { page } from '$app/state';
  import { dataStore } from '$lib/stores/data.svelte';
  import { goto } from '$app/navigation';

  const workerId = $derived(Number(page.params.id));
  const worker = $derived(dataStore.getWorkerById(workerId));
  const projects = $derived(dataStore.getProjectsByWorker(workerId));

  function deleteWorker() {
    if (confirm('Delete this worker?')) {
      dataStore.deleteWorker(workerId);
      goto('/workers');
    }
  }
</script>

{#if worker}
<div class="space-y-6">
  <div class="flex items-center gap-4">
    <a href="/workers" class="text-slate-400 hover:text-slate-600">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
    </a>
    <div class="flex items-center gap-4 flex-1">
      <div class="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">
        {worker.name.split(' ').map((n: string) => n[0]).join('')}
      </div>
      <div>
        <h2 class="text-2xl font-bold text-slate-900">{worker.name}</h2>
        <p class="text-slate-500">{worker.email || 'No email'}</p>
      </div>
    </div>
    <button onclick={deleteWorker} class="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="lg:col-span-2 space-y-6">
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 class="font-semibold text-slate-900 mb-4">Contact Information</h3>
        <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {#each [['Phone', worker.phone], ['Email', worker.email], ['Address', worker.address]] as [label, value]}
            <div>
              <dt class="text-sm text-slate-500">{label}</dt>
              <dd class="font-medium text-slate-900 mt-0.5">{value || '—'}</dd>
            </div>
          {/each}
        </dl>
        {#if worker.notes}
          <div class="mt-4 pt-4 border-t border-slate-100">
            <dt class="text-sm text-slate-500">Notes</dt>
            <dd class="text-slate-700 mt-1">{worker.notes}</dd>
          </div>
        {/if}
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200">
        <div class="px-6 py-4 border-b border-slate-100">
          <h3 class="font-semibold text-slate-900">Assigned Projects</h3>
        </div>
        {#if projects.length === 0}
          <p class="p-6 text-slate-500 text-sm">No projects assigned.</p>
        {:else}
          <div class="divide-y divide-slate-100">
            {#each projects as pw}
              <div class="px-6 py-3">
                <p class="font-medium text-slate-900">{pw.project_name}</p>
                <p class="text-sm text-slate-500">{pw.role || 'No role'} · {pw.allocated_hours || 0}h · €{pw.hourly_rate || 0}/h</p>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <div>
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 class="font-semibold text-slate-900 mb-3">Quick Stats</h3>
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-sm text-slate-500">Projects</span>
            <span class="font-semibold text-slate-900">{projects.length}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-slate-500">Total Hours</span>
            <span class="font-semibold text-slate-900">{projects.reduce((s: number, p: any) => s + (p.allocated_hours || 0), 0)}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-slate-500">Member Since</span>
            <span class="font-semibold text-slate-900">{new Date(worker.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
{:else}
  <p class="text-slate-500">Worker not found.</p>
{/if}
