import React, { useState } from "react";
import Navigasi from "../../../components/atoms/Navigasi";
import { Button, Container } from "react-bootstrap";
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
        <Button onClick={handleClickDashboard}>Dashboard Barang</Button>
        <Button onClick={handleClickHistory}>History Pemesanan</Button>
        {componentDashboard && <DashboardAdmin />}
        {componentHistory && <HistoryAdmin />}
      </Container>
    </>
  );
}

export default DashBoard;
