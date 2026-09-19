import React, { useState } from "react";
import FilterModal from "./FilterModal";
import { useSearchParams } from "react-router-dom";

const Filter = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedFilters = {
    priceRange: {
      min: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : 600,
      max: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : 30000,
    },
    propertyType: searchParams.get("propertyType") || "",
    roomType: searchParams.get("roomType") || "",
    amenities: searchParams.getAll("amenities") || [],
  };

  const handleShowAllPhotos = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFilterChange = (filterName, value) => {
    const newParams = new URLSearchParams(searchParams);

    if (filterName === "minPrice") {
      if (value && value > 600) newParams.set("minPrice", value);
      else newParams.delete("minPrice");
    } else if (filterName === "maxPrice") {
      if (value && value < 30000) newParams.set("maxPrice", value);
      else newParams.delete("maxPrice");
    } else if (filterName === "propertyType") {
      if (value) newParams.set("propertyType", value);
      else newParams.delete("propertyType");
    } else if (filterName === "roomType") {
      if (value && value !== "Anytype") newParams.set("roomType", value);
      else newParams.delete("roomType");
    } else if (filterName === "amenities") {
      newParams.delete("amenities");
      if (Array.isArray(value)) {
        value.forEach((a) => newParams.append("amenities", a));
      }
    }

    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  return (
    <>
      <span
        className="material-symbols-outlined filter"
        onClick={handleShowAllPhotos}
        style={{ cursor: "pointer" }}
      >
        tune
      </span>
      {isModalOpen && (
        <FilterModal
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default Filter;
