import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export function auth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: "UnAuthorized" });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

      if (decoded) {
        req.body.userId = decoded.userId;
        next();
      }
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
