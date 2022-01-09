const mongoose = require ('mongoose');
const mongoURI = "mongodb://localhost:27017/inotebook?readPreference=primary&appname=MongoDB%20Compass&ssl=false"

//We use Mongoose for accessing the MongoDB
// writing MongoDB validation, casting and business logic boilerplate is easy when we use mongoose
const connectToMongo = () => {
    mongoose.connect(mongoURI, () => {
        console.log("Connected to MongoDB");
    })
}

module.exports = connectToMongo;
