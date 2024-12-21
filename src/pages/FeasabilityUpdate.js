import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CustomLoader from '../CustomLoader';
import { Chat } from './Chat';
import AskPtp from './AskPtp';
import DemoDone from './DemoDone';
import { CheckCircle2, Info, PlusCircle, RefreshCcw, ChevronUp, ChevronDown, ArrowDown, ArrowUp, Edit, Settings2, History, ArrowLeftRight, BotOff } from 'lucide-react';
import SubmitRequestQuote from './SubmitRequestQuote';
import { AnimatePresence } from 'framer-motion';
import EditRequestForm from './EditRequestForm';
import 'react-quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';
import TransferForm from './TransferForm';


const FeasabilityUpdate = ({ queryId, userType, quotationId , finalFunction}) => {
    const [scopeDetails, setScopeDetails] = useState(null);
    const [assignQuoteInfo, setAssignQuoteInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [priceLoading, setPriceLoading] = useState(false);
    const [quoteLoading, setQuoteLoading] = useState(false);
    const [assignLoading, setAssignLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [quotePrice, setQuotePrice] = useState('');
    const [userComments, setUserComments] = useState('');
    const [ConsultantUserData, setConsultantUserData] = useState([]);
    const [quoteAmount, setQuoteAmount] = useState('');
    const [comment, setComment] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [adminComments, setAdminComments] = useState('');
    const userData = sessionStorage.getItem('user');
    const loopuserData = sessionStorage.getItem('loopuser');
    const [expandedRowIndex, setExpandedRowIndex] = useState(null);
    const [addNewFormOpen, setAddNewFormOpen] = useState(false);
    const [editFormOpen, setEditFormOpen] = useState(false);
    const [selectedQuoteId, setSelectedQuoteId] = useState('');
    const [selectedRefId, setSelectedRefId] = useState('');
    const [historyData, setHistoryData] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [feasabilityComments, setFeasabilityComments] = useState('');
    
    const [transferForm, setTransferForm] = useState(false);

    const toggleRow = (index) => {
        setExpandedRowIndex(expandedRowIndex === index ? null : index);
    };

    const userObject = JSON.parse(userData);
    const loopUserObject = JSON.parse(loopuserData);

    const thisUserId = loopUserObject.id


    const fetchScopeDetails = async () => {
        setLoading(true); // Show loading spinner

        try {
            const response = await fetch(
                'https://apacvault.com/Webapi/adminScopeDetails',
                {
                    method: 'POST', // Use POST method
                    headers: {
                        'Content-Type': 'application/json', // Set content type to JSON
                    },
                    body: JSON.stringify({ ref_id: queryId, user_type: userType, quote_id: quotationId }), // Send the ref_id
                }
            );

            const data = await response.json(); // Parse the response as JSON
            

            if (data.status) {
                if (data.quoteInfo != null && Array.isArray(data.quoteInfo)) {
                    // If quoteInfo is an array, process each entry
                    const parsedQuoteInfo = data.quoteInfo.map((quote) => ({
                        ...quote,
                        relevant_file: quote.relevant_file
                            ? JSON.parse(quote.relevant_file)
                            : [], // Parse the file data if present
                    }));

                    setScopeDetails(parsedQuoteInfo); // Set the array of quotes
                    
                    
                    setAssignQuoteInfo(data.assignQuoteInfo); // Assuming you also want to set assignQuoteInfo
                } else {
                    setScopeDetails(null); // If no quoteInfo, set scopeDetails to null
                }
            } else {
                console.error('Failed to fetch Details:', data.message);
            }
        } catch (error) {
            console.error('Error fetching details:', error);
        } finally {
            setLoading(false); // Hide loading spinner
        }
    };

    const checkAccessType = () =>{
        // if(scopeDetails.isfeasability == 1 && scopeDetails[0].feasability_user != thisUserId){
        //     toast.error("You dont have access for this");
        // }
        console.log("scopedetails is" + scopeDetails);
    }

    useEffect(() => {
        if (queryId) {
            fetchScopeDetails(); // Fetch the scope details when the component mounts
            
        }
    }, [queryId]);

    const formatDate = (timestamp) => {
        const date = new Date(timestamp * 1000); // Convert Unix timestamp to Date object
        return date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    };

    const getStatusText = (status) => {
        switch (status) {
            case 0:
                return 'Pending';
            case 1:
                return 'Submitted';
            default:
                return 'Unknown';
        }
    };


    const fetchFeasibilityHistory = async (assign_id, quote_id) => {
        const payload = {
            ref_id: assign_id,
            quote_id: quote_id,
        };

        try {
            setHistoryLoading(true);
            const response = await fetch('https://apacvault.com/Webapi/getFeasabilityHistory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (data.status) {
                setHistoryData(data.historyData)
            }
        } catch (error) {
            console.error("Error fetching feasibility history:", error);
        } finally {
            setHistoryLoading(false);
        }
    };


    const toggleTransferForm = () => setTransferForm((prev) => !prev);

    return (
        <div className=" h-full bg-gray-100 shadow-lg z-50 overflow-y-auto mt-2 rounded w-full">
            <div className="flex items-center justify-between bg-blue-400 text-white py-2 px-3">
                <h2 className="text-xl font-semibold " >Check Feasibility </h2>
                <div className='flex items-center justify-between'>

                    <RefreshCcw size={20} onClick={fetchScopeDetails} className='cursor-pointer' />
                </div>
            </div>

            {loading ? (
                <CustomLoader /> // A loader component when data is being fetched
            ) : (
                <div className="bg-white p-6 m-2 shadow rounded-md space-y-4">
                    {errorMessage && <p className="text-red-600">{errorMessage}</p>}

                    {scopeDetails && scopeDetails.length > 0 ? (
                        <div className="space-y-6">
                            {scopeDetails.map((quote, index) => (
                                <div
                                    key={index}
                                    className="p-4 border border-gray-300 rounded-md shadow-md bg-white space-y-4"
                                >
                                    {quote.isfeasability == 1 && quote.feasability_user == thisUserId ? (<>
                                    <div className='flex items-start justify-between'>
                                        <p>
                                            <strong>Ref No.:</strong> {quote.assign_id}
                                            {quote.ptp == "Yes" && (
                                                <span
                                                    className="inline-block ml-2 py-3 px-4"
                                                    style={{
                                                        backgroundColor: "#2B9758FF",
                                                        clipPath: "polygon(25% 0%, 100% 0, 100% 99%, 25% 100%, 0% 50%)",
                                                        color: "#ffffff",
                                                        fontSize: "14px",
                                                        fontWeight: "bold",
                                                        lineHeight: "1.5",
                                                    }}
                                                >
                                                    PTP
                                                </span>
                                            )}
                                        </p>
                                        {quote.feasability_status == 'Pending' && (
                                        <button onClick={toggleTransferForm}  className='flex items-center mr-3 border px-2 py-1 bg-green-100 rounded'>
                                            <ArrowLeftRight className='mr-3' /> Transfer
                                        </button>
                                        )}
                                    </div>
                                    {quote.tag_names && (
                                        <p>
                                            <strong>Tags:</strong>
                                            {quote.tag_names.split(",").map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="text-blue-500 hover:bg-blue-100 hover:text-blue-600 p-1 rounded-full text-sm font-medium inline-block ml-1"
                                                >
                                                    #{tag.trim()}
                                                </span>
                                            ))}
                                        </p>
                                    )}
                                    <p>
                                        <strong>Currency:</strong> {quote.currency === "Other" ? quote.other_currency : quote.currency}
                                    </p>
                                    {quote.service_name && quote.plan && (
                                        <>
                                            <p><strong>Service Required:</strong> {quote.service_name}</p>
                                            <p><strong>Plan:</strong> {quote.plan}</p>
                                        </>
                                    )}
                                    <p>
                                        <strong>Comments:</strong> <span dangerouslySetInnerHTML={{ __html: quote.comments }} />
                                    </p>
                                    <p>
                                        <strong>Created Date:</strong> {new Date(quote.created_date * 1000).toLocaleDateString("en-GB")}
                                    </p>
                                    {quote.relevant_file && quote.relevant_file.length > 0 && (
                                        <div>
                                            <strong>Relevant Files:</strong>
                                            <div className="space-y-2 mt-2">
                                                {quote.relevant_file.map((file, fileIndex) => (
                                                    <div key={fileIndex}>
                                                        <a
                                                            href={`https://apacvault.com/public/QuotationFolder/${file.file_path}`}
                                                            download
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-500"
                                                        >
                                                            {file.filename}
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {quote.ptp != null && (
                                        <>
                                            <p><strong>PTP:</strong> {quote.ptp}</p>
                                            <p><strong>PTP Comments:</strong> {quote.ptp_comments}</p>
                                        </>
                                    )}
                                    {quote.demodone != 0 && (
                                        <p className="flex items-center">
                                            <span className="bg-green-100 px-2 py-1 rounded-full text-green-900 font-semibold flex items-center">
                                                Demo Completed <CheckCircle2 size={15} className="ml-2" />
                                            </span>
                                            <span className="ml-3"><strong>Demo Id:</strong> {quote.demo_id}</span>
                                        </p>
                                    )}
                                    {quote.quote_status != 0 && quote.quote_price && quote.plan && (
                                        <>
                                            <p>
                                                <strong>Quote Price:</strong>{" "}
                                                {(() => {
                                                    const prices = quote.quote_price.split(",");
                                                    const plans = quote.plan.split(",");
                                                    return plans.map((plan, index) => (
                                                        <span
                                                            key={index}
                                                            className={quote.discount_price != null ? "line-through bg-red-200 p-1 rounded" : ""}
                                                        >
                                                            <strong>{plan}</strong>: {quote.currency === "Other" ? quote.other_currency : quote.currency} {prices[index]}
                                                            {index < plans.length - 1 && ", "}
                                                        </span>
                                                    ));
                                                })()}
                                            </p>
                                            {quote.discount_price && (
                                                <p>
                                                    <strong>Discounted Price:</strong>{" "}
                                                    {(() => {
                                                        const prices = quote.discount_price.split(",");
                                                        const plans = quote.plan.split(",");
                                                        return plans.map((plan, index) => (
                                                            <span
                                                                key={index}
                                                                className="bg-[#FFD700] px-1 py-2 rounded"
                                                            >
                                                                <strong>{plan}</strong>: {quote.currency === "Other" ? quote.other_currency : quote.currency} {prices[index]}
                                                                {index < plans.length - 1 && ", "}
                                                            </span>
                                                        ));
                                                    })()}
                                                </p>
                                            )}
                                            {quote.user_comments && (
                                                <p><strong>Comments:</strong> {quote.user_comments}</p>
                                            )}
                                        </>
                                    )}
                                    <p>
                                        <strong>Quote Status:</strong>{" "}
                                        <span
                                            className={
                                                quote.quote_status == 0
                                                    ? "badge-danger p-1 f-10"
                                                    : quote.quote_status == 1
                                                        ? "badge-success p-1 f-10"
                                                        : "badge-warning p-1 f-10"
                                            }
                                        >
                                            {quote.quote_status == 0
                                                ? "Pending"
                                                : quote.quote_status == 1
                                                    ? "Submitted"
                                                    : "Discount Requested"}
                                        </span>
                                    </p>
                                    {assignQuoteInfo && assignQuoteInfo !== false && (
                                        <p><strong>Assigned To:</strong> {assignQuoteInfo.name}</p>
                                    )}
                                    <p className={quote.feasability_status == 'Pending' ? "badge-danger p-1 f-10" : "badge-success p-1 f-10"}>
                                        Feasibility status is <strong>{quote.feasability_status}</strong>.
                                    </p>
                                    <p>
                                        <strong>Feasibility Comments:</strong>
                                    {quote.feasability_status == 'Completed' && (
                                            <span
                                                className='mt-2'
                                                dangerouslySetInnerHTML={{ __html: quote.feasability_comments }}
                                            />
                                        )}
                                        </p>
                                    {quote.feasability_status == "Pending" && (
                                        <div className="space-y-4">

                                            <form
                                                onSubmit={async (e) => {
                                                    e.preventDefault();


                                                    try {
                                                        const response = await fetch("https://apacvault.com/Webapi/completeFeasability", {
                                                            method: "POST",
                                                            headers: {
                                                                "Content-Type": "application/json",
                                                            },
                                                            body: JSON.stringify({
                                                                ref_id: queryId,
                                                                quote_id: quotationId,
                                                                feasability_comments: feasabilityComments,
                                                                user_id: loopUserObject.id,
                                                                ref_user_id: quote.user_id
                                                            }),
                                                        });

                                                        const result = await response.json();
                                                        if (result.status) {
                                                            toast.success("Feasibility completed successfully!");
                                                            fetchScopeDetails();
                                                        } else {
                                                            toast.error(result.message || "Failed to complete feasibility.");
                                                        }
                                                    } catch (error) {
                                                        toast.error("An error occurred while completing feasibility.");
                                                        console.error(error);
                                                    }
                                                }}
                                            >
                                                <label htmlFor="feasabilityComments" className="block text-sm font-medium text-gray-700">
                                                    Feasibility Comments
                                                </label>
                                                <ReactQuill
                                                    value={feasabilityComments}
                                                    onChange={setFeasabilityComments}
                                                    className="mt-1"
                                                    theme="snow"
                                                    placeholder="Add your comments here"

                                                />
                                                <div className='fkex items-center justify-end'>
                                                    <button
                                                        type="submit"
                                                        className="bg-green-500 mt-2 text-white px-2 py-1 rounded-md hover:bg-green-600 focus:outline-none "
                                                    >
                                                        Mark as Complete
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}
                                    </>) : (
                                        <div className='flex items-center p-1 rounded bg-red-100 text-red-700'>
                                            Umm..Looks like you dont have access for this request.<BotOff className='ml-3'/>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex justify-center items-center">
                            <p className="flex items-center justify-between">
                                <Info className="mr-2" /> No Previous Requests
                            </p>
                        </div>
                    )}

                    <AnimatePresence>
                        {transferForm && (
                            <TransferForm refId={queryId} quotationId={quotationId} onClose={()=>{setTransferForm(!transferForm)}} finalFunction={finalFunction}/>
                        )}
                    </AnimatePresence>

                </div>
            )}
            <ToastContainer />
        </div>
    );
};

export default FeasabilityUpdate;