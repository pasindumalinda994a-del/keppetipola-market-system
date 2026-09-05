import type { ProduceCategory } from "@/lib/produce";

export type ProduceCatalogItem = {
  name: string;
  category: ProduceCategory;
  imageUrl: string;
  lowest: number;
  highest: number;
  average: number;
  change: number;
  status: "Active" | "Inactive";
};

function item(
  name: string,
  category: ProduceCategory,
  lowest: number,
  highest: number,
  average: number,
  change = 0,
  imageUrl = ""
): ProduceCatalogItem {
  return {
    name,
    category,
    imageUrl,
    lowest,
    highest,
    average,
    change,
    status: "Active",
  };
}

function photo(file: string, folder = "/Vegitable-Images"): string {
  return `${folder}/${file}`;
}

/** Main 49 produce items. Produce photos live in public WebP folders. */
export const PRODUCE_CATALOG: ProduceCatalogItem[] = [
  item("Carrot", "Vegetables", 190, 200, 196, 5, photo("Carrots_with_green_tops_isolated_2K_202609051952.webp")),
  item("Cabbage", "Vegetables", 80, 95, 88, -2, photo("Fresh_green_cabbage_isolated_2K_202609051953.webp")),
  item("Leeks", "Vegetables", 220, 245, 232, 8, photo("Fresh_leeks_arranged_horizontally_2K_202609051953.webp")),
  item("Beans", "Vegetables", 280, 310, 295, 12, photo("Fresh_green_beans_arranged_2K_202609051954.webp")),
  item("Tomato", "Vegetables", 150, 175, 162, -4, photo("Fresh_red_tomatoes_arranged_together_2K_202609051954.webp")),
  item("Beetroot", "Vegetables", 160, 180, 170, 3, photo("Fresh_beetroot_on_white_background_2K_202609051955.webp")),
  item("Capsicum", "Vegetables", 350, 390, 370, -6, photo("Three_green_bell_peppers_arranged_2K_202609051955.webp")),
  item("Radish", "Vegetables", 70, 90, 80, 0, photo("Radishes_with_green_leaves_2K_202609051955.webp")),
  item("Brinjal", "Vegetables", 270, 320, 295, 0, photo("Purple_eggplants_arranged_on_white_2K_202609051956.webp")),
  item("Cauliflower", "Vegetables", 300, 350, 325, 0, photo("Fresh_cauliflower_head_on_white_2K_202609051957.webp")),
  item("Cucumber", "Vegetables", 70, 100, 85, 0, photo("Three_cucumbers_on_white_background_2K_202609051957.webp")),
  item("Green Chili", "Vegetables", 400, 420, 410, 0, photo("Green_chilies_isolated_on_white_2K_202609051958.webp")),
  item("Pumpkin", "Vegetables", 150, 150, 150, 0, photo("Pumpkin_on_white_background_2K_202609051959.webp")),
  item("Lady's Fingers", "Vegetables", 150, 160, 155, 0, photo("Green_okra_pods_arranged_2K_202609051959.webp")),
  item("Snake Gourd", "Vegetables", 220, 260, 240, 0, photo("Snake_gourds_arranged_on_white_2K_202609052000.webp")),
  item("Bitter Gourd", "Vegetables", 330, 330, 330, 0, photo("Bitter_gourds_arranged_together_2K_202609052000.webp")),
  item("Yard-Long Beans", "Vegetables", 170, 210, 190, 0, photo("Yard-long_beans_arranged_together_2K_202609052001.webp")),
  item("Ash Plantain", "Vegetables", 150, 150, 150, 0, photo("Green_plantains_arranged_for_grocery_2K_202609052002.webp")),
  item("Ginger", "Vegetables", 580, 600, 590, 0, photo("Fresh_ginger_roots_arranged_2K_202609052003.webp")),
  item("Big Onion", "Vegetables", 280, 280, 280, 0, photo("Red_onions_on_white_background_2K_202609052003.webp")),
  item("Ridge Gourd", "Vegetables", 220, 230, 225, 0, photo("Two_green_ridge_gourds_2K_202609052004.webp")),
  item("Drumsticks", "Vegetables", 130, 150, 140, 0, photo("Green_moringa_pods_arranged_diagonally_2K_202609052004.webp")),
  item("Nookal", "Vegetables", 120, 160, 140, 0, photo("Fresh_kohlrabi_vegetables_on_white_2K_202609052005.webp")),
  item("Athugowa", "Vegetables", 120, 150, 135, 0, photo("Fresh_Chinese_cabbage_isolated_2K_202609052005.webp")),
  item("Potato", "Tubers", 120, 135, 128, 1, photo("Potatoes_on_white_background_2K_202609052052.webp", "/Tuber-Images")),
  item("Potatoes - Import", "Tubers", 190, 190, 190, 0, photo("Potatoes_arranged_on_white_background_2K_202609052053.webp", "/Tuber-Images")),
  item("Manioc", "Tubers", 120, 140, 130, 0, photo("Cassava_roots_arranged_on_white_2K_202609052054.webp", "/Tuber-Images")),
  item("Sweet Potato", "Tubers", 170, 180, 175, 0, photo("Sweet_potatoes_arranged_for_market_2K_202609052054.webp", "/Tuber-Images")),
  item("Kohila", "Tubers", 170, 180, 175, 0, photo("Fresh_Sri_Lankan_kohila_tubers_2K_202609052055.webp", "/Tuber-Images")),
  item("Onion Leaves", "Leafy greens", 120, 140, 130, 0, photo("Bundle_of_green_onion_leaves_2K_202609052108.webp", "/Leaf-Green-Images")),
  item("Mukunuwenna", "Leafy greens", 45, 45, 45, 0, photo("Fresh_green_leaves_arranged_2K_202609052109.webp", "/Leaf-Green-Images")),
  item("Gotukola", "Leafy greens", 65, 65, 65, 0, photo("Fresh_green_Gotukola_leaves_2K_202609052109.webp", "/Leaf-Green-Images")),
  item("Curry Leaves", "Leafy greens", 150, 180, 165, 0, photo("Curry_leaves_on_white_background_2K_202609052110.webp", "/Leaf-Green-Images")),
  item("Spinach", "Leafy greens", 120, 120, 120, 0, photo("Fresh_spinach_leaves_arranged_closeup_2K_202609052111.webp", "/Leaf-Green-Images")),
  item("Water Spinach", "Leafy greens", 45, 45, 45, 0, photo("Water_spinach_bunch_on_white_2K_202609052111.webp", "/Leaf-Green-Images")),
  item("Green Gram", "Grains & dry goods", 720, 720, 720, 0, photo("Green_gram_beans_pile_2K_202609052135.webp", "/Grain-DryGood-Images")),
  item("Cowpea", "Grains & dry goods", 850, 850, 850, 0, photo("Pile_of_dried_cowpeas_2K_202609052135.webp", "/Grain-DryGood-Images")),
  item("Gram", "Grains & dry goods", 355, 355, 355, 0, photo("Dried_chickpeas_arranged_cleanly_2K_202609052136.webp", "/Grain-DryGood-Images")),
  item("Dry Chilies", "Grains & dry goods", 1050, 1050, 1050, 0, photo("Dried_red_chilies_on_white_2K_202609052136.webp", "/Grain-DryGood-Images")),
  item("Lime", "Fruits", 700, 700, 700, 0, photo("Fresh_green_limes_arranged_2K_202609052035.webp", "/Fruit-Images")),
  item("Jackfruit", "Fruits", 60, 100, 80, 0, photo("Jackfruit_on_white_background_2K_202609052036.webp", "/Fruit-Images")),
  item("Banana - Ambul", "Fruits", 180, 200, 190, 0, photo("Ambul_bananas_on_white_background_2K_202609052036.webp", "/Fruit-Images")),
  item("Banana - Sini", "Fruits", 140, 140, 140, 0, photo("Ripe_bananas_on_white_background_2K_202609052036.webp", "/Fruit-Images")),
  item("Kolikuttu", "Fruits", 330, 330, 330, 0, photo("Bunch_of_ripe_bananas_2K_202609052037.webp", "/Fruit-Images")),
  item("Coconut", "Fruits", 140, 145, 142, 0, photo("Two_coconuts_on_white_background_2K_202609052037.webp", "/Fruit-Images")),
  item("Avocado", "Fruits", 80, 120, 100, 0, photo("Three_green_avocados_arranged_together_2K_202609052038.webp", "/Fruit-Images")),
  item("Pineapple", "Fruits", 490, 490, 490, 0, photo("Fresh_pineapple_on_white_background_2K_202609052038.webp", "/Fruit-Images")),
  item("Watermelon", "Fruits", 80, 100, 90, 0, photo("Watermelon_on_white_background_2K_202609052038.webp", "/Fruit-Images")),
  item("Papaya", "Fruits", 200, 210, 205, 0, photo("Fresh_papaya_on_white_background_2K_202609052039.webp", "/Fruit-Images")),
];

export function produceNameRegex(name: string): RegExp {
  return new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
}

export function catalogItemByName(name: string): ProduceCatalogItem | undefined {
  const needle = name.trim().toLowerCase();
  return PRODUCE_CATALOG.find((item) => item.name.toLowerCase() === needle);
}
