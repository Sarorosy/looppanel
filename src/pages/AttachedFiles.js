import React, { useEffect, useState } from "react";
import { CircleCheck, CircleX, FileDown, FileWarning, Paperclip } from "lucide-react"; // Make sure lucide-react is installed
import axios from "axios";

const AttachedFiles = ({ ref_id, relevant_file, quote, showUpload, setShowUpload }) => {
    const [chatFiles, setChatFiles] = useState([]);
    const [relevantFiles, setRelevantFiles] = useState([]);
    const [feasFiles, setFeasFiles] = useState([]);
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const loopuserData = localStorage.getItem('loopuser');
    const loopUserObject = JSON.parse(loopuserData);
    let files = [];

    try {
        if (typeof relevant_file === "string") {
            files = JSON.parse(relevant_file);
        } else if (Array.isArray(relevant_file)) {
            files = relevant_file;
        }
    } catch (error) {
        console.error("Invalid JSON in relevant_file:", error);
    }

    const fileBaseURL = "https://apacvault.com/public/QuotationFolder/";

    const quoteID = quote?.quoteid || quote?.quote_id;
    // Fetch chat attached files from API
    useEffect(() => {
        const fetchChatFiles = async () => {
            if (!ref_id) return;

            try {
                const response = await fetch("https://apacvault.com/Webapi/getchatattachedfiles", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ref_id: ref_id })
                });

                const result = await response.json();
                if (Array.isArray(result)) {
                    setChatFiles(result);
                }
            } catch (error) {
                console.error("Error fetching chat files:", error);
            }
        };

        fetchChatFiles();
    }, [ref_id]);

    useEffect(() => {
        const fetchRelevantFiles = async () => {
            if (!ref_id) return;

            try {
                const response = await fetch("https://apacvault.com/Webapi/getallrelevantfiles", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ref_id: ref_id })
                });

                const result = await response.json();
                if (Array.isArray(result)) {
                    setRelevantFiles(result);
                }
            } catch (error) {
                console.error("Error fetching relevant files:", error);
            }
        };

        fetchRelevantFiles();
    }, [ref_id]);

    useEffect(() => {
        const fetchFeasFiles = async () => {
            if (!ref_id) return;

            try {
                const response = await fetch("https://apacvault.com/Webapi/getAllFeasFiles", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ref_id: ref_id })
                });

                const result = await response.json();
                if (Array.isArray(result)) {
                    setFeasFiles(result);
                }
            } catch (error) {
                console.error("Error fetching relevant files:", error);
            }
        };

        fetchFeasFiles();
    }, [ref_id]);

    const fetchAttachedFiles = async () => {
        if (!quote.quoteid) return;

        try {
            const response = await fetch("https://apacvault.com/Webapi/fetchallattachedfiles", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quote_id: quote.quoteid })
            });

            const result = await response.json();
            if (Array.isArray(result.files)) {
                setAttachedFiles(result.files);
                console.log("Attached files:", result.files);
            }
        } catch (error) {
            console.error("Error fetching chat files:", error);
        }
    };
    useEffect(() => {


        fetchAttachedFiles();
    }, [quote.quoteid]);


    const [selectedFiles, setSelectedFiles] = useState([]);

    const handleFileChange = (e) => {
        setSelectedFiles([...e.target.files]);
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        const formData = new FormData();
        formData.append("user_id", loopUserObject.id); // Replace with dynamic user_id if needed
        formData.append("quote_id", quote.quoteid);
        formData.append("ref_id", quote.assign_id);
        selectedFiles.forEach((file) => {
            formData.append("quote_upload_file[]", file);
        });

        try {
            setUploading(true);
            const res = await axios.post(
                "https://apacvault.com/Webapi/upload_attach_file",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            console.log("Upload success:", res.data);
            setShowUpload(false);
            setSelectedFiles([]);
            fetchAttachedFiles();

        } catch (err) {
            console.error("Upload failed:", err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white p-x-2 shadow-md border elevenpx">

            {quote.parent_quote !== 1 && (
                <>
                    {showUpload && (
                        <div className="bg-gray-100 p-2 m-2 flex items-center gap-2">
                            <input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                className="form-control form-control-sm"
                            />
                            <div className="flex justify-end items-center gap-2 sm:mt-0">
                                <button
                                    onClick={handleUpload}
                                    className="btn btn-success btn-sm px-1"
                                    title="Upload"
                                    disabled={selectedFiles.length === 0 || uploading}
                                >
                                    <CircleCheck size={16} />
                                </button>
                                <button
                                    onClick={() => {
                                        setShowUpload(false);
                                        setSelectedFiles([]);
                                    }}
                                    className="btn btn-danger btn-sm px-1"
                                    title="Cancel"
                                >
                                    <CircleX size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {relevantFiles.length === 0 ? (
                <p className="text-gray-500">No relevant files attached.</p>
            ) : (
                <ul className="">
                    {relevantFiles.map((file, index) => {
                        const truncateMiddle = (str, maxLength = 30) => {
                            if (str.length <= maxLength) return str;
                            const half = Math.floor((maxLength - 3) / 2);
                            return str.slice(0, half) + '...' + str.slice(str.length - half);
                        };

                        const formattedDate = new Date(file.created_date * 1000).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                        });
                        // Convert Unix timestamp to readable

                        return (
                            <li
                                key={index}
                                className="flex flex-col  justify-between gap-2 p-2 border border-gray-200 "
                            >
                                <div className="flex items-center gap-x-2">
                                    <FileDown className="text-blue-500" size={18} />
                                    <a
                                        href={`${fileBaseURL}${file.file_path}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        download
                                        className="text-blue-600 font-medium hover:underline"
                                    >
                                        {truncateMiddle(file.filename)} ({file.quote_id})
                                    </a>
                                </div>
                                <div className=" text-gray-500 sm:text-right tenpx">
                                    {formattedDate}
                                </div>
                            </li>
                        );
                    })}
                </ul>


            )}

            {chatFiles.length === 0 ? (
                <p className="text-gray-500 text-sm"></p>
            ) : (
                <>

                    <ul className="space-y-3">
                        {chatFiles.map((file, index) => {
                            const formattedDate = new Date(file.date * 1000).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true,
                            });


                            return (
                                <li
                                    key={index}
                                    className="flex flex-col  justify-between gap-2 p-2 rounded-md border border-gray-200 shadow-sm"
                                >
                                    <div className="flex items-center gap-x-2">
                                        <FileDown className="text-green-500" size={18} />
                                        <a
                                            href={`${file.file_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download
                                            className="text-green-700 font-medium hover:underline truncate"
                                        >
                                            {file.file_path.split("/").pop()} ({file.quote_id})
                                        </a>
                                    </div>
                                    <div className=" text-gray-500 sm:text-right tenpx">
                                        {formattedDate}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                </>
            )}


            {feasFiles.length === 0 ? (
                <p className="text-gray-500 text-sm"></p>
            ) : (
                <>

                    <ul className="space-y-3">
                        {feasFiles.map((file, index) => {
                            const truncateMiddle = (str, maxLength = 30) => {
                                if (str.length <= maxLength) return str;
                                const half = Math.floor((maxLength - 3) / 2);
                                return str.slice(0, half) + '...' + str.slice(str.length - half);
                            };

                            const formattedDate = new Date(file.created_date * 1000).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true,
                            });


                            return (
                                <li key={index} className="flex flex-col justify-between gap-2 p-2 rounded-md border border-gray-200 shadow-sm">
                                    <div className="flex items-center gap-x-2">
                                        <FileDown className="text-purple-500" size={18} />
                                        <a
                                            href={`https://apacvault.com/public/feasabilityFiles/${file.file_name}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download
                                            className="text-purple-700 font-medium hover:underline truncate"
                                            title={file.file_name}
                                        >
                                            {truncateMiddle(file.file_name)} ({file.quote_id})
                                        </a>
                                    </div>
                                    <div className=" text-gray-500 sm:text-right tenpx">
                                        {formattedDate}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                </>
            )}

            {attachedFiles.length === 0 ? (
                <p className="text-gray-500 text-sm"></p>
            ) : (
                <>

                    <ul className="space-y-3">
                        {attachedFiles.map((file, index) => {
                            const formattedDate = file.created_at
                                ? new Date(file.created_at).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true,
                                })
                                : 'Unknown';

                            return (
                                <li
                                    key={index}
                                    className="flex flex-col  justify-between gap-2 p-2 rounded-md border border-gray-200 shadow-sm"
                                >
                                    <div className="flex items-center gap-x-2">
                                        <FileDown className="text-green-500" size={18} />
                                        <a
                                            href={`${fileBaseURL}${file.file}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download
                                            className="text-green-700 font-medium hover:underline truncate"
                                        >
                                            {file.file} ({file.quote_id})
                                        </a>
                                    </div>
                                    <div className="tenpx text-gray-500 sm:text-right">
                                       {formattedDate}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                </>
            )}


        </div>
    );
};

export default AttachedFiles;
