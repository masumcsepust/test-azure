import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TempoStore } from '../shared/store';

@Component({
  selector: 'app-tasks',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss',
})
export class TasksComponent {
  protected readonly store = inject(TempoStore);
  protected readonly draft = signal('');

  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('input');

  protected add(): void {
    const value = this.draft().trim();
    if (!value) return;
    this.store.addTask(value);
    this.draft.set('');
    this.inputRef()?.nativeElement.focus();
  }

  protected onKey(e: KeyboardEvent): void {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.add();
    }
  }

  protected toggle(id: string): void {
    this.store.toggleTask(id);
  }

  protected remove(id: string): void {
    this.store.removeTask(id);
  }

  protected clearDone(): void {
    this.store.clearDone();
  }
}
