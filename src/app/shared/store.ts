import { Injectable, computed, effect, signal } from '@angular/core';

export interface Task {
  id: string;
  label: string;
  done: boolean;
  createdAt: number;
}

const TASKS_KEY = 'tempo.tasks.v1';
const STATS_KEY = 'tempo.stats.v1';
const PRESET_KEY = 'tempo.preset.v1';

interface Stats {
  sessions: number;
  focusSeconds: number;
}

@Injectable({ providedIn: 'root' })
export class TempoStore {
  readonly tasks = signal<Task[]>(this.read<Task[]>(TASKS_KEY, []));
  readonly sessions = signal(0);
  readonly focusSeconds = signal(0);
  readonly presetKey = signal(this.read<string>(PRESET_KEY, 'classic'));

  readonly openTasks = computed(() => this.tasks().filter((t) => !t.done));
  readonly doneTasks = computed(() => this.tasks().filter((t) => t.done));
  readonly focusMinutes = computed(() => Math.round(this.focusSeconds() / 60));

  constructor() {
    const s = this.read<Stats>(STATS_KEY, { sessions: 0, focusSeconds: 0 });
    this.sessions.set(s.sessions);
    this.focusSeconds.set(s.focusSeconds);

    effect(() => {
      this.write(TASKS_KEY, this.tasks());
    });
    effect(() => {
      this.write(STATS_KEY, {
        sessions: this.sessions(),
        focusSeconds: this.focusSeconds(),
      });
    });
    effect(() => {
      this.write(PRESET_KEY, this.presetKey());
    });
  }

  addTask(label: string): void {
    const clean = label.trim();
    if (!clean) return;
    const task: Task = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      label: clean,
      done: false,
      createdAt: Date.now(),
    };
    this.tasks.update((list) => [task, ...list]);
  }

  toggleTask(id: string): void {
    this.tasks.update((list) =>
      list.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  }

  removeTask(id: string): void {
    this.tasks.update((list) => list.filter((t) => t.id !== id));
  }

  clearDone(): void {
    this.tasks.update((list) => list.filter((t) => !t.done));
  }

  recordSession(seconds: number): void {
    this.sessions.update((n) => n + 1);
    this.focusSeconds.update((n) => n + seconds);
  }

  private read<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  private write(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable — the app still works, it just forgets */
    }
  }
}
