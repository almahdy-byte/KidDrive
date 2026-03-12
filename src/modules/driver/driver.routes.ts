import { Router } from "express";
import { auth, roleGuard } from "../../middleware/auth.middleware";
import vehicleRoutes from "../../modules/vehicle/vehicle.routes";
import * as driverController from "./driver.controller";
import { cloudUploadFiles, ImageType, Role } from "../../common";
import { validate } from "../../middleware/validation.middleware";
import * as driverValidation from "./diver.validation";

const router = Router();
router.use("/:driverId/vehicle", vehicleRoutes);

router.post(
  "/apply",
  auth,
  roleGuard([Role.Parent]),
  cloudUploadFiles({ types: ImageType }).fields([
    { name: "licenseImage", maxCount: 1 },
    { name: "carImage", maxCount: 1 },
    { name: "nationalIdImage", maxCount: 1 },
  ]),
  validate(driverValidation.apply),
  driverController.apply,
);

router.patch(
  "/application/:applicationId/approve",
  auth,
  roleGuard([Role.Admin]),
  validate(driverValidation.approveApplication),
  driverController.approveApplication,
);

router.post(
  "/login",
  validate(driverValidation.login),
  driverController.login,
);

router.get(
  "/profile",
  auth,
  roleGuard([Role.Driver]),
  driverController.getProfile,
);

router.patch(
  "/profile",
  auth,
  roleGuard([Role.Driver]),
  validate(driverValidation.updateProfile),
  driverController.updateProfile,
);

router.patch(
  "/vehicle",
  auth,
  roleGuard([Role.Driver]),
  cloudUploadFiles({ types: ImageType }).fields([
    { name: "governmentDocuments", maxCount: 1 },
  ]),
  validate(driverValidation.updateVehicle),
  driverController.updateVehicle,
);

// Get all drivers - Admin and Parent can access
router.get(
  "/",
  auth,
  roleGuard([Role.Admin, Role.Parent]),
  validate(driverValidation.getAllDrivers),
  driverController.getAllDrivers,
);

// Get drivers near parent location - Parent only
router.get(
  "/nearby",
  auth,
  roleGuard([Role.Parent]),
  validate(driverValidation.getDriversNearParent),
  driverController.getDriversNearParent,
);

// Rate driver - Parent only
router.post(
  "/:driverId/rate",
  auth,
  roleGuard([Role.Parent]),
  validate(driverValidation.rateDriver),
  driverController.rateDriver,
);

export default router;