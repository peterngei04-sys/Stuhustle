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
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { submissionId } = req.body;
    if (!submissionId) {
      return res.status(400).json({ error: "submissionId is required" });
    }

    const submissionRef = db.collection("submissions").doc(submissionId);

    await db.runTransaction(async (transaction) => {
      const submissionSnap = await transaction.get(submissionRef);
      if (!submissionSnap.exists) throw new Error("Submission not found");

      const submission = submissionSnap.data();

      if (submission.status === "approved") {
        throw new Error("Already approved");
      }

      const userRef = db.collection("users").doc(submission.userId);

      // Mark submission approved
      transaction.update(submissionRef, {
        status: "approved",
        approvedAt: admin.firestore.Timestamp.now(),
      });

      // Update user safely using increments
      transaction.update(userRef, {
        balanceUSD: admin.firestore.FieldValue.increment(submission.reward),
        totalEarnedUSD: admin.firestore.FieldValue.increment(submission.reward),
        tasksCompleted: admin.firestore.FieldValue.increment(1),
      });
    });

    return res.status(200).json({
      message: "Task approved and wallet updated successfully",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
