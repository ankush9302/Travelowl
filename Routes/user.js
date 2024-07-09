const express = require("express");
const Router = express.Router();
const User=require("../Models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport=require("passport");
const {saveRedirectUrl}=require("../middleware.js");

Router.get("/signup",(req,res)=>{
    res.render("./users/signup.ejs");
});
Router.post("/signup",wrapAsync(async(req,res)=>{
    try{
       let{username,email,password}=req.body;
    const newUser=new User({email,username});
    const registeredUser=await User.register(newUser,password);
    //console.log(registeredUser);
    req.login(registeredUser,(err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","registered successfully");
        res.redirect("/listings")
    })
    }catch(err){
        req.flash("error",err.message);
        res.redirect("/signup")
    }
   
}));

Router.get("/login",(req,res)=>{
    res.render("./users/login.ejs");
});

Router.post("/login",
    saveRedirectUrl,
    passport.authenticate('local',
        {failureRedirect:'/login',
            failureFlash:true,
        }),
        async(req,res)=>{
          req.flash("Welcome Dear!");
          if(res.locals.redirectUrl){

              res.redirect(res.locals.redirectUrl);
          }else{

              res.redirect("/listings");
          }
});

Router.get("/logout",(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            next(err);
        }
        req.flash("success","you are logged out !");
        res.redirect("/listings");
    })
})
module.exports=Router;