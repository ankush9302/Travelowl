const express = require("express");
const Router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js"); 
const { listingSchema,reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../Models/listing.js");
const {isLoggedIn}=require("../middleware.js");

Router.get("/", wrapAsync(async (req, res) => {
    const alllistings = await Listing.find({});
    res.render("./listings/index.ejs", { alllistings });
}));

const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errorMessages = error.details.map((detail) => detail.message).join(", ");
        throw new ExpressError(400, errorMessages);
    } else {
        next();
    }
} 

// New route
Router.get("/new",isLoggedIn, (req, res) => {
   
    res.render("./listings/new.ejs");
});

// Show route
Router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate("reviews")
    .populate("owner");
    if(!listing){
        req.flash("error","Listing you Requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("./listings/show.ejs", { listing });
}));

// Create route
Router.post("/",isLoggedIn, validateListing, wrapAsync(async (req, res, next) => {
    let listing = req.body.listing;
    const newListing = new Listing(listing);
    newListing.owner=req.user._id;
    await newListing.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
}));

// Edit route
Router.get("/:id/edit",isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
     if(!listing){
        req.flash("error","Listing you Requested for does not exist!");
        res.redirect("/listings");
    }
      req.flash("success","Listing Edited!");
    res.render("./listings/edit.ejs", { listing });
}));

// Update route
Router.put("/:id",isLoggedIn, validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing=await Listing.findById(id);
    if(!listing.owner._id.equals(currUser._id)){
        req.flash("error","You don't have permission to edit");
        res.redirect(`/listings/${id}`);
    }
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
}));

// Delete route
Router.delete("/:id",isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deleted = await Listing.findByIdAndDelete(id);
     req.flash("success","Listing deleted successfully!");
    //console.log(deleted);
    res.redirect("/listings");
}));

module.exports=Router;

// common part removed from route is--> /listings