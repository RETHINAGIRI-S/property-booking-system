import React, { Fragment, useEffect, useState } from "react";
import "../../css/Profile.css";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../LoadingSpinner";

const EditProfile = () => {
  const { user, updateProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  const [avatarPreview, setAvatarPreview] = useState(
    user?.avatar?.url || "/assets/avatar.png"
  );
  const navigate = useNavigate();

  const originalUserData = {
    name: user?.name || "",
    phoneNumber: user?.phoneNumber || "",
    avatar: user?.avatar?.url || "",
  };

  const onChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setAvatarPreview(reader.result);
        form.setFieldValue("avatar", reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const form = useForm({
    defaultValues: {
      name: user?.name || "",
      phoneNumber: user?.phoneNumber || "",
      avatar: user?.avatar?.url || "",
    },
    onSubmit: async ({ value }) => {
      const updatedFields = {};

      if (value.name && value.name !== originalUserData.name) {
        updatedFields.name = value.name;
      }
      if (value.phoneNumber && value.phoneNumber !== originalUserData.phoneNumber) {
        updatedFields.phoneNumber = value.phoneNumber;
      }
      if (value.avatar && value.avatar !== originalUserData.avatar) {
        updatedFields.avatar = value.avatar;
      }

      if (Object.keys(updatedFields).length === 0) {
        toast("No changes made");
        navigate("/profile");
        return;
      }

      setLoading(true);
      try {
        await updateProfile(updatedFields);
        navigate("/profile");
      } catch (err) {
        console.error("Profile update failed:", err);
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (user) {
      form.setFieldValue("name", user.name || "");
      form.setFieldValue("phoneNumber", user.phoneNumber || "");
      form.setFieldValue("avatar", user.avatar?.url || "");
      setAvatarPreview(user.avatar?.url || "/assets/avatar.png");
    }
  }, [user]);

  return (
    <Fragment>
      <div className="row wrapper ">
        <div className="col-10 col-lg-5 updateprofile">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            encType="multipart/form-data"
          >
            <h1 className="mt-2 mb-5">Update Profile</h1>

            <form.Field name="name">
              {(field) => (
                <div className="form-group">
                  <label htmlFor="name_field">Name</label>
                  <input
                    type="text"
                    id="name_field"
                    className="form-control"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="phoneNumber">
              {(field) => (
                <div className="form-group">
                  <label htmlFor="phone_field">Phone Number</label>
                  <input
                    type="text"
                    id="phone_field"
                    className="form-control"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="avatar">
              {(field) => (
                <div className="form-group">
                  <label htmlFor="avatar_upload">Avatar</label>
                  <div className="d-flex align-items-center">
                    <div>
                      <figure className="avatar mr-3 item-rtl">
                        <img
                          src={avatarPreview}
                          className="rounded-circle"
                          alt="Avatar Preview"
                          style={{ width: "60px", height: "60px", objectFit: "cover" }}
                        />
                      </figure>
                    </div>
                    <div className="custom-file">
                      <input
                        type="file"
                        name={field.name}
                        className="custom-file-input"
                        id="avatarupdate"
                        accept="image/*"
                        onChange={onChange}
                      />
                      <label className="custom-file-label" htmlFor="avatarupdate">
                        Choose Avatar
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </form.Field>
            <button
              type="submit"
              className="update-btn btn-block"
              disabled={loading || authLoading}
            >
              {loading || authLoading ? "Updating..." : "Update"}
            </button>
          </form>
        </div>
      </div>
    </Fragment>
  );
};

export default EditProfile;
