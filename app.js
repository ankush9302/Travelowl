const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./Models/listing");
const path=require("path");
const methodOverride=require("method-override");
const ejsmate=require("ejs-mate");


const MongoUrl="mongodb://127.0.0.1:27017/Wanderlust";
main().then(()=>{
    console.log("connected to DB");

}).catch(err=>{
    console.log(err);
})
async function main(){
    await mongoose.connect(MongoUrl);
}

app.engine("ejs",ejsmate);
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));


app.get("/",(req,res)=>{
    res.send("hi,i am G-root");
})

app.get("/listings",async (req,res)=>{
   const alllistings=await Listing.find({});
res.render("./listings/index.ejs",{alllistings});
});

//new route
app.get("/listings/new",(req,res)=>{
    
  res.render("./listings/new.ejs");
});


//show route
app.get("/listings/:id",async (req,res)=>{
    let {id}=req.params;
   const listing=await  Listing.findById(id);
   res.render("./listings/show.ejs",{listing});

})

//Create Route
app.post("/listings",async (req,res)=>{
    //let {title,description,image,price,country,location}=req.params;
  let listing=req.body.listing;
  const newListing = new Listing(listing);
  await newListing.save();
  console.log(listing);
});

//edit Route
app.get("/listings/:id/edit",async (req,res)=>{
    let {id}=req.params;
   const listing=await  Listing.findById(id);
   res.render("./listings/edit.ejs",{listing});
});

//update Route
app.put("/listings/:id",async (req,res)=>{
   let {id}=req.params;
   const listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});
   res.redirect(`/listings/${id}`);
});
//delete Route
app.delete("/listings/:id",async (req,res)=>{
    let {id}=req.params;
    let deleted=await Listing.findByIdAndDelete(id);
    console.log(deleted);
    res.redirect("/listings");
})

app.listen(8080,()=>{
    console.log("server is listening to port 8080");
});

