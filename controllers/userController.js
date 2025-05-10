const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Doctor = require("../models/doctorModel");
const Appointment = require("../models/appointmentModel");
const {createVerification, verifyOTP} = require("../twilio")


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
    console.log("get all users hit")
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
    if(!emailPresent.phoneVerified){
      const mobile = emailPresent.mobile
      console.log("phone unverified: ",mobile)
      
      const status = await createVerification(mobile)
      console.log("verifying phone no: ", status)
      const phone = jwt.sign(
          { mobile: mobile},
          process.env.JWT_SECRET,
          {
            expiresIn: "2 days",
          }
        );

      return res.status(200).send({msg: "verify phone number first", phone})
    }
    console.log("checking")
    const token = jwt.sign(
      { userId: emailPresent._id, isAdmin: emailPresent.isAdmin, isDoctor: emailPresent.isDoctor },
      process.env.JWT_SECRET,
      {
        expiresIn: "2 days",
      }
    );
    return res.status(201).send({ msg: "User logged in successfully", token });
  } catch (error) {
    console.log(error)
    res.status(500).send("Unable to login user");
  }
};

const register = async (req, res) => {
  try {
    console.log("register hit")
    const {mobile} = req.body
    const emailPresent = await User.findOne({ email: req.body.email });
    console.log("okay")
    if (emailPresent) {
      return res.status(400).send("Email already exists");
    }
    const hashedPass = await bcrypt.hash(req.body.password, 10);
    console.log("here1")
    console.log(mobile)
    const status = await createVerification(mobile)
    console.log("here2")
    const user = await User({ ...req.body, password: hashedPass });
    const result = await user.save();
    console.log("mobile received: ", mobile)
    const phone = jwt.sign(
      { mobile: mobile},
      process.env.JWT_SECRET,
      {
        expiresIn: "2 days",
      }
    );
    console.log("token set: ",phone)
    console.log(status)
    if (!result) {
      return res.status(500).send("Unable to register user");
    }
    return res.status(201).send({msg: "User registered successfully", phone});
  } catch (error) {
    console.log(error)
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
    if("isDoctor" in req.body && req.body.isDoctor){
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

const verify = async (req,res) => {
  try{
    console.log("verify hit")
    const {otp} = req.body
    console.log(otp)

    const phone = req.headers.authorization.split(" ")[1];
    console.log(phone)
    const {mobile} = jwt.verify(phone, process.env.JWT_SECRET);
    console.log(mobile)
    const status = await verifyOTP(mobile,otp)
    console.log(status)
    if(!status || status == "pending"){
      return res.status(500).send("wrong OTP entered")
    }
    const verifiedUser = await User.findOneAndUpdate({ mobile: mobile },{phoneVerified: true});
    console.log("this user verified: ", verifiedUser)
    
    return res.status(200).json({status})
  }catch(error){
    return res.status(500).send("something went wrong while verifying OTP")
  }
}

module.exports = {
  getuser,
  getallusers,
  login,
  register,
  updateprofile,
  deleteuser,
  verify
};
