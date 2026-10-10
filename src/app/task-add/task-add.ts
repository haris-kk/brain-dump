import { Component, output } from '@angular/core';

@Component({
  selector: 'app-task-add',
  imports: [],
  templateUrl: './task-add.html',
  styleUrl: './task-add.css',
})
export class TaskAdd {
  taskAdded = output<string>();

  submit(input: HTMLInputElement, event: Event) {
    event.preventDefault();
    const title = input.value.trim();
    if (title) {
      this.taskAdded.emit(title);
      input.value = '';
    }
  }
}
