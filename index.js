const express = require("express");
const axios = require("axios");

const API_KEY = api_key
const INTEGRATION_ID = integration_id
const ifameOne =
  "https://accept.paymob.com/api/acceptance/iframes/?payment_token=";
const app = express();
app.use(express.json());

app.post("/charge-wallet", async (req, res) => {
  const amountCents = req.body.amount_cents || "100"; 
  let authToken = "";
  let orderId = "";

  try {
    // First request to get auth token
    const tokenResponse = await axios.post(
      "https://accept.paymob.com/api/auth/tokens",
      {
        api_key: API_KEY,
      }
    );

    authToken = tokenResponse.data.token;
    console.log(authToken);
    // Second request to create an order for wallet charge (no items)
    const orderResponse = await axios.post(
      "https://accept.paymob.com/api/ecommerce/orders",
      {
        auth_token: authToken,
        delivery_needed: "false",
        amount_cents: amountCents,
        currency: "EGP",
        shipping_data: {
          apartment: "N/A",
          email: "user@example.com", // Use actual user email
          floor: "N/A",
          first_name: "User",
          street: "N/A",
          building: "N/A",
          phone_number: "+201234567890", // Use actual user phone number
          postal_code: "00000",
          extra_description: "Wallet charge",
          city: "Cairo",
          country: "EG",
          last_name: "User",
          state: "N/A",
        },
        shipping_details: {
          notes: "Wallet top-up",
          number_of_packages: 1,
          weight: 1,
          weight_unit: "Kilogram",
          length: 1,
          width: 1,
          height: 1,
          contents: "Wallet top-up",
        },
      }
    );

    orderId = orderResponse.data.id;
    console.log(orderId);
    // Third request to get payment token and generate payment iframe link
    const paymentResponse = await axios.post(
      "https://accept.paymob.com/api/acceptance/payment_keys",
      {
        auth_token: authToken,
        amount_cents: amountCents,
        expiration: 3600,
        order_id: orderId,
        billing_data: {
          apartment: "N/A",
          email: "user@example.com", // Use actual user email
          floor: "N/A",
          first_name: "User",
          street: "N/A",
          building: "N/A",
          phone_number: "+201234567890", // Use actual user phone number
          shipping_method: "N/A",
          postal_code: "00000",
          city: "Cairo",
          country: "EG",
          last_name: "User",
          state: "N/A",
        },
        currency: "EGP",
        integration_id: INTEGRATION_ID,
        lock_order_when_paid: "false",
      }
    );

    const paymentToken = paymentResponse.data.token;
    console.log(paymentToken);
 
    return res.json({ payment_url: ifameOne + paymentToken });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
});

app.listen(7070, () => {
  console.log("Server is running on port 7070");
});
