import { Component, output } from '@angular/core';
import { DumpCategory, DumpDuration } from '../dump/dump.model';

@Component({
  selector: 'app-task-sheet',
  imports: [],
  templateUrl: './task-sheet.html',
  styleUrl: './task-sheet.css',
})
export class TaskSheet {
  taskAdded = output<{
    title: string;
    category?: DumpCategory;
    duration?: DumpDuration;
    date?: string;
    link?: string;
  }>();
  closed = output<void>();

  isEditing         = false;
  initialTitle      = '';
  selectedCategory: DumpCategory | undefined = undefined;
  selectedDuration: DumpDuration | undefined = undefined;
  showDetails = false;
  detailDate  = '';
  detailLink  = '';

  categories = [
    { label: 'Work',   value: 'work'   as DumpCategory, color: '#007AFF' },
    { label: 'Growth', value: 'growth' as DumpCategory, color: '#34C759' },
    { label: 'Chore',  value: 'chore'  as DumpCategory, color: '#FF9500' },
    { label: 'Health', value: 'health' as DumpCategory, color: '#FF2D55' },
  ];

  durations = [
    { label: '30 min', value: '30min' as DumpDuration },
    { label: '1 hr',   value: '1hr'   as DumpDuration },
    { label: '2 hr',   value: '2hr'   as DumpDuration },
    { label: '4 hr',   value: '4hr'   as DumpDuration },
  ];

  submit(input: HTMLInputElement, event: Event) {
    event.preventDefault();
    const title = input.value.trim();
    if (!title) return;

    this.taskAdded.emit({
      title,
      category: this.selectedCategory,
      duration: this.selectedDuration,
      date:     this.detailDate  || undefined,
      link:     this.detailLink.trim() || undefined,
    });

    input.value = '';
    this.selectedCategory = undefined;
    this.selectedDuration = undefined;
    this.detailDate = '';
    this.detailLink = '';
    this.showDetails = false;
    this.closed.emit();
  }
}
