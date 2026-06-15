import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getLogs = async (req, res) => {
    try {
        const logs = await prisma.log.findMany({
            take: 50,
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch logs.' });
    }
};

export const createLog = async (req, res) => {
    try {
        const { serviceId, message, level } = req.body;

        // Validate required fields
        if (!serviceId || !message || !level) {
            return res.status(400).json({ error: 'Missing required fields: serviceId, message, and level are required.' });
        }

        const newLog = await prisma.log.create({
            data: {
                serviceId,
                message,
                level,
                createdAt: new Date()
            },
        });

        res.status(201).json({ success: true, data: newLog });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create log.' });
    }
};

export const getLogsByServiceId = async (req, res) => {
    try {
        const { serviceId } = req.params;

        // Validate serviceId
        if (!serviceId) {
            return res.status(400).json({ error: 'Missing required field: serviceId.' });
        }

        const logs = await prisma.log.findMany({
            where: {
                serviceId: serviceId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch logs for the specified service.' });
    }
};