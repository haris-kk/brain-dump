import { Component, OnInit } from '@angular/core';
import { Dump } from '../dump/dump.model';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  public readonly title = 'brain_dump';

  ngOnInit() {  
    localStorage.getItem('tasks') && (this.tasks = JSON.parse(localStorage.getItem('tasks') || '[]'));
  }
  public tasks: Dump[] = [];

  addTask(taskTitle: string) {
    if(taskTitle.trim() !== '') {
      this.tasks.push({ title: taskTitle });
      localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }
  }
}
