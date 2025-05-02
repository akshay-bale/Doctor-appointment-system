const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Doctor = require("../models/doctorModel");
const Appointment = require("../models/appointmentModel");

const getuser = async (req, res) => {
  try {
    const userDoc = await User.findById(req.params.id).select("-password");
    const user = userDoc.toObject()
    const doctor = await Doctor.findOne({userId: req.params.id})
    console.log("is he a doctor: ",doctor)
    user.isAvailable = doctor?.isDoctor ? doctor.isAvailable : null
    console.log("this user was requsted: ",user)
    return res.send(user);
  } catch (error) {
    res.status(500).send("Unable to get user");
  }
};

const getallusers = async (req, res) => {
  try {
    const users = await User.find()
      .find({ _id: { $ne: req.locals } })
      .select("-password");
      // console.log(users)
    return res.send(users);
  } catch (error) {
    res.status(500).send("Unable to get all users");
  }
};

const login = async (req, res) => {
  try {
    console.log("login hit")
    const emailPresent = await User.findOne({ email: req.body.email });
    if (!emailPresent) {
      return res.status(400).send("Incorrect credentials");
    }
    const verifyPass = await bcrypt.compare(
      req.body.password,
      emailPresent.password
    );
    if (!verifyPass) {
      return res.status(400).send("Incorrect credentials");
    }
    console.log("checking")
    const token = jwt.sign(
      { userId: emailPresent._id, isAdmin: emailPresent.isAdmin },
      process.env.JWT_SECRET,
      {
        expiresIn: "2 days",
      }
    );
    return res.status(201).send({ msg: "User logged in successfully", token });
  } catch (error) {
    res.status(500).send("Unable to login user");
  }
};

const register = async (req, res) => {
  try {
    console.log("register hit")
    const emailPresent = await User.findOne({ email: req.body.email });
    if (emailPresent) {
      return res.status(400).send("Email already exists");
    }
    const hashedPass = await bcrypt.hash(req.body.password, 10);
    const user = await User({ ...req.body, password: hashedPass });
    const result = await user.save();
    if (!result) {
      return res.status(500).send("Unable to register user");
    }
    return res.status(201).send("User registered successfully");
  } catch (error) {
    res.status(500).send("Unable to register user");
  }
};

const updateprofile = async (req, res) => {
  try {
    const hashedPass = await bcrypt.hash(req.body.password, 10);
    const result = await User.findByIdAndUpdate(
      { _id: req.locals },
      { ...req.body, password: hashedPass }
    );
    console.log("doc before update: ", result)
    console.log("updateprofile hit userprofile:",req.body)
    console.log("updateprofile hit isavailable:",req.body?.isAvailable)
    if("isAvailable" in req.body){
      const doctor = await Doctor.findOne({ userId: req.locals });
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      // Manually update a field
      doctor.isAvailable = req.body.isAvailable; // or any value you need
      await doctor.save();
      console.log("doctor toggle changed")
    }
    console.log(req.body)
    if (!result) {
      return res.status(500).send("Unable to update user");
    }
    return res.status(201).send("User updated successfully");
  } catch (error) {
    console.log(error)
    res.status(500).send("Unable to update user");
  }
};

const deleteuser = async (req, res) => {
  try {
    const result = await User.findByIdAndDelete(req.body.userId);
    const removeDoc = await Doctor.findOneAndDelete({
      userId: req.body.userId,
    });
    const removeAppoint = await Appointment.findOneAndDelete({
      userId: req.body.userId,
    });
    return res.send("User deleted successfully");
  } catch (error) {
    res.status(500).send("Unable to delete user");
  }
};

module.exports = {
  getuser,
  getallusers,
  login,
  register,
  updateprofile,
  deleteuser,
};
