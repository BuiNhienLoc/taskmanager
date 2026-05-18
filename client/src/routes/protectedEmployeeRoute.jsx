import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

function ProtectedEmployeeRoute({ children }) {
  const [user, authLoading] = useAuthState(auth);
  const [roleLoading, setRoleLoading] = useState(true);
  const [isEmployee, setIsEmployee] = useState(false);

  useEffect(() => {
    const checkEmployee = async () => {
      if (authLoading) return;

      if (!user) {
        setRoleLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "users"),
          where("uid", "==", user.uid)
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const role = snapshot.docs[0].data().role;
          setIsEmployee(role === "employee" || role === "owner");
        } else {
          setIsEmployee(false);
        }
      } catch (err) {
        console.error("ProtectedEmployeeRoute error:", err);
        setIsEmployee(false);
      } finally {
        setRoleLoading(false);
      }
    };

    checkEmployee();
  }, [user, authLoading]);

  if (authLoading || roleLoading) {
    return <div>Loading...</div>;
  }

  if (!user || !isEmployee) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedEmployeeRoute;
