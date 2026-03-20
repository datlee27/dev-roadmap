import { PhaseId } from '../types';

export type NavSection = 'overview' | PhaseId | 'schedule' | 'tasks' | 'notes';

export interface NavItem {
  id: NavSection;
  label: string;
}
