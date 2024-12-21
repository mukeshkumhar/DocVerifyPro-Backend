import { Router } from "express";
import { ProjectDetails, resumeDetails } from "../controllers/resume.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/resume-create").post(verifyJWT,resumeDetails)
router.route("/resume-project").post(verifyJWT,ProjectDetails)

export default router;