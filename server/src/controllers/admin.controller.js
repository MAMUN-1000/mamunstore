import * as adminService from '../services/admin.service.js';

/**
 * Get store metrics, revenue, and KPI dashboard data
 * GET /api/admin/metrics
 */
export const getAdminMetrics = async (req, res, next) => {
  try {
    const data = await adminService.getAdminMetrics();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};
