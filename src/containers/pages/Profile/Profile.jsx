import React, { useEffect, useRef, useState } from "react";
import Navigasi from "../../../components/atoms/Navigasi";
import {
  deleteUser,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
} from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Col, Container, Image, Modal, Row } from "react-bootstrap";
import { Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Profile() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [photoURL, setPhotoURL] = useState("");

  const [newDisplayName, setNewDisplayName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [profilePictureUpdated, setProfilePictureUpdated] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showKeluar, setShowKeluar] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const [emailReset, setEmailReset] = useState("");

  const handleCloseReset = () => setShowResetPassword(false);
  const handleShowResetPassword = () => setShowResetPassword(true);
  const handleCloseKeluar = () => setShowKeluar(false);
  const handleShowKeluar = () => setShowKeluar(true);

  const handleEmailResetChange = (e) => {
    setEmailReset(e.target.value);
  };

  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleEditProfile = () => {
    setEditProfile(true);
  };
  const batalEditProfile = () => {
    setEditProfile(false);
  };

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setDisplayName(user?.displayName || "");
        setEmail(user?.email || "");
        setPhotoURL(user?.photoURL || ""); // Set the photoURL on each page load
      }
    });
  }, []);

  const uploadProfilePicture = async () => {
    if (selectedFile) {
      const auth = getAuth();
      const user = auth.currentUser;
      const storage = getStorage();
      const storageRef = ref(storage, `imageProfile/${user.uid}`);

      const uploadTask = uploadBytes(storageRef, selectedFile);

      try {
        const snapshot = await uploadTask;
        const downloadURL = await getDownloadURL(snapshot.ref);

        const updateData = {
          photoURL: downloadURL,
          displayName: newDisplayName || displayName, // Use the existing displayName if newDisplayName is empty
        };

        updateProfile(user, updateData)
          .then(() => {
            setDisplayName(updateData.displayName); // Update the display name
            setPhotoURL(updateData.photoURL); // Update the photo URL
            setProfilePictureUpdated(true);
            if (fileInputRef.current) {
              fileInputRef.current.value = ""; // Reset the value of the input to empty
            }
            toast.success("Data diri berhasil diubah");
          })
          .catch((error) => {
            console.error("Error updating profile:", error);
          });
      } catch (error) {
        console.error("Error uploading profile picture:", error);
      }
    } else {
      // If no new picture is selected, only update the display name
      const auth = getAuth();
      const user = auth.currentUser;

      // Always update the display name
      updateProfile(user, {
        displayName: newDisplayName,
      })
        .then(() => {
          setDisplayName(newDisplayName); // Update the display name
          setProfilePictureUpdated(true);
          toast.success("Data diri berhasil diubah");
        })
        .catch((error) => {
          console.error("Error updating profile:", error);
        });
    }
  };

  const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        return navigate("/");
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  const handleReset = (e) => {
    e.preventDefault();
    const auth = getAuth();
    sendPasswordResetEmail(auth, emailReset)
      .then(() => {
        toast.success("Email Reset Password telah terkirim!");
        handleCloseReset();
      })
      .catch((error) => {
        // const errorCode = error.code;
        toast.error(error.message);
      });
  };

  return (
    <>
      <Navigasi />

      <Container>
        <div className="mt-5 container" style={{ maxWidth: "700px" }}>
          <h1>Profile</h1>

          <Row className="mt-3">
            <Col>
              <p onClick={handleEditProfile}>Edit Profil</p>
              <hr />
              <p onClick={handleShowKeluar}>Keluar</p>
              <hr />
              <p onClick={handleShowResetPassword}>Reset Password</p>
            </Col>
            <Col>
              <Form>
                <div className="d-flex justify-content-center">
                  <Image
                    src={photoURL || ""}
                    roundedCircle
                    width={100}
                    height={100}
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <Form.Group className="mb-3">
                  <Form.Label>Nama</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={displayName}
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Alamat Email</Form.Label>
                  <Form.Control type="text" placeholder={email} />
                </Form.Group>
                {editProfile === true ? (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Ganti Foto Profil</Form.Label>
                      <Form.Control
                        type="file"
                        onChange={(e) => {
                          setSelectedFile(e.target.files[0]);
                          setProfilePictureUpdated(false);
                        }}
                        ref={fileInputRef}
                      />
                    </Form.Group>

                    <div className="d-flex justify-content-around">
                      <Button variant="secondary" onClick={batalEditProfile}>
                        Batal
                      </Button>
                      <Button variant="primary" onClick={uploadProfilePicture}>
                        Simpan
                      </Button>
                    </div>
                  </>
                ) : (
                  <></>
                )}
              </Form>
            </Col>
          </Row>
        </div>
      </Container>
      <Modal
        show={showKeluar}
        onHide={handleCloseKeluar}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Hapus Akun</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <strong>Apakah anda yakin mau Logout?</strong>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseKeluar}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSignOut}>
            Hapus
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showResetPassword}
        onHide={handleCloseReset}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Konfirmasi Reset Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Masukan Alamat Email:
          <Form.Control
            value={emailReset}
            onChange={handleEmailResetChange}
            type="email"
          />
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseReset}>
            Close
          </Button>
          <Button variant="primary" onClick={handleReset}>
            Kirim
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Profile;
