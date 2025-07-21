import React from 'react';
import { DayData } from '../data';
import { useTranslation } from '../hooks/useTranslation';
import { Icon } from './Header';

interface SidebarProps {
    days: DayData[];
    activeDay: number;
    todayIndex: number;
    completedDays: Set<number>;
    onSelectDay: (dayId: number) => void;
    isCollapsed: boolean;
    toggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ days, activeDay, todayIndex, completedDays, onSelectDay, isCollapsed, toggleSidebar }) => {
    const { t } = useTranslation();

    const sidebarClasses = [
        'sidebar',
        isCollapsed ? 'sidebar--collapsed' : ''
    ].filter(Boolean).join(' ');

    return (
        <aside className={sidebarClasses}>
            <h2 className="sidebar-title">{t('sidebar.title')}</h2>
            <nav className="day-nav">
                {days.map((day) => {
                     const isCompleted = completedDays.has(day.id);
                     const isUnlocked = day.id === 1 || completedDays.has(day.id - 1);
                     const isDisabled = !isUnlocked && !isCompleted;
                     const isToday = day.id === todayIndex && isUnlocked;

                     const buttonClasses = [
                        'day-button',
                        activeDay === day.id ? 'active' : '',
                        isCompleted ? 'completed' : '',
                        isDisabled ? 'locked' : '',
                        isToday ? 'today' : '',
                     ].filter(Boolean).join(' ');
                    
                     const dayTitle = t(day.title);
                     const label = t('sidebar.day.label', { dayId: day.id, dayTitle });
                     const fullLabel = isDisabled ? `${label} (${t('sidebar.day.locked')})` : label;

                     return (
                        <button
                            key={day.id}
                            className={buttonClasses}
                            onClick={() => onSelectDay(day.id)}
                            disabled={isDisabled}
                            aria-label={fullLabel}
                            title={isCollapsed ? `${t('sidebar.day.label', { dayId: day.id, dayTitle: dayTitle })}` : ''}
                        >
                            <span className="day-number">{day.id}</span>
                            <span className="day-title">{dayTitle}</span>
                            {isDisabled && <Icon name="lock" />}
                        </button>
                    );
                })}
            </nav>
            <button 
                onClick={toggleSidebar} 
                className="sidebar-toggle" 
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                <Icon name={isCollapsed ? 'chevrons-right' : 'chevrons-left'} />
            </button>
        </aside>
    );
};