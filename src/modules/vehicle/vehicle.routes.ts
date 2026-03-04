import { Router } from "express";
import { auth, roleGuard } from "../../middleware/auth.middleware";
import * as vehicleController from "./vehicle.controller";
import { cloudUploadFiles, FileType, Role } from "../../common";
import * as vehicleValidation from "./vehicle.validation";
import { validate } from "../../middleware/validation.middleware";

const router = Router({
  mergeParams: true,
});

router.post(
  "/",
  auth,
  roleGuard([Role.Driver]),
  cloudUploadFiles({ types: FileType }).array("documents", 3),
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