const ShopItem = require("../models/ShopItem");

async function seedShopItems(guildId) {
  const items = [
    // Valorant Skins
    {
      itemId: "prime_vandal",
      name: "Prime Vandal",
      price: 1200,
      description:
        "A futuristic skin for the Vandal with a sleek design and special effects.",
      rarity: "Rare",
      type: "Skin",
      category: "Valorant",
    },
    {
      itemId: "reaver_vandal",
      name: "Reaver Vandal",
      price: 1500,
      description:
        "One of the most popular Vandal skins with a haunting aesthetic and special animations.",
      rarity: "Epic",
      type: "Skin",
      category: "Valorant",
    },
    {
      itemId: "sovereign_ghost",
      name: "Sovereign Ghost",
      price: 800,
      description:
        "Golden elegance for the Ghost pistol with unique sound effects.",
      rarity: "Common",
      type: "Skin",
      category: "Valorant",
    },
    {
      itemId: "araxys_operator",
      name: "Araxys Operator",
      price: 2000,
      description:
        "A top-tier sniper skin with alien-like animations and sound effects.",
      rarity: "Legendary",
      type: "Skin",
      category: "Valorant",
    },
    {
      itemId: "glitchpop_bulldog",
      name: "Glitchpop Bulldog",
      price: 900,
      description:
        "A flashy skin for the Bulldog with vibrant colors and cyberpunk vibe.",
      rarity: "Rare",
      type: "Skin",
      category: "Valorant",
    },

    // CS2 Skins
    {
      itemId: "dragon_lore_awp",
      name: "AWP Dragon Lore",
      price: 2500,
      description:
        "A legendary skin for the AWP with dragon designs, a rare and coveted item.",
      rarity: "Legendary",
      type: "Skin",
      category: "CS2",
    },
    {
      itemId: "ak47_redline",
      name: "AK-47 Redline",
      price: 1000,
      description:
        "A simple yet iconic AK-47 skin with red and black color scheme.",
      rarity: "Common",
      type: "Skin",
      category: "CS2",
    },
    {
      itemId: "m4a4_howl",
      name: "M4A4 Howl",
      price: 2200,
      description:
        "A rare and valuable skin for the M4A4 with a striking wolf design.",
      rarity: "Epic",
      type: "Skin",
      category: "CS2",
    },
    {
      itemId: "desert_eagle_kumicho_dragon",
      name: "Desert Eagle Kumicho Dragon",
      price: 800,
      description:
        "A Desert Eagle skin with an intricate dragon design and a metallic finish.",
      rarity: "Rare",
      type: "Skin",
      category: "CS2",
    },
    {
      itemId: "usp_kill_confirmed",
      name: "USP-S Kill Confirmed",
      price: 1100,
      description:
        "A detailed skin for the USP-S with a unique comic-style design.",
      rarity: "Epic",
      type: "Skin",
      category: "CS2",
    },
  ];

  // Upsert each item with guildId included, so changes to price, rarity, etc., get updated
  for (const item of items) {
    await ShopItem.updateOne(
      { itemId: item.itemId, guildId },
      { ...item, guildId },
      { upsert: true }
    );
  }

  console.log(`✅ Shop items seeded with rarity for guild: ${guildId}`);
}

module.exports = seedShopItems;
