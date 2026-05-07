import { NextFunction, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { tripRepo } from "../../db/models/tripModel/trip.repo";
import { subscriptionRepo } from "../../db/models/subscriptionModel/subscription.repo";
import { ITrip } from "../../db/models/tripModel/trip.model";
import { tripGeneratorService } from "./services/tripGenerator.service";
import { Role, Status, AppError, IRequest, getPaginationOptions, calculatePagination, createPaginatedResponse } from "../../common";

export class TripController {
  // Start trip - Driver or Parent can start
  async startTrip(req: IRequest, res: Response, next: NextFunction) {
    try {
      const { driverId, parentId, childId, subscriptionId, origin, destination, tripType, scheduledDate, scheduledTime } = req.body;

      // Check permissions
      if (req.user?.role === Role.Driver && req.user?._id.toString() !== driverId) {
        return next(new AppError("Drivers can only start trips for themselves", StatusCodes.FORBIDDEN));
      }

      if (req.user?.role === Role.Parent && req.user?._id.toString() !== parentId) {
        return next(new AppError("Parents can only start trips for their children", StatusCodes.FORBIDDEN));
      }

      const tripScheduledDate = scheduledDate ? new Date(scheduledDate) : new Date();
      const tripData: Partial<ITrip> = {
        driverId,
        parentId,
        childId,
        subscriptionId,
        origin,
        destination,
        status: 'trip_started',
        tripType: tripType || 'pickup',
        scheduledDate: tripScheduledDate,
        scheduledTime: scheduledTime || new Date().toTimeString().slice(0, 5),
        dayOfWeek: tripScheduledDate.getDay(),
        startTime: new Date(),
      };

      const trip = await tripRepo.create(tripData);
      
      res.status(StatusCodes.CREATED).json({
        success: true,
        message: "Trip started successfully",
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  }

  // End trip - Driver or Parent can end trips
  async endTrip(req: IRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const trip = await tripRepo.findByIdWithPopulate(id as string);
      if (!trip) {
        return next(new AppError("Trip not found", StatusCodes.NOT_FOUND));
      }

      // Drivers can end their own trips, Parents can end their children's trips
      const tripDriverId = (trip.driverId?._id || trip.driverId)?.toString();
      const tripParentId = (trip.parentId?._id || trip.parentId)?.toString();
      
      const isDriver = req.user?.role === Role.Driver && req.user?._id.toString() === tripDriverId;
      const isParent = req.user?.role === Role.Parent && req.user?._id.toString() === tripParentId;
      const isAdmin = req.user?.role === Role.Admin;
      
      if (!isDriver && !isParent && !isAdmin) {
        return next(new AppError("Only drivers or parents can end this trip", StatusCodes.FORBIDDEN));
      }

      const updatedTrip = await tripRepo.updateStatus(id as string, 'trip_finished');

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Trip ended successfully",
        data: updatedTrip,
      });
    } catch (error) {
      next(error);
    }
  }

  // Start existing trip - Driver or Parent can start an idle trip
  async startExistingTrip(req: IRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const trip = await tripRepo.findByIdWithPopulate(id as string);
      if (!trip) {
        return next(new AppError("Trip not found", StatusCodes.NOT_FOUND));
      }

      // Only idle trips can be started
      if (trip.status !== 'idle') {
        return next(new AppError("Only idle trips can be started", StatusCodes.BAD_REQUEST));
      }

      // Drivers can start their own trips, Parents can start their children's trips
      const tripDriverId3 = (trip.driverId?._id || trip.driverId)?.toString();
      const tripParentId3 = (trip.parentId?._id || trip.parentId)?.toString();
      
      const isDriver3 = req.user?.role === Role.Driver && req.user?._id.toString() === tripDriverId3;
      const isParent3 = req.user?.role === Role.Parent && req.user?._id.toString() === tripParentId3;
      const isAdmin3 = req.user?.role === Role.Admin;
      
      if (!isDriver3 && !isParent3 && !isAdmin3) {
        return next(new AppError("Only drivers or parents can start this trip", StatusCodes.FORBIDDEN));
      }

      const updatedTrip = await tripRepo.updateStatus(id as string, 'trip_started');

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Trip started successfully",
        data: updatedTrip,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update trip status - Driver or Parent can update status
  async updateTripStatus(req: IRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const trip = await tripRepo.findByIdWithPopulate(id as string);
      if (!trip) {
        return next(new AppError("Trip not found", StatusCodes.NOT_FOUND));
      }

      // Drivers can update their own trips, Parents can update their children's trips
      const tripDriverId2 = (trip.driverId?._id || trip.driverId)?.toString();
      const tripParentId2 = (trip.parentId?._id || trip.parentId)?.toString();
      
      const isDriver2 = req.user?.role === Role.Driver && req.user?._id.toString() === tripDriverId2;
      const isParent2 = req.user?.role === Role.Parent && req.user?._id.toString() === tripParentId2;
      const isAdmin2 = req.user?.role === Role.Admin;
      
      if (!isDriver2 && !isParent2 && !isAdmin2) {
        return next(new AppError("Only drivers or parents can update trip status", StatusCodes.FORBIDDEN));
      }

      const updatedTrip = await tripRepo.updateStatus(id as string, status);

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Trip status updated successfully",
        data: updatedTrip,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get trip by ID - Driver and Parent can access their own
  async getTripById(req: IRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const trip = await tripRepo.findByIdWithPopulate(id as string);

      if (!trip) {
        return next(new AppError("Trip not found", StatusCodes.NOT_FOUND));
      }

      // Check permissions
      if (req.user?.role === Role.Admin) {
        // Admin can view all
      } else if (req.user?.role === Role.Driver && req.user?._id.toString() !== (trip.driverId?._id || trip.driverId)?.toString()) {
        return next(new AppError("Access denied", StatusCodes.FORBIDDEN));
      } else if (req.user?.role === Role.Parent && req.user?._id.toString() !== (trip.parentId?._id || trip.parentId)?.toString()) {
        return next(new AppError("Access denied", StatusCodes.FORBIDDEN));
      }

      res.status(StatusCodes.OK).json({
        success: true,
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get trips by driver - Driver can access their own, Admin can access all
  async getTripsByDriver(req: IRequest, res: Response, next: NextFunction) {
    try {
      const { driverId } = req.params;
      const { status } = req.query;
      const pagination = getPaginationOptions(req.query);

      // Check permissions
      if (req.user?.role === Role.Driver && req.user?._id.toString() !== driverId) {
        return next(new AppError("Drivers can only view their own trips", StatusCodes.FORBIDDEN));
      }

      const result = await tripRepo.findByDriverPaginated(
        driverId as string,
        pagination.page,
        pagination.limit,
        status as ITrip['status'],
        pagination.search
      );

      const paginationResult = calculatePagination(
        pagination.page!,
        pagination.limit!,
        result.total,
        'trips'
      );

      const paginatedResponse = createPaginatedResponse(result.trips, paginationResult);

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Trips retrieved successfully",
        ...paginatedResponse
      });
    } catch (error) {
      next(error);
    }
  }

  // Get trips by parent - Parent can access their own, Admin can access all
  async getTripsByParent(req: IRequest, res: Response, next: NextFunction) {
    try {
      const { parentId } = req.params;
      const { status } = req.query;
      const pagination = getPaginationOptions(req.query);

      // Check permissions
      if (req.user?.role === Role.Parent && req.user?._id.toString() !== parentId) {
        return next(new AppError("Parents can only view their own trips", StatusCodes.FORBIDDEN));
      }

      const result = await tripRepo.findByParentPaginated(
        parentId as string,
        pagination.page,
        pagination.limit,
        status as ITrip['status'],
        pagination.search
      );

      const paginationResult = calculatePagination(
        pagination.page!,
        pagination.limit!,
        result.total,
        'trips'
      );

      const paginatedResponse = createPaginatedResponse(result.trips, paginationResult);

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Trips retrieved successfully",
        ...paginatedResponse
      });
    } catch (error) {
      next(error);
    }
  }

  // Get trips by child - Parent can access their children's trips, Admin can access all
  async getTripsByChild(req: IRequest, res: Response, next: NextFunction) {
    try {
      const { childId } = req.params;
      const { status } = req.query;
      const pagination = getPaginationOptions(req.query);

      const result = await tripRepo.findByChildPaginated(
        childId as string,
        pagination.page,
        pagination.limit,
        status as ITrip['status'],
        pagination.search
      );

      const paginationResult = calculatePagination(
        pagination.page!,
        pagination.limit!,
        result.total,
        'trips'
      );

      const paginatedResponse = createPaginatedResponse(result.trips, paginationResult);

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Trips retrieved successfully",
        ...paginatedResponse
      });
    } catch (error) {
      next(error);
    }
  }

  // Get active trips - Driver sees their active, Admin sees all
  async getActiveTrips(req: IRequest, res: Response, next: NextFunction) {
    try {
      const pagination = getPaginationOptions(req.query);
      
      let result;
      if (req.user?.role === Role.Driver) {
        result = await tripRepo.findActiveTripsPaginated(
          pagination.page,
          pagination.limit,
          req.user?._id.toString(),
          pagination.search
        );
      } else {
        result = await tripRepo.findActiveTripsPaginated(
          pagination.page,
          pagination.limit,
          undefined,
          pagination.search
        );
      }

      const paginationResult = calculatePagination(
        pagination.page!,
        pagination.limit!,
        result.total,
        'trips'
      );

      const paginatedResponse = createPaginatedResponse(result.trips, paginationResult);

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Active trips retrieved successfully",
        ...paginatedResponse
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all trips - Admin only
  async getAllTrips(req: IRequest, res: Response, next: NextFunction) {
    try {
      if (req.user?.role !== Role.Admin) {
        return next(new AppError("Access denied. Admin only", StatusCodes.FORBIDDEN));
      }

      const { status } = req.query;
      const pagination = getPaginationOptions(req.query);
      
      const result = await tripRepo.findAllTripsPaginated(
        pagination.page,
        pagination.limit,
        status as ITrip['status'],
        pagination.search
      );

      const paginationResult = calculatePagination(
        pagination.page!,
        pagination.limit!,
        result.total,
        'trips'
      );

      const paginatedResponse = createPaginatedResponse(result.trips, paginationResult);

      res.status(StatusCodes.OK).json({
        success: true,
        message: "All trips retrieved successfully",
        ...paginatedResponse
      });
    } catch (error) {
      next(error);
    }
  }

  // Get trips by subscription - Driver, Parent, or Admin can access
  async getTripsBySubscription(req: IRequest, res: Response, next: NextFunction) {
    try {
      const { subscriptionId } = req.params;
      const { status } = req.query;
      const pagination = getPaginationOptions(req.query);

      // Get subscription to check permissions
      const subscription = await subscriptionRepo.findByIdWithPopulate(subscriptionId as string);
      if (!subscription) {
        return next(new AppError("Subscription not found", StatusCodes.NOT_FOUND));
      }

      // Check permissions
      if (req.user?.role === Role.Admin) {
        // Admin can view all
      } else if (req.user?.role === Role.Driver && req.user?._id.toString() !== subscription.driverId.toString()) {
        return next(new AppError("Access denied", StatusCodes.FORBIDDEN));
      } else if (req.user?.role === Role.Parent && req.user?._id.toString() !== subscription.parentId.toString()) {
        return next(new AppError("Access denied", StatusCodes.FORBIDDEN));
      }

      const result = await tripRepo.findBySubscriptionPaginated(
        subscriptionId as string,
        pagination.page,
        pagination.limit,
        status as ITrip['status']
      );

      const paginationResult = calculatePagination(
        pagination.page!,
        pagination.limit!,
        result.total,
        'trips'
      );

      const paginatedResponse = createPaginatedResponse(result.trips, paginationResult);

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Trips retrieved successfully",
        ...paginatedResponse
      });
    } catch (error) {
      next(error);
    }
  }

  // Get trips from driver's subscriptions - EP that returns scheduled trips based on day
  async getDriverTripsFromSubscriptions(req: IRequest, res: Response, next: NextFunction) {
    try {
      const { driverId } = req.params;
      const { day, date } = req.query;
      const pagination = getPaginationOptions(req.query);

      // Check permissions
      if (req.user?.role === Role.Driver && req.user?._id.toString() !== driverId) {
        return next(new AppError("Drivers can only view their own trips", StatusCodes.FORBIDDEN));
      }

      // Get all subscriptions for this driver with their full schedule data
      const subscriptionsResult = await subscriptionRepo.findByDriverPaginated(
        driverId as string,
        1,
        1000 // Get all subscriptions
      );

      const activeSubscriptions = subscriptionsResult.subscriptions
        .filter(sub => sub.status === Status.ACCEPTED); // Only accepted subscriptions

      if (activeSubscriptions.length === 0) {
        res.status(StatusCodes.OK).json({
          success: true,
          message: "No active subscriptions found for this driver",
          data: [],
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: 0,
          }
        });
        return;
      }

      // Determine which day to get trips for
      let targetDayOfWeek: number;
      let targetDate: Date;

      if (day !== undefined) {
        // If day is provided (0-6), use it
        targetDayOfWeek = parseInt(day as string);
        targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + ((targetDayOfWeek - targetDate.getDay() + 7) % 7));
      } else if (date) {
        // If date is provided, use it
        targetDate = new Date(date as string);
        targetDayOfWeek = targetDate.getDay();
      } else {
        // Default to today
        targetDate = new Date();
        targetDayOfWeek = targetDate.getDay();
      }

      // Get actual trips from subscription schedules for the target date
      const targetDateStart = new Date(targetDate);
      targetDateStart.setHours(0, 0, 0, 0);
      const targetDateEnd = new Date(targetDate);
      targetDateEnd.setHours(23, 59, 59, 999);

      // Get active subscription IDs
      const subscriptionIds = activeSubscriptions.map(sub => sub._id.toString());
      
      // Query trips directly so they are fully populated
      const tripsResult = await tripRepo.findBySubscriptionsAndDateRangePaginated(
        subscriptionIds,
        targetDateStart,
        targetDateEnd,
        pagination.page,
        pagination.limit
      );

      const scheduledTrips = tripsResult.trips;
      const total = tripsResult.total;

      const paginationResult = calculatePagination(
        pagination.page!,
        pagination.limit!,
        total,
        'trips'
      );

      const paginatedResponse = createPaginatedResponse(scheduledTrips, paginationResult);

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Scheduled trips from subscriptions retrieved successfully",
        dayOfWeek: targetDayOfWeek,
        date: targetDate.toISOString().split('T')[0],
        subscriptionsCount: activeSubscriptions.length,
        ...paginatedResponse
      });
    } catch (error) {
      next(error);
    }
  }

  // Get trips from parent's subscriptions - EP that returns scheduled trips based on day
  async getParentTripsFromSubscriptions(req: IRequest, res: Response, next: NextFunction) {
    try {
      const { parentId } = req.params;
      const { day, date } = req.query;
      const pagination = getPaginationOptions(req.query);

      // Check permissions
      if (req.user?.role === Role.Parent && req.user?._id.toString() !== parentId) {
        return next(new AppError("Parents can only view their own trips", StatusCodes.FORBIDDEN));
      }

      // Get all subscriptions for this parent with their full schedule data
      const subscriptionsResult = await subscriptionRepo.findByParentPaginated(
        parentId as string,
        1,
        1000 // Get all subscriptions
      );

      const activeSubscriptions = subscriptionsResult.subscriptions
        .filter(sub => sub.status === Status.ACCEPTED); // Only accepted subscriptions

      if (activeSubscriptions.length === 0) {
        res.status(StatusCodes.OK).json({
          success: true,
          message: "No active subscriptions found for this parent",
          data: [],
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: 0,
          }
        });
        return;
      }

      // Determine which day to get trips for
      let targetDayOfWeek: number;
      let targetDate: Date;

      if (day !== undefined) {
        // If day is provided (0-6), use it
        targetDayOfWeek = parseInt(day as string);
        targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + ((targetDayOfWeek - targetDate.getDay() + 7) % 7));
      } else if (date) {
        // If date is provided, use it
        targetDate = new Date(date as string);
        targetDayOfWeek = targetDate.getDay();
      } else {
        // Default to today
        targetDate = new Date();
        targetDayOfWeek = targetDate.getDay();
      }

      // Get actual trips from subscription schedules for the target date
      const targetDateStart = new Date(targetDate);
      targetDateStart.setHours(0, 0, 0, 0);
      const targetDateEnd = new Date(targetDate);
      targetDateEnd.setHours(23, 59, 59, 999);

      // Get active subscription IDs
      const subscriptionIds = activeSubscriptions.map(sub => sub._id.toString());
      
      // Query trips directly so they are fully populated
      const tripsResult = await tripRepo.findBySubscriptionsAndDateRangePaginated(
        subscriptionIds,
        targetDateStart,
        targetDateEnd,
        pagination.page,
        pagination.limit
      );

      const scheduledTrips = tripsResult.trips;
      const total = tripsResult.total;

      const paginationResult = calculatePagination(
        pagination.page!,
        pagination.limit!,
        total,
        'trips'
      );

      const paginatedResponse = createPaginatedResponse(scheduledTrips, paginationResult);

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Scheduled trips from subscriptions retrieved successfully",
        dayOfWeek: targetDayOfWeek,
        date: targetDate.toISOString().split('T')[0],
        subscriptionsCount: activeSubscriptions.length,
        ...paginatedResponse
      });
    } catch (error) {
      next(error);
    }
  }

  // Generate trips from subscription manually
  async generateTripsFromSubscription(req: IRequest, res: Response, next: NextFunction) {
    try {
      const { subscriptionId } = req.params;
      const { daysAhead = 30 } = req.body;

      const subscription = await subscriptionRepo.findByIdWithPopulate(subscriptionId as string);
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

  // Get today's trips for driver
  async getDriverTodayTrips(req: IRequest, res: Response, next: NextFunction) {
    try {
      const { driverId } = req.params;

      // Check permissions
      if (req.user?.role === Role.Driver && req.user?._id.toString() !== driverId) {
        return next(new AppError("Drivers can only view their own trips", StatusCodes.FORBIDDEN));
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const trips = await tripRepo.findByDriverAndDateRange(
        driverId as string,
        today,
        tomorrow
      );

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Today's trips retrieved successfully",
        data: trips,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get today's trips for parent
  async getParentTodayTrips(req: IRequest, res: Response, next: NextFunction) {
    try {
      const { parentId } = req.params;

      // Check permissions
      if (req.user?.role === Role.Parent && req.user?._id.toString() !== parentId) {
        return next(new AppError("Parents can only view their own trips", StatusCodes.FORBIDDEN));
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const trips = await tripRepo.findByParentAndDateRange(
        parentId as string,
        today,
        tomorrow
      );

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Today's trips retrieved successfully",
        data: trips,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const tripController = new TripController();
