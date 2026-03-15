import db from './db.js';

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
	client_name?: string;
}

export type ProjectInput = Omit<Project, 'id' | 'created_at' | 'client_name'>;

export function getAllProjects(): Project[] {
	return db.prepare(`SELECT p.*, c.company_name as client_name FROM projects p LEFT JOIN clients c ON p.client_id = c.id ORDER BY p.created_at DESC`).all() as Project[];
}

export function getProjectById(id: number): Project | undefined {
	return db.prepare(`SELECT p.*, c.company_name as client_name FROM projects p LEFT JOIN clients c ON p.client_id = c.id WHERE p.id = ?`).get(id) as Project | undefined;
}

export function getProjectsByClientId(clientId: number): Project[] {
	return db.prepare(`SELECT * FROM projects WHERE client_id = ? ORDER BY created_at DESC`).all(clientId) as Project[];
}

export function createProject(data: ProjectInput): Project {
	const stmt = db.prepare(`INSERT INTO projects (name, description, client_id, start_date, end_date, value, currency, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
	const result = stmt.run(data.name, data.description, data.client_id, data.start_date, data.end_date, data.value, data.currency || 'EUR', data.status || 'planned');
	return getProjectById(result.lastInsertRowid as number)!;
}

export function updateProject(id: number, data: Partial<ProjectInput>): Project | undefined {
	const fields = Object.keys(data).filter(k => data[k as keyof ProjectInput] !== undefined);
	if (fields.length === 0) return getProjectById(id);
	const sets = fields.map(f => `${f} = ?`).join(', ');
	const values = fields.map(f => data[f as keyof ProjectInput]);
	db.prepare(`UPDATE projects SET ${sets} WHERE id = ?`).run(...values, id);
	return getProjectById(id);
}

export function deleteProject(id: number): boolean {
	const result = db.prepare('DELETE FROM projects WHERE id = ?').run(id);
	return result.changes > 0;
}

export function getActiveProjectCount(): number {
	return (db.prepare("SELECT COUNT(*) as c FROM projects WHERE status = 'active'").get() as { c: number }).c;
}

export function getProjectCount(): number {
	return (db.prepare('SELECT COUNT(*) as c FROM projects').get() as { c: number }).c;
}
