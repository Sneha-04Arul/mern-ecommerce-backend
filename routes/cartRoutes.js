const express = require("express");
const Cart = require("../models/Cart");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @route POST /api/cart
 * @desc Add item to cart
 * @access Private
 */
router.post("/", protect, async (req, res) => {
  const { productId, qty } = req.body;

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = new Cart({
      user: req.user._id,
      items: [{ product: productId, qty }],
    });
  } else {
    const itemIndex = cart.items.findIndex(
      (i) => i.product.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].qty += qty;
    } else {
      cart.items.push({ product: productId, qty });
    }
  }

  await cart.save();
  res.status(201).json(cart);
});

/**
 * @route GET /api/cart
 * @desc Get logged-in user's cart
 * @access Private
 */
router.get("/", protect, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product"
  );
  res.json(cart);
});

module.exports = router;
