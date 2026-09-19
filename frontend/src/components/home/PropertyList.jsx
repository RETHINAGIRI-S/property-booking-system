import React, { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import gsap from "gsap";
import "../../css/Home.css";
import { axiosInstance } from "../../utils/axios";
import LoadingSpinner from "../LoadingSpinner";

const Card = ({ id, image, name, address, price }) => {
  return (
    <figure className="property">
      <Link to={`/propertylist/${id}`}>
        <img
          src={image || "/assets/image1.jpeg"}
          alt="Propertyimg"
          style={{ width: "100%", height: "220px", objectFit: "cover" }}
        />
      </Link>
      <h4>{name}</h4>
      <figcaption>
        <main className="propertydetails">
          <h5>{name}</h5>

          <h6>
            <span className="material-symbols-outlined houseicon">
              home_pin
            </span>
            {address}
          </h6>
          <p>
            <span className="price"> ₹{price}</span> per night
          </p>
        </main>
      </figcaption>
    </figure>
  );
};

const PropertyList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProperties, setTotalProperties] = useState(0);

  const lastPage = Math.max(1, Math.ceil(totalProperties / 12));
  const propertyListRef = useRef(null);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
        const response = await axiosInstance.get(`/v1/rent/listing${query}`);
        const data = response.data?.data || [];
        setProperties(data);
        setTotalProperties(response.data?.no_of_responses || data.length);
      } catch (error) {
        console.error("Error loading properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [searchParams]);

  useEffect(() => {
    if (propertyListRef.current && properties.length > 0) {
      gsap.fromTo(
        propertyListRef.current.children,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.05,
          ease: "power2.out",
        }
      );
    }
  }, [properties]);

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage.toString());
    setSearchParams(newParams);
  };

  return (
    <>
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "40vh" }}>
          <LoadingSpinner />
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center my-5">
          <p className="not_found">No properties found matching your criteria</p>
        </div>
      ) : (
        <div className="propertylist" ref={propertyListRef}>
          {properties.map((property) => (
            <Card
              key={property._id}
              id={property._id}
              image={property.images?.[0]?.url}
              name={property.propertyName}
              address={[property.address?.city, property.address?.state, property.address?.pincode]
                .filter(Boolean)
                .join(", ")}
              price={property.price}
              slug={property.slug}
            />
          ))}
        </div>
      )}

      <div className="pagination">
        <button
          className="previous_btn"
          onClick={() => handlePageChange(page - 1)}
          disabled={page <= 1}
        >
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>

        <span className="mx-3 align-self-center">Page {page} of {lastPage}</span>

        <button
          className="next_btn"
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= lastPage || properties.length < 12}
        >
          <span className="material-symbols-outlined">arrow_forward_ios</span>
        </button>
      </div>
    </>
  );
};

export default PropertyList;
