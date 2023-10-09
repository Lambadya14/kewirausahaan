import React, { useEffect, useState } from "react";
import { database } from "../../../config/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { Button, Container, Form, Modal, Table } from "react-bootstrap";
import { getAuth } from "firebase/auth";

function HistoryAdmin() {
  const [val, setVal] = useState([]);
  const [uidFilter, setUidFilter] = useState("");
  const [kodeFilter, setKodeFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showEditKeterangan, setShowEditKeterangan] = useState(false);
  const [confirmationInput, setConfirmationInput] = useState("");

  const handleCloseEditKeterangan = () => setShowEditKeterangan(false);
  const handleShowEditKeterangan = (order) => {
    setSelectedOrder(order);
    setShowEditKeterangan(true);
  };

  const auth = getAuth();
  const value = collection(database, "orders");

  useEffect(() => {
    const getData = async () => {
      try {
        const dbVal = await getDocs(value);
        const userOrders = dbVal.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        setVal(userOrders);
      } catch (error) {
        console.error("Error fetching data from Firebase:", error);
      }
    };
    getData();
  }, [auth]);

  const formatToIDR = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  const filteredOrders = val.filter((order) => {
    return (
      order.userId.toLowerCase().includes(uidFilter.toLowerCase()) &&
      order.codePesanan.toLowerCase().includes(kodeFilter.toLowerCase())
    );
  });

  const handleOrderCodeClick = (orderCode) => {
    const selectedOrder = filteredOrders.find(
      (order) => order.codePesanan === orderCode
    );
    setSelectedOrder(selectedOrder);
  };

  const updateOrderStatus = async () => {
    if (selectedOrder) {
      const orderRef = doc(value, selectedOrder.id);
      const updatedFields = {
        transfer: selectedOrder.transfer, // Keep the previous value
        pengantaran: selectedOrder.pengantaran, // Keep the previous value
      };

      try {
        await updateDoc(orderRef, updatedFields);
        setShowEditKeterangan(false);
      } catch (error) {
        console.error("Error updating order:", error);
      }
    }
  };

  return (
    <Container>
      <h1>List History Pemesanan CSS</h1>

      <Form>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Masukan UID:</Form.Label>
          <Form.Control
            type="text"
            value={uidFilter}
            onChange={(e) => setUidFilter(e.target.value)}
            placeholder="Enter UID"
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Masukan Kode Pemesanan:</Form.Label>
          <Form.Control
            type="text"
            value={kodeFilter}
            onChange={(e) => setKodeFilter(e.target.value)}
            placeholder="Enter order code"
          />
        </Form.Group>
      </Form>
      <div>
        <Table bordered hover>
          <thead>
            <tr>
              <th>UID Pembeli</th>
              <th>Kode Pembelian</th>
              <th>Waktu Pembelian</th>
              <th>Alamat</th>
              <th>No. Telepon</th>
              <th>Total Harga</th>
              <th>Status Transfer</th>
              <th>Status Pengantaran</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td
                  style={
                    order.transfer !== true
                      ? { background: "#FFB4B4" }
                      : { background: "#B4FFC8" }
                  }
                >
                  {order.userId}
                </td>
                <td
                  onClick={() => handleOrderCodeClick(order.codePesanan)}
                  style={
                    order.transfer !== true
                      ? { background: "#FFB4B4" }
                      : { background: "#B4FFC8" }
                  }
                >
                  {order.codePesanan}
                </td>
                <td
                  style={
                    order.transfer !== true
                      ? { background: "#FFB4B4" }
                      : { background: "#B4FFC8" }
                  }
                >
                  {new Date(order.timestamp * 1000).toLocaleString()}
                </td>
                <td
                  style={
                    order.transfer !== true
                      ? { background: "#FFB4B4" }
                      : { background: "#B4FFC8" }
                  }
                >
                  {order.address}
                </td>
                <td
                  style={
                    order.transfer !== true
                      ? { background: "#FFB4B4" }
                      : { background: "#B4FFC8" }
                  }
                >
                  {order.phoneNumber}
                </td>
                <td
                  style={
                    order.transfer !== true
                      ? { background: "#FFB4B4" }
                      : { background: "#B4FFC8" }
                  }
                >
                  {formatToIDR(order.totalHarga)}
                </td>
                <td
                  style={
                    order.transfer !== true
                      ? { background: "#FFB4B4" }
                      : { background: "#B4FFC8" }
                  }
                >
                  {order.transfer !== true ? "Belum Lunas" : "Lunas"}
                </td>
                <td
                  style={
                    order.transfer !== true
                      ? { background: "#FFB4B4" }
                      : { background: "#B4FFC8" }
                  }
                >
                  {order.pengantaran !== true
                    ? "Belum Diterima "
                    : "Sudah Diterima "}
                </td>
                <td>
                  <Button onClick={() => handleShowEditKeterangan(order)}>
                    Update
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Modal
          show={showEditKeterangan}
          onHide={handleCloseEditKeterangan}
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header closeButton style={{ background: "#FFD863" }}>
            <Modal.Title>Perhatian!</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h4>Dengan melakukan ini, maka anda akan mengubah isi database</h4>
            {selectedOrder && (
              <Form.Text>{selectedOrder.codePesanan}</Form.Text>
            )}
            <Form.Check
              type="checkbox"
              label="Pesanan Sudah Sampai"
              checked={selectedOrder?.pengantaran}
              onChange={() => {
                setSelectedOrder({
                  ...selectedOrder,
                  pengantaran: !selectedOrder.pengantaran,
                });
              }}
            />
            <Form.Check
              type="checkbox"
              label="Pembayaran Lunas"
              checked={selectedOrder?.transfer}
              onChange={() => {
                setSelectedOrder({
                  ...selectedOrder,
                  transfer: !selectedOrder.transfer,
                });
              }}
            />
            <Form.Label>
              Ketik&nbsp;
              <span style={{ color: "#ffc107" }}>
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
          </Modal.Body>
          <Modal.Footer>
            <Button
              className="bg-transparent border-0"
              style={{ color: "#000" }}
              onClick={handleCloseEditKeterangan}
            >
              Batal
            </Button>
            <Button
              className="border-0"
              style={{ background: "#FFD863", color: "#000" }}
              onClick={updateOrderStatus}
              disabled={confirmationInput !== "KONFIRMASI"}
            >
              Simpan
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Container>
  );
}

export default HistoryAdmin;
