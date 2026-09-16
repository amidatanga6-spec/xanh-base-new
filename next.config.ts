import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    reactCompiler: false,
    poweredByHeader: false,
    experimental: {
        serverComponentsHmrCache: false
    }
};

export default nextConfig;
