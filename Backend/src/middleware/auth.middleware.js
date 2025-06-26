import jwt from "jasonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req,res,next) => {
    try
    {
        const token = req.cookies.jwt;

        if(!token)
        {
            return res.status(401).json({message: "Unauthorized - No Token Provided!"});

        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET); //to decode the token
        if(!decoded)
        {
            return res.status(401).json({message: "Unauthorized - Invalid Token!"});
        }

        const user = await User.findById(decoded.userID).select("-password"); //don't send the password back to the client

        if(!user)
        {
            return res.status(404).json({message: "User not found"});
        }

        req.user = user;

        next() //calls the next function, in this case it is updateProfile

    }
    catch(error)
    {
        console.log("Errpr in protectRoute middleware: ", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}