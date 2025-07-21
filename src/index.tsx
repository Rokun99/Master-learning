import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { getDB, ChatMessage, JournalEntry, DnaReportData, ReminderSubscription } from './storage';
import { TranslationProvider, useTranslation } from './hooks/useTranslation';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileDayView } from './components/MobileDayView';
import { DesktopDayView } from './components/DesktopDayView';
import { ReminderModal } from './components/ReminderModal';
import { IdeaGeneratorModal } from './components/IdeaGeneratorModal';
import { AchievementsModal } from './components/AchievementsModal';
import { DnaReportModal } from './components/DnaReportModal';
import { OnboardingModal } from './components/OnboardingModal';
import { Toast } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { courseData, gamificationData } from './data';
import { generateDnaReport } from './lib/gemini';
import './index.css';

interface ToastContent {
    id: string;
    badgeName: string;
}

const getInitialSidebarState = () => {
    if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        if (width >= 768 && width < 1024) return true; // tablet, collapsed
        if (width >= 1024) return false; // desktop, expanded
    }
    return false; // mobile, doesn't apply but won't be visible
};

const AppContent = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [theme, setThemeState] = useState('light');
    const [selectedDay, setSelectedDayState] = useState<number>(1);
    const [journalEntries, setJournalEntriesState] = useState<Record<number, JournalEntry>>({});
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
    const [reminderSubscription, setReminderSubscription] = useState<ReminderSubscription | null>(null);
    const [isIdeaGeneratorOpen, setIsIdeaGeneratorOpen] = useState(false);
    const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);
    const [isDnaReportModalOpen, setIsDnaReportModalOpen] = useState(false);
    const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
    const [dnaReportData, setDnaReportData] = useState<DnaReportData | null>(null);
    const [isDnaReportGenerating, setIsDnaReportGenerating] = useState(false);
    const [unlockedBadges, setUnlockedBadges] = useState<Set<string>>(new Set());
    const [toastQueue, setToastQueue] = useState<ToastContent[]>([]);

    const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(getInitialSidebarState());

    const { setLang, t } = useTranslation();

    const completedDays = useMemo(() => new Set(Object.values(journalEntries).filter((entry) => !!entry.completedAt).map((entry) => entry.dayId)), [journalEntries]);

    useEffect(() => {
        async function loadData() {
            try {
                const db = await getDB();
                const [storedLang, storedTheme, storedDay, storedEntries, storedBadges, onboardingCompleted, storedSubscription] = await Promise.all([
                    db.get('settings', 'language'),
                    db.get('settings', 'theme'),
                    db.get('settings', 'selectedDay'),
                    db.getAll('journal'),
                    db.getAll('achievements'),
                    db.get('settings', 'onboardingCompleted'),
                    db.get('reminders', 'subscription')
                ]);

                const entries: Record<number, JournalEntry> = {};
                storedEntries.forEach(entry => {
                    entries[entry.dayId] = entry;
                });
                setJournalEntriesState(entries);
                
                if (storedLang) await setLang(storedLang);

                const initialTheme = storedTheme || (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                setThemeState(initialTheme);
                document.body.setAttribute('data-theme', initialTheme);

                setSelectedDayState(storedDay || 1);
                setUnlockedBadges(new Set(storedBadges.map(b => b.id)));
                setReminderSubscription(storedSubscription || null);

                if (!onboardingCompleted) {
                    setIsOnboardingOpen(true);
                }
            } catch (error) {
                console.error("Failed to load data from DB:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    const setSelectedDay = useCallback(async (dayId: number) => {
        if (dayId < 1 || dayId > 30) return;
        const isCompleted = completedDays.has(dayId);
        const isUnlocked = dayId === 1 || completedDays.has(dayId - 1) || isCompleted;

        if (isUnlocked) {
            setSelectedDayState(dayId);
            await (await getDB()).put('settings', dayId, 'selectedDay');
        }
    }, [completedDays]);

    useEffect(() => {
        const handleScroll = () => setIsHeaderScrolled(window.scrollY > 20);
        const handleResize = () => setIsSidebarCollapsed(getInitialSidebarState());
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize);

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.metaKey || e.ctrlKey || e.altKey) return;
            if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
                return;
            }

            if (e.key === 'ArrowRight') {
                e.preventDefault();
                setSelectedDay(selectedDay + 1);
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                setSelectedDay(selectedDay - 1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedDay, setSelectedDay]);


    const checkAndUnlockAchievements = useCallback(async (currentCompletedDays: Set<number>) => {
        const db = await getDB();
        for (const badge of gamificationData.badges) {
            if (!unlockedBadges.has(badge.id) && badge.condition(currentCompletedDays)) {
                const newBadgeRecord = { id: badge.id, unlockedAt: Date.now() };
                await db.put('achievements', newBadgeRecord);
                setUnlockedBadges(prev => new Set(prev).add(badge.id));
                setToastQueue(prev => [...prev, { id: badge.id, badgeName: t(`achievements.badge.${badge.id}.name`) }]);
            }
        }
    }, [unlockedBadges, t]);
    
    useEffect(() => {
        if (!isLoading) {
            checkAndUnlockAchievements(completedDays);
        }
    }, [completedDays, isLoading, checkAndUnlockAchievements]);


    const setTheme = async (newTheme: string) => {
        setThemeState(newTheme);
        document.body.setAttribute('data-theme', newTheme);
        await (await getDB()).put('settings', newTheme, 'theme');
    };
    
    const setJournalEntry = async (dayId: number, content: ChatMessage[]) => {
        const existingEntry = journalEntries[dayId] || { dayId, content: [] };
        const updatedEntry = { ...existingEntry, content };
        const newEntries = { ...journalEntries, [dayId]: updatedEntry };
        setJournalEntriesState(newEntries);
        await (await getDB()).put('journal', updatedEntry);
    };

    const handleCompleteAndContinue = async (dayId: number) => {
        const entry = journalEntries[dayId] || { dayId, content: [] };
        if (entry.completedAt) { // Already completed, just navigate
            const nextDay = dayId + 1;
            if (nextDay <= 30) {
                setSelectedDay(nextDay);
            }
            return;
        }

        const updatedEntry = { ...entry, completedAt: Date.now() };
        const newEntries = { ...journalEntries, [dayId]: updatedEntry };
        setJournalEntriesState(newEntries);
        await (await getDB()).put('journal', updatedEntry);

        const nextDay = dayId + 1;
        if (nextDay <= 30) {
            setSelectedDay(nextDay);
        }
    };

    const handleUpdateSubscription = async (sub: ReminderSubscription | null) => {
        setReminderSubscription(sub);
        const db = await getDB();
        if (sub) {
            await db.put('reminders', sub, 'subscription');
        } else {
            await db.delete('reminders', 'subscription');
        }
    };

    const handleCompleteOnboarding = async () => {
        setIsOnboardingOpen(false);
        await (await getDB()).put('settings', true, 'onboardingCompleted');
    };

    const calculateStreak = () => {
        const completedTimestamps = Object.values(journalEntries)
            .filter((entry) => entry.completedAt)
            .map((entry) => entry.completedAt as number)
            .sort((a, b) => b - a);

        if (completedTimestamps.length === 0) return 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const lastCompletionDate = new Date(completedTimestamps[0]);
        lastCompletionDate.setHours(0, 0, 0, 0);

        if (lastCompletionDate.getTime() !== today.getTime() && lastCompletionDate.getTime() !== yesterday.getTime()) {
            return 0;
        }

        let streak = 1;
        let lastUniqueDate = lastCompletionDate;

        for (let i = 1; i < completedTimestamps.length; i++) {
            const currentCompletionDate = new Date(completedTimestamps[i]);
            currentCompletionDate.setHours(0, 0, 0, 0);
            
            if (currentCompletionDate.getTime() === lastUniqueDate.getTime()) {
                continue;
            }

            const expectedPreviousDate = new Date(lastUniqueDate);
            expectedPreviousDate.setDate(lastUniqueDate.getDate() - 1);

            if (currentCompletionDate.getTime() === expectedPreviousDate.getTime()) {
                streak++;
                lastUniqueDate = currentCompletionDate;
            } else {
                break;
            }
        }
        
        return streak;
    };
    
    const todayIndex = useMemo(() => {
        const day1Entry = Object.values(journalEntries).find((entry) => entry.dayId === 1 && entry.completedAt);
        if (!day1Entry || !day1Entry.completedAt) {
            // If day 1 is not completed, today is day 1
            return 1;
        }

        const day1Date = new Date(day1Entry.completedAt);
        day1Date.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const diffTime = Math.abs(today.getTime() - day1Date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const currentChallengeDay = diffDays + 1;
        
        return Math.min(currentChallengeDay, 30);
    }, [journalEntries]);


    const handleGenerateDnaReport = async () => {
        const db = await getDB();
        setIsDnaReportGenerating(true);
        setIsAchievementsModalOpen(false); // Close achievements modal
        setIsDnaReportModalOpen(true); // Open DNA modal
    
        try {
            const storedReport = await db.get('dnaReport', 'userReport');
            if (storedReport) {
                setDnaReportData(storedReport);
                setIsDnaReportGenerating(false);
                return;
            }
    
            const allEntries: JournalEntry[] = Object.values(journalEntries);
            const journalText = allEntries
                .sort((a, b) => a.dayId - b.dayId)
                .map(entry => {
                    const entryText = entry.content
                        .filter(msg => msg.sender === 'user' && msg.text)
                        .map(msg => msg.text)
                        .join('\n');
                    return `--- Day ${entry.dayId} ---\n${entryText}`;
                })
                .join('\n\n');

            const systemPrompt = t('dnaReport.systemPrompt');
            const fullPrompt = `${systemPrompt}\n\n## User's Journal Entries:\n${journalText}`;

            const report = await generateDnaReport(fullPrompt);
            
            const newReportData: DnaReportData = { ...report, generatedAt: Date.now() };
            setDnaReportData(newReportData);
            await db.put('dnaReport', newReportData, 'userReport');
    
            if (!unlockedBadges.has('dna_report')) {
                const newBadgeRecord = { id: 'dna_report', unlockedAt: Date.now() };
                await db.put('achievements', newBadgeRecord);
                setUnlockedBadges(prev => new Set(prev).add('dna_report'));
                setToastQueue(prev => [...prev, { id: 'dna_report', badgeName: t('achievements.badge.dna_report.name') }]);
            }
    
        } catch (error) {
            console.error("Failed to generate DNA report:", error);
            setDnaReportData(null); 
        } finally {
            setIsDnaReportGenerating(false);
        }
    };

    if (isLoading) {
        return <div className="app-loader">{t('app.loading')}</div>;
    }
    
    const currentStreak = calculateStreak();

    return (
        <>
            <Header 
                theme={theme} 
                setTheme={setTheme} 
                onOpenReminderModal={() => setIsReminderModalOpen(true)}
                onOpenIdeaGenerator={() => setIsIdeaGeneratorOpen(true)}
                onOpenAchievementsModal={() => setIsAchievementsModalOpen(true)}
                currentStreak={currentStreak}
                isScrolled={isHeaderScrolled}
                isSubscribed={!!reminderSubscription?.subscribed}
            />
            <div className="app-container">
                <Sidebar
                    days={courseData}
                    activeDay={selectedDay}
                    todayIndex={todayIndex}
                    completedDays={completedDays}
                    onSelectDay={setSelectedDay}
                    isCollapsed={isSidebarCollapsed}
                    toggleSidebar={() => setIsSidebarCollapsed(prev => !prev)}
                />
                <main className="main-content">
                    <MobileDayView 
                        days={courseData}
                        activeDay={selectedDay}
                        setActiveDay={setSelectedDay}
                        journalEntries={journalEntries}
                        onUpdateJournal={setJournalEntry}
                        completedDays={completedDays}
                        onCompleteAndContinue={handleCompleteAndContinue}
                    />
                     <DesktopDayView
                        dayId={selectedDay}
                        journalEntry={journalEntries[selectedDay] || { dayId: selectedDay, content: [] }}
                        onUpdateJournal={setJournalEntry}
                        completedDays={completedDays}
                        onCompleteAndContinue={handleCompleteAndContinue}
                    />
                </main>
            </div>
             {isReminderModalOpen && 
                <ReminderModal 
                    onClose={() => setIsReminderModalOpen(false)} 
                    subscription={reminderSubscription}
                    onUpdateSubscription={handleUpdateSubscription}
                />}
             {isIdeaGeneratorOpen && <IdeaGeneratorModal onClose={() => setIsIdeaGeneratorOpen(false)} />}
             {isAchievementsModalOpen && (
                <AchievementsModal 
                    onClose={() => setIsAchievementsModalOpen(false)}
                    unlockedBadges={unlockedBadges}
                    stats={{
                        daysCompleted: completedDays.size,
                        currentStreak: currentStreak,
                    }}
                    onGenerateDnaReport={handleGenerateDnaReport}
                    isDnaReportGenerating={isDnaReportGenerating}
                />
            )}
             {isDnaReportModalOpen && (
                <DnaReportModal
                    onClose={() => setIsDnaReportModalOpen(false)}
                    reportData={dnaReportData}
                    isLoading={isDnaReportGenerating}
                />
            )}
            {isOnboardingOpen && (
                <OnboardingModal onComplete={handleCompleteOnboarding} />
            )}
            <div className="toast-container">
                {toastQueue.map((toast) => (
                    <Toast
                        key={toast.id}
                        message={t('achievements.toast.unlocked')}
                        badgeName={toast.badgeName}
                        onClose={() => setToastQueue(q => q.filter(t => t.id !== toast.id))}
                    />
                ))}
            </div>
        </>
    );
};

const App = () => (
    <TranslationProvider>
        <ErrorBoundary>
            <AppContent />
        </ErrorBoundary>
    </TranslationProvider>
);

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}