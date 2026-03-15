// Client-side data store using Svelte 5 runes + localStorage

export interface Worker {
	id: number;
	name: string;
	address: string | null;
	phone: string | null;
	email: string | null;
	notes: string | null;
	photo_url: string | null;
	created_at: string;
}

export interface Client {
	id: number;
	company_name: string;
	contact_person: string | null;
	contact_email: string | null;
	contact_phone: string | null;
	address: string | null;
	company_size: string | null;
	bio: string | null;
	created_at: string;
}

export interface Project {
	id: number;
	name: string;
	description: string | null;
	client_id: number | null;
	start_date: string | null;
	end_date: string | null;
	value: number | null;
	currency: string;
	status: 'planned' | 'active' | 'completed';
	created_at: string;
}

export interface ProjectWorker {
	id: number;
	project_id: number;
	worker_id: number;
	role: string | null;
	allocated_hours: number | null;
	start_date: string | null;
	end_date: string | null;
	hourly_rate: number | null;
}

const SEED_WORKERS: Worker[] = [
	{ id: 1, name: 'Marek Novák', address: 'Obchodná 12, 811 06 Bratislava', phone: '+421 903 111 222', email: 'marek.novak@email.com', notes: 'Experienced assembly line worker. 5 years in automotive manufacturing.', photo_url: null, created_at: '2025-09-01T08:00:00' },
	{ id: 2, name: 'Tomáš Kováč', address: 'Hlavná 45, 040 01 Košice', phone: '+421 907 333 444', email: 'tomas.kovac@email.com', notes: 'Specialized in robotic welding stations. Team lead.', photo_url: null, created_at: '2025-10-15T08:00:00' },
	{ id: 3, name: 'Jakub Dvořák', address: 'Václavské nám. 8, 110 00 Prague', phone: '+420 602 555 666', email: 'jakub.dvorak@email.com', notes: 'Quality control specialist. Certified ISO 9001 auditor.', photo_url: null, created_at: '2025-11-01T08:00:00' }
];

const SEED_CLIENTS: Client[] = [
	{ id: 1, company_name: 'BMW Manufacturing', contact_person: 'Hans Müller', contact_email: 'h.muller@bmw.de', contact_phone: '+49 89 382 0', address: 'Petuelring 130, 80788 München', company_size: '10000+', bio: 'BMW Group manufacturing division. Premium automobile production.', created_at: '2025-08-01T08:00:00' },
	{ id: 2, company_name: 'Magna Steyr', contact_person: 'Franz Gruber', contact_email: 'f.gruber@magna.com', contact_phone: '+43 316 404 0', address: 'Liebenauer Hauptstr. 317, 8041 Graz', company_size: '1000-5000', bio: 'Contract manufacturer for complete vehicle assembly. Part of Magna International.', created_at: '2025-08-15T08:00:00' }
];

const SEED_PROJECTS: Project[] = [
	{ id: 1, name: 'BMW i4 Assembly Line Extension', description: 'Extension of the i4 electric vehicle assembly line with new robotic welding and painting stations in Munich plant.', client_id: 1, start_date: '2026-01-15', end_date: '2026-08-30', value: 450000, currency: 'EUR', status: 'active', created_at: '2025-12-01T08:00:00' },
	{ id: 2, name: 'Magna Steyr New Paint Line', description: 'Installation of a new environmentally-friendly paint line at Graz facility with water-based coating systems.', client_id: 2, start_date: '2026-04-01', end_date: '2026-10-31', value: 280000, currency: 'EUR', status: 'planned', created_at: '2026-01-10T08:00:00' }
];

const SEED_PROJECT_WORKERS: ProjectWorker[] = [
	{ id: 1, project_id: 1, worker_id: 1, role: 'Assembly Line Technician', allocated_hours: 500, start_date: '2026-01-15', end_date: '2026-08-30', hourly_rate: 35 },
	{ id: 2, project_id: 1, worker_id: 2, role: 'Welding Station Lead', allocated_hours: 450, start_date: '2026-02-01', end_date: '2026-08-30', hourly_rate: 42 },
	{ id: 3, project_id: 1, worker_id: 3, role: 'Quality Inspector', allocated_hours: 200, start_date: '2026-03-01', end_date: '2026-08-30', hourly_rate: 38 },
	{ id: 4, project_id: 2, worker_id: 1, role: 'Paint Line Installer', allocated_hours: 350, start_date: '2026-04-01', end_date: '2026-10-31', hourly_rate: 35 },
	{ id: 5, project_id: 2, worker_id: 2, role: 'Technical Supervisor', allocated_hours: 300, start_date: '2026-04-01', end_date: '2026-10-31', hourly_rate: 42 }
];

function loadFromStorage<T>(key: string, seed: T[]): T[] {
	if (typeof window === 'undefined') return seed;
	try {
		const stored = localStorage.getItem(key);
		if (stored) return JSON.parse(stored);
	} catch {}
	localStorage.setItem(key, JSON.stringify(seed));
	return [...seed];
}

function nextId<T extends { id: number }>(items: T[]): number {
	return items.length === 0 ? 1 : Math.max(...items.map(i => i.id)) + 1;
}

class DataStore {
	workers = $state<Worker[]>([]);
	clients = $state<Client[]>([]);
	projects = $state<Project[]>([]);
	projectWorkers = $state<ProjectWorker[]>([]);
	initialized = $state(false);

