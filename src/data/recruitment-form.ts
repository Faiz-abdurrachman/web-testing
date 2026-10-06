export interface HoDSDefinition {
  id: string;
  name: string;
  shortDesc: string;
  specificAreas: string[];
  skills: {
    category?: string;
    items: string[];
  }[];
}

import { HODS_DIVISIONS as domains } from './recruitment-options.mjs';
export const HODS_DIVISIONS: HoDSDefinition[] = domains;
export {
  CURRENT_STATUS_OPTIONS,
  CURRENT_LEVEL_OPTIONS,
  LEARNING_METHODS_OPTIONS,
  PROJECT_EXPERIENCE_OPTIONS,
  DESIRED_OUTPUT_OPTIONS,
  TEAM_ROLES_OPTIONS,
  TIME_COMMITMENT_OPTIONS,
  CONTRIBUTION_TYPE_OPTIONS,
  CROSS_HODS_OPTIONS,
  BEST_DESCRIPTION_OPTIONS,
  INDEPENDENT_LEARNING_OPTIONS,
  AGREEMENT_STATEMENTS,
} from './recruitment-options.mjs';
