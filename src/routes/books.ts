import express, { Express, Request, Response } from "express";
import BooksController from "../controller/books";
import { auth } from "../middleware/auth";

const router = express.Router();

router.post("/", auth, BooksController.addBook);
router.get("/", BooksController.getAllBooks);
router.get("/:id", BooksController.getBooksById);
router.get("/:id/reviews", auth, BooksController.submitReviewForBook);   

export default router;
