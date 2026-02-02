import { PrismaClient, Role, SubscriptionStatus, AlertType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const PASSWORD_SALT_ROUNDS = 12;

async function main() {
    console.log('🌱 Seeding database...');

    // ─────────────────────────────────────────────────────────────────────────────
    // Subscription Plans
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('Creating subscription plans...');

    const freePlan = await prisma.subscriptionPlan.upsert({
        where: { slug: 'free' },
        update: {},
        create: {
            name: 'Free',
            slug: 'free',
            description: 'Plan gratuit pentru utilizatori noi',
            priceMonthly: 0,
            priceYearly: 0,
            trialDays: 0,
            limits: {
                maxSearchProfiles: 1,
                maxSavedListings: 10,
                maxAlerts: 1,
            },
            features: {
                aiFeatures: false,
                priceHistory: false,
                exportData: false,
                prioritySupport: false,
                apiAccess: false,
            },
            alertTypes: [AlertType.email_daily],
            isActive: true,
            isFeatured: false,
            displayOrder: 0,
        },
    });

    const proPlan = await prisma.subscriptionPlan.upsert({
        where: { slug: 'pro' },
        update: {},
        create: {
            name: 'Pro',
            slug: 'pro',
            description: 'Pentru utilizatori activi în căutare',
            priceMonthly: 29,
            priceYearly: 290,
            trialDays: 14,
            limits: {
                maxSearchProfiles: 5,
                maxSavedListings: 100,
                maxAlerts: 10,
            },
            features: {
                aiFeatures: true,
                priceHistory: true,
                exportData: true,
                prioritySupport: false,
                apiAccess: false,
            },
            alertTypes: [AlertType.email_instant, AlertType.email_daily, AlertType.push],
            isActive: true,
            isFeatured: true,
            displayOrder: 1,
        },
    });

    const businessPlan = await prisma.subscriptionPlan.upsert({
        where: { slug: 'business' },
        update: {},
        create: {
            name: 'Business',
            slug: 'business',
            description: 'Pentru agenții și investitori',
            priceMonthly: 99,
            priceYearly: 990,
            trialDays: 14,
            limits: {
                maxSearchProfiles: -1, // unlimited
                maxSavedListings: -1,
                maxAlerts: -1,
            },
            features: {
                aiFeatures: true,
                priceHistory: true,
                exportData: true,
                prioritySupport: true,
                apiAccess: true,
            },
            alertTypes: [AlertType.email_instant, AlertType.email_daily, AlertType.email_weekly, AlertType.push],
            isActive: true,
            isFeatured: false,
            displayOrder: 2,
        },
    });

    console.log(`  ✓ Created plans: ${freePlan.name}, ${proPlan.name}, ${businessPlan.name}`);

    // ─────────────────────────────────────────────────────────────────────────────
    // Admin User
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('Creating admin user...');

    const adminPasswordHash = await bcrypt.hash('admin123!', PASSWORD_SALT_ROUNDS);

    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@unimobiliare.ro' },
        update: {},
        create: {
            email: 'admin@unimobiliare.ro',
            passwordHash: adminPasswordHash,
            name: 'Administrator',
            role: Role.admin,
            emailVerified: true,
            emailVerifiedAt: new Date(),
            planId: businessPlan.id,
            subscriptionStatus: SubscriptionStatus.active,
        },
    });

    console.log(`  ✓ Created admin user: ${adminUser.email}`);

    // ─────────────────────────────────────────────────────────────────────────────
    // System Settings
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('Creating system settings...');

    const settings = [
        { key: 'site_name', value: 'Unimobiliare' },
        { key: 'site_description', value: 'Platforma de Unificare Imobiliară din România' },
        { key: 'maintenance_mode', value: false },
        { key: 'ai_provider', value: 'ollama' },
        { key: 'ai_fallback_enabled', value: true },
    ];

    for (const setting of settings) {
        await prisma.systemSetting.upsert({
            where: { key: setting.key },
            update: { value: setting.value },
            create: { key: setting.key, value: setting.value },
        });
    }

    console.log(`  ✓ Created ${settings.length} system settings`);

    // ─────────────────────────────────────────────────────────────────────────────
    // Sample Integration (for testing)
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('Creating sample integration...');

    const sampleIntegration = await prisma.integration.upsert({
        where: { name: 'sample-platform' },
        update: {},
        create: {
            name: 'sample-platform',
            displayName: 'Sample Platform',
            enabled: true,
            sourceConfig: {
                baseUrl: 'https://example.com',
                type: 'html',
                rateLimit: { requestsPerMinute: 10 },
            },
            listPageConfig: {
                listSelector: '.listings',
                itemSelector: '.listing-item',
                pagination: { type: 'page-number' },
            },
            fieldMappings: [],
        },
    });

    console.log(`  ✓ Created integration: ${sampleIntegration.displayName}`);

    // ─────────────────────────────────────────────────────────────────────────────
    // Sample Listings (for testing search functionality)
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('Creating sample listings...');

    const sampleListings = [
        {
            externalId: 'sample-001',
            title: 'Apartament 3 camere Floreasca',
            description: 'Apartament modern cu 3 camere, loc de parcare inclus, vedere spre parc.',
            price: 185000,
            currency: 'EUR' as const,
            transactionType: 'sale' as const,
            propertyType: 'apartment' as const,
            areaSqm: 85,
            rooms: 3,
            floor: 4,
            totalFloors: 8,
            yearBuilt: 2020,
            city: 'București',
            neighborhood: 'Floreasca',
            street: 'Strada Barbu Văcărescu 120',
            images: [
                'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
                'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
            ],
            sourceUrl: 'https://example.com/listing/001',
        },
        {
            externalId: 'sample-002',
            title: 'Garsonieră Unirii',
            description: 'Garsonieră renovată recent, ideală pentru tineri profesioniști sau studenți.',
            price: 350,
            currency: 'EUR' as const,
            transactionType: 'rent' as const,
            propertyType: 'studio' as const,
            areaSqm: 38,
            rooms: 1,
            floor: 2,
            totalFloors: 10,
            yearBuilt: 2015,
            city: 'București',
            neighborhood: 'Unirii',
            street: 'Bulevardul Unirii 45',
            images: [
                'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
            ],
            sourceUrl: 'https://example.com/listing/002',
        },
        {
            externalId: 'sample-003',
            title: 'Casă 5 camere Pipera',
            description: 'Vilă modernă cu grădină și piscină, ideală pentru familii.',
            price: 450000,
            currency: 'EUR' as const,
            transactionType: 'sale' as const,
            propertyType: 'house' as const,
            areaSqm: 280,
            rooms: 5,
            floor: null,
            totalFloors: 2,
            yearBuilt: 2022,
            city: 'București',
            neighborhood: 'Pipera',
            street: 'Strada Diplomației 15',
            images: [
                'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
                'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
            ],
            sourceUrl: 'https://example.com/listing/003',
        },
        {
            externalId: 'sample-004',
            title: 'Apartament 2 camere Centru Cluj',
            description: 'Apartament în centrul istoric al Clujului, acces pietonal.',
            price: 145000,
            currency: 'EUR' as const,
            transactionType: 'sale' as const,
            propertyType: 'apartment' as const,
            areaSqm: 65,
            rooms: 2,
            floor: 3,
            totalFloors: 5,
            yearBuilt: 1980,
            city: 'Cluj-Napoca',
            neighborhood: 'Centru',
            street: 'Strada Regele Ferdinand 25',
            images: [
                'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
            ],
            sourceUrl: 'https://example.com/listing/004',
        },
        {
            externalId: 'sample-005',
            title: 'Spațiu comercial Aviației',
            description: 'Spațiu comercial la stradă, ideal pentru retail sau birou.',
            price: 2500,
            currency: 'EUR' as const,
            transactionType: 'rent' as const,
            propertyType: 'commercial' as const,
            areaSqm: 120,
            rooms: null,
            floor: 0,
            totalFloors: 5,
            yearBuilt: 2010,
            city: 'București',
            neighborhood: 'Aviației',
            street: 'Bulevardul Aviatorilor 80',
            images: [
                'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
            ],
            sourceUrl: 'https://example.com/listing/005',
        },
        {
            externalId: 'sample-006',
            title: 'Apartament 4 camere Herăstrău',
            description: 'Penthouse de lux cu vedere panoramică spre parcul Herăstrău.',
            price: 380000,
            currency: 'EUR' as const,
            transactionType: 'sale' as const,
            propertyType: 'apartment' as const,
            areaSqm: 150,
            rooms: 4,
            floor: 10,
            totalFloors: 10,
            yearBuilt: 2023,
            city: 'București',
            neighborhood: 'Herăstrău',
            street: 'Șoseaua Nordului 50',
            images: [
                'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
                'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
            ],
            sourceUrl: 'https://example.com/listing/006',
        },
        {
            externalId: 'sample-007',
            title: 'Teren construcții Voluntari',
            description: 'Teren intravilan ideal pentru construcție rezidențială, toate utilitățile.',
            price: 95000,
            currency: 'EUR' as const,
            transactionType: 'sale' as const,
            propertyType: 'land' as const,
            areaSqm: 500,
            rooms: null,
            floor: null,
            totalFloors: null,
            yearBuilt: null,
            city: 'București',
            neighborhood: 'Voluntari',
            street: null,
            images: [
                'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
            ],
            sourceUrl: 'https://example.com/listing/007',
        },
        {
            externalId: 'sample-008',
            title: 'Birou Gheorgheni Cluj',
            description: 'Spațiu de birou modern în clădire de clasă A, parcare subterană.',
            price: 1800,
            currency: 'EUR' as const,
            transactionType: 'rent' as const,
            propertyType: 'office' as const,
            areaSqm: 100,
            rooms: null,
            floor: 5,
            totalFloors: 12,
            yearBuilt: 2019,
            city: 'Cluj-Napoca',
            neighborhood: 'Gheorgheni',
            street: 'Strada Brâncuși 150',
            images: [
                'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
            ],
            sourceUrl: 'https://example.com/listing/008',
        },
    ];

    for (const listing of sampleListings) {
        const now = new Date();
        await prisma.listing.upsert({
            where: {
                integrationId_externalId: {
                    integrationId: sampleIntegration.id,
                    externalId: listing.externalId,
                },
            },
            update: {},
            create: {
                externalId: listing.externalId,
                integrationId: sampleIntegration.id,
                title: listing.title,
                description: listing.description,
                price: listing.price,
                currency: listing.currency,
                transactionType: listing.transactionType,
                propertyType: listing.propertyType,
                areaSqm: listing.areaSqm,
                rooms: listing.rooms,
                floor: listing.floor,
                totalFloors: listing.totalFloors,
                yearBuilt: listing.yearBuilt,
                city: listing.city,
                neighborhood: listing.neighborhood,
                street: listing.street,
                images: listing.images,
                sourceUrl: listing.sourceUrl,
                status: 'active',
                firstSeenAt: now,
                lastSeenAt: now,
            },
        });
    }

    console.log(`  ✓ Created ${sampleListings.length} sample listings`);

    console.log('✅ Seeding complete!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
