const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  firstName: String,
  lastName: String,
  emailAddress: {type: String, unique: true},
  password: String
});

UserSchema.plugin(uniqueValidator, {message: 'is already taken'});

const CourseSchema = new Schema({
  user: {type: Schema.Types.ObjectId, ref: 'User'},
  title: String,
  description: String,
  estimatedTime: String,
  materialsNeeded: String
});

const User = mongoose.model('User', UserSchema);
const Course = mongoose.model('Course', CourseSchema);

module.exports.User = User;
module.exports.Course = Course;