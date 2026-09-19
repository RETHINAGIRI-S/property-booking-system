import React from "react";
import Search from "./Search";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Filter from "./Filter";
import "../../css/AiTripPlanner.css";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const logoutUser = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      <nav className="header row sticky-top ">
        <Link to="/">
          <img
            src="/assets/logo.png"
            alt="logo"
            className="logo"
          />
        </Link>
        {isHomePage && (
          <div className="search_filter">
            <Search />
            <Filter />

            <Link to="/ai-trip-planner" className="ai-trip-link">
              <span className="material-symbols-outlined">auto_awesome</span>
              <span>Trip Genie</span>
            </Link>
          </div>
        )}
        {!isAuthenticated || !user ? (
          <Link to="/login" className="login-tip">
            <span className="material-symbols-outlined web_logo">
              account_circle
            </span>
            <span className="login-tip-text">You are not logged in. Please login</span>
          </Link>
        ) : (
          <div className="dropdown">
            <span
              className="material-symbols-outlined web_logo dropdown-toggle d-flex align-items-center"
              role="button"
              id="dropdownMenuLink"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ cursor: "pointer" }}
            >
              {user.avatar?.url ? (
                <img
                  src={user.avatar.url}
                  className="user-img rounded-circle"
                  alt="icon"
                  style={{ width: "35px", height: "35px", objectFit: "cover" }}
                />
              ) : (
                "account_circle"
              )}
            </span>

            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuLink">
              <li>
                <Link className="dropdown-item" to="/profile">
                  👤 My Account
                </Link>
              </li>
              <li>
                <Link className="dropdown-item" to="/user/mybookings">
                  📅 My Bookings
                </Link>
              </li>
              <li>
                <Link className="dropdown-item" to="/accomodation">
                  🏠 My Accommodations
                </Link>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button
                  className="dropdown-item text-danger"
                  type="button"
                  onClick={logoutUser}
                >
                  🚪 Logout
                </button>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </>
  );
};

export default Header;
