import React, { useState } from 'react';
import type { Habit } from '../types/Habit';
import type { WeekDate } from '../utils/habitUtils';
import {
  getCompletionCountForWeek,
  getCompletionPercentageForWeek,
  isHabitCompletedForWeek,
  calculateStreakForWeek,
} from '../utils/habitUtils';
import ProgressBar from './ProgressBar';
import '../styles/components/HabitCard.css';
import '../styles/components/Button.css';

interface HabitCardProps {
  habit: Habit;
  weekDates: WeekDate[];
  todayIso: string;
  onToggleDay: (habitId: string, isoDate: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
}

function HabitCard({
  habit,
  weekDates,
  todayIso,
  onToggleDay,
  onEdit,
  onDelete,
}: HabitCardProps) {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const completedDaysCount = getCompletionCountForWeek(habit, weekDates);
  const completionPercentage = getCompletionPercentageForWeek(completedDaysCount);
  const isCompleted = isHabitCompletedForWeek(habit, weekDates);
  const streak = calculateStreakForWeek(habit, weekDates);

  return (
    <div
      className="habit-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ '--habit-color': habit.color } as React.CSSProperties}
    >
      <div className="habit-header">
        <div className="habit-title">
          <h3 className="habit-name">
            {habit.name}
            {isCompleted && <span className="completion-badge">✓</span>}
          </h3>
          <div className="habit-stats">
            <span className="completion-text">{completedDaysCount}/7 days</span>
            {streak > 0 && (
              <span className="streak-badge">{streak} day streak</span>
            )}
          </div>
        </div>

        <div className="habit-actions">
          <button
            className="btn btn-small btn-secondary"
            onClick={() => onEdit(habit)}
          >
            Edit
          </button>
          {isHovered && (
            <button
              className="btn btn-small btn-danger"
              onClick={() => onDelete(habit.id)}
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="progress-section">
        <ProgressBar percentage={completionPercentage} color={habit.color} />
      </div>

      <div className="days-container">
        <div className="days-grid">
          {weekDates.map(day => {
            const completed = Boolean(habit.completionDates[day.isoDate]);
            const isFuture = day.isoDate > todayIso;

            return (
              <div key={day.isoDate} className="day-item">
                <div className="day-label">
                  <span>{day.dayLabel}</span>
                  <span className="day-date">{day.dayNumber}</span>
                </div>
                <button
                  className={`day-checkbox ${completed ? 'checked' : ''}`}
                  onClick={() => onToggleDay(habit.id, day.isoDate)}
                  disabled={isFuture}
                  aria-label={
                    isFuture
                      ? `Cannot mark future date ${day.isoDate}`
                      : `Mark ${day.isoDate} as ${completed ? 'incomplete' : 'complete'}`
                  }
                >
                  {completed && <span className="checkmark">✓</span>}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default HabitCard;
