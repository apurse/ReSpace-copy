import { useContext } from "react";
import { AuthContext } from "@/app/context/authorisationProvider";
import * as Crypto from 'expo-crypto';

export const useAuth = () => {
  const { user, setUser, db } = useContext(AuthContext);

  /**
  * Grab instance of the entered password and hash it
  * @param password The inputted password
  * @returns hashedPassword | The hashed password
  */
  const hashPassword = async (password: string) => {
    const passwordInstance = password;
    const hashedPassword = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA512,
      passwordInstance
    )
    return hashedPassword;
  }

  return { user, setUser, db, hashPassword };
};