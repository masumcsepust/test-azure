import { ChangeDetectionStrategy, Component, OnDestroy, computed, inject, output, signal } from '@angular/core';
import { TempoStore } from '../shared/store';

export type TimerMode = 'focus' | 'break';

export interface Preset {
  key: string;
  focus: number;
  rest: number;
  label: string;
}

@Component({
  selector: 'app-timer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './timer.html',
  styleUrl: './timer.scss',
})
export class TimerComponent implements OnDestroy {
  private readonly store = inject(TempoStore);

  readonly presets: Preset[] = [
    { key: 'classic', focus: 25, rest: 5, label: 'Classic' },
    { key: 'deep', focus: 50, rest: 10, label: 'Deep work' },
    { key: 'ultra', focus: 90, rest: 20, label: 'Ultra' },
  ];

  readonly mode = signal<TimerMode>('focus');
  readonly remaining = signal(0);
  readonly running = signal(false);

  constructor() {
    this.remaining.set(this.total());
  }

  /** emitted when a session ends: which mode finished and how long it lasted */
  readonly onFinished = output<{ mode: TimerMode; seconds: number }>();

  /** 2πr for r = 118 */
  readonly circumference = 2 * Math.PI * 118;

  readonly presetKey = computed(() => this.store.presetKey());

  readonly total = computed(() => {
    const p = this.presets.find((x) => x.key === this.presetKey())!;
    return (this.mode() === 'focus' ? p.focus : p.rest) * 60;
  });

  readonly progress = computed(() => {
    const t = this.total();
    return t === 0 ? 0 : (t - this.remaining()) / t;
  });

  readonly dashOffset = computed(() => this.circumference * (1 - this.progress()));

  readonly display = computed(() => {
    const s = this.remaining();
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
  });

  readonly accent = computed(() => (this.mode() === 'focus' ? 'var(--mint)' : 'var(--coral)'));

  private timer?: ReturnType<typeof setInterval>;

  setPreset(key: string): void {
    if (this.running()) return;
    this.store.presetKey.set(key);
    this.reset();
  }

  toggle(): void {
    this.running.update((v) => !v);
    if (this.running()) {
      this.start();
    } else {
      this.stop();
    }
  }

  reset(): void {
    this.stop();
    this.running.set(false);
    this.remaining.set(this.total());
  }

  switchMode(): void {
    this.stop();
    this.running.set(false);
    this.mode.update((m) => (m === 'focus' ? 'break' : 'focus'));
    this.remaining.set(this.total());
  }

  private start(): void {
    this.stop();
    this.timer = setInterval(() => {
      this.remaining.update((s) => Math.max(0, s - 1));
      if (this.remaining() === 0) {
        this.stop();
        this.onFinished.emit({ mode: this.mode(), seconds: this.total() });
        this.switchMode();
      }
    }, 1000);
  }

  private stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
