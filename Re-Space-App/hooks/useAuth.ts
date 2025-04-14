import { useContext, useCallback } from "react";
import { AuthContext } from "@/app/context/authorisationProvider";

export const useAuth = () => {
  const { loggedIn } = useContext(AuthContext);

  return { loggedIn };
};