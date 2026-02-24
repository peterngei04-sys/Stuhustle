import { db } from "../src/firebase";
import { doc, updateDoc, increment, getDoc, setDoc } from "firebase/firestore";

export default async function handler(req, res) {
  try {
    const { externalIdentifier, payout, transaction_id } = req.query;

    if (!externalIdentifier || !payout || !transaction_id)
      return res.status(400).send("Missing parameters");

    const txRef = doc(db, "transactions", transaction_id);
    const txSnap = await getDoc(txRef);

    if (txSnap.exists()) return res.status(200).send("Duplicate ignored");

    const userRef = doc(db, "users", externalIdentifier);

    await updateDoc(userRef, {
      balanceUSD: increment(Number(payout)),
      tasksCompleted: increment(1),
    });

    await setDoc(txRef, {
      user_id: externalIdentifier,
      reward: payout,
      network: "ayeT",
      createdAt: new Date(),
    });

    return res.status(200).send("OK");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
}
