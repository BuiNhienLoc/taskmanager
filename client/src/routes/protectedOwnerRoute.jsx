import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

function ProtectedOwnerRoute({ children }) {
  const [user, authLoading] = useAuthState(auth);
  const [roleLoading, setRoleLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const checkOwner = async () => {
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
          const userData = snapshot.docs[0].data();

          console.log("Protected route role:", userData.role);

          setIsOwner(userData.role === "owner");
        } else {
          setIsOwner(false);
        }
      } catch (err) {
        console.log("Protected route error:", err);
        setIsOwner(false);
      } finally {
        setRoleLoading(false);
      }
    };

    checkOwner();
  }, [user, authLoading]);

  if (authLoading || roleLoading) {
    return <div>Loading...</div>;
  }

  if (!user || !isOwner) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedOwnerRoute;