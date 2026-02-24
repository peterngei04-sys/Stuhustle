import crypto from "crypto";
import { db } from "../src/firebase"; 
import { doc, updateDoc, increment, getDoc, setDoc } from "firebase/firestore";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  try {
    const { user_id, reward, transaction_id } = req.body;

    if (!user_id || !reward || !transaction_id)
      return res.status(400).send("Missing params");

    const txRef = doc(db, "transactions", transaction_id);
    const txSnap = await getDoc(txRef);

    if (txSnap.exists()) return res.status(200).send("Duplicate ignored");

    const userRef = doc(db, "users", user_id);

    await updateDoc(userRef, {
      balanceUSD: increment(Number(reward)),
      tasksCompleted: increment(1),
    });

    await setDoc(txRef, {
      user_id,
      reward,
      network: "AppsPrize",
      createdAt: new Date(),
    });

    return res.status(200).send("OK");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
}
