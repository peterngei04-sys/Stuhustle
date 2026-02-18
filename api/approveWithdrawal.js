// /api/approveWithdrawal.js
import admin from "firebase-admin";

// Initialize Firebase Admin SDK if not already
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { withdrawalId } = req.body;
    if (!withdrawalId) return res.status(400).json({ error: "withdrawalId is required" });

    const withdrawalRef = db.collection("withdrawals").doc(withdrawalId);
    const withdrawalSnap = await withdrawalRef.get();
    if (!withdrawalSnap.exists) return res.status(404).json({ error: "Withdrawal not found" });

    const withdrawal = withdrawalSnap.data();
    if (withdrawal.status === "approved") {
      return res.status(400).json({ error: "Withdrawal already approved" });
    }

    const userRef = db.collection("users").doc(withdrawal.userId);

    // Run transaction to approve and adjust pendingUSD
    await db.runTransaction(async (transaction) => {
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists) throw new Error("User not found");

      const userData = userSnap.data();

      transaction.update(withdrawalRef, { status: "approved", approvedAt: admin.firestore.Timestamp.now() });
      transaction.update(userRef, {
        pendingUSD: Math.max((userData.pendingUSD || 0) - withdrawal.amount, 0),
      });
    });

    return res.status(200).json({ message: "Withdrawal approved successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
