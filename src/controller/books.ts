import { Request, Response } from "express";
import { prisma } from "../prisma";
import { get } from "http";

const BooksController = {
  async addBook(req: Request, res: Response) {
    try {
      const { title, author, genre, description, published } = req.body;
      if (!title || !author || !genre || !description || !published) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const book = await prisma.books.create({
        data: {
          title,
          author,
          genre,
          description,
          published,
        },
      });
      return res.status(201).json({ message: "Book Added", book });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async getAllBooks(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const author = req.query.author as string;
      const genre = req.query.genre as string;

      const whereClause: any = {};
      if (author) {
        whereClause.author = { contains: author, mode: "insensitive" };
      }
      if (genre) {
        whereClause.genre = { contains: genre, mode: "insensitive" };
      }

      const totalBooks = await prisma.books.count({
        where: whereClause,
      });

      const books = await prisma.books.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      });

      if (!books || books.length === 0) {
        return res.status(404).json({ message: "No books found" });
      }

      const totalPages = Math.ceil(totalBooks / limit);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return res.status(200).json({
        message: "Books Found",
        books,
        pagination: {
          totalBooks,
          totalPages,
          currentPage: page,
          hasNextPage,
          hasPreviousPage,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async getBooksById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const book = await prisma.books.findUnique({
        where: {
          id: id,
        },
        include: {
          reviews: true,
        },
      });
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      return res.status(200).json({ message: "Book Found", book });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async submitReviewForBook(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.body.userId;
      const { rating, comment } = req.body;
      if (!comment || !rating) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const book = await prisma.books.findUnique({
        where: {
          id: id,
        },
      });
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }

      const existingReview = await prisma.review.findFirst({
        where: {
          bookId: id,
          userId: userId,
        },
      });

      if (existingReview) {
        return res.status(400).json({
          message: "You have already reviewed this book",
          review: existingReview,
        });
      }

      const newReview = await prisma.review.create({
        data: {
          rating,
          comment,
          book: {
            connect: {
              id: id,
            },
          },
          user: {
            connect: {
              id: userId,
            },
          },
        },
      });
      return res.status(201).json({ message: "Review Added", newReview });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

export default BooksController;
