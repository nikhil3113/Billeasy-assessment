import { Request, Response } from "express";
import { prisma } from "../prisma";

const reviewsController = {
  async updateReviews(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.body.userId;
      const { rating, comment } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "unAuthorized" });
      }

      if (!comment || !rating) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const review = await prisma.review.findUnique({
        where: {
          id: id,
        },
      });
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      if (review.userId !== userId) {
        return res
          .status(403)
          .json({ message: "You are not authorized to update this review" });
      }

      await prisma.review.update({
        where: {
          id: id,
        },
        data: {
          rating,
          comment,
        },
      });
      return res.status(200).json({ message: "Review updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async deleteReview(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.body.userId;

      if (!userId) {
        return res.status(400).json({ message: "unAuthorized" });
      }

      const review = await prisma.review.findUnique({
        where: {
          id: id,
        },
      });
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      if (review.userId !== userId) {
        return res
          .status(403)
          .json({ message: "You are not authorized to delete this review" });
      }

      await prisma.review.delete({
        where: {
          id: id,
        },
      });
      return res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};


export default reviewsController;