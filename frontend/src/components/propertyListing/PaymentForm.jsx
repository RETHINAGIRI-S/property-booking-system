import React, { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { DatePicker, Space } from "antd";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const PaymentForm = ({
  price,
  propertyName,
  address,
  maximumGuest,
  propertyId,
  currentBookings = [],
}) => {
  const [calculatedPrice, setCalulatedPrice] = useState(0);
  const navigate = useNavigate();
  const { RangePicker } = DatePicker;
  const { user, isAuthenticated } = useAuth();

  const isDateDisabled = (current) => {
    if (!current) return false;
    const today = moment().startOf("day");
    if (current.isBefore(today)) {
      return true;
    }

    return (currentBookings || []).some((booking) => {
      if (!booking.fromDate || !booking.toDate) return false;
      const startDate = moment(booking.fromDate).startOf("day");
      const endDate = moment(booking.toDate).startOf("day");
      const currentMoment = moment(current.toDate()).startOf("day");

      return (
        currentMoment.isSameOrAfter(startDate) &&
        currentMoment.isSameOrBefore(endDate)
      );
    });
  };

  const form = useForm({
    defaultValues: {
      dateRange: [],
      guests: 1,
      name: user?.name || "",
      phoneNumber: user?.phoneNumber || "",
    },
    onSubmit: async ({ value }) => {
      if (!isAuthenticated) {
        toast.error("Please login to complete your booking");
        navigate("/login");
        return;
      }

      const [checkinDate, checkoutDate] = value.dateRange || [];
      if (!checkinDate || !checkoutDate) {
        toast.error("Please select both check-in and check-out dates");
        return;
      }

      const nights = moment(checkoutDate).diff(moment(checkinDate), "days");
      if (nights <= 0) {
        toast.error("Check-out date must be after check-in date");
        return;
      }

      // Check for date range overlap with existing bookings (double booking guard)
      const hasConflict = (currentBookings || []).some((booking) => {
        if (!booking.fromDate || !booking.toDate) return false;
        const bStart = moment(booking.fromDate).startOf("day");
        const bEnd = moment(booking.toDate).startOf("day");
        const selStart = moment(checkinDate).startOf("day");
        const selEnd = moment(checkoutDate).startOf("day");
        return selStart.isBefore(bEnd) && selEnd.isAfter(bStart);
      });

      if (hasConflict) {
        toast.error("Selected dates overlap with an existing booking. Please pick another date.");
        return;
      }

      const { name, guests, phoneNumber } = value;
      if (name && guests && phoneNumber) {
        const paymentDetails = {
          checkinDate,
          checkoutDate,
          nights,
          totalPrice: calculatedPrice || price * nights,
          propertyName,
          address,
          guests: Number(guests),
          name,
          phoneNumber,
        };

        sessionStorage.setItem("homelyhub_payment_details", JSON.stringify(paymentDetails));
        navigate(`/payment/${propertyId}`);
      } else {
        toast.error("Please fill all required fields correctly.");
      }
    },
  });

  useEffect(() => {
    if (user) {
      form.setFieldValue("name", user.name || "");
      form.setFieldValue("phoneNumber", user.phoneNumber || "");
    }
  }, [user]);

  return (
    <div className="form-container">
      <form
        className="payment-form"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <div className="price-pernight">
          Price: <b>&#8377;{price}</b>
          <span> / Per night</span>
        </div>
        <div className="payment-field">
          <form.Field name="dateRange">
            {(field) => (
              <div className="date">
                <Space direction="vertical" size={12}>
                  <RangePicker
                    format="YYYY-MM-DD"
                    picker="date"
                    disabledDate={isDateDisabled}
                    onChange={(value, dateString) => {
                      field.handleChange(dateString);
                      const [checkin, checkout] = dateString;
                      if (checkin && checkout) {
                        const nights = moment(checkout, "YYYY-MM-DD").diff(
                          moment(checkin, "YYYY-MM-DD"),
                          "days"
                        );
                        const total = price * Math.max(1, nights);
                        setCalulatedPrice(total);
                      } else {
                        setCalulatedPrice(0);
                      }
                    }}
                  />
                </Space>
              </div>
            )}
          </form.Field>
          <form.Field
            name="guests"
            validators={{
              onChange: ({ value }) =>
                value > 0 && value <= maximumGuest
                  ? undefined
                  : `Guests must be 1 - ${maximumGuest}`,
            }}
          >
            {(field) => (
              <div className="guest">
                <label className="payment-labels">Number of guests:</label>
                <br />
                <input
                  type="number"
                  className="no-of-guest"
                  placeholder="Guest"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors && (
                  <p style={{ color: "red" }}>{field.state.meta.errors}</p>
                )}
              </div>
            )}
          </form.Field>
          <div className="name-phoneno">
            <form.Field name="name">
              {(field) => (
                <>
                  <label className="payment-labels">Your full name:</label>
                  <br />
                  <input
                    type="text"
                    className="full-name"
                    placeholder="Name"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </>
              )}
            </form.Field>
            <br />
            <form.Field name="phoneNumber">
              {(field) => (
                <>
                  <label className="payment-labels">Phone Number:</label>
                  <br />
                  <input
                    type="number"
                    className="phone-number"
                    placeholder="Number"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </>
              )}
            </form.Field>
          </div>
        </div>
        <div className="book-place">
          {!isAuthenticated ? (
            <button type="button" onClick={() => navigate("/login")}>
              Login to Book
            </button>
          ) : (
            <button type="submit">Book this place &#8377; {calculatedPrice || price}</button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;
