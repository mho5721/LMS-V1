import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { ProfileContext } from "../plugin/Context";
import { useEffect, useContext, useState } from "react";

function ProtectedRoute({ children, allowedRole }) {
    const [isLoggedIn, user] = useAuthStore((state) => [state.isLoggedIn, state.user]);
    const [profile] = useContext(ProfileContext);
    

  if (!isLoggedIn()) {
    return <Navigate to="/login/" />;
  }

  if (allowedRole === "instructor" && !profile?.is_instructor) {
    return <Navigate to="/" />;
  }

  if (allowedRole === "student" && profile?.is_instructor) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;
