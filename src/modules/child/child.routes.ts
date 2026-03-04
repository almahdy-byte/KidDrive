import { Router } from "express";
import * as childService from "./child.controller";
import * as childValidation from "./child.validation";  
import { validate } from "../../middleware/validation.middleware";
import { auth } from "../../middleware/auth.middleware";

const router = Router({
  mergeParams: true,
});


// Add Child
router.post(
  "/",
  auth,
  validate(childValidation.addChildSchema),
  childService.addChild,
);

// Get All Children
router.get(
  "/",
  auth,
  validate(childValidation.getChildrenSchema),
  childService.getAllChildren,
);

// Get Single Child
router.get(
  "/:childId",
  auth,
  validate(childValidation.getSingleChildSchema),
  childService.getSingleChild,
);

// Update Child
router.patch(
  "/:childId/update",
  auth,
  validate(childValidation.updateChildSchema),
  childService.updateChild,
);

// Delete Child (Soft Delete)
router.delete(
  "/:childId/delete",
  auth,
  validate(childValidation.getSingleChildSchema),
  childService.deleteChild,
);

// Restore Child
router.patch(
  "/:childId/restore",
  auth,
  validate(childValidation.getSingleChildSchema),
  childService.restoreChild,
);

export default router;