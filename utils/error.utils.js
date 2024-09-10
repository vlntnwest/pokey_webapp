module.exports.signUpErrors = (err) => {
  let errors = { username: "", email: "", password: "" };

  if (err.message && err.message.includes("username")) {
    errors.username = "username incorrect ou déjà pris";
  }

  if (err.message && err.message.includes("email")) {
    errors.email = "Email incorrect ou déjà pris";
  }

  if (err.message && err.message.includes("password")) {
    errors.password = "Le mot de passe doit faire 6 caractères minimum";
  }

  if (err.code === 11000) {
    if (err.keyPattern && err.keyPattern.username) {
      errors.username = "Ce username est déjà utilisé";
    }
    if (err.keyPattern && err.keyPattern.email) {
      errors.email = "Cet email est déjà utilisé";
    }
  }

  return errors;
};

module.exports.signInErrors = (err) => {
  let errors = { username: "", password: "" };

  if (err.message.includes("username")) errors.username = "Username inconnu";
  if (err.message.includes("password"))
    errors.password = "Le mot de passe ne correspond pas";

  return errors;
};

module.exports.uploadErrors = (err) => {
  let errors = { format: "", maxSize: "" };

  if (err.message.includes("Error: Images only! (jpeg, jpg, png, gif)"))
    errors.format = "Format incompatible";

  if (err.message.includes("File too large"))
    errors.maxSize = "Le fichier dépasse 500ko";

  return errors;
};
