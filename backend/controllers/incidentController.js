import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getActiveIncidents = async (req, res) => {
  try {
    // Because verifyClearance ran first, we now know exactly who is making the request
    const currentUserId = req.operator.id;
    const currentUserRole = req.operator.role;

    console.log(`Operator ${req.operator.username} is requesting active incidents.`);

    // Fetch all OPEN or ACKNOWLEDGED incidents from Supabase
    const activeIncidents = await prisma.incident.findMany({
      where: {
        status: {
          in: ['OPEN', 'ACKNOWLEDGED']
        }
      },
      include: {
        team: true, // Pull in the team data
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      operatorRole: currentUserRole,
      count: activeIncidents.length,
      data: activeIncidents
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch incident telemetry.' });
  }
};