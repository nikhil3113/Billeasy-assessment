import express, { Express } from "express";
import user from "./routes/user";
import books from "./routes/books";
import reviews from "./routes/reviews";

const app: Express = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use("/", user);
app.use("/books", books);
app.use("/reviews", reviews);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
