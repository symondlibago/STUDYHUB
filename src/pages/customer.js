import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaEdit, FaRegStopCircle  } from "react-icons/fa";
import { IoArchive } from "react-icons/io5";
import moment from "moment";
import API_URL from "./api";
const Customer = () => {
  const [tableData, setTableData] = useState([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    tableNo: 1,
    timeStarts: "",
    timeAcquired: 1,
    timeEnds: "",
  });
  const [isTableDropdownOpen, setIsTableDropdownOpen] = useState(false);
  const [isTimeAcquiredDropdownOpen, setIsTimeAcquiredDropdownOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState("");
  const [selectedTimeAcquired, setSelectedTimeAcquired] = useState("");
  const [showEditOverlay, setShowEditOverlay] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [customerCountToday, setCustomerCountToday] = useState(0);
  const [todayCustomers, setTodayCustomers] = useState([]);
  const convertToLocalTime = (utcTime) => {
    return new Date(utcTime).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  useEffect(() => {
    // Get today's date in 'YYYY-MM-DD' format
    const todayDate = moment().format("YYYY-MM-DD");

    // Filter only today's customers (ignores archived status)
    const filteredCustomers = tableData.filter(
      (data) => moment(data.created_at).format("YYYY-MM-DD") === todayDate
    );

    setTodayCustomers(filteredCustomers);
  }, [tableData]);


  useEffect(() => {
    // Fetch the number of customers created today
    axios
      .get(`${API_URL}/api/count-customers-today`)
      .then((response) => {
        setCustomerCountToday(response.data.customer_count);
      })
      .catch((error) => {
        console.error("Error fetching customer count:", error);
      });
  }, []);

  // Fetch customer data when component mounts
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/customers`);
        setTableData(response.data);
      } catch (error) {
        console.error("Error fetching customer data:", error);
      }
    };
    
    fetchCustomers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddCustomer = async () => {
    const customerData = {
      name: newCustomer.name,
      table_no: parseInt(newCustomer.tableNo),
      time_acquired: newCustomer.timeAcquired,
    };

    try {
      const response = await axios.post(`${API_URL}/api/customers`, customerData);
      setTableData((prevData) => [...prevData, response.data]);
      setNewCustomer({ name: "", tableNo: 1, timeAcquired: "1 Hour" });
      setShowOverlay(false);

      // Trigger SweetAlert popup
      Swal.fire({
        title: "Success!",
        text: "Customer added successfully.",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("Error adding customer:", error.response ? error.response.data : error);

      if (error.response && error.response.data.message === "Table is already occupied") {
        Swal.fire({
          title: "Error!",
          text: "This table is already occupied. Please select a different one.",
          icon: "error",
          confirmButtonText: "OK",
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: "Failed to add customer. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
};


  const toggleDropdown = (dropdown) => {
    if (dropdown === "table") {
      setIsTableDropdownOpen(!isTableDropdownOpen);
    } else if (dropdown === "timeAcquired") {
      setIsTimeAcquiredDropdownOpen(!isTimeAcquiredDropdownOpen);
    }
  };

  const handleSelection = (value, type) => {
    if (type === "table") {
      setSelectedTable(value);
      setNewCustomer((prevData) => ({ ...prevData, tableNo: value }));
      setIsTableDropdownOpen(false);
    } else if (type === "timeAcquired") {
      setSelectedTimeAcquired(value);
      setNewCustomer((prevData) => ({ ...prevData, timeAcquired: value }));
      setIsTimeAcquiredDropdownOpen(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      const response = await axios.put(`${API_URL}/api/customers/${currentCustomer.id}`, currentCustomer);
      setTableData((prevData) =>
        prevData.map((data) =>
          data.id === currentCustomer.id ? response.data : data
        )
      );
      setShowEditOverlay(false);
  
      Swal.fire({
        title: "Success!",
        text: "Customer details updated successfully.",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("Error updating customer:", error.response ? error.response.data : error);
  
      if (error.response && error.response.data.message === "Table is already occupied by another active customer") {
        Swal.fire({
          title: "Error!",
          text: "This table is already occupied by another active customer. Please choose a different table.",
          icon: "error",
          confirmButtonText: "OK",
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: "Failed to update customer. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  };
  
  

  const handleEdit = (customer) => {
    setCurrentCustomer(customer);
    setShowEditOverlay(true);
  };

  const handleArchive = async (customer) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to archive this customer?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, archive it!',
      cancelButtonText: 'No, keep it'
    });
  
    if (result.isConfirmed) {
      try {
        const response = await axios.put(`${API_URL}/api/customers/archive/${customer.id}`);
  
        if (response.data.archive) {
          setTableData((prevData) =>
            prevData.filter((data) => data.id !== customer.id)
          );
        }
  
        Swal.fire({
          title: "Success!",
          text: "Customer has been archived.",
          icon: "success",
          confirmButtonText: "OK",
        });
      } catch (error) {
        console.error("Error archiving customer:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to archive the customer. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  };
  
  
  
  
  const handleStop = async (customer) => {
    // Show SweetAlert confirmation before stopping the time
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to stop the time for this customer?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, stop it!',
      cancelButtonText: 'No, keep going'
    });
  
    if (result.isConfirmed) {
      try {
        // Send PUT request to update status to 'Complete'
        const response = await axios.put(`${API_URL}/api/customers/${customer.id}/stop`);
  
        // Update the table data with the new status
        setTableData((prevData) =>
          prevData.map((data) =>
            data.id === customer.id ? response.data.customer : data
          )
        );
  
        // Show success alert
        Swal.fire({
          title: "Success!",
          text: "Time has been stopped and the status is now Complete.",
          icon: "success",
          confirmButtonText: "OK",
        });
      } catch (error) {
        console.error("Error stopping time:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to stop the time. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  };
  
  

  return (
    <div className="customer">
      <h1>Welcome to the Customer Page</h1>
      <button className="add-customer-button" onClick={() => setShowOverlay(true)}>
        Add Customer
      </button>

      {/* Overlay Form */}
      {showOverlay && (
        <div className="overlay">
          <div className="overlay-content">
            <h2>Add New Customer</h2>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={newCustomer.name}
              onChange={handleInputChange}
              placeholder="Enter Name"
            />
            <label>Table No.:</label>
            <div className={`custom-dropdown ${isTableDropdownOpen ? "open" : ""}`}>
              <button className="dropdown-btn" onClick={() => toggleDropdown("table")}>
                {selectedTable || "Select Table"}
                <span className="dropdown-icon">▼</span>
              </button>
              <div className="dropdown-content">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((table) => (
                  <div key={table} onClick={() => handleSelection(table, "table")}>
                    Table {table}
                  </div>
                ))}
              </div>
            </div>
            <label>Time Acquired:</label>
            <div className={`custom-dropdown ${isTimeAcquiredDropdownOpen ? "open" : ""}`}>
              <button className="dropdown-btn" onClick={() => toggleDropdown("timeAcquired")}>
                {selectedTimeAcquired || "Select Time"}
                <span className="dropdown-icon">▼</span>
              </button>
              <div className="dropdown-content">
                {[...Array(24).keys()].map((i) => (
                  <div key={i} onClick={() => handleSelection(`${i + 1} Hours`, "timeAcquired")}>
                    {i + 1} Hours
                  </div>
                ))}
              </div>
            </div>
            <div className="overlay-buttons">
              <button onClick={handleAddCustomer}>Add</button>
              <button className="cancel-button" onClick={() => setShowOverlay(false)}>Cancel</button>

            </div>
          </div>
        </div>
      )}

      {/* Edit Customer */}

      {showEditOverlay && (
  <div className="overlay">
    <div className="overlay-content">
      <h2>Edit Customer</h2>
      <label>Name:</label>
      <input
        type="text"
        name="name"
        value={currentCustomer?.name || ""}
        onChange={(e) =>
          setCurrentCustomer({ ...currentCustomer, name: e.target.value })
        }
        placeholder="Enter Name"
      />
      <label>Table No.:</label>
      <div className={`custom-dropdown ${isTableDropdownOpen ? "open" : ""}`}>
        <button className="dropdown-btn" onClick={() => toggleDropdown("table")}>
          {currentCustomer?.table_no || "Select Table"}
          <span className="dropdown-icon">▼</span>
        </button>
        <div className="dropdown-content">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((table) => (
            <div
              key={table}
              onClick={() => {
                setCurrentCustomer({ ...currentCustomer, table_no: table });
                toggleDropdown("table");  // Optionally close dropdown after selection
              }}
            >
              Table {table}
            </div>
          ))}
        </div>
      </div>
      <label>Time Acquired:</label>
      <div className={`custom-dropdown ${isTimeAcquiredDropdownOpen ? "open" : ""}`}>
        <button className="dropdown-btn" onClick={() => toggleDropdown("timeAcquired")}>
          {currentCustomer?.time_acquired || "Select Time"}
          <span className="dropdown-icon">▼</span>
        </button>
        <div className="dropdown-content">
          {[...Array(24).keys()].map((i) => (
            <div
              key={i}
              onClick={() => {
                setCurrentCustomer({
                  ...currentCustomer,
                  time_acquired: `${i + 1} Hours`,
                });
                toggleDropdown("timeAcquired");  // Optionally close dropdown after selection
              }}
            >
              {i + 1} Hours
            </div>
          ))}
        </div>
      </div>
      <div className="overlay-buttons">
  <button onClick={handleSaveChanges}>Save</button>
  <button className="cancel-button" onClick={() => setShowEditOverlay(false)}>Cancel</button>

</div>

    </div>
  </div>
)}

      {/* Table */}
      <div className="customer-container">
  <div className="customer-table-container">
    <table className="customer-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Table No.</th>
          <th>Time Starts</th>
          <th>Time Acquired</th>
          <th>Time Ends</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {tableData
          .filter((data) => !data.archive) // Filter out archived customers
          .map((data, index) => (
            <tr key={index}>
              <td>{data.name}</td>
              <td>{data.table_no}</td>
              <td>{convertToLocalTime(data.created_at)}</td>
              <td>{data.time_acquired}</td>
              <td>{convertToLocalTime(data.time_ends)}</td>
              <td>{data.status}</td>
              <td>
                <FaEdit
                  className="customer-action-icon edit-icon"
                  onClick={() => handleEdit(data)}
                />
                <FaRegStopCircle
                  className="customer-action-icon delete-icon"
                  onClick={() => handleStop(data)}
                />
                {data.status === 'Complete' && (
                  <IoArchive
                    className="customer-action-icon archive-icon"
                    onClick={() => handleArchive(data)}
                  />
                )}
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  </div>

  <div className="container-status">
      {Array.from({ length: 10 }, (_, index) => {
        const tableNo = index + 1;

        // Get today's customers at this table (INCLUDING ARCHIVED)
        const customersAtTableToday = todayCustomers.filter((data) => data.table_no === tableNo);
        const isOccupied = customersAtTableToday.some((data) => data.status === "Active"); // Only for "Occupied" status
        const customerCountToday = customersAtTableToday.length; // Count includes archived customers

        return (
          <div className="container" key={tableNo}>
            <span className="container-number">Table No. {tableNo}</span>
            <span className={`container-status-label ${isOccupied ? "occupied" : "available"}`}>
              {isOccupied ? "Occupied" : "Available"}
            </span>
            {customerCountToday > 0 && (
              <span className="container-status-label">
                Customers today: {customerCountToday} {/* Includes archived customers */}
              </span>
            )}
          </div>
        );
      })}
    </div>

</div>




    </div>
  );
};

export default Customer;
