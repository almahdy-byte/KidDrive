import { Router } from "express";
import { auth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validation.middleware";
import * as childController from "./child.controller";
import * as childValidation from "./child.validation";

const router = Router();

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
