import * as returnService from '../services/return.service.js';

/**
 * Customer: Submit a new return request for an order
 * POST /api/returns
 */
export const createReturnRequest = async (req, res, next) => {
  try {
    const { orderId, reason, customerNotes, items } = req.body;
    const returnRequest = await returnService.createReturnRequest({
      userId: req.user.id,
      orderId,
      reason,
      customerNotes,
      items,
    });

    res.status(201).json({
      success: true,
      message: 'Return request submitted successfully. Our team will review your request shortly.',
      data: { returnRequest },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Customer: Retrieve all return requests submitted by the logged-in user
 * GET /api/returns/my-returns
 */
export const getMyReturns = async (req, res, next) => {
  try {
    const returns = await returnService.getMyReturns(req.user.id);
    res.status(200).json({
      success: true,
      data: { returns },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Customer / Admin: Retrieve details of a specific return request
 * GET /api/returns/:id
 */
export const getReturnById = async (req, res, next) => {
  try {
    const returnRequest = await returnService.getReturnById(
      req.params.id,
      req.user.id,
      req.user.role
    );
    res.status(200).json({
      success: true,
      data: { returnRequest },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Administrator: Retrieve all customer return requests with filtering & pagination
 * GET /api/returns/admin/all
 */
export const getAllReturnsAdmin = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query;
    const result = await returnService.getAllReturnsAdmin({ page, limit, status });
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Administrator: Update the status of a return request and optionally restock items
 * PATCH /api/returns/admin/:id/status
 */
export const updateReturnStatusAdmin = async (req, res, next) => {
  try {
    const { status, adminNotes, refundStatus, restockItems } = req.body;
    const updatedReturn = await returnService.updateReturnStatusAdmin(
      req.params.id,
      { status, adminNotes, refundStatus, restockItems }
    );

    res.status(200).json({
      success: true,
      message: `Return request status updated to "${updatedReturn.status}".`,
      data: { returnRequest: updatedReturn },
    });
  } catch (err) {
    next(err);
  }
};
