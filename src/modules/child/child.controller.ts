import { NextFunction, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { childRepo } from "../../db/models/childModel/child.repo";
import { AppError, IRequest, Role, Gender, cloud, asyncErrorHandler } from "../../common";

export const getChildById = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return next(new AppError("Invalid child ID", StatusCodes.BAD_REQUEST));
    }

    const child = await childRepo.findChildByIdWithParent(id);

    if (!child || child.isDeleted) {
      return next(new AppError("Child not found", StatusCodes.NOT_FOUND));
    }

    // Check permissions - allow if user is the parent, the driver of a subscription, or admin
    const userId = req.user?._id?.toString();
    const userRole = req.user?.role;

    // Allow access if:
    // 1. User is admin
    // 2. User is the parent of the child
    // 3. User is a driver (we'll assume they need access for subscriptions)
    const isParent = child.parentId._id?.toString() === userId || 
                     child.parentId.toString() === userId;
    const isAdmin = userRole === Role.Admin;
    const isDriver = userRole === Role.Driver;

    if (!isParent && !isAdmin && !isDriver) {
      return next(new AppError("Access denied", StatusCodes.FORBIDDEN));
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Child retrieved successfully",
      data: child,
    });
  } catch (error) {
    next(error);
  }
};

export const getChildBasicInfo = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return next(new AppError("Invalid child ID", StatusCodes.BAD_REQUEST));
    }

    const child = await childRepo.findChildById(id);

    if (!child || child.isDeleted) {
      return next(new AppError("Child not found", StatusCodes.NOT_FOUND));
    }

    // Return only basic info (name, age, photo)
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Child basic info retrieved successfully",
      data: {
        _id: child._id,
        name: child.name,
        age: child.age,
        photo: child.photo,
        gender: child.gender,
        school: child.school,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createChild = asyncErrorHandler(
  async (req: IRequest, res: Response, next: NextFunction) => {
    const { name, age, gender, school, schoolAddress, schoolLatitude, schoolLongitude, arriveTime, backHome } = req.body;

    // Check if user is authenticated and is a parent
    if (!req.user) {
      return next(new AppError("User not authenticated", StatusCodes.UNAUTHORIZED));
    }

    if (req.user.role !== Role.Parent) {
      return next(new AppError("Only parents can add children", StatusCodes.FORBIDDEN));
    }

    const parentId = req.user._id.toString();

    // Handle photo upload to Cloudinary
    let photoUrl = "";
    const files = req.files as Express.Multer.File[];
    
    if (files && files.length > 0) {
      // Check Cloudinary configuration
      if (!process.env.CLOUD_NAME || !process.env.API_KEY || !process.env.API_SECRET) {
        return next(new AppError("Cloudinary configuration is missing", StatusCodes.INTERNAL_SERVER_ERROR));
      }

      // Find the photo file
      const photoFile = files.find(file => file.fieldname === "photo");
      
      if (photoFile) {
        const { secure_url } = await cloud().uploader.upload(photoFile.path, {
          folder: `${process.env.APPLICATION_NAME || "kidrive"}/children`,
        });
        photoUrl = secure_url;
      }
    }

    // Build child data
    const childData: any = {
      name,
      age: parseInt(age),
      parentId,
      gender: gender || Gender.Male,
      isDeleted: false,
      photo: photoUrl,
    };

    // Add optional fields if provided
    if (school) {
      childData.school = school;
    }

    if (schoolAddress || schoolLatitude || schoolLongitude) {
      childData.schoolLocation = {
        latitude: schoolLatitude ? parseFloat(schoolLatitude) : 0,
        longitude: schoolLongitude ? parseFloat(schoolLongitude) : 0,
        address: schoolAddress || "",
      };
    }

    if (arriveTime || backHome) {
      childData.schedule = {
        arriveTime: arriveTime || "",
        backHome: backHome || "",
      };
    }

    // Create the child
    const child = await childRepo.create(childData);

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Child created successfully",
      data: child,
    });
  }
);
