<script lang="ts">
  import { page } from '$app/state';
  import { dataStore } from '$lib/stores/data.svelte';
  import { goto } from '$app/navigation';

  const workerId = $derived(Number(page.params.id));
  const worker = $derived(dataStore.getWorkerById(workerId));
  const projects = $derived(dataStore.getProjectsByWorker(workerId));

  let editing = $state(false);
  let saving = $state(false);
  let editName = $state('');
  let editPhone = $state('');
  let editEmail = $state('');
  let editAddress = $state('');
  let editNotes = $state('');

  function startEdit() {
    if (!worker) return;
    editName = worker.name;
    editPhone = worker.phone || '';
    editEmail = worker.email || '';
    editAddress = worker.address || '';
    editNotes = worker.notes || '';
    editing = true;
  }

  function cancelEdit() {
    editing = false;
  }

  async function saveEdit() {
    saving = true;
    try {
      await dataStore.updateWorker(workerId, {
        name: editName,
        phone: editPhone || null,
        email: editEmail || null,
        address: editAddress || null,
        notes: editNotes || null
      });
      editing = false;
    } catch (err) {
      console.error('Failed to update worker:', err);
    } finally {
      saving = false;
    }
  }

  async function deleteWorker() {
    if (confirm('Delete this worker?')) {
      await dataStore.deleteWorker(workerId);
      goto('/workers');
    }
  }
</script>

{#if worker}
<div class="space-y-8">
  <!-- Header -->
  <div class="flex items-start gap-4">
    <a href="/workers" class="text-ink-muted hover:text-ink transition-colors mt-1">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
    </a>
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-primary-light text-primary rounded flex items-center justify-center font-700 text-sm shrink-0">
          {worker.name.split(' ').map((n: string) => n[0]).join('')}
        </div>
        <div class="min-w-0">
          {#if editing}
            <input bind:value={editName} class="font-heading text-xl font-700 text-ink border border-border rounded-md px-2 py-1 bg-surface-raised w-full max-w-xs" />
          {:else}
            <h1 class="font-heading text-xl font-700 text-ink tracking-tight truncate">{worker.name}</h1>
          {/if}
          <p class="text-sm text-ink-muted mt-0.5">{worker.email || 'No email'}</p>
        </div>
      </div>
    </div>
    <div class="flex items-center gap-2 shrink-0">
      {#if editing}
        <button onclick={saveEdit} disabled={saving} class="bg-primary text-primary-text px-4 py-1.5 rounded-md text-sm font-600 hover:bg-primary-hover disabled:opacity-50 transition-colors">{saving ? 'Saving...' : 'Save'}</button>
        <button onclick={cancelEdit} class="px-4 py-1.5 rounded-md text-sm font-medium text-ink-secondary border border-border hover:bg-surface-hover transition-colors">Cancel</button>
      {:else}
        <button onclick={startEdit} class="text-primary hover:text-primary-hover text-sm font-600">Edit</button>
        <button onclick={deleteWorker} class="text-danger hover:text-danger/80 text-sm font-600">Delete</button>
      {/if}
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div class="lg:col-span-2 space-y-8">
      <!-- Contact info -->
      <section>
        <h2 class="text-xs font-600 text-ink-muted uppercase tracking-wide mb-3">Contact Information</h2>
        {#if editing}
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-ink-secondary mb-1.5">Phone</label>
              <input bind:value={editPhone} type="tel" class="w-full border border-border rounded-md px-3 py-2 text-sm bg-surface-raised text-ink" />
            </div>
            <div>
              <label class="block text-sm font-medium text-ink-secondary mb-1.5">Email</label>
              <input bind:value={editEmail} type="email" class="w-full border border-border rounded-md px-3 py-2 text-sm bg-surface-raised text-ink" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-ink-secondary mb-1.5">Address</label>
              <input bind:value={editAddress} type="text" class="w-full border border-border rounded-md px-3 py-2 text-sm bg-surface-raised text-ink" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-ink-secondary mb-1.5">Notes</label>
              <textarea bind:value={editNotes} rows="3" class="w-full border border-border rounded-md px-3 py-2 text-sm bg-surface-raised text-ink"></textarea>
            </div>
          </div>
        {:else}
          <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {#each [['Phone', worker.phone], ['Email', worker.email], ['Address', worker.address]] as [label, value]}
              <div>
                <dt class="text-xs text-ink-muted">{label}</dt>
                <dd class="text-sm font-medium text-ink mt-0.5">{value || '—'}</dd>
              </div>
            {/each}
          </dl>
          {#if worker.notes}
            <div class="mt-4 pt-4 border-t border-border">
              <dt class="text-xs text-ink-muted">Notes</dt>
              <dd class="text-sm text-ink-secondary mt-1 leading-relaxed">{worker.notes}</dd>
            </div>
          {/if}
        {/if}
      </section>

      <!-- Assigned Projects -->
      <section>
        <h2 class="text-xs font-600 text-ink-muted uppercase tracking-wide mb-3">Assigned Projects</h2>
        {#if projects.length === 0}
          <p class="text-sm text-ink-muted py-4">No projects assigned.</p>
        {:else}
          <div class="border border-border rounded-lg overflow-hidden bg-surface-raised">
            {#each projects as pw, i}
              <a href="/projects/{pw.project_id}" class="flex items-center justify-between px-4 py-3 hover:bg-surface-hover transition-colors duration-100 {i > 0 ? 'border-t border-border' : ''}">
                <div>
                  <p class="font-medium text-ink text-sm">{pw.project_name}</p>
                  <p class="text-xs text-ink-muted mt-0.5">{pw.role || 'No role'}</p>
                </div>
                <div class="text-right text-sm tabular-nums">
                  <p class="font-medium text-ink">{pw.allocated_hours || 0}h</p>
                  <p class="text-xs text-ink-muted">€{pw.hourly_rate || 0}/h</p>
                </div>
              </a>
            {/each}
          </div>
        {/if}
      </section>
    </div>

    <!-- Sidebar stats -->
    <div>
      <h2 class="text-xs font-600 text-ink-muted uppercase tracking-wide mb-3">Quick Stats</h2>
      <div class="border border-border rounded-lg bg-surface-raised px-4 py-4 space-y-3">
        <div class="flex justify-between items-baseline">
          <span class="text-sm text-ink-secondary">Projects</span>
          <span class="font-heading font-700 text-ink tabular-nums">{projects.length}</span>
        </div>
        <div class="flex justify-between items-baseline">
          <span class="text-sm text-ink-secondary">Total Hours</span>
          <span class="font-heading font-700 text-ink tabular-nums">{projects.reduce((s: number, p: any) => s + (p.allocated_hours || 0), 0)}</span>
        </div>
        <div class="flex justify-between items-baseline">
          <span class="text-sm text-ink-secondary">Member Since</span>
          <span class="text-sm font-medium text-ink">{new Date(worker.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  </div>
</div>
{:else}
  <p class="text-ink-muted">Worker not found.</p>
{/if}
