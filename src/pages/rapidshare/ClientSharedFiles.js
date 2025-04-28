import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CirclePause, X, Lock, CircleHelp, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const ClientSharedFiles = ({ onClose, queryInfo }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchFiles = async () => {

        try {
            if (queryInfo?.email_id == undefined || queryInfo?.email_id == null) {
                toast.error('Email is required to fetch files.');
                return;
            }
            if (queryInfo?.website_name == undefined || queryInfo?.website_name == null) {
                toast.error('Website name is required to fetch files.');
                return;
            }
            setLoading(true);
            const response = await fetch(`https://${queryInfo.website_name}/rapidshare/api/Api/getAllClientFiles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: queryInfo.email_id }),
            });
            const data = await response.json();
            if (data.status) {
                setFiles(data.files || []);
            } else {
                toast.error(data.message || 'Failed to fetch files.');
            }

        } catch (error) {
            console.log('Failed to fetch files.');
        } finally {
            setLoading(false);

        }
    }

    useEffect(() => {
        fetchFiles();
    }, [queryInfo])

    const renderSkeleton = () => (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    className="flex justify-between items-center bg-gray-100 border border-gray-200 rounded-xl p-4 animate-pulse"
                >
                    <div className="flex items-center gap-3">
                        <div className="h-6 w-6 bg-gray-300 rounded" />
                        <div>
                            <div className="h-3 w-40 bg-gray-300 rounded mb-2"></div>
                            <div className="h-2 w-24 bg-gray-300 rounded"></div>
                        </div>
                    </div>
                    <div className="h-8 w-20 bg-gray-300 rounded-lg"></div>
                </div>
            ))}
        </div>
    );

    // Helper function to format the uploaded_at date (with time)
    const formatUploadedAt = (date) => {
        return new Date(date).toLocaleString("en-GB", {
            weekday: "short",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        });
    };

    // Helper function to format the date (expiration date without time)
    const formatDate = (date) => {
        return new Date(date).toLocaleString("en-GB", {
            weekday: "short",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getDaysLeft = (date) => {
        const today = new Date();
        const expirationDate = new Date(date.replace(" ", "T")); // Convert '2025-06-23 22:24:29' to '2025-06-23T22:24:29'
        const timeDiff = expirationDate - today;
        const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        // If daysLeft is negative, it means the file is expired
        if (daysLeft < 0) {
            return `Expired ${Math.abs(daysLeft)} days ago`;
        }
        return `Expires in: ${daysLeft} days`;
    };

    const handleRequestAccess = async (file) => {
        try{
            const response = await fetch(`https://${queryInfo.website_name}/rapidshare/api/Api/request_access`,{
                method :"POST",
                headers : {
                    "Content-type" : "application/json"
                },
                body : JSON.stringify({file_id : file.id})
            })
            const data = await response.json();
            if(data.status){
                toast.success(data.message || "Access requested");
                fetchFiles();
            }else{
                toast.error(data.message || "Error while requesting accesss")
            }

        }catch(err){
            console.log("Error while requestig access" +  err)
        }
    };
    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed mt-0 top-0 right-0 w-[400px] h-full bg-white shadow-lg z-50"
        >
            <div className="flex justify-between items-center px-4 py-3 border-b bg-blue-500 text-white">
                <h2 className="text-lg font-semibold">Client Shared Files</h2>
                <button onClick={onClose} className="text-gray-500 hover:text-red-500">
                    <X />
                </button>
            </div>

            {loading ? (
                renderSkeleton()
            ) : files.length === 0 ? (
                <div className="text-gray-500 text-center py-6">
                    Client haven’t uploaded any files yet.
                </div>
            ) : (
                <div className="space-y-4 h-full overflow-y-auto mb-24 pb-24 px-1 ">
                    {files.map((file, idx) => {
                        const isExpired = new Date(file.date) < new Date();
                        return (
                            <div
                                key={idx}
                                className={`flex items-center justify-between ${file.is_trashed == 1 ? "bg-red-100" : "bg-gray-50"} border border-gray-200 rounded-xl p-4 hover:shadow-sm transition`}
                            >
                                <div className="flex items-center gap-3">
                                    <FileText className="text-blue-500" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {file.file_name}
                                        </p>
                                        <p className="text-xs text-gray-500 capitalize">
                                            <span
                                                className={
                                                    file.access_type === "download"
                                                        ? "text-green-500"
                                                        : "text-blue-500"
                                                }
                                            >
                                                {file.access_type}
                                            </span>{" "}
                                            • {formatUploadedAt(file.uploaded_at)}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1 flex items-center">
                                            <CircleHelp
                                                size={12}
                                                className="mr-1 cursor-pointer"
                                                data-tooltip-id="my-tooltip"
                                                data-tooltip-content="Your files will be deleted after 60 days of uploaded date unless you restore it."
                                            />
                                            <span
                                                data-tooltip-id="my-tooltip"
                                                data-tooltip-content={`Expires on: ${formatDate(file.date)}`}
                                            >
                                                {getDaysLeft(file.date)}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                {/* If file is expired, show the request access button */}
                                {isExpired ? (
                                    file.access_requested == 1 ? 
                                    <button
                                        
                                        className="text-sm text-white bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded-lg transition decoration-none hover:decoration-none"
                                    >
                                        Request Pending
                                    </button> : 
                                    <button
                                        onClick={() => handleRequestAccess(file)}
                                        className="text-sm text-white bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded-lg transition decoration-none hover:decoration-none"
                                    >
                                        Request Access
                                    </button>
                                ) : (
                                    <a
                                        href={`https://${queryInfo.website_name}/rapidshare/api/uploads/final/${file.final_name}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        download={file.access_type === "download"}
                                        className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg transition decoration-none hover:decoration-none"
                                    >
                                        {file.access_type === "download" ? "Download" : "View"}
                                    </a>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
};

export default ClientSharedFiles;
