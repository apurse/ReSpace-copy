import { useContext, useCallback } from "react";
import { AuthContext } from "@/app/context/authorisationProvider";

export const useAuth = () => {
  const { loggedIn, user, setUser } = useContext(AuthContext);

  return { loggedIn, user, setUser };
};