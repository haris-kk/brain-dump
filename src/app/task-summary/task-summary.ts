import { Component, computed, input } from '@angular/core';
import { Dump, DumpCategory } from '../dump/dump.model';

interface DisplayTask {
  task: Dump;
  formattedDate: string | null;
}

interface Group {
  category: DumpCategory | 'other';
  label: string;
  color: string;
  tasks: DisplayTask[];
}

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  work:   { label: 'Work',   color: '#007AFF' },
  growth: { label: 'Growth', color: '#34C759' },
  chore:  { label: 'Chore',  color: '#FF9500' },
  health: { label: 'Health', color: '#FF2D55' },
  other:  { label: 'Other',  color: '#8e8e93' },
};

@Component({
  selector: 'app-task-summary',
  imports: [],
  templateUrl: './task-summary.html',
  styleUrl: './task-summary.css',
})
export class TaskSummary {
  tasks = input.required<Dump[]>();

  groups = computed<Group[]>(() => {
    const sorted = [...this.tasks()].sort((a, b) => {
      if (a.date && b.date) return a.date.localeCompare(b.date);
      if (a.date) return -1;
      if (b.date) return 1;
      return 0;
    });

    const map = new Map<string, DisplayTask[]>();
    for (const t of sorted) {
      const key = t.category ?? 'other';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push({
        task: t,
        formattedDate: t.date ? this.formatDate(t.date) : null,
      });
    }

    return Array.from(map.entries()).map(([key, tasks]) => ({
      category: key as DumpCategory | 'other',
      label:    CATEGORY_META[key]?.label ?? key,
      color:    CATEGORY_META[key]?.color ?? '#8e8e93',
      tasks,
    }));
  });

  private formatDate(dateStr: string): string {
    const d      = new Date(dateStr + 'T00:00:00');
    const day    = d.getDate();
    const n      = day % 10;
    const suffix = Math.floor(day / 10) === 1 ? 'th'
                 : n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th';
    const month  = d.toLocaleString('en', { month: 'short' });
    return `${day}${suffix} ${month}`;
  }
}
