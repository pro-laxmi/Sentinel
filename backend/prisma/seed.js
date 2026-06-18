import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 INITIALIZING SENTINEL TEST ENVIRONMENT WITH EXTENSIVE DATA...');

  // 1. WIPE EXISTING DATA (Reverse order of relations)
  await prisma.incidentEvent.deleteMany();
  await prisma.incidentMessage.deleteMany();
  await prisma.task.deleteMany();
  await prisma.incidentParticipant.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.log.deleteMany();
  await prisma.healthCheck.deleteMany();
  await prisma.repo.deleteMany();
  await prisma.service.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  // Not wiping users so we don't destroy the user's logged-in account
  console.log('🧹 Slate wiped clean.');

  // 2. CREATE TEAMS
  console.log('👥 Assembling Teams...');
  const teams = await Promise.all([
    prisma.team.create({ data: { name: 'SRE Core', description: 'Site Reliability Engineering' } }),
    prisma.team.create({ data: { name: 'Backend Services', description: 'API & Microservices' } }),
    prisma.team.create({ data: { name: 'Frontend Platform', description: 'Web & Mobile UX' } }),
    prisma.team.create({ data: { name: 'Security Ops', description: 'SecOps & Compliance' } })
  ]);
  const [sreTeam, backendTeam, frontendTeam, secopsTeam] = teams;

  // 3. CREATE DUMMY USERS
  console.log('👤 Hiring Personnel...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const dummyUsers = [
    { username: 'admin_sys', email: 'admin@sentinel.dev', password: hashedPassword, role: 'ADMIN' },
    { username: 'cmd_alice', email: 'alice@sentinel.dev', password: hashedPassword, role: 'COMMANDER' },
    { username: 'cmd_bob', email: 'bob@sentinel.dev', password: hashedPassword, role: 'COMMANDER' },
    { username: 'resp_charlie', email: 'charlie@sentinel.dev', password: hashedPassword, role: 'RESPONDER' },
    { username: 'resp_diana', email: 'diana@sentinel.dev', password: hashedPassword, role: 'RESPONDER' },
    { username: 'resp_ethan', email: 'ethan@sentinel.dev', password: hashedPassword, role: 'RESPONDER' },
    { username: 'view_frank', email: 'frank@sentinel.dev', password: hashedPassword, role: 'VIEWER' }
  ];

  const createdUsers = [];
  for (const u of dummyUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u
    });
    createdUsers.push(user);
  }

  const [admin, alice, bob, charlie, diana, ethan, frank] = createdUsers;

  // Assign to teams
  await prisma.teamMember.createMany({
    data: [
      { memberId: alice.id, teamId: sreTeam.id, role: 'OWNER' },
      { memberId: charlie.id, teamId: sreTeam.id, role: 'MEMBER' },
      { memberId: bob.id, teamId: backendTeam.id, role: 'OWNER' },
      { memberId: diana.id, teamId: backendTeam.id, role: 'MEMBER' },
      { memberId: ethan.id, teamId: frontendTeam.id, role: 'MEMBER' }
    ]
  });

  // 4. DEPLOY MONITORED SERVICES
  console.log('📦 Provisioning Microservices...');
  const services = await Promise.all([
    prisma.service.create({ data: { title: 'Authentication Gateway', url: 'https://httpbin.org/status/200', isActive: true } }),
    prisma.service.create({ data: { title: 'Stripe Payment Processor', url: 'https://api.stripe.com/health', isActive: true } }),
    prisma.service.create({ data: { title: 'PostgreSQL Core Database', url: 'http://localhost:5432', isActive: true } }),
    prisma.service.create({ data: { title: 'SendGrid SMTP Node', url: 'https://httpbin.org/status/503', isActive: true } }),
    prisma.service.create({ data: { title: 'Redis Cache Cluster', url: 'http://localhost:6379', isActive: true } }),
    prisma.service.create({ data: { title: 'ElasticSearch Engine', url: 'http://localhost:9200', isActive: true } }),
    prisma.service.create({ data: { title: 'User Dashboard App', url: 'https://sentinel.dev/app', isActive: true } }),
  ]);
  const [authSvc, paySvc, dbSvc, emailSvc, cacheSvc, searchSvc, appSvc] = services;

  // 5. GENERATE TELEMETRY (Logs)
  console.log('📝 Injecting Telemetry Stream...');
  const logs = [];
  const logData = [
    { serviceId: authSvc.id, level: 'INFO', message: 'User session validated.' },
    { serviceId: paySvc.id, level: 'INFO', message: 'Webhook received.' },
    { serviceId: dbSvc.id, level: 'INFO', message: 'Routine VACUUM completed.' },
    { serviceId: authSvc.id, level: 'WARNING', message: 'High latency detected (800ms).' },
    { serviceId: cacheSvc.id, level: 'WARNING', message: 'Memory usage approaching 80%.' },
    { serviceId: searchSvc.id, level: 'ERROR', message: 'Index corrupted: user_data_v2' },
    { serviceId: appSvc.id, level: 'ERROR', message: 'React chunk load error detected in EU region.' },
    { serviceId: dbSvc.id, level: 'FATAL', message: 'Connection pool exhausted. Refusing TCP connections.' },
    { serviceId: emailSvc.id, level: 'FATAL', message: 'SMTP handshake failed after 30s.' },
  ];

  for (let i = 0; i < logData.length; i++) {
    const l = await prisma.log.create({
      data: {
        ...logData[i],
        createdAt: new Date(Date.now() - (100000 - i * 5000))
      }
    });
    logs.push(l);
  }

  // 6. TRIGGER ALERTS
  console.log('🚨 Sounding Alarms...');
  const alerts = await Promise.all([
    prisma.alert.create({ data: { logId: logs[7].id, title: 'DB Connection Exhaustion', status: 'ACKNOWLEDGED', severity: 'CRITICAL', createdAt: new Date(Date.now() - 3600000) } }),
    prisma.alert.create({ data: { logId: logs[8].id, title: 'SMTP Delivery Timeout', status: 'ACKNOWLEDGED', severity: 'HIGH', createdAt: new Date(Date.now() - 7200000) } }),
    prisma.alert.create({ data: { logId: logs[5].id, title: 'ElasticSearch Index Corruption', status: 'OPEN', severity: 'HIGH', createdAt: new Date(Date.now() - 1800000) } }),
    prisma.alert.create({ data: { logId: logs[6].id, title: 'Frontend Chunk Load Failure (EU)', status: 'OPEN', severity: 'MEDIUM', createdAt: new Date(Date.now() - 900000) } }),
    prisma.alert.create({ data: { logId: logs[4].id, title: 'Redis Memory Critical', status: 'OPEN', severity: 'HIGH', createdAt: new Date(Date.now() - 300000) } }),
  ]);

  // 7. ESCALATE INCIDENTS
  console.log('🔥 Escalating Incidents...');
  const inc1 = await prisma.incident.create({
    data: {
      alertId: alerts[0].id,
      teamId: backendTeam.id,
      title: '[ESCALATION] DB Connection Exhaustion',
      severity: 'CRITICAL',
      status: 'INVESTIGATING',
      slaTarget: new Date(Date.now() + 1800000), // +30m
      createdAt: new Date(Date.now() - 3500000),
      participants: {
        create: [
          { userId: bob.id, role: 'OWNER' },
          { userId: diana.id, role: 'ASSIGNEE' },
        ]
      },
      events: {
        create: [
          { eventType: 'INCIDENT_CREATED', actorId: bob.id, newValue: 'Manual Escalation' },
          { eventType: 'STATUS_CHANGED', actorId: bob.id, oldValue: 'OPEN', newValue: 'INVESTIGATING' }
        ]
      }
    }
  });

  const inc2 = await prisma.incident.create({
    data: {
      alertId: alerts[1].id,
      teamId: sreTeam.id,
      title: '[ESCALATION] SMTP Delivery Timeout',
      severity: 'HIGH',
      status: 'OPEN',
      slaTarget: new Date(Date.now() - 1800000), // SLA Breached
      slaBreached: true,
      createdAt: new Date(Date.now() - 7000000),
      participants: {
        create: [
          { userId: alice.id, role: 'OWNER' },
          { userId: charlie.id, role: 'ASSIGNEE' },
        ]
      },
      events: {
        create: { eventType: 'INCIDENT_CREATED', actorId: alice.id, newValue: 'Manual Escalation' }
      }
    }
  });

  console.log('✅ EXTENSIVE SEED SEQUENCE COMPLETE. SENTINEL IS LIVE WITH DUMMY DATA.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });