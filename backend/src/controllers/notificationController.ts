import { Request, Response } from 'express';
import prisma from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';

// Create Notification
export const createNotification = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user!.schoolId;
  const userId = req.user!.userId;
  const { recipientType, recipientId, recipientClassId, title, message, type, priority } = req.body;

  // Validate recipient type and get recipients
  let recipients: any[] = [];

  if (recipientType === 'all') {
    // Get all users in the school
    recipients = await prisma.user.findMany({
      where: { schoolId, isActive: true },
      select: { id: true }
    });
  } else if (recipientType === 'class' && recipientClassId) {
    // Get all students in the class
    const students = await prisma.student.findMany({
      where: { 
        classId: recipientClassId,
        class: { schoolId }
      },
      include: {
        user: { select: { id: true } },
        parent: { select: { id: true } }
      }
    });
    
    // Add students and their parents
    recipients = students.flatMap(student => [
      { id: student.user.id },
      ...(student.parent ? [{ id: student.parent.id }] : [])
    ]);
  } else if (recipientType === 'parent' && recipientId) {
    recipients = [{ id: recipientId }];
  } else if (recipientType === 'teacher' && recipientId) {
    recipients = [{ id: recipientId }];
  } else if (recipientType === 'student' && recipientId) {
    recipients = [{ id: recipientId }];
  }

  if (recipients.length === 0) {
    res.status(400).json({
      success: false,
      error: 'BAD_REQUEST',
      message: 'No valid recipients found'
    });
    return;
  }

  // Create notifications for all recipients
  const notifications = await Promise.all(
    recipients.map(recipient =>
      prisma.notification.create({
        data: {
          schoolId,
          senderId: userId,
          recipientId: recipient.id,
          recipientType,
          recipientClassId: recipientType === 'class' ? recipientClassId : null,
          title,
          message,
          type: type || 'general',
          priority: priority || 'normal'
        }
      })
    )
  );

  res.status(201).json({
    success: true,
    data: {
      notificationsCreated: notifications.length,
      recipients: recipients.length,
      notification: {
        title,
        message,
        type: type || 'general',
        priority: priority || 'normal',
        recipientType
      }
    },
    message: 'Notifications sent successfully'
  });
});

// Get Notifications
export const getNotifications = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user!.schoolId;
  const userId = req.user!.userId;
  const userRole = req.user!.role;
  const { page = 1, limit = 20, type, priority, isRead } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  // Build where clause
  const where: any = {
    schoolId,
    OR: [
      { recipientId: userId },
      { recipientType: 'all' }
    ]
  };

  if (type) {
    where.type = type;
  }

  if (priority) {
    where.priority = priority;
  }

  if (isRead !== undefined) {
    where.isRead = isRead === 'true';
  }

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        }
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.notification.count({ where })
  ]);

  const totalPages = Math.ceil(total / Number(limit));

  res.json({
    success: true,
    data: notifications.map((notification: any) => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      isRead: notification.isRead,
      readAt: notification.readAt,
      sender: notification.sender,
      recipient: notification.recipient,
      recipientType: notification.recipientType,
      recipientClassId: notification.recipientClassId,
      createdAt: notification.createdAt
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages
    }
  });
});

// Get Notification by ID
export const getNotificationById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { notificationId } = req.params;
  const schoolId = req.user!.schoolId;
  const userId = req.user!.userId;

  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      schoolId,
      OR: [
        { recipientId: userId },
        { recipientType: 'all' }
      ]
    },
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true
        }
      },
      recipient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true
        }
      }
    }
  });

  if (!notification) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Notification not found'
    });
    return;
  }

  res.json({
    success: true,
    data: {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      isRead: notification.isRead,
      readAt: notification.readAt,
      sender: notification.sender,
      recipient: notification.recipient,
      recipientType: notification.recipientType,
      recipientClassId: notification.recipientClassId,
      createdAt: notification.createdAt
    }
  });
});

// Mark Notification as Read
export const markAsRead = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { notificationId } = req.params;
  const schoolId = req.user!.schoolId;
  const userId = req.user!.userId;

  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      schoolId,
      OR: [
        { recipientId: userId },
        { recipientType: 'all' }
      ]
    }
  });

  if (!notification) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Notification not found'
    });
    return;
  }

  const updatedNotification = await prisma.notification.update({
    where: { id: notificationId },
    data: {
      isRead: true,
      readAt: new Date()
    }
  });

  res.json({
    success: true,
    data: {
      id: updatedNotification.id,
      isRead: updatedNotification.isRead,
      readAt: updatedNotification.readAt
    },
    message: 'Notification marked as read'
  });
});

// Delete Notification
export const deleteNotification = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { notificationId } = req.params;
  const schoolId = req.user!.schoolId;

  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      schoolId
    }
  });

  if (!notification) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Notification not found'
    });
    return;
  }

  await prisma.notification.delete({
    where: { id: notificationId }
  });

  res.json({
    success: true,
    message: 'Notification deleted successfully'
  });
});

// Get Notification Statistics
export const getNotificationStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schoolId = req.user!.schoolId;
  const { period = '30' } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Number(period));

  const [
    totalNotifications,
    unreadNotifications,
    notificationsByType,
    notificationsByPriority,
    recentNotifications
  ] = await Promise.all([
    // Total notifications
    prisma.notification.count({
      where: {
        schoolId,
        createdAt: { gte: startDate }
      }
    }),
    // Unread notifications
    prisma.notification.count({
      where: {
        schoolId,
        isRead: false,
        createdAt: { gte: startDate }
      }
    }),
    // Notifications by type
    prisma.notification.groupBy({
      by: ['type'],
      where: {
        schoolId,
        createdAt: { gte: startDate }
      },
      _count: { type: true }
    }),
    // Notifications by priority
    prisma.notification.groupBy({
      by: ['priority'],
      where: {
        schoolId,
        createdAt: { gte: startDate }
      },
      _count: { priority: true }
    }),
    // Recent notifications
    prisma.notification.findMany({
      where: {
        schoolId,
        createdAt: { gte: startDate }
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
  ]);

  res.json({
    success: true,
    data: {
      overview: {
        totalNotifications,
        unreadNotifications,
        readNotifications: totalNotifications - unreadNotifications,
        readPercentage: totalNotifications > 0 ? Math.round(((totalNotifications - unreadNotifications) / totalNotifications) * 100) : 0
      },
      byType: notificationsByType.map(item => ({
        type: item.type,
        count: item._count.type
      })),
      byPriority: notificationsByPriority.map(item => ({
        priority: item.priority,
        count: item._count.priority
      })),
      recentNotifications: recentNotifications.map(notification => ({
        id: notification.id,
        title: notification.title,
        type: notification.type,
        priority: notification.priority,
        sender: notification.sender,
        createdAt: notification.createdAt
      }))
    }
  });
});
