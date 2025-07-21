
import React from 'react';
import { DnaReportData } from '../storage';
import { useTranslation } from '../hooks/useTranslation';

interface DnaReportModalProps {
    onClose: () => void;
    reportData: DnaReportData | null;
    isLoading: boolean;
}

const WordCloud: React.FC<{ words: { text: string; value: number }[] }> = ({ words }) => {
    const maxVal = Math.max(...words.map(w => w.value), 1);
    return (
        <div className="dna-word-cloud">
            {words.sort((a,b) => b.value - a.value).map((word, index) => {
                const fontSize = 0.8 + (word.value / maxVal) * 1.2;
                const opacity = 0.6 + (word.value / maxVal) * 0.4;
                return (
                    <span key={index} style={{ fontSize: `${fontSize}rem`, opacity }}>
                        {word.text}
                    </span>
                );
            })}
        </div>
    );
};

export const DnaReportModal: React.FC<DnaReportModalProps> = ({ onClose, reportData, isLoading }) => {
    const { t } = useTranslation();

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="dna-report-loader">
                    <div className="loader"></div>
                    <p>{t('dnaReport.modal.generating')}</p>
                </div>
            );
        }

        if (!reportData) {
            return (
                <div className="dna-report-loader">
                    <p className="error-message">{t('dnaReport.modal.error')}</p>
                </div>
            );
        }

        return (
            <div className="dna-report-body">
                <section className="dna-report-section">
                    <h4>{t('dnaReport.archetype.title')}</h4>
                    <h3 className="dna-archetype-name">{reportData.archetype.name}</h3>
                    <p className="dna-archetype-description">{reportData.archetype.description}</p>
                </section>

                <section className="dna-report-section">
                    <h4>{t('dnaReport.themes.title')}</h4>
                    <ul className="dna-theme-list">
                        {reportData.themes.map((theme, i) => <li key={i}>{theme}</li>)}
                    </ul>
                </section>

                <section className="dna-report-section">
                    <h4>{t('dnaReport.breakthrough.title')}</h4>
                    <blockquote className="dna-breakthrough-quote">
                        <p>"{reportData.breakthrough.quote}"</p>
                        <footer>- {t('day.titlePrefix', { dayId: reportData.breakthrough.day })}</footer>
                    </blockquote>
                </section>
                
                <section className="dna-report-section">
                    <h4>{t('dnaReport.wordCloud.title')}</h4>
                    <WordCloud words={reportData.wordCloud} />
                </section>

                <section className="dna-report-section">
                    <h4>{t('dnaReport.pathForward.title')}</h4>
                    <ul className="dna-path-list">
                        {reportData.pathForward.map((path, i) => <li key={i}>{path}</li>)}
                    </ul>
                </section>
            </div>
        );
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content dna-report-modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose} aria-label={t('dnaReport.modal.close')}>×</button>
                <h2>{t('dnaReport.modal.title')}</h2>
                {renderContent()}
            </div>
        </div>
    );
};