import { NextFunction, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { subscriptionRepo } from "../../db/models/subscriptionModel/subscription.repo";
import { ISubscription } from "../../db/models/subscriptionModel/subscription.model";
import { tripGeneratorService } from "../trip/services/tripGenerator.service";
import { sendSubscriptionNotification } from "../../services/notification.service";
import { Role, Status, SubscriptionType, AppError, IRequest, getPaginationOptions, calculatePagination, createPaginatedResponse } from "../../common";
import { userModel } from "../../db/models/userModel/user.model";
import { ChildModel } from "../../db/models/childModel/child.model";
import { DriverModel } from "../../db/models/driverModel/driver.model";

export class SubscriptionController {
  // Create subscription - Parent role can access
  async createSubscription(req: IRequest, res: Response, next: NextFunction) {
    try {
      const { driverId, parentId, childId, expiryDate, subscriptionType, schedule, origin, destination } = req.body;

      // Check if parent is creating subscription for their child
      if (req.user?.role === Role.Parent && req.user?._id.toString() !== parentId) {
        return next(new AppError("Parents can only create subscriptions for their children", StatusCodes.FORBIDDEN));
      }

      // Only parents can create subscriptions
      if (req.user?.role !== Role.Parent && req.user?.role !== Role.Admin) {
        return next(new AppError("Only parents can create subscriptions", StatusCodes.FORBIDDEN));
      }

      // Auto-set expiry date to 1 month from now if not provided
      let finalExpiryDate: Date;
      if (expiryDate) {
        finalExpiryDate = new Date(expiryDate);
      } else {
        finalExpiryDate = new Date();
        finalExpiryDate.setMonth(finalExpiryDate.getMonth() + 1);
      }

      const subscriptionData: Partial<ISubscription> = {
        driverId,
        parentId,
        childId,
        expiryDate: finalExpiryDate,
        subscriptionType,
        status: Status.PENDING,
        schedulePattern: schedule,
        schedule: [],
        origin,
        destination,
      };

      let subscription = await subscriptionRepo.create(subscriptionData);

      // Automatically generate trips from schedule pattern
      if (subscription) {
        const generatedTrips = await tripGeneratorService.generateTripsForDateRange(
          subscription,
          30
        );

        // Update subscription schedule with generated trip IDs
        if (generatedTrips.length > 0) {
          const tripIds = generatedTrips.map(trip => trip._id);
          subscription = await subscriptionRepo.addTripsToSchedule(subscription._id.toString(), tripIds);
        }
      }
      
      const populatedSub = subscription?._id
        ? await subscriptionRepo.findByIdWithPopulate(subscription._id.toString())
        : null;
      if (populatedSub) {
        sendSubscriptionNotification(populatedSub, Status.PENDING);
      }

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
      let { status } = req.body;

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

      if(status == 'accepted' ){
        status = Status.ACCEPTED;
      }
        else if(status == 'rejected'){
          status = Status.REJECTED;
        }
      const updatedSubscription = await subscriptionRepo.updateStatus(id as string, status);

      // If subscription is accepted, generate trips automatically
      if (status === Status.ACCEPTED && updatedSubscription) {
        try {
          // Generate trips for the next 30 days
          const generatedTrips = await tripGeneratorService.generateTripsForDateRange(
            updatedSubscription,
            30
          );

          // Add newly generated trip IDs to subscription schedule
          if (generatedTrips.length > 0) {
            const tripIds = generatedTrips.map(trip => trip._id);
            await subscriptionRepo.addTripsToSchedule(updatedSubscription._id.toString(), tripIds);
          }

          // Re-fetch subscription with populated schedule
          const subscriptionWithTrips = await subscriptionRepo.findByIdWithPopulate(updatedSubscription._id.toString());
          
          sendSubscriptionNotification(subscriptionWithTrips || updatedSubscription, status);

          res.status(StatusCodes.OK).json({
            success: true,
            message: "Subscription accepted and trips generated successfully",
            data: {
              subscription: subscriptionWithTrips,
              generatedTripsCount: generatedTrips.length,
            },
          });
          return;
        } catch (tripError) {
          console.error("Error generating trips:", tripError);
          sendSubscriptionNotification(updatedSubscription, status);
          // Still return success for subscription update, but note trip generation failure
          res.status(StatusCodes.OK).json({
            success: true,
            message: "Subscription status updated, but trip generation failed",
            data: updatedSubscription,
          });
          return;
        }
      }

      sendSubscriptionNotification(updatedSubscription, status);

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
        return next(new AppError("This endpoint is parents and drivers only", StatusCodes.FORBIDDEN));
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

  // Get driver subscriptions with status filter
  async getDriverSubscriptions(req: IRequest, res: Response, next: NextFunction) {
    try {
      const { driverId } = req.params;
      const { status } = req.query;
      const pagination = getPaginationOptions(req.query);

      // Check permissions
      if (req.user?.role === Role.Driver && req.user?._id.toString() !== driverId) {
        return next(new AppError("Drivers can only view their own subscriptions", StatusCodes.FORBIDDEN));
      }

      let result;
      
      // If status is 'active' or 'accepted', use the active subscriptions method
      if (status === 'active' || status === Status.ACCEPTED) {
        result = await subscriptionRepo.findActiveSubscriptionsPaginated(
          pagination.page,
          pagination.limit,
          pagination.search,
          driverId as string
        );
      } else if (status === 'pending') {
        result = await subscriptionRepo.findPendingSubscriptionsPaginated(
          pagination.page,
          pagination.limit,
          pagination.search,
          driverId as string
        );
      } else {
        // Get all subscriptions for driver
        result = await subscriptionRepo.findByDriverPaginated(
          driverId as string,
          pagination.page,
          pagination.limit,
          pagination.search,
          status as Status
        );
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

  // Generate trips from subscription - Admin, Driver (own), or Parent (own) can trigger
  async generateTripsFromSubscription(req: IRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { daysAhead = 30 } = req.body;

      const subscription = await subscriptionRepo.findByIdWithPopulate(id as string);
      if (!subscription) {
        return next(new AppError("Subscription not found", StatusCodes.NOT_FOUND));
      }

      // Check permissions
      if (req.user?.role === Role.Admin) {
        // Admin can generate trips for any subscription
      } else if (req.user?.role === Role.Driver && req.user?._id.toString() !== subscription.driverId.toString()) {
        return next(new AppError("Drivers can only generate trips for their own subscriptions", StatusCodes.FORBIDDEN));
      } else if (req.user?.role === Role.Parent && req.user?._id.toString() !== subscription.parentId.toString()) {
        return next(new AppError("Parents can only generate trips for their own subscriptions", StatusCodes.FORBIDDEN));
      }

      // Only generate trips for accepted subscriptions
      if (subscription.status !== Status.ACCEPTED) {
        return next(new AppError("Can only generate trips for accepted subscriptions", StatusCodes.BAD_REQUEST));
      }

      const generatedTrips = await tripGeneratorService.generateTripsForDateRange(
        subscription,
        daysAhead
      );

      // Add newly generated trip IDs to subscription schedule
      if (generatedTrips.length > 0) {
        const tripIds = generatedTrips.map(trip => trip._id);
        await subscriptionRepo.addTripsToSchedule(subscription._id.toString(), tripIds);
      }

      res.status(StatusCodes.OK).json({
        success: true,
        message: `Generated ${generatedTrips.length} trips successfully`,
        data: {
          generatedTripsCount: generatedTrips.length,
          trips: generatedTrips,
        },
      });
    } catch (error) {
      next(error);
    }
  }
  // Seed subscriptions for all parents (dev utility)
  async seedSubscriptions(req: IRequest, res: Response, next: NextFunction) {
    try {
      if (req.user?.role !== Role.Admin) {
        return next(new AppError("Access denied. Admin only", StatusCodes.FORBIDDEN));
      }

      const parents = await userModel.find({ role: Role.Parent });
      if (parents.length === 0) {
        return next(new AppError("No parents found. Run seed first.", StatusCodes.NOT_FOUND));
      }

      const drivers = await DriverModel.find({ isApproved: true });
      if (drivers.length === 0) {
        return next(new AppError("No approved drivers found. Run seed first.", StatusCodes.NOT_FOUND));
      }

      let createdCount = 0;
      let tripCount = 0;

      for (const parent of parents) {
        const children = await ChildModel.find({ parentId: parent._id, isDeleted: { $ne: true } });
        if (children.length === 0) continue;

        const driver = drivers[createdCount % drivers.length];
        const child = children[0];

        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 3);

        const schedulePattern = [
          { dayOfWeek: 0, pickupTime: "07:30", dropoffTime: "14:00" },
          { dayOfWeek: 1, pickupTime: "07:30", dropoffTime: "14:00" },
          { dayOfWeek: 2, pickupTime: "07:30", dropoffTime: "14:00" },
          { dayOfWeek: 3, pickupTime: "07:30", dropoffTime: "14:00" },
        ];

        const subscriptionData: Partial<ISubscription> = {
          driverId: driver._id,
          parentId: parent._id,
          childId: child._id,
          expiryDate,
          subscriptionType: SubscriptionType.MONTHLY,
          status: Status.PENDING,
          schedulePattern,
          schedule: [],
          origin: {
            latitude: parent.location?.latitude || 30.0,
            longitude: parent.location?.longitude || 31.2,
            address: parent.location?.address || `${parent.location?.city || "Cairo"}, ${parent.location?.department || ""}`,
          },
          destination: {
            latitude: child.schoolLocation?.latitude || 30.0,
            longitude: child.schoolLocation?.longitude || 31.2,
            address: child.school || "School",
          },
        };

        let subscription = await subscriptionRepo.create(subscriptionData);

        if (subscription) {
          const generatedTrips = await tripGeneratorService.generateTripsForDateRange(subscription, 30);
          if (generatedTrips.length > 0) {
            const tripIds = generatedTrips.map(t => t._id);
            subscription = await subscriptionRepo.addTripsToSchedule(subscription._id.toString(), tripIds);
            tripCount += generatedTrips.length;
          }
          createdCount++;
        }
      }

      res.status(StatusCodes.CREATED).json({
        success: true,
        message: `Created ${createdCount} subscriptions with ${tripCount} trips`,
        data: { subscriptionsCount: createdCount, tripsCount: tripCount },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const subscriptionController = new SubscriptionController();
