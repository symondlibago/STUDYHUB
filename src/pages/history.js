import React, { useState } from "react";
import Calendar from "react-calendar";
import axios from "axios";
import "react-calendar/dist/Calendar.css";
import "../App.css";
import API_URL from "./api";

const History = () => {
  const [date, setDate] = useState(new Date()); // Selected date
  const [tableData, setTableData] = useState([]); // Data for the table

  // Fetch data for the selected date
  const fetchCustomersByDate = async (selectedDate) => {
    try {
      const response = await axios.get(`${API_URL}/api/customers-by-date`, {
        params: { date: selectedDate },
      });
      setTableData(response.data);
      setCustomerCount(response.data.length); // Set customer count for the selected date
    } catch (error) {
      console.error("Error fetching customers by date:", error);
    }
  };

  // Fetch data for the selected month
  const fetchCustomersByMonth = async (selectedMonth) => {
    try {
      const response = await axios.get(`${API_URL}/api/customers-by-month`, {
        params: { month: selectedMonth },
      });
      setTableData(response.data);
      setMonthlyCustomerCount(response.data.length); // Set total customer count for the whole month
    } catch (error) {
      console.error("Error fetching customers by month:", error);
    }
  };

  // Handle date change (specific date or month)
  const onDateChange = (newDate) => {
    setDate(newDate);
    const formattedDate = newDate.toISOString().split("T")[0]; // Format to 'YYYY-MM-DD'
    fetchCustomersByDate(formattedDate);
  };

  // Handle month change (extract the month and year from the date)
  const onMonthChange = (newDate) => {
    setDate(newDate);
    const formattedMonth = newDate.toISOString().slice(0, 7); // Format to 'YYYY-MM'
    fetchCustomersByMonth(formattedMonth);
  };

  // Calendar onChange handler (check if it's a full date or just month)
  const onChange = (newDate) => {
    const selectedMonth = newDate.getMonth(); // Get the selected month

    // If it's the first day of the month or a day within the month, fetch data for the whole month
    if (newDate.getDate() === 1 || selectedMonth !== newDate.getMonth()) {
      onMonthChange(newDate); // Fetch data for the whole month
    } else {
      onDateChange(newDate); // Fetch data for a specific day
    }
  };

  // Handle the "See Data for this Month" button click
  const handleSeeDataForMonth = () => {
    const formattedMonth = date.toISOString().slice(0, 7); // Format to 'YYYY-MM'
    fetchCustomersByMonth(formattedMonth);
  };

  return (
    <div className="history-page-container">
      <div className="history-page">
        <h1>History Page</h1>
        <div className="history-content">
  {/* Calendar */}
  <div className="calendar-container">
    <Calendar onChange={onChange} value={date} />
  </div>

  {/* Table and customer count */}
  <div className="table-container">
    <h3>Customer Details for {date.toDateString()}</h3>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Table No</th>
          <th>Time Acquired</th>
        </tr>
      </thead>
      <tbody>
        {tableData.length > 0 ? (
          tableData.map((customer) => (
            <tr key={customer.id}>
              <td>{customer.name}</td>
              <td>{customer.table_no}</td>
              <td>{customer.time_acquired}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="3">No data available for the selected date or month</td>
          </tr>
        )}
      </tbody>
    </table>
    <button onClick={handleSeeDataForMonth}>See Data for this Month</button>
  </div>

  {/* Right Side Containers for Table Count */}
  <div className="customer-count-container">
    {[...Array(10)].map((_, index) => {
      const tableNumber = index + 1;
      const customerCountForTable = tableData.filter(
        (customer) => customer.table_no === tableNumber
      ).length;

      return (
        <div className="customer-count-item" key={index}>
          <h4>Table {tableNumber}</h4>
          <p>Customers: {customerCountForTable}</p>
        </div>
      );
    })}
  </div>
</div>

        </div>
      </div>
  );
};

export default History;
