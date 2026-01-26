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
