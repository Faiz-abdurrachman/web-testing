import snapshot from './cms-snapshot.json';

export interface Project {
  id: string;
  title: string;
  tags: string[];
  description: string;
  image: string;
}

export const projects: Project[] = snapshot.projects;
