import { getAllProjects } from '$lib/server/db/projects.js';

export function load() {
  return { projects: getAllProjects() };
}
