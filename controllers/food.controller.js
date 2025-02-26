const FoodModel = require("../models/food.model");
const AllergenModel = require("../models/allergen.model");

module.exports.getAllFoods = async (req, res) => {
  try {
    const foods = await FoodModel.find();
    res.status(200).json(foods);
  } catch (err) {
    res.status(400).json({
      error: "Impossible de récupérer les alliments. " + err.message,
    });
  }
};

module.exports.getFood = async (req, res) => {
  const { id } = req.params;

  try {
    const food = await FoodModel.findById(id);
    res.status(200).json(food);
  } catch (err) {
    res.status(400).json({
      error: "Impossible de récupérer l'alliment. " + err.message,
    });
  }
};

module.exports.createFood = async (req, res) => {
  const { name } = req.body;
  try {
    const allergens = await AllergenModel.find();

    const allergenList = allergens.map((allergen) => ({
      allergen: allergen.name,
      allergen_id: allergen._id,
      level: "non",
    }));

    const food = await FoodModel.create({ name, allergens: allergenList });
    res.status(201).json({ food });
  } catch (err) {
    res
      .status(400)
      .json({ error: "Impossible de créer l'allument. " + err.message });
  }
};

module.exports.updateFood = async (req, res) => {
  const { id } = req.params;
  const { allergen_id, level } = req.body;

  try {
    const updatedFood = await FoodModel.findOneAndUpdate(
      { _id: id, "allergens._id": allergen_id },
      { $set: { "allergens.$.level": level } },
      { new: true, runValidators: true }
    );

    if (!updatedFood) {
      return res
        .status(404)
        .json({ error: "Aliment ou allergène introuvable." });
    }

    res.status(200).json({
      success: true,
      message: "Allergène mis à jour.",
      food: updatedFood,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: "Impossible de modifier l'allergène. " + err.message,
    });
  }
};

module.exports.deleteFoods = async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res
      .status(400)
      .json({ error: "Aucun ID fourni pour la suppression." });
  }

  try {
    await FoodModel.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ message: "Aliments supprimés avec succès." });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Impossible de supprimer les aliments. " + err.message });
  }
};
