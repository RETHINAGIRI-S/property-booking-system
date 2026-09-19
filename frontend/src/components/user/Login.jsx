import React, { Fragment, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../css/Login.css";
import LoadingSpinner from "../LoadingSpinner";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      console.error("Login failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <div className="row wrapper">
        {loading && <LoadingSpinner />}
        {!loading && (
          <div className="col-10 col-lg-5">
            <form onSubmit={submitHandler}>
              <h1 className="mb-3">Login</h1>
              <div className="form-group">
                <label htmlFor="email_field">Email</label>
                <input
                  type="email"
                  id="email_field"
                  className="form-control"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password_field">Password</label>
                <input
                  type="password"
                  id="password_field"
                  className="form-control"
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Link to="/user/forgotPassword" className="float-right mb-4">
                Forgot Password?
              </Link>

              <button
                id="login_button"
                type="submit"
                className="loginbutton btn-block py-3"
                disabled={loading}
              >
                {loading ? "LOGGING IN..." : "LOGIN"}
              </button>

              <Link to="/signup" className="float-right mt-3">
                New User?
              </Link>
            </form>
          </div>
        )}
      </div>
    </Fragment>
  );
};

export default Login;
