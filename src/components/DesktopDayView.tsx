
import React from 'react';
import { courseData } from '../data';
import { DayContent } from './DayContent';
import { JournalEntry } from '../storage';

interface DesktopDayViewProps {
    dayId: number;
    journalEntry: JournalEntry;
    onUpdateJournal: (dayId: number, entry: JournalEntry['content']) => void;
    completedDays: Set<number>;
    onCompleteAndContinue: (dayId: number) => void;
}

export const DesktopDayView: React.FC<DesktopDayViewProps> = ({ dayId, journalEntry, onUpdateJournal, onCompleteAndContinue }) => {
    const currentDayData = courseData.find(day => day.id === dayId);
    if (!currentDayData) return null;

    return (
        <div className="desktop-view-grid">
            <div className="day-reading-content">
                 <DayContent
                    key={currentDayData.id}
                    dayData={currentDayData}
                    journalEntry={journalEntry.content}
                    onUpdateJournal={onUpdateJournal}
                    onCompleteAndContinue={onCompleteAndContinue}
                    layout="reading"
                />
            </div>
             <div className="day-exercise-container">
                 <DayContent
                    key={`${currentDayData.id}-exercise`}
                    dayData={currentDayData}
                    journalEntry={journalEntry.content}
                    onUpdateJournal={onUpdateJournal}
                    onCompleteAndContinue={onCompleteAndContinue}
                    layout="exercise"
                />
            </div>
        </div>
    );
};