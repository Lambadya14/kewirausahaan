import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link, useNavigate } from "react-router-dom";
import { MdOutlineLogin, MdOutlineLogout } from "react-icons/md";
import { AiOutlineUserAdd } from "react-icons/ai";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { database } from "../../config/firebase";
import { Button, Container } from "react-bootstrap";

function Navigasi() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [roleAs, setRoleAs] = useState("");
  const navigate = useNavigate();
  const value = collection(database, "users");

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(
      auth,
      (user) => {
        if (user) {
          setIsLoggedIn(true);
          setUserName(user.displayName);
        } else {
          setIsLoggedIn(false);
          setUserName("");
        }

        getData(user);
      },
      (error) => {
        console.error("Firebase Auth State Changed Error:", error);
      }
    );
  }, []);

  const getData = async (user) => {
    try {
      const dbVal = await getDocs(value);
      const userOrders = dbVal.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      if (user) {
        const foundUser = userOrders.find((u) => u.email === user.email);

        if (foundUser) {
          setRoleAs(foundUser.roleAs);
        }
      }
    } catch (error) {
      console.error("Error fetching data from Firebase:", error);
    }
  };

  const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        setIsLoggedIn(false);
        setRoleAs("");
        return navigate("/");
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container fluid>
        <Navbar.Brand as={Link} to="/">
          CSS: Crispy, Sweet & Sip
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          {isLoggedIn ? (
            <>
              <Nav
                className="me-auto my-2 my-lg-0"
                style={{ maxHeight: "100px" }}
                navbarScroll
              >
                <Nav.Link as={Link} to="/">
                  Home
                </Nav.Link>
                {roleAs === "admin" && (
                  <Nav.Link as={Link} to="/dashboard">
                    Dashboard Admin
                  </Nav.Link>
                )}
                <Nav.Link as={Link} to="/history-user">
                  History User
                </Nav.Link>
                {/* <Nav.Link as={Link} to="/profile">
                  Signed in as: {userName}
                </Nav.Link> */}
              </Nav>
              <Button
                onClick={handleSignOut}
                variant="danger"
                className="d-flex align-items-center"
              >
                <MdOutlineLogout style={{ fontSize: "1em" }} />{" "}
                <div>Logout</div>
              </Button>
            </>
          ) : (
            <>
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/">
                  Home
                </Nav.Link>
              </Nav>
              <Button
                as={Link}
                to="/login"
                className="d-flex align-items-center"
              >
                <MdOutlineLogin style={{ fontSize: "1em" }} />
                <div>&nbsp;Login</div>
              </Button>
              <Button
                className="ms-2 d-flex align-items-center"
                as={Link}
                to="/register"
              >
                <AiOutlineUserAdd style={{ fontSize: "1em" }} />{" "}
                <div>&nbsp;Register</div>
              </Button>
            </>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigasi;
