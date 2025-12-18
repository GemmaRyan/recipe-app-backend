import express from "express";
import { registerUser } from "../controllers/recipe";
import { loginUser } from "../controllers/auth";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;
