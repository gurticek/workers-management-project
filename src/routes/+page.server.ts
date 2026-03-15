import { getAllWorkers } from '$lib/server/db/workers.js';
import { getAllProjects } from '$lib/server/db/projects.js';
import { getAllClients } from '$lib/server/db/clients.js';

export function load() {
  const workers = getAllWorkers();
  const projects = getAllProjects();
  const clients = getAllClients();
  const activeProjects = projects.filter(p => p.status === 'active');
  const totalValue = projects.reduce((sum, p) => sum + (p.value || 0), 0);

  return { 
    stats: {
      workers: workers.length,
      projects: projects.length,
      clients: clients.length,
      activeProjects: activeProjects.length,
      totalValue
    },
    recentProjects: projects.slice(0, 5),
    workers: workers.slice(0, 5)
  };
}
