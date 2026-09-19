import groq from "./aiClient.js";

const systemPrompt = `You are a travel planner for a holiday rental website in India.

Create a day-by-day trip plan from the details the user gives you.

Rules:
1. Give exactly one entry per day of the trip.
2. Each day needs a short title and 3 to 4 activities.
3. Write each activity as "Morning: ...", "Afternoon: ...", or "Evening: ...".
4. Keep the plan inside the budget the user gave, and say roughly what things cost in rupees.
5. Match the activities to the interests the user picked.
6. Only suggest places that really exist in that destination. Do not invent places.
7. Keep the language simple and friendly.
8. Do not use emojis.

Reply with ONLY this JSON shape:
{
  "summary": "two sentences about the trip",
  "days": [
    { "day": 1, "title": "short title", "activities": ["Morning: ...", "Afternoon: ...", "Evening: ..."] }
  ],
  "tips": ["short tip", "short tip", "short tip"]
}`;

const fallbackPlanTrip = (trip) => {
  const numDays = Math.max(1, Math.min(Number(trip.days) || 3, 10));
  const destination = trip.destination || "Destination";
  const interestsList = trip.interests && trip.interests.length > 0
    ? trip.interests.join(" and ")
    : "local sights and culture";

  const activityThemes = [
    {
      title: `Arrival & Exploring ${destination}`,
      morning: `Morning: Arrive in ${destination}, check into your HomelyHub stay, and refresh.`,
      afternoon: `Afternoon: Take a stroll through the local market and enjoy regional cuisine for around Rs 400.`,
      evening: `Evening: Watch the sunset and enjoy a relaxing dinner at a nearby cafe.`,
    },
    {
      title: `Iconic Sights & Highlights`,
      morning: `Morning: Visit the most famous landmark in ${destination} for sightseeing (tickets approx Rs 200).`,
      afternoon: `Afternoon: Explore nearby historic spots and artisan handicraft shops.`,
      evening: `Evening: Savor local street food and experience the vibrant evening atmosphere.`,
    },
    {
      title: `Nature & Adventure Day`,
      morning: `Morning: Start early for an outdoor scenic walk or viewpoint trail.`,
      afternoon: `Afternoon: Enjoy lunch at a popular local eatery focusing on ${interestsList}.`,
      evening: `Evening: Relax at a scenic viewpoint or cafe enjoying the peaceful scenery.`,
    },
    {
      title: `Cultural Immersion & Shopping`,
      morning: `Morning: Visit local heritage sites and art galleries in the city center.`,
      afternoon: `Afternoon: Shop for souvenirs and specialty items in traditional bazaars.`,
      evening: `Evening: Enjoy a farewell dinner with live acoustic music or traditional performances.`,
    },
    {
      title: `Leisure & Departure`,
      morning: `Morning: Enjoy a leisurely breakfast and take last-minute photos around ${destination}.`,
      afternoon: `Afternoon: Check out from your stay and head toward your departure transit.`,
      evening: `Evening: Safe travels back home with great memories from ${destination}.`,
    },
  ];

  const days = [];
  for (let i = 1; i <= numDays; i++) {
    const theme = activityThemes[(i - 1) % activityThemes.length];
    days.push({
      day: i,
      title: `Day ${i}: ${theme.title}`,
      activities: [theme.morning, theme.afternoon, theme.evening],
    });
  }

  return {
    summary: `An exciting ${numDays}-day getaway to ${destination} tailored for ${trip.people || 2} travelers focused on ${interestsList}. Enjoy comfortable stays and curated experiences within your budget of Rs ${trip.budget || 15000}.`,
    days,
    tips: [
      `Book local transit and cab rentals in advance for smoother transfers.`,
      `Carry light cotton clothes for daytime exploring and hydration.`,
      `Try local food specialties recommended by your HomelyHub hosts.`,
    ],
  };
};

const planTrip = async (trip) => {
  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== "dummy_key") {
    try {
      const tripInfo = `- Destination: ${trip.destination}
- Total Budget: Rs ${trip.budget}
- Number of Days: ${trip.days}
- Number of People: ${trip.people}
- Interests: ${(trip.interests || []).join(", ")}`;

      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        max_tokens: 2000,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: tripInfo },
        ],
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (err) {
      console.warn("Groq API call error, falling back to smart planner:", err.message);
      return fallbackPlanTrip(trip);
    }
  }

  return fallbackPlanTrip(trip);
};

export { planTrip };
