import * as couponService from '../services/coupon.service.js';

export const validateCoupon = async (req, res) => {
  try {
    const { code, items } = req.body;
    const userId = req.user ? req.user.id : null;
    const result = await couponService.validateCoupon({
      code,
      items,
      userId,
    });
    res.status(200).json({
      success: true,
      message: `Coupon "${result.coupon.code}" applied successfully!`,
      data: result,
    });
  } catch (error) {
    res.status(error.status || 400).json({
      success: false,
      message: error.message || 'Failed to validate coupon.',
    });
  }
};

export const getAllCouponsAdmin = async (req, res) => {
  try {
    const coupons = await couponService.getAllCouponsAdmin();
    res.status(200).json({
      success: true,
      data: { coupons },
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Failed to fetch coupons.',
    });
  }
};

export const createCoupon = async (req, res) => {
  try {
    const coupon = await couponService.createCoupon(req.body);
    res.status(201).json({
      success: true,
      message: `Coupon "${coupon.code}" created successfully.`,
      data: { coupon },
    });
  } catch (error) {
    res.status(error.status || 400).json({
      success: false,
      message: error.message || 'Failed to create coupon.',
    });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const coupon = await couponService.updateCoupon(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: `Coupon "${coupon.code}" updated successfully.`,
      data: { coupon },
    });
  } catch (error) {
    res.status(error.status || 400).json({
      success: false,
      message: error.message || 'Failed to update coupon.',
    });
  }
};

export const toggleCouponActive = async (req, res) => {
  try {
    const coupon = await couponService.toggleCouponActive(req.params.id);
    res.status(200).json({
      success: true,
      message: `Coupon "${coupon.code}" is now ${coupon.isActive ? 'active' : 'inactive'}.`,
      data: { coupon },
    });
  } catch (error) {
    res.status(error.status || 400).json({
      success: false,
      message: error.message || 'Failed to toggle coupon status.',
    });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const result = await couponService.deleteCoupon(req.params.id);
    res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    res.status(error.status || 400).json({
      success: false,
      message: error.message || 'Failed to delete coupon.',
    });
  }
};
