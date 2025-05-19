import express, { Express, Request, Response, Router } from "express";
import { auth } from "../middleware/auth";
import reviewsController from "../controller/reviews";

const router: Router = express.Router();

router.put("/:id", auth, reviewsController.updateReviews);
router.delete("/:id", auth, reviewsController.deleteReview);

export default router;
