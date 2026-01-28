const express = require("express");
const router = express.Router();
const supabase = require("../lib/supabase");
const prisma = require("../lib/prisma");

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

router.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error: " + error.message });
  }
});

module.exports = router;
