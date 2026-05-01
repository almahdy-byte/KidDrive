import { Router } from "express";
import { auth, roleGuard } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validation.middleware";
import * as childController from "./child.controller";
import * as childValidation from "./child.validation";
import { cloudUploadAnyFiles, Role } from "../../common";

const router = Router();

// Create child - Parent only, accepts form-data with photo
router.post(
  "/",
  auth,
  roleGuard([Role.Parent]),
  cloudUploadAnyFiles().single("photo"),
  validate(childValidation.createChild),
  childController.createChild
);

// Public/basic endpoint - no auth required for basic info
router.get(
  "/:id/basic",
  validate(childValidation.getChildById),
  childController.getChildBasicInfo
);

// Full child details - auth required
router.get(
  "/:id",
  auth,
  validate(childValidation.getChildById),
  childController.getChildById
);

export default router;
