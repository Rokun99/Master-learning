
import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

// --- Icon Komponente ---

interface IconProps {
  name: string;
}

export const Icon: React.FC<IconProps> = ({ name }) => {
  const icons: { [key: string]: React.ReactElement } = {
    moon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
    ),
    sun: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m4.93 19.07 1.41-1.41" />
        <path d="m17.66 6.34 1.41-1.41" />
      </svg>
    ),
    globe: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    sparkles: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.5 3-3 1.5 3 1.5 1.5 3 1.5-3 3-1.5-3-1.5z" />
        <path d="M20 15l-1.5 3-3 1.5 3 1.5 1.5 3 1.5-3 3-1.5-3-1.5z" />
        <path d="M4 7l-1.5 3-3 1.5 3 1.5 1.5 3 1.5-3 3-1.5-3-1.5z" />
      </svg>
    ),
    bell: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
    ),
     'bell-check': (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19.36 14.36a9.06 9.06 0 0 1-8.38-10.64 6 6 0 0 1 11.06 4.39c0 3.82 2.68 5.88 3 6.25" />
        <path d="M10.33 21a1.94 1.94 0 0 0 3.34 0" />
        <path d="M6 8a6 6 0 0 0-6 6c0 7 3 9 3 9h7" />
        <path d="M2 21h6" />
        <path d="m14 10 2 2 4-4" />
      </svg>
    ),
    award: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
    'book-open': (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    'check-circle': (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <path d="m9 11 3 3L22 4" />
      </svg>
    ),
    zap: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2z" />
      </svg>
    ),
    flame: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 12c2-2.96 0-7-1-8-1-1-2.5-1.5-3.5-1.5-2 0-4 2-4 6 0 4.5 4 6.5 6 8.5 2 2 6 2.5 8 1.5 2-1 3-3.5 3-5.5 0-2-1-4-3-4-1.5 0-2.5 1-3.5 2.5" />
      </svg>
    ),
    flag: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" y1="22" x2="4" y2="15" />
      </svg>
    ),
    rocket: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.3.05-3.11.63-1.4 1.84-2.3 3.45-2.3.62 0 1.2.13 1.73.36V7c0-2-2-4-4-4S8 5 8 7v1.44C7.45 8.63 7 9.27 7 10a5 5 0 0 0 5 5c.47 0 .92-.07 1.35-.2.5.95.8 2.16.5 3.35-1.07 1.25-3.3 1.95-5.35 1.95-2.05 0-4.28-.7-5.35-1.95Z" />
      </svg>
    ),
    trophy: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 21h8" />
        <path d="M12 17v4" />
        <path d="M7 4h10" />
        <path d="M17 4v8a5 5 0 0 1-10 0V4" />
        <path d="M5 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
        <path d="M19 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
      </svg>
    ),
    'edit-3': (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    ),
    'brain-circuit': (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.5 11c.6-.9 1-2 1-3.2A6.8 6.8 0 0 0 12 1a6.8 6.8 0 0 0-6.5 6.8c0 1.2.4 2.3 1 3.2" />
        <path d="M6.5 13c-.6.9-1 2-1 3.2A6.8 6.8 0 0 0 12 23a6.8 6.8 0 0 0 6.5-6.8c0-1.2-.4-2.3-1-3.2" />
        <path d="M12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
        <path d="M4 11h2" />
        <path d="M18 11h2" />
        <path d="M12 1v2" />
        <path d="M12 21v2" />
        <path d="M4.9 4.9l1.4 1.4" />
        <path d="M17.7 17.7l1.4 1.4" />
      </svg>
    ),
    lock: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    'chevrons-left': (
       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m11 17-5-5 5-5"/><path d="m18 17-5-5 5-5"/></svg>
    ),
    'chevrons-right': (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 17 5-5-5-5"/><path d="m13 17 5-5-5-5"/></svg>
    ),
  };

  return icons[name] || null;
};

// --- Header Komponente ---

interface HeaderProps {
  theme: string;
  setTheme: (theme: string) => void;
  onOpenReminderModal: () => void;
  onOpenIdeaGenerator: () => void;
  onOpenAchievementsModal: () => void;
  currentStreak: number;
  isScrolled: boolean;
  isSubscribed: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  setTheme,
  onOpenReminderModal,
  onOpenIdeaGenerator,
  onOpenAchievementsModal,
  currentStreak,
  isScrolled,
  isSubscribed
}) => {
  const { t, setLang, lang } = useTranslation();

  const handleLanguageToggle = async () => {
    const newLang = lang === 'de' ? 'en' : 'de';
    await setLang(newLang);
  };

  return (
    <header className={`main-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-content">
        <h1>{t('app.title')}</h1>
        <p>{t('app.subtitle')}</p>
      </div>
      <div className="header-controls">
        <div className="streak-indicator" title={`${currentStreak} ${t('header.streak')}`}>
          <Icon name="flame" />
          <span>{currentStreak}</span>
        </div>
        <button onClick={onOpenIdeaGenerator} className="control-button" title={t('controls.ideaGenerator.label')} aria-label={t('controls.ideaGenerator.label')}>
          <Icon name="sparkles" />
        </button>
        <button onClick={onOpenAchievementsModal} className="control-button" title={t('controls.achievements.label')} aria-label={t('controls.achievements.label')}>
          <Icon name="trophy" />
        </button>
        <button onClick={onOpenReminderModal} className="control-button" title={t('controls.reminders.label')} aria-label={t('controls.reminders.label')}>
          <Icon name={isSubscribed ? 'bell-check' : 'bell'} />
        </button>
        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="control-button" title={t('controls.toggleTheme.label')} aria-label={t('controls.toggleTheme.label')}>
          <Icon name={theme === 'light' ? 'moon' : 'sun'} />
        </button>
        <button onClick={handleLanguageToggle} className="control-button" title={t('controls.toggleLanguage.label')} aria-label={t('controls.toggleLanguage.label')}>
          <Icon name="globe" />
        </button>
      </div>
    </header>
  );
};