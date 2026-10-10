import { Component, computed, input, output } from '@angular/core';
import { Dump } from '../dump/dump.model';

@Component({
  selector: 'app-task-list',
  imports: [],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
})
export class TaskList {
  tasks       = input.required<Dump[]>();
  taskRemoved = output<number>();
  taskEdit    = output<number>();

  categoryColors: Record<string, string> = {
    work:   '#007AFF',
    growth: '#34C759',
    chore:  '#FF9500',
    health: '#FF2D55',
  };

  displayTasks = computed(() =>
    this.tasks().map(task => ({
      task,
      formattedDate: task.date ? this.formatDate(task.date) : null,
    }))
  );

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
