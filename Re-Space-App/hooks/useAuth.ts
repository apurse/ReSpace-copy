import { useContext, useCallback } from "react";
import { AuthContext } from "@/app/context/authorisationProvider";

export const useAuth = () => {
  const { loggedIn, user, setUser, db } = useContext(AuthContext);

  return { loggedIn, user, setUser, db };
};