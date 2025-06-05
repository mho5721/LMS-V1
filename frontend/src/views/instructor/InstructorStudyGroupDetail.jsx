import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import moment from "moment";

import BaseHeader from "../partials/BaseHeader";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";
import Toast from "../plugin/Toast";

function InstructorStudyGroupDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [messages, setMessages] = useState([]);
    const [members, setMembers] = useState([]);
    const messagesEndRef = useRef(null);
    const [newMessage, setNewMessage] = useState("");
    const [replyTo, setReplyTo] = useState(null);
    const [replyToText, setReplyToText] = useState("");


    const fetchGroup = async () => {
        const res = await useAxios.get(`/study-groups/${id}/`);
        setGroup(res.data);
    };

    const fetchMessages = async () => {
        const res = await useAxios.get(`/study-group-messages/?group=${id}`);
        setMessages(res.data);
    };

    const fetchMembers = async () => {
        const res = await useAxios.get(`/study-group-members/?group=${id}`);
        setMembers(res.data);
    };

    const checkMembership = async () => {
        const res = await useAxios.get(`/study-group-members/?group=${id}`);
        const memberIds = res.data.map((m) => m.user);
        if (!memberIds.includes(UserData()?.user_id)) {
            Toast().fire({ icon: "error", title: "You are not a member of this group" });
            navigate("/instructor/study-groups/");
        }
    };

    const handleRemoveMember = (memberId) => {
        const formData = new FormData();
        formData.append("user_id", memberId);
        formData.append("group_id", id);
        formData.append("requester_id", UserData()?.user_id);

        useAxios.post(`/study-groups/remove-member/`, formData).then(() => {
            if (memberId === UserData()?.user_id) {
                Toast().fire({ icon: "info", title: "You left the group" });
                navigate("/instructor/study-groups/");
            } else {
                Toast().fire({ icon: "success", title: "Member removed" });
                fetchMembers();
            }
        });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("group", id);
        formData.append("sender", UserData()?.user_id);
        formData.append("message", newMessage);
        if (replyTo) formData.append("reply_to", replyTo);
    
        await useAxios.post(`/study-group-messages/`, formData);
        setNewMessage("");
        setReplyTo(null);
        setReplyToText("");
        fetchMessages();
    };
    
    const handleReply = (msg) => {
        setReplyTo(msg.id);
        setReplyToText(msg.message);
    };
    

    useEffect(() => {
        fetchGroup();
        fetchMessages();
        fetchMembers();
        checkMembership();
    }, [id]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

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
                                <i className="fas fa-comments"></i> {group?.name} Messages
                            </h4>

                            <div className="card mb-4">
                                <div className="card-header">Members</div>
                                <div className="card-body">
                                    <ul className="list-group">
                                        {members.map((m) => (
                                            <li key={m.id} className="list-group-item d-flex justify-content-between align-items-center">
                                                {m.user_name || `User #${m.user}`}
                                                {m.user_is_instructor && (
                                                    <span className="badge bg-info text-dark ms-2">Instructor</span>
                                                )}
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleRemoveMember(m.user)}
                                                >
                                                    Remove
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="card">
                                <div className="card-body" style={{ height: "500px", overflowY: "auto" }}>
                                    <ul className="list-unstyled">
                                        {messages.map((msg) => (
                                            <li key={msg.id} className="mb-3">
                                            <div className="bg-light p-3 rounded">
                                                <strong>
                                                    {msg.sender_name || "User"}
                                                    {msg.sender_is_instructor && (
                                                        <span className="badge bg-info text-dark ms-2">Instructor</span>
                                                    )}
                                                </strong>
                                                {msg.reply_to_message && (
                                                    <div className="small text-muted mb-1">
                                                        ↪ replying to: <em>{msg.reply_to_message}</em>
                                                    </div>
                                                )}
                                                <p className="mb-1">{msg.message}</p>
                                                <small className="text-muted d-block">{moment(msg.sent_at).format("DD MMM, YYYY HH:mm")}</small>
                                                <button
                                                    className="btn btn-sm btn-outline-secondary mt-2"
                                                    onClick={() => handleReply(msg)}
                                                >
                                                    Reply
                                                </button>
                                            </div>

                                            </li>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </ul>
                                </div>
                                <div className="card-footer">
                                    {replyTo && (
                                        <div className="mb-2 text-muted">
                                            Replying to: <em>{replyToText}</em>{" "}
                                            <button onClick={() => { setReplyTo(null); setReplyToText(""); }} className="btn btn-sm btn-link">Cancel</button>
                                        </div>
                                    )}
                                    <form onSubmit={handleSendMessage} className="d-flex">
                                        <textarea
                                            className="form-control me-2"
                                            rows="1"
                                            placeholder="Type your message..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                        ></textarea>
                                        <button type="submit" className="btn btn-primary">
                                            Send <i className="fas fa-paper-plane"></i>
                                        </button>
                                    </form>
                                </div>

                            </div>

                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default InstructorStudyGroupDetail;
