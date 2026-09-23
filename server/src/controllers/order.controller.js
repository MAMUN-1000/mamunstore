import * as orderService from '../services/order.service.js';

/**
 * Place a new order
 * POST /api/orders
 */
export const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress } = req.body;

    // Manual Validation
    if (!shippingAddress || typeof shippingAddress !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Valid shipping address is required.',
      });
    }

    const { street, city, postalCode, country } = shippingAddress;
    if (!street || !city || !postalCode || !country) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address must include street, city, postal code, and country.',
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Please add items before placing an order.',
      });
    }

    const order = await orderService.createOrder({
      userId: req.user.id,
      items,
      shippingAddress,
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      data: { order },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get logged-in customer's orders
 * GET /api/orders/my-orders
 */
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getMyOrders(req.user.id);
    return res.status(200).json({
      success: true,
      data: { orders },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get a specific order by ID
 * GET /api/orders/:id
 */
export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(id, req.user.id, req.user.role);

    return res.status(200).json({
      success: true,
      data: { order },
    });
  } catch (err) {
    next(err);
  }
};
