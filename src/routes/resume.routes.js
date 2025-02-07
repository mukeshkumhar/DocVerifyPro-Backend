import { Router } from "express";
import { AddProject, GetProjects, resumeDetails } from "../controllers/resume.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/resume-create").post(verifyJWT,resumeDetails)
router.route("/resume-add-project").post(verifyJWT,AddProject)
router.route("/resume-get-project").get(verifyJWT,GetProjects)

export default router;