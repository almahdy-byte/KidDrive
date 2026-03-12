import { NextFunction, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { subscriptionRepo } from "../../db/models/subscriptionModel/subscription.repo";
import { ISubscription } from "../../db/models/subscriptionModel/subscription.model";
import { Role, Status, AppError, IRequest } from "../../common";

export class SubscriptionController {
  // Create subscription - Parent role can access
  async createSubscription(req: IRequest, res: Response, next: NextFunction) {
    try {
      const { driverId, parentId, childId, expiryDate, subscriptionType } = req.body;

      // Check if parent is creating subscription for their child
      if (req.user?.role === Role.Parent && req.user?._id.toString() !== parentId) {
        return next(new AppError("Parents can only create subscriptions for their children", StatusCodes.FORBIDDEN));
      }

      // Only parents can create subscriptions
      if (req.user?.role !== Role.Parent && req.user?.role !== Role.Admin) {
        return next(new AppError("Only parents can create subscriptions", StatusCodes.FORBIDDEN));
      }

      const subscriptionData: Partial<ISubscription> = {
        driverId,
        parentId,
        childId,
        expiryDate: new Date(expiryDate),
        subscriptionType,
        status: Status.PENDING,
      };

      const subscription = await subscriptionRepo.create(subscriptionData);
      
      res.status(StatusCodes.CREATED).json({
        success: true,
        message: "Subscription created successfully",
        data: subscription,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get subscription by ID - Both driver and parent can access if it's their subscription
  async getSubscriptionById(req: IRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const subscription = await subscriptionRepo.findByIdWithPopulate(id as string);

      if (!subscription) {
        return next(new AppError("Subscription not found", StatusCodes.NOT_FOUND));
      }

      // Check if user has permission to view this subscription
      if (req.user?.role === Role.Admin) {
        // Admin can view all
      } else if (req.user?.role === Role.Driver && req.user?._id.toString() !== subscription.driverId.toString()) {
        return next(new AppError("Access denied", StatusCodes.FORBIDDEN));
      } else if (req.user?.role === Role.Parent && req.user?._id.toString() !== subscription.parentId.toString()) {
        return next(new AppError("Access denied", StatusCodes.FORBIDDEN));
      }

      res.status(StatusCodes.OK).json({
        success: true,
        data: subscription,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get subscriptions by driver - Driver can access their own, Admin can access all
  async getSubscriptionsByDriver(req: IRequest, res: Response, next: NextFunction) {
    try {
      const { driverId } = req.params;
      const { status } = req.query;

      // Check permissions
      if (req.user?.role === Role.Driver && req.user?._id.toString() !== driverId) {
        return next(new AppError("Drivers can only view their own subscriptions", StatusCodes.FORBIDDEN));
      }

      let subscriptions;
      if (status) {
        subscriptions = await subscriptionRepo.findByDriver(driverId as string);
        subscriptions = subscriptions.filter(sub => sub.status === status as Status);
      } else {
        subscriptions = await subscriptionRepo.findByDriver(driverId as string);
      }

      res.status(StatusCodes.OK).json({
        success: true,
        data: subscriptions,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get subscriptions by parent - Parent can access their own, Admin can access all
  async getSubscriptionsByParent(req: IRequest, res: Response, next: NextFunction) {
    try {
      const { parentId } = req.params;
      const { status } = req.query;

      // Check permissions
      if (req.user?.role === Role.Parent && req.user?._id.toString() !== parentId) {
        return next(new AppError("Parents can only view their own subscriptions", StatusCodes.FORBIDDEN));
      }

      let subscriptions;
      if (status) {
        subscriptions = await subscriptionRepo.findByParent(parentId as string);
        subscriptions = subscriptions.filter(sub => sub.status === status as Status);
      } else {
        subscriptions = await subscriptionRepo.findByParent(parentId as string);
      }

      res.status(StatusCodes.OK).json({
        success: true,
        data: subscriptions,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get subscriptions by child - Parent can access their children's subscriptions, Admin can access all
  async getSubscriptionsByChild(req: IRequest, res: Response, next: NextFunction) {
    try {
      const { childId } = req.params;
      const { status } = req.query;

      // For parents, we need to check if the child belongs to them
      if (req.user?.role === Role.Parent) {
        // This would require checking if the child belongs to the parent
        // For now, we'll allow it but you might want to add this check
      }

      let subscriptions;
      if (status) {
        subscriptions = await subscriptionRepo.findByChild(childId as string);
        subscriptions = subscriptions.filter(sub => sub.status === status as Status);
      } else {
        subscriptions = await subscriptionRepo.findByChild(childId as string);
      }

      res.status(StatusCodes.OK).json({
        success: true,
        data: subscriptions,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update subscription status - Driver can accept/reject, Admin can update any
  async updateSubscriptionStatus(req: IRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const subscription = await subscriptionRepo.findByIdWithPopulate(id as string);
      if (!subscription) {
        return next(new AppError("Subscription not found", StatusCodes.NOT_FOUND));
      }

      // Check permissions
      if (req.user?.role === Role.Driver && req.user?._id.toString() !== subscription.driverId.toString()) {
        return next(new AppError("Drivers can only update subscriptions addressed to them", StatusCodes.FORBIDDEN));
      }

      // Only drivers can accept/reject, admin can do anything
      if (req.user?.role === Role.Driver && status !== Status.ACCEPTED && status !== Status.REJECTED) {
        return next(new AppError("Drivers can only accept or reject subscriptions", StatusCodes.FORBIDDEN));
      }

      const updatedSubscription = await subscriptionRepo.updateStatus(id as string, status);

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Subscription status updated successfully",
        data: updatedSubscription,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all subscriptions - Admin only
  async getAllSubscriptions(req: IRequest, res: Response, next: NextFunction) {
    try {
      if (req.user?.role !== Role.Admin) {
        return next(new AppError("Access denied. Admin only", StatusCodes.FORBIDDEN));
      }

      const subscriptions = await subscriptionRepo.findAll();

      res.status(StatusCodes.OK).json({
        success: true,
        data: subscriptions,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get pending subscriptions - Admin sees all, Driver sees their own, Parent sees their children's
  async getPendingSubscriptions(req: IRequest, res: Response, next: NextFunction) {
    try {
      let subscriptions = await subscriptionRepo.findPendingSubscriptions();

      // Filter based on user role
      if (req.user?.role === Role.Driver) {
        subscriptions = subscriptions.filter(sub => sub.driverId.toString() === req.user?._id.toString());
      } else if (req.user?.role === Role.Parent) {
        subscriptions = subscriptions.filter(sub => sub.parentId.toString() === req.user?._id.toString());
      }
      // Admin sees all pending subscriptions

      res.status(StatusCodes.OK).json({
        success: true,
        data: subscriptions,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get subscriptions for current user - Parent and Driver can see their own subscriptions
  async getMySubscriptions(req: IRequest, res: Response, next: NextFunction) {
    try {
      let subscriptions;
      
      if (req.user?.role === Role.Parent) {
        subscriptions = await subscriptionRepo.findByParent(req.user._id.toString());
      } else if (req.user?.role === Role.Driver) {
        subscriptions = await subscriptionRepo.findByDriver(req.user._id.toString());
      } else {
        return next(new AppError("This endpoint is for parents and drivers only", StatusCodes.FORBIDDEN));
      }

      res.status(StatusCodes.OK).json({
        success: true,
        data: subscriptions,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const subscriptionController = new SubscriptionController();
