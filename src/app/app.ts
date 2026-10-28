import { ChangeDetectionStrategy, Component, HostListener, OnDestroy, inject, signal, viewChild } from '@angular/core';
import { TimerComponent, TimerMode } from './timer/timer';
import { TasksComponent } from './tasks/tasks';
import { TempoStore } from './shared/store';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TimerComponent, TasksComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnDestroy {
  protected readonly store = inject(TempoStore);
  private readonly timer = viewChild(TimerComponent);

  protected readonly clock = signal('--:--');
  protected readonly toast = signal<string | null>(null);

  private timerId?: ReturnType<typeof setInterval>;
  private toastId?: ReturnType<typeof setTimeout>;

  constructor() {
    this.tick();
    this.timerId = setInterval(() => this.tick(), 1000);
  }

  private tick(): void {
    const d = new Date();
    this.clock.set(
      `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
    );
  }

  protected onFinished(e: { mode: TimerMode; seconds: number }): void {
    if (e.mode === 'focus') {
      this.store.recordSession(e.seconds);
      this.show(`Focus done — ${Math.round(e.seconds / 60)} minutes banked.`);
    } else {
      this.show('Break over. Back to it.');
    }
  }

  protected show(message: string): void {
    this.toast.set(message);
    if (this.toastId) clearTimeout(this.toastId);
    this.toastId = setTimeout(() => this.toast.set(null), 3600);
  }

  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    const el = e.target as HTMLElement | null;
    if (el && ['INPUT', 'TEXTAREA'].includes(el.tagName)) return;

    switch (e.key.toLowerCase()) {
      case ' ':
        e.preventDefault();
        this.timer()?.toggle();
        break;
      case 'r':
        this.timer()?.reset();
        break;
      case '1':
        this.timer()?.setPreset('classic');
        break;
      case '2':
        this.timer()?.setPreset('deep');
        break;
      case '3':
        this.timer()?.setPreset('ultra');
        break;
    }
  }

  ngOnDestroy(): void {
    if (this.timerId) clearInterval(this.timerId);
    if (this.toastId) clearTimeout(this.toastId);
  }
}
