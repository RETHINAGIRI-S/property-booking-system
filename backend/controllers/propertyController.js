import { Property } from "../Models/propertyModel.js";
import { APIFeatures } from "../utils/APIFeatures.js";
import imagekit from "../utils/ImagekitIO.js";

// get all properties
const getProperties = async (req, res) => {
  try {
    const features = new APIFeatures(Property.find(), req.query)
      .filter()
      .search()
      .paginate();

    const doc = await features.query;

    res.status(200).json({
      status: "success",
      no_of_responses: doc.length,
      data: doc,
    });
  } catch (error) {
    console.error("Error searching properties: ", error);
    res.status(500).json({ error: "Internal server Error" });
  }
};

// get property by id
const getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ status: "fail", message: "Property not found" });
    }
    res.status(200).json({
      status: "success",
      data: property,
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error.message,
    });
  }
};

// CREATE A PROPERTY - an owner adds his house
const createProperty = async (req, res) => {
  try {
    const {
      propertyName,
      description,
      propertyType,
      roomType,
      extraInfo,
      address,
      amenities,
      checkInTime,
      checkOutTime,
      maximumGuest,
      price,
      images = [],
    } = req.body;

    const uploadedImages = [];

    for (const image of images) {
      if (image.url && (image.url.startsWith("http://") || image.url.startsWith("https://") || image.url.startsWith("data:"))) {
        const result = await imagekit.upload({
          file: image.url,
          fileName: `property_${Date.now()}.jpg`,
          folder: "property_images",
        });
        uploadedImages.push({ url: result.url, public_id: result.fileId });
      } else {
        uploadedImages.push(image);
      }
    }

    const property = await Property.create({
      propertyName,
      description,
      propertyType,
      roomType,
      extraInfo,
      address,
      amenities,
      checkInTime,
      checkOutTime,
      maximumGuest,
      price,
      images: uploadedImages,
      userId: req.user._id || req.user.id,
    });

    res.status(200).json({ status: "success", data: { data: property } });
  } catch (error) {
    console.error("Error creating property", error);
    res.status(404).json({ status: "fail", message: error.message });
  }
};

// GET MY PROPERTIES - the owner's own dashboard
const getUsersProperties = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const property = await Property.find({ userId });
    res.status(200).json({
      status: "success",
      data: property,
    });
  } catch (error) {
    res.status(404).json({ status: "fail", message: error.message });
  }
};

export {
  getProperties,
  getProperty,
  createProperty,
  getUsersProperties,
};
