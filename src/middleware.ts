import { NextFunction, Request, Response } from "express";
import { JWT_SECRET } from "./config.js";
import jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";

interface customJwt extends JwtPayload {
    id: string;
}
export const userMiddleware =  (req: Request, res: Response, next: NextFunction ) => {
    const header = req.headers["authorization"];
    const decoded = jwt.verify(header as string, JWT_SECRET) as customJwt;
    if(decoded){
        req.userId = decoded.id;
        next()
    }
    else{
        res.status(403).json({
            message: "You are not logged in"
        })
    }
}