import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'db.jertmzmngcocfzvprvsb.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'vaqsA3-tywges-ziqkem',
  ssl: { rejectUnauthorized: false }
});

await client.connect();

await client.query(`
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    company_name TEXT NOT NULL,
    contact_person TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    company_size TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    notes TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    start_date DATE,
    end_date DATE,
    value REAL,
    currency TEXT DEFAULT 'EUR',
    status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_workers (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    worker_id INTEGER REFERENCES workers(id) ON DELETE CASCADE,
    role TEXT,
    allocated_hours REAL,
    start_date DATE,
    end_date DATE,
    hourly_rate REAL
);

-- RLS policies
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_workers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all' AND tablename = 'clients') THEN
    CREATE POLICY "Allow all" ON clients FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all' AND tablename = 'workers') THEN
    CREATE POLICY "Allow all" ON workers FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all' AND tablename = 'projects') THEN
    CREATE POLICY "Allow all" ON projects FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all' AND tablename = 'project_workers') THEN
    CREATE POLICY "Allow all" ON project_workers FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
`);

console.log('Tables created.');

// Seed data only if empty
const { rows } = await client.query('SELECT count(*) FROM clients');
if (parseInt(rows[0].count) === 0) {
  await client.query(`
INSERT INTO clients (company_name, contact_person, contact_email, contact_phone, address, company_size, bio) VALUES
('BMW Manufacturing GmbH', 'Hans Mueller', 'h.mueller@bmw.de', '+49 89 382 0', 'Petuelring 130, 80788 Munich, Germany', 'Enterprise (120,000+)', 'BMW Group is a leading manufacturer of premium automobiles and motorcycles.'),
('Magna Steyr AG', 'Klaus Weber', 'k.weber@magna.com', '+43 316 404 0', 'Liebenauer Hauptstraße 317, 8041 Graz, Austria', 'Large (10,000+)', 'Magna Steyr is the world''s largest contract manufacturer of automobiles.');

INSERT INTO workers (name, address, phone, email, notes) VALUES
('Marek Novák', 'Obchodná 14, 811 06 Bratislava, Slovakia', '+421 905 123 456', 'marek.novak@email.sk', 'Experienced assembly line technician. 8 years experience. Electrical certification (EFK). German B2.'),
('Tomáš Kováč', 'Hlavná 22, 040 01 Košice, Slovakia', '+421 911 234 567', 'tomas.kovac@email.sk', 'Mechanical assembly specialist. 5 years experience. Hydraulics and pneumatics certified. German B1.'),
('Jakub Dvořák', 'Václavské náměstí 1, 110 00 Prague, Czech Republic', '+420 602 345 678', 'jakub.dvorak@email.cz', 'Senior assembly technician and team lead. 12 years experience. Electrical + PLC programming. German C1.');

INSERT INTO projects (name, description, client_id, start_date, end_date, value, currency, status) VALUES
('BMW i4 Assembly Line Extension', 'Extension of the i4 production line at BMW Plant Munich. Installation of new robotic welding stations and conveyor systems.', 1, '2026-02-01', '2026-08-31', 450000, 'EUR', 'active'),
('Magna Steyr New Paint Line', 'Installation of a new automated paint line at the Graz facility for the upcoming contract manufacturing project.', 2, '2026-06-01', '2026-12-31', 280000, 'EUR', 'planned');

INSERT INTO project_workers (project_id, worker_id, role, allocated_hours, start_date, end_date, hourly_rate) VALUES
(1, 1, 'Electrical Technician', 960, '2026-02-01', '2026-08-31', 28.50),
(1, 3, 'Team Lead / PLC Programmer', 960, '2026-02-01', '2026-08-31', 35.00),
(2, 2, 'Mechanical Assembly', 720, '2026-06-01', '2026-12-31', 25.00),
(2, 1, 'Electrical Technician', 720, '2026-06-01', '2026-12-31', 28.50);
  `);
  console.log('Seed data inserted.');
} else {
  console.log('Data already exists, skipping seed.');
}

await client.end();
console.log('Done!');
