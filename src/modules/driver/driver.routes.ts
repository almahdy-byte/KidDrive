import { Router } from "express";
import { auth, roleGuard } from "../../middleware/auth.middleware";
import vehicleRoutes from "../../modules/vehicle/vehicle.routes";
import * as driverController from "./driver.controller";
import { cloudUploadFiles, cloudUploadAnyFiles, ImageType, Role, cloudUploadFile } from "../../common";
import { validate } from "../../middleware/validation.middleware";
import * as driverValidation from "./diver.validation";

const router = Router();
router.use("/:driverId/vehicle", vehicleRoutes);

router.post(
  "/apply",
  cloudUploadAnyFiles().any(),
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
  cloudUploadAnyFiles().any(),
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
  driverController.rateDriver
);

// Update driver documents - Driver only
router.patch(
  "/documents",
  auth,
  roleGuard([Role.Driver]),
  cloudUploadAnyFiles().any(),
  driverController.updateDriverDocuments
);

export default router;