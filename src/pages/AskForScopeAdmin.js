import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CustomLoader from '../CustomLoader';
import { Chat } from './Chat';
import { ArrowDown, ArrowUp,History, CheckCircle, CheckCircle2, Hash, RefreshCcw } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import AddTags from './AddTags';
const AskForScopeAdmin = ({ queryId, userType, quotationId }) => {
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
    const [amounts, setAmounts] = useState({});
    const [comment, setComment] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [adminComments, setAdminComments] = useState('');
    const [expandedRowIndex, setExpandedRowIndex] = useState(0);
    const [editFormOpen, setEditFormOpen] = useState(false);
    const [selectedQuoteId, setSelectedQuoteId] = useState('');
    const [historyData, setHistoryData] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [userIdForTag, setUserIdForTag] = useState('');

    const toggleRow = (index) => {
        setExpandedRowIndex(expandedRowIndex === index ? null : index);
    };
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
                    body: JSON.stringify({ ref_id: queryId, user_type:userType, quote_id:quotationId }),
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
            } else {
                toast.error('Failed to update quote price');
            }
        } catch (error) {
            console.error('Error updating price quote:', error);
            toast.error('Error updating quote price');
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

    const PriceSubmitValidate = async (refId, quoteId) => {
        let isAmountEmpty = false;
        Object.keys(amounts).forEach((key) => {
            const amount = amounts[key].trim();
    
            if (!amount || !/^\d+(\.\d{1,2})?$/.test(amount)) {
                isAmountEmpty = true;  // If it's empty or not a valid number, flag it
            }
        });

    // Check if the comment field is empty
    if (isAmountEmpty) {
        toast.error('Please check all fields');
        return; // Prevent form submission if validation fails
    }
    const form = document.getElementById('submitQuoteForm');

    // Trigger native form validation
    if (!form.checkValidity()) {
        toast.error('Please fill in all the required fields');
        return; // Prevent form submission if validation fails
    }

        try {
            // Show loading spinner
            setQuoteLoading(true);

            const response = await fetch('https://apacvault.com/Webapi/submittedtoadminquote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ref_id: refId,
                    quote_id: quoteId,
                    quote_amount: Object.values(amounts).join(','),
                    comment: comment,
                }), // Send the data as JSON
            });

            const responseData = await response.json(); // Parse the response as JSON

            if (response.ok) {
                toast.success('Quote price updated successfully');
                fetchScopeDetails();
            } else {
                toast.error('Failed to update quote price');
            }
        } catch (error) {
            console.error('Error updating price quote:', error);
            toast.error('Error updating quote price');
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
                <RefreshCcw size={20} onClick={fetchScopeDetails} className='cursor-pointer' />
            </div>

            {loading ? (
                <CustomLoader /> // A loader component when data is being fetched
            ) : (
                <div className="bg-white p-6 m-2 shadow rounded-md space-y-4">
                    {errorMessage && <p className="text-red-600">{errorMessage}</p>}

                    {scopeDetails && scopeDetails.length > 0 && (
                        <div>
                            {/* Table Header */}
                            <table className="w-full border-collapse border border-gray-200">
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
                                                                className="inline-block p-1 ml-1" // Increased padding for more space
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
                                                        
                                                    </p>
                                                </td>
                                                <td className="border px-4 py-2">{quote.quoteid}</td>
                                                <td className="border px-4 py-2">{quote.currency}</td>
                                                <td className="border px-4 py-2">{quote.plan}</td>
                                                <td className="border px-4 py-2">{quote.service_name || 'N/A'}</td>
                                                <td className="border px-4 py-2">
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
                                                        {quote.quote_status == 0
                                                            ? 'Pending'
                                                            : quote.quote_status == 1
                                                                ? 'Submitted'
                                                                : quote.quote_status == 2
                                                                    ? 'Discount Requested'
                                                                    : 'Unknown'}
                                                    </span>
                                                    {quote.isfeasability == 1 && quote.feasability_status == "Completed" && (
                                                        <><br/><span className='text-green-700 text-sm'>Feasability Completed</span></>
                                                    )}
                                                </td>
                                                <td className="border px-4 py-2 flex items-center">
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
                                                    
                                                </td>
                                            </tr>
                                            {/* Accordion */}
                                            {expandedRowIndex == index && (
                                                <tr>
                                                    <td colSpan={7} className="border px-4 py-4 bg-gray-50">
                                                        <div className="space-y-4 text-sm">
                                                            <p><strong>Ref No.:</strong>
                                                                {quote.assign_id}
                                                                {quote.ptp == "Yes" && (
                                                                    <span
                                                                        className="inline-block ml-2 py-3 px-4" // Increased padding for more space
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
                                                            </p>
                                                            {quote.tag_names && (
                                                                <p>
                                                                    <strong>Tags:</strong>
                                                                    {quote.tag_names.split(',').map((tag, index) => (
                                                                        <span
                                                                            key={index}
                                                                            className="text-blue-500 hover:bg-blue-100 hover:text-blue-600  p-1 rounded-full text-sm font-medium inline-block ml-1"
                                                                        >
                                                                            #{tag.trim()}
                                                                        </span>
                                                                    ))}
                                                                </p>
                                                            )}
                                                            <p><strong>Currency:</strong> {quote.currency == "Other" ? quote.other_currency : quote.currency}</p>
                                                            {quote.service_name && quote.plan && (
                                                                <>
                                                                    <p><strong>Service Required:</strong> {quote.service_name}</p>
                                                                    <p><strong>Plan:</strong> {quote.plan}</p>
                                                                </>
                                                            )}
                                                            <p className='flex '><strong>Comments: </strong> <span dangerouslySetInnerHTML={{ __html: quote.comments }} /></p>
                                                            <p><strong>Created Date:</strong> {new Date(quote.created_date * 1000).toLocaleDateString('en-GB')}</p>
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
                                                            <p>
                                                                <strong>Status:</strong>
                                                                <span
                                                                    className={quote.quote_status == 0
                                                                        ? "badge-danger p-1 f-10" // Red for Pending
                                                                        : quote.quote_status == 1
                                                                            ? "badge-success p-1 f-10" // Green for Submitted
                                                                            : "badge-warning p-1 f-10"} // Yellow for Discount Requested
                                                                >
                                                                    {quote.quote_status == 0
                                                                        ? "Pending"
                                                                        : quote.quote_status == 1
                                                                            ? "Submitted"
                                                                            : "Discount Requested"}
                                                                </span>
                                                            </p>

                                                            {quote.ptp != null && (
                                                                <>
                                                                    <p><strong>PTP:</strong> {quote.ptp}</p>
                                                                    <p><strong>PTP Comments:</strong> {quote.ptp_comments}</p>
                                                                </>
                                                            )}
                                                            {quote.demodone != 0 && (
                                                                <>
                                                                    <p className='flex items-center '><span className='bg-green-100 px-2 py-1 rounded-full text-green-900 font-semibold flex items-center'>Demo Completed <CheckCircle2 size={15} className='ml-2' /> </span> <p className='ml-3'> <strong>Demo Id : </strong> {quote.demo_id}</p></p>
                                                                </>
                                                            )}
                                                            {quote.quote_status != 0 && quote.quote_price && quote.plan && (
                                                                <>
                                                                    <p>
                                                                        <strong>Quote Price:</strong>{' '}
                                                                        {(() => {
                                                                            const prices = quote.quote_price.split(','); // Split quote_price into an array
                                                                            const plans = quote.plan.split(','); // Split plan into an array
                                                                            return plans.map((plan, index) => (
                                                                                <span key={index} className={`${quote.discount_price != null ? "line-through bg-red-200 p-1 rounded" : ""}`}>
                                                                                    <strong>{plan} </strong>: {quote.currency == "Other" ? quote.other_currency : quote.currency} {prices[index]}
                                                                                    {index < plans.length - 1 && ', '}
                                                                                </span>
                                                                            ));
                                                                        })()}
                                                                    </p>
                                                                    {quote.discount_price && (
                                                                    <p>
                                                                        <strong>Discounted Price:</strong>{' '}
                                                                        {(() => {
                                                                            const prices = quote.discount_price.split(','); // Split quote_price into an array
                                                                            const plans = quote.plan.split(','); // Split plan into an array
                                                                            return plans.map((plan, index) => (
                                                                                <span key={index} className='bg-[#FFD700] px-1 py-2 rounded'>
                                                                                    <strong>{plan} </strong>: {quote.currency == "Other" ? quote.other_currency : quote.currency} {prices[index]}
                                                                                    {index < plans.length - 1 && ', '}
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
                                                            {quote.quote_status !=1 && (
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
                                                                                    <div className="box-body">
                                                                                        <div className='row'>
                                                                                        {quote.plan &&
                                                                                            quote.plan.split(',').map((plan, index) => (
                                                                                                    <div className="form-group col-md-6" key={index}>
                                                                                                        <label
                                                                                                            htmlFor={`amount_${plan.trim()}`}
                                                                                                            className="col-sm-12 control-label"
                                                                                                        >
                                                                                                            Amount for <strong>{plan.trim()} ({quote.currency}) </strong>
                                                                                                        </label>
                                                                                                        <div className="col-sm-12">
                                                                                                            <input
                                                                                                                type="text"
                                                                                                                name={`amount_${plan.trim()}`}
                                                                                                                id={`amount_${plan.trim()}`}
                                                                                                                className="form-control"
                                                                                                                value={amounts[plan.trim()] || ''}
                                                                                                                required
                                                                                                                onChange={(e) =>
                                                                                                                    setAmounts({
                                                                                                                        ...amounts,
                                                                                                                        [plan.trim()]: e.target.value,
                                                                                                                    })
                                                                                                                }
                                                                                                            />
                                                                                                            <div className="error" id={`amountError_${plan.trim()}`}></div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                            ))}
                                                                                            </div>
                                                                                        <div className="form-group">
                                                                                            <label htmlFor="comment" className="col-sm-3 control-label">Comments</label>
                                                                                            <div className="col-sm-12">
                                                                                                <textarea name="comment" id="comment" placeholder="Comments" className="form-control" value={comment} onChange={(e) => setComment(e.target.value)}></textarea>
                                                                                                <div className="error" id="commentError"></div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="box-footer greens">
                                                                                        <input
                                                                                            type="button"
                                                                                            name="priceSubmitted"
                                                                                            className="btn pull-right"
                                                                                            value="Submit"
                                                                                            onClick={() => PriceSubmitValidate(quote.assign_id, quote.quoteid)}
                                                                                            disabled={priceLoading}
                                                                                        />
                                                                                    </div>
                                                                                </form>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}
                                                            {quote.isfeasability == 1 && quote.feasability_status == "Completed" && (
                                                                <>
                                                                    <div className='flex items-center'>
                                                                        <>
                                                                            <p><strong>Feasability Status:</strong> <span className={`${quote.feasability_status == "Pending" ? "text-red-600" : "text-green-600"}`}>{quote.feasability_status}</span></p>

                                                                            {/* Button to View History */}
                                                                            <button
                                                                                onClick={() => fetchFeasibilityHistory(quote.assign_id, quote.quoteid)}
                                                                                className="bg-blue-400 text-white p-1 rounded hover:bg-blue-600 ml-3"
                                                                            >
                                                                                <History size={18} />
                                                                            </button>
                                                                        </>
                                                                        
                                                                    </div>

                                                                    {quote.feasability_status == "Completed" && (

                                                                        <p>
                                                                            Feasibility Comments:
                                                                            <span
                                                                                className='mt-2'
                                                                                dangerouslySetInnerHTML={{ __html: quote.feasability_comments }}
                                                                            />
                                                                        </p>
                                                                    )}
                                                                    {historyLoading && <CustomLoader />}
                                                                    {historyData.length > 0 && (
                                                                        <div className="mt-4 space-y-4">
                                                                            <strong className="">Feasibility Check History:</strong>
                                                                            <div className="border-l-2 border-gray-300 pl-4">
                                                                                {historyData.map((historyItem, index) => (
                                                                                    <div key={historyItem.id} className="mb-4">
                                                                                        <div className="flex items-start space-x-3">
                                                                                            {/* Timeline Icon */}
                                                                                            <div className="w-h-2 bg-blue-500 rounded-full mt-1"></div>
                                                                                            <div className="flex flex-col">
                                                                                                {/* User Details */}
                                                                                                <p className=" font-semibold text-gray-700">
                                                                                                    {historyItem.from_first_name} {historyItem.from_last_name}
                                                                                                    {historyItem.to_first_name && historyItem.to_first_name && (<span className="text-gray-500 text-xs"> to </span>)}

                                                                                                    {historyItem.to_first_name} {historyItem.to_last_name}
                                                                                                </p>
                                                                                                <p className=" text-gray-500">{historyItem.created_at}</p>
                                                                                            </div>
                                                                                        </div>
                                                                                        {/* Message */}
                                                                                        <p className="ml-7  text-gray-600">{historyItem.message}</p>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </>
                                                                )}

                                                        </div>
                                                        <Chat quoteId={quote.quoteid} refId={quote.assign_id} />
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
                            <AddTags quoteId={selectedQuoteId} refId={queryId} userId={userIdForTag} onClose={()=>{setEditFormOpen(!editFormOpen)}} after={fetchScopeDetails} />
                        )}
                    </AnimatePresence>
        </div>
    );
};

export default AskForScopeAdmin;