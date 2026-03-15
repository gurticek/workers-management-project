// Client-side data store using Svelte 5 runes + Supabase

import { supabase } from '$lib/supabase';

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

class DataStore {
	workers = $state<Worker[]>([]);
	clients = $state<Client[]>([]);
	projects = $state<Project[]>([]);
	projectWorkers = $state<ProjectWorker[]>([]);
	initialized = $state(false);

	async init() {
		if (this.initialized) return;
		console.log('[DataStore] Starting init...');
		const [w, c, p, pw] = await Promise.all([
			supabase.from('workers').select('*'),
			supabase.from('clients').select('*'),
			supabase.from('projects').select('*'),
			supabase.from('project_workers').select('*')
		]);
		console.log('[DataStore] workers:', w.error || w.data?.length + ' rows');
		console.log('[DataStore] clients:', c.error || c.data?.length + ' rows');
		console.log('[DataStore] projects:', p.error || p.data?.length + ' rows');
		console.log('[DataStore] project_workers:', pw.error || pw.data?.length + ' rows');
		if (w.error) throw new Error('Failed to load workers: ' + w.error.message);
		if (c.error) throw new Error('Failed to load clients: ' + c.error.message);
		if (p.error) throw new Error('Failed to load projects: ' + p.error.message);
		if (pw.error) throw new Error('Failed to load project_workers: ' + pw.error.message);
		this.workers = w.data ?? [];
		this.clients = c.data ?? [];
		this.projects = p.data ?? [];
		this.projectWorkers = pw.data ?? [];
		this.initialized = true;
		console.log('[DataStore] Init complete');
	}

	// Workers
	getAllWorkers(): Worker[] { return this.workers.sort((a, b) => a.name.localeCompare(b.name)); }
	getWorkerById(id: number): Worker | undefined { return this.workers.find(w => w.id === id); }
	async createWorker(data: Omit<Worker, 'id' | 'created_at'>): Promise<Worker> {
		const { data: rows, error } = await supabase.from('workers').insert(data).select().single();
		if (error) throw error;
		const w = rows as Worker;
		this.workers.push(w);
		return w;
	}
	async updateWorker(id: number, data: Partial<Worker>): Promise<Worker | undefined> {
		const { data: rows, error } = await supabase.from('workers').update(data).eq('id', id).select().single();
		if (error) throw error;
		const i = this.workers.findIndex(w => w.id === id);
		if (i !== -1) this.workers[i] = rows as Worker;
		return rows as Worker;
	}
	async deleteWorker(id: number): Promise<boolean> {
		const { error } = await supabase.from('workers').delete().eq('id', id);
		if (error) throw error;
		this.workers = this.workers.filter(w => w.id !== id);
		this.projectWorkers = this.projectWorkers.filter(pw => pw.worker_id !== id);
		return true;
	}

	// Clients
	getAllClients(): Client[] { return this.clients.sort((a, b) => a.company_name.localeCompare(b.company_name)); }
	getClientById(id: number): Client | undefined { return this.clients.find(c => c.id === id); }
	async createClient(data: Omit<Client, 'id' | 'created_at'>): Promise<Client> {
		const { data: rows, error } = await supabase.from('clients').insert(data).select().single();
		if (error) throw error;
		const c = rows as Client;
		this.clients.push(c);
		return c;
	}
	async updateClient(id: number, data: Partial<Client>): Promise<Client | undefined> {
		const { data: rows, error } = await supabase.from('clients').update(data).eq('id', id).select().single();
		if (error) throw error;
		const i = this.clients.findIndex(c => c.id === id);
		if (i !== -1) this.clients[i] = rows as Client;
		return rows as Client;
	}
	async deleteClient(id: number): Promise<boolean> {
		const { error } = await supabase.from('clients').delete().eq('id', id);
		if (error) throw error;
		this.clients = this.clients.filter(c => c.id !== id);
		return true;
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
	async createProject(data: Omit<Project, 'id' | 'created_at'>): Promise<Project> {
		const { data: rows, error } = await supabase.from('projects').insert(data).select().single();
		if (error) throw error;
		const p = rows as Project;
		this.projects.push(p);
		return p;
	}
	async updateProject(id: number, data: Partial<Project>): Promise<Project | undefined> {
		const { data: rows, error } = await supabase.from('projects').update(data).eq('id', id).select().single();
		if (error) throw error;
		const i = this.projects.findIndex(p => p.id === id);
		if (i !== -1) this.projects[i] = rows as Project;
		return rows as Project;
	}
	async deleteProject(id: number): Promise<boolean> {
		const { error } = await supabase.from('projects').delete().eq('id', id);
		if (error) throw error;
		this.projects = this.projects.filter(p => p.id !== id);
		this.projectWorkers = this.projectWorkers.filter(pw => pw.project_id !== id);
		return true;
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
	getUnassignedWorkers(projectId: number): Worker[] {
		const assignedIds = new Set(this.projectWorkers.filter(pw => pw.project_id === projectId).map(pw => pw.worker_id));
		return this.workers.filter(w => !assignedIds.has(w.id));
	}
	async assignWorker(data: Omit<ProjectWorker, 'id'>): Promise<ProjectWorker> {
		const { data: rows, error } = await supabase.from('project_workers').insert(data).select().single();
		if (error) throw error;
		const pw = rows as ProjectWorker;
		this.projectWorkers.push(pw);
		return pw;
	}
	async removeWorkerFromProject(projectId: number, workerId: number): Promise<boolean> {
		const { error } = await supabase.from('project_workers').delete().eq('project_id', projectId).eq('worker_id', workerId);
		if (error) throw error;
		this.projectWorkers = this.projectWorkers.filter(pw => !(pw.project_id === projectId && pw.worker_id === workerId));
		return true;
	}
}

export const dataStore = new DataStore();
