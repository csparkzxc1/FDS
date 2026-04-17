import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password1234', 10);

  const owner = await prisma.user.upsert({
    where: { email: 'owner@example.com' },
    update: {},
    create: {
      email: 'owner@example.com',
      passwordHash,
      name: '홍길동',
      locale: 'ko',
    },
  });

  const org = await prisma.organization.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'MultiCheck 데모 주식회사',
      type: 'company',
      plan: 'free',
    },
  });

  await prisma.membership.upsert({
    where: {
      organizationId_userId: { organizationId: org.id, userId: owner.id },
    },
    update: {},
    create: {
      organizationId: org.id,
      userId: owner.id,
      role: 'org_owner',
    },
  });

  await prisma.location.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      organizationId: org.id,
      name: '본사',
      lat: 37.5665,
      lng: 126.978,
      radiusMeters: 150,
    },
  });

  console.log('Seed complete:', { user: owner.email, org: org.name });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
