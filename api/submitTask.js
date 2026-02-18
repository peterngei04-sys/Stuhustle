import admin from "firebase-admin";

// Initialize Firebase Admin SDK if not already initialized
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

    // Fetch task details
    const taskRef = db.collection("tasks").doc(taskId);
    const taskSnap = await taskRef.get();
    if (!taskSnap.exists) return res.status(404).json({ error: "Task not found" });

    const task = taskSnap.data();

    // Check user's existing submissions for this task
    const submissionsRef = db.collection("submissions");
    const userSubmissionsSnap = await submissionsRef
      .where("userId", "==", userId)
      .where("taskId", "==", taskId)
      .get();

    if (userSubmissionsSnap.size >= (task.maxSubmissionsPerUser || 1)) {
      return res.status(400).json({ error: "Submission limit reached" });
    }

    // Determine submission status
    let status = "pending"; // Default pending for manual review
    if (task.autoApprove && !task.requiresProof) status = "approved";

    // Record submission
    const submissionRef = await submissionsRef.add({
      userId,
      taskId,
      reward: task.reward,
      status,
      createdAt: admin.firestore.Timestamp.now(),
    });

    // Automatically update user balance if approved
    if (status === "approved") {
      const userRef = db.collection("users").doc(userId);

      await db.runTransaction(async (transaction) => {
        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists) throw new Error("User not found");

        const currentData = userSnap.data();

        transaction.update(userRef, {
          balanceUSD: (currentData.balanceUSD || 0) + task.reward,
          totalEarnedUSD: (currentData.totalEarnedUSD || 0) + task.reward,
          tasksCompleted: (currentData.tasksCompleted || 0) + 1,
        });
      });
    }

    return res.status(200).json({ message: "Submission recorded", status });
  } catch (error) {
    console.error("Submit Task Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