	init() {
		if (this.initialized) return;
		this.workers = loadFromStorage('wm_workers', SEED_WORKERS);
		this.clients = loadFromStorage('wm_clients', SEED_CLIENTS);
		this.projects = loadFromStorage('wm_projects', SEED_PROJECTS);
		this.projectWorkers = loadFromStorage('wm_project_workers', SEED_PROJECT_WORKERS);
		this.initialized = true;
	}

	private save() {
		if (typeof window === 'undefined') return;
		localStorage.setItem('wm_workers', JSON.stringify(this.workers));
		localStorage.setItem('wm_clients', JSON.stringify(this.clients));
		localStorage.setItem('wm_projects', JSON.stringify(this.projects));
		localStorage.setItem('wm_project_workers', JSON.stringify(this.projectWorkers));
	}

	// Workers
	getAllWorkers(): Worker[] { return this.workers.sort((a, b) => a.name.localeCompare(b.name)); }
	getWorkerById(id: number): Worker | undefined { return this.workers.find(w => w.id === id); }
	createWorker(data: Omit<Worker, 'id' | 'created_at'>): Worker {
		const w: Worker = { ...data, id: nextId(this.workers), created_at: new Date().toISOString() };
		this.workers.push(w);
		this.save();
		return w;
	}
	updateWorker(id: number, data: Partial<Worker>): Worker | undefined {
		const i = this.workers.findIndex(w => w.id === id);
		if (i === -1) return undefined;
		this.workers[i] = { ...this.workers[i], ...data };
		this.save();
		return this.workers[i];
	}
	deleteWorker(id: number): boolean {
		const len = this.workers.length;
		this.workers = this.workers.filter(w => w.id !== id);
		this.projectWorkers = this.projectWorkers.filter(pw => pw.worker_id !== id);
		this.save();
		return this.workers.length < len;
	}

	// Clients
	getAllClients(): Client[] { return this.clients.sort((a, b) => a.company_name.localeCompare(b.company_name)); }
	getClientById(id: number): Client | undefined { return this.clients.find(c => c.id === id); }
	createClient(data: Omit<Client, 'id' | 'created_at'>): Client {
		const c: Client = { ...data, id: nextId(this.clients), created_at: new Date().toISOString() };
		this.clients.push(c);
		this.save();
		return c;
	}
	updateClient(id: number, data: Partial<Client>): Client | undefined {
		const i = this.clients.findIndex(c => c.id === id);
		if (i === -1) return undefined;
		this.clients[i] = { ...this.clients[i], ...data };
		this.save();
		return this.clients[i];
	}
	deleteClient(id: number): boolean {
		const len = this.clients.length;
		this.clients = this.clients.filter(c => c.id !== id);
		this.save();
		return this.clients.length < len;
	}

	// Projects
	getAllProjects(): (Project & { client_name?: string })[] {
		return this.projects.map(p => ({
			...p,
			client_name: this.clients.find(c => c.id === p.client_id)?.company_name
		})).sort((a, b) => b.created_at.localeCompare(a.created_at));
	}
	getProjectById(id: number): (Project & { client_name?: string }) | undefined {
		const p = this.projects.find(p => p.id === id);
		if (!p) return undefined;
		return { ...p, client_name: this.clients.find(c => c.id === p.client_id)?.company_name };
	}
	createProject(data: Omit<Project, 'id' | 'created_at'>): Project {
		const p: Project = { ...data, id: nextId(this.projects), created_at: new Date().toISOString() };
		this.projects.push(p);
		this.save();
		return p;
	}
	updateProject(id: number, data: Partial<Project>): Project | undefined {
		const i = this.projects.findIndex(p => p.id === id);
		if (i === -1) return undefined;
		this.projects[i] = { ...this.projects[i], ...data };
		this.save();
		return this.projects[i];
	}
	deleteProject(id: number): boolean {
		const len = this.projects.length;
		this.projects = this.projects.filter(p => p.id !== id);
		this.projectWorkers = this.projectWorkers.filter(pw => pw.project_id !== id);
		this.save();
		return this.projects.length < len;
	}

	// Project Workers
	getWorkersByProject(projectId: number): (ProjectWorker & { worker_name?: string; worker_email?: string })[] {
		return this.projectWorkers.filter(pw => pw.project_id === projectId).map(pw => {
			const w = this.workers.find(w => w.id === pw.worker_id);
			return { ...pw, worker_name: w?.name, worker_email: w?.email };
		});
	}
	getProjectsByWorker(workerId: number): (ProjectWorker & { project_name?: string })[] {
		return this.projectWorkers.filter(pw => pw.worker_id === workerId).map(pw => {
			const p = this.projects.find(p => p.id === pw.project_id);
			return { ...pw, project_name: p?.name };
		});
	}
	assignWorker(data: Omit<ProjectWorker, 'id'>): ProjectWorker {
		const pw: ProjectWorker = { ...data, id: nextId(this.projectWorkers) };
		this.projectWorkers.push(pw);
		this.save();
		return pw;
	}
	removeWorkerFromProject(projectId: number, workerId: number): boolean {
		const len = this.projectWorkers.length;
		this.projectWorkers = this.projectWorkers.filter(pw => !(pw.project_id === projectId && pw.worker_id === workerId));
		this.save();
		return this.projectWorkers.length < len;
	}
}

export const dataStore = new DataStore();
