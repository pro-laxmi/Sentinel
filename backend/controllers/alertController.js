import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAlerts = async (req, res) => {
    try {
        const alerts = await prisma.alert.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.status(200).json({ success: true, data: alerts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch alerts.' });
    }
};

export const getOpenAlerts = async(req, res) => {
    try {
        const openAlerts = await prisma.alert.findMany({
            where: {
                status: { in: ['OPEN', 'ACKNOWLEDGED'] }
            },
            include: {
                log: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.status(200).json({ success: true, data: openAlerts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch open alerts.' });
    }
};

export const getAlertsById = async (req, res) => {
    try {
        const { Id } = req.params;

        // Validate alertId
        if (!Id) {
            return res.status(400).json({ error: 'Missing required field: alertId.' });
        }

        const alert = await prisma.alert.findUnique({
            where: {
                id: Id
            },
            include: {
                log: {
                    include: {
                        service: true
                    }
                }
            },
        });

        if(!alert) {
            return res.status(404).json({ error: 'Alert not found.' });
        }

        res.status(200).json({ success: true, data: alert });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch alert by ID.' });
    }
};

export const changeAlertStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate status
        if (!['OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'CLOSED'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value. Must be OPEN, ACKNOWLEDGED, RESOLVED, or CLOSED.' });
        }

        const updatedAlert = await prisma.alert.update({
            where: { id: id },
            data: { status }
        });

        res.status(200).json({ success: true, data: updatedAlert });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update alert status.' });
    }
};
