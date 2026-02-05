import { Router } from "express";
import * as userService from "./user.controller";
import { validate } from "../../middleware/validation.middleware";
import * as userValidation from './user.validation';
import { auth } from "../../middleware/auth.middleware";

const router = Router();

router.use(auth);
// Public or Protected? usually Profile is protected
router.get(
    "/profile", 
    validate(userValidation.getProfileSchema),
    userService.getProfile
);
router.patch(
    "/profile",
     validate(userValidation.updateProfileSchema),
     userService.updateProfile
);


export default router;
