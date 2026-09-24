import * as notificationService from '../services/notification.service.js';

export const getNotifications = async (req, res) => {
  try {
    const { limit } = req.query;
    const result = await notificationService.getNotifications(req.user.id, { limit });
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Failed to fetch notifications.',
    });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      data: { notification },
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Failed to update notification.',
    });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Failed to mark all as read.',
    });
  }
};
