import React, { useEffect, useState } from "react";
import "../../css/Accomodation.css";
import ProgressSteps from "../ProgressSteps";
import MyAccomodation from "./MyAccomodation";
import { Link } from "react-router-dom";
import LoadingSpinner from "../LoadingSpinner";
import { axiosInstance } from "../../utils/axios";

const Accomodation = () => {
  const [accomodation, setAccomodation] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyAccommodations = async () => {
      try {
        const res = await axiosInstance.get("/v1/rent/user/myAccommodation");
        const list = res.data?.data || [];
        setAccomodation(list);
      } catch (error) {
        console.error("Error fetching accommodations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyAccommodations();
  }, []);

  return (
    <>
      <ProgressSteps accomodation />
      <div className="accom-container">
        <Link to="/accomodationform">
          <button className="add-new-place">+ Add new place</button>
        </Link>
        {loading && <LoadingSpinner />}
        {accomodation.length === 0 && !loading && (
          <p className="text-center mt-4">Accomodation not available</p>
        )}
        {accomodation.length > 0 && !loading && (
          <MyAccomodation accomodation={accomodation} loading={loading} />
        )}
      </div>
    </>
  );
};

export default Accomodation;
