<script lang="ts">
  import { dataStore } from '$lib/stores/data.svelte';

  // State
  let dragOver = $state(false);
  let parsing = $state(false);
  let error = $state<string | null>(null);
  let fileName = $state('');

  // Parsed data (editable)
  let clientData = $state<Record<string, any> | null>(null);
  let projectData = $state<Record<string, any> | null>(null);
  let workersData = $state<Record<string, any>[] | null>(null);

  // Save status
  let clientSaved = $state<{ id: number } | null>(null);
  let projectSaved = $state<{ id: number } | null>(null);
  let workersSaved = $state<number[]>([]);

  async function extractText(file: File): Promise<string> {
    const ext = file.name.split('.').pop()?.toLowerCase();
    
    if (ext === 'pdf') {
      const pdfjsLib = await import('pdfjs-dist');
      // @ts-ignore
      pdfjsLib.GlobalWorkerOptions.workerSrc = '';
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer, useWorkerFetch: false, isEvalSupported: false, useSystemFonts: true }).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(' ') + '\n';
      }
      return text;
    } else if (ext === 'docx' || ext === 'doc') {
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } else {
      throw new Error('Unsupported file format. Please upload a PDF or DOCX file.');
    }
  }

  async function handleFile(file: File) {
    error = null;
    clientData = null;
    projectData = null;
    workersData = null;
    clientSaved = null;
    projectSaved = null;
    workersSaved = [];
    fileName = file.name;
    parsing = true;

    try {
      const text = await extractText(file);
      
      if (text.trim().length < 50) {
        error = 'This appears to be a scanned document or contains too little text. Scanned documents are not supported yet.';
        parsing = false;
        return;
      }

      const res = await fetch('/api/parse-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      const data = await res.json();
      if (!res.ok) {
        error = data.error || 'Failed to parse contract';
        parsing = false;
        return;
      }

      clientData = data.client || {};
      projectData = data.project || {};
      workersData = data.workers || [];
    } catch (e: any) {
      error = e?.message || String(e);
    } finally {
      parsing = false;
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    dragOver = false;
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  }

  function onFileInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) handleFile(file);
  }

  async function saveClient() {
    if (!clientData) return;
    try {
      const c = await dataStore.createClient({
        company_name: clientData.company_name || 'Unknown',
        contact_person: clientData.contact_person || null,
        contact_email: clientData.contact_email || null,
        contact_phone: clientData.contact_phone || null,
        address: clientData.address || null,
        company_size: clientData.company_size || null,
        bio: null
      });
      clientSaved = { id: c.id };
    } catch (e: any) {
      error = 'Failed to save client: ' + (e?.message || String(e));
    }
  }

  async function saveProject() {
    if (!projectData) return;
    try {
      const p = await dataStore.createProject({
        name: projectData.name || 'Untitled Project',
        description: projectData.description || null,
        client_id: clientSaved?.id || null,
        start_date: projectData.start_date || null,
        end_date: projectData.end_date || null,
        value: projectData.value ? Number(projectData.value) : null,
        currency: projectData.currency || 'EUR',
        status: projectData.status || 'planned'
      });
      projectSaved = { id: p.id };
    } catch (e: any) {
      error = 'Failed to save project: ' + (e?.message || String(e));
    }
  }

  async function saveWorkers() {
    if (!workersData) return;
    try {
      for (let i = 0; i < workersData.length; i++) {
        if (workersSaved.includes(i)) continue;
        const w = workersData[i];
        const created = await dataStore.createWorker({
          name: w.name || 'Unknown',
          phone: w.phone || null,
          email: w.email || null,
          address: w.address || null,
          notes: w.notes || null,
          photo_url: null
        });
        workersSaved = [...workersSaved, i];

        // Auto-assign to project if created
        if (projectSaved) {
          await dataStore.assignWorker({
            project_id: projectSaved.id,
            worker_id: created.id,
            role: w.role || null,
            allocated_hours: w.allocated_hours ? Number(w.allocated_hours) : null,
            hourly_rate: w.hourly_rate ? Number(w.hourly_rate) : null,
            start_date: null,
            end_date: null
          });
        }
      }
    } catch (e: any) {
      error = 'Failed to save workers: ' + (e?.message || String(e));
    }
  }

  function removeWorker(index: number) {
    if (!workersData) return;
    workersData = workersData.filter((_, i) => i !== index);
  }

  function addWorker() {
    if (!workersData) workersData = [];
    workersData = [...workersData, { name: '', role: '', allocated_hours: null, hourly_rate: null, phone: '', email: '', address: '', notes: '' }];
  }
