<script lang="ts">
  import { dataStore } from '$lib/stores/data.svelte';
  const workers = $derived(dataStore.getAllWorkers());
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-2xl font-bold text-slate-900">Workers</h2>
      <p class="text-slate-500 mt-1">{workers.length} team members</p>
    </div>
    <a href="/workers/new" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">+ Add Worker</a>
  </div>

  {#if workers.length === 0}
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
      <p class="text-4xl mb-3">👷</p>
      <p class="text-slate-600 font-medium">No workers yet</p>
      <p class="text-slate-400 text-sm mt-1 mb-4">Add your first team member to get started</p>
      <a href="/workers/new" class="inline-block bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Add your first worker →</a>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each workers as worker}
        <a href="/workers/{worker.id}" class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
              {worker.name.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div class="min-w-0">
              <p class="font-semibold text-slate-900 truncate">{worker.name}</p>
              <p class="text-sm text-slate-500 truncate">{worker.email || 'No email'}</p>
            </div>
          </div>
          {#if worker.phone}
            <p class="text-sm text-slate-500 mt-3 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/></svg>
              {worker.phone}
            </p>
          {/if}
        </a>
      {/each}
    </div>
  {/if}
</div>
