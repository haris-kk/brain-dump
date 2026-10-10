import { Component, input, output } from '@angular/core';
import { Dump } from '../dump/dump.model';

@Component({
  selector: 'app-task-list',
  imports: [],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
})
export class TaskList {
  tasks = input.required<Dump[]>();
  taskRemoved = output<number>();

  categoryColors: Record<string, string> = {
    work:   '#007AFF',
    growth: '#34C759',
    chore:  '#FF9500',
    health: '#FF2D55',
  };
}
