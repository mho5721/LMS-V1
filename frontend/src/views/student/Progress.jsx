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

function MyProgress() {
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const studentId = UserData()?.user_id;
    if (!studentId) return;

    useAxios
      .get(`student/activity-history/${studentId}/`)
      .then((res) => {
        setActivityData(res.data);
      })
      .catch((err) => console.error("Failed to fetch activity data", err))
      .finally(() => setLoading(false));
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
              <h4 className="mb-4">
                <i className="bi bi-graph-up-arrow"></i> My Progress
              </h4>

              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="mb-0">Weekly Learning Activity</h5>
                </div>
                <div className="card-body">
                  {loading ? (
                    <p>Loading...</p>
                  ) : activityData.length === 0 ? (
                    <p>No activity data found.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={activityData}>
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="notes" fill="#0d6efd" name="Notes" />
                        <Bar dataKey="assignments" fill="#20c997" name="Assignments" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default MyProgress;
