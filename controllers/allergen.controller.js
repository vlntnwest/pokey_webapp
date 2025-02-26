const AllergenModel = require("../models/allergen.model");

module.exports.getAllAllergens = async (req, res) => {
  try {
    const allergens = await AllergenModel.find();
    res.status(200).json(allergens);
  } catch (err) {
    res
      .status(400)
      .json({ error: "Impossible de récupérer les allergènes." + err.message });
  }
};

module.exports.createAllergen = async (req, res) => {
  const { name } = req.body;

  try {
    const allergen = await AllergenModel.create({ name });
    res.status(201).json({ allergen: allergen._id });
  } catch (err) {
    res
      .status(400)
      .json({ error: "Impossible de créer l'allergène." + err.message });
  }
};

module.exports.deleteAllergen = async (req, res) => {
  const { id } = req.params;

  try {
    await AllergenModel.findByIdAndDelete(id);
    res.status(200).json({ message: "Allergène supprimé." });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Impossible de supprimer l'allergène." + err.message });
  }
};
