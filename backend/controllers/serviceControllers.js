import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getServices = async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      include: {
        healthChecks: {
          take: 40,
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
    res.status(200).json({ success: true, data: services });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch services.' });
  }
};

export const getActiveServices = async (req, res) => {
  try {
    const activeServices = await prisma.service.findMany({
      where: {
        isActive: true
      }
    });
    res.status(200).json({ success: true, data: activeServices });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch active services.' });
  }
};

export const createService = async (req, res) => {
  try {
    const { title, url } = req.body;

    if (!title || !url) {
      return res.status(400).json({ error: 'Title and URL are required' });
    }

    const newService = await prisma.service.create({
      data: {
        title,
        url
      }
    });

    res.status(201).json({ success: true, data: newService });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create service.' });
  }
};

export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, url, isActive } = req.body;

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        title,
        url,
        isActive
      }
    });

    res.status(200).json({ success: true, data: updatedService });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update service.' });
  }
};

export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedService = await prisma.service.delete({
      where: { id },
    });

    res.status(200).json({ success: true, data: deletedService });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete service.' });
  }
};  

