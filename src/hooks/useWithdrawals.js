import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function useWithdrawals() {
  const user = auth.currentUser;
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const withdrawalsQuery = query(
      collection(db, "withdrawals"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(withdrawalsQuery, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setWithdrawals(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { withdrawals, loading };
}
