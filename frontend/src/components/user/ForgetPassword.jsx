import React from "react";
import "../../css/ForgetPassword.css";
import { useForm } from "@tanstack/react-form";
import toast from "react-hot-toast";
import { axiosInstance } from "../../utils/axios";

const ForgetPassword = () => {
  const [loading, setLoading] = React.useState(false);
  const form = useForm({
    defaultValues: {
      email: "",
    },
    onSubmit: async ({ value }) => {
      if (!value.email) {
        toast.error("Please enter your registered email address");
        return;
      }
      setLoading(true);
      try {
        const res = await axiosInstance.post("/v1/rent/user/forgotPassword", { email: value.email });
        toast.success(res.data?.message || "Password reset instructions sent to your email!");
      } catch (err) {
        const msg = err.response?.data?.message || err.message || "Failed to send reset email";
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <>
      <div className="row wrapper">
        <div className="col-10 col-lg-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <h1 className="password_title">Forget Password</h1>
            <form.Field name="email">
              {(field) => (
                <div className="form-group">
                  <label htmlFor="email_field">Enter Email</label>
                  <input
                    type="email"
                    id="email_field"
                    className="form-control"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
            <button
              id="forgot_password_button"
              type="submit"
              className="btn-block py-3 password-btn"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Email"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ForgetPassword;
