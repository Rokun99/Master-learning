
import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Icon } from './Header';

interface OnboardingModalProps {
    onComplete: () => void;
}

const ONBOARDING_STEPS = [
    {
        titleKey: 'onboarding.steps.0.title',
        descriptionKey: 'onboarding.steps.0.description',
        icon: 'rocket',
    },
    {
        titleKey: 'onboarding.steps.1.title',
        descriptionKey: 'onboarding.steps.1.description',
        icon: 'flame',
    },
    {
        titleKey: 'onboarding.steps.2.title',
        descriptionKey: 'onboarding.steps.2.description',
        icon: 'sparkles',
    },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < ONBOARDING_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <div className="modal-overlay onboarding-modal">
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="onboarding-steps-container" style={{ transform: `translateX(-${currentStep * 100}%)` }}>
                    {ONBOARDING_STEPS.map((step, index) => (
                        <div key={index} className="onboarding-step">
                            <div className="onboarding-illustration">
                                <div className="icon-display">
                                    <Icon name={step.icon} />
                                </div>
                            </div>
                            <h3>{t(step.titleKey)}</h3>
                            <p>{t(step.descriptionKey)}</p>
                        </div>
                    ))}
                </div>

                <div className="onboarding-nav">
                    <div className="step-indicators">
                        {ONBOARDING_STEPS.map((_, index) => (
                            <div key={index} className={`step-indicator-dot ${currentStep === index ? 'active' : ''}`}></div>
                        ))}
                    </div>
                    <div className="onboarding-nav-buttons">
                        {currentStep > 0 && (
                             <button className="secondary" onClick={handlePrev}>{t('onboarding.prev')}</button>
                        )}
                        <button onClick={handleNext}>
                            {currentStep === ONBOARDING_STEPS.length - 1 ? t('onboarding.finish') : t('onboarding.next')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};