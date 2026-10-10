export const enum DumpType {
  TASK = 'task',
  GOAL = 'goal',
  IDEA = 'idea',
  REMINDER = 'reminder',
  EVENT = 'event'
}

export interface Dump {
  title: string;
  type?: DumpType;
  link?: string;
}