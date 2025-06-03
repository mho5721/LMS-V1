import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";

import BaseHeader from "../partials/BaseHeader";
import Header from "./Partials/Header";
import Sidebar from "./Partials/Sidebar";

import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";

function InstructorStudyGroups() {
  const [groups, setGroups] = useState([]);

  const fetchGroups = () => {
    useAxios
      .get(`/study-group-members/?user=${UserData()?.user_id}`)
      .then((res) => {
        const joinedGroups = res.data.map((m) => m.group);
        setGroups(joinedGroups);
      });
  };

  useEffect(() => {
    fetchGroups();
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
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">
                <i className="fas fa-users"></i> My Study Groups
              </h4>
              <Link to="/instructor/study-groups/create" className="btn btn-success">
                + Create Group
              </Link>
            </div>

              <div className="table-responsive border-0">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Group Name</th>
                      <th>Course</th>
                      <th>Created</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map((group) => (
                      <tr key={group.id}>
                        <td>{group.name}</td>
                        <td>{group.course_title || group.course}</td>
                        <td>{moment(group.date_created).format("DD MMM, YYYY")}</td>
                        <td>
                          <Link
                            to={`/instructor/study-groups/${group.id}/`}
                            className="btn btn-sm btn-primary"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default InstructorStudyGroups;
