import { computed, effect, Injectable, signal } from '@angular/core';
import { Dump, DumpCategory, DumpDuration } from './dump.model';

@Injectable({ providedIn: 'root' })
export class DumpFacade {
  // signal() — declare reactive state with an initial value
  // read with tasks(), write with tasks.set() or tasks.update()
  tasks     = signal<Dump[]>([]);
  sheetOpen = signal(false);

  // computed() — read-only signal derived from other signals
  // lazy: won't run until first read, then caches until tasks() changes
  taskCount = computed(() => this.tasks().length);

  constructor() {
    const stored = localStorage.getItem('tasks');
    if (stored) this.tasks.set(JSON.parse(stored));

    // effect() — side effect that runs whenever signals inside change
    // replaces manual persist() calls — auto-persists on every tasks() change
    effect(() => {
      localStorage.setItem('tasks', JSON.stringify(this.tasks()));
    });
  }

  openSheet()  { this.sheetOpen.set(true);  }
  closeSheet() { this.sheetOpen.set(false); }

  addTask(title: string, category?: DumpCategory, duration?: DumpDuration, date?: string, link?: string) {
    // update() — use when new value depends on previous value
    this.tasks.update(current => [...current, { title, category, duration, date, link }]);
  }

  removeTask(index: number) {
    this.tasks.update(current => current.filter((_, i) => i !== index));
  }

  updateTask(index: number, task: { title: string; category?: DumpCategory; duration?: DumpDuration; date?: string; link?: string }) {
    this.tasks.update(current => current.map((t, i) => i === index ? { ...t, ...task } : t));
  }
}
