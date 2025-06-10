import React, { useEffect, useState } from "react";
import moment from "moment";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import BaseHeader from "../partials/BaseHeader";
import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";

function Analytics() {
  const [stats, setStats] = useState({});
  const [dailyData, setDailyData] = useState([]);
  const [topStudents, setTopStudents] = useState([]);

  useEffect(() => {
    useAxios
      .get(`teacher/analytics/${UserData()?.teacher_id}/`)
      .then((res) => {
        setStats(res.data);
        setDailyData(res.data.daily_data);
        setTopStudents(res.data.top_students);
      });
  }, []);

  return (
    <>
      <BaseHeader />
      <section className="pt-5 pb-5">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <Sidebar />

            <div className="col-lg-9 col-md-8 col-12">
              <div className="row mb-4">
                <h4 className="mb-4">
                  <i className="fas fa-chart-line me-2"></i> Teacher Analytics
                </h4>

                {/* Stat cards */}
                {[
                  { label: "Total Courses", value: stats.total_courses, icon: "fas fa-book", color: "primary" },
                  { label: "Total Students", value: stats.total_students, icon: "fas fa-users", color: "success" },
                  { label: "At-Risk Students", value: stats.at_risk_students, icon: "fas fa-exclamation-triangle", color: "warning" },
                  { label: "Notes Created", value: stats.total_notes, icon: "fas fa-sticky-note", color: "info" },
                  { label: "Discussion Messages", value: stats.discussion_messages, icon: "fas fa-comments", color: "secondary" },
                ].map((item, index) => (
                  <div className="col-md-4 mb-3" key={index}>
                    <div className={`d-flex align-items-center p-4 bg-${item.color} bg-opacity-10 rounded-3`}>
                      <span className={`display-6 text-${item.color}`}>
                        <i className={`${item.icon} fa-fw`} />
                      </span>
                      <div className="ms-4">
                        <h5 className="mb-0 fw-bold">{item.value}</h5>
                        <p className="mb-0 h6 fw-light">{item.label}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Engagement Chart */}
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="mb-0">Engagement Over Time</h5>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailyData}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="enrollments"
                        stroke="#1e40af"
                        name="Enrollments"
                      />
                      <Line
                        type="monotone"
                        dataKey="submissions"
                        stroke="#10b981"
                        name="Submissions"
                      />
                      <Line
                        type="monotone"
                        dataKey="messages"
                        stroke="#f59e0b"
                        name="Messages"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Students Table */}
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="mb-0">Top Performing Students</h5>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover table-centered mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Student</th>
                        <th>Notes</th>
                        <th>Assignments</th>
                        <th>Messages</th>
                        <th>Total Activity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topStudents.map((s, idx) => (
                        <tr key={idx}>
                          <td>{s.name}</td>
                          <td>{s.notes}</td>
                          <td>{s.assignments}</td>
                          <td>{s.messages}</td>
                          <td>{s.notes + s.assignments + s.messages}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Analytics;
