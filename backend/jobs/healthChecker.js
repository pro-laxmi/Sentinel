import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Health check loop
const startHealthCheckWorker = () => {
  setInterval(async () => {
    try {
        const services = await prisma.service.findMany({
            where: {
                isActive: true
            }
        });

        await Promise.all(
            services.map(async (service) => {
                let isDown = false;
                let failureMessage = '';
                let responseTime = -1;
                try {
                    const startTime = Date.now();
                    const response = await fetch(service.url);
                    const endTime = Date.now();
                    responseTime = endTime - startTime;
                    if(response.ok){
                        await prisma.healthCheck.create({
                            data: {
                                service: { connect: { id: service.id } },
                                status: 'HEALTHY',
                                responseTimeMs : responseTime,
                                createdAt: new Date()
                            },
                        });
                        const activeAlert = await prisma.alert.findFirst({
                            where: {
                                status: { in: ['OPEN', 'ACKNOWLEDGED'] },
                                log: { serviceId: service.id }
                            }
                        });
                        if (activeAlert) {
                            await prisma.alert.update({
                                where: { id: activeAlert.id },
                                data: { status: 'RESOLVED' }
                            });
                            await prisma.log.create({
                                data: {
                                    service: { connect: { id: service.id } },
                                    message: `Service stabilized. Auto-resolved ongoing incident.`,
                                    level: 'INFO',
                                    createdAt: new Date()
                                }
                            });
                            console.log(`✅ AUTO-HEAL: ${service.title} is back online.`);
                        }
                    } else {
                        isDown = true;
                        failureMessage = `HTTP ${response.status}: Service returned an error code.`;
                    }
                } catch (error) {
                    isDown = true;
                    failureMessage = `Health check failed for ${service.title}: ${error.message}`;
                }


                if(isDown){
                    await prisma.healthCheck.create({
                        data: {
                            service: {
                                connect: { id: service.id }
                            },
                            status: 'DOWN',
                            responseTimeMs : responseTime,
                            createdAt: new Date()
                        },
                    }); 
                    const newLog = await prisma.log.create({
                        data: {
                            service: {
                                connect: { id: service.id }
                            },
                            message: failureMessage,
                            level: 'ERROR',
                            createdAt: new Date()
                        },
                    });
                    const foundAlert = await prisma.alert.findFirst({
                        where: {
                            status: { in: ['OPEN', 'ACKNOWLEDGED'] },
                            log: {
                                serviceId: service.id
                            }
                        }
                    });
                    if (!foundAlert) {
                        await prisma.alert.create({
                            data: {
                                log: {
                                    connect: { id: newLog.id }
                                },
                                title: newLog.message,
                                severity: 'HIGH',
                                status: 'OPEN',
                                createdAt: new Date()
                            },
                        });
                    }
                }
            })
        );
    } catch (error) {
      console.error('Error during health check:', error);
    }
  }, 6000); // Run every 60 seconds
};

export default startHealthCheckWorker;