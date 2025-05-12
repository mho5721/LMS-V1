import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import BaseHeader from "../partials/BaseHeader";

import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";

function StudyGroups() {
    const [groups, setGroups] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchGroups = () => {
        useAxios.get(`/study-groups/`).then((res) => {
            setGroups(res.data);
        });
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        if (!query) {
            fetchGroups();
        } else {
            const filtered = groups.filter((g) => g.name.toLowerCase().includes(query));
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
                            <h4 className="mb-4">
                                <i className="fas fa-users"></i> My Study Groups
                            </h4>

                            <div className="card mb-4">
                                <div className="card-header">
                                    <h5 className="mb-0">Study Groups</h5>
                                </div>
                                <div className="card-body">
                                    <input
                                        type="search"
                                        className="form-control mb-3"
                                        placeholder="Search study groups..."
                                        onChange={handleSearch}
                                    />

                                    <div className="table-responsive">
                                        <table className="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th>Group Name</th>
                                                    <th>Course</th>
                                                    <th>Created</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {groups.length > 0 ? (
                                                    groups.map((group) => (
                                                        <tr key={group.id}>
                                                            <td>{group.name}</td>
                                                            <td>{group.course_title || group.course}</td>
                                                            <td>{moment(group.date_created).format("DD MMM, YYYY")}</td>
                                                            <td>
                                                                <Link to={`/student/study-groups/${group.id}/`} className="btn btn-primary btn-sm">
                                                                    View <i className="fas fa-arrow-right ms-1"></i>
                                                                </Link>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="4">No study groups found.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <Link to="/student/study-groups/create/" className="btn btn-success">
                                <i className="fas fa-plus"></i> Create New Group
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default StudyGroups;
