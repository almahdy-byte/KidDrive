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
  getTripsBySubscription,
  getAllTrips,
  getActiveTrips,
  getDriverTripsFromSubscriptions,
  getParentTripsFromSubscriptions,
  generateTripsFromSubscription,
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

// End trip - Driver or Parent can end trips
router.patch(
  "/:id/end",
  auth,
  validate(getTripById),
  tripController.endTrip
);

// Start existing trip - Driver or Parent can start an idle trip
router.patch(
  "/:id/start",
  auth,
  validate(getTripById),
  tripController.startExistingTrip
);

// Update trip status - Driver or Parent can update status
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

// Get trips by subscription - Driver, Parent, or Admin can access
router.get(
  "/subscription/:subscriptionId",
  auth,
  validate(getTripsBySubscription),
  tripController.getTripsBySubscription
);

// Get trips from driver's subscriptions (EP that drops trips for driver)
router.get(
  "/driver/:driverId/from-subscriptions",
  auth,
  validate(getDriverTripsFromSubscriptions),
  tripController.getDriverTripsFromSubscriptions
);

// Get trips from parent's subscriptions (EP that drops trips for parent)
router.get(
  "/parent/:parentId/from-subscriptions",
  auth,
  validate(getParentTripsFromSubscriptions),
  tripController.getParentTripsFromSubscriptions
);

// Get today's trips for driver
router.get(
  "/driver/:driverId/today",
  auth,
  validate(getTripsByDriver),
  tripController.getDriverTodayTrips
);

// Get today's trips for parent
router.get(
  "/parent/:parentId/today",
  auth,
  validate(getTripsByParent),
  tripController.getParentTodayTrips
);

// Generate trips from subscription manually
router.post(
  "/subscription/:subscriptionId/generate",
  auth,
  validate(generateTripsFromSubscription),
  tripController.generateTripsFromSubscription
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
