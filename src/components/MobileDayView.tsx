
import React, { useState, useEffect, useRef } from 'react';
import { DayData } from '../data';
import { useTranslation } from '../hooks/useTranslation';
import { DayContent } from './DayContent';
import { JournalEntry } from '../storage';

interface MobileDayViewProps {
    days: DayData[];
    activeDay: number;
    setActiveDay: (dayId: number) => void;
    journalEntries: Record<number, JournalEntry>;
    onUpdateJournal: (dayId: number, content: JournalEntry['content']) => void;
    completedDays: Set<number>;
    onCompleteAndContinue: (dayId: number) => void;
}

type AnimationDirection = 'next' | 'prev' | 'none';

const DayContentSkeleton = () => (
    <article className="day-content-container">
        <div className="skeleton skeleton-h2"></div>
        <div className="skeleton skeleton-p"></div>
        <div className="skeleton skeleton-p-short"></div>
        <div className="skeleton skeleton-h3"></div>
        <div className="skeleton skeleton-p"></div>
        <div className="skeleton skeleton-p"></div>
    </article>
);


export const MobileDayView: React.FC<MobileDayViewProps> = ({ days, activeDay, setActiveDay, journalEntries, onUpdateJournal, completedDays, onCompleteAndContinue }) => {
    const { t } = useTranslation();
    const progress = (completedDays.size / days.length) * 100;
    const [animationDirection, setAnimationDirection] = useState<AnimationDirection>('none');
    const [displayDay, setDisplayDay] = useState(activeDay);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    const handleNavigate = (newDay: number) => {
        if (isTransitioning || newDay === activeDay) return;
        
        if (newDay < 1 || newDay > days.length) return;
       
        const isCompleted = completedDays.has(newDay);
        const isUnlocked = newDay === 1 || completedDays.has(newDay - 1) || isCompleted;

        if (isUnlocked) {
             setActiveDay(newDay);
        }
    };
    
    useEffect(() => {
        if (activeDay !== displayDay) {
            setIsTransitioning(true);
            const direction = activeDay > displayDay ? 'next' : 'prev';
            setAnimationDirection(direction);
            
            const timeoutId = setTimeout(() => {
                setDisplayDay(activeDay);
                setAnimationDirection('none');
                setIsTransitioning(false);
            }, 200); // Corresponds to animation duration

            return () => clearTimeout(timeoutId);
        }
    }, [activeDay, displayDay]);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
    };
    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };
    const handleTouchEnd = () => {
        const threshold = 50; // min swipe distance
        if (touchStartX.current - touchEndX.current > threshold) {
            // Swiped left
            handleNavigate(activeDay + 1);
        } else if (touchEndX.current - touchStartX.current > threshold) {
            // Swiped right
            handleNavigate(activeDay - 1);
        }
        // Reset values
        touchStartX.current = 0;
        touchEndX.current = 0;
    };
    
    const dayData = days.find(d => d.id === displayDay);

    const getAnimationClass = () => {
        if (animationDirection === 'next') return 'slide-out-left';
        if (animationDirection === 'prev') return 'slide-out-right';
        return '';
    };

    const getIncomingAnimationClass = () => {
        if (animationDirection === 'next') return 'slide-in-right';
        if (animationDirection === 'prev') return 'slide-in-left';
        return 'fadeIn'; // Initial load animation
    };

    const isNextDisabled = activeDay === 30 || !completedDays.has(activeDay) || isTransitioning;
    const isPrevDisabled = activeDay === 1 || isTransitioning;

    return (
        <div className="mobile-view">
            <div className="mobile-header">
                <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
            <div 
                className="mobile-day-content-wrapper"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div key={displayDay} className={`mobile-day-content ${getAnimationClass()}`}>
                    {dayData ? (
                        <DayContent
                            key={dayData.id}
                            dayData={dayData}
                            journalEntry={(journalEntries[dayData.id] || { content: [] }).content}
                            onUpdateJournal={onUpdateJournal}
                            onCompleteAndContinue={onCompleteAndContinue}
                            layout="mobile"
                        />
                    ) : (
                        <DayContentSkeleton />
                    )}
                </div>
                {isTransitioning && (
                    <div key={activeDay} className={`mobile-day-content ${getIncomingAnimationClass()}`}>
                        <DayContentSkeleton />
                    </div>
                )}
            </div>
            <nav className="mobile-nav">
                <button onClick={() => handleNavigate(activeDay - 1)} disabled={isPrevDisabled}>{t('controls.nav.prev')}</button>
                <span>{t('day.titlePrefix', { dayId: activeDay })} / 30</span>
                <button onClick={() => handleNavigate(activeDay + 1)} disabled={isNextDisabled}>{t('controls.nav.next')}</button>
            </nav>
        </div>
    );
};