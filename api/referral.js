import admin from "firebase-admin";

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
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const { referralCode } = req.body;

    if (!referralCode) {
      return res.status(400).json({ message: "Referral code required" });
    }

    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = userSnap.data();

    if (userData.referredBy) {
      return res.status(400).json({ message: "Referral already used" });
    }

    if (userData.referralCode === referralCode) {
      return res.status(400).json({ message: "Cannot use your own code" });
    }

    const refQuery = await db
      .collection("users")
      .where("referralCode", "==", referralCode)
      .get();

    if (refQuery.empty) {
      return res.status(400).json({ message: "Invalid referral code" });
    }

    const referrerDoc = refQuery.docs[0];
    const referrerRef = referrerDoc.ref;

    // 💰 CONFIGURATION
    const REFERRAL_POINTS = 10;
    const USD_VALUE = REFERRAL_POINTS / 1000; // 1000 points = $1 (change if needed)

    await db.runTransaction(async (transaction) => {

      // Update referrer
      transaction.update(referrerRef, {
        pointsApproved: admin.firestore.FieldValue.increment(REFERRAL_POINTS),
        referrals: admin.firestore.FieldValue.increment(1),
        balanceUSD: admin.firestore.FieldValue.increment(USD_VALUE),
        totalEarnedUSD: admin.firestore.FieldValue.increment(USD_VALUE),
        tasksCompleted: admin.firestore.FieldValue.increment(1), // ✅ increment tasksCompleted
      });

      // Update new user
      transaction.update(userRef, {
        pointsApproved: admin.firestore.FieldValue.increment(REFERRAL_POINTS),
        balanceUSD: admin.firestore.FieldValue.increment(USD_VALUE),
        totalEarnedUSD: admin.firestore.FieldValue.increment(USD_VALUE),
        referredBy: referrerRef.id,
        tasksCompleted: admin.firestore.FieldValue.increment(1), // ✅ increment tasksCompleted
      });

    });

    return res.status(200).json({ message: "Referral successful" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}
