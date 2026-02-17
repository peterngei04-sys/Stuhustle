const admin = require("firebase-admin");

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

module.exports = async (req, res) => {
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

    await db.runTransaction(async (transaction) => {
      transaction.update(referrerRef, {
        points: admin.firestore.FieldValue.increment(10),
        referralCount: admin.firestore.FieldValue.increment(1),
        referralEarnings: admin.firestore.FieldValue.increment(10),
      });

      transaction.update(userRef, {
        points: admin.firestore.FieldValue.increment(10),
        referredBy: referrerRef.id,
      });

      const claimRef = db.collection("referralClaims").doc();
      transaction.set(claimRef, {
        referrerId: referrerRef.id,
        referredUserId: userId,
        reward: 10,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    return res.status(200).json({ message: "Referral successful" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
