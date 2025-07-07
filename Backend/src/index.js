import express from "express"; //provides us featues to build API quickly (eg. routes)
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js"
import dotenv from "dotenv";
import {connectDB} from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config()
const app = express();
const PORT = process.env.PORT;

app.use(express.json()) //allows to extract the json data from the body
app.use(cookieParser()); //allows to parse the cookie
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.listen(PORT, () => {
    console.log("server is running on PORT:" + PORT);
    connectDB();
}) 