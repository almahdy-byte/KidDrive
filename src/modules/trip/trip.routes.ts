import { Router, Request, Response, NextFunction } from "express";
import { tripController } from "./trip.controller";
import { validate } from "../../middleware/validation.middleware";
import {
  createTrip,
  updateTripStatus,
  getTripById,
  getTripsByDriver,
  getTripsByParent,
  getTripsByChild,
  getAllTrips,
  getActiveTrips,
} from "./trip.validation";
import { auth } from "../../middleware/auth.middleware";
import { Role, IRequest } from "../../common";

const router = Router();

// Start trip - Driver or Parent can start
router.post(
  "/start",
  auth,
  validate(createTrip),
  tripController.startTrip
);

// End trip - Only Driver can end trips
router.patch(
  "/:id/end",
  auth,
  validate(getTripById),
  tripController.endTrip
);

// Update trip status - Only Driver can use status updates
router.patch(
  "/:id/status",
  auth,
  validate(updateTripStatus),
  tripController.updateTripStatus
);

// Get trip by ID - Driver and Parent can access their own
router.get(
  "/:id",
  auth,
  validate(getTripById),
  tripController.getTripById
);

// Get trips by driver - Driver can access their own, Admin can access all
router.get(
  "/driver/:driverId",
  auth,
  validate(getTripsByDriver),
  tripController.getTripsByDriver
);

// Get trips by parent - Parent can access their own, Admin can access all
router.get(
  "/parent/:parentId",
  auth,
  validate(getTripsByParent),
  tripController.getTripsByParent
);

// Get trips by child - Parent can access their children's trips, Admin can access all
router.get(
  "/child/:childId",
  auth,
  validate(getTripsByChild),
  tripController.getTripsByChild
);

// Get active trips - Driver sees their active, Admin sees all
router.get(
  "/active",
  auth,
  validate(getActiveTrips),
  tripController.getActiveTrips
);

// Get all trips - Admin only
router.get(
  "/",
  auth,
  validate(getAllTrips),
  (req: IRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== Role.Admin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only",
      });
    }
    next();
  },
  tripController.getAllTrips
);

export default router;
