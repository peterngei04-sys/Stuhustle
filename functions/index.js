/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// Create a withdrawal request
exports.createPaypalWithdrawal = functions.https.onCall(async (data, context) => {
  const { email, amount } = data;

  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be logged in."
    );
  }

  if (!email || !amount || amount < 2) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Email and amount required, minimum $2."
    );
  }

  const uid = context.auth.uid;
  const userRef = admin.firestore().collection("users").doc(uid);
  const withdrawalRef = admin.firestore().collection("withdrawals").doc();

  try {
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      throw new functions.https.HttpsError("not-found", "User not found");
    }

    const userData = userSnap.data();

    if ((userData.balanceUSD || 0) < amount) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Insufficient balance"
      );
    }

    // Calculate 15% fee
    const fee = 0.15 * amount;
    const netAmount = amount - fee;

    // Save withdrawal request as pending
    await withdrawalRef.set({
      uid,
      email,
      amountRequested: amount,
      fee,
      netAmount,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Deduct from user balance
    await userRef.update({
      balanceUSD: admin.firestore.FieldValue.increment(-amount),
    });

    return { message: "Withdrawal requested successfully", withdrawalId: withdrawalRef.id };
  } catch (error) {
    console.error(error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// Admin approves withdrawal
exports.approvePaypalWithdrawal = functions.https.onCall(async (data, context) => {
  const { withdrawalId } = data;

  // OPTIONAL: Check if context.auth is an admin user

  const withdrawalRef = admin.firestore().collection("withdrawals").doc(withdrawalId);

  try {
    const snap = await withdrawalRef.get();
    if (!snap.exists) {
      throw new functions.https.HttpsError("not-found", "Withdrawal not found");
    }

    await withdrawalRef.update({
      status: "paid",
      paidAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { message: "Withdrawal approved successfully" };
  } catch (error) {
    console.error(error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});
