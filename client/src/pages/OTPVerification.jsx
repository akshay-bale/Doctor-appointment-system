import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/register.css";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../redux/reducers/rootSlice";
import jwt_decode from "jwt-decode";
import fetchData from "../helper/apiCall";

axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

function OTPVerification() {
  const dispatch = useDispatch();
  const [formDetails, setFormDetails] = useState({
    otp: "",
  });
  const navigate = useNavigate();

  const inputChange = (e) => {
    const { value } = e.target;
    return setFormDetails({
      otp: value,
    });
  };

  const formSubmit = async (e) => {
    try {
      e.preventDefault();
      const { otp } = formDetails;
      if (!otp) {
        return toast.error("OTP field should not be empty");
      } 
      // else if (otp.length < 5) {
      //   return toast.error("otp must be at least 5 characters long");
      // }

      const { data } = await toast.promise(
        axios.post("http://localhost:5000/api/user/verifyotp", 
          {otp},
          {headers: {
              authorization: `Bearer ${localStorage.getItem("phone")}`,
            },}
        ),
        {
          pending: "Logging in...",
          success: "OTP verified",
          error: "Unable to verify OTP",
          loading: "Verifying OTP...",
        }
      );
      return navigate("/login")
    } catch (error) {
      return error;
    }
  };

  return (
    <section className="register-section flex-center">
      <div className="register-container flex-center">
        <h2 className="form-heading">Enter OTP</h2>
        <form
          onSubmit={formSubmit}
          className="register-form"
        >
          <input
            type="number"
            name="OTP"
            className="form-input"
            placeholder="Enter your OTP"
            value={formDetails.OTP}
            onChange={inputChange}
          />
          <button
            type="submit"
            className="btn form-btn"
          >
            Submit
          </button>
        </form>
      </div>
    </section>
  );
}

export default OTPVerification;
