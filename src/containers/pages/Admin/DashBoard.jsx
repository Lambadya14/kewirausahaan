import React, { useState } from "react";
import Navigasi from "../../../components/atoms/Navigasi";
import { Button, Container, Dropdown } from "react-bootstrap";
import DashboardAdmin from "./DashboardAdmin";
import HistoryAdmin from "./HistoryAdmin";

function DashBoard() {
  const [componentDashboard, setComponentDashboard] = useState(true);
  const [componentHistory, setComponentHistory] = useState(false);

  const handleClickDashboard = () => {
    setComponentHistory(false);
    setComponentDashboard(true);
  };

  const handleClickHistory = () => {
    setComponentHistory(true);
    setComponentDashboard(false);
  };

  return (
    <>
      <Navigasi />
      <Container>
        <Dropdown className="mt-3">
          <Dropdown.Toggle variant="success" id="dropdown-basic">
            Pilih Component
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={handleClickDashboard}>
              Dashboard Barang
            </Dropdown.Item>
            <Dropdown.Item onClick={handleClickHistory}>
              History Pemesanan
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        {componentDashboard && <DashboardAdmin />}
        {componentHistory && <HistoryAdmin />}
      </Container>
    </>
  );
}

export default DashBoard;
