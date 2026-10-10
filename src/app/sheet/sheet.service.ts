import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable,
} from '@angular/core';
import { DumpFacade } from '../dump/dump.facade';
import { TaskSheet } from '../task-sheet/task-sheet';

@Injectable({ providedIn: 'root' })
export class SheetService {
  private appRef    = inject(ApplicationRef);
  private injector  = inject(EnvironmentInjector);
  private facade    = inject(DumpFacade);
  private sheetRef: ComponentRef<TaskSheet> | null = null;

  open() {
    if (this.sheetRef) return; // already open, don't create twice

    // 1. create in memory — give it access to all services
    this.sheetRef = createComponent(TaskSheet, {
      environmentInjector: this.injector,
    });

    // 2. wire up outputs before attaching
    this.sheetRef.instance.closed.subscribe(() => this.close());
    this.sheetRef.instance.taskAdded.subscribe(({ title, category }) => {
      this.facade.addTask(title, category);
    });

    // 3. tell Angular to watch it for changes
    this.appRef.attachView(this.sheetRef.hostView);

    // 4. put it in the DOM, outside app-root
    document.body.appendChild(this.sheetRef.location.nativeElement);
  }

  close() {
    if (!this.sheetRef) return;
    this.appRef.detachView(this.sheetRef.hostView);
    this.sheetRef.destroy();
    this.sheetRef = null;
  }
}
