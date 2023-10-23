import React, { useState } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { Button, Container, Form } from "react-bootstrap";
import { addDoc, collection, getFirestore } from "firebase/firestore";

function Register() {
  // Initialize state variables for email and password
  const [isEqualsTo, setIsEqualsTo] = useState(true);
  const [value, setValue] = useState({
    name: "",
    email: "",
    password: "",
    confirmPass: "",
  });
  const navigate = useNavigate();

  const [errorMsg, setErrorMsg] = useState("");

  const db = getFirestore(); // Initialize Firestore

  const passwordMatch = () => {
    return setIsEqualsTo(value.password === value.confirmPass);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    const auth = getAuth();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        value.email,
        value.password
      );
      // Signed in
      const user = userCredential.user;
      await updateProfile(user, {
        displayName: value.name,
      });

      const userDocRef = await addDoc(collection(db, "users"), {
        name: value.name,
        email: value.email,
        roleAs: "user",
      });
      userDocRef();
      navigate("/");
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode, errorMessage);
    }

    if (!value.name || !value.email || !value.password) {
      setErrorMsg("Fill all fields");
      return;
    }
    setErrorMsg("");
  };

  return (
    <Container className="mt-5">
      <h1 className="text-center">Sign Up Form</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formBasicText">
          <Form.Label>Nama</Form.Label>
          <Form.Control
            value={value.name}
            onChange={(e) =>
              setValue((prev) => ({ ...prev, name: e.target.value }))
            }
            type="name"
            placeholder="Masukan Nama"
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control
            value={value.email}
            onChange={(e) =>
              setValue((prev) => ({ ...prev, email: e.target.value }))
            }
            type="email"
            placeholder="Masukan Email"
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            value={value.password}
            onChange={(e) =>
              setValue((prev) => ({ ...prev, password: e.target.value }))
            }
            type="password"
            placeholder="Masukan Password"
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formConfirmPassword">
          <Form.Label>Konfirmasi Password</Form.Label>
          <Form.Control
            value={value.confirmPass}
            type="password"
            placeholder="Sesuaikan Password"
            onChange={(e) =>
              setValue((prev) => ({ ...prev, confirmPass: e.target.value }))
            }
            onBlur={passwordMatch}
          />
        </Form.Group>
        <p style={{ color: "red" }}>{errorMsg}</p>
        {!isEqualsTo && <p style={{ color: "red" }}>Passwords do not match</p>}
        <br />
        <div className="text-center">
          <Button className="mb-3" type="submit">
            Sign Up
          </Button>
          <p>
            Sudah punya akun? Yuk <Link to="/login">Login</Link>
          </p>
          <Link to={"/"}>Back to home </Link>
        </div>
      </Form>
    </Container>
  );
}

export default Register;
