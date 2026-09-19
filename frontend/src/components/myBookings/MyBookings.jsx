import React, { useEffect, useState } from "react";
import "../../css/MyBookings.css";
import ProgressSteps from "../ProgressSteps";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../LoadingSpinner";
import { axiosInstance } from "../../utils/axios";

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axiosInstance.get("/v1/rent/user/booking");
        const list = response.data?.data?.bookings || response.data?.data || [];
        setBookings(list);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleBookingClick = (bookingId) => {
    navigate(`/user/myBookings/${bookingId}`);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (bookings.length === 0 && !loading) {
    return (
      <>
        <ProgressSteps />
        <div
          className="d-flex justify-content-center align-items-center flex-column"
          style={{ height: "60vh" }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "64px", color: "#ccc" }}>
            luggage
          </span>
          <h3 className="mt-3">Nothing booked yet</h3>
          <p className="text-muted">You haven't made any property reservations yet.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <ProgressSteps />
      <div className="wow">
        {bookings.map((booking) => (
          <div
            className="main-container"
            onClick={() => handleBookingClick(booking._id)}
            key={booking._id}
          >
            <div className="mybookings-container row">
              <div className="image-container col-lg-3 col-md-3">
                <img
                  className="booking-img"
                  src={
                    booking.property?.images && booking.property.images.length > 0
                      ? booking.property.images[0].url
                      : "/assets/image1.jpeg"
                  }
                  alt="bookings"
                />
              </div>
              <div className="booking-information col-lg-9 col-md-9">
                <h6 className="hotel-name">
                  {booking.property?.propertyName || "Property Stay"}
                </h6>
                <div className="stay-information">
                  <span className="info">
                    <span className="material-symbols-outlined icon">
                      bedtime
                    </span>
                    {booking.numberOfnights || 1} nights
                  </span>
                  <span className="info">
                    <span className="material-symbols-outlined icon">
                      calendar_month
                    </span>
                    {booking.fromDate ? new Date(booking.fromDate).toLocaleDateString() : "N/A"}
                  </span>
                  <span className="material-symbols-outlined icon">
                    arrow_forward
                  </span>
                  <span className="info">
                    <span className="material-symbols-outlined icon">
                      calendar_month
                    </span>
                    {booking.toDate ? new Date(booking.toDate).toLocaleDateString() : "N/A"}
                  </span>
                </div>
                <h5 className="booking-price">
                  <span className="material-symbols-outlined">payments</span>{" "}
                  Total Price : &#8377; {booking.price}
                </h5>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default MyBookings;
