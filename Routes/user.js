const express = require("express");
const Router = express.Router();
const User=require("../Models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport=require("passport");
const {saveRedirectUrl}=require("../middleware.js");

//contollers
const userController=require("../controllers/users.js");

//User Routes
Router
.route("/signup")
.get(userController.renderSignUpForm)
.post(wrapAsync(userController.signup));

Router
.route("/login")
.get(userController.renderLoginForm)
.post(
        saveRedirectUrl,
        passport.authenticate('local',
        {failureRedirect:'/login',
            failureFlash:true,
        }),
        userController.successfulLogin);

Router.get("/logout",userController.userlogout);
module.exports=Router;