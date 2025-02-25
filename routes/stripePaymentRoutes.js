const stripePaymentRouter = require("express").Router();
const {
  handleStripePayment,
  handleFreeSubscription,
  verifyPayment,
} = require("../controllers/handleStripePayment");
const isAuthenticated = require("../middlewares/isAuthenticated");

stripePaymentRouter.post("/checkout", isAuthenticated, handleStripePayment);
stripePaymentRouter.post("/free-plan", isAuthenticated, handleFreeSubscription);
stripePaymentRouter.post(
  "/verify-payment/:paymentId",
  isAuthenticated,
  verifyPayment
);

module.exports = stripePaymentRouter;
