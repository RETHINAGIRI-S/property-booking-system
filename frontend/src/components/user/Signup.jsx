import React, { Fragment, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import "../../css/Login.css";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../LoadingSpinner";

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    phoneNumber: "",
  });

  const { name, email, password, passwordConfirm, phoneNumber } = user;

  const submitHandler = async (e) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await signup(user);
      navigate("/");
    } catch (err) {
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  return (
    <Fragment>
      <div className="row wrapper ">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <form
            onSubmit={submitHandler}
            encType="multipart/form-data"
            className="col-10 col-lg-5"
          >
            <h1 className="mb-3">Register</h1>
            <div className="form-group">
              <label htmlFor="name_field">Name</label>
              <input
                type="text"
                id="name_field"
                className="form-control"
                name="name"
                required
                value={name}
                onChange={onChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email_field">Email</label>
              <input
                type="email"
                id="email_field"
                className="form-control"
                name="email"
                required
                value={email}
                onChange={onChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password_field">Password</label>
              <input
                type="password"
                id="password_field"
                className="form-control"
                name="password"
                required
                value={password}
                onChange={onChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="passwordConfirm_field">Confirm Password</label>
              <input
                type="password"
                id="passwordConfirm_field"
                className="form-control"
                name="passwordConfirm"
                required
                value={passwordConfirm}
                onChange={onChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="phoneNumber_field">Phone Number</label>
              <input
                type="text"
                id="phoneNumber_field"
                className="form-control"
                name="phoneNumber"
                required
                value={phoneNumber}
                onChange={onChange}
              />
            </div>

            <button
              id="register_button"
              type="submit"
              className="loginbutton btn-block py-3"
              disabled={loading}
            >
              {loading ? "CREATING ACCOUNT..." : "REGISTER"}
            </button>

            <Link to="/login" className="float-right mt-3">
              Already have an account? Login
            </Link>
          </form>
        )}
      </div>
    </Fragment>
  );
};

export default Signup;
