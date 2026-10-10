export const enum DumpType {
  TASK = 'task',
  GOAL = 'goal',
  IDEA = 'idea',
  REMINDER = 'reminder',
  EVENT = 'event'
}

export type DumpCategory = 'work' | 'growth' | 'chore' | 'health';
export type DumpDuration = '30min' | '1hr' | '2hr' | '4hr';

export interface Dump {
  title: string;
  category?: DumpCategory;
  duration?: DumpDuration;
  date?: string;
  link?: string;
  type?: DumpType;
}