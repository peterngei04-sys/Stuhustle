import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";

export default function useUserData() {
  const [data, setData] = useState({
    username: "",
    balanceUSD: 0,
    pendingUSD: 0,
    referrals: 0,
    pointsApproved: 0,
    totalEarnedUSD: 0,
    pointsPending: 0,
    tasksCompleted: 0,
    accountStatus: "active",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true); // in case user changes

    const userRef = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setData({
          username: userData.username || "",
          balanceUSD: userData.balanceUSD || 0,
          pendingUSD: userData.pendingUSD || 0,
          referrals: userData.referrals || 0,
          pointsApproved: userData.pointsApproved || 0,
          totalEarnedUSD: userData.totalEarnedUSD || 0,
          pointsPending: userData.pointsPending || 0,
          tasksCompleted: userData.tasksCompleted || 0,
          accountStatus: userData.accountStatus || "active",
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { data, loading };
}
