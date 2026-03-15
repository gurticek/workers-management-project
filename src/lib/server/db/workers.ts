import db from './db.js';

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

export type WorkerInput = Omit<Worker, 'id' | 'created_at'>;

export function getAllWorkers(): Worker[] {
	return db.prepare('SELECT * FROM workers ORDER BY name').all() as Worker[];
}

export function getWorkerById(id: number): Worker | undefined {
	return db.prepare('SELECT * FROM workers WHERE id = ?').get(id) as Worker | undefined;
}

export function createWorker(data: WorkerInput): Worker {
	const stmt = db.prepare(`INSERT INTO workers (name, address, phone, email, notes, photo_url) VALUES (?, ?, ?, ?, ?, ?)`);
	const result = stmt.run(data.name, data.address, data.phone, data.email, data.notes, data.photo_url);
	return getWorkerById(result.lastInsertRowid as number)!;
}

export function updateWorker(id: number, data: Partial<WorkerInput>): Worker | undefined {
	const fields = Object.keys(data).filter(k => data[k as keyof WorkerInput] !== undefined);
	if (fields.length === 0) return getWorkerById(id);
	const sets = fields.map(f => `${f} = ?`).join(', ');
	const values = fields.map(f => data[f as keyof WorkerInput]);
	db.prepare(`UPDATE workers SET ${sets} WHERE id = ?`).run(...values, id);
	return getWorkerById(id);
}

export function deleteWorker(id: number): boolean {
	const result = db.prepare('DELETE FROM workers WHERE id = ?').run(id);
	return result.changes > 0;
}

export function getWorkerCount(): number {
	return (db.prepare('SELECT COUNT(*) as c FROM workers').get() as { c: number }).c;
}

export function searchWorkers(query: string): Worker[] {
	return db.prepare(`SELECT * FROM workers WHERE name LIKE ? OR email LIKE ? ORDER BY name`).all(`%${query}%`, `%${query}%`) as Worker[];
}
