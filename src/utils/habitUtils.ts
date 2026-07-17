import type { Habit, DayOfWeek } from '../types/Habit';

export interface WeekDate {
  isoDate: string;
  dayLabel: string;
  dayNumber: number;
}

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export const DAYS_DISPLAY_NAMES: Record<DayOfWeek, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

const MONTH_SHORT_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function getIsoDate(date: Date): string {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy.toISOString().split('T')[0];
}

export function getWeekStart(date = new Date()): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  const dayOfWeek = copy.getDay();
  const offset = (dayOfWeek + 6) % 7;
  copy.setDate(copy.getDate() - offset);
  return copy;
}

export function getWeekDates(startDate: Date): WeekDate[] {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const current = new Date(start);
    current.setDate(start.getDate() + index);

    return {
      isoDate: getIsoDate(current),
      dayLabel: DAYS_DISPLAY_NAMES[DAYS_OF_WEEK[index]],
      dayNumber: current.getDate(),
    };
  });
}

export function getCompletionCountForWeek(habit: Habit, weekDates: WeekDate[]): number {
  return weekDates.filter(({ isoDate }) => Boolean(habit.completionDates[isoDate])).length;
}

export function getCompletionPercentageForWeek(completedCount: number): number {
  return Math.round((completedCount / 7) * 100);
}

export function isHabitCompletedForWeek(habit: Habit, weekDates: WeekDate[]): boolean {
  return getCompletionCountForWeek(habit, weekDates) === 7;
}

export function calculateStreakForWeek(habit: Habit, weekDates: WeekDate[]): number {
  let maxStreak = 0;
  let currentStreak = 0;

  for (const { isoDate } of weekDates) {
    if (habit.completionDates[isoDate]) {
      currentStreak += 1;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return maxStreak;
}

export function getHabitCompletionForDate(habit: Habit, isoDate: string): boolean {
  return Boolean(habit.completionDates[isoDate]);
}

export function formatShortDate(date: Date): string {
  return `${MONTH_SHORT_NAMES[date.getMonth()]} ${date.getDate()}`;
}

export function formatWeekRange(startDate: Date): string {
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  return `${formatShortDate(startDate)} – ${formatShortDate(endDate)}`;
}

export function saveHabitsToStorage(habits: Habit[]): void {
  try {
    localStorage.setItem('habits', JSON.stringify(habits));
  } catch (error) {
    console.error('Failed to save habits to localStorage:', error);
  }
}

export function loadHabitsFromStorage(): Habit[] {
  try {
    const storedHabits = localStorage.getItem('habits');
    if (!storedHabits) return [];

    const parsed = JSON.parse(storedHabits);
    if (!Array.isArray(parsed)) return [];

    return parsed.map(raw => {
      const id = typeof raw.id === 'string' ? raw.id : generateId();
      const name = typeof raw.name === 'string' ? raw.name : 'New Habit';
      const color = typeof raw.color === 'string' ? raw.color : '#686de0';
      const createdAt = typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString();
      const completionDates: Record<string, boolean> = {};

      if (raw && typeof raw === 'object') {
        if (raw.completionDates && typeof raw.completionDates === 'object') {
          for (const [isoDate, value] of Object.entries(raw.completionDates)) {
            if (value) {
              completionDates[isoDate] = true;
            }
          }
        } else if (raw.completedDays && typeof raw.completedDays === 'object') {
          const currentWeekDates = getWeekDates(getWeekStart(new Date()));
          for (let index = 0; index < DAYS_OF_WEEK.length; index += 1) {
            const day = DAYS_OF_WEEK[index];
            if (raw.completedDays[day]) {
              completionDates[currentWeekDates[index].isoDate] = true;
            }
          }
        }
      }

      return {
        id,
        name,
        color,
        createdAt,
        completionDates,
      };
    });
  } catch (error) {
    console.error('Failed to load habits from localStorage:', error);
    return [];
  }
}
