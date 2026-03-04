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

export default router;