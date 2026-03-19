<script lang="ts">
  import { page } from '$app/state';
  import { dataStore } from '$lib/stores/data.svelte';
  import { goto } from '$app/navigation';

  const projectId = $derived(Number(page.params.id));
  const project = $derived(dataStore.getProjectById(projectId));
  const client = $derived(project?.client_id ? dataStore.getClientById(project.client_id) : undefined);
  const workers = $derived(dataStore.getWorkersByProject(projectId));
  const unassigned = $derived(dataStore.getUnassignedWorkers(projectId));
  const allClients = $derived(dataStore.getAllClients());

  let editing = $state(false);
  let saving = $state(false);
  let editName = $state('');
  let editDescription = $state('');
  let editStartDate = $state('');
  let editEndDate = $state('');
  let editValue = $state('');
  let editCurrency = $state('');
  let editStatus = $state<'planned' | 'active' | 'completed'>('planned');
  let editClientId = $state<number | null>(null);

  let showAssignForm = $state(false);
  let assignWorkerId = $state<number | null>(null);
  let assignRole = $state('');
  let assignHours = $state('');
  let assignRate = $state('');

  const statusColors: Record<string, string> = {
    active: 'bg-success-light text-success',
    planned: 'bg-info-light text-info',
    completed: 'bg-surface-hover text-ink-muted'
  };

  function startEdit() {
    if (!project) return;
    editName = project.name;
    editDescription = project.description || '';
    editStartDate = project.start_date || '';
    editEndDate = project.end_date || '';
    editValue = project.value != null ? String(project.value) : '';
    editCurrency = project.currency;
    editStatus = project.status;
    editClientId = project.client_id;
    editing = true;
  }

  function cancelEdit() {
    editing = false;
  }

  async function saveEdit() {
    saving = true;
    try {
      await dataStore.updateProject(projectId, {
        name: editName,
        description: editDescription || null,
        start_date: editStartDate || null,
        end_date: editEndDate || null,
        value: editValue ? Number(editValue) : null,
        currency: editCurrency || 'EUR',
        status: editStatus,
        client_id: editClientId
      });
      editing = false;
    } catch (err) {
      console.error('Failed to update project:', err);
    } finally {
      saving = false;
    }
  }

  async function deleteProject() {
    if (confirm('Delete this project?')) {
      await dataStore.deleteProject(projectId);
      goto('/projects');
    }
  }

  async function assignWorker() {
    if (!assignWorkerId) return;
    await dataStore.assignWorker({
      project_id: projectId,
      worker_id: assignWorkerId,
      role: assignRole || null,
      allocated_hours: assignHours ? Number(assignHours) : null,
      hourly_rate: assignRate ? Number(assignRate) : null,
      start_date: null,
      end_date: null
    });
    showAssignForm = false;
    assignWorkerId = null;
    assignRole = '';
    assignHours = '';
    assignRate = '';
  }

  async function removeWorker(workerId: number) {
    if (confirm('Remove this worker from the project?')) {
      await dataStore.removeWorkerFromProject(projectId, workerId);
    }
  }
</script>

