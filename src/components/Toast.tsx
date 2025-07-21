
import React, { useEffect, useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Icon } from './Header';

interface ToastProps {
    message: string;
    badgeName: string;
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, badgeName, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger fade-in animation
        const enterTimeout = setTimeout(() => setIsVisible(true), 10);

        // Set timers for fade-out and unmount
        const exitTimer = setTimeout(() => {
            setIsVisible(false);
            const unmountTimer = setTimeout(onClose, 300); // Wait for animation
            return () => clearTimeout(unmountTimer);
        }, 4000);

        return () => {
            clearTimeout(enterTimeout);
            clearTimeout(exitTimer);
        };
    }, [onClose]);

    return (
        <div className={`toast-notification ${isVisible ? 'visible' : ''}`}>
            <div className="toast-icon">
                <Icon name="award" />
            </div>
            <div className="toast-content">
                <strong>{message}</strong>
                <span>{badgeName}</span>
            </div>
        </div>
    );
};