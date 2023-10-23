import React, { useEffect, useRef, useState } from "react";
import { database, storage } from "../../../config/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import Table from "react-bootstrap/Table";
import { Button, Container, Form, Modal } from "react-bootstrap";
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from "firebase/storage";
import { v4 } from "uuid";
import { toast } from "react-toastify";

function DashboardAdmin() {
  const [namaMenu, setNamaMenu] = useState("");
  const [hargaMenu, setHargaMenu] = useState("");
  const [kuantitas, setKuantitas] = useState("");
  const [id, setId] = useState("");
  const [val, setVal] = useState([]);
  const [show, setShow] = useState(false);
  const [imageUpload, setImageUpload] = useState(null);
  const [confirmationInput, setConfirmationInput] = useState("");
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
   const scrollRef = useRef(null);

  const value = collection(database, "daftarMenu");

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

  const handleShowDeleteModal = (itemId) => {
    setSelectedItemId(itemId);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedItemId(null);
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    setNamaMenu("");
    setHargaMenu("");
    setKuantitas("");
    setImageUpload(null);

    const namaImage = `${v4()}`;
    const idMenu = `${v4()}`;
    const imageRef = ref(storage, `images/${namaImage}`);
    await uploadBytes(imageRef, imageUpload);

    const imageListRef = ref(storage, `images/${namaImage}`);
    const imageURL = await getDownloadURL(imageListRef);

    await addDoc(value, {
      namaMenu: namaMenu,
      hargaMenu: hargaMenu,
      kuantitas: kuantitas,
      fotoMenu: imageURL,
      namaIMG: namaImage,
      idMenu: idMenu,
    });
    toast.success("Barang berhasil ditambahkan");
  };

  const handleDelete = async () => {
    if (selectedItemId) {
      const itemToDelete = val.find((item) => item.id === selectedItemId);

      if (!itemToDelete) {
        console.error("Item to delete not found.");
        return;
      }

      const imageRef = ref(storage, `images/${itemToDelete.namaIMG}`);

      try {
        await deleteObject(imageRef); // Delete the associated image in storage
        await deleteDoc(doc(database, "daftarMenu", selectedItemId)); // Delete the item from the database
        setVal((prevVal) =>
          prevVal.filter((item) => item.id !== selectedItemId)
        ); // Update the local state
      } catch (error) {
        console.error("Error deleting menu item:", error);
      }
      handleCloseDeleteModal();
    }
    toast.success("Barang berhasil dihapus");
  };

  const handleEdit = (id, nama, harga, kuantitas, imgUpload) => {
     scrollRef.current.scrollIntoView({ behavior: "smooth" });

    setNamaMenu(nama);
    setHargaMenu(harga);
    setKuantitas(kuantitas);
    setImageUpload(imgUpload);
    setId(id);
    setShow(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const updateData = doc(database, "daftarMenu", id);
    await updateDoc(updateData, {
      namaMenu: namaMenu,
      hargaMenu: hargaMenu,
      kuantitas: kuantitas,
      imageUpload: imageUpload,
    });
    setShow(false);
    setNamaMenu("");
    setHargaMenu("");
    setKuantitas("");
    setImageUpload(null);

    toast.success("Barang berhasil diperbaharui");
  };

  const handleCancel = () => {
    setShow(false);
    setNamaMenu("");
    setHargaMenu("");
    setKuantitas("");
    setImageUpload(null);
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
      <Container ref={scrollRef}>
        <h1>Tambah Menu CSS</h1>
        <div>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nama Menu: </Form.Label>
              <Form.Control
                type="text"
                value={namaMenu}
                placeholder="Nama Menu"
                onChange={(e) => setNamaMenu(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Harga Menu: </Form.Label>
              <Form.Control
                type="number"
                value={hargaMenu}
                placeholder="Harga Menu"
                onChange={(e) => setHargaMenu(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Stok Menu: </Form.Label>
              <Form.Control
                type="number"
                value={kuantitas}
                placeholder="Kuantitas Menu"
                onChange={(e) => setKuantitas(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Upload Gambar</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => setImageUpload(e.target.files[0])}
              />
            </Form.Group>
            {!show ? (
              <Button className="mb-2" variant="success" onClick={handleCreate}>
                Create
              </Button>
            ) : (
              <Button className="mb-2" variant="primary" onClick={handleUpdate}>
                Update
              </Button>
            )}
            <Button
              className="mb-2 mx-2"
              variant="warning"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </Form>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Nama Menu</th>
                <th>Harga</th>
                <th>Kuantitas</th>
                <th>Gambar</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {val.map((values) => (
                <tr key={values.id}>
                  <td>{values.namaMenu}</td>
                  <td>{formatToIDR(values.hargaMenu)}</td>
                  <td>{values.kuantitas}</td>
                  <td>
                    <img src={values.fotoMenu} alt="" width="100px" />
                  </td>
                  <td>
                    <Button
                      variant="danger"
                      onClick={() => handleShowDeleteModal(values.id)}
                    >
                      Delete
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() =>
                        handleEdit(
                          values.id,
                          values.namaMenu,
                          values.hargaMenu,
                          values.kuantitas,
                          values.namaIMG
                        )
                      }
                    >
                      Update
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
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

export default DashboardAdmin;
