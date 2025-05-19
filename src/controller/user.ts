import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../prisma";
import jwt from "jsonwebtoken";

interface User {
  id: string;
  email: string;
  password: string;
  name: string;
}

const userController = {
  async register(req: Request, res: Response) {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Check Token secret" });
    }
    try {
      const { email, password, name }: User = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      if (!email || !password || !name) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const existingUser = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });

      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await prisma.user.create({
        data: {
          email: email,
          password: hashedPassword,
          name: name,
        },
      });

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      return res.status(201).json({ message: "User created", token: token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async login(req: Request, res: Response) {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Check Token secret" });
    }

    try {
      const { email, password }: User = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const user = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res
        .status(200)
        .json({ message: "Login successful", token: token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

export default userController;
