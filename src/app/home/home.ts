import { Component, OnInit } from '@angular/core';
import { Dump, DumpCategory } from '../dump/dump.model';
import { TaskList } from '../task-list/task-list';
import { TaskSheet } from '../task-sheet/task-sheet';

@Component({
  selector: 'app-home',
  imports: [TaskList, TaskSheet],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  tasks: Dump[] = [];
  sheetOpen = false;

  ngOnInit() {
    const stored = localStorage.getItem('tasks');
    if (stored) this.tasks = JSON.parse(stored);
  }

  addTask(event: { title: string; category?: DumpCategory }) {
    this.tasks = [...this.tasks, { title: event.title, category: event.category }];
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  removeTask(index: number) {
    this.tasks = this.tasks.filter((_, i) => i !== index);
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }
}
