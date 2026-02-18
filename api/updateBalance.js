// /api/updateBalance.js
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

const db = admin.firestore();

/**
 * Handler for serverless function
 * Accepts JSON { userId, type: "taskCompleted"|"referral"|"points", value }
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, type, value = 1 } = req.body;

  if (!userId || !type) return res.status(400).json({ error: "Missing userId or type" });

  try {
    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) return res.status(404).json({ error: "User not found" });

    const userData = userSnap.data();
    let increment = 0;

    switch (type) {
      case "taskCompleted":
        increment = 0.5 * value;
        break;
      case "referral":
        increment = 1 * value;
        break;
      case "points":
        increment = value / 1000;
        break;
      default:
        return res.status(400).json({ error: "Invalid type" });
    }

    await userRef.update({
      balanceUSD: (userData.balanceUSD || 0) + increment,
    });

    return res.status(200).json({
      message: "Balance updated",
      added: increment,
      newBalance: (userData.balanceUSD || 0) + increment,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
