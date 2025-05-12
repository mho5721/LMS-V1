import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import moment from "moment";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import BaseHeader from "../partials/BaseHeader";

import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";

function StudyGroupDetail() {
    const { id } = useParams();
    const [group, setGroup] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);

    const fetchGroup = async () => {
        const res = await useAxios.get(`/study-groups/${id}/`);
        setGroup(res.data);
    };

    const fetchMessages = async () => {
        const res = await useAxios.get(`/study-group-messages/?group=${id}`);
        setMessages(res.data);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("group", id);
        formData.append("sender", UserData()?.user_id);
        formData.append("message", newMessage);

        await useAxios.post(`/study-group-messages/`, formData);
        setNewMessage("");
        fetchMessages();
    };

    useEffect(() => {
        fetchGroup();
        fetchMessages();
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
                                <i className="fas fa-comments"></i> {group?.name} Discussion
                            </h4>

                            <div className="card">
                                <div className="card-body" style={{ height: "500px", overflowY: "auto" }}>
                                    <ul className="list-unstyled">
                                        {messages.map((msg) => (
                                            <li key={msg.id} className="mb-3">
                                                <div className="bg-light p-3 rounded">
                                                    <strong>{msg.sender_name || "User"}</strong>
                                                    <p className="mb-1">{msg.message}</p>
                                                    <small className="text-muted">{moment(msg.sent_at).format("DD MMM, YYYY HH:mm")}</small>
                                                </div>
                                            </li>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </ul>
                                </div>
                                <div className="card-footer">
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

export default StudyGroupDetail;
