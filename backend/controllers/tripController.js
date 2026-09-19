import { Property } from "../Models/propertyModel.js";
import { planTrip } from "../ai/tripPlanner.js";
import { generateDescription } from "../ai/generateDescription.js";

const createTripPlan = async (req, res) => {
  try {
    const { destination, budget, days, people, interests } = req.body;

    if (!destination || !budget || !days || !people) {
      return res.status(400).json({
        status: "fail",
        message: "Please fill in destination, budget, days, and people",
      });
    }

    const plan = await planTrip({
      destination,
      budget,
      days,
      people,
      interests: interests || [],
    });

    const perNight = Number(budget) / Number(days);
    const searchRegex = new RegExp(destination.trim(), "i");

    let properties = await Property.find({
      $or: [
        { "address.city": searchRegex },
        { "address.state": searchRegex },
        { "address.area": searchRegex },
        { propertyName: searchRegex },
      ],
      price: { $lte: perNight * 1.5 },
    }).limit(6);

    // If none found in that specific location, fetch general budget-friendly recommendations
    if (properties.length === 0) {
      properties = await Property.find({
        price: { $lte: perNight * 1.5 },
      }).limit(6);
    }

    // If still empty, return top 6 properties
    if (properties.length === 0) {
      properties = await Property.find().limit(6);
    }

    res.status(200).json({
      status: "success",
      data: { plan, properties, perNight },
    });
  } catch (error) {
    console.error("createTripPlan error:", error);
    res.status(500).json({
      status: "fail",
      message: "Could not create a trip plan, please try again ",
    });
  }
};

const writeDescription = async (req, res) => {
  try {
    let description;
    try {
      description = await generateDescription(req.body);
    } catch (err) {
      const p = req.body;
      description = `Experience a relaxing stay at ${p.propertyName || "this lovely property"}. Located in ${p.address?.city || "a prime neighborhood"}, this ${p.propertyType || "stay"} accommodates up to ${p.maximumGuest || 2} guests with top amenities and great comfort.`;
    }

    res.status(200).json({ status: "success", data: { description } });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: "Could not generate a description ",
    });
  }
};

export { createTripPlan, writeDescription };
