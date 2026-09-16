'use client';

import { store } from '@/store/store';
import dynamic from 'next/dynamic';
import { type FC, memo, useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import 'intl-tel-input/styles';

const IntlTelInput = dynamic(() => import('intl-tel-input/reactWithUtils'), {
    ssr: false,
    loading: () => <input className='form-control' readOnly aria-hidden='true' />
});

interface PhoneInputProps {
    id?: string;
    name?: string;
    onChange: (value: string) => void;
    error?: boolean;
    inputClassName?: string;
}

const PhoneInput: FC<PhoneInputProps> = ({ id, name, onChange, error, inputClassName }) => {
    const geoInfo = store((state) => state.geoInfo);
    const countryCode = geoInfo?.country_code?.toLowerCase() || 'us';
    const onChangeRef = useRef(onChange);

    useLayoutEffect(() => {
        onChangeRef.current = onChange;
    });

    const initOptions = useMemo(
        () => ({
            initialCountry: countryCode as '',
            separateDialCode: true,
            strictMode: true,
            nationalMode: true,
            autoPlaceholder: 'aggressive' as const,
            placeholderNumberType: 'MOBILE' as const,
            countrySearch: false
        }),
        [countryCode]
    );

    const handleChangeNumber = useCallback((value: string) => {
        onChangeRef.current(value);
    }, []);

    const className = inputClassName ?? `form-control ${error ? 'is-invalid' : ''}`;
    const inputProps = useMemo(
        () => ({
            id,
            name,
            className
        }),
        [id, name, className]
    );

    return (
        <IntlTelInput
            onChangeNumber={handleChangeNumber}
            initOptions={initOptions}
            inputProps={inputProps}
        />
    );
};

export default memo(PhoneInput);
