import React, { useEffect, useState } from "react";
import Navbar from "../../../components/atoms/Navigasi";
import { database } from "../../../config/firebase";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { Button, Container, Form, Modal } from "react-bootstrap";
import { getAuth } from "firebase/auth";
import CopyToClipboard from "react-copy-to-clipboard";
import { MdOutlineContentCopy } from "react-icons/md";

function HistoryUser() {
  const [val, setVal] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmationInput, setConfirmationInput] = useState("");

  const auth = getAuth();
  const value = collection(database, "orders");

  useEffect(() => {
    const getData = async () => {
      try {
        const dbVal = await getDocs(value);
        const userOrders = dbVal.docs
          .map((doc) => ({ ...doc.data(), id: doc.id }))
          .filter((order) => order.userId === auth.currentUser.uid);
        setVal(userOrders);
      } catch (error) {
        console.error("Error fetching data from Firebase:", error);
      }
    };
    getData();
  }, [auth]);

  const groupOrdersByTimestamp = (orders) => {
    const groupedOrders = {};
    orders.forEach((order) => {
      const timestamp = order.timestamp.seconds;
      if (!groupedOrders[timestamp]) {
        groupedOrders[timestamp] = [];
      }
      groupedOrders[timestamp].push(order);
    });
    return groupedOrders;
  };

  function formatToIDR(number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  }

  const handleShowDeleteModal = (orderId) => {
    setSelectedOrderId(orderId);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedOrderId(null);
  };

  const handleDelete = async () => {
    if (selectedOrderId) {
      const orderRef = doc(database, "orders", selectedOrderId);
      try {
        await deleteDoc(orderRef);
        // Update the local state by filtering out the deleted order
        setVal((prevVal) =>
          prevVal.filter((order) => order.id !== selectedOrderId)
        );
        setSelectedOrderId(null);
        setShowDeleteModal(false);
      } catch (error) {
        console.error("Error deleting order:", error);
      }
    }
  };

  return (
    <>
      <Navbar />
      <Container>
        <h1>History CSS</h1>
        <h3>
          <span style={{ color: "#dc3545" }}>
            <b>Catatan! </b>
          </span>
        </h3>
        <h5>
          <span style={{ color: "#dc3545" }}>
            <b>
              Setelah melakukan pemesanan, diharapkan untuk melaporkan Kode
              Pemesanan dan Bukti Transfer <br />
              ke Admin agar menu yang dipesan akan segera diproses&nbsp;
            </b>
          </span>
        </h5>

        <div>
          {Object.entries(groupOrdersByTimestamp(val))
            .sort((a, b) => b[0] - a[0])
            .map(([timestamp, orders]) => (
              <div
                bg="primary"
                className="container  mb-3 rounded-3 shadow"
                key={timestamp}
                style={{
                  maxWidth: "700px",
                  background: "#F1F1F1",
                  paddingTop: "10px",
                }}
              >
                <div className="d-flex justify-content-between">
                  <h3>Struk Pemesanan</h3>
                  <Button
                    onClick={() => handleShowDeleteModal(orders[0].id)} // Show the delete confirmation modal
                    variant="danger"
                  >
                    Batalkan Pesanan
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      const openWhatsApp = () => {
                        const message = `Halo admin, ini kode pemesanan saya:\n${orders[0].codePesanan}`;
                        const phoneNumber = process.env.REACT_APP_phoneNumber; // Replace with the recipient's phone number
                        const whatsappURL = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(
                          message
                        )}`;
                        window.open(whatsappURL, "_blank");
                      };
                      openWhatsApp();
                    }}
                  >
                    Contact Admin: Salsa
                  </Button>
                </div>
                <div>
                  <p>
                    Waktu Pemesanan:
                    <strong>
                      <p>{new Date(timestamp * 1000).toLocaleString()}</p>
                    </strong>
                  </p>
                </div>
                <div>
                  <p>
                    Code Pemesanan:
                    <br /> <strong>{orders[0].codePesanan}</strong>
                    <CopyToClipboard text={orders[0].codePesanan}>
                      <Button className="bg-transparent border-0 align-items-center">
                        <MdOutlineContentCopy
                          style={{ color: "black" }}
                          size={20}
                        />
                      </Button>
                    </CopyToClipboard>
                  </p>
                </div>
                <div>
                  <p>
                    <strong> Alamat:</strong>
                    <p>{orders[0].address}</p>
                  </p>
                </div>
                <div>
                  <p>
                    <strong> Status Pengantaran:</strong>
                    <p>
                      {orders[0].transfer === false
                        ? "Dalam Proses"
                        : "Sudah Diterima"}
                    </p>
                  </p>
                </div>
                <div>
                  <p>
                    <strong> Status Pembayaran:</strong>
                    <p>
                      {orders[0].transfer === false ? "Belum Lunas" : "Lunas"}
                    </p>
                  </p>
                </div>
                <hr className="solid" />

                <div className="container">
                  {orders.map((order, index) => (
                    <div key={order.id}>
                      {order.orderData.map((values, subIndex) => (
                        <>
                          <div className="d-flex justify-content-between">
                            <div>
                              <p>
                                <strong>{values.namaMenu}</strong>
                                <p>
                                  {values.totalBarang} x{" "}
                                  {formatToIDR(values.hargaMenu)}
                                </p>
                              </p>
                            </div>
                            <div className="d-flex align-items-end">
                              <p>
                                {formatToIDR(
                                  values.hargaMenu * values.totalBarang
                                )}
                              </p>
                            </div>
                          </div>
                        </>
                      ))}
                      <hr className="solid" />
                      <div className="d-flex justify-content-between">
                        <p>
                          <strong>Total Harga:</strong>
                        </p>
                        <p>
                          {formatToIDR(
                            order.orderData.reduce(
                              (total, values) =>
                                total + values.hargaMenu * values.totalBarang,
                              0
                            )
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
          <Modal.Header closeButton>
            <Modal.Title>Konfirmasi Hapus Pesanan</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Apakah Anda yakin ingin menghapus pesanan ini?
            <Form.Group>
              <Form.Label>
                Ketik&nbsp;
                <span style={{ color: "#dc3545" }}>
                  <b>KONFIRMASI&nbsp;</b>
                </span>
                untuk melanjutkan proses
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="KONFIRMASI"
                value={confirmationInput}
                onChange={(e) => setConfirmationInput(e.target.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseDeleteModal}>
              Batal
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={confirmationInput !== "KONFIRMASI"}
            >
              Hapus Pesanan
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
}

export default HistoryUser;
