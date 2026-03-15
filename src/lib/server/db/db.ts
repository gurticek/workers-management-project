import Database from 'better-sqlite3';
import { resolve } from 'path';
import { mkdirSync } from 'fs';

const DB_PATH = resolve('data/app.db');
mkdirSync(resolve('data'), { recursive: true });

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
	CREATE TABLE IF NOT EXISTS clients (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		company_name TEXT NOT NULL,
		contact_person TEXT,
		contact_email TEXT,
		contact_phone TEXT,
		address TEXT,
		company_size TEXT,
		bio TEXT,
		created_at TEXT DEFAULT (datetime('now'))
	);

	CREATE TABLE IF NOT EXISTS workers (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		address TEXT,
		phone TEXT,
		email TEXT,
		notes TEXT,
		photo_url TEXT,
		created_at TEXT DEFAULT (datetime('now'))
	);

	CREATE TABLE IF NOT EXISTS projects (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		description TEXT,
		client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
		start_date TEXT,
		end_date TEXT,
		value REAL,
		currency TEXT DEFAULT 'EUR',
		status TEXT DEFAULT 'planned' CHECK(status IN ('planned', 'active', 'completed')),
		created_at TEXT DEFAULT (datetime('now'))
	);

	CREATE TABLE IF NOT EXISTS project_workers (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
		worker_id INTEGER NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
		role TEXT,
		allocated_hours REAL,
		start_date TEXT,
		end_date TEXT,
		hourly_rate REAL,
		UNIQUE(project_id, worker_id)
	);
`);

// Seed data if tables are empty
const count = db.prepare('SELECT COUNT(*) as c FROM clients').get() as { c: number };
if (count.c === 0) {
	db.exec(`
		INSERT INTO clients (company_name, contact_person, contact_email, contact_phone, address, company_size, bio) VALUES
		('Acme Corporation', 'John Smith', 'john@acme.com', '+49 170 1234567', 'Berliner Str. 42, 10115 Berlin', '50-100', 'Leading manufacturing company specializing in industrial equipment.'),
		('TechVentures GmbH', 'Anna Mueller', 'anna@techventures.de', '+49 171 9876543', 'Hauptstr. 15, 80331 München', '10-50', 'Innovative tech startup focused on AI-driven solutions.');

		INSERT INTO workers (name, address, phone, email, notes) VALUES
		('Maria Garcia', 'Friedrichstr. 100, 10117 Berlin', '+49 172 1111111', 'maria.garcia@email.com', 'Senior developer with 8 years experience. Specializes in frontend.'),
		('Thomas Weber', 'Leopoldstr. 25, 80802 München', '+49 173 2222222', 'thomas.weber@email.com', 'Project manager. PMP certified. Great with client communication.'),
		('Sarah Chen', 'Königsallee 50, 40212 Düsseldorf', '+49 174 3333333', 'sarah.chen@email.com', 'Full-stack developer. Expert in Node.js and Python.');

		INSERT INTO projects (name, description, client_id, start_date, end_date, value, currency, status) VALUES
		('Website Redesign', 'Complete overhaul of corporate website with modern design and improved UX', 1, '2026-01-15', '2026-06-30', 45000, 'EUR', 'active'),
		('AI Dashboard', 'Build an AI-powered analytics dashboard for internal use', 2, '2026-03-01', '2026-09-30', 72000, 'EUR', 'planned');

		INSERT INTO project_workers (project_id, worker_id, role, allocated_hours, start_date, end_date, hourly_rate) VALUES
		(1, 1, 'Lead Frontend Developer', 400, '2026-01-15', '2026-06-30', 85),
		(1, 2, 'Project Manager', 200, '2026-01-15', '2026-06-30', 95),
		(2, 3, 'Full-Stack Developer', 600, '2026-03-01', '2026-09-30', 90),
		(2, 2, 'Project Manager', 150, '2026-03-01', '2026-09-30', 95);
	`);
}

export default db;
