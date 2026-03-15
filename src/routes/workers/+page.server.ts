import { getAllWorkers } from '$lib/server/db/workers.js';

export function load() {
  return { workers: getAllWorkers() };
}
