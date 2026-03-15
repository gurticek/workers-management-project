import db from './db.js';

export interface ProjectWorker {
	id: number;
	project_id: number;
	worker_id: number;
	role: string | null;
	allocated_hours: number | null;
	start_date: string | null;
	end_date: string | null;
	hourly_rate: number | null;
	worker_name?: string;
	worker_email?: string;
	project_name?: string;
}

export type ProjectWorkerInput = Omit<ProjectWorker, 'id' | 'worker_name' | 'worker_email' | 'project_name'>;

export function getWorkersByProject(projectId: number): ProjectWorker[] {
	return db.prepare(`SELECT pw.*, w.name as worker_name, w.email as worker_email FROM project_workers pw JOIN workers w ON pw.worker_id = w.id WHERE pw.project_id = ?`).all(projectId) as ProjectWorker[];
}

export function getProjectsByWorker(workerId: number): ProjectWorker[] {
	return db.prepare(`SELECT pw.*, p.name as project_name FROM project_workers pw JOIN projects p ON pw.project_id = p.id WHERE pw.worker_id = ?`).all(workerId) as ProjectWorker[];
}

export function assignWorker(data: ProjectWorkerInput): ProjectWorker {
	const stmt = db.prepare(`INSERT INTO project_workers (project_id, worker_id, role, allocated_hours, start_date, end_date, hourly_rate) VALUES (?, ?, ?, ?, ?, ?, ?)`);
	const result = stmt.run(data.project_id, data.worker_id, data.role, data.allocated_hours, data.start_date, data.end_date, data.hourly_rate);
	return db.prepare(`SELECT pw.*, w.name as worker_name, w.email as worker_email FROM project_workers pw JOIN workers w ON pw.worker_id = w.id WHERE pw.id = ?`).get(result.lastInsertRowid) as ProjectWorker;
}

export function removeWorker(projectId: number, workerId: number): boolean {
	const result = db.prepare('DELETE FROM project_workers WHERE project_id = ? AND worker_id = ?').run(projectId, workerId);
	return result.changes > 0;
}
