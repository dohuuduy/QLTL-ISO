import React, { useState, useEffect } from 'react';

// Cache for the dynamically imported icons module
let iconsCache: { [key: string]: React.ReactElement } | null = null;
// Promise to prevent multiple requests for the same module
let iconsPromise: Promise<void> | null = null;

/**
 * Custom hook to lazy load an icon's SVG path.
 * The entire icon set is loaded on the first call and then cached.
 * @param type The key of the icon to load.
 * @returns The React element for the icon path, or null while loading.
 */
function useIcon(type: string): React.ReactElement | null {
    const [icon, setIcon] = useState<React.ReactElement | null>(() => iconsCache ? iconsCache[type] : null);

    useEffect(() => {
        let isMounted = true;

        if (iconsCache) {
            setIcon(iconsCache[type]);
            return;
        }

        if (!iconsPromise) {
            iconsPromise = import('./iconPaths').then(module => {
                iconsCache = module.icons;
            }).catch(err => {
                console.error("Failed to load icon paths", err);
                iconsPromise = null; // Allow retrying
            });
        }

        iconsPromise.then(() => {
            if (isMounted && iconsCache) {
                setIcon(iconsCache[type]);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [type]);

    return icon;
}


interface IconProps {
    type: string;
    className?: string;
}

export const Icon: React.FC<IconProps> = ({ type, className = 'h-6 w-6' }) => {
    const iconPath = useIcon(type);

    // Default fallback icon path
    const fallbackPath = <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h6v6z" />;

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
        >
            {iconPath || fallbackPath}
        </svg>
    );
};