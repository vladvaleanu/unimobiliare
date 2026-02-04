import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupMockData() {
    console.log('🧹 Cleaning up mock data...');

    // Delete mock listings
    const deletedListings = await prisma.listing.deleteMany({
        where: {
            integration: {
                name: 'sample-platform'
            }
        }
    });
    console.log(`  ✓ Deleted ${deletedListings.count} mock listings`);

    // Delete mock integration
    const deletedIntegration = await prisma.integration.deleteMany({
        where: {
            name: 'sample-platform'
        }
    });
    console.log(`  ✓ Deleted ${deletedIntegration.count} mock integration(s)`);

    console.log('✅ Cleanup complete!');

    await prisma.$disconnect();
}

cleanupMockData().catch(console.error);
