<script lang="ts">
  let { data } = $props();
</script>

<div class="max-w-2xl space-y-6">
  <div class="flex items-center gap-4">
    <a href="/projects" class="text-slate-400 hover:text-slate-600">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
    </a>
    <h2 class="text-2xl font-bold text-slate-900">New Project</h2>
  </div>

  <form method="POST" class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
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
          {#each data.clients as client}
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
    <div class="flex gap-3 pt-2">
      <button type="submit" class="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Create Project</button>
      <a href="/projects" class="px-5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Cancel</a>
    </div>
  </form>
</div>