{#if project}
<div class="space-y-8">
  <!-- Header -->
  <div class="flex items-start gap-4">
    <a href="/projects" class="text-ink-muted hover:text-ink transition-colors mt-1">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
    </a>
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-3">
        {#if editing}
          <input bind:value={editName} class="font-heading text-xl font-700 text-ink border border-border rounded-md px-2 py-1 bg-surface-raised w-full max-w-sm" />
        {:else}
          <h1 class="font-heading text-xl font-700 text-ink tracking-tight">{project.name}</h1>
          <span class="text-[0.6875rem] px-2 py-0.5 rounded font-medium {statusColors[project.status]}">{project.status}</span>
        {/if}
      </div>
      <p class="text-sm text-ink-muted mt-0.5">{project.client_name || 'No client'}</p>
    </div>
    <div class="flex items-center gap-2 shrink-0">
      {#if editing}
        <button onclick={saveEdit} disabled={saving} class="bg-primary text-primary-text px-4 py-1.5 rounded-md text-sm font-600 hover:bg-primary-hover disabled:opacity-50 transition-colors">{saving ? 'Saving...' : 'Save'}</button>
        <button onclick={cancelEdit} class="px-4 py-1.5 rounded-md text-sm font-medium text-ink-secondary border border-border hover:bg-surface-hover transition-colors">Cancel</button>
      {:else}
        <button onclick={startEdit} class="text-primary hover:text-primary-hover text-sm font-600">Edit</button>
        <button onclick={deleteProject} class="text-danger hover:text-danger/80 text-sm font-600">Delete</button>
      {/if}
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div class="lg:col-span-2 space-y-8">
      <!-- Project Details -->
      <section>
        <h2 class="text-xs font-600 text-ink-muted uppercase tracking-wide mb-3">Project Details</h2>
        {#if editing}
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-ink-secondary mb-1.5">Description</label>
              <textarea bind:value={editDescription} rows="3" class="w-full border border-border rounded-md px-3 py-2 text-sm bg-surface-raised text-ink"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-ink-secondary mb-1.5">Client</label>
                <select bind:value={editClientId} class="w-full border border-border rounded-md px-3 py-2 text-sm bg-surface-raised text-ink">
                  <option value={null}>No client</option>
                  {#each allClients as c}
                    <option value={c.id}>{c.company_name}</option>
                  {/each}
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-ink-secondary mb-1.5">Status</label>
                <select bind:value={editStatus} class="w-full border border-border rounded-md px-3 py-2 text-sm bg-surface-raised text-ink">
                  <option value="planned">Planned</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-ink-secondary mb-1.5">Start Date</label>
                <input bind:value={editStartDate} type="date" class="w-full border border-border rounded-md px-3 py-2 text-sm bg-surface-raised text-ink" />
              </div>
              <div>
                <label class="block text-sm font-medium text-ink-secondary mb-1.5">End Date</label>
                <input bind:value={editEndDate} type="date" class="w-full border border-border rounded-md px-3 py-2 text-sm bg-surface-raised text-ink" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-ink-secondary mb-1.5">Value</label>
                <input bind:value={editValue} type="number" step="0.01" class="w-full border border-border rounded-md px-3 py-2 text-sm bg-surface-raised text-ink" />
              </div>
              <div>
                <label class="block text-sm font-medium text-ink-secondary mb-1.5">Currency</label>
                <input bind:value={editCurrency} type="text" class="w-full border border-border rounded-md px-3 py-2 text-sm bg-surface-raised text-ink" />
              </div>
            </div>
          </div>
        {:else}
          {#if project.description}
            <p class="text-sm text-ink-secondary leading-relaxed mb-4">{project.description}</p>
          {/if}
          <dl class="grid grid-cols-2 gap-x-8 gap-y-4">
            <div><dt class="text-xs text-ink-muted">Start Date</dt><dd class="text-sm font-medium text-ink mt-0.5 tabular-nums">{project.start_date || '—'}</dd></div>
            <div><dt class="text-xs text-ink-muted">End Date</dt><dd class="text-sm font-medium text-ink mt-0.5 tabular-nums">{project.end_date || '—'}</dd></div>
            <div><dt class="text-xs text-ink-muted">Value</dt><dd class="text-sm font-medium text-ink mt-0.5 tabular-nums">{project.value ? `€${project.value.toLocaleString()}` : '—'}</dd></div>
            <div><dt class="text-xs text-ink-muted">Currency</dt><dd class="text-sm font-medium text-ink mt-0.5">{project.currency}</dd></div>
          </dl>
        {/if}
      </section>

      <!-- Team -->
      <section>
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-xs font-600 text-ink-muted uppercase tracking-wide">Team ({workers.length})</h2>
          {#if unassigned.length > 0}
            <button onclick={() => { showAssignForm = !showAssignForm; assignWorkerId = null; }} class="text-xs text-primary hover:text-primary-hover font-medium">
              {showAssignForm ? 'Cancel' : '+ Assign Worker'}
            </button>
          {/if}
        </div>

        {#if showAssignForm}
          <div class="border border-border rounded-lg bg-surface-raised px-4 py-4 mb-3 space-y-3">
            <div>
              <label class="block text-xs text-ink-muted mb-1">Worker</label>
              <select bind:value={assignWorkerId} class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink">
                <option value={null}>Select a worker...</option>
                {#each unassigned as w}
                  <option value={w.id}>{w.name}</option>
                {/each}
              </select>
            </div>
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block text-xs text-ink-muted mb-1">Role</label>
                <input type="text" bind:value={assignRole} placeholder="e.g. Assembler" class="w-full rounded border border-border bg-surface px-2 py-1.5 text-sm text-ink"/>
              </div>
              <div>
                <label class="block text-xs text-ink-muted mb-1">Hours</label>
                <input type="number" bind:value={assignHours} placeholder="0" class="w-full rounded border border-border bg-surface px-2 py-1.5 text-sm text-ink tabular-nums"/>
              </div>
              <div>
                <label class="block text-xs text-ink-muted mb-1">€/hour</label>
                <input type="number" step="0.01" bind:value={assignRate} placeholder="0" class="w-full rounded border border-border bg-surface px-2 py-1.5 text-sm text-ink tabular-nums"/>
              </div>
            </div>
            <button onclick={assignWorker} disabled={!assignWorkerId} class="bg-primary text-primary-text px-4 py-1.5 rounded-md text-sm font-600 hover:bg-primary-hover disabled:opacity-50 transition-colors">Assign</button>
          </div>
        {/if}

        {#if workers.length === 0}
          <p class="text-sm text-ink-muted py-4">No workers assigned yet.</p>
        {:else}
          <div class="border border-border rounded-lg overflow-hidden bg-surface-raised">
            {#each workers as pw, i}
              <div class="flex items-center justify-between px-4 py-3 {i > 0 ? 'border-t border-border' : ''}">
                <a href="/workers/{pw.worker_id}" class="flex items-center gap-3 hover:opacity-80 min-w-0">
                  <div class="w-7 h-7 bg-primary-light text-primary rounded flex items-center justify-center font-600 text-xs shrink-0">
                    {pw.worker_name?.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div class="min-w-0">
                    <p class="font-medium text-ink text-sm truncate">{pw.worker_name}</p>
                    <p class="text-xs text-ink-muted">{pw.role || 'No role'}</p>
                  </div>
                </a>
                <div class="flex items-center gap-4 shrink-0">
                  <div class="text-right text-sm tabular-nums">
                    <p class="font-medium text-ink">{pw.allocated_hours || 0}h</p>
                    <p class="text-xs text-ink-muted">€{pw.hourly_rate || 0}/h</p>
                  </div>
                  <button onclick={() => removeWorker(pw.worker_id)} class="text-ink-muted hover:text-danger text-xs transition-colors" title="Remove">✕</button>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </section>
    </div>

    <!-- Sidebar -->
    <div class="space-y-6">
      {#if client}
        <div>
          <h2 class="text-xs font-600 text-ink-muted uppercase tracking-wide mb-3">Client</h2>
          <a href="/clients/{client.id}" class="block border border-border rounded-lg bg-surface-raised px-4 py-4 hover:bg-surface-hover transition-colors duration-100">
            <p class="font-medium text-primary text-sm">{client.company_name}</p>
            {#if client.contact_person}<p class="text-xs text-ink-muted mt-1">{client.contact_person}</p>{/if}
            {#if client.contact_email}<p class="text-xs text-ink-muted">{client.contact_email}</p>{/if}
            {#if client.contact_phone}<p class="text-xs text-ink-muted tabular-nums">{client.contact_phone}</p>{/if}
          </a>
        </div>
      {/if}

      <div>
        <h2 class="text-xs font-600 text-ink-muted uppercase tracking-wide mb-3">Summary</h2>
        <div class="border border-border rounded-lg bg-surface-raised px-4 py-4 space-y-3">
          <div class="flex justify-between items-baseline">
            <span class="text-sm text-ink-secondary">Team Size</span>
            <span class="font-heading font-700 text-ink tabular-nums">{workers.length}</span>
          </div>
          <div class="flex justify-between items-baseline">
            <span class="text-sm text-ink-secondary">Total Hours</span>
            <span class="font-heading font-700 text-ink tabular-nums">{workers.reduce((s: number, w: any) => s + (w.allocated_hours || 0), 0)}</span>
          </div>
          <div class="flex justify-between items-baseline">
            <span class="text-sm text-ink-secondary">Labor Cost</span>
            <span class="font-heading font-700 text-ink tabular-nums">€{workers.reduce((s: number, w: any) => s + (w.allocated_hours || 0) * (w.hourly_rate || 0), 0).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
{:else}
  <p class="text-ink-muted">Project not found.</p>
{/if}
