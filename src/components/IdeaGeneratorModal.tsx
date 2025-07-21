
import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { generateIdeas } from '../lib/gemini';
import { Icon } from './Header';

interface Idea {
    title: string;
    description: string;
}

interface IdeaGeneratorModalProps {
    onClose: () => void;
}

const IdeaCard: React.FC<{ idea: Idea, index: number }> = ({ idea, index }) => {
    return (
        <div className="idea-card" style={{ animationDelay: `${index * 100}ms` }}>
            <h4>{idea.title}</h4>
            <p>{idea.description}</p>
        </div>
    );
};

export const IdeaGeneratorModal: React.FC<IdeaGeneratorModalProps> = ({ onClose }) => {
    const { t } = useTranslation();
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [ideas, setIdeas] = useState<Idea[]>([]);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || isLoading) return;

        setIsLoading(true);
        setError('');
        setIdeas([]);

        try {
            const systemInstruction = t('ideaGenerator.modal.systemPrompt');
            const generatedIdeas = await generateIdeas(prompt, systemInstruction);
            setIdeas(generatedIdeas);

        } catch (e: any) {
            console.error("Idea Generation Error:", e);
            setError(t('ideaGenerator.modal.error.generic'));
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose} aria-label={t('ideaGenerator.modal.close')}>×</button>
                <h2>{t('ideaGenerator.modal.title')}</h2>
                <p>{t('ideaGenerator.modal.description')}</p>
                <form onSubmit={handleGenerate}>
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={t('ideaGenerator.modal.placeholder')}
                        aria-label={t('ideaGenerator.modal.placeholder')}
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !prompt.trim()}>
                        {isLoading ? t('ideaGenerator.modal.button.loading') : t('ideaGenerator.modal.button.generate')}
                    </button>
                </form>

                <div className="idea-results">
                    {isLoading && (
                        <div className="idea-generator-loader-container">
                            <div className="loader"></div>
                        </div>
                    )}
                    {error && <p className="error-message">{error}</p>}
                    {ideas.length > 0 && (
                        <div className="idea-card-list">
                            {ideas.map((idea, index) => (
                                <IdeaCard key={index} idea={idea} index={index} />
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};
