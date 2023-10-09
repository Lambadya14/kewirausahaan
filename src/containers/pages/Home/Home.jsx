import React, { useEffect, useState } from "react";
import Navbar from "../../../components/atoms/Navigasi";

import { Button, Container, Form, Modal } from "react-bootstrap";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { database } from "../../../config/firebase";
import { getAuth } from "firebase/auth";
import { v4 } from "uuid";
import { HiOutlineMinus, HiOutlinePlus } from "react-icons/hi2";

function Home() {
  const [val, setVal] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [totalBarang, setTotalBarang] = useState(0);
  const [totalHarga, setTotalHarga] = useState(0);
  const [show, setShow] = useState(false);
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const value = collection(database, "daftarMenu");
  const users = collection(database, "users");
  const auth = getAuth();

  useEffect(() => {
    const getData = async () => {
      try {
        const dbVal = await getDocs(value);
        setVal(dbVal.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      } catch (error) {
        console.error("Error fetching data from Firebase:", error);
      }
    };
    getData();
  }, []);

  useEffect(() => {
    const totalCost = Object.keys(quantities).reduce((total, id) => {
      const menu = val.find((values) => values.id === id);
      if (menu) {
        total += menu.hargaMenu * quantities[id];
      }
      return total;
    }, 0);
    setTotalHarga(totalCost);
  }, [quantities, val]);

  useEffect(() => {
    // Fungsi untuk meng-update lebar layar saat jendela diubah ukurannya
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Menambahkan event listener saat komponen dimount
    window.addEventListener("resize", handleResize);

    // Membersihkan event listener saat komponen di-unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const decreaseQuantity = (id) => {
    if (quantities[id] > 0) {
      setQuantities((prevQuantities) => ({
        ...prevQuantities,
        [id]: Math.max((prevQuantities[id] || 0) - 1, 0),
      }));
      updateTotalBarang(id, -1);
    }
  };

  const increaseQuantity = (id) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [id]: (prevQuantities[id] || 0) + 1,
    }));
    updateTotalBarang(id, 1);
  };

  const updateTotalBarang = (id, delta) => {
    setTotalBarang((prevTotalBarang) => prevTotalBarang + delta);
  };

  const handleCheckout = async () => {
    const handleButtonClick = () => {
      // Disable the button
      setIsButtonDisabled(true);

      // Enable the button after 5 seconds
      setTimeout(() => {
        setIsButtonDisabled(false);
      }, 5000);
    };
    handleButtonClick();
    handleClose();

    const orderData = val
      .filter((values) => quantities[values.id] > 0)
      .map((values) => {
        return {
          id: values.id,
          namaMenu: values.namaMenu,
          hargaMenu: +values.hargaMenu,
          kuantitas: +values.kuantitas,
          totalBarang: quantities[values.id],
          fotoMenu: values.fotoMenu,
          namaIMG: values.namaIMG,
        };
      });

    const codePesanan = generateOrderCode();

    const ordersCollection = collection(database, "orders");
    const orderDoc = doc(ordersCollection);

    try {
      const timestamp = Timestamp.now(); // Generate the current timestamp
      await setDoc(orderDoc, {
        userId: auth.currentUser.uid,
        orderData,
        totalBarang,
        codePesanan,
        totalHarga,
        address, // Include the address in the order
        phoneNumber, // Include the phone number in the order
        timestamp, // Include the timestamp in the order
        transfer: false,
        pengantaran: false,
      });

      setQuantities({});
      setTotalBarang(0);
      setTotalHarga(0);
      setAddress(""); // Clear the address after checkout
      setPhoneNumber(""); // Clear the phone number after checkout
    } catch (error) {
      console.error("Error placing order:", error);
    }

    // Close the modal after checkout
  };

  const generateOrderCode = () => {
    const timestamp = new Date().getTime();
    const randomCode = v4();
    return `${randomCode}-${timestamp}`;
  };

  function formatToIDR(number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  }

  return (
    <>
      <Navbar />
      <Container>
        <h1>Snack Tersedia</h1>
        <div
          className="container"
          style={{ maxWidth: "700px", paddingBottom: "90px" }}
        >
          {val.map((values) => (
            <div
              className={
                windowWidth < 321
                  ? "d-grid justify-content-between bg-body mb-3"
                  : "d-flex justify-content-between bg-body mb-3"
              }
              style={{
                borderRadius: "16px",

                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: "cover",
                placeItems: "bottom",
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5) 100%, rgba(0, 0, 0, 0)100%),url(${values.fotoMenu})`,
              }}
              key={values.id}
            >
              <div
                style={{
                  width: "300px",
                }}
                className="d-flex flex-row mt-3 ms-2"
              >
                <div>
                  <b>
                    <p style={{ color: "white" }}>{values.namaMenu}</p>
                  </b>
                  <p style={{ color: "white" }}>
                    {formatToIDR(values.hargaMenu)}
                  </p>
                  {values.kuantitas ? (
                    <p style={{ color: "white" }}>Tersedia</p>
                  ) : (
                    <p style={{ color: "white" }}>Stok Habis</p>
                  )}
                </div>
              </div>

              <div className="d-flex align-items-end justify-content-end">
                <Button
                  className="d-flex align-items-center "
                  onClick={() => decreaseQuantity(values.id)}
                  style={{
                    borderBottomRightRadius: "0px",
                    borderBottomLeftRadius: "0px",
                    borderTopRightRadius: "0px",
                    borderTopLeftRadius: "15px",
                    backgroundColor: "#FF9853",
                    borderColor: "#FF9853",
                  }}
                >
                  <HiOutlineMinus style={{ fontSize: "1.5rem" }} />
                </Button>
                <Form.Control
                  className="rounded-0"
                  style={{
                    // width: "100%",
                    // maxWidth: "80px", // Set the maximum width
                    textAlign: "center",
                    borderColor: "white",
                  }}
                  type="number"
                  value={quantities[values.id] || 0}
                  onChange={(e) => {
                    const newValue = parseInt(e.target.value);

                    // Ensure the new value is greater than or equal to 1
                    if (newValue >= 1) {
                      setQuantities({ ...quantities, [values.id]: newValue });
                      const delta = newValue - (quantities[values.id] || 0);
                      updateTotalBarang(values.id, delta);
                    }
                  }}
                />
                <Button
                  onClick={() => increaseQuantity(values.id)}
                  className="d-flex align-items-center"
                  style={{
                    borderBottomRightRadius: "15px",
                    borderBottomLeftRadius: "0px",
                    borderTopRightRadius: "0px",
                    borderTopLeftRadius: "0px",
                    backgroundColor: "#FF9853",
                    borderColor: "#FF9853",
                  }}
                >
                  <HiOutlinePlus style={{ fontSize: "1.5rem" }} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Container>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Alamat</Form.Label>
              <Form.Control
                type="text"
                placeholder="Masukan alamat anda"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput2">
              <Form.Label>No. HP</Form.Label>
              <Form.Control
                type="text"
                placeholder="Masukan No. HP anda"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={handleCheckout}
            disabled={isButtonDisabled}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
      <div
        style={{ bottom: 0 }}
        className="d-flex position-fixed container-fluid border-top bg-light justify-content-between "
      >
        <div>
          <h2>Total Barang: {totalBarang}</h2>
          <h2>Total Harga: {formatToIDR(totalHarga)}</h2>
        </div>
        <Button
          className="rounded-0"
          onClick={handleShow}
          disabled={totalBarang ? false : true}
          style={{ backgroundColor: "#FF9853", borderColor: "#FF9853" }}
        >
          Checkout
        </Button>
      </div>
    </>
  );
}

export default Home;
