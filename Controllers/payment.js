import Stripe from "stripe";
import { Payment } from "../Models/Payment.js";
import dotenv from "dotenv";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// checkout
export const checkout = async (req, res) => {
  try {
    const { amount, cartItems, userShipping, userId } = req.body;

    // Check if userShipping is too large for metadata
    const userShippingString = JSON.stringify(userShipping);
    if (userShippingString.length > 500) {
      const minimalShipping = {
        fullName: userShipping.fullName,
        phoneNumber: userShipping.phoneNumber,
        pincode: userShipping.pincode,
      };

      var metadata = {
        userId: userId,
        itemsCount: cartItems.length.toString(),
        userShipping: JSON.stringify(minimalShipping),
      };
    } else {
      var metadata = {
        userId: userId,
        itemsCount: cartItems.length.toString(),
        userShipping: userShippingString,
      };
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "inr",
      metadata: metadata,
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: amount,
      payStatus: "created",
    });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ error: error.message });
  }
};

// verify , save to db
export const verify = async (req, res) => {
  try {
    const { paymentIntentId, amount, orderItems, userId, userShipping } =
      req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return res
        .status(400)
        .json({ message: "Payment not successful", success: false });
    }

    let orderConfirm = await Payment.create({
      orderId: paymentIntent.id,
      paymentId: paymentIntent.id,
      amount,
      orderItems,
      userId,
      userShipping,
      payStatus: "paid",
    });

    res.json({ message: "payment successfull..", success: true, orderConfirm });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ error: error.message });
  }
};

// user order
export const userOrder = async (req, res) => {
  try {
    let userId = req.user._id.toString();
    let orders = await Payment.find({ userId: userId }).sort({ orderDate: -1 });
    res.json(orders);
  } catch (error) {
    console.error("User order error:", error);
    res.status(500).json({ error: error.message });
  }
};

// All order's
export const allOrders = async (req, res) => {
  try {
    let orders = await Payment.find().sort({ orderDate: -1 });
    res.json(orders);
  } catch (error) {
    console.error("All orders error:", error);
    res.status(500).json({ error: error.message });
  }
};
