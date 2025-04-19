import React, { useEffect, useState } from "react";
import { FileDown, FileWarning } from "lucide-react"; // Make sure lucide-react is installed

const AttachedFiles = ({ ref_id, relevant_file, quote }) => {
    const [chatFiles, setChatFiles] = useState([]);
    const [relevantFiles, setRelevantFiles] = useState([]);
    const [feasFiles, setFeasFiles] = useState([]);
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

    return (
        <div className="bg-white p-x-2 py-1  shadow-md border elevenpx">


            {relevantFiles.length === 0 ? (
                <p className="text-gray-500">No relevant files attached.</p>
            ) : (
                <ul className="space-y-1">
                    {relevantFiles.map((file, index) => {
                        const truncateMiddle = (str, maxLength = 30) => {
                            if (str.length <= maxLength) return str;
                            const half = Math.floor((maxLength - 3) / 2); // subtract 3 for "..."
                            return str.slice(0, half) + '...' + str.slice(str.length - half);
                        };

                        return (
                            <li key={index} className="flex items-center gap-x-1 p-2 bg-gray-50 rounded-md transition">
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
                            </li>
                        );
                    })}
                </ul>

            )}

            {chatFiles.length === 0 ? (
                <p className="text-gray-500 text-sm"></p>
            ) : (
                <>
                    <hr style={{ background: "#b5b5b5" }} />
                    <ul className="space-y-3">
                        {chatFiles.map((file, index) => (
                            <li key={index} className="flex items-center gap-x-1 p-2  rounded-md transition">
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
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {feasFiles.length === 0 ? (
                <p className="text-gray-500 text-sm"></p>
            ) : (
                <>
                    <hr style={{ background: "#b5b5b5" }} />
                    <ul className="space-y-3">
                        {feasFiles.map((file, index) => {
                            const truncateMiddle = (str, maxLength = 30) => {
                                if (str.length <= maxLength) return str;
                                const half = Math.floor((maxLength - 3) / 2); // 3 for "..."
                                return str.slice(0, half) + '...' + str.slice(str.length - half);
                            };

                            return (
                                <li key={index} className="flex items-center gap-x-1 p-2 rounded-md transition">
                                    <FileDown className="text-purple-500" size={18} />
                                    <a
                                        href={`https://apacvault.com/public/feasabilityFiles/${file.file_name}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        download
                                        className="text-purple-700 font-medium hover:underline truncate"
                                        title={file.file_name} // optional: show full name on hover
                                    >
                                        {truncateMiddle(file.file_name)} ({file.quote_id})
                                    </a>
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
