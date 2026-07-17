import React from 'react';
import type { Theme } from '../types/Theme';
import '../styles/components/Header.css';

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  onResetProgress: () => void;
  totalHabits: number;
  completedHabits: number;
  weekLabel: string;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onCurrentWeek: () => void;
  isCurrentWeek: boolean;
}

function Header({
  theme,
  onToggleTheme,
  onResetProgress,
  totalHabits,
  completedHabits,
  weekLabel,
  onPreviousWeek,
  onNextWeek,
  onCurrentWeek,
  isCurrentWeek,
}: HeaderProps) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="app-title">Habit Tracker</h1>
          <div className="header-stats">
            <span className="stat">
              {completedHabits}/{totalHabits} habits completed this week
            </span>
          </div>
          <div className="week-navigation">
            <button
              className="btn btn-secondary week-nav-btn"
              onClick={onPreviousWeek}
            >
              Prev
            </button>
            <div className="week-range">{weekLabel}</div>
            <button
              className="btn btn-secondary week-nav-btn"
              onClick={onNextWeek}
              disabled={isCurrentWeek}
            >
              Next
            </button>
            <button
              className="btn btn-secondary week-current-btn"
              onClick={onCurrentWeek}
              disabled={isCurrentWeek}
            >
              Current Week
            </button>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="btn btn-secondary"
            onClick={onResetProgress}
            disabled={totalHabits === 0}
          >
            Reset Progress
          </button>

          <button
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
