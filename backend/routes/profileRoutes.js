const express = require("express");
const router = express.Router();
const { protect, allowRoles } = require("../middleware/authMiddleware");
const prisma = require("../config/db");

// Create company profile
router.post("/company", protect, allowRoles("company"), async (req, res) => {
  try {
    const { companyName, industry, website } = req.body;

    if (!companyName) {
      return res.status(400).json({ message: "Company name is required" });
    }

    // Check if profile already exists
    const existing = await prisma.companyProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "Company profile already exists" });
    }

    const profile = await prisma.companyProfile.create({
      data: {
        userId: req.user.id,
        companyName,
        industry,
        website,
        isApproved: true,
      },
    });

    res.status(201).json({ message: "Company profile created", profile });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
