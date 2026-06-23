import { NextFunction, Response } from "express";
import { AppError, ApplicationStatus, asyncErrorHandler, IRequest, Role, getPaginationOptions, calculatePagination, createPaginatedResponse } from "../../common";
import { driverApplicationRepo, userRepo } from "../../db";
import { DriverApplicationModel, HDriverApplicationDocument } from "../../db/models/driverApplicationModel/driverApp.model";
import { StatusCodes } from "http-status-codes";
import mongoose, { Types } from "mongoose";

export const getDriverApplications = asyncErrorHandler(
    async (req: IRequest, res: Response, next: NextFunction) => {
        const { page = 1, limit = 10, status, search } = req.query;
        
        const filter: any = {};
        if (status && Object.values(ApplicationStatus).includes(status as ApplicationStatus)) {
            filter.status = status;
        }

        if (search) {
            // Search in status directly
            const directSearch: any = { status: { $regex: search, $options: 'i' } };
            
            // Search in driver details (requires finding matching drivers first)
            const matchingDrivers = await mongoose.model('Driver').find({
                $or: [
                    { userName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { nationalId: { $regex: search, $options: 'i' } }
                ]
            }).select('_id');
            
            const driverIds = matchingDrivers.map(d => d._id);
            
            filter.$or = [
                directSearch,
                { driver: { $in: driverIds } }
            ];
        }

        const parsedPage = Number(page);
        const parsedLimit = Number(limit);
        const skip = (parsedPage - 1) * parsedLimit;
        
        const applications = await DriverApplicationModel
            .find(filter)
            .populate('driver', 'userName email nationalId phone')
            .populate('vehicle', 'carModel plateNumber carColor')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parsedLimit);

        const total = await DriverApplicationModel.countDocuments(filter);
        
        const pagination = calculatePagination(parsedPage, parsedLimit, total, "driverApplications");
        
        const response = createPaginatedResponse(applications, pagination);
        
        res.status(StatusCodes.OK).json({
            status: "success",
            ...response
        });
    }
);

export const getDriverApplicationById = asyncErrorHandler(
    async (req: IRequest, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const applicationId = Array.isArray(id) ? id[0] : id;
        
        if (!applicationId || !Types.ObjectId.isValid(applicationId)) {
            return next(new AppError("Invalid application ID", StatusCodes.BAD_REQUEST));
        }

        const application = await DriverApplicationModel
            .findById(applicationId)
            .populate('driver', 'firstName lastName email nationalId phone city department')
            .populate('vehicle', 'make model year licensePlate registrationExpiry insuranceExpiry images');

        if (!application) {
            return next(new AppError("Application not found", StatusCodes.NOT_FOUND));
        }

        res.status(StatusCodes.OK).json({
            status: "success",
            data: application
        });
    }
);

export const approveDriverApplication = asyncErrorHandler(
    async (req: IRequest, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const applicationId = Array.isArray(id) ? id[0] : id;
        const { notes } = req.body;
        
        if (!applicationId || !Types.ObjectId.isValid(applicationId)) {
            return next(new AppError("Invalid application ID", StatusCodes.BAD_REQUEST));
        }

        const application = await DriverApplicationModel.findById(applicationId) as HDriverApplicationDocument | null;
        if (!application) {
            return next(new AppError("Application not found", StatusCodes.NOT_FOUND));
        }

        if (application.status !== ApplicationStatus.PENDING ) {
            return next(new AppError("Application has already been processed", StatusCodes.BAD_REQUEST));
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Update application status
            application.status = ApplicationStatus.APPROVED;
            await application.save({ session });

            // Update driver status to active using findOneAndUpdate
            await mongoose.model('Driver').findOneAndUpdate(
                { _id: application.driver },
                { isActive: true },
                { session }
            );

            await session.commitTransaction();

            res.status(StatusCodes.OK).json({
                status: "success",
                message: "Driver application approved successfully",
                data: {
                    applicationId: application._id,
                    driverId: application.driver,
                    status: ApplicationStatus.APPROVED,
                    approvedBy: req.user?._id,
                    approvedAt: new Date(),
                    notes
                }
            });
        } catch (error) {
            await session.abortTransaction();
            return next(new AppError("Failed to approve application", StatusCodes.INTERNAL_SERVER_ERROR));
        } finally {
            session.endSession();
        }
    }
);

