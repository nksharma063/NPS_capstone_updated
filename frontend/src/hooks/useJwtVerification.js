import { useState, useEffect } from "react";
import axios from "axios";

const useJwtVerification = () => {
  const [isTokenValid, setIsTokenValid] = useState(false);

  useEffect(() => {
    const verifyJwtToken = async () => {
      try {
        const token = localStorage.getItem("jwtToken");

        if (!token) {
          setIsTokenValid(false); 
          return;
        }
        const response = await axios.post(
          "http://localhost:3001/auth/verifyjwt",
          {
            token: token,
          }
        );
        setIsTokenValid(true);
      } catch (error) {
        console.error("Error verifying JWT token:", error);
        setIsTokenValid(false);
      }
    };

    verifyJwtToken();

    return () => {};
  }, []);

  return isTokenValid;
};

export default useJwtVerification;
