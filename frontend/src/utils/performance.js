/**
 * Performance optimization utilities for React
 */

import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Debounce hook
 */
export function useDebounce(value, delay = 300) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Throttle hook
 */
export function useThrottle(callback, delay = 300) {
    const lastCall = useRef(0);

    return useCallback((...args) => {
        const now = Date.now();
        if (now - lastCall.current >= delay) {
            lastCall.current = now;
            callback(...args);
        }
    }, [callback, delay]);
}

/**
 * Intersection Observer for lazy loading
 */
export function useInView(options = {}) {
    const [isInView, setIsInView] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(([entry]) => {
            setIsInView(entry.isIntersecting);
        }, { threshold: 0.1, ...options });

        observer.observe(element);
        return () => observer.disconnect();
    }, [options]);

    return [ref, isInView];
}

/**
 * Prefetch data on hover
 */
export function usePrefetch(fetchFn, delay = 200) {
    const timeoutRef = useRef(null);

    const onMouseEnter = useCallback(() => {
        timeoutRef.current = setTimeout(fetchFn, delay);
    }, [fetchFn, delay]);

    const onMouseLeave = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }, []);

    return { onMouseEnter, onMouseLeave };
}

/**
 * Virtual list for large lists
 */
export function useVirtualList(items, itemHeight, containerHeight) {
    const [scrollTop, setScrollTop] = useState(0);

    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
        startIndex + Math.ceil(containerHeight / itemHeight) + 1,
        items.length
    );

    const visibleItems = items.slice(startIndex, endIndex).map((item, index) => ({
        ...item,
        style: {
            position: 'absolute',
            top: (startIndex + index) * itemHeight,
            left: 0,
            right: 0,
            height: itemHeight,
        },
    }));

    const onScroll = useCallback((e) => {
        setScrollTop(e.currentTarget.scrollTop);
    }, []);

    return {
        visibleItems,
        totalHeight: items.length * itemHeight,
        onScroll,
    };
}

/**
 * Batch updates for performance
 */
export function useBatchedUpdates() {
    const pendingUpdates = useRef([]);
    const rafId = useRef(null);

    const scheduleUpdate = useCallback((updateFn) => {
        pendingUpdates.current.push(updateFn);

        if (!rafId.current) {
            rafId.current = requestAnimationFrame(() => {
                const updates = pendingUpdates.current;
                pendingUpdates.current = [];
                rafId.current = null;
                updates.forEach(fn => fn());
            });
        }
    }, []);

    useEffect(() => {
        return () => {
            if (rafId.current) {
                cancelAnimationFrame(rafId.current);
            }
        };
    }, []);

    return scheduleUpdate;
}

/**
 * Measure render time
 */
export function useRenderTime(componentName) {
    const startTime = useRef(performance.now());

    useEffect(() => {
        const endTime = performance.now();
        const renderTime = endTime - startTime.current;

        if (renderTime > 16) { // Longer than 1 frame
            console.warn(`[Performance] ${componentName} took ${renderTime.toFixed(2)}ms to render`);
        }
    });
}

/**
 * Cache API responses
 */
const cache = new Map();

export function useCachedFetch(key, fetchFn, ttl = 60000) {
    const [data, setData] = useState(() => cache.get(key)?.data);
    const [loading, setLoading] = useState(!cache.has(key));
    const [error, setError] = useState(null);

    useEffect(() => {
        const cached = cache.get(key);
        if (cached && Date.now() - cached.timestamp < ttl) {
            setData(cached.data);
            setLoading(false);
            return;
        }

        setLoading(true);
        fetchFn()
            .then(result => {
                cache.set(key, { data: result, timestamp: Date.now() });
                setData(result);
            })
            .catch(setError)
            .finally(() => setLoading(false));
    }, [key, fetchFn, ttl]);

    const invalidate = useCallback(() => {
        cache.delete(key);
    }, [key]);

    return { data, loading, error, invalidate };
}

/**
 * Preload images
 */
export function preloadImages(urls) {
    urls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

/**
 * Preload component (for code splitting)
 */
export function preloadComponent(importFn) {
    importFn();
}
