import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable,
} from '@angular/core';
import { Dump } from '../dump/dump.model';
import { DumpFacade } from '../dump/dump.facade';
import { TaskSheet } from '../task-sheet/task-sheet';

@Injectable({ providedIn: 'root' })
export class SheetService {
  private appRef    = inject(ApplicationRef);
  private injector  = inject(EnvironmentInjector);
  private facade    = inject(DumpFacade);
  private sheetRef: ComponentRef<TaskSheet> | null = null;

  open(editTask?: Dump, editIndex?: number) {
    if (this.sheetRef) return;

    this.sheetRef = createComponent(TaskSheet, {
      environmentInjector: this.injector,
    });

    if (editTask) {
      const inst = this.sheetRef.instance;
      this.sheetRef.setInput('isEditing', true);
      this.sheetRef.setInput('initialTitle', editTask.title);
      inst.selectedCategory = editTask.category;
      inst.selectedDuration = editTask.duration;
      inst.detailDate       = editTask.date ?? '';
      inst.detailLink       = editTask.link ?? '';
      if (editTask.date || editTask.duration || editTask.link) {
        inst.showDetails = true;
      }
    }

    this.sheetRef.instance.closed.subscribe(() => this.close());
    this.sheetRef.instance.taskAdded.subscribe(({ title, category, duration, date, link }) => {
      if (editIndex !== undefined) {
        this.facade.updateTask(editIndex, { title, category, duration, date, link });
      } else {
        this.facade.addTask(title, category, duration, date, link);
      }
    });

    this.appRef.attachView(this.sheetRef.hostView);
    document.body.appendChild(this.sheetRef.location.nativeElement);
  }

  close() {
    if (!this.sheetRef) return;
    this.appRef.detachView(this.sheetRef.hostView);
    this.sheetRef.destroy();
    this.sheetRef = null;
  }
}
