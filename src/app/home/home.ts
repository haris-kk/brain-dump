import { Component, inject, signal } from '@angular/core';
import { DumpFacade } from '../dump/dump.facade';
import { SheetService } from '../sheet/sheet.service';
import { TaskList } from '../task-list/task-list';
import { TaskSummary } from '../task-summary/task-summary';

@Component({
  selector: 'app-home',
  imports: [TaskList, TaskSummary],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  facade       = inject(DumpFacade);
  sheetService = inject(SheetService);
  viewMode     = signal<'list' | 'summary'>('list');

  editTask(index: number) {
    const task = this.facade.tasks()[index];
    this.sheetService.open(task, index);
  }

  toggleView() {
    this.viewMode.update(v => v === 'list' ? 'summary' : 'list');
  }
}
