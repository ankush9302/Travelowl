const express = require("express");
const Router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {reviewSchema } = require("../schema.js");
const Review=require("../Models/review.js");
const Listing = require("../Models/listing.js");

const validateReview = (req, res, next) => {
    // console.log(req);
    let { error } = reviewSchema.validate(req.body);
    if (error) {
          console.log("error is begin sent from here");
        let errorMessages = error.details.map((detail) => detail.message).join(", ");
        throw new ExpressError(400, errorMessages);
    } else {
      
        next();
    }
}

// Reviews Post Route
Router.post("/",validateReview, wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }
    console.log(req.body);
    let newReview = new Review(req.body.review);
    await newReview.save();
    listing.reviews.push(newReview);
    await listing.save();
     req.flash("success","New Review Created!");
    res.redirect(`/listings/${listing._id}`);
}));

//Delete Review Route
Router.delete("/:reviewId", wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    console.log(id, reviewId);
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
     req.flash("success","Review Deleted!");
    res.redirect(`/listings/${id}`);
}));

module.exports=Router;

// common part removed from route is-----> /listings/:id/reviews