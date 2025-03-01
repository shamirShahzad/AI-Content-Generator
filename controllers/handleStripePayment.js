const asyncHandler = require("express-async-handler");
const calculateNextBillingDate = require("../utils/calculateNextBillingDate");
const shouldRenewSubscriptionPlan = require("../utils/shouldRenewSubscriptionPlan");
const Payment = require("../models/Payment");
const User = require("../models/User");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

//!------------STRIPE PAYMENT--------------------
const handleStripePayment = asyncHandler(async (req, res) => {
  const { amount, subscriptionPlan } = req.body;
  const user = req?.user;
  try {
    //*Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Number(amount) * 100,
      currency: "usd",
      //add some data to the meta object
      metadata: {
        userId: user?._id?.toString(),
        userEmail: user?.email,
        subscriptionPlan,
      },
    });
    //Send the response
    res.json({
      clientSecret: paymentIntent?.client_secret,
      paymentId: paymentIntent?.id,
      metadata: paymentIntent?.metadata,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: error,
    });
  }
});

//!------------Verify Payment--------------------
const verifyPayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
    console.log(paymentIntent);
    if (paymentIntent.status !== "succeeded") {
      // Get info from meta data
      const { subscriptionPlan, userEmail, userId } = paymentIntent?.metadata;
      const userFound = await User.findById(userId);
      if (!userFound) {
        res.status(404);
        throw new Error("User not found for payment verification");
      }
      // Get the payment Details
      const { amount, currency, id } = paymentIntent;
      const formattedAmount = amount / 100;
      console.log("paymentID", id);

      //Create the payment History
      const newPayment = await Payment.create({
        user: userId,
        email: userEmail,
        subscriptionPlan,
        amount: formattedAmount,
        currency,
        status: "success",
        reference: id,
      });

      //Check for subscription plan
      if (subscriptionPlan === "Basic") {
        //Update the user
        const updatedUser = await User.findByIdAndUpdate(userId, {
          subscriptionPlan: "Basic",
          trialPeriod: 0,
          nextBillingDate: calculateNextBillingDate(),
          apiRequestCount: 0,
          monthlyRequestCount: 50,
          $addToSet: { payment: newPayment?._id },
        });
        res.json({
          status: true,
          message: "Payment verified successfully",
          user: updatedUser,
        });
      }

      if (subscriptionPlan === "Premium") {
        //Update the user
        const updatedUser = await User.findByIdAndUpdate(userId, {
          subscriptionPlan: "Premium",
          trialPeriod: 0,
          nextBillingDate: calculateNextBillingDate(),
          apiRequestCount: 0,
          monthlyRequestCount: 100,
          $addToSet: { payment: newPayment?._id },
        });
        res.json({
          status: true,
          message: "Payment verified successfully",
          subscriptionPlan,
          user: updatedUser,
        });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error,
    });
  }
});

//!------------Handle Free Subscription----------
const handleFreeSubscription = asyncHandler(async (req, res) => {
  //Get the login user
  const user = req?.user;

  //Check if user account should be renewed or not
  try {
    if (shouldRenewSubscriptionPlan(user)) {
      //Update user account
      user.subscriptionPlan = "Free";
      user.monthlyRequestCount = 5;
      user.apiRequestCount = 0;
      //Calculate the next billing date
      user.nextBillingDate = calculateNextBillingDate();
      if (user.trialActive) {
        user.trialActive = false;
        user.trialPeriod = 0;
      }

      //create new payment and save into db
      const newPayment = await Payment.create({
        user: user?._id,
        subscriptionPlan: "Free",
        amount: 0,
        status: "success",
        reference: Math.random().toString(36).substring(7),
        monthlyRequestCount: 5,
        currency: "usd",
      });
      user.payment.push(newPayment?._id);
      await user.save();
      //send the response
      res.json({
        status: "success",
        message: "Subscription Plan Updated Successfully",
        user,
      });
    } else {
      return res.status(403).json({
        error: "Subscription renewal not due yet",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error,
    });
  }
});

module.exports = { handleStripePayment, handleFreeSubscription, verifyPayment };
