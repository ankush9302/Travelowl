const express = require("express");
const Router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js"); 
const { listingSchema,reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../Models/listing.js");
const { isLoggedIn, validateListing, isOwner } = require("../middleware.js");
const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({storage});

//controllers
const listingController = require("../controllers/listings.js");

//Routes
Router
.route("/")
.get( wrapAsync(listingController.index))                                           //to get all the listings
    .post(
        isLoggedIn,
        upload.single('listing[image]'),
        validateListing,
        wrapAsync(listingController.createListing)
    );  // Create route


Router.get("/new",isLoggedIn,listingController.renderNewForm);                   // New route 

Router
.route("/:id")
.get( wrapAsync(listingController.showListing))                                  // Show route
    .put(
        isLoggedIn,
        isOwner,
        upload.single('listing[image]'),
        validateListing,
        wrapAsync(listingController.updateListing)
    )    // Update route
    .delete(
        isLoggedIn,
        wrapAsync(listingController.destroyListing)
    );                // Delete route

Router.get(
    "/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.renderEditForm)); // Edit route

module.exports=Router;

// common part removed from route is--> /listings