import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";

function NoTokenAccess({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        return navigate("/");
      }
    });
  }, [navigate]);

  return children;
}

export default NoTokenAccess;
