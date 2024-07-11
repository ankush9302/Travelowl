const Listing=require("./Models/listing");
const Review=require("./Models/review");
const ExpressError=require("./utils/ExpressError")
const {listingSchema,reviewSchema}=require("./schema");

module.exports.isLoggedIn=(req,res,next)=>{
    // console.log(req);
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        console.log("this is the route in isLoggedin=",req.session.redirectUrl);
        req.flash("error","You must be logged in to add new listing");
       return res.redirect("/login");
    }
    next();
};

module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errorMessages = error.details.map((detail) => detail.message).join(", ");
        throw new ExpressError(400, errorMessages);
    } else {
        next();
    }
} 


module.exports.validateReview = (req, res, next) => {
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

module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner=async (req,res,next)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","you are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.isReviewAuthor=async (req,res,next)=>{
    let {id,reviewId}=req.params;
    // console.log(id,reviewId);
    let review=await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","you are not the owner of this review");
        // console.log(`listings/${id}`);
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.isDeleteRequest = async (req, res, next) => {
    // console.log(req.body)
    // console.log(req.params)
    if(!req.query._method){
        return next()
    }
    // Check if the request method is not POST or if _method is not DELETE
    if (req.query._method.toUpperCase() !== 'DELETE') {
        return next(); // Pass control to the next middleware or route handler
    }

    // Check if the user is authenticated
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl; // Store the original URL in session for redirection after login
        req.flash("error", "You must be logged in to delete a review");
        return res.redirect("/login"); // Redirect to login page if not authenticated
    }

    // Extract the listing id and review id from request parameters
    const { id, reviewId } = req.params;

    // Find the review by its id
    const review = await Review.findById(reviewId);
    
    // If the review is not found, throw a 404 error
    if (!review) {
        throw new ExpressError(404, "Review not found");
    }
    
    // Check if the current user is the author of the review
    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You do not have permission to delete this review");
        return res.redirect(`/listings/${id}`);
    }
    
    // If all checks pass, proceed with deleting the review from the database
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    
    // Set a success flash message and redirect to the listing detail page
    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
};
   