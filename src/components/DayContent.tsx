import React, { useState, useEffect, useRef } from 'react';
import { DayData } from '../data';
import { useTranslation } from '../hooks/useTranslation';
import { ChatMessage, Feedback } from '../storage';
import { getAiChatResponse, generateImageForPrompt, getStructuredFeedback } from '../lib/gemini';
import { Icon } from './Header';

interface DayContentProps {
    dayData: DayData;
    journalEntry: ChatMessage[];
    onUpdateJournal: (dayId: number, entry: ChatMessage[]) => void;
    onCompleteAndContinue: (dayId: number) => void;
    layout: 'mobile' | 'reading' | 'exercise';
}

const AIAvatar = () => (
    <div className="ai-avatar" title="AI Coach">
        <Icon name="brain-circuit" />
    </div>
);

const formatRelativeTime = (timestamp: number, t: (key: string, replacements?: Record<string, string | number>) => string): string => {
    const now = Date.now();
    const seconds = Math.floor((now - timestamp) / 1000);

    if (seconds < 60) return t('time.justNow');
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return minutes === 1 ? t('time.minuteAgo') : t('time.minutesAgo', { count: minutes });
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return hours === 1 ? t('time.hourAgo') : t('time.hoursAgo', { count: hours });
    }

    const days = Math.floor(hours / 24);
    return days === 1 ? t('time.dayAgo') : t('time.daysAgo', { count: days });
};

