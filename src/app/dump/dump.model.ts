export const enum DumpType {
  TASK = 'task',
  GOAL = 'goal',
  IDEA = 'idea',
  REMINDER = 'reminder',
  EVENT = 'event'
}

export type DumpCategory = 'work' | 'growth' | 'chore' | 'health';

export interface Dump {
  title: string;
  category?: DumpCategory;
  type?: DumpType;
  link?: string;
}