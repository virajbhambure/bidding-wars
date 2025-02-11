import React from "react";
import Homepage from "./pages/Homepage";
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/navbar";
import CreatePost from "./components/CreatePost";
import { Toaster } from "react-hot-toast";
import SingleRoom from "./pages/SingleRoom";
import ScrollToTop from "./components/ScrollToTop";
// import MyOrders from "./pages/MyOrders";
import CancelPage from "./pages/CancelPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";

const App = () => {
  return (
    <>
      <Navbar />
      <ScrollToTop />
      <Routes>
        <Route path="/" Component={Homepage} />
        {/* <Route path="/my-orders" Component={MyOrders} /> */}
        <Route path="/create-room" Component={CreatePost} />
        <Route path="/room/:id" Component={SingleRoom} />
        <Route path="/cancel" Component={CancelPage} />
        <Route path="/success" Component={OrderSuccessPage} />
      </Routes>
      <Toaster />
    </>
  );
};

export default App;
