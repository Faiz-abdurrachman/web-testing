import * as options from '../src/data/recruitment-options.mjs';

export const TEXT_FIELDS = [
  'full_name',
  'preferred_name',
  'email',
  'whatsapp',
  'institution',
  'city_region',
  'currently_exploring',
  'secondary_interest',
  'most_relevant_work',
  'portfolio_link',
  'alternative_evidence',
  'real_world_problem',
  'technology_approach',
  'explore_or_build',
  'skill_to_improve',
  'six_months_goal',
  'team_story',
  'why_join',
  'what_to_contribute',
  'what_to_build_together',
];
export const REQUIRED_TEXT = [
  'full_name',
  'preferred_name',
  'email',
  'whatsapp',
  'institution',
  'city_region',
  'most_relevant_work',
  'real_world_problem',
  'why_join',
  'explore_or_build',
];
export const CHOICES = {
  current_status: options.CURRENT_STATUS_OPTIONS,
  current_level: options.CURRENT_LEVEL_OPTIONS.map((item) => item.value),
  learning_methods: options.LEARNING_METHODS_OPTIONS,
  primary_hods: options.HODS_DIVISIONS.map((item) => item.id),
  project_experience: options.PROJECT_EXPERIENCE_OPTIONS,
  desired_output: options.DESIRED_OUTPUT_OPTIONS,
  team_comfort: ['1', '2', '3', '4', '5'],
  team_roles: options.TEAM_ROLES_OPTIONS,
  time_commitment: options.TIME_COMMITMENT_OPTIONS,
  contribution_types: options.CONTRIBUTION_TYPE_OPTIONS,
  cross_hods_willingness: options.CROSS_HODS_OPTIONS,
  best_description: options.BEST_DESCRIPTION_OPTIONS.map((item) => item.id),
  independent_learning: options.INDEPENDENT_LEARNING_OPTIONS,
  agreement_1: ['on'],
  agreement_2: ['on'],
  agreement_3: ['on'],
};
export const MULTI_FIELDS = [
  'learning_methods',
  'desired_output',
  'team_roles',
  'contribution_types',
  'foundation_skills',
];
export const REQUIRED_CHOICES = [
  'current_status',
  'current_level',
  'primary_hods',
  'time_commitment',
  'best_description',
  'independent_learning',
  'agreement_1',
  'agreement_2',
  'agreement_3',
];
export const APPLICATION_FIELDS = [
  ...TEXT_FIELDS,
  ...Object.keys(CHOICES),
  'specific_area',
  'foundation_skills',
];
export const DOMAINS = options.HODS_DIVISIONS;

// Also emitted verbatim for GAS, so both boundaries use the same contract.
export function validateApplication(input) {
  const invalid = () => {
    throw new Error('INVALID_INPUT');
  };
  if (
    !input ||
    typeof input !== 'object' ||
    Array.isArray(input) ||
    Object.keys(input).some((key) => !APPLICATION_FIELDS.includes(key))
  )
    invalid();
  const output = {};
  for (const name of TEXT_FIELDS) {
    const value = input[name] ?? '';
    if (
      typeof value !== 'string' ||
      value.length >
        ([
          'full_name',
          'preferred_name',
          'email',
          'whatsapp',
          'institution',
          'city_region',
        ].includes(name)
          ? 200
          : 4000) ||
      /[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(value)
    )
      invalid();
    output[name] = value.trim();
    if (REQUIRED_TEXT.includes(name) && !output[name]) invalid();
  }
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(output.email) ||
    !/^\+?[\d ()-]{7,25}$/.test(output.whatsapp)
  )
    invalid();
  if (output.portfolio_link) {
    // GAS does not expose the browser URL constructor.
    if (!/^https?:\/\/[^\s/?#]+(?:[/?#][^\s]*)?$/i.test(output.portfolio_link))
      invalid();
  }
  for (const [name, choices] of Object.entries(CHOICES)) {
    const value = input[name] ?? (MULTI_FIELDS.includes(name) ? [] : '');
    if (MULTI_FIELDS.includes(name)) {
      if (
        !Array.isArray(value) ||
        value.length > choices.length ||
        value.some((item) => !choices.includes(item)) ||
        new Set(value).size !== value.length
      )
        invalid();
      output[name] = value;
    } else {
      if (
        typeof value !== 'string' ||
        (value && !choices.includes(value)) ||
        (REQUIRED_CHOICES.includes(name) && !value)
      )
        invalid();
      output[name] = value;
    }
  }
  const domain = DOMAINS.find((item) => item.id === output.primary_hods);
  const area = input.specific_area ?? '';
  if (
    typeof area !== 'string' ||
    (area && !domain.specificAreas.includes(area))
  )
    invalid();
  output.specific_area = area;
  const skills = input.foundation_skills ?? [];
  const allowed = domain.skills.flatMap((group) => group.items);
  if (
    !Array.isArray(skills) ||
    skills.length > allowed.length ||
    skills.some((skill) => !allowed.includes(skill)) ||
    new Set(skills).size !== skills.length
  )
    invalid();
  output.foundation_skills = skills;
  return output;
}
