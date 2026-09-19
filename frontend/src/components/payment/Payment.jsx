import React, { useEffect, useState } from "react";
import "../../css/Payment.css";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { axiosInstance } from "../../utils/axios";

const Payment = () => {
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const [showPaymentGateaway, setShowPaymentGateaway] = useState(false);

  const [paymentDetails, setPaymentDetails] = useState(() => {
    try {
      const saved = sessionStorage.getItem("homelyhub_payment_details");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const {
    checkinDate,
    checkoutDate,
    totalPrice = 0,
    propertyName = "Homely Property",
    guests = 1,
    nights = 1,
  } = paymentDetails;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderData, setOrderData] = useState(null);

  const handleBooking = async () => {
    const paymentData = {
      amount: totalPrice,
      propertyId,
      fromDate: checkinDate,
      toDate: checkoutDate,
      guests,
    };

    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post("/v1/rent/user/booking/create-order", paymentData);
      setOrderData(response.data);
      setShowPaymentGateaway(true);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to create order";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.post("/v1/rent/user/booking/verify-payment", {
        orderId: orderData?.orderId || `order_${Date.now()}`,
        bookingDetails: {
          propertyId,
          fromDate: checkinDate,
          toDate: checkoutDate,
          guests,
          price: totalPrice,
          nights,
        },
        forceStatus: "success",
      });

      toast.success("🎉 Payment Successful! Booking Confirmed!");
      sessionStorage.removeItem("homelyhub_payment_details");
      setTimeout(() => navigate("/user/mybookings"), 1000);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Payment verification failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPayment = () => {
    toast.error("Payment Cancelled");
    navigate(`/propertylist/${propertyId}`);
  };

  if (showPaymentGateaway && orderData) {
    return (
      <div className="payment-gateway-overlay">
        <div className="payment-gateway-modal">
          <div className="gateway-header">
            <div className="gateway-logo">
              <h2>🏠 HomelyHub</h2>
              <span>Payment Gateway</span>
            </div>
            <div className="secure-badge">
              <span>🔒 Secure Payment</span>
            </div>
          </div>

          <div className="gateway-content">
            <div className="merchant-info">
              <h3>
                Payment to: <strong>HomelyHub</strong>
              </h3>
              <p>
                Order ID: <strong>{orderData.orderId}</strong>
              </p>
            </div>

            <div className="payment-summary">
              <div className="summary-item">
                <span>Property:</span>
                <span>{propertyName}</span>
              </div>
              <div className="summary-item">
                <span>Check-in:</span>
                <span>{checkinDate}</span>
              </div>
              <div className="summary-item">
                <span>Check-out:</span>
                <span>{checkoutDate}</span>
              </div>
              <div className="summary-item">
                <span>Guests:</span>
                <span>{guests}</span>
              </div>
              <div className="summary-item">
                <span>Nights:</span>
                <span>{nights}</span>
              </div>
              <div className="summary-item total-amount">
                <span>
                  <strong>Total Amount:</strong>
                </span>
                <span>
                  <strong>₹{Number(totalPrice).toLocaleString("en-IN")}</strong>
                </span>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="gateway-actions">
              <button
                onClick={handleCancelPayment}
                className="cancel-btn"
                disabled={loading}
              >
                Cancel Payment
              </button>
              <button
                onClick={handleConfirmPayment}
                className="confirm-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <span>🔒</span>
                    Confirm Payment ₹{Number(totalPrice).toLocaleString("en-IN")}
                  </>
                )}
              </button>
            </div>

            <div className="security-info">
              <p>
                <span>🛡️</span>
                Your payment information is encrypted and secure
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="payment-header">
        <h1>Complete Your Booking</h1>
        <p>{propertyName}</p>
      </div>

      <div className="payment-content">
        <div className="booking-summary-card">
          <h3>Booking Details</h3>
          <div className="detail-row">
            <span>Check-in:</span>
            <span>{checkinDate || "Not selected"}</span>
          </div>
          <div className="detail-row">
            <span>Check-out:</span>
            <span>{checkoutDate || "Not selected"}</span>
          </div>
          <div className="detail-row">
            <span>Guests:</span>
            <span>{guests}</span>
          </div>
          <div className="detail-row">
            <span>Nights:</span>
            <span>{nights}</span>
          </div>
          <div className="detail-row total-row">
            <strong>Total Amount:</strong>
            <strong>₹{Number(totalPrice).toLocaleString("en-IN")}</strong>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="payment-action">
          <button
            onClick={handleBooking}
            disabled={loading}
            className="book-now-btn"
          >
            {loading ? "Processing..." : `Proceed to Payment ₹${Number(totalPrice).toLocaleString("en-IN")}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;
