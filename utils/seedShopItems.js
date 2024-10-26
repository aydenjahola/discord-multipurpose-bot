const ShopItem = require("../models/ShopItem");

async function seedShopItems() {
  const items = [
    // Valorant Skins
    {
      itemId: "prime_vandal",
      name: "Prime Vandal",
      price: 1200,
      description:
        "A futuristic skin for the Vandal with a sleek design and special effects.",
    },
    {
      itemId: "reaver_vandal",
      name: "Reaver Vandal",
      price: 1500,
      description:
        "One of the most popular Vandal skins with a haunting aesthetic and special animations.",
    },
    {
      itemId: "sovereign_ghost",
      name: "Sovereign Ghost",
      price: 800,
      description:
        "Golden elegance for the Ghost pistol with unique sound effects.",
    },
    {
      itemId: "araxys_operator",
      name: "Araxys Operator",
      price: 2000,
      description:
        "A top-tier sniper skin with alien-like animations and sound effects.",
    },
    {
      itemId: "glitchpop_bulldog",
      name: "Glitchpop Bulldog",
      price: 900,
      description:
        "A flashy skin for the Bulldog with vibrant colors and cyberpunk vibe.",
    },

    // CS2 Skins
    {
      itemId: "dragon_lore_awp",
      name: "AWP Dragon Lore",
      price: 2500,
      description:
        "A legendary skin for the AWP with dragon designs, a rare and coveted item.",
    },
    {
      itemId: "ak47_redline",
      name: "AK-47 Redline",
      price: 1000,
      description:
        "A simple yet iconic AK-47 skin with red and black color scheme.",
    },
    {
      itemId: "m4a4_howl",
      name: "M4A4 Howl",
      price: 2200,
      description:
        "A rare and valuable skin for the M4A4 with a striking wolf design.",
    },
    {
      itemId: "desert_eagle_kumicho_dragon",
      name: "Desert Eagle Kumicho Dragon",
      price: 800,
      description:
        "A Desert Eagle skin with an intricate dragon design and a metallic finish.",
    },
    {
      itemId: "usp_kill_confirmed",
      name: "USP-S Kill Confirmed",
      price: 1100,
      description:
        "A detailed skin for the USP-S with a unique comic-style design.",
    },
  ];

  for (const item of items) {
    await ShopItem.updateOne({ itemId: item.itemId }, item, { upsert: true });
  }

  console.log("✅ Shop items seeded!");
}

module.exports = seedShopItems;
