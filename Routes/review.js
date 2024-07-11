const express = require("express");
const Router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {reviewSchema } = require("../schema.js");
const Review=require("../Models/review.js");
const Listing = require("../Models/listing.js");
const { isLoggedIn,validateReview ,isReviewAuthor,isDeleteRequest} = require("../middleware.js");

const reviewController=require("../controllers/reviews.js")
// Reviews Post Route
Router.post("/",
        isLoggedIn,
        validateReview, 
        wrapAsync(reviewController.createReview)
);

//route for get handled by us only
Router.get("/:reviewId",
    isDeleteRequest,
    (req,res)=>{
        // console.log(req.body)
        // console.log(req.query)
        const {id} = req.params;
        res.redirect(`/listings/${id}`);
    })


//Delete Review Route
Router.delete("/:reviewId",
    isLoggedIn,
    isReviewAuthor,
     wrapAsync(reviewController.destroyReview));

module.exports=Router;

// common part removed from route is-----> /listings/:id/reviews