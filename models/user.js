// const mongoose = require('mongoose');
// const passportLocalMongoose = require("passport-local-mongoose");
// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   role: { type: String, enum: ["student", "alumni"], default: "student" },
//   graduationYear: { type: Number, required: true },
//   major: { type: String, required: true },
//   job: { type: String },
//   company: { type: String },
//   city: { type: String },
//   state: { type: String },
//   country: { type: String },
//   zipCode: { type: Number, min: [00000, "zip code is too short!"], max: [99999, "zip code is too long!"] },
//   bio: { type: String },
//   interests: [{ type: String }]
// });
// userSchema.plugin(passportLocalMongoose, 
//   {
//     usernameField: 'email',
//     passwordField: 'password',

// });
// const User = mongoose.model('User', userSchema);
// module.exports = User;




// Import the Mongoose library
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const randToken = require("rand-token");
// Define the user schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    // password: { type: String, required: true },
    role: { type: String, enum: ["student", "alumni"], default: "student" },
    graduationYear: { type: Number, required: true },
    major: { type: String, required: true },
    job: { type: String },
    company: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    zipCode: {
        type: String,
        required: true,
        validate: {
            validator: function (value) {
                return /^[0-9]{5}$/.test(value);
            },
            message: 'Invalid zip code! Zip code should be 5 digits long.'
        }
    },
    bio: { type: String },
    interests: [{ type: String }],
    apiToken: {
        type: String,
    },
});

// Add the passport-local-mongoose plugin
userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });
userSchema.pre("save", function (next) {
    let user = this;
    if (!user.apiToken) user.apiToken = randToken.generate(16);
    next();
  });
// Create the User model from the schema and export it
const User = mongoose.model('User', userSchema);
module.exports = User;