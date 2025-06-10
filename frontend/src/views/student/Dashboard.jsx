import { useState, useEffect } from "react";
import moment from "moment";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import Sidebar from "./partials/Sidebar";
import Header from "./partials/Header";
import BaseHeader from "../partials/BaseHeader";

import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";

function Dashboard() {
  const [stats, setStats] = useState({});
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    useAxios.get(`student/summary/${UserData()?.user_id}/`).then((res) => {
      setStats(res.data[0]);
    });

    useAxios.get(`student/course-list/${UserData()?.user_id}/`).then((res) => {
      setCourses(res.data);
      setFilteredCourses(res.data);
    });

  }, []);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setFilteredCourses(
      query === ""
        ? courses
        : courses.filter((c) => c.title.toLowerCase().includes(query))
    );
  };

  const activityData = [
    {
      type: "Total",
      notes: stats.notes_created || 0,
      assignments: stats.assignments_submitted || 0,
    },
  ];

  return (
    <>
      <BaseHeader />
      <section className="pt-5 pb-5">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <Sidebar />
            <div className="col-lg-9 col-md-8 col-12">
              <h4 className="mb-4">
                <i className="bi bi-grid-fill"></i> Student Dashboard
              </h4>


              <div className="row mb-4">
                {[
                  {
                    label: "Active Courses",
                    value: stats.active_courses,
                    icon: "fas fa-book-open",
                    color: "primary",
                  },
                  {
                    label: "Notes Created",
                    value: stats.notes_created,
                    icon: "fas fa-sticky-note",
                    color: "info",
                  },
                  {
                    label: "Assignments Submitted",
                    value: stats.assignments_submitted,
                    icon: "fas fa-file-upload",
                    color: "success",
                  },
                ].map((card, index) => (
                  <div className="col-md-4 mb-3" key={index}>
                    <div className={`d-flex align-items-center p-4 bg-${card.color} bg-opacity-10 rounded-3`}>
                      <span className={`display-6 text-${card.color}`}>
                        <i className={`${card.icon} fa-fw`} />
                      </span>
                      <div className="ms-4">
                        <h5 className="mb-0 fw-bold">{card.value}</h5>
                        <p className="mb-0 h6 fw-light">{card.label}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Snapshot Chart */}
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="mb-0">Learning Snapshot</h5>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={activityData}>
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="notes" fill="#0d6efd" name="Notes" />
                      <Bar dataKey="assignments" fill="#20c997" name="Assignments" />
                    </BarChart>
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
