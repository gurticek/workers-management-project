import { getAllClients } from '$lib/server/db/clients.js';

export function load() {
  return { clients: getAllClients() };
}
