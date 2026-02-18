// /api/submitWithdrawal.js
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
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Unauthorized" });

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const { amount, paypalEmail } = req.body;

    if (!amount || !paypalEmail) return res.status(400).json({ error: "Missing parameters" });

    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return res.status(404).json({ error: "User not found" });

    const userData = userSnap.data();
    if ((userData.balanceUSD || 0) < amount) return res.status(400).json({ error: "Insufficient balance" });

    // Calculate net after 15% fee
    const netAmount = +(amount * 0.85).toFixed(2);

    // Create withdrawal and update pending balance
    await db.runTransaction(async (transaction) => {
      transaction.set(db.collection("withdrawals").doc(), {
        userId,
        username: userData.username || "",
        amount,
        netAmount,
        paypalEmail,
        status: "pending",
        createdAt: admin.firestore.Timestamp.now(),
      });

      transaction.update(userRef, {
        balanceUSD: (userData.balanceUSD || 0) - amount,
        pendingUSD: (userData.pendingUSD || 0) + amount,
      });
    });

    return res.status(200).json({ message: `Withdrawal request of $${amount} submitted successfully` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
