const express =require("express");
const { default: mongoose } = require("mongoose");
const app = express();
const UserDetails = require("./Schema1")
const userlogs = require("./Schema2")
const bodyParser = require("body-parser")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
app.use(express.json())
app.use(bodyParser.json())

mongoose.connect("mongodb+srv://madan892000:123456madan@cluster0.rs935.mongodb.net/interakt",)
.then(() => console.log("mongoose connected succesfully"))
.catch((err) => console.log("This is the connection error : ",err) )

const JWT_SECRET_KEY = "123456789";

app.post("/users",async (req,res) => {
    const email = req.body.email
    const password = req.body.password
    console.log(email,password);
    const isUserinDb = await UserDetails.findOne({email});
    const hashPassWord = await bcrypt.hash(password,10);
    if (isUserinDb){
        return res.status(400).json({message : "user was already in db ."})
    }
    const user = new UserDetails({...req.body,password:hashPassWord});
    try{
        console.log(user)
        const savedUser  = await user.save();
        
        res.status(201).json({savedUser})
    }
    catch(err){
        res.status(400).json({message: err.message})
    }
});

app.post("/login",async (req,res) => {
    const {email,password} = req.body;
    try{
        const user = await UserDetails.findOne({email})
        const passwordmatch = await bcrypt.compare(password,user.password);
        if (!passwordmatch){
            return res.status(404).json({message : "Invalid login creds"})
        }
        const jwtToken = jwt.sign({userId : user._id},JWT_SECRET_KEY,{expiresIn : "1h"});

    if (!user){
        return res.status(404).json({message : "User nnot found"})
    }
    const userLog = new userlogs({userId : user._id})
    await userLog.save()
    res.json({jwtToken})
    }
    catch(err){
        res.status(500).json({message:err.message})
    }

})

app.get("/users",async (req,res) => {
    try{
        const users  = await UserDetails.find();
        res.json(users)
    }
    catch(err){
        res.status(500).json({message : err.message})
    }
})

const middleWare = async(req,res,next) => {
    const {token} = req.body;
    
    try{
        const dekrypttoken = jwt.decode(token);
        const {userId} = dekrypttoken
        const isUserVerifed = jwt.verify(token,JWT_SECRET_KEY);
        console.log(isUserVerifed);
        if (isUserVerifed){
            console.log("entered if condition");
            req.userId = userId;
            next();
        }
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
}

app.get("/users/:id",async(req,res) => {
    const currentUserID = req.params.id;
    // console.log(currentUserID,"currentUserid")
    try{
        const userDetails = await UserDetails.findById(currentUserID);
        if (!userDetails){
            return res.status(404).json({message:"User not found"})
        }
        
        const logDetails = await userlogs.find({userId : currentUserID});
        console.log(userDetails,logDetails);
        if (!logDetails){
            return res.status(404).json({message:"logs not found"})
        }
        res.json({userInfo : userDetails,userLogs : logDetails})
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
})



app.put("/users", middleWare ,async(req,res) => {
    try{
        console.log(req.userId);
        const updatedUser = await UserDetails.findByIdAndUpdate(req.userId,req.body,{new : true});

        res.json(updatedUser);
    }catch(err){
        res.status(400).json({message:err.message})
    }
})

app.delete("/users", middleWare ,async(req,res) => {
    console.log("reached delete request")
    try{
        await UserDetails.findByIdAndDelete(req.userId);
        // res.send("user deleted successfully");
    res.status(204).send()
    }catch(err){
        res.status(500).json({message:err.message})
    }
})




app.listen(3000,() => {
    console.log("server is running");
})

//Mongodb connection string : mongodb+srv://madan892000:<db_password>@cluster0.rs935.mongodb.net/
// username : madan892000
// password : 7675@Madan

//User schema1 : username email password profilepic
//User Schema2 : logs

//duplicacy
//logs history and user details
//authentication jwt
