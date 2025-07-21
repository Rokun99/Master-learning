
import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { ReminderSubscription } from '../storage';

interface ReminderModalProps {
    onClose: () => void;
    subscription: ReminderSubscription | null;
    onUpdateSubscription: (sub: ReminderSubscription | null) => Promise<void>;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({ onClose, subscription, onUpdateSubscription }) => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        if (!email || !email.includes('@')) {
            setStatus('error');
            setErrorMessage(t('reminders.modal.error.empty'));
            return;
        }

        try {
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.message || t('reminders.alert.error.default'));
            }
            
            await onUpdateSubscription({ email, subscribed: true });
            setStatus('idle');
            // The modal will now show the subscribed view automatically
        } catch (error: any) {
            setStatus('error');
            setErrorMessage(error.message || t('reminders.alert.error.connection'));
        }
    };

    const handleUnsubscribe = async () => {
        if (!subscription) return;
        setStatus('loading');
        setErrorMessage('');

        try {
             const response = await fetch('/api/unsubscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: subscription.email }),
            });
             if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.message || t('reminders.alert.error.default'));
            }
            await onUpdateSubscription(null);
            setStatus('idle');
        } catch (error: any) {
             setStatus('error');
            setErrorMessage(error.message || t('reminders.alert.error.connection'));
        }
    };


    const renderContent = () => {
        if (subscription?.subscribed) {
            return (
                 <div>
                    <p>{t('reminders.modal.success.message', { email: subscription.email })}</p>
                    {status === 'error' && <p className="error-message">{errorMessage}</p>}
                    <div className="modal-actions">
                        <button onClick={handleUnsubscribe} className="button-danger" disabled={status === 'loading'}>
                            {status === 'loading' ? t('reminders.modal.button.loading') : t('reminders.modal.button.unsubscribe')}
                        </button>
                         <button onClick={onClose} className="button-secondary">
                            {t('reminders.modal.close')}
                        </button>
                    </div>
                </div>
            )
        }
        return (
            <form onSubmit={handleSubscribe}>
                <p>{t('reminders.modal.description')}</p>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('reminders.modal.placeholder')}
                    required
                    aria-label={t('reminders.modal.placeholder')}
                />
                {status === 'error' && <p className="error-message">{errorMessage}</p>}
                <button type="submit" disabled={status === 'loading'}>
                    {status === 'loading' ? t('reminders.modal.button.loading') : t('reminders.modal.button.subscribe')}
                </button>
            </form>
        )
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose} aria-label={t('reminders.modal.close')}>×</button>
                <h2>{t('reminders.modal.title')}</h2>
                {renderContent()}
            </div>
        </div>
    );
};