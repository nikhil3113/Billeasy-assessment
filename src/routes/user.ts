import express, { Express, Request, Response } from "express";
import userController from "../controller/user";

const router = express.Router();

router.post("/login", userController.login);
router.post("/register", userController.register);

export default router;
