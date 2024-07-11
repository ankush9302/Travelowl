if (process.env.NODE_ENV != "production") {
    require('dotenv').config()
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./Models/user.js");
const ExpressError=require("./utils/ExpressError.js")


//Routes 
const listingsRouter=require("./Routes/listing.js");
const reviewsRouter=require("./Routes/review.js");
const userRouter=require("./Routes/user.js");

//connect to mongo db

const dbUrl = process.env.ATLASDB_URL;

main().then(() => {
    console.log("connected to DB");
}).catch(err => {
    console.log(err);
})

async function main() {
    await mongoose.connect(dbUrl);
}


// Set up EJS template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsmate);

// Middleware to parse incoming requests with URL-encoded payloads
app.use(express.urlencoded({ extended: true }));
// Middleware to parse incoming requests with JSON payloads
app.use(express.json());
// Middleware to override HTTP methods
app.use(methodOverride("_method"));
// Middleware for serving static files
app.use(express.static(path.join(__dirname, "/public")));

//this middleware is for testing purpose only
// app.use((req,res,next)=>{
//     console.log("req is coming on middeleware for testing");
//     console.log(req.body);
//     console.log(req.params);
//     console.log(req.query);
//     next();
// })

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", () => {
    console.log("error in store");
})
// Session configuration
const sessionOptions = {
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    },
};


app.use(session(sessionOptions));
app.use(flash());

// Initialize passport and configure session handling
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware to add flash messages to response locals
app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
     res.locals.error= req.flash("error");
     res.locals.currUser=req.user;
    next();
})

// app.get("/", (req, res) => {
//     res.send("hi, I am Groot");
// });



app.get("/demouser",async(req,res)=>{
    let fakeUser=new User({
        email:"student@gmail.com",
        username:"delta-student",
    });
    let registereduser=await User.register(fakeUser,"helloworld");
    res.send(registereduser);
})

app.use("/listings",listingsRouter); 
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("listings/error.ejs", { err });
});

app.listen(8080, () => {
    console.log("Server is listening to port 8080");
});
