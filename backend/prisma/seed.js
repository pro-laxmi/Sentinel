import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 INITIALIZING SENTINEL TEST ENVIRONMENT...');

  // 1. WIPE EXISTING DATA (Reverse order of relations)
  await prisma.alert.deleteMany();
  await prisma.log.deleteMany();
  await prisma.service.deleteMany();
  console.log('🧹 Slate wiped clean.');

  // 2. DEPLOY MONITORED SERVICES (With workable online URLs)
  console.log('📦 Provisioning Microservices...');
  
  const authService = await prisma.service.create({
    data: {
      title: 'Authentication Gateway',
      url: 'https://httpbin.org/status/200', // Workable online link
      isActive: true,
    }
  });

  const paymentService = await prisma.service.create({
    data: {
      title: 'Stripe Payment Processor',
      url: 'https://api.stripe.com/health', 
      isActive: true,
    }
  });

  const dbService = await prisma.service.create({
    data: {
      title: 'PostgreSQL Core Database',
      url: 'http://localhost:5432', // Simulating an internal network service
      isActive: true,
    }
  });

  const emailService = await prisma.service.create({
    data: {
      title: 'SendGrid SMTP Node',
      url: 'https://httpbin.org/status/503', // Workable link designed to simulate a failure
      isActive: true,
    }
  });

  // 3. GENERATE TELEMETRY (Logs)
  console.log('📝 Injecting Telemetry Stream...');

  // Normal System Logs
  await prisma.log.createMany({
    data: [
      { serviceId: authService.id, level: 'INFO', message: 'User session validated successfully.', createdAt: new Date(Date.now() - 10000) },
      { serviceId: paymentService.id, level: 'INFO', message: 'Webhook received from Stripe payload.', createdAt: new Date(Date.now() - 20000) },
      { serviceId: dbService.id, level: 'INFO', message: 'Routine VACUUM operation completed.', createdAt: new Date(Date.now() - 30000) },
      { serviceId: authService.id, level: 'WARNING', message: 'High latency detected on token refresh (800ms).', createdAt: new Date(Date.now() - 40000) },
    ]
  });

  // Critical Failure Logs (These will trigger our alerts)
  const dbCrashLog = await prisma.log.create({
    data: {
      serviceId: dbService.id,
      level: 'ERROR',
      message: 'FATAL: Connection pool exhausted. Refusing new TCP connections.',
      createdAt: new Date(Date.now() - 5000)
    }
  });

  const emailCrashLog = await prisma.log.create({
    data: {
      serviceId: emailService.id,
      level: 'ERROR',
      message: 'TIMEOUT: SMTP handshake failed after 30000ms.',
      createdAt: new Date(Date.now() - 2000)
    }
  });

  // 4. TRIGGER ACTIVE INCIDENTS (Alerts)
  console.log('🚨 Sounding Alarms...');
  
  await prisma.alert.create({
    data: {
      logId: dbCrashLog.id,
      title: 'DB Connection Exhaustion',
      status: 'OPEN',
      severity: 'CRITICAL',
    }
  });

  await prisma.alert.create({
    data: {
      logId: emailCrashLog.id,
      title: 'SMTP Delivery Timeout',
      status: 'ACKNOWLEDGED',
      severity: 'HIGH',
    }
  });

  console.log('✅ SEED SEQUENCE COMPLETE. SENTINEL IS LIVE.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });