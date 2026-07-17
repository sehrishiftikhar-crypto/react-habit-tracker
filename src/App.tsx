import React, { useState, useEffect } from 'react';
import type {
  Habit,
  HabitFormData,
  EditHabitData,
  FilterType,
  SortType,
} from './types/Habit';
import type { Theme } from './types/Theme';
import {
  generateId,
  saveHabitsToStorage,
  loadHabitsFromStorage,
  getWeekStart,
  getWeekDates,
  getCompletionCountForWeek,
  calculateStreakForWeek,
  formatWeekRange,
  getIsoDate,
} from './utils/habitUtils';
import { saveThemeToStorage, loadThemeFromStorage } from './utils/themeUtils';
import Header from './components/Header';
import AddHabitForm from './components/AddHabitForm';
import HabitsFilter from './components/HabitsFilter';
import HabitsList from './components/HabitsList';
import EditHabitModal from './components/EditHabitModal';
import './App.css';
import './styles/components/Button.css';
import './styles/components/Modal.css';

function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitsLoaded, setHabitsLoaded] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('created');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [theme, setTheme] = useState<Theme>('light');
  const [themeLoaded, setThemeLoaded] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const currentWeekStart = getWeekStart(new Date());
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(currentWeekStart);
  const weekDates = getWeekDates(selectedWeekStart);
  const weekRangeLabel = formatWeekRange(selectedWeekStart);
  const todayIso = getIsoDate(new Date());
  const isCurrentWeek = selectedWeekStart.getTime() === currentWeekStart.getTime();

  useEffect(() => {
    const savedHabits = loadHabitsFromStorage();
    setHabits(savedHabits);
    setHabitsLoaded(true);
  }, []);

  useEffect(() => {
    const savedTheme = loadThemeFromStorage();
    setTheme(savedTheme);
    setThemeLoaded(true);
  }, []);

  useEffect(() => {
    if (habitsLoaded) {
      saveHabitsToStorage(habits);
    }
  }, [habits, habitsLoaded]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);

    if (themeLoaded) {
      saveThemeToStorage(theme);
    }
  }, [theme, themeLoaded]);

  const toggleTheme = (): void => {
    setTheme((prev: Theme) => (prev === 'light' ? 'dark' : 'light'));
  };

  const addHabit = (habitData: HabitFormData): void => {
    const newHabit: Habit = {
      id: generateId(),
      name: habitData.name,
      color: habitData.color,
      completionDates: {},
      createdAt: new Date().toISOString(),
    };

    setHabits(prev => [...prev, newHabit]);
  };

  const updateHabit = (editData: EditHabitData): void => {
    setHabits(prev =>
      prev.map(habit =>
        habit.id === editData.id
          ? { ...habit, name: editData.name, color: editData.color }
          : habit
      )
    );
    setEditingHabit(null);
  };

  const deleteHabit = (habitId: string): void => {
    setHabits(prev => prev.filter(habit => habit.id !== habitId));
    setShowDeleteConfirm(null);
  };

  const toggleHabitDay = (habitId: string, isoDate: string): void => {
    if (isoDate > todayIso) return;

    setHabits(prev =>
      prev.map(habit => {
        if (habit.id !== habitId) {
          return habit;
        }

        const nextCompletionDates = { ...habit.completionDates };

        if (nextCompletionDates[isoDate]) {
          delete nextCompletionDates[isoDate];
        } else {
          nextCompletionDates[isoDate] = true;
        }

        return {
          ...habit,
          completionDates: nextCompletionDates,
        };
      })
    );
  };

  const resetAllProgress = (): void => {
    const selectedIsoDates = weekDates.map(date => date.isoDate);

    setHabits(prev =>
      prev.map(habit => {
        const nextCompletionDates = { ...habit.completionDates };

        selectedIsoDates.forEach(date => {
          delete nextCompletionDates[date];
        });

        return {
          ...habit,
          completionDates: nextCompletionDates,
        };
      })
    );
  };

  const goToPreviousWeek = (): void => {
    setSelectedWeekStart(prev => {
      const nextWeek = new Date(prev);
      nextWeek.setDate(prev.getDate() - 7);
      return nextWeek;
    });
  };

  const goToNextWeek = (): void => {
    if (isCurrentWeek) return;

    setSelectedWeekStart(prev => {
      const nextWeek = new Date(prev);
      nextWeek.setDate(prev.getDate() + 7);
      return nextWeek;
    });
  };

  const goToCurrentWeek = (): void => {
    setSelectedWeekStart(currentWeekStart);
  };

  const filteredAndSortedHabits = habits
    .filter(habit => {
      const matchesSearch = habit.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const completedDaysCount = getCompletionCountForWeek(habit, weekDates);

      switch (filter) {
        case 'completed':
          return matchesSearch && completedDaysCount === 7;
        case 'incomplete':
          return matchesSearch && completedDaysCount < 7;
        default:
          return matchesSearch;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'streak':
          return (
            calculateStreakForWeek(b, weekDates) -
            calculateStreakForWeek(a, weekDates)
          );
        case 'created':
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

  return (
    <div className="app">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onResetProgress={resetAllProgress}
        totalHabits={habits.length}
        completedHabits={
          habits.filter(habit => getCompletionCountForWeek(habit, weekDates) === 7)
            .length
        }
        weekLabel={weekRangeLabel}
        onPreviousWeek={goToPreviousWeek}
        onNextWeek={goToNextWeek}
        onCurrentWeek={goToCurrentWeek}
        isCurrentWeek={isCurrentWeek}
      />

      <main className="main-content">
        <AddHabitForm onAddHabit={addHabit} />

        <HabitsFilter
          filter={filter}
          onFilterChange={setFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        <HabitsList
          habits={filteredAndSortedHabits}
          weekDates={weekDates}
          todayIso={todayIso}
          onToggleDay={toggleHabitDay}
          onEditHabit={setEditingHabit}
          onDeleteHabit={setShowDeleteConfirm}
        />
      </main>

      {editingHabit && (
        <EditHabitModal
          habit={editingHabit}
          onSave={updateHabit}
          onClose={() => setEditingHabit(null)}
        />
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="delete-confirm-modal">
            <h3>Delete Habit</h3>
            <p>
              Are you sure you want to delete this habit? This action cannot be
              undone.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={() => deleteHabit(showDeleteConfirm)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
