import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { gamificationData, Badge } from '../data';
import { Icon } from './Header';

interface AchievementsModalProps {
    onClose: () => void;
    unlockedBadges: Set<string>;
    stats: {
        daysCompleted: number;
        currentStreak: number;
    };
    onGenerateDnaReport: () => void;
    isDnaReportGenerating: boolean;
}

const StatCard: React.FC<{ value: number | string; label: string }> = ({ value, label }) => (
    <div className="stat-card">
        <div className="value">{value}</div>
        <div className="label">{label}</div>
    </div>
);

const BadgeItem: React.FC<{ badge: Badge; isUnlocked: boolean }> = ({ badge, isUnlocked }) => {
    const { t } = useTranslation();
    const className = isUnlocked ? 'unlocked' : 'locked';
    return (
        <div className={`badge-item ${className}`}>
            <div className="badge-icon">
                <Icon name={badge.icon} />
            </div>
            <div className="badge-info">
                <h4>{t(`achievements.badge.${badge.id}.name`)}</h4>
                {isUnlocked && <p>{t(`achievements.badge.${badge.id}.description`)}</p>}
            </div>
        </div>
    );
};

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ onClose, unlockedBadges, stats, onGenerateDnaReport, isDnaReportGenerating }) => {
    const { t } = useTranslation();
    const isCourseCompleted = stats.daysCompleted >= 30;
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content achievements-modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose} aria-label={t('reminders.modal.close')}>×</button>
                <h2>{t('achievements.modal.title')}</h2>
                
                <div className="stats-container">
                    <StatCard value={stats.daysCompleted} label={t('achievements.stats.daysCompleted')} />
                    <StatCard value={stats.currentStreak} label={t('achievements.stats.currentStreak')} />
                </div>
                
                <div className="badge-grid">
                    {gamificationData.badges.map(badge => (
                        <BadgeItem 
                            key={badge.id} 
                            badge={badge}
                            isUnlocked={unlockedBadges.has(badge.id)} 
                        />
                    ))}
                </div>
                
                {isCourseCompleted && (
                     <div className="dna-report-trigger">
                        <p>{t('achievements.dnaReport.description')}</p>
                        <button 
                            onClick={onGenerateDnaReport} 
                            disabled={isDnaReportGenerating}
                        >
                            {isDnaReportGenerating ? t('achievements.dnaReport.loading') : t('achievements.dnaReport.button')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};