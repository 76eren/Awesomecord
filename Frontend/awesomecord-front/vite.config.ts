import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

export default defineConfig(({command}) => {
    const isDev = command === 'serve';

    let httpsConfig: Record<string, any> | undefined;

    if (isDev) {
        const keyPath = path.resolve(__dirname, '.cert/localhost-key.pem');
        const certPath = path.resolve(__dirname, '.cert/localhost.pem');

        if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
            httpsConfig = {
                key: fs.readFileSync(keyPath),
                cert: fs.readFileSync(certPath),
            };
        } else {
            console.warn(
                '[vite] HTTPS certs not found in .cert/, falling back to HTTP for dev server.'
            );
        }
    }

    return {
        plugins: [react(), tailwindcss()],
        server: {
            https: httpsConfig,
        },
    };
});
