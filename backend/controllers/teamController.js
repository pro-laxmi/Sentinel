import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllTeams = async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      select: {
        id: true,
        name: true,
        description: true
      }
    });
    res.status(200).json({ success: true, data: teams });
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
