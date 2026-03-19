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

<div class="max-w-xl space-y-6">
  <div class="flex items-center gap-3">
    <a href="/projects" class="text-ink-muted hover:text-ink transition-colors">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
    </a>
    <h1 class="font-heading text-2xl font-700 text-ink tracking-tight">New Project</h1>
  </div>

  <form onsubmit={handleSubmit} class="space-y-5">
    <div>
      <label for="name" class="block text-sm font-medium text-ink-secondary mb-1.5">Project Name<span class="text-danger ml-0.5">*</span></label>
      <input id="name" name="name" type="text" required class="w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-ink"/>
    </div>
    <div>
      <label for="description" class="block text-sm font-medium text-ink-secondary mb-1.5">Description</label>
      <textarea id="description" name="description" rows="3" class="w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-ink"></textarea>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label for="client_id" class="block text-sm font-medium text-ink-secondary mb-1.5">Client</label>
        <select id="client_id" name="client_id" class="w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-ink">
          <option value="">No client</option>
          {#each clients as client}
            <option value={client.id}>{client.company_name}</option>
          {/each}
        </select>
      </div>
      <div>
        <label for="status" class="block text-sm font-medium text-ink-secondary mb-1.5">Status</label>
        <select id="status" name="status" class="w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-ink">
          <option value="planned">Planned</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label for="start_date" class="block text-sm font-medium text-ink-secondary mb-1.5">Start Date</label>
        <input id="start_date" name="start_date" type="date" class="w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-ink"/>
      </div>
      <div>
        <label for="end_date" class="block text-sm font-medium text-ink-secondary mb-1.5">End Date</label>
        <input id="end_date" name="end_date" type="date" class="w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-ink"/>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label for="value" class="block text-sm font-medium text-ink-secondary mb-1.5">Value</label>
        <input id="value" name="value" type="number" step="0.01" class="w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-ink"/>
      </div>
      <div>
        <label for="currency" class="block text-sm font-medium text-ink-secondary mb-1.5">Currency</label>
        <input id="currency" name="currency" type="text" value="EUR" class="w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-ink"/>
      </div>
    </div>

    {#if allWorkers.length > 0}
      <div class="border-t border-border pt-5">
        <h2 class="text-xs font-600 text-ink-muted uppercase tracking-wide mb-3">Assign Workers</h2>
        <div class="space-y-2">
          {#each allWorkers as worker}
            <div class="border border-border rounded-md px-3 py-2.5 bg-surface-raised">
              <label class="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={selectedWorkers.has(worker.id)} onchange={() => toggleWorker(worker.id)} class="rounded border-border-strong text-primary accent-primary"/>
                <span class="font-medium text-ink text-sm">{worker.name}</span>
                <span class="text-ink-muted text-xs">{worker.email || ''}</span>
              </label>
              {#if selectedWorkers.has(worker.id)}
                <div class="grid grid-cols-3 gap-3 mt-3 ml-7">
                  <div>
                    <label class="block text-xs text-ink-muted mb-1">Role</label>
                    <input type="text" value={workerDetails[worker.id]?.role || ''} oninput={(e: Event) => updateDetail(worker.id, 'role', (e.target as HTMLInputElement).value)} placeholder="e.g. Assembler" class="w-full rounded border border-border bg-surface px-2 py-1 text-sm text-ink"/>
                  </div>
                  <div>
                    <label class="block text-xs text-ink-muted mb-1">Hours</label>
                    <input type="number" value={workerDetails[worker.id]?.allocated_hours || ''} oninput={(e: Event) => updateDetail(worker.id, 'allocated_hours', (e.target as HTMLInputElement).value)} placeholder="0" class="w-full rounded border border-border bg-surface px-2 py-1 text-sm text-ink tabular-nums"/>
                  </div>
                  <div>
                    <label class="block text-xs text-ink-muted mb-1">€/hour</label>
                    <input type="number" step="0.01" value={workerDetails[worker.id]?.hourly_rate || ''} oninput={(e: Event) => updateDetail(worker.id, 'hourly_rate', (e.target as HTMLInputElement).value)} placeholder="0" class="w-full rounded border border-border bg-surface px-2 py-1 text-sm text-ink tabular-nums"/>
                  </div>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <div class="flex gap-3 pt-2">
      <button type="submit" disabled={saving} class="bg-primary text-primary-text px-5 py-2 rounded-md text-sm font-600 hover:bg-primary-hover transition-colors disabled:opacity-50">{saving ? 'Creating...' : 'Create Project'}</button>
      <a href="/projects" class="px-5 py-2 rounded-md text-sm font-medium text-ink-secondary border border-border hover:bg-surface-hover transition-colors">Cancel</a>
    </div>
  </form>
</div>
