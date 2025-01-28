import React, { useEffect, useState } from 'react';
import { FaUsers, FaTable, FaClock } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import API_URL from './api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalCustomers: 0,
    mostOccupiedTable: { table_no: 'N/A', customers: 0 },
    mostTimeAvail: { time_acquired: 'N/A', customers: 0 },
    monthlyData: [],
  });

  useEffect(() => {
    // Fetch data from the Laravel backend
    fetch(`${API_URL}/api/dashboard`)
      .then(response => response.json())
      .then(data => {
        // Ensure all 12 months are present
        const months = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        // Map the data so that it includes all months
        const monthlyData = months.map(month => {
          const monthData = data.monthlyData.find(d => d.month === month);
          return {
            month,
            customers: monthData ? monthData.customers : 0, // If no data, set to 0
          };
        });

        // Update the state with the complete month data
        setDashboardData({ ...data, monthlyData });
      })
      .catch(error => {
        console.error('Error fetching dashboard data:', error);
      });
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-container-total-customers">
        <h3><FaUsers /> Total Customers</h3>
        <p>{dashboardData.totalCustomers}</p>
      </div>

      <div className="dashboard-container-most-occupied-table">
        <h3><FaTable /> Most Occupied Table</h3>
        <p>Table No: {dashboardData.mostOccupiedTable.table_no}</p>
        <p>Customers: {dashboardData.mostOccupiedTable.customers}</p>
      </div>

      <div className="dashboard-container-most-time-avail">
        <h3><FaClock /> Most Time Avail</h3>
        <p>Time: {dashboardData.mostTimeAvail.time_acquired}</p>
        <p>Customers: {dashboardData.mostTimeAvail.customers}</p>
      </div>

      {/* Bar Chart Below the Containers */}
      <div className="dashboard-container-bar-chart">
        <h3>Customer Count per Month</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dashboardData.monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[0, 'dataMax + 20']} />
            <Tooltip />
            <Legend />
            <Bar dataKey="customers" fill="#007BFF" barSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
