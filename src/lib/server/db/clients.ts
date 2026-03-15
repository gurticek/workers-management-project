import db from './db.js';

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

export type ClientInput = Omit<Client, 'id' | 'created_at'>;

export function getAllClients(): Client[] {
	return db.prepare('SELECT * FROM clients ORDER BY company_name').all() as Client[];
}

export function getClientById(id: number): Client | undefined {
	return db.prepare('SELECT * FROM clients WHERE id = ?').get(id) as Client | undefined;
}

export function createClient(data: ClientInput): Client {
	const stmt = db.prepare(`INSERT INTO clients (company_name, contact_person, contact_email, contact_phone, address, company_size, bio) VALUES (?, ?, ?, ?, ?, ?, ?)`);
	const result = stmt.run(data.company_name, data.contact_person, data.contact_email, data.contact_phone, data.address, data.company_size, data.bio);
	return getClientById(result.lastInsertRowid as number)!;
}

export function updateClient(id: number, data: Partial<ClientInput>): Client | undefined {
	const fields = Object.keys(data).filter(k => data[k as keyof ClientInput] !== undefined);
	if (fields.length === 0) return getClientById(id);
	const sets = fields.map(f => `${f} = ?`).join(', ');
	const values = fields.map(f => data[f as keyof ClientInput]);
	db.prepare(`UPDATE clients SET ${sets} WHERE id = ?`).run(...values, id);
	return getClientById(id);
}

export function deleteClient(id: number): boolean {
	const result = db.prepare('DELETE FROM clients WHERE id = ?').run(id);
	return result.changes > 0;
}

export function getClientCount(): number {
	return (db.prepare('SELECT COUNT(*) as c FROM clients').get() as { c: number }).c;
}
