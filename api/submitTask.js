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
    const { userId, taskId } = req.body;

    if (!userId || !taskId) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    const taskRef = db.collection("tasks").doc(taskId);
    const taskSnap = await taskRef.get();

    if (!taskSnap.exists) {
      return res.status(404).json({ error: "Task not found" });
    }

    const task = taskSnap.data();

    const submissionsRef = db.collection("submissions");

    const existing = await submissionsRef
      .where("userId", "==", userId)
      .where("taskId", "==", taskId)
      .get();

    if (existing.size >= (task.maxSubmissionsPerUser || 1)) {
      return res.status(400).json({ error: "Submission limit reached" });
    }

    let status = "pending";

    if (task.autoApprove && !task.requiresProof) {
      status = "approved";
    }

    const submissionRef = await submissionsRef.add({
      userId,
      taskId,
      reward: task.reward,
      status,
      createdAt: admin.firestore.Timestamp.now(),
    });

    // If auto-approved → update immediately
    if (status === "approved") {
      const userRef = db.collection("users").doc(userId);

      await db.runTransaction(async (transaction) => {
        transaction.update(userRef, {
          balanceUSD: admin.firestore.FieldValue.increment(task.reward),
          totalEarnedUSD: admin.firestore.FieldValue.increment(task.reward),
          tasksCompleted: admin.firestore.FieldValue.increment(1),
        });
      });
    }

    return res.status(200).json({
      message: "Submission recorded",
      status,
      submissionId: submissionRef.id,
    });

  } catch (error) {
    console.error("Submit Task Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
