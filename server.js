import express from "express";
import mongoose from "mongoose";
import bodyParser from "express";
import userRouter from "./Routes/user.js";
import productRouter from "./Routes/product.js";
import cartRouter from "./Routes/cart.js";
import cors from "cors";
import addressRouter from "./Routes/address.js";
import paymentRouter from "./Routes/payment.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(bodyParser.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

//home testimg route
app.get("/", (req, res) => res.json({ message: "This is home route" }));

//user Router
app.use("/api/user", userRouter);

//product Router
app.use("/api/product", productRouter);

//cart Router
app.use("/api/cart", cartRouter);

// address Router
app.use("/api/address", addressRouter);

// payment Router
app.use("/api/payment", paymentRouter);

mongoose
  .connect(process.env.MONGO_URI, { dbName: "Ecommerce_App" })
  .then(() => console.log("MongoDB Connected Successfully...!"))
  .catch((err) => console.log(err));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`server is running on port ${port}`));
