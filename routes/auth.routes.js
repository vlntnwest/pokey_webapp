const express = require("express");
const router = express.Router();
const supabase = require("../lib/supabase");

router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: "https://example.com/welcome",
      },
    });

    if (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Internal server error: " + error.message });
    }

    res.status(200).json({ data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error: " + error.message });
  }
});

module.exports = router;
