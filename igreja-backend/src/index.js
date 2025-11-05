import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import verseRoutes from "./routes/verseRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/verses", verseRoutes);
app.use("/api/events", eventRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Servidor rodando na porta ${PORT}`));
