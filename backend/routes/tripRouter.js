import express from "express";
import { createTripPlan } from "../controllers/tripController.js";

const tripRouter = express.Router();
tripRouter.route("/").post(createTripPlan);
tripRouter.route("/plan-trip").post(createTripPlan);

export { tripRouter };
