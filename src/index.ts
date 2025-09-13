import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken"; 
import { ContentModel, UserModel } from "./db.js";
import { JWT_SECRET } from "./config.js";
import { userMiddleware } from "./middleware.js";
import crypto from "crypto";


const app = express();
app.use(express.json()); //middleware for parsing json request bodies 

//User signup
app.post("/api/v1/signup", async (req, res) => {
    //zod validation add karna hai and hash the password
    const username = req.body.username;
    const password = req.body.password;

    try{
        await UserModel.create({
        username: username,
        password: password
    })

    res.json({
        message : "User Signed Up"
    })
    }catch(err){
        res.status(411).json({
            message : "User already exist"
        })
    }


})

//User signin
app.post("/api/v1/signin", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const existingUser = await UserModel.findOne({
        username,
        password
    })

    if(existingUser){
        const token = jwt.sign({
            id: existingUser._id
        },JWT_SECRET)
        
        res.json({
            token
        })
    }
    else{
        res.status(403).json({
            message : "Incorrect Credetials"
        })
    }
    
})

//User Add Content
app.post("/api/v1/content",userMiddleware, async (req, res) => {
    const link = req.body.link;
    const type = req.body.type;
    const title = req.body.title;

    await ContentModel.create({
        title,
        link,
        type,
        userId: req.userId,
        tags: []
    })
    res.json({
        message: "Content added"
    })
})

//User Access Content
app.get("/api/v1/content", userMiddleware, async (req, res) => {
    const userId = req.userId;
    const content = await ContentModel.find({
        userId: userId
    }).populate("userId", "username")
    res.json({
        content
    })
})

//User Delere Content
app.delete("/api/v1/content", userMiddleware, async (req, res) => {
    const contentId = req.body.contentId;

    await ContentModel.deleteMany({
        contentId,
        userId: req.userId
    })
    res.json({
        message: "Content deleted"
    })
})

//User Search Content
app.get("/api/v1/content/title", userMiddleware, async (req, res) => {
    const searchTerm = req.query.searchTerm;
    const userId = req.userId;

    const results = await ContentModel.find({
        userId: userId,
            $or : [
                {title : {$regex: searchTerm, $options:'i'}},
                {link: {$regex: searchTerm, $options: 'i'}}
            ]
    }).select("title link");
    res.json({
        message: "Search SUccessful",
        results
    })
})

app.post("/api/v1/content/:id/share", userMiddleware, async (req, res) => {
    const contentId = req.params.id;
    const userId = req.userId;

    const content = await ContentModel.findOne({
        _id: contentId, 
        userId
    })
    
    if(!content){
        return res.status(404).json({
            message: "Content not found"
        })
    }

    //generate sharetoken
    const shareToken = crypto.randomBytes(16).toString("hex");

    //save that token to content 
    content.shareToken = shareToken
    await content.save();

    res.json({
        message: "Share link generated",
        shareLink: `http://localhost:3000/share/${shareToken}`
    })

})

app.get("/api/v1/content/share/:token", userMiddleware, async (req, res) => {
    const token = req.params.token;

    const content = await ContentModel.findOne({
        shareToken: token
    }).populate<{ userId: { username: string } }>("userId", "username")

    if(!content){
    return res.status(404).json({
        message : "Expired Link"
    })
    }

    res.json({
        title: content.title,
        link: content.link,
        tags: content.tags,
        sharedBy: content.userId?.username
    });

})



app.listen(3000);
