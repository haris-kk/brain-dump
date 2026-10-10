import { Component, inject } from '@angular/core';
import { DumpFacade } from '../dump/dump.facade';
import { SheetService } from '../sheet/sheet.service';
import { TaskList } from '../task-list/task-list';

@Component({
  selector: 'app-home',
  imports: [TaskList],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  facade       = inject(DumpFacade);
  sheetService = inject(SheetService);

  editTask(index: number) {
    const task = this.facade.tasks()[index];
    this.sheetService.open(task, index);
  }
}
