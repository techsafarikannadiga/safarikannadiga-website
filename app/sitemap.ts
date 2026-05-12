import { MetadataRoute } from 'next';
import { getAllContent } from '@/lib/content';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://safarikannadiga.com';

    // Standard static pages
    const staticRoutes = [
        '',
        '/about',
        '/gallery',
        '/upcoming-tours',
        '/tours',
        '/contact',
        '/share-experience',
        '/privacy',
        '/terms',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic tour package pages for maximized indexing
    const tourContent = getAllContent('tours') as any[];
    const dynamicTourRoutes = tourContent.map((tour) => ({
        url: `${baseUrl}/tours/${tour.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9, // Higher priority for product pages
    }));

    return [...staticRoutes, ...dynamicTourRoutes];
}
