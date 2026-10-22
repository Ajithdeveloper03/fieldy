import './bootstrap';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import AlertSystem from './Components/AlertSystem';
import './i18n';

createInertiaApp({
    title: (title) => (title ? `${title} - Fieldy Admin` : 'Fieldy Admin'),
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <AlertSystem>
                <App {...props} />
            </AlertSystem>
        );
    },
    progress: {
        color: '#F26A10',
    },
});