</script>

<div class="space-y-6 max-w-4xl">
  <div>
    <h2 class="text-2xl font-bold text-slate-900">Upload Contract</h2>
    <p class="text-slate-500 mt-1">Upload a PDF or DOCX contract to extract client, project, and worker data</p>
  </div>

  <!-- Upload area -->
  <div
    class="border-2 border-dashed rounded-xl p-12 text-center transition-colors {dragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white hover:border-slate-400'}"
    ondragover={(e) => { e.preventDefault(); dragOver = true; }}
    ondragleave={() => dragOver = false}
    ondrop={onDrop}
    role="button"
    tabindex="0"
  >
    {#if parsing}
      <div class="space-y-3">
        <div class="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        <p class="text-slate-600 font-medium">Parsing {fileName}...</p>
        <p class="text-sm text-slate-400">Extracting text and analyzing with AI</p>
      </div>
    {:else}
      <p class="text-4xl mb-3">📄</p>
      <p class="text-slate-600 font-medium">Drop a contract here or click to upload</p>
      <p class="text-sm text-slate-400 mt-1">PDF or DOCX files • Slovak/Czech language supported</p>
      <label class="mt-4 inline-block bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer">
        Choose File
        <input type="file" accept=".pdf,.docx,.doc" class="hidden" onchange={onFileInput} />
      </label>
    {/if}
  </div>

  <!-- Error -->
  {#if error}
    <div class="bg-red-50 border border-red-200 rounded-xl p-4">
      <p class="text-red-700 text-sm">{error}</p>
    </div>
  {/if}

  <!-- Parsed Results -->
  {#if clientData || projectData || workersData}
    
    <!-- Client Card -->
    {#if clientData}
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-slate-900 text-lg">🏢 Client</h3>
          {#if clientSaved}
            <a href="/clients/{clientSaved.id}" class="text-sm text-emerald-600 font-medium">✓ Saved — View Client →</a>
          {:else}
            <button onclick={saveClient} class="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Create Client</button>
          {/if}
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs text-slate-500 mb-1">Company Name</label>
            <input type="text" bind:value={clientData.company_name} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-xs text-slate-500 mb-1">Contact Person</label>
            <input type="text" bind:value={clientData.contact_person} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-xs text-slate-500 mb-1">Email</label>
            <input type="email" bind:value={clientData.contact_email} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-xs text-slate-500 mb-1">Phone</label>
            <input type="text" bind:value={clientData.contact_phone} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div class="md:col-span-2">
            <label class="block text-xs text-slate-500 mb-1">Address</label>
            <input type="text" bind:value={clientData.address} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-xs text-slate-500 mb-1">Company Size</label>
            <input type="text" bind:value={clientData.company_size} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </div>
    {/if}

    <!-- Project Card -->
    {#if projectData}
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-slate-900 text-lg">📁 Project</h3>
          {#if projectSaved}
            <a href="/projects/{projectSaved.id}" class="text-sm text-emerald-600 font-medium">✓ Saved — View Project →</a>
          {:else}
            <div class="flex items-center gap-2">
              {#if !clientSaved}
                <span class="text-xs text-amber-600">💡 Save client first to link</span>
              {/if}
              <button onclick={saveProject} class="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Create Project</button>
            </div>
          {/if}
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <label class="block text-xs text-slate-500 mb-1">Project Name</label>
            <input type="text" bind:value={projectData.name} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div class="md:col-span-2">
            <label class="block text-xs text-slate-500 mb-1">Description</label>
            <textarea bind:value={projectData.description} rows="2" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
          </div>
          <div>
            <label class="block text-xs text-slate-500 mb-1">Start Date</label>
            <input type="date" bind:value={projectData.start_date} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-xs text-slate-500 mb-1">End Date</label>
            <input type="date" bind:value={projectData.end_date} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-xs text-slate-500 mb-1">Value</label>
            <input type="number" bind:value={projectData.value} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-xs text-slate-500 mb-1">Currency</label>
            <select bind:value={projectData.currency} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="EUR">EUR</option>
              <option value="CZK">CZK</option>
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-slate-500 mb-1">Status</label>
            <select bind:value={projectData.status} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="planned">Planned</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>
    {/if}

    <!-- Workers Card -->
    {#if workersData}
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-slate-900 text-lg">👷 Workers ({workersData.length})</h3>
          <div class="flex items-center gap-2">
            <button onclick={addWorker} class="text-sm text-blue-600 hover:text-blue-700 font-medium">+ Add Worker</button>
            {#if workersSaved.length === workersData.length && workersData.length > 0}
              <span class="text-sm text-emerald-600 font-medium">✓ All Saved</span>
            {:else}
              <div class="flex items-center gap-2">
                {#if !projectSaved}
                  <span class="text-xs text-amber-600">💡 Save project first to auto-assign</span>
                {/if}
                <button onclick={saveWorkers} class="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  Create All Workers {projectSaved ? '& Assign' : ''}
                </button>
              </div>
            {/if}
          </div>
        </div>

        <div class="space-y-4">
          {#each workersData as worker, i}
            <div class="border border-slate-200 rounded-lg p-4 {workersSaved.includes(i) ? 'bg-emerald-50 border-emerald-200' : ''}">
              <div class="flex items-center justify-between mb-3">
                <span class="text-sm font-medium text-slate-700">Worker {i + 1}</span>
                <div class="flex items-center gap-2">
                  {#if workersSaved.includes(i)}
                    <span class="text-xs text-emerald-600">✓ Saved</span>
                  {/if}
                  {#if !workersSaved.includes(i)}
                    <button onclick={() => removeWorker(i)} class="text-red-400 hover:text-red-600 text-xs">✕ Remove</button>
                  {/if}
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label class="block text-xs text-slate-500 mb-1">Name</label>
                  <input type="text" bind:value={worker.name} disabled={workersSaved.includes(i)} class="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100" />
                </div>
                <div>
                  <label class="block text-xs text-slate-500 mb-1">Role</label>
                  <input type="text" bind:value={worker.role} disabled={workersSaved.includes(i)} class="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100" />
                </div>
                <div>
                  <label class="block text-xs text-slate-500 mb-1">Phone</label>
                  <input type="text" bind:value={worker.phone} disabled={workersSaved.includes(i)} class="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100" />
                </div>
                <div>
                  <label class="block text-xs text-slate-500 mb-1">Email</label>
                  <input type="text" bind:value={worker.email} disabled={workersSaved.includes(i)} class="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100" />
                </div>
                <div>
                  <label class="block text-xs text-slate-500 mb-1">Hours</label>
                  <input type="number" bind:value={worker.allocated_hours} disabled={workersSaved.includes(i)} class="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100" />
                </div>
                <div>
                  <label class="block text-xs text-slate-500 mb-1">€/hour</label>
                  <input type="number" step="0.01" bind:value={worker.hourly_rate} disabled={workersSaved.includes(i)} class="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100" />
                </div>
                <div class="md:col-span-2">
                  <label class="block text-xs text-slate-500 mb-1">Address</label>
                  <input type="text" bind:value={worker.address} disabled={workersSaved.includes(i)} class="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100" />
                </div>
                <div>
                  <label class="block text-xs text-slate-500 mb-1">Notes</label>
                  <input type="text" bind:value={worker.notes} disabled={workersSaved.includes(i)} class="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100" />
                </div>
              </div>
            </div>
          {/each}

          {#if workersData.length === 0}
            <p class="text-slate-400 text-sm text-center py-4">No workers found in contract</p>
          {/if}
        </div>
      </div>
    {/if}
  {/if}
</div>
