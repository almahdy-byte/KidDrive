import { NextFunction, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { tripRepo } from "../../db/models/tripModel/trip.repo";
import { ITrip } from "../../db/models/tripModel/trip.model";
import { Role, AppError, IRequest, getPaginationOptions, calculatePagination, createPaginatedResponse } from "../../common";

export class TripController {
  // Start trip - Driver or Parent can start
  async startTrip(req: IRequest, res: Response, next: NextFunction) {
    try {
      const { driverId, parentId, childId, subscriptionId, origin, destination } = req.body;

      // Check permissions
      if (req.user?.role === Role.Driver && req.user?._id.toString() !== driverId) {
        return next(new AppError("Drivers can only start trips for themselves", StatusCodes.FORBIDDEN));
      }

      if (req.user?.role === Role.Parent && req.user?._id.toString() !== parentId) {
        return next(new AppError("Parents can only start trips for their children", StatusCodes.FORBIDDEN));
      }

      const tripData: Partial<ITrip> = {
        driverId,
        parentId,
        childId,
        subscriptionId,
        origin,
        destination,
        status: 'trip_started',
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

  // End trip - Only Driver can end trips
  async endTrip(req: IRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const trip = await tripRepo.findByIdWithPopulate(id as string);
      if (!trip) {
        return next(new AppError("Trip not found", StatusCodes.NOT_FOUND));
      }

      // Only drivers can end trips
      if (req.user?.role !== Role.Driver || req.user?._id.toString() !== trip.driverId.toString()) {
        return next(new AppError("Only drivers can end their own trips", StatusCodes.FORBIDDEN));
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

  // Update trip status - Only Driver can use status updates
  async updateTripStatus(req: IRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const trip = await tripRepo.findByIdWithPopulate(id as string);
      if (!trip) {
        return next(new AppError("Trip not found", StatusCodes.NOT_FOUND));
      }

      // Only drivers can update trip status
      if (req.user?.role !== Role.Driver || req.user?._id.toString() !== trip.driverId.toString()) {
        return next(new AppError("Only drivers can update trip status", StatusCodes.FORBIDDEN));
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
      } else if (req.user?.role === Role.Driver && req.user?._id.toString() !== trip.driverId.toString()) {
        return next(new AppError("Access denied", StatusCodes.FORBIDDEN));
      } else if (req.user?.role === Role.Parent && req.user?._id.toString() !== trip.parentId.toString()) {
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

  // Get active trips - Driver sees their active, Admin sees all
  async getActiveTrips(req: IRequest, res: Response, next: NextFunction) {
    try {
      const pagination = getPaginationOptions(req.query);
      
      let result;
      if (req.user?.role === Role.Driver) {
        result = await tripRepo.findActiveTripsPaginated(
          pagination.page,
          pagination.limit,
          req.user?._id.toString()
        );
      } else {
        // Admin sees all active trips
        result = await tripRepo.findActiveTripsPaginated(
          pagination.page,
          pagination.limit
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
        message: "All trips retrieved successfully",
        ...paginatedResponse
      });
    } catch (error) {
      next(error);
    }
  }
}

export const tripController = new TripController();
