import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getActiveIncidents = async (req, res) => {
  try {
    const currentUserId = req.operator.id;
    const currentUserRole = req.operator.role;

    let activeIncidents = [];

    if (currentUserRole === 'ADMIN' || currentUserRole === 'COMMANDER') {
      activeIncidents = await prisma.incident.findMany({
        where: {
          status: { not: 'RESOLVED' }
        },
        include: { team: true, participants: true, alert: true },
        orderBy: { createdAt: 'desc' }
      });
    } else if (currentUserRole === 'RESPONDER') {
      activeIncidents = await prisma.incident.findMany({
        where: {
          status: { not: 'RESOLVED' },
          participants: {
            some: { userId: currentUserId }
          }
        },
        include: { team: true, participants: true, alert: true },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      activeIncidents = await prisma.incident.findMany({
        where: { status: { not: 'RESOLVED' } },
        include: { team: true, participants: true, alert: true },
        orderBy: { createdAt: 'desc' }
      });
    }

    res.status(200).json({
      success: true,
      operatorRole: currentUserRole,
      count: activeIncidents.length,
      data: activeIncidents
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch active incidents.' });
  }
};

export const escalateAlertToIncident = async (req, res) => {
  try {
    const { alertId, title, status, slaTarget, teamId, assignees } = req.body;
    const operatorId = req.operator.id;

    // Change alert status to ACKNOWLEDGED
    await prisma.alert.update({
      where: { id: alertId },
      data: { status: 'ACKNOWLEDGED' }
    });

    const alert = await prisma.alert.findUnique({ where: { id: alertId } });

    // Deduplicate assignees to avoid adding the operator twice
    const uniqueAssignees = (assignees || []).filter(id => id !== operatorId);

    const incident = await prisma.incident.create({
      data: {
        alertId,
        title,
        status: status || 'OPEN',
        severity: alert?.severity || 'HIGH',
        slaTarget: slaTarget ? new Date(slaTarget) : null,
        teamId: teamId || null,
        participants: {
          create: [
            { userId: operatorId, role: 'OWNER' },
            ...uniqueAssignees.map(id => ({ userId: id, role: 'ASSIGNEE' }))
          ]
        },
        events: {
          create: {
            eventType: 'INCIDENT_CREATED',
            actorId: operatorId,
            newValue: 'Manual Escalation'
          }
        }
      }
    });

    res.status(201).json({ success: true, data: incident });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to escalate alert to incident.' });
  }
};