import React, { useEffect, useState } from "react";
import moment from "moment";
import { Link } from "react-router-dom";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import BaseHeader from "../partials/BaseHeader";

import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";

function StudyGroups() {
  const [groups, setGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchGroups = () => {
    useAxios
      .get(`/study-group-members/?user=${UserData()?.user_id}`)
      .then((res) => {
        const joinedGroups = res.data.map((m) => m.group);  // assumes full group object is nested under 'group'
        setGroups(joinedGroups);
        setAllGroups(joinedGroups);
      });
  };
  

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (!query) {
      setGroups(allGroups);
    } else {
      const filtered = allGroups.filter((g) => g.name.toLowerCase().includes(query));
      setGroups(filtered);
    }
  };

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
              <Link to="/student/study-groups/create" className="btn btn-success">
                + Create Group
              </Link>
            </div>

              <div className="mb-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by group name..."
                  value={searchQuery}
                  onChange={handleSearch}
                />
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
                            to={`/student/study-groups/${group.id}/`}
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

export default StudyGroups;
