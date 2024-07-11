const Listing = require("../Models/listing");
const opencage = require('opencage-api-client');

module.exports.index=async (req, res) => {
    const alllistings = await Listing.find({});
    res.render("./listings/index.ejs", { alllistings });
};

module.exports.renderNewForm=(req, res) => {
   
    res.render("./listings/new.ejs");
};

module.exports.showListing=async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate
    ({
         path: "reviews",
         populate:{
         path:"author",
             },
    })
    .populate("owner");
    if(!listing){
        req.flash("error","Listing you Requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("./listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;
    
    let listing = req.body.listing;
    const newListing = new Listing(listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
   
    // note that the library takes care of URI encoding
    const forwardGeoCoding = await opencage.geocode({ q: listing.location });
    const { lat, lng }=forwardGeoCoding.results[0].geometry
   
    newListing.geometry = { type: "Point", coordinates: [lng, lat] };
    
    await newListing.save();
    
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
};

module.exports.renderEditForm=async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
     if(!listing){
        req.flash("error","Listing you Requested for does not exist!");
         res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_135,w_300");
  
    res.render("./listings/edit.ejs", { listing,originalImageUrl });
};

module.exports.updateListing=async (req, res) => {
    let { id } = req.params;
    let listing=await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error","You don't have permission to edit");
        res.redirect(`/listings/${id}`);
    }
    listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if (typeof(req.file)!=="undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing=async (req, res) => {
    let { id } = req.params;
    let deleted = await Listing.findByIdAndDelete(id);
     req.flash("success","Listing deleted successfully!");
    //console.log(deleted);
    res.redirect("/listings");
};