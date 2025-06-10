import { useState, useEffect } from "react";
import moment from "moment";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import BaseHeader from "../partials/BaseHeader";

import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";

function Dashboard() {
  const [stats, setStats] = useState({});
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);

  const fetchCourseData = () => {
    useAxios.get(`teacher/summary/${UserData()?.teacher_id}/`).then((res) => {
      setStats(res.data[0]);
    });

    useAxios.get(`teacher/course-lists/${UserData()?.teacher_id}/`).then((res) => {
      setCourses(res.data);
      setFilteredCourses(res.data);
    });
  };

  useEffect(() => {
    fetchCourseData();
  }, []);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    if (query === "") {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter((c) =>
        c.title.toLowerCase().includes(query)
      );
      setFilteredCourses(filtered);
    }
  };

  const riskData = [
    { name: "At-Risk", value: stats.at_risk_students || 0 },
    {
      name: "Stable",
      value: (stats.total_students || 0) - (stats.at_risk_students || 0),
    },
  ];

  const COLORS = ["#f59e0b", "#10b981"]; // orange and green

  return (
    <>
      <BaseHeader />

      <section className="pt-5 pb-5">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <Sidebar />
            <div className="col-lg-9 col-md-8 col-12">
              {/* Stat Cards */}
              <div className="row mb-4">
                <h4 className="mb-0 mb-4">
                  <i className="bi bi-grid-fill"></i> Teacher Dashboard
                </h4>

                <div className="col-sm-4 col-lg-4 mb-3 mb-lg-0">
                  <div className="d-flex justify-content-center align-items-center p-4 bg-primary bg-opacity-10 rounded-3">
                    <span className="display-6 lh-1 text-primary mb-0">
                      <i className="fas fa-book fa-fw" />
                    </span>
                    <div className="ms-4">
                      <h5 className="mb-0 fw-bold">{stats.total_courses}</h5>
                      <p className="mb-0 h6 fw-light">Total Courses</p>
                    </div>
                  </div>
                </div>

                <div className="col-sm-4 col-lg-4 mb-3 mb-lg-0">
                  <div className="d-flex justify-content-center align-items-center p-4 bg-success bg-opacity-10 rounded-3">
                    <span className="display-6 lh-1 text-success mb-0">
                      <i className="fas fa-users fa-fw" />
                    </span>
                    <div className="ms-4">
                      <h5 className="mb-0 fw-bold">{stats.total_students}</h5>
                      <p className="mb-0 h6 fw-light">Total Students</p>
                    </div>
                  </div>
                </div>

                <div className="col-sm-4 col-lg-4 mb-3 mb-lg-0">
                  <div className="d-flex justify-content-center align-items-center p-4 bg-warning bg-opacity-10 rounded-3">
                    <span className="display-6 lh-1 text-warning mb-0">
                      <i className="fas fa-exclamation-triangle fa-fw" />
                    </span>
                    <div className="ms-4">
                      <h5 className="mb-0 fw-bold">{stats.at_risk_students}</h5>
                      <p className="mb-0 h6 fw-light">At-Risk Students</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk Chart */}
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="mb-0">Student Engagement Risk</h5>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={riskData}
                        cx="50%"
                        cy="50%"
                        label
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {riskData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>



            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Dashboard;
