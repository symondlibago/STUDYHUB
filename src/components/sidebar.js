import React from "react";
import { Link } from "react-router-dom";
import "../App.css";
import logo from "../images/logo.png";

// Correct imports for the icons
import { LuLayoutDashboard } from "react-icons/lu";
import { GoHistory } from "react-icons/go";
import { MdOutlineBackupTable } from "react-icons/md";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <img src={logo} alt="StudyHub Logo" className="sidebar-logo" />
      <nav>
        <ul>
          <li>
            <Link to="/dashboard">
              <LuLayoutDashboard size={20} style={{ marginRight: "10px" }} />
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/history">
              <GoHistory size={20} style={{ marginRight: "10px" }} />
              History
            </Link>
          </li>
          <li>
            <Link to="/personnel">
              <MdOutlineBackupTable size={20} style={{ marginRight: "10px" }} />
              Customer List
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
