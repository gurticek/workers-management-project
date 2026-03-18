<script lang="ts">
	import { dataStore } from '$lib/stores/data.svelte';
	import type { Client, Worker, Project } from '$lib/stores/data.svelte';

	// State
	let step = $state<'upload' | 'parsing' | 'parsed' | 'error'>('upload');
	let errorMsg = $state('');
	let dragOver = $state(false);
	let fileName = $state('');

	// Parsed data
	let clientData = $state({
		company_name: '', contact_person: '', contact_email: '', contact_phone: '', address: '', company_size: '', bio: null as string | null
	});
	let projectData = $state({
		name: '', description: '', start_date: '', end_date: '', value: null as number | null, currency: 'EUR', status: 'planned' as 'planned' | 'active' | 'completed', client_id: null as number | null
	});
	let workersData = $state<Array<{
		name: string; role: string; allocated_hours: number | null; hourly_rate: number | null;
		phone: string; email: string; address: string; notes: string;
	}>>([]);

	// Save state
	let createdClient = $state<Client | null>(null);
	let createdProject = $state<Project | null>(null);
	let createdWorkers = $state<Worker[]>([]);
	let savingClient = $state(false);
	let savingProject = $state(false);
	let savingWorkers = $state(false);
	let assigningWorkers = $state(false);
	let workersAssigned = $state(false);

	async function extractText(file: File): Promise<string> {
		if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
			const pdfjsLib = await import('pdfjs-dist');
			// @ts-ignore
			pdfjsLib.GlobalWorkerOptions.workerSrc = '';
			const arrayBuffer = await file.arrayBuffer();
			const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer), useWorkerFetch: false, isEvalSupported: false, useSystemFonts: true }).promise;
			let text = '';
			for (let i = 1; i <= pdf.numPages; i++) {
				const page = await pdf.getPage(i);
				const content = await page.getTextContent();
				text += content.items.map((item: any) => item.str).join(' ') + '\n';
			}
			return text;
		} else {
			const mammoth = await import('mammoth');
			const arrayBuffer = await file.arrayBuffer();
			const result = await mammoth.extractRawText({ arrayBuffer });
			return result.value;
		}
	}

	async function handleFile(file: File) {
		const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
		const validExts = ['.pdf', '.docx'];
		if (!validTypes.includes(file.type) && !validExts.some(ext => file.name.endsWith(ext))) {
			errorMsg = 'Please upload a PDF or DOCX file.';
			step = 'error';
			return;
		}

		fileName = file.name;
		step = 'parsing';
		errorMsg = '';

		try {
			const text = await extractText(file);
			if (!text || text.trim().length < 50) {
				errorMsg = 'This appears to be a scanned document. Scanned documents are not supported yet.';
				step = 'error';
				return;
			}

			const res = await fetch('/api/parse-contract', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ text })
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || 'Failed to parse');

			clientData = { ...clientData, ...data.client };
			projectData = { ...projectData, ...data.project };
			workersData = data.workers || [];
			step = 'parsed';
		} catch (e: any) {
			errorMsg = e?.message || 'Failed to parse contract';
			step = 'error';
		}
	}

	function onDrop(e: DragEvent) {
		e.preventDefault();
		dragOver = false;
		const file = e.dataTransfer?.files[0];
		if (file) handleFile(file);
	}

	function onFileInput(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) handleFile(file);
	}

	async function saveClient() {
		savingClient = true;
		try {
			createdClient = await dataStore.createClient(clientData);
			projectData.client_id = createdClient.id;
		} catch (e: any) {
			alert('Error creating client: ' + (e?.message || e));
		}
		savingClient = false;
	}

	async function saveProject() {
		savingProject = true;
		try {
			createdProject = await dataStore.createProject(projectData);
		} catch (e: any) {
			alert('Error creating project: ' + (e?.message || e));
		}
		savingProject = false;
	}

	async function saveWorkers() {
		savingWorkers = true;
		createdWorkers = [];
		try {
			for (const w of workersData) {
				const created = await dataStore.createWorker({
					name: w.name, address: w.address || null, phone: w.phone || null,
					email: w.email || null, notes: w.notes || null, photo_url: null
				});
				createdWorkers.push(created);
			}
		} catch (e: any) {
			alert('Error creating workers: ' + (e?.message || e));
		}
		savingWorkers = false;
	}

	async function assignWorkersToProject() {
		if (!createdProject || createdWorkers.length === 0) return;
		assigningWorkers = true;
		try {
			for (let i = 0; i < createdWorkers.length; i++) {
				const w = createdWorkers[i];
				const wd = workersData[i];
				await dataStore.assignWorker({
					project_id: createdProject.id,
					worker_id: w.id,
					role: wd?.role || null,
					allocated_hours: wd?.allocated_hours || null,
					start_date: projectData.start_date || null,
					end_date: projectData.end_date || null,
					hourly_rate: wd?.hourly_rate || null
				});
			}
			workersAssigned = true;
		} catch (e: any) {
			alert('Error assigning workers: ' + (e?.message || e));
		}
		assigningWorkers = false;
	}

	function reset() {
		step = 'upload';
		errorMsg = '';
		fileName = '';
		createdClient = null;
		createdProject = null;
		createdWorkers = [];
		workersAssigned = false;
	}
