import prisma from '../config/db.js';

/**
 * Create an in-app notification for a specific customer
 */
export const createNotification = async ({
  userId,
  type = 'SYSTEM',
  title,
  message,
  link = null,
}) => {
  if (!userId || !title || !message) return null;

  return await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      link,
      isRead: false,
    },
  });
};

/**
 * Retrieve notifications for a user along with unread counter
 */
export const getNotifications = async (userId, { limit = 30 } = {}) => {
  const pageSize = Math.max(1, parseInt(limit, 10) || 30);

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: pageSize,
    }),
    prisma.notification.count({
      where: { userId, isRead: false },
    }),
  ]);

  return {
    notifications,
    unreadCount,
  };
};

/**
 * Mark a single notification as read
 */
export const markAsRead = async (id, userId) => {
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    const error = new Error('Invalid notification ID.');
    error.status = 400;
    throw error;
  }

  const existing = await prisma.notification.findUnique({
    where: { id: parsedId },
  });

  if (!existing || existing.userId !== userId) {
    const error = new Error('Notification not found or access denied.');
    error.status = 404;
    throw error;
  }

  return await prisma.notification.update({
    where: { id: parsedId },
    data: { isRead: true },
  });
};

/**
 * Mark all unread notifications as read for a user
 */
export const markAllAsRead = async (userId) => {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

  return { success: true };
};

/**
 * Helper: Notify all administrator accounts about critical store events
 * (e.g., new order placed, return requested, low inventory warning)
 */
export const notifyAdmins = async ({ type = 'SYSTEM', title, message, link = null }) => {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    if (!admins || admins.length === 0) return;

    await prisma.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        type,
        title,
        message,
        link,
        isRead: false,
      })),
    });
  } catch (err) {
    console.error('Failed to dispatch admin notification:', err.message);
  }
};
