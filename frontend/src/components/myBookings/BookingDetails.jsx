import React, { useEffect, useState } from "react";
import "../../css/BookingDetails.css";
import PropertyImg from "../propertyListing/PropertyImg";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../LoadingSpinner";
import { axiosInstance } from "../../utils/axios";

const BookingDetails = () => {
  const { bookingId } = useParams();
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const response = await axiosInstance.get(`/v1/rent/user/booking/${bookingId}`);
        const data = response.data?.data?.bookings || response.data?.data || null;
        setBookingDetails(data);
      } catch (error) {
        console.error("Error fetching booking details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  if (loading) {
    return (
      <div className="row justify-content-around mt-5">
        <LoadingSpinner />
      </div>
    );
  }

  if (!bookingDetails || !bookingDetails.property) {
    return (
      <div className="text-center mt-5">
        <h3>Booking Details Not Found</h3>
      </div>
    );
  }

  const prop = bookingDetails.property;
  const address = prop.address || {};

  return (
    <div className="details-container">
      <p className="details-header">{prop.propertyName}</p>
      <h6 className="details-location">
        <span className="material-symbols-outlined">location_on</span>
        <span className="location">
          {[address.area, address.city, address.pincode, address.state]
            .filter(Boolean)
            .join(", ")}
        </span>
      </h6>
      <div className="details-information-container ">
        <div className="details-information ">
          <h5>Booking Information</h5>
          <section className="booking-stay-information">
            <span className="details">
              <span className="material-symbols-outlined stay-icon">
                bedtime
              </span>
              {bookingDetails.numberOfnights || 1} nights
            </span>
            <span className="details">
              <span className="material-symbols-outlined stay-icon">
                calendar_month
              </span>
              {bookingDetails.fromDate ? new Date(bookingDetails.fromDate).toLocaleDateString() : "N/A"}
            </span>
            <span className="material-symbols-outlined stay-icon">
              arrow_forward
            </span>
            <span className="details">
              <span className="material-symbols-outlined stay-icon">
                calendar_month
              </span>
              {bookingDetails.toDate ? new Date(bookingDetails.toDate).toLocaleDateString() : "N/A"}
            </span>
          </section>
        </div>
        <div className="details-total-price-container ">
          <div className="details-total-price">
            <p className="price-header">Total Price</p>
            <span className="price-in-number">
              &#8377; {bookingDetails.price}
            </span>
          </div>
        </div>
      </div>
      {prop.images && prop.images.length > 0 && (
        <PropertyImg images={prop.images} />
      )}
    </div>
  );
};

export default BookingDetails;
