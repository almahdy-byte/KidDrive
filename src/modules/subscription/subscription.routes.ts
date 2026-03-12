import { Router, Request, Response, NextFunction } from "express";
import { subscriptionController } from "./subscription.controller";
import { validate } from "../../middleware/validation.middleware";
import {
  createSubscription,
  updateSubscriptionStatus,
  getSubscriptionById,
  getSubscriptionsByDriver,
  getSubscriptionsByParent,
  getSubscriptionsByChild,
} from "./subscription.validation";
import { auth } from "../../middleware/auth.middleware";
import { Role, IRequest } from "../../common";

const router = Router();

// Create subscription - Parent role can access
router.post(
  "/",
  auth,
  validate(createSubscription),
  subscriptionController.createSubscription
);

// Get subscriptions for current user - Parent and Driver can see their own subscriptions
router.get(
  "/my",
  auth,
  subscriptionController.getMySubscriptions
);

// Get subscription by ID - Both driver and parent can access if it's their subscription
router.get(
  "/:id",
  auth,
  validate(getSubscriptionById),
  subscriptionController.getSubscriptionById
);

// Get subscriptions by driver - Driver can access their own, Admin can access all
router.get(
  "/driver/:driverId",
  auth,
  validate(getSubscriptionsByDriver),
  subscriptionController.getSubscriptionsByDriver
);

// Get subscriptions by parent - Parent can access their own, Admin can access all
router.get(
  "/parent/:parentId",
  auth,
  validate(getSubscriptionsByParent),
  subscriptionController.getSubscriptionsByParent
);

// Get subscriptions by child - Parent can access their children's subscriptions, Admin can access all
router.get(
  "/child/:childId",
  auth,
  validate(getSubscriptionsByChild),
  subscriptionController.getSubscriptionsByChild
);

// Update subscription status - Driver can accept/reject, Admin can update any
router.patch(
  "/:id/status",
  auth,
  validate(updateSubscriptionStatus),
  subscriptionController.updateSubscriptionStatus
);

// Get all subscriptions - Admin only
router.get(
  "/",
  auth,
  (req: IRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== Role.Admin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only",
      });
    }
    next();
  },
  subscriptionController.getAllSubscriptions
);

// Get pending subscriptions - Admin sees all, Driver sees their own, Parent sees their children's
router.get(
  "/pending/all",
  auth,
  subscriptionController.getPendingSubscriptions
);

export default router;
