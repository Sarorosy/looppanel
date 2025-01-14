import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CustomLoader from '../CustomLoader';
import { Chat } from './Chat';
import { ArrowDown, ArrowUp, History, CheckCircle, CheckCircle2, Paperclip, Hash, RefreshCcw, PlusCircle, Hourglass, CirclePause, CircleCheck, Bell, UserRoundPlus, Settings2, Pencil } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import AddTags from './AddTags';
import HistorySideBar from './HistorySideBar';
import FeasHistorySideBar from './FeasHistorySideBar';
import AllRequestSideBar from './AllRequestSideBar';
import ClientEmailSideBar from './ClientEmailSideBar';
import AddFollowers from './AddFollowers';
import { io } from "socket.io-client";
import EditRequestForm from './EditRequestForm';
import EditPriceComponent from './EditPriceComponent';
import EditFeasibilityCommentsComponent from './EditFeasabilityCommentsComponent';
import CompleteFeasability from './CompleteFeasability';
import MergedHistoryComponent from './MergedHistoryComponent';

const AskForScopeAdmin = ({ queryId, userType, quotationId, viewAll, clientEmail }) => {
    const socket = io("https://looppanelsocket.onrender.com", {
        reconnection: true,
        reconnectionAttempts: 50,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        autoConnect: true
    });
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
    const [totalCount, setTotalCount] = useState('0');
    const [amounts, setAmounts] = useState({});
    const [comment, setComment] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [adminComments, setAdminComments] = useState('');
    const [expandedRowIndex, setExpandedRowIndex] = useState(0);
    const [editFormOpen, setEditFormOpen] = useState(false);
    const [editingFormOpen, setEditingFormOpen] = useState(false);
    const [feascommentseditingFormOpen, setFeasCommentsEditingFormOpen] = useState(false);
    const [selectedQuoteId, setSelectedQuoteId] = useState('');
    const [selectedRefId, setSelectedRefId] = useState('');
    const [historyData, setHistoryData] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [userIdForTag, setUserIdForTag] = useState('');
    const [isFeasabilityCompleted, setIsFeasabilityCompleted] = useState(null);
    const [refIds, setRefIds] = useState([]);
    const [clientEmailDivOpen, setClientEmailDivOpen] = useState(false);
    const [followersFormOpen, setFollowersFormOpen] = useState(false);
    const [completeFeasabilityDiv, setCompleteFeasabilityDiv] = useState(false);

    const [selectedAllReqRefId, setSelectedAllReqRefId] = useState('');
    const [allRequestDivOpen, setAllRequestDivOpen] = useState(false);


    const [historyPanelOpen, SetHistoryPanelOpen] = useState(false);
    const [quoteIdForHistory, setQuoteIdForHistory] = useState('');

    const [feasHistoryPanelOpen, SetFeasHistoryPanelOpen] = useState(false);
    const [quoteIdForFeasHistory, setQuoteIdForFeasHistory] = useState('');
    const [refIdForFeasHistory, setRefIdForFeasHistory] = useState('');

    const loopuserData = localStorage.getItem('loopuser');
    const loopUserObject = JSON.parse(loopuserData);

    const thisUserId = loopUserObject.id

    const toggleAllRequestDiv = () => {
        setSelectedAllReqRefId(queryId);
        setAllRequestDivOpen((prev) => !prev)
    };

    const toggleHistoryDiv = ($id) => {
        setQuoteIdForHistory($id);
        SetHistoryPanelOpen(true);
    }
    const toggleClientEmailDiv = () => {
        setClientEmailDivOpen((prev) => !prev);
    };
    const toggleFollowersForm = (id, user_id) => {
        setSelectedQuoteId(id);
        setUserIdForTag(user_id);
        setFollowersFormOpen((prev) => !prev)
    };
    const toggleCompleteFeasability = (id, ref_id, user_id) => {
        setSelectedQuoteId(id);
        setSelectedRefId(ref_id);
        setSelectedUser(user_id);
        setCompleteFeasabilityDiv((prev) => !prev)
    };

    const toggleFeasHistoyDiv = (assign_id, quote_id) => {
        setQuoteIdForFeasHistory(quote_id);
        setRefIdForFeasHistory(assign_id);
        SetFeasHistoryPanelOpen((prev) => !prev);

    }

    const toggleRow = (index) => {
        setExpandedRowIndex(expandedRowIndex === index ? null : index);
    };
    const fetchScopeDetails = async () => {
        setLoading(true); // Show loading spinner
        let hasResponse = false;
        try {
            const response = await fetch(
                'https://apacvault.com/Webapi/adminScopeDetails',
                {
                    method: 'POST', // Use POST method
                    headers: {
                        'Content-Type': 'application/json', // Set content type to JSON
                    },
                    body: JSON.stringify({ ref_id: queryId, user_type: userType, quote_id: quotationId }),
                }
            );

            const data = await response.json(); // Parse the response as JSON
            console.log(data)
            if (data.status) {
                if (data.quoteInfo != null && Array.isArray(data.quoteInfo)) {

                    const parsedQuoteInfo = data.quoteInfo.map((quote) => ({
                        ...quote,
                        relevant_file: quote.relevant_file
                            ? JSON.parse(quote.relevant_file)
                            : [], // Parse the file data if present
                    }));

                    setScopeDetails(parsedQuoteInfo); // Set the array of quotes
                    setAssignQuoteInfo(data.assignQuoteInfo); // Assuming you also want to set assignQuoteInfo
                    setTotalCount(data.totalCounter ? data.totalCounter : '0');
                    setIsFeasabilityCompleted(data.isFeasabilityCompleted ? data.isFeasabilityCompleted : null);
                } else {
                    setScopeDetails(null); // If no quoteInfo, set scopeDetails to null
                }
            } else {
                console.error('Failed to fetch Details:', data.message);
            }
            hasResponse = true;
        } catch (error) {
            console.error('Error fetching details:', error);
        } finally {
            if (hasResponse) {
                setLoading(false); // Hide the loader
                fetchAllRefIds();
            }
        }
    };

    const fetchScopeDetailsForSocket = async () => {

        try {
            const response = await fetch(
                'https://apacvault.com/Webapi/adminScopeDetails',
                {
                    method: 'POST', // Use POST method
                    headers: {
                        'Content-Type': 'application/json', // Set content type to JSON
                    },
                    body: JSON.stringify({ ref_id: queryId, user_type: userType, quote_id: quotationId }),
                }
            );

            const data = await response.json(); // Parse the response as JSON
            console.log(data)
            if (data.status) {
                if (data.quoteInfo != null && Array.isArray(data.quoteInfo)) {

                    const parsedQuoteInfo = data.quoteInfo.map((quote) => ({
                        ...quote,
                        relevant_file: quote.relevant_file
                            ? JSON.parse(quote.relevant_file)
                            : [], // Parse the file data if present
                    }));

                    setScopeDetails(parsedQuoteInfo); // Set the array of quotes
                    setAssignQuoteInfo(data.assignQuoteInfo); // Assuming you also want to set assignQuoteInfo
                    setTotalCount(data.totalCounter ? data.totalCounter : '0');
                    setIsFeasabilityCompleted(data.isFeasabilityCompleted ? data.isFeasabilityCompleted : null);
                } else {
                    setScopeDetails(null); // If no quoteInfo, set scopeDetails to null
                }
            } else {
                console.error('Failed to fetch Details:', data.message);
            }

        } catch (error) {
            console.error('Error fetching details:', error);
        }
    };

    const fetchAllScopeDetails = async () => {
        setLoading(true); // Show loading spinner
        let hasResponse = false;
        try {
            const response = await fetch(
                'https://apacvault.com/Webapi/adminScopeDetails',
                {
                    method: 'POST', // Use POST method
                    headers: {
                        'Content-Type': 'application/json', // Set content type to JSON
                    },
                    body: JSON.stringify({ ref_id: queryId, user_type: userType, }),
                }
            );

            const data = await response.json(); // Parse the response as JSON
            console.log(data)
            if (data.status) {
                if (data.quoteInfo != null && Array.isArray(data.quoteInfo)) {

                    const parsedQuoteInfo = data.quoteInfo.map((quote) => ({
                        ...quote,
                        relevant_file: quote.relevant_file
                            ? JSON.parse(quote.relevant_file)
                            : [], // Parse the file data if present
                    }));
                    setTotalCount(data.totalCounter ? data.totalCounter : '0');

                    setScopeDetails(parsedQuoteInfo); // Set the array of quotes
                    setAssignQuoteInfo(data.assignQuoteInfo); // Assuming you also want to set assignQuoteInfo

                } else {
                    setScopeDetails(null); // If no quoteInfo, set scopeDetails to null
                }
            } else {
                console.error('Failed to fetch Details:', data.message);
            }
            hasResponse = true;
        } catch (error) {
            console.error('Error fetching details:', error);
        } finally {
            if (hasResponse) {
                setLoading(false); // Hide the loader
            }
        }
    };

    const updatePriceQuote = async () => {
        const data = {
            task_id: assignQuoteInfo.id,
            quoteid: assignQuoteInfo.quote_id,
            quote_price: quotePrice,
            user_comments: userComments,
        };

        try {
            // Show loading spinner
            setPriceLoading(true);

            const response = await fetch('https://instacrm.rapidcollaborate.com/api/updatepricequote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Set content type to JSON
                },
                body: JSON.stringify(data), // Send the data as JSON
            });

            const responseData = await response.json(); // Parse the response as JSON

            if (response.ok) {
                toast.success('Quote price updated successfully');
                setTimeout(() => {
                    fetchScopeDetails();
                }, 800)
            } else {
                toast.error('Failed to update quote price');
            }
        } catch (error) {
            console.error('Error updating price quote:', error);
        } finally {
            // Hide loading spinner
            setPriceLoading(false);
        }
    };

    const toggleEditForm = (id, user_id) => {
        setSelectedQuoteId(id);
        setUserIdForTag(user_id);
        setEditFormOpen((prev) => !prev)
    };
    const toggleEditingForm = (id) => {
        setSelectedQuoteId(id);
        setEditingFormOpen((prev) => !prev)
    };
    const toggleFeasCommentsEditingForm = (id) => {
        setSelectedQuoteId(id);
        setFeasCommentsEditingFormOpen((prev) => !prev)
    };

    const handleAmountChange = (e, plan) => {
        const value = e.target.value;

        setAmounts((prevAmounts) => {
            return {
                ...prevAmounts,
                [plan]: value, // Update the amount for the specific plan
            };
        });
    };

    const fetchAllRefIds = async () => {

        try {
            const response = await fetch('https://apacvault.com/webapi/selectallrefids/', {
                method: 'POST', // Use POST method
                headers: {
                    'Content-Type': 'application/json', // Set content type to JSON
                },
                body: JSON.stringify({ email: clientEmail }), // Send client email
            });

            const data = await response.json(); // Parse the response as JSON
            console.log("all refids " + data.ref_ids);

            if (data.status) {
                if (data.ref_ids && Array.isArray(data.ref_ids)) {
                    setRefIds(data.ref_ids); // Store ref_ids array in state
                } else {
                    setRefIds([]); // If no ref_ids, set an empty array
                }
            } else {
                console.error('Failed to fetch ref_ids:', data.message);
            }

        } catch (error) {
            console.error('Error fetching ref_ids:', error);
        }
    };

    useEffect(() => {
        socket.on('feasabilityDone', (data) => {
            if (data.quote_id == quotationId) {

                fetchScopeDetailsForSocket();
            }
        });

        return () => {
            socket.off('feasabilityDone');  // Clean up on component unmount
        };
    }, []);


    const PriceSubmitValidate = async (refId, quoteId, plans, userId) => {

        const form = document.getElementById('submitQuoteForm');


        // Define the amount variables
        const basicAmount = document.getElementById('amount_Basic')?.value.trim() || "0";
        const standardAmount = document.getElementById('amount_Standard')?.value.trim() || "0";
        const advancedAmount = document.getElementById('amount_Advanced')?.value.trim() || "0";

        // Create a map for plan amounts
        const planAmountMap = {
            Basic: basicAmount,
            Standard: standardAmount,
            Advanced: advancedAmount,
        };

        // Filter the selected plans and join the corresponding amounts
        const quoteAmount = plans
            .split(',') // Split the comma-separated plans
            .map(plan => planAmountMap[plan] || "0") // Get corresponding amounts, defaulting to "0"
            .join(',');

        try {
            // Show loading spinner
            setQuoteLoading(true);

            const response = await fetch('https://apacvault.com/Webapi/submittedtoadminquote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ref_id: refId,
                    quote_id: quoteId,
                    quote_amount: quoteAmount,
                    comment: comment,
                }), // Send the data as JSON
            });

            const responseData = await response.json(); // Parse the response as JSON

            if (response.ok) {

                setTimeout(() => {
                    fetchScopeDetails();
                }, 800);
                form.reset();
                document.getElementById('amount_Basic').value = '0';
                document.getElementById('amount_Standard').value = '0';
                document.getElementById('amount_Advanced').value = '0';
                setComment('');
                socket.emit("quoteSubmitted", {
                    quote_id: quoteId,
                    ref_id: refId,
                    user_id: userId,
                })

            } else {
                toast.error('Failed to update quote price');
            }
        } catch (error) {
            console.error('Error updating price quote:', error);
        } finally {
            // Hide loading spinner
            setQuoteLoading(false);
        }
    };


    const ValidateAssignTask = async () => {
        if (!selectedUser || !adminComments) {
            toast.error('Please select a user and provide comments');
            return; // Prevent form submission if validation fails
        }
        const data = {
            ref_id: scopeDetails.ref_id,
            quote_id: scopeDetails.id,
            assign_to_userid: selectedUser,
            admin_comments: adminComments,
        };

        try {
            // Show loading spinner
            setAssignLoading(true);

            const response = await fetch('https://instacrm.rapidcollaborate.com/api/submitassignquote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Set content type to JSON
                },
                body: JSON.stringify(data), // Send the data as JSON
            });

            const responseData = await response.json(); // Parse the response as JSON

            if (response.ok) {
                toast.success('Quote price updated successfully');
            } else {
                toast.error('Failed to update quote price');
            }
        } catch (error) {
            console.error('Error updating price quote:', error);
            toast.error('Error updating quote price');
        } finally {
            // Hide loading spinner
            setAssignLoading(false);
        }
    };

    useEffect(() => {
        if (queryId) {
            fetchScopeDetails(); // Fetch the scope details when the component mounts
        }
    }, [queryId]);

    useEffect(() => {
        socket.on('discountReceived', (data) => {
            if (data.quote_id == quotationId) {
                fetchScopeDetailsForSocket();
            }
        });

        return () => {
            socket.off('discountReceived');  // Clean up on component unmount
        };
    }, []);

    useEffect(() => {
        socket.on('demoDone', (data) => {
            if (data.ref_id == queryId) {
                fetchScopeDetailsForSocket();
            }
        });

        return () => {
            socket.off('demoDone');  // Clean up on component unmount
        };
    }, []);

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
    const referenceUrl = `https://instacrm.rapidcollaborate.com/managequote/view-askforscope/${scopeDetails?.ref_id}`;


    const handleUserChange = (event) => {
        setSelectedUser(event.target.value); // Update the state with selected user ID
    };



    return (
        <div className=" h-full bg-gray-100 shadow-lg z-50 overflow-y-auto mt-2 rounded w-full">
            <div className="flex items-center justify-between bg-blue-400 text-white py-2 px-3">
                <h2 className="text-xl font-semibold " >Ask For Scope </h2>
                <div className='flex items-center'>
                    {refIds && refIds.length > 0 && (
                        <div
                            title='You have new RefIds'
                            className='cursor-pointer flex items-center mx-2 px-2 py-1 rounded-full'
                            onClick={toggleClientEmailDiv}
                        >
                            <Bell size={20} className='text-yellow-200' />
                        </div>
                    )}
                    {isFeasabilityCompleted && isFeasabilityCompleted != null && (
                        <p className={`cursor-help flex items-center mx-2 px-2 py-1 rounded-full ${isFeasabilityCompleted.feasability_status === 'Pending'
                            ? 'bg-orange-100 text-orange-500'
                            : 'bg-green-100 text-green-600'
                            }`} title={`${isFeasabilityCompleted.feasability_status === 'Pending' ? 'Feasibility is Pending for his RefId' : 'Feasibility has been completed for this RefId'}`}>Feasibility {isFeasabilityCompleted.feasability_status == 'Pending' ? <CirclePause size={18} className='ml-2 text-orange-500' /> : <CircleCheck size={18} className='ml-2 text-green-700' />}</p>
                    )}
                    {viewAll && (
                        <button onClick={fetchAllScopeDetails} className='flex items-center mr-3 rounded px-2 py-1 f-14 btn-light'>
                            <Hourglass size={15} className='mr-1' /> <div>All <span className='px-2 py-1 rounded-full bg-blue-600 text-white ml-2'>{totalCount}</span></div>
                        </button>
                    )}
                    <RefreshCcw size={20} onClick={fetchScopeDetails} className='cursor-pointer' />
                </div>
            </div>

            {loading ? (
                <CustomLoader /> // A loader component when data is being fetched
            ) : (
                <div className="bg-white p-6 m-2 shadow rounded-md space-y-4">
                    {errorMessage && <p className="text-red-600">{errorMessage}</p>}

                    {scopeDetails && scopeDetails.length > 0 && (
                        <div>
                            {/* Table Header */}
                            <table className="w-full border-collapse border border-gray-200 f-14">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border px-4 py-2 text-left">Ref No.</th>
                                        <th className="border px-4 py-2 text-left">Quote Id.</th>
                                        <th className="border px-4 py-2 text-left">Currency</th>
                                        <th className="border px-4 py-2 text-left">Plan</th>
                                        <th className="border px-4 py-2 text-left">Service Name</th>
                                        <th className="border px-4 py-2 text-left">Quote Status</th>
                                        <th className="border px-4 py-2 text-left">Action</th>
                                    </tr>
                                </thead>
                                {/* Table Body */}
                                <tbody>
                                    {scopeDetails.map((quote, index) => (
                                        <React.Fragment key={index}>
                                            {/* Row */}
                                            <tr
                                                className="cursor-pointer hover:bg-gray-50"
                                            >
                                                <td className="border px-4 py-2">
                                                    <p className='flex items-center'>
                                                        {quote.assign_id}
                                                        {quote.ptp == "Yes" && (
                                                            <span
                                                                className="inline-block pl-3 pr-2 py-1 f-10 ml-1" // Increased padding for more space
                                                                style={{
                                                                    backgroundColor: '#2B9758FF', // Green color for PTP
                                                                    clipPath: 'polygon(25% 0%, 100% 0, 100% 99%, 25% 100%, 0% 50%)',
                                                                    color: '#ffffff',
                                                                    fontSize: '14px', // Increased font size for better visibility
                                                                    fontWeight: 'bold',
                                                                    lineHeight: '1.3', // Increased line height to make it visually balanced
                                                                }}
                                                            >
                                                                PTP
                                                            </span>
                                                        )}
                                                        {quote.edited == 1 && (
                                                            <span className="text-gray-600 bg-gray-200 rounded-full text-sm ml-2" style={{ fontSize: "11px", padding: "1px 6px" }}>Edited</span>
                                                        )}

                                                    </p>
                                                </td>
                                                <td className="border px-4 py-2" style={{ fontSize: "11px" }}>{quote.quoteid}</td>
                                                <td className="border px-4 py-2" style={{ fontSize: "11px" }}>{quote.currency}</td>
                                                <td className="border px-4 py-2" style={{ fontSize: "11px" }}>{quote.plan}</td>
                                                <td className="border px-4 py-2" style={{ fontSize: "11px" }}>{quote.service_name || 'N/A'}</td>
                                                <td className="border px-4 py-2" style={{ fontSize: "11px" }}>
                                                    <span
                                                        className={
                                                            quote.quote_status == 0
                                                                ? 'text-red-600' // Pending - Red
                                                                : quote.quote_status == 1
                                                                    ? 'text-green-600' // Submitted - Green
                                                                    : quote.quote_status == 2
                                                                        ? 'text-yellow-600' // Discount Requested - Yellow
                                                                        : 'text-gray-600' // Default - Gray for Unknown
                                                        }
                                                    >
                                                        {
                                                            quote.quote_status == 0 && quote.submittedtoadmin == 'false'
                                                                ? 'Pending at User'
                                                                : quote.quote_status == 0 && quote.submittedtoadmin == 'true'
                                                                    ? 'Pending at Admin'
                                                                    : quote.quote_status == 1
                                                                        ? 'Submitted'
                                                                        : quote.quote_status == 2
                                                                            ? 'Discount Requested'
                                                                            : 'Unknown'
                                                        }
                                                    </span>
                                                    {quote.isfeasability == 1 && quote.feasability_status == "Completed" && (
                                                        <><br /><span className='text-green-700 text-sm' style={{ fontSize: "11px" }}>Feasibility Completed</span></>
                                                    )}
                                                    {quote.isfeasability == 1 && quote.feasability_status == "Pending" && (
                                                        <><br /><span className='text-red-700 text-sm font-bold' style={{ fontSize: "11px" }}>Feasibility Pending</span></>
                                                    )}
                                                    {quote.isfeasability == 1 && quote.feasability_status == "Pending" && loopUserObject.id != "206" && (
                                                        <button onClick={() => { toggleCompleteFeasability(quote.quoteid, quote.assign_id, quote.user_id) }} className='bg-green-100 text-green-600 px-2 py-1 rounded' style={{fontSize:"11px"}}>
                                                            Give Feasibility
                                                        </button>
                                                    )}
                                                </td>
                                                <td className=" px-4 py-2 flex items-center">
                                                    {/* Up/Down Arrow Button */}
                                                    <button
                                                        onClick={() => toggleRow(index)}
                                                        className="flex items-center justify-center p-2"
                                                    >
                                                        {expandedRowIndex === index ? <ArrowUp size={20} className='bg-blue-500 p-1 rounded-full text-white' /> : <ArrowDown size={20} className='bg-blue-500 p-1 rounded-full text-white' />}
                                                    </button>

                                                    <button onClick={() => { toggleEditForm(quote.quoteid, quote.user_id) }}
                                                        className='flex items-center rounded-full border-2 border-blue-500'>
                                                        <Hash className='p-1' />
                                                    </button>
                                                    <button onClick={() => { toggleFollowersForm(quote.quoteid, thisUserId) }} className='flex items-center rounded-full border-2 border-blue-500 mx-2'>
                                                        <UserRoundPlus className='p-1' />
                                                    </button>

                                                </td>
                                            </tr>
                                            {/* Accordion */}
                                            {expandedRowIndex == index && (
                                                <tr>
                                                    <td colSpan={7} className="border px-4 py-4 bg-gray-50">
                                                        <div className="space-y-4 text-sm">
                                                            <p className='d-flex align-items-center'><strong>Ref No.:</strong>
                                                                {quote.assign_id}
                                                                {quote.ptp == "Yes" && (
                                                                    <span
                                                                        className="inline-block pl-3 pr-2 py-1 f-10 ml-1" // Increased padding for more space
                                                                        style={{
                                                                            backgroundColor: '#2B9758FF', // Green color for PTP
                                                                            clipPath: 'polygon(25% 0%, 100% 0, 100% 99%, 25% 100%, 0% 50%)',
                                                                            color: '#ffffff',
                                                                            fontSize: '14px', // Increased font size for better visibility
                                                                            fontWeight: 'bold',
                                                                            lineHeight: '1.5', // Increased line height to make it visually balanced
                                                                        }}
                                                                    >
                                                                        PTP
                                                                    </span>
                                                                )}

                                                                {quote.edited == 1 && (
                                                                    <span className="text-gray-600 bg-gray-200 rounded-full text-sm ml-2" style={{ fontSize: "11px", padding: "1px 6px" }}>Edited</span>
                                                                )}
                                                            </p>
                                                            {quote.tag_names && (
                                                                <p>
                                                                    <strong>Tags:</strong>
                                                                    {quote.tag_names.split(',').map((tag, index) => (
                                                                        <span
                                                                            key={index}
                                                                            className="text-blue-500 p-1 rounded-full text-sm font-medium inline-block ml-1"
                                                                        >
                                                                            #{tag.trim()}
                                                                        </span>
                                                                    ))}
                                                                </p>
                                                            )}

                                                            {quote.service_name && quote.plan && (
                                                                <>
                                                                    <p><strong>Service Required:</strong> {quote.service_name}</p>
                                                                    {quote.old_plan && (
                                                                        <p className='text-gray-500'><strong>Old Plan:</strong> {quote.old_plan}</p>
                                                                    )}
                                                                    <p><strong>Plan:</strong> {quote.plan}</p>
                                                                </>
                                                            )}
                                                            {quote.plan_comments && quote.plan_comments !== "" && quote.plan_comments !== null && (
                                                                <div>
                                                                    <p className='mb-2'><strong style={{ textDecoration: "underline" }}>Plan Description:</strong></p>
                                                                    {Object.entries(JSON.parse(quote.plan_comments)).map(([plan, comment], index) => (
                                                                        <p key={index}><strong>{plan}:</strong> <span dangerouslySetInnerHTML={{ __html: comment }} /></p>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {quote.comments && quote.comments != "" && quote.comments != null && (
                                                                <p><strong style={{ textDecoration: "underline" }}>Description:</strong>  <span dangerouslySetInnerHTML={{ __html: quote.comments }} /></p>
                                                            )}
                                                            {quote.final_comments != null && (
                                                                <div >
                                                                    <p><strong>Final Comments:</strong> {quote.final_comments}</p>
                                                                </div>
                                                            )}
                                                            {quote.relevant_file && quote.relevant_file.length > 0 && (
                                                                <div>
                                                                    <strong>Relevant Files:</strong>
                                                                    <div className="space-y-2 mt-2">
                                                                        {quote.relevant_file.map((file, fileIndex) => (
                                                                            <div key={fileIndex}>
                                                                                <a
                                                                                    href={`https://apacvault.com/public/QuotationFolder/${file.file_path}`}
                                                                                    download
                                                                                    target='_blank'
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
                                                                    {quote.ptp_amount && quote.ptp_amount != 0 && (
                                                                        <p><strong>PTP Amount:</strong> {quote.ptp_amount}</p>
                                                                    )}
                                                                    {quote.ptp == "Yes" && (
                                                                        <p><strong >PTP Comments:</strong> {quote.ptp_comments}</p>
                                                                    )}
                                                                    {quote.ptp_file != null && (
                                                                        <p><strong>Attached File : </strong><a className='text-blue-500 font-semibold' href={`https://apacvault.com/public/${quote.ptp_file}`} download={quote.ptpfile} target='_blank'>{quote.ptp_file}</a></p>
                                                                    )}
                                                                </>
                                                            )}
                                                            {quote.demodone != 0 && (
                                                                <>
                                                                    <p className='flex items-center '>  <p className=''> <strong>Demo Id : </strong> {quote.demo_id}</p> <span className='badge-success px-2 py-0 ml-3 rounded-sm text-white-900 font-semibold flex items-center f-12'>Demo Completed <CheckCircle2 size={12} className='ml-1' /> </span></p>
                                                                </>
                                                            )}
                                                            {quote.quote_status != 0 && quote.quote_price && quote.plan && (
                                                                <>
                                                                    {quote.old_plan && (
                                                                        <p className='text-gray-600'>
                                                                            <strong>Quote Price For Old Plan:</strong>{' '}
                                                                            {(() => {
                                                                                const prices = quote.quote_price.split(','); // Split quote_price into an array
                                                                                const plans = quote.old_plan.split(','); // Split plan into an array
                                                                                return plans.map((plan, index) => (
                                                                                    <span key={index} className="line-through bg-gray-200 p-1 mx-1 rounded border border-gray-500">
                                                                                        <strong>{plan} </strong>: {quote.currency == "Other" ? quote.other_currency : quote.currency} {prices[index] ? prices[index] : 0}
                                                                                        {index < plans.length - 1 && ', '}
                                                                                    </span>
                                                                                ));
                                                                            })()}
                                                                        </p>

                                                                    )}
                                                                    {quote.quote_status != 2 && (
                                                                        <p>
                                                                            <strong>Quote Price:</strong>{' '}
                                                                            {(() => {
                                                                                const prices = quote.quote_price.split(','); // Split quote_price into an array
                                                                                const plans = quote.plan.split(','); // Split plan into an array
                                                                                return plans.map((plan, index) => (
                                                                                    <span key={index} className={`${quote.discount_price != null ? "line-through bg-red-200 p-1 rounded mr-1 f-12" : ""}`}>
                                                                                        <strong>{plan} </strong>: {quote.currency == "Other" ? quote.other_currency : quote.currency} {prices[index] ? prices[index] : 0}
                                                                                        {index < plans.length - 1 && ', '}
                                                                                    </span>
                                                                                ));
                                                                            })()}
                                                                        </p>
                                                                    )}

                                                                    {quote.discount_price && (
                                                                        <p>
                                                                            <strong>Discounted Price:</strong>{' '}
                                                                            {(() => {
                                                                                const prices = quote.discount_price.split(','); // Split quote_price into an array
                                                                                const plans = quote.plan.split(','); // Split plan into an array
                                                                                return plans.map((plan, index) => (
                                                                                    <span key={index} className='silver px-1 py-1 f-12 rounded mr-1'>
                                                                                        <strong>{plan} </strong>: {quote.currency == "Other" ? quote.other_currency : quote.currency} {prices[index] ?? 0}
                                                                                        {index < plans.length - 1 && ', '}
                                                                                    </span>
                                                                                ));
                                                                            })()}
                                                                        </p>
                                                                    )}
                                                                    {quote.final_price && (
                                                                        <p >
                                                                            <strong>Final Price:</strong>{' '}
                                                                            {(() => {
                                                                                const prices = quote.final_price.split(','); // Split quote_price into an array
                                                                                const plans = quote.plan.split(','); // Split plan into an array
                                                                                return plans.map((plan, index) => (
                                                                                    <span key={index} className=' px-1 py-2 rounded mr-1 gold'>
                                                                                        <strong>{plan} </strong>: {quote.currency == "Other" ? quote.other_currency : quote.currency} {prices[index]}
                                                                                        {index < plans.length - 1 && ', '}
                                                                                    </span>
                                                                                ));
                                                                            })()}
                                                                        </p>
                                                                    )}
                                                                    <p className='flex items-center'>
                                                                        Edit Quote Price
                                                                        {(quote.quote_status == 1) && loopUserObject.id != "206" && (
                                                                            <button onClick={() => { toggleEditingForm(quote) }}
                                                                                className='flex items-center rounded-full border-2 border-blue-500 mx-2'>
                                                                                <Pencil className='p-1' />
                                                                            </button>
                                                                        )}
                                                                    </p>
                                                                    {quote.user_comments && (
                                                                        <p><strong style={{ textDecoration: "underline" }}>Admin Comments:</strong> {quote.user_comments}</p>
                                                                    )}
                                                                </>
                                                            )}
                                                            {assignQuoteInfo && assignQuoteInfo != false && (
                                                                <p><strong>Assigned To:</strong> {assignQuoteInfo.name}</p>
                                                            )}

                                                            {assignQuoteInfo && assignQuoteInfo != false && (
                                                                <>
                                                                    {assignQuoteInfo.status === 0 ? (
                                                                        <>
                                                                            <p><strong>Assigned To:</strong> {assignQuoteInfo.name}</p>
                                                                            <p><strong>Assign Date:</strong> {assignQuoteInfo.assigned_date}</p>
                                                                            <p><strong>Admin Comments:</strong> {assignQuoteInfo.admin_comments}</p>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <p>Submitted by {assignQuoteInfo.name}</p>
                                                                            <p><strong>Price:</strong> {assignQuoteInfo.currency} {assignQuoteInfo.quote_price}</p>
                                                                            <p><strong>Submitted Date:</strong> {new Date(assignQuoteInfo.user_submitted_date * 1000).toLocaleDateString('en-GB')}
                                                                                {new Date(assignQuoteInfo.user_submitted_date * 1000).toLocaleTimeString('en-GB', {
                                                                                    hour: '2-digit',
                                                                                    minute: '2-digit',
                                                                                    hour12: true,
                                                                                })}</p>
                                                                            <p><strong>Assigned Comments:</strong> {assignQuoteInfo.admin_comments}</p>
                                                                            <p><strong>Comments:</strong> {assignQuoteInfo.user_comments != "" ? assignQuoteInfo.user_comments : assignQuoteInfo.admin_comments}</p>
                                                                        </>
                                                                    )
                                                                    }
                                                                    {assignQuoteInfo.status == 1 && (

                                                                        <form name="edit_price_form" id="edit_price_form" className="form-horizontal">
                                                                            <div className="box-body">
                                                                                <input type="hidden" name="task_id" id="task_id" value={assignQuoteInfo.id} />
                                                                                <input type="hidden" name="quoteid" id="quoteid" value={assignQuoteInfo.quote_id} />
                                                                                <div className="form-group">
                                                                                    <label className="col-sm-3 control-label">Quote Price (INR)</label>
                                                                                    <div className="col-sm-12">
                                                                                        <input
                                                                                            type="text"
                                                                                            className="form-control"
                                                                                            id="quote_price"
                                                                                            name="quote_price"
                                                                                            value={quotePrice || assignQuoteInfo?.quote_price || ''}
                                                                                            placeholder="Quote Price"
                                                                                            onChange={(e) => setQuotePrice(e.target.value)}
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                                <div className="form-group">
                                                                                    <label className="col-sm-3 control-label">Comments</label>
                                                                                    <div className="col-sm-12">
                                                                                        <textarea
                                                                                            className="form-control"
                                                                                            id="user_comments"
                                                                                            name="user_comments"
                                                                                            value={userComments || assignQuoteInfo?.user_comments || assignQuoteInfo?.admin_comments || ''}
                                                                                            onChange={(e) => setUserComments(e.target.value)}
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            <div className="modal-footer tabb">
                                                                                <span id="load_btn">
                                                                                    <button
                                                                                        type="button"
                                                                                        className="btn"
                                                                                        onClick={() => updatePriceQuote()}
                                                                                        disabled={priceLoading}
                                                                                    >
                                                                                        Confirm
                                                                                    </button>
                                                                                </span>
                                                                            </div>
                                                                        </form>
                                                                    )}
                                                                </>
                                                            )}
                                                            {quote.quote_status != 1 && quote.submittedtoadmin == "true" && loopUserObject.id != "206" && (
                                                                <>
                                                                    <div className="nav-tabs-custom tabb">
                                                                        <ul className="nav nav-tabs">
                                                                            <li>
                                                                                <a href="#tab_2" data-toggle="tab">
                                                                                    Submit Price
                                                                                </a>
                                                                            </li>
                                                                        </ul>
                                                                        <div className="tab-content">

                                                                            <div className="tab-pane active" id="tab_2">
                                                                                <form method="post" name="submitQuoteForm" id="submitQuoteForm" className="form-horizontal">
                                                                                    <input type="hidden" name="ref_id" value={quote.assign_id} />
                                                                                    <input type="hidden" name="quote_id" value={quote.quoteid} />
                                                                                    <div className="box-body p-2">
                                                                                        <div className='row'>
                                                                                            {['Basic', 'Standard', 'Advanced'].map((plan, index) => (
                                                                                                <div className="form-group col-4" key={index}>
                                                                                                    <label
                                                                                                        htmlFor={`amount_${plan}`}
                                                                                                        className="control-label"
                                                                                                    >
                                                                                                        Amount for <strong>{plan} ({quote.currency === "Other" ? quote.other_currency : quote.currency})</strong>
                                                                                                    </label>
                                                                                                    <div className="">
                                                                                                        <input
                                                                                                            type="text"
                                                                                                            name={`amount_${plan}`}
                                                                                                            id={`amount_${plan}`}
                                                                                                            className="form-control"
                                                                                                            value={amounts[plan] || ''} // Default to empty if no amount is set
                                                                                                            required={quote.plan && quote.plan.split(',').includes(plan)} // Required only if the plan is included in quote.plan
                                                                                                            disabled={!quote.plan || !quote.plan.split(',').includes(plan)} // Disable if the plan is not in quote.plan
                                                                                                            onChange={(e) => handleAmountChange(e, plan)}
                                                                                                        />
                                                                                                        <div className="error" id={`amountError_${plan}`}></div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            ))}


                                                                                            <div className="form-group col-sm-12">
                                                                                                <label htmlFor="comment" className="col-sm-3 control-label">Comments</label>
                                                                                                <div className="">
                                                                                                    <textarea name="comment" id="comment" placeholder="Comments" className="form-control" value={comment} onChange={(e) => setComment(e.target.value)}></textarea>
                                                                                                    <div className="error" id="commentError"></div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="box-footer p-2">
                                                                                        <input
                                                                                            type="button"
                                                                                            name="priceSubmitted"
                                                                                            className="btn pull-right btn-success"
                                                                                            value="Submit"
                                                                                            onClick={() => PriceSubmitValidate(quote.assign_id, quote.quoteid, quote.plan, quote.user_id)}
                                                                                            disabled={priceLoading}
                                                                                        />
                                                                                    </div>
                                                                                </form>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}
                                                            {quote.isfeasability == 1 && (
                                                                <>
                                                                    <div className='flex flex-col items-start justify-start'>


                                                                    </div>

                                                                    {quote.feasability_status == "Completed" && (
                                                                        <>
                                                                            <p style={{ textDecoration: "italic" }} className='italic'>
                                                                                Feasibility Comments:
                                                                                {loopUserObject.id != "206" && (
                                                                                    <button onClick={() => { toggleFeasCommentsEditingForm(quote) }}
                                                                                        className='flex items-center rounded-full border-2 border-blue-500 mx-2'>
                                                                                        <Pencil className='p-1' />
                                                                                    </button>
                                                                                )}
                                                                                <span
                                                                                    className='mt-2'
                                                                                    dangerouslySetInnerHTML={{ __html: quote.feasability_comments }}
                                                                                />
                                                                            </p>
                                                                            {quote.feas_file_name && (
                                                                                <p className='flex items-center'>Feasibility Attachment : <a href={"https://apacvault.com/public/feasabilityFiles/" + quote.feas_file_name} target='_blank' className='text-blue-600 flex items-center'><Paperclip size={20} /> View File</a></p>
                                                                            )}
                                                                        </>
                                                                    )}

                                                                </>
                                                            )}

                                                        </div>
                                                        <Chat quoteId={quote.quoteid} refId={quote.assign_id} status={quote.quote_status} submittedToAdmin={quote.submittedtoadmin} finalFunction={fetchScopeDetails} allDetails={quote} finalfunctionforsocket={fetchScopeDetailsForSocket} />
                                                        <MergedHistoryComponent quoteId={quote.quoteid} refId={quote.assign_id} />
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>

                        </div>
                    )}
                </div>
            )}
            <ToastContainer />
            <AnimatePresence>

                {editFormOpen && (
                    <AddTags quoteId={selectedQuoteId} refId={queryId} userId={userIdForTag} onClose={() => { setEditFormOpen(!editFormOpen) }} after={fetchScopeDetails} notification="yes" />
                )}
                {historyPanelOpen && (
                    <HistorySideBar quoteId={quoteIdForHistory} refId={queryId} onClose={() => { SetHistoryPanelOpen(!historyPanelOpen) }} />
                )}

                {feasHistoryPanelOpen && (
                    <FeasHistorySideBar quoteId={quoteIdForFeasHistory} refId={refIdForFeasHistory} onClose={() => { SetFeasHistoryPanelOpen(!feasHistoryPanelOpen) }} />
                )}
                {allRequestDivOpen && (
                    <AllRequestSideBar refId={queryId} onClose={() => { setAllRequestDivOpen(!allRequestDivOpen) }} />
                )}
                {clientEmailDivOpen && (
                    <ClientEmailSideBar refIds={refIds} onClose={() => { setClientEmailDivOpen(!clientEmailDivOpen) }} />
                )}
                {followersFormOpen && (
                    <AddFollowers quoteId={selectedQuoteId} refId={queryId} onClose={() => { setFollowersFormOpen(!followersFormOpen) }} after={fetchScopeDetails} />
                )}
                {editingFormOpen && (
                    <EditPriceComponent quote={selectedQuoteId} PriceSubmitValidate={PriceSubmitValidate} refId={queryId} onClose={() => { setEditingFormOpen(!editingFormOpen) }} after={fetchScopeDetailsForSocket} />
                )}
                {feascommentseditingFormOpen && (
                    <EditFeasibilityCommentsComponent quote={selectedQuoteId} onClose={() => { setFeasCommentsEditingFormOpen(!feascommentseditingFormOpen) }} after={fetchScopeDetailsForSocket} />
                )}
                {completeFeasabilityDiv && (
                    <CompleteFeasability onClose={() => { setCompleteFeasabilityDiv(!completeFeasabilityDiv) }} quoteId={selectedQuoteId} refId={selectedRefId} userId={selectedUser} after={fetchScopeDetailsForSocket} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default AskForScopeAdmin;