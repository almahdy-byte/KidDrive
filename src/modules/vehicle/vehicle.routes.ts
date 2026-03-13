import { Router } from "express";
import { auth, roleGuard } from "../../middleware/auth.middleware";
import * as vehicleController from "./vehicle.controller";
import { cloudUploadFiles, cloudUploadAnyFiles, FileType, Role } from "../../common";
import * as vehicleValidation from "./vehicle.validation";
import { validate } from "../../middleware/validation.middleware";

const router = Router({
  mergeParams: true,
});

router.post(
  "/",
  auth,
  roleGuard([Role.Driver]),
  cloudUploadAnyFiles().any(),
  validate(vehicleValidation.createVehicle),
  vehicleController.createVehicle,
);

router.patch(
  "/:vehicleId/approve",
  auth,
  roleGuard([Role.Admin]),
  validate(vehicleValidation.approveVehicle),
  vehicleController.approveVehicle,
);

export default router;