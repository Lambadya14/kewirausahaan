import React, { useState } from "react";
import {
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { Container, Form, Button, Modal } from "react-bootstrap";
import { toast } from "react-toastify";

function Login() {
  // Initialize state variables for email and password
  const [email, setEmail] = useState("");
  const [emailReset, setEmailReset] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const navigate = useNavigate();

  // Function to handle changes in the email input field
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleEmailResetChange = (e) => {
    setEmailReset(e.target.value);
  };

  // Function to handle changes in the password input field
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    // You can perform further actions like sending the email and password to a server for authentication or validation here

    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        navigate("/");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
        // ..
      });
  };

  const handleReset = (e) => {
    e.preventDefault();
    const auth = getAuth();
    sendPasswordResetEmail(auth, emailReset)
      .then(() => {
        toast.success("Email Reset Password telah terkirim!");
        handleClose();
      })
      .catch((error) => {
        // const errorCode = error.code;
        toast.error(error.message);
        // ..
      });
  };
  return (
    <Container>
      <div className="mt-5">
        <h1 className="text-center">Login Form</h1>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter email"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              value={password}
              onChange={handlePasswordChange}
              type="password"
              placeholder="Password"
            />
            <p onClick={handleShow} className="mt-3 d-flex justify-content-end">
              Reset Password
            </p>
          </Form.Group>

          <div className="text-center">
            <Button className="mb-3" variant="primary" type="submit">
              Login
            </Button>
            <p>
              Belum punya akun? Yuk <Link to="/register">Sign Up</Link>
            </p>
            <Link to={"/"}>Back to home</Link>
            <br />
          </div>
        </Form>
      </div>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Reset Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="formBasicEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              value={emailReset}
              onChange={handleEmailResetChange}
              placeholder="Enter email"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleReset}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Login;
