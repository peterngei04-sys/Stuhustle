// /api/approveTask.js
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
    const { submissionId } = req.body;
    if (!submissionId) return res.status(400).json({ error: "submissionId is required" });

    const submissionRef = db.collection("submissions").doc(submissionId);
    const submissionSnap = await submissionRef.get();
    if (!submissionSnap.exists) return res.status(404).json({ error: "Submission not found" });

    const submission = submissionSnap.data();

    if (submission.status === "approved") {
      return res.status(400).json({ error: "This submission is already approved" });
    }

    const taskRef = db.collection("tasks").doc(submission.taskId);
    const taskSnap = await taskRef.get();
    if (!taskSnap.exists) return res.status(404).json({ error: "Task not found" });

    const task = taskSnap.data();
    const userRef = db.collection("users").doc(submission.userId);

    // Run transaction to safely update submission and user wallet
    await db.runTransaction(async (transaction) => {
      transaction.update(submissionRef, { status: "approved" });

      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists) throw new Error("User not found");

      const userData = userSnap.data();

      transaction.update(userRef, {
        balanceUSD: (userData.balanceUSD || 0) + task.reward,
        totalEarnedUSD: (userData.totalEarnedUSD || 0) + task.reward,
        tasksCompleted: (userData.tasksCompleted || 0) + 1,
      });
    });

    return res.status(200).json({ message: "Task approved and wallet updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
