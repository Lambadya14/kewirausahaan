import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { database } from "../../config/firebase";

function Protected({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        return navigate("/");
      }

      // Fetch the user's data from the "users" collection
      const usersCollection = collection(database, "users");
      const q = query(usersCollection, where("email", "==", user.email));

      try {
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          console.error("User data not found.");
          return navigate("/");
        }

        const userData = querySnapshot.docs[0].data();

        if (userData.roleAs === "admin") {
          // User is an admin; render the children
          return;
        } else {
          return navigate("/"); // Redirect to the home page if not an admin
        }
      } catch (error) {
        console.error("Error fetching data from Firebase:", error);
        return navigate("/"); // Redirect to the home page on error
      }
    });

    return () => unsub();
  }, [navigate]);

  return children;
}

export default Protected;