const RelativeTimestamp: React.FC<{ timestamp: number }> = ({ timestamp }) => {
    const { t } = useTranslation();
    const [relativeTime, setRelativeTime] = useState(() => formatRelativeTime(timestamp, t));

    useEffect(() => {
        const update = () => setRelativeTime(formatRelativeTime(timestamp, t));
        update(); // Update immediately on mount
        const interval = setInterval(update, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [timestamp, t]);

    return <div className="message-timestamp">{relativeTime}</div>;
};


const DayReadingContent: React.FC<{ dayData: DayData }> = ({ dayData }) => {
    const { t } = useTranslation();
    return (
        <article className="day-content-container">
            <h2>{t('day.titlePrefix', { dayId: dayData.id })}: {t(dayData.title)}</h2>
            <p><em>{t(dayData.subtitle)}</em></p>

            <div className="readable-content">
                {dayData.introduction && <p dangerouslySetInnerHTML={{ __html: t(dayData.introduction) }}></p>}

                {dayData.sections.map((section, index) => (
                    <section key={index}>
                         <h3>
                            <Icon name="book-open" />
                            <span>{t(section.title)}</span>
                        </h3>
                        {section.content.map((item, itemIndex) => {
                            if (typeof item === 'string') {
                                return <p key={itemIndex} dangerouslySetInnerHTML={{ __html: t(item) }}></p>;
                            }
                            if (item.type === 'list') {
                                return (
                                    <ul key={itemIndex}>
                                        {item.items.map((li, liIndex) => <li key={liIndex} dangerouslySetInnerHTML={{ __html: t(li) }}></li>)}
                                    </ul>
                                );
                            }
                            return null;
                        })}
                    </section>
                ))}

                {dayData.takeaways.length > 0 && (
                    <>
                        <h3>
                             <Icon name="check-circle" />
                            <span>{t('day.takeawaysTitle')}</span>
                        </h3>
                        <ul>
                            {dayData.takeaways.map((takeaway, index) => <li key={index}>{t(takeaway)}</li>)}
                        </ul>
                    </>
                )}
            </div>
        </article>
    )
};

const DayExerciseContent: React.FC<Omit<DayContentProps, 'layout'>> = ({ dayData, journalEntry, onUpdateJournal, onCompleteAndContinue }) => {
    const { t } = useTranslation();
    const [messages, setMessages] = useState<ChatMessage[]>(journalEntry);
    const [userInput, setUserInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [isSpecialLoading, setIsSpecialLoading] = useState(false);
    const [error, setError] = useState('');
    const messageListRef = useRef<HTMLDivElement>(null);
    const [sentMessageId, setSentMessageId] = useState<number | null>(null);

    const hasUserEngaged = messages.some(m => m.sender === 'user');

    useEffect(() => {
        messageListRef.current?.scrollTo({ top: messageListRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        setMessages(journalEntry);
        if (journalEntry.length === 0) {
            const firstMessage: ChatMessage = {
                sender: 'ai',
                text: t(dayData.exercise.description),
                timestamp: Date.now(),
                type: 'text'
            };
            setMessages([firstMessage]);
            onUpdateJournal(dayData.id, [firstMessage]);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dayData.id, journalEntry.length]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isChatLoading) return;

        const userMessage: ChatMessage = {
            sender: 'user',
            text: userInput,
            timestamp: Date.now(),
            type: 'text'
        };
        
        const currentMessages = [...messages, userMessage];
        setMessages(currentMessages);
        onUpdateJournal(dayData.id, currentMessages);
        setUserInput('');
        setIsChatLoading(true);
        setError('');
        
        setSentMessageId(userMessage.timestamp);
        setTimeout(() => setSentMessageId(null), 500);

        try {
            const history = currentMessages
                .filter(m => m.type === 'text')
                .map(m => {
                    if (m.sender === 'user' || m.sender === 'ai') {
                        const role: 'user' | 'model' = m.sender === 'user' ? 'user' : 'model';
                        return { role, parts: [{ text: m.text }] };
                    }
                    return null;
                })
                .filter((item): item is { role: "user" | "model"; parts: { text: string; }[] } => item !== null);
            
            const systemInstruction = t('exercise.chat.systemPrompt', { 
                topic: t(dayData.title), 
                description: t(dayData.exercise.description) 
            });

            const aiResponseText = await getAiChatResponse(history, systemInstruction);
            
            const aiMessage: ChatMessage = {
                sender: 'ai',
                text: aiResponseText,
                timestamp: Date.now(),
                type: 'text'
            };
            
            const finalMessages = [...currentMessages, aiMessage];
            setMessages(finalMessages);
            onUpdateJournal(dayData.id, finalMessages);

        } catch (err: any) {
            console.error(err);
            setError(t('exercise.chat.error.generic'));
            // Revert optimistic update on error
            setMessages(messages);
            onUpdateJournal(dayData.id, messages);
        } finally {
            setIsChatLoading(false);
        }
    };
    
    const handleGetFeedback = async () => {
        setIsSpecialLoading(true);
        setError('');
        const conversationContext = messages.map(m => `${m.sender}: ${m.text}`).join('\n');
        const fullPrompt = `${t('exercise.feedback.systemPrompt')}\n\n## Conversation History:\n${conversationContext}`;
        try {
            const feedbackResult = await getStructuredFeedback(fullPrompt);
            const feedbackMessage: ChatMessage = {
                sender: 'system',
                text: t('exercise.feedback.received'),
                timestamp: Date.now(),
                type: 'feedback',
                feedback: feedbackResult
            };
            const newMessages = [...messages, feedbackMessage];
            setMessages(newMessages);
            onUpdateJournal(dayData.id, newMessages);
        } catch (err) {
            console.error(err);
            setError(t('exercise.chat.error.generic'));
        } finally {
            setIsSpecialLoading(false);
        }
    };

    const handleVisualize = async () => {
        setIsSpecialLoading(true);
        setError('');
        const lastUserMessage = [...messages].reverse().find(m => m.sender === 'user')?.text || 'my creative project idea';
        const fullPrompt = `${t('exercise.visualize.systemPrompt')}: ${lastUserMessage}`;
        try {
            const imageUrl = await generateImageForPrompt(fullPrompt);
            const imageMessage: ChatMessage = {
                sender: 'system',
                text: `Image generated for: "${lastUserMessage}"`,
                timestamp: Date.now(),
                type: 'image',
                imageUrl
            };
            const newMessages = [...messages, imageMessage];
            setMessages(newMessages);
            onUpdateJournal(dayData.id, newMessages);
        } catch (err) {
            console.error(err);
            setError(t('exercise.chat.error.generic'));
        } finally {
            setIsSpecialLoading(false);
        }
    };

    const sendIcon = <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;

    return (
        <>
            <div className="exercise-box chat-exercise-box">
                <h4>
                    <Icon name="zap" />
                    <span>{t(dayData.exercise.title)}</span>
                </h4>

                {dayData.exercise.specialFeature && (
                    <div className="special-feature-controls">
                        {dayData.exercise.specialFeature === 'feedback' && (
                            <button onClick={handleGetFeedback} disabled={isSpecialLoading || !hasUserEngaged} className="special-feature-button">
                                {isSpecialLoading ? t('exercise.chat.loading') : t('exercise.button.getFeedback')}
                            </button>
                        )}
                        {dayData.exercise.specialFeature === 'visualize' && (
                            <button onClick={handleVisualize} disabled={isSpecialLoading || !hasUserEngaged} className="special-feature-button">
                                {isSpecialLoading ? t('exercise.chat.loading') : t('exercise.button.visualize')}
                            </button>
                        )}
                    </div>
                )}
                
                <div className="chat-message-list" ref={messageListRef}>
                    {messages.map((msg) => (
                        <div key={msg.timestamp} className={`chat-message-wrapper ${msg.sender}`}>
                            {msg.sender === 'ai' && <AIAvatar />}
                            <div className="message-content">
                                {(() => {
                                    const messageClass = msg.sender === 'user'
                                        ? `chat-message user ${msg.timestamp === sentMessageId ? 'sent-animation' : ''}`
                                        : `chat-message ${msg.sender}`;
                                    
                                    if (msg.type === 'image') {
                                        return (
                                            <div className="chat-message system">
                                                <div className="ai-generated-image-container">
                                                    {msg.imageUrl ? <img src={msg.imageUrl} alt={msg.text} className="ai-generated-image" /> : <div className="loader"></div>}
                                                </div>
                                            </div>
                                        );
                                    }
                                    if (msg.type === 'feedback' && msg.feedback) {
                                        return (
                                            <div className="chat-message system">
                                                <div className="feedback-container">
                                                    <div className="feedback-card"><h5>{t('exercise.feedback.like')}</h5><p>{msg.feedback.like}</p></div>
                                                    <div className="feedback-card"><h5>{t('exercise.feedback.wish')}</h5><p>{msg.feedback.wish}</p></div>
                                                    <div className="feedback-card"><h5>{t('exercise.feedback.whatIf')}</h5><p>{msg.feedback.whatIf}</p></div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return (
                                        <div className={messageClass}>
                                            <p dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }} />
                                        </div>
                                    );
                                })()}
                                <RelativeTimestamp timestamp={msg.timestamp} />
                            </div>
                        </div>
                    ))}
                    {isChatLoading && (
                        <div className="chat-message-wrapper ai">
                            <AIAvatar />
                            <div className="message-content">
                                <div className="chat-message ai loading">
                                    <p>{t('exercise.chat.loading')}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {error && <p className="error-message">{error}</p>}
                <form className="chat-input-form" onSubmit={handleSendMessage}>
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder={t('exercise.chat.placeholder')}
                        disabled={isChatLoading || isSpecialLoading}
                        aria-label={t('exercise.chat.placeholder')}
                    />
                    <button type="submit" disabled={isChatLoading || isSpecialLoading || !userInput.trim()} aria-label={t('exercise.chat.button.send')}>
                        {sendIcon}
                    </button>
                </form>
            </div>
            <div className="complete-day-button-container">
                <button 
                    className="complete-day-button"
                    onClick={() => onCompleteAndContinue(dayData.id)}
                    disabled={!hasUserEngaged}
                >
                    {t('day.completeButton')}
                </button>
            </div>
        </>
    );
};


export const DayContent: React.FC<DayContentProps> = (props) => {
    const { layout, ...rest } = props;

    if (layout === 'mobile') {
        return (
            <div className="day-content-container">
                <DayReadingContent dayData={props.dayData} />
                <DayExerciseContent {...rest} />
            </div>
        );
    }
    if (layout === 'reading') {
        return <DayReadingContent dayData={props.dayData} />;
    }
    if (layout === 'exercise') {
        return <DayExerciseContent {...rest} />;
    }

    return null;
};
