import React, { useEffect, useState } from "react";
import { database } from "../../../config/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import {
  Button,
  Col,
  Container,
  Form,
  Modal,
  Row,
  Table,
} from "react-bootstrap";
import { getAuth } from "firebase/auth";

function HistoryAdmin() {
  const [val, setVal] = useState([]);
  const [uidFilter, setUidFilter] = useState("");
  const [kodeFilter, setKodeFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showEditKeterangan, setShowEditKeterangan] = useState(false);
  const [confirmationInput, setConfirmationInput] = useState("");
  const [selectedCodePemesanan, setSelectedCodePemesanan] = useState(null);
  const [showCodePemesananModal, setShowCodePemesananModal] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all"); // Default to show all orders
  const [namaMenuTotalBarangMap, setNamaMenuTotalBarangMap] = useState({});

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

        // Filter orders based on paymentStatusFilter
        const filteredOrders = userOrders.filter((order) => {
          if (paymentStatusFilter === "success") {
            return order.transfer === true;
          } else if (paymentStatusFilter === "not success") {
            return order.transfer !== true;
          }
          return true; // "all" selected
        });

        // Filter orders based on date range
        const startDateTimestamp = startDate
          ? new Date(startDate).getTime()
          : 0;
        const endDateTimestamp = endDate
          ? new Date(endDate).getTime()
          : Infinity;

        const filteredOrdersWithinDateRange = filteredOrders.filter((order) => {
          const orderTimestamp = order.timestamp.seconds * 1000;
          return (
            orderTimestamp >= startDateTimestamp &&
            orderTimestamp <= endDateTimestamp
          );
        });

        setVal(filteredOrdersWithinDateRange);

        // Calculate and store namaMenuTotalBarangMap based on the filtered orders
        const calculatedNamaMenuTotalBarangMap = logNamaMenuTotalBarang(
          filteredOrdersWithinDateRange
        );

        // Convert the sorted array back to a map
        const sortedNamaMenuTotalBarangMap =
          calculatedNamaMenuTotalBarangMap.reduce(
            (acc, { namaMenu, totalBarang }) => {
              acc[namaMenu] = totalBarang;
              return acc;
            },
            {}
          );

        setNamaMenuTotalBarangMap(sortedNamaMenuTotalBarangMap);
      } catch (error) {
        console.error("Error fetching data from Firebase:", error);
      }
    };

    getData();
  }, [auth, paymentStatusFilter, startDate, endDate]);

  // Function to calculate and log the totalBarang for each namaMenu
  const logNamaMenuTotalBarang = (userOrders) => {
    const namaMenuTotalBarangMap = {};

    userOrders.forEach((order) => {
      if (order.orderData) {
        order.orderData.forEach((item) => {
          const { namaMenu, totalBarang } = item;

          // Initialize the map entry for namaMenu if not exists
          if (!namaMenuTotalBarangMap[namaMenu]) {
            namaMenuTotalBarangMap[namaMenu] = 0;
          }

          // Add totalBarang to the existing total for namaMenu
          namaMenuTotalBarangMap[namaMenu] += totalBarang;
        });
      }
    });

    // Convert the map to an array of objects
    const namaMenuTotalBarangArray = Object.entries(namaMenuTotalBarangMap).map(
      ([namaMenu, totalBarang]) => ({
        namaMenu,
        totalBarang,
      })
    );

    // Sort the array in descending order based on totalBarang
    namaMenuTotalBarangArray.sort((a, b) => b.totalBarang - a.totalBarang);

    return namaMenuTotalBarangArray;
  };

  const formatToIDR = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  const filteredOrders = val
    .filter((order) => {
      const timestamp = order.timestamp.seconds * 1000; // Convert timestamp to milliseconds
      const orderDate = new Date(timestamp);

      // Check if the order date is within the selected date range
      const dateFilter =
        (!startDate || orderDate >= new Date(startDate)) &&
        (!endDate || orderDate <= new Date(endDate));

      if (paymentStatusFilter === "success") {
        return (
          order.userId.toLowerCase().includes(uidFilter.toLowerCase()) &&
          order.codePesanan.toLowerCase().includes(kodeFilter.toLowerCase()) &&
          order.transfer === true &&
          dateFilter
        );
      } else if (paymentStatusFilter === "not success") {
        return (
          order.userId.toLowerCase().includes(uidFilter.toLowerCase()) &&
          order.codePesanan.toLowerCase().includes(kodeFilter.toLowerCase()) &&
          order.transfer !== true &&
          dateFilter
        );
      } else {
        // Show all orders when "all" is selected
        return (
          order.userId.toLowerCase().includes(uidFilter.toLowerCase()) &&
          order.codePesanan.toLowerCase().includes(kodeFilter.toLowerCase()) &&
          dateFilter
        );
      }
    })
    .sort((a, b) => {
      // Sort orders by timestamp in descending order (most recent to oldest)
      return b.timestamp.seconds - a.timestamp.seconds;
    });

  const handleOrderCodeClick = (orderCode) => {
    const selectedOrder = filteredOrders.find(
      (order) => order.codePesanan === orderCode
    );
    setSelectedCodePemesanan(selectedOrder);
    setShowCodePemesananModal(true);
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

  const totalHargaFiltered = filteredOrders.reduce((total, order) => {
    return total + order.totalHarga;
  }, 0);

  return (
    <Container>
      <h1>List History Pemesanan CSS</h1>

      <Form>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>
            <b>Masukan UID:</b>
          </Form.Label>
          <Form.Control
            type="text"
            value={uidFilter}
            onChange={(e) => setUidFilter(e.target.value)}
            placeholder="Enter UID"
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>
            <b>Masukan Kode Pemesanan:</b>
          </Form.Label>
          <Form.Control
            type="text"
            value={kodeFilter}
            onChange={(e) => setKodeFilter(e.target.value)}
            placeholder="Enter order code"
          />
        </Form.Group>
        <Row className="mb-3">
          <Form.Group as={Col}>
            <Form.Label htmlFor="startDate">
              <b>Start Date:</b>{" "}
            </Form.Label>
            <Form.Control
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Form.Group>
          <Form.Group as={Col}>
            <Form.Label htmlFor="endDate">
              <b>End Date:</b>{" "}
            </Form.Label>
            <Form.Control
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Form.Group>
        </Row>
        <Form.Group className="mb-3" controlId="paymentStatusFilter">
          <Form.Label>
            <b>Filter by Payment Status:</b>
          </Form.Label>
          <Form.Select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="success">Successful Payment</option>
            <option value="not success">Unsuccessful Payment</option>
          </Form.Select>
        </Form.Group>
      </Form>
      <h4>
        <strong>Total Harga:</strong> {formatToIDR(totalHargaFiltered)}
      </h4>
      <hr />
      <h4>
        <strong>Menu:</strong>
      </h4>
      {Object.entries(namaMenuTotalBarangMap).map(([namaMenu, totalBarang]) => (
        <ul>
          <li style={{ listStyle: "none" }} key={namaMenu}>
            <strong>{namaMenu}:</strong> {totalBarang} stok
          </li>
        </ul>
      ))}
      <hr />

      <div className="mt-3">
        <Table bordered hover>
          <thead>
            <tr>
              <th>Nama Pembeli</th>
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
                  {order.namaUser}
                </td>
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
                  {new Date(order.timestamp.seconds * 1000).toLocaleString()}
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
                  <Button
                    onClick={() => handleOrderCodeClick(order.codePesanan)}
                  >
                    Details
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
        <Modal
          show={showCodePemesananModal}
          onHide={() => setShowCodePemesananModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>CodePemesanan</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedCodePemesanan && (
              <div>
                <p>
                  Waktu Pemesanan:{" "}
                  <strong>
                    {new Date(
                      selectedCodePemesanan.timestamp * 1000
                    ).toLocaleString()}
                  </strong>
                </p>
                <p>
                  Code Pemesanan:{" "}
                  <strong>{selectedCodePemesanan.codePesanan}</strong>
                </p>
                <p>
                  Alamat: <strong>{selectedCodePemesanan.address}</strong>
                </p>
                <p>
                  Status Pengantaran:{" "}
                  <strong>
                    {selectedCodePemesanan.pengantaran
                      ? "Sudah Diterima"
                      : "Dalam Proses"}
                  </strong>
                </p>
                <p>
                  Status Pembayaran:{" "}
                  <strong>
                    {selectedCodePemesanan.transfer ? "Lunas" : "Belum Lunas"}
                  </strong>
                </p>

                <hr className="solid" />

                <div className="container">
                  {selectedCodePemesanan.orderData.map((values, index) => (
                    <div key={index} className="d-flex justify-content-between">
                      <div>
                        <p>
                          <strong>{values.namaMenu}</strong>
                          <br />
                          {values.totalBarang} x {formatToIDR(values.hargaMenu)}
                        </p>
                      </div>
                      <div className="d-flex align-items-end">
                        <p>
                          {formatToIDR(values.hargaMenu * values.totalBarang)}
                        </p>
                      </div>
                    </div>
                  ))}

                  <hr className="solid" />

                  <div className="d-flex justify-content-between">
                    <p>
                      <strong>Total Harga:</strong>
                    </p>
                    <p>
                      {formatToIDR(
                        selectedCodePemesanan.orderData.reduce(
                          (total, values) =>
                            total + values.hargaMenu * values.totalBarang,
                          0
                        )
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Modal.Body>
        </Modal>
      </div>
    </Container>
  );
}

export default HistoryAdmin;
