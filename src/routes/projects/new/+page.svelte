<script lang="ts">
  import { dataStore } from '$lib/stores/data.svelte';
  import { goto } from '$app/navigation';

  const clients = $derived(dataStore.getAllClients());
  const allWorkers = $derived(dataStore.getAllWorkers());

  interface WorkerAssignment {
    worker_id: number;
    role: string;
    allocated_hours: string;
    hourly_rate: string;
  }

  let selectedWorkers = $state<Set<number>>(new Set());
  let workerDetails = $state<Record<number, { role: string; allocated_hours: string; hourly_rate: string }>>({});
  let saving = $state(false);

  function toggleWorker(id: number) {
    const next = new Set(selectedWorkers);
    if (next.has(id)) {
      next.delete(id);
      const d = { ...workerDetails };
      delete d[id];
      workerDetails = d;
    } else {
      next.add(id);
      workerDetails = { ...workerDetails, [id]: { role: '', allocated_hours: '', hourly_rate: '' } };
    }
    selectedWorkers = next;
  }

  function updateDetail(id: number, field: string, value: string) {
    workerDetails = { ...workerDetails, [id]: { ...workerDetails[id], [field]: value } };
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    saving = true;
    try {
      const form = new FormData(e.target as HTMLFormElement);
      const project = await dataStore.createProject({
        name: form.get('name') as string,
        description: (form.get('description') as string) || null,
        client_id: form.get('client_id') ? Number(form.get('client_id')) : null,
        start_date: (form.get('start_date') as string) || null,
        end_date: (form.get('end_date') as string) || null,
        value: form.get('value') ? Number(form.get('value')) : null,
        currency: (form.get('currency') as string) || 'EUR',
        status: (form.get('status') as 'planned' | 'active' | 'completed') || 'planned'
      });

      // Assign selected workers
      for (const wid of selectedWorkers) {
        const d = workerDetails[wid];
        await dataStore.assignWorker({
          project_id: project.id,
          worker_id: wid,
          role: d?.role || null,
          allocated_hours: d?.allocated_hours ? Number(d.allocated_hours) : null,
          hourly_rate: d?.hourly_rate ? Number(d.hourly_rate) : null,
          start_date: null,
          end_date: null
        });
      }

      goto(`/projects/${project.id}`);
    } catch (err) {
      console.error('Failed to create project:', err);
      saving = false;
    }
  }
</script>

<div class="max-w-2xl space-y-6">
  <div class="flex items-center gap-4">
    <a href="/projects" class="text-slate-400 hover:text-slate-600">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
    </a>
    <h2 class="text-2xl font-bold text-slate-900">New Project</h2>
  </div>

  <form onsubmit={handleSubmit} class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
    <div>
      <label for="name" class="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
      <input id="name" name="name" type="text" required class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
    </div>
    <div>
      <label for="description" class="block text-sm font-medium text-slate-700 mb-1">Description</label>
      <textarea id="description" name="description" rows="3" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label for="client_id" class="block text-sm font-medium text-slate-700 mb-1">Client</label>
        <select id="client_id" name="client_id" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option value="">No client</option>
          {#each clients as client}
            <option value={client.id}>{client.company_name}</option>
          {/each}
        </select>
      </div>
      <div>
        <label for="status" class="block text-sm font-medium text-slate-700 mb-1">Status</label>
        <select id="status" name="status" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option value="planned">Planned</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label for="start_date" class="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
        <input id="start_date" name="start_date" type="date" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
      </div>
      <div>
        <label for="end_date" class="block text-sm font-medium text-slate-700 mb-1">End Date</label>
        <input id="end_date" name="end_date" type="date" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label for="value" class="block text-sm font-medium text-slate-700 mb-1">Value</label>
        <input id="value" name="value" type="number" step="0.01" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
      </div>
      <div>
        <label for="currency" class="block text-sm font-medium text-slate-700 mb-1">Currency</label>
        <input id="currency" name="currency" type="text" value="EUR" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
      </div>
    </div>

    <!-- Assign Workers Section -->
    {#if allWorkers.length > 0}
      <div class="border-t border-slate-200 pt-5">
        <h3 class="text-sm font-medium text-slate-700 mb-3">Assign Workers</h3>
        <div class="space-y-3">
          {#each allWorkers as worker}
            <div class="border border-slate-200 rounded-lg p-3">
              <label class="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={selectedWorkers.has(worker.id)} onchange={() => toggleWorker(worker.id)} class="rounded border-slate-300 text-blue-600 focus:ring-blue-500"/>
                <span class="font-medium text-slate-900 text-sm">{worker.name}</span>
                <span class="text-slate-400 text-xs">{worker.email || ''}</span>
              </label>
              {#if selectedWorkers.has(worker.id)}
                <div class="grid grid-cols-3 gap-3 mt-3 ml-7">
                  <div>
                    <label class="block text-xs text-slate-500 mb-1">Role</label>
                    <input type="text" value={workerDetails[worker.id]?.role || ''} oninput={(e: Event) => updateDetail(worker.id, 'role', (e.target as HTMLInputElement).value)} placeholder="e.g. Developer" class="w-full rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"/>
                  </div>
                  <div>
                    <label class="block text-xs text-slate-500 mb-1">Hours</label>
                    <input type="number" value={workerDetails[worker.id]?.allocated_hours || ''} oninput={(e: Event) => updateDetail(worker.id, 'allocated_hours', (e.target as HTMLInputElement).value)} placeholder="0" class="w-full rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"/>
                  </div>
                  <div>
                    <label class="block text-xs text-slate-500 mb-1">€/hour</label>
                    <input type="number" step="0.01" value={workerDetails[worker.id]?.hourly_rate || ''} oninput={(e: Event) => updateDetail(worker.id, 'hourly_rate', (e.target as HTMLInputElement).value)} placeholder="0" class="w-full rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"/>
                  </div>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <div class="flex gap-3 pt-2">
      <button type="submit" disabled={saving} class="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">{saving ? 'Creating...' : 'Create Project'}</button>
      <a href="/projects" class="px-5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Cancel</a>
    </div>
  </form>
</div>
