import prisma from '../config/db.js';
import * as bkashService from '../services/bkash.service.js';
import * as orderService from '../services/order.service.js';

/**
 * Initiate a bKash Sandbox payment session
 * POST /api/bkash/create-payment
 */
export const createPaymentHandler = async (req, res, next) => {
  try {
    const { items, shippingAddress, couponCode } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Please add items before checking out.',
      });
    }

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

    // Ensure paymentMethod is explicitly set to bkash_sandbox
    const addressWithPayment = {
      ...shippingAddress,
      paymentMethod: 'bkash_sandbox',
      paymentDetails: {
        methodName: 'bKash (Official Sandbox)',
        status: 'Initiated',
      },
    };

    // 1. Create Order in PENDING status and reserve stock
    const order = await orderService.createOrder({
      userId: req.user.id,
      items,
      shippingAddress: addressWithPayment,
      couponCode,
    });

    // 2. Call bKash Create Payment API
    const payerPhone = shippingAddress.phone || '01770618575';
    const bkashPayment = await bkashService.createPayment({
      amount: order.totalAmount,
      orderId: order.id,
      payerReference: payerPhone,
    });

    // 3. Store paymentID into order shippingAddress JSON
    await orderService.updateOrderPaymentMetadata(order.id, {
      paymentID: bkashPayment.paymentID,
      merchantInvoiceNumber: bkashPayment.merchantInvoiceNumber,
      status: 'PendingAuthorization',
    });

    return res.status(200).json({
      success: true,
      message: 'bKash payment session created successfully.',
      data: {
        orderId: order.id,
        paymentID: bkashPayment.paymentID,
        bkashURL: bkashPayment.bkashURL,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Handle bKash redirect callback
 * GET or POST /api/bkash/callback
 * bKash redirects browser here with ?paymentID=...&status=...&orderId=...
 */
export const handleCallback = async (req, res, next) => {
  const rawClientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const clientUrl = rawClientUrl.trim().replace(/\/+$/, '');

  const paymentID = req.query.paymentID || req.body.paymentID;
  const status = req.query.status || req.body.status;
  const rawOrderId = req.query.orderId || req.body.orderId;

  if (!paymentID) {
    return res.redirect(`${clientUrl}/checkout?payment=failed&message=${encodeURIComponent('No paymentID returned from bKash')}`);
  }

  try {
    // 1. Associate with internal order
    let order = null;
    if (rawOrderId) {
      const parsedId = parseInt(rawOrderId, 10);
      if (!isNaN(parsedId)) {
        order = await prisma.order.findUnique({
          where: { id: parsedId },
          include: { items: true },
        });
      }
    }

    // Fallback: look up by paymentID inside shippingAddress if orderId was not in query
    if (!order) {
      order = await prisma.order.findFirst({
        where: {
          shippingAddress: {
            contains: paymentID,
          },
        },
        include: { items: true },
      });
    }

    if (!order) {
      return res.redirect(
        `${clientUrl}/checkout?payment=failed&message=${encodeURIComponent('Matching order not found for this bKash transaction.')}`
      );
    }

    // Verify that the order's stored payment details match this paymentID
    let storedPaymentId = null;
    try {
      const parsedAddress =
        typeof order.shippingAddress === 'string'
          ? JSON.parse(order.shippingAddress)
          : order.shippingAddress || {};
      storedPaymentId = parsedAddress?.paymentDetails?.paymentID;
    } catch {
      storedPaymentId = null;
    }

    if (storedPaymentId && storedPaymentId !== paymentID) {
      return res.redirect(
        `${clientUrl}/checkout?payment=failed&message=${encodeURIComponent('Payment ID mismatch for this order.')}`
      );
    }

    // 2. Idempotency Check: if already paid, avoid duplicate execution or duplicate notifications
    if (order.status === 'PAID') {
      return res.redirect(`${clientUrl}/order-success/${order.id}?payment=bkash&alreadyPaid=true`);
    }

    // 3. Handle status from bKash callback
    if (status === 'cancel') {
      await orderService.cancelOrderAndRestoreStock(order.id, 'Customer cancelled transaction on bKash');
      return res.redirect(`${clientUrl}/checkout?payment=cancelled`);
    }

    if (status === 'failure') {
      await orderService.cancelOrderAndRestoreStock(order.id, 'Transaction failed on bKash');
      return res.redirect(`${clientUrl}/checkout?payment=failed&message=${encodeURIComponent('Payment failed on bKash.')}`);
    }

    if (status === 'success') {
      // 4. Server-Side Execution: Call bKash executePayment API
      const executeResult = await bkashService.executePayment(paymentID);

      // Verify bKash execution status
      if (executeResult.statusCode === '0000' && executeResult.transactionStatus === 'Completed') {
        // Verify payment amount matches order total amount
        const paidAmount = parseFloat(executeResult.amount);
        if (isNaN(paidAmount) || Math.abs(paidAmount - order.totalAmount) > 0.05) {
          await orderService.cancelOrderAndRestoreStock(
            order.id,
            `Amount mismatch: expected ৳${order.totalAmount.toFixed(2)}, received ৳${paidAmount.toFixed(2)}`
          );
          return res.redirect(
            `${clientUrl}/checkout?payment=failed&message=${encodeURIComponent('Payment amount mismatch. Order cancelled.')}`
          );
        }

        // 5. Confirm order payment atomically
        const confirmedOrder = await orderService.confirmOrderPayment(order.id, executeResult);

        return res.redirect(
          `${clientUrl}/order-success/${confirmedOrder.id}?payment=bkash&trxID=${encodeURIComponent(executeResult.trxID)}`
        );
      } else {
        // Execute returned an error status from bKash
        const failMessage = executeResult.statusMessage || 'Payment execution rejected by bKash';
        await orderService.cancelOrderAndRestoreStock(order.id, failMessage);
        return res.redirect(`${clientUrl}/checkout?payment=failed&message=${encodeURIComponent(failMessage)}`);
      }
    }

    // Unknown status
    await orderService.cancelOrderAndRestoreStock(order.id, `Unknown bKash status: ${status}`);
    return res.redirect(`${clientUrl}/checkout?payment=failed&message=${encodeURIComponent('Unrecognized payment status.')}`);
  } catch (err) {
    console.error('Error handling bKash callback:', err);
    return res.redirect(
      `${clientUrl}/checkout?payment=failed&message=${encodeURIComponent(err.message || 'An unexpected error occurred during payment.')}`
    );
  }
};
