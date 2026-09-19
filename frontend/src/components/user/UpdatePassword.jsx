import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const UpdatePassword = () => {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [passwordCurrent, setPasswordCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await updatePassword({ passwordCurrent, password, passwordConfirm });
      navigate("/profile");
    } catch (err) {
      console.error("Update password failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="row wrapper">
        <div className="col-10 col-lg-5 updateprofile">
          <form onSubmit={submitHandler}>
            <h1 className="password_title">Update Password</h1>
            <div className="form-group">
              <label htmlFor="old_password_field">Current Password</label>
              <input
                type="password"
                id="old_password_field"
                className="form-control"
                required
                value={passwordCurrent}
                onChange={(e) => setPasswordCurrent(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="new_password_field">New Password</label>
              <input
                type="password"
                id="new_password_field"
                className="form-control"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="new_password_confirm_field">
                Confirm New Password
              </label>
              <input
                type="password"
                id="new_password_confirm_field"
                className="form-control"
                required
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn-block py-3 password-btn"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default UpdatePassword;
