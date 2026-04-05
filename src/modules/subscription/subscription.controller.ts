import { NextFunction, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { subscriptionRepo } from "../../db/models/subscriptionModel/subscription.repo";
import { ISubscription } from "../../db/models/subscriptionModel/subscription.model";
import { Role, Status, AppError, IRequest, getPaginationOptions, calculatePagination, createPaginatedResponse } from "../../common";

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
      const pagination = getPaginationOptions(req.query);

      // Check permissions
      if (req.user?.role === Role.Driver && req.user?._id.toString() !== driverId) {
        return next(new AppError("Drivers can only view their own subscriptions", StatusCodes.FORBIDDEN));
      }

      const result = await subscriptionRepo.findByDriverPaginated(
        driverId as string,
        pagination.page,
        pagination.limit,
        pagination.search
      );

      const paginationResult = calculatePagination(pagination.page!, pagination.limit!, result.total, "subscriptions");
      const paginatedResponse = createPaginatedResponse(result.subscriptions, paginationResult);

      res.status(StatusCodes.OK).json({
        success: true,
        ...paginatedResponse
      });
    } catch (error) {
      next(error);
    }
  }

  // Get subscriptions by parent - Parent can access their own, Admin can access all
  async getSubscriptionsByParent(req: IRequest, res: Response, next: NextFunction) {
    try {
      const { parentId } = req.params;
      const pagination = getPaginationOptions(req.query);

      // Check permissions
      if (req.user?.role === Role.Parent && req.user?._id.toString() !== parentId) {
        return next(new AppError("Parents can only view their own subscriptions", StatusCodes.FORBIDDEN));
      }

      const result = await subscriptionRepo.findByParentPaginated(
        parentId as string,
        pagination.page,
        pagination.limit,
        pagination.search
      );

      const paginationResult = calculatePagination(pagination.page!, pagination.limit!, result.total, "subscriptions");
      const paginatedResponse = createPaginatedResponse(result.subscriptions, paginationResult);

      res.status(StatusCodes.OK).json({
        success: true,
        ...paginatedResponse
      });
    } catch (error) {
      next(error);
    }
  }

  // Get subscriptions by child - Parent can access their children's subscriptions, Admin can access all
  async getSubscriptionsByChild(req: IRequest, res: Response, next: NextFunction) {
    try {
      const { childId } = req.params;
      const pagination = getPaginationOptions(req.query);

      const result = await subscriptionRepo.findByChildPaginated(
        childId as string,
        pagination.page,
        pagination.limit,
        pagination.search
      );

      const paginationResult = calculatePagination(pagination.page!, pagination.limit!, result.total, "subscriptions");
      const paginatedResponse = createPaginatedResponse(result.subscriptions, paginationResult);

      res.status(StatusCodes.OK).json({
        success: true,
        ...paginatedResponse
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
      if (req.user?.role === Role.Driver && req.user?._id.toString() !== subscription.driverId._id.toString()) {
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

      const pagination = getPaginationOptions(req.query);
      const result = await subscriptionRepo.findAllPaginated(
        pagination.page,
        pagination.limit,
        pagination.search
      );

      const paginationResult = calculatePagination(pagination.page!, pagination.limit!, result.total, "subscriptions");
      const paginatedResponse = createPaginatedResponse(result.subscriptions, paginationResult);

      res.status(StatusCodes.OK).json({
        success: true,
        ...paginatedResponse
      });
    } catch (error) {
      next(error);
    }
  }

  // Get pending subscriptions - Admin sees all, Driver sees their own, Parent sees their children's
  async getPendingSubscriptions(req: IRequest, res: Response, next: NextFunction) {
    try {
      const pagination = getPaginationOptions(req.query);
      
      // Since it's easier to filter in the repository for large datasets, 
      // let's assume the repo handles simple global pending, or we'd need more specific repo methods.
      // But for now, we'll use a slightly more complex repo filter if needed or just filter here for MVP.
      
      const result = await subscriptionRepo.findPendingSubscriptionsPaginated(
        pagination.page,
        pagination.limit,
        pagination.search
      );

      // We still need to filter by role if not admin
      let filteredSubscriptions = result.subscriptions;
      if (req.user?.role === Role.Driver) {
        filteredSubscriptions = result.subscriptions.filter(sub => sub.driverId._id.toString() === req.user?._id.toString());
      } else if (req.user?.role === Role.Parent) {
        filteredSubscriptions = result.subscriptions.filter(sub => sub.parentId._id.toString() === req.user?._id.toString());
      }

      const paginationResult = calculatePagination(pagination.page!, pagination.limit!, filteredSubscriptions.length, "subscriptions");
      const paginatedResponse = createPaginatedResponse(filteredSubscriptions, paginationResult);

      res.status(StatusCodes.OK).json({
        success: true,
        ...paginatedResponse
      });
    } catch (error) {
      next(error);
    }
  }

  // Get subscriptions for current user - Parent and Driver can see their own subscriptions
  async getMySubscriptions(req: IRequest, res: Response, next: NextFunction) {
    try {
      const pagination = getPaginationOptions(req.query);
      let result;
      
      if (req.user?.role === Role.Parent) {
        result = await subscriptionRepo.findByParentPaginated(req.user._id.toString(), pagination.page, pagination.limit, pagination.search);
      } else if (req.user?.role === Role.Driver) {
        result = await subscriptionRepo.findByDriverPaginated(req.user._id.toString(), pagination.page, pagination.limit, pagination.search);
      } else {
        return next(new AppError("This endpoint is for parents and drivers only", StatusCodes.FORBIDDEN));
      }

      const paginationResult = calculatePagination(pagination.page!, pagination.limit!, result.total, "subscriptions");
      const paginatedResponse = createPaginatedResponse(result.subscriptions, paginationResult);

      res.status(StatusCodes.OK).json({
        success: true,
        ...paginatedResponse
      });
    } catch (error) {
      next(error);
    }
  }
}

export const subscriptionController = new SubscriptionController();
