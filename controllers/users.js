const User=require("../Models/user.js");

module.exports.renderSignUpForm=(req,res)=>{
    res.render("./users/signup.ejs");
};

module.exports.signup=async(req,res)=>{
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
   
};

module.exports.renderLoginForm=(req,res)=>{
    res.render("./users/login.ejs");
};

module.exports.successfulLogin=async(req,res)=>{
          req.flash("Welcome Dear!");
         // console.log(await saveRedirectUrl);
          if(res.locals.redirectUrl){
            // console.log("so basically i am there at user route and following is value of local.redirectUrl:")
            // console.log(res.locals.redirectUrl)
            // console.log();
            // console.log(res.locals.currUser);
            //res.redirect("/listings")
             res.redirect(res.locals.redirectUrl);
          }else{

              res.redirect("/listings");
          }
};

module.exports.userlogout=(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            next(err);
        }
        req.flash("success","you are logged out !");
        res.redirect("/listings");
    })
};

