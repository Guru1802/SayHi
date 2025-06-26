import express from "express";
import {signup, login, logout, updateProfile} from "../controllers/auth.controller.js";
import {protectRoute} from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile); //protectRoute makes sure the user is authenticated in order to update their profile

export default router;