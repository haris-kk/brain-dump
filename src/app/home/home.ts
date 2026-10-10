import { Component, OnInit } from '@angular/core';
import { Dump } from '../dump/dump.model';
import { TaskAdd } from '../task-add/task-add';
import { TaskList } from '../task-list/task-list';

@Component({
  selector: 'app-home',
  imports: [TaskAdd, TaskList],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  public tasks: Dump[] = [];

  ngOnInit() {
    const stored = localStorage.getItem('tasks');
    if (stored) this.tasks = JSON.parse(stored);
  }

  addTask(title: string) {
    this.tasks = [...this.tasks, { title }];
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  removeTask(index: number) {
    this.tasks = this.tasks.filter((_, i) => i !== index);
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }
}
