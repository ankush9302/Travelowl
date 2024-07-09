const mongoose = require("mongoose");
const Listing = require("./Models/listing"); // Ensure this is the correct path to your Listing model

const MongoUrl = "mongodb://127.0.0.1:27017/Wanderlust";

async function main() {
    await mongoose.connect(MongoUrl);
    console.log("Connected to DB");

    // Find all listings
    const listings = await Listing.find({});

    // Iterate over each listing and check for empty fields
    for (let listing of listings) {
        let hasEmptyField = false;
        for (let key in listing.toObject()) {
            if (listing[key] === "" || listing[key] === null || listing[key] === undefined) {
                hasEmptyField = true;
                break;
            }
        }

        // If any field is empty, delete the document
        if (hasEmptyField) {
            await Listing.findByIdAndDelete(listing._id);
            console.log(`Deleted listing with ID: ${listing._id}`);
        }
    }

    console.log("Finished cleaning up listings.");
    mongoose.connection.close();
}

main().catch(err => console.log(err));
