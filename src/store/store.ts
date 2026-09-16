import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface GeoInfo {
    asn: number;
    ip: string;
    country: string;
    region: string;
    city: string;
    country_code: string;
}

interface State {
    geoInfo: GeoInfo | null;
    setGeoInfo: (info: GeoInfo) => void;
}

export const store = create<State>()(
    persist(
        (set) => ({
            geoInfo: null,
            setGeoInfo: (info: GeoInfo) => set({ geoInfo: info })
        }),
        {
            name: 'storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                geoInfo: state.geoInfo
            })
        }
    )
);