export const rejectDriverApplication = asyncErrorHandler(
    async (req: IRequest, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const applicationId = Array.isArray(id) ? id[0] : id;
        const { reason } = req.body;
        
        if (!applicationId || !Types.ObjectId.isValid(applicationId)) {
            return next(new AppError("Invalid application ID", StatusCodes.BAD_REQUEST));
        }

        if (!reason) {
            return next(new AppError("Rejection reason is required", StatusCodes.BAD_REQUEST));
        }

        const application = await DriverApplicationModel.findById(applicationId) as HDriverApplicationDocument | null;
        if (!application) {
            return next(new AppError("Application not found", StatusCodes.NOT_FOUND));
        }

        if (application.status !== ApplicationStatus.PENDING) {
            return next(new AppError("Application has already been processed", StatusCodes.BAD_REQUEST));
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Update application status
            application.status = ApplicationStatus.REJECTED;
            await application.save({ session });

            // Update driver status to inactive using findOneAndUpdate
            await mongoose.model('Driver').findOneAndUpdate(
                { _id: application.driver },
                { isActive: false },
                { session }
            );

            await session.commitTransaction();

            res.status(StatusCodes.OK).json({
                status: "success",
                message: "Driver application rejected successfully",
                data: {
                    applicationId: application._id,
                    driverId: application.driver,
                    status: ApplicationStatus.REJECTED,
                    rejectedBy: req.user?._id,
                    rejectedAt: new Date(),
                    reason
                }
            });
        } catch (error) {
            await session.abortTransaction();
            return next(new AppError("Failed to reject application", StatusCodes.INTERNAL_SERVER_ERROR));
        } finally {
            session.endSession();
        }
    }
);

export const getDashboardStats = asyncErrorHandler(
    async (req: IRequest, res: Response, next: NextFunction) => {
        const [
            totalApplications,
            pendingApplications,
            approvedApplications,
            rejectedApplications,
            totalDrivers,
            activeDrivers,
            totalParents
        ] = await Promise.all([
            DriverApplicationModel.countDocuments(),
            DriverApplicationModel.countDocuments({ status: ApplicationStatus.PENDING }),
            DriverApplicationModel.countDocuments({ status: ApplicationStatus.APPROVED }),
            DriverApplicationModel.countDocuments({ status: ApplicationStatus.REJECTED }),
            mongoose.model('Driver').countDocuments(),
            mongoose.model('Driver').countDocuments({ isActive: true }),
            mongoose.model('User').countDocuments({ role: Role.Parent })
        ]);

        res.status(StatusCodes.OK).json({
            status: "success",
            data: {
                applications: {
                    total: totalApplications,
                    pending: pendingApplications,
                    approved: approvedApplications,
                    rejected: rejectedApplications
                },
                drivers: {
                    total: totalDrivers,
                    active: activeDrivers,
                    inactive: totalDrivers - activeDrivers
                },
                parents: {
                    total: totalParents
                }
            }
        });
    }
);

export const getAllParents = asyncErrorHandler(
    async (req: IRequest, res: Response, next: NextFunction) => {
        const pagination = getPaginationOptions(req.query);
        const { parents, total } = await userRepo.findAllParentsPaginated(
            pagination.page!,
            pagination.limit!,
            pagination.search
        );

        const paginationResult = calculatePagination(pagination.page!, pagination.limit!, total, "parents");
        const paginatedResponse = createPaginatedResponse(parents, paginationResult);

        res.status(StatusCodes.OK).json({
            success: true,
            message: "Parents retrieved successfully",
            ...paginatedResponse
        });
    }
);
