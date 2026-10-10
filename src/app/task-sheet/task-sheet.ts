import { Component, output } from '@angular/core';
import { DumpCategory } from '../dump/dump.model';

@Component({
  selector: 'app-task-sheet',
  imports: [],
  templateUrl: './task-sheet.html',
  styleUrl: './task-sheet.css',
})
export class TaskSheet {
  taskAdded = output<{ title: string; category?: DumpCategory }>();
  closed = output<void>();

  selected: DumpCategory | undefined = undefined;

  categories = [
    { label: 'Work',   value: 'work'   as DumpCategory, color: '#007AFF' },
    { label: 'Growth', value: 'growth' as DumpCategory, color: '#34C759' },
    { label: 'Chore',  value: 'chore'  as DumpCategory, color: '#FF9500' },
    { label: 'Health', value: 'health' as DumpCategory, color: '#FF2D55' },
  ];

  submit(input: HTMLInputElement, event: Event) {
    event.preventDefault();
    const title = input.value.trim();
    if (title) {
      this.taskAdded.emit({ title, category: this.selected });
      input.value = '';
      this.selected = undefined;
      this.closed.emit();
    }
  }
}