</script>

<div class="max-w-4xl mx-auto space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold text-text-primary">📄 Upload Contract</h1>
		{#if step !== 'upload'}
			<button onclick={reset} class="text-sm text-accent hover:underline">← Upload another</button>
		{/if}
	</div>

	<!-- Upload Area -->
	{#if step === 'upload' || step === 'error'}
		<div
			class="bg-surface rounded-xl shadow-sm border-2 border-dashed p-12 text-center transition-colors cursor-pointer {dragOver ? 'border-accent bg-accent/5' : 'border-border'}"
			role="button"
			tabindex="0"
			ondragover={(e) => { e.preventDefault(); dragOver = true; }}
			ondragleave={() => dragOver = false}
			ondrop={onDrop}
			onclick={() => document.getElementById('file-input')?.click()}
			onkeydown={(e) => { if (e.key === 'Enter') document.getElementById('file-input')?.click(); }}
		>
			<div class="text-5xl mb-4">📄</div>
			<p class="text-lg font-medium text-text-primary mb-2">Drop a contract here or click to upload</p>
			<p class="text-sm text-text-muted">Supports PDF and DOCX files</p>
			<input id="file-input" type="file" accept=".pdf,.docx" class="hidden" onchange={onFileInput} />
		</div>
		{#if errorMsg}
			<div class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">{errorMsg}</div>
		{/if}
	{/if}

	<!-- Parsing -->
	{#if step === 'parsing'}
		<div class="bg-surface rounded-xl shadow-sm border border-border p-12 text-center">
			<div class="inline-block animate-spin text-4xl mb-4">⚙️</div>
			<p class="text-lg font-medium text-text-primary">Parsing {fileName}...</p>
			<p class="text-sm text-text-muted mt-2">Extracting text and analyzing with AI</p>
		</div>
	{/if}

	<!-- Parsed Results -->
	{#if step === 'parsed'}
		<!-- Client Card -->
		<div class="bg-surface rounded-xl shadow-sm border border-border p-6">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-lg font-semibold text-text-primary">🏢 Client</h2>
				{#if createdClient}
					<a href="/clients/{createdClient.id}" class="text-sm text-green-600 font-medium">✓ Created — View →</a>
				{/if}
			</div>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label class="block text-sm font-medium text-text-secondary mb-1">Company Name</label>
					<input bind:value={clientData.company_name} class="w-full rounded-lg border border-border px-3 py-2 text-sm bg-surface-alt" />
				</div>
				<div>
					<label class="block text-sm font-medium text-text-secondary mb-1">Contact Person</label>
					<input bind:value={clientData.contact_person} class="w-full rounded-lg border border-border px-3 py-2 text-sm bg-surface-alt" />
				</div>
				<div>
					<label class="block text-sm font-medium text-text-secondary mb-1">Email</label>
					<input bind:value={clientData.contact_email} class="w-full rounded-lg border border-border px-3 py-2 text-sm bg-surface-alt" />
				</div>
				<div>
					<label class="block text-sm font-medium text-text-secondary mb-1">Phone</label>
					<input bind:value={clientData.contact_phone} class="w-full rounded-lg border border-border px-3 py-2 text-sm bg-surface-alt" />
				</div>
				<div>
					<label class="block text-sm font-medium text-text-secondary mb-1">Address</label>
					<input bind:value={clientData.address} class="w-full rounded-lg border border-border px-3 py-2 text-sm bg-surface-alt" />
				</div>
				<div>
					<label class="block text-sm font-medium text-text-secondary mb-1">Company Size</label>
					<input bind:value={clientData.company_size} class="w-full rounded-lg border border-border px-3 py-2 text-sm bg-surface-alt" />
				</div>
			</div>
			{#if !createdClient}
				<button onclick={saveClient} disabled={savingClient} class="mt-4 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 disabled:opacity-50">
					{savingClient ? 'Creating...' : 'Create Client'}
				</button>
			{/if}
		</div>

		<!-- Project Card -->
		<div class="bg-surface rounded-xl shadow-sm border border-border p-6">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-lg font-semibold text-text-primary">📁 Project</h2>
				{#if createdProject}
					<a href="/projects/{createdProject.id}" class="text-sm text-green-600 font-medium">✓ Created — View →</a>
				{/if}
			</div>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div class="md:col-span-2">
					<label class="block text-sm font-medium text-text-secondary mb-1">Name</label>
					<input bind:value={projectData.name} class="w-full rounded-lg border border-border px-3 py-2 text-sm bg-surface-alt" />
				</div>
				<div class="md:col-span-2">
					<label class="block text-sm font-medium text-text-secondary mb-1">Description</label>
					<textarea bind:value={projectData.description} rows="2" class="w-full rounded-lg border border-border px-3 py-2 text-sm bg-surface-alt"></textarea>
				</div>
				<div>
					<label class="block text-sm font-medium text-text-secondary mb-1">Client</label>
					<select bind:value={projectData.client_id} class="w-full rounded-lg border border-border px-3 py-2 text-sm bg-surface-alt">
						<option value={null}>— None —</option>
						{#each dataStore.getAllClients() as c}
							<option value={c.id}>{c.company_name}</option>
						{/each}
					</select>
				</div>
				<div>
					<label class="block text-sm font-medium text-text-secondary mb-1">Status</label>
					<select bind:value={projectData.status} class="w-full rounded-lg border border-border px-3 py-2 text-sm bg-surface-alt">
						<option value="planned">Planned</option>
						<option value="active">Active</option>
						<option value="completed">Completed</option>
					</select>
				</div>
				<div>
					<label class="block text-sm font-medium text-text-secondary mb-1">Start Date</label>
					<input type="date" bind:value={projectData.start_date} class="w-full rounded-lg border border-border px-3 py-2 text-sm bg-surface-alt" />
				</div>
				<div>
					<label class="block text-sm font-medium text-text-secondary mb-1">End Date</label>
					<input type="date" bind:value={projectData.end_date} class="w-full rounded-lg border border-border px-3 py-2 text-sm bg-surface-alt" />
				</div>
				<div>
					<label class="block text-sm font-medium text-text-secondary mb-1">Value</label>
					<input type="number" bind:value={projectData.value} class="w-full rounded-lg border border-border px-3 py-2 text-sm bg-surface-alt" />
				</div>
				<div>
					<label class="block text-sm font-medium text-text-secondary mb-1">Currency</label>
					<input bind:value={projectData.currency} class="w-full rounded-lg border border-border px-3 py-2 text-sm bg-surface-alt" />
				</div>
			</div>
			{#if !createdProject}
				<button onclick={saveProject} disabled={savingProject} class="mt-4 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 disabled:opacity-50">
					{savingProject ? 'Creating...' : 'Create Project'}
				</button>
			{/if}
		</div>

		<!-- Workers Card -->
		<div class="bg-surface rounded-xl shadow-sm border border-border p-6">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-lg font-semibold text-text-primary">👷 Workers ({workersData.length})</h2>
				{#if createdWorkers.length > 0}
					<span class="text-sm text-green-600 font-medium">✓ {createdWorkers.length} created</span>
				{/if}
			</div>
			{#if workersData.length === 0}
				<p class="text-text-muted text-sm">No workers found in contract.</p>
			{:else}
				<div class="space-y-4">
					{#each workersData as worker, i}
						<div class="border border-border rounded-lg p-4 bg-surface-alt">
							<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
								<div>
									<label class="block text-xs font-medium text-text-secondary mb-1">Name</label>
									<input bind:value={worker.name} class="w-full rounded-lg border border-border px-3 py-1.5 text-sm bg-surface" />
								</div>
								<div>
									<label class="block text-xs font-medium text-text-secondary mb-1">Role</label>
									<input bind:value={worker.role} class="w-full rounded-lg border border-border px-3 py-1.5 text-sm bg-surface" />
								</div>
								<div>
									<label class="block text-xs font-medium text-text-secondary mb-1">Email</label>
									<input bind:value={worker.email} class="w-full rounded-lg border border-border px-3 py-1.5 text-sm bg-surface" />
								</div>
								<div>
									<label class="block text-xs font-medium text-text-secondary mb-1">Phone</label>
									<input bind:value={worker.phone} class="w-full rounded-lg border border-border px-3 py-1.5 text-sm bg-surface" />
								</div>
								<div>
									<label class="block text-xs font-medium text-text-secondary mb-1">Allocated Hours</label>
									<input type="number" bind:value={worker.allocated_hours} class="w-full rounded-lg border border-border px-3 py-1.5 text-sm bg-surface" />
								</div>
								<div>
									<label class="block text-xs font-medium text-text-secondary mb-1">Hourly Rate</label>
									<input type="number" bind:value={worker.hourly_rate} class="w-full rounded-lg border border-border px-3 py-1.5 text-sm bg-surface" />
								</div>
								<div>
									<label class="block text-xs font-medium text-text-secondary mb-1">Address</label>
									<input bind:value={worker.address} class="w-full rounded-lg border border-border px-3 py-1.5 text-sm bg-surface" />
								</div>
								<div>
									<label class="block text-xs font-medium text-text-secondary mb-1">Notes</label>
									<input bind:value={worker.notes} class="w-full rounded-lg border border-border px-3 py-1.5 text-sm bg-surface" />
								</div>
							</div>
						</div>
					{/each}
				</div>
				{#if createdWorkers.length === 0}
					<button onclick={saveWorkers} disabled={savingWorkers} class="mt-4 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 disabled:opacity-50">
						{savingWorkers ? 'Creating...' : 'Create All Workers'}
					</button>
				{/if}
			{/if}

			{#if createdProject && createdWorkers.length > 0 && !workersAssigned}
				<button onclick={assignWorkersToProject} disabled={assigningWorkers} class="mt-4 ml-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
					{assigningWorkers ? 'Assigning...' : `Assign Workers to ${createdProject.name}`}
				</button>
			{/if}
			{#if workersAssigned}
				<p class="mt-3 text-sm text-green-600 font-medium">✓ Workers assigned to project</p>
			{/if}
		</div>
	{/if}
</div>
