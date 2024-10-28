const SpyfallLocation = require("../models/SpyfallLocation");

async function seedSpyfallLocations(guildId) {
  const locations = [
    { name: "Beach" },
    { name: "Casino" },
    { name: "Circus" },
    { name: "Cruise Ship" },
    { name: "Hospital" },
    { name: "Hotel" },
    { name: "Military Base" },
    { name: "Movie Studio" },
    { name: "Pirate Ship" },
    { name: "Polar Station" },
    { name: "Police Station" },
    { name: "Restaurant" },
    { name: "School" },
    { name: "Space Station" },
    { name: "Submarine" },
    { name: "Supermarket" },
    { name: "Theater" },
    { name: "University" },
    { name: "Zoo" },
    { name: "Airplane" },
    { name: "Bank" },
    { name: "Cathedral" },
    { name: "Corporate Party" },
    { name: "Crusader Army" },
    { name: "Day Spa" },
    { name: "Embassy" },
    { name: "Jail" },
    { name: "Museum" },
    { name: "Passenger Train" },
    { name: "Service Station" },
    { name: "Space Station" },
    { name: "Subway" },
    { name: "The U.N." },
    { name: "World Cup Final" },
  ];

  for (const location of locations) {
    await SpyfallLocation.updateOne(
      { name: location.name },
      { $set: location },
      { upsert: true }
    );
  }

  console.log(`✅ Spyfall Locations seeded for guild: ${guildId}`);
}

module.exports = seedSpyfallLocations;
