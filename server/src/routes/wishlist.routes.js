import { Router } from 'express';
import { verifyAuth } from '../middleware/auth.middleware.js';
import * as wishlistController from '../controllers/wishlist.controller.js';

const router = Router();

// All wishlist routes require customer authentication
router.use(verifyAuth);

router.get('/', wishlistController.getWishlist);
router.post('/', wishlistController.addToWishlist);
router.post('/:productId', wishlistController.addToWishlist);
router.delete('/:productId', wishlistController.removeFromWishlist);
router.get('/check/:productId', wishlistController.checkWishlistStatus);

export default router;
