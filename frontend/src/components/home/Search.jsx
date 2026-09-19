import React, { useState } from "react";
import { DatePicker, Space } from "antd";
import "react-datepicker/dist/react-datepicker.css";
import "../../css/Home.css";
import { useSearchParams } from "react-router-dom";

const Search = () => {
  const { RangePicker } = DatePicker;
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useState({
    city: searchParams.get("city") || "",
    guests: searchParams.get("guests") || "",
    dateIn: searchParams.get("dateIn") || "",
    dateOut: searchParams.get("dateOut") || "",
  });
  const [value, setValue] = useState([]);

  const searchHandler = (e) => {
    if (e) e.preventDefault();
    const newParams = new URLSearchParams(searchParams);

    if (keyword.city) newParams.set("city", keyword.city.trim());
    else newParams.delete("city");

    if (keyword.guests) newParams.set("guests", keyword.guests);
    else newParams.delete("guests");

    if (keyword.dateIn) newParams.set("dateIn", keyword.dateIn);
    else newParams.delete("dateIn");

    if (keyword.dateOut) newParams.set("dateOut", keyword.dateOut);
    else newParams.delete("dateOut");

    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const returnDates = (date, dateString) => {
    setValue([date?.[0], date?.[1]]);
    updateKeyword("dateIn", dateString[0] || "");
    updateKeyword("dateOut", dateString[1] || "");
  };

  const updateKeyword = (field, val) => {
    setKeyword((prevKeyword) => ({
      ...prevKeyword,
      [field]: val,
    }));
  };

  return (
    <div className="searchbar">
      <input
        className="search"
        id="search_destination"
        placeholder="Search destinations"
        type="text"
        value={keyword.city}
        onChange={(e) => updateKeyword("city", e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && searchHandler(e)}
      />
      <Space direction="vertical" size={12}>
        <RangePicker
          value={value}
          format="YYYY-MM-DD"
          picker="date"
          className="date_picker"
          disabledDate={(current) => {
            return current && current.isBefore(Date.now(), "day");
          }}
          onChange={returnDates}
        />
      </Space>
      <input
        className="search"
        id="addguest"
        placeholder="Add guests"
        type="number"
        value={keyword.guests}
        onChange={(e) => updateKeyword("guests", e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && searchHandler(e)}
      />
      <span
        className="material-symbols-outlined searchicon"
        onClick={searchHandler}
        style={{ cursor: "pointer" }}
      >
        search
      </span>
    </div>
  );
};

export default Search;
