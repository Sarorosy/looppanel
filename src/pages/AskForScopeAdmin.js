import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CustomLoader from '../CustomLoader';
import { Chat } from './Chat';
import { CheckCircle, CheckCircle2, RefreshCcw } from 'lucide-react';
const AskForScopeAdmin = ({ queryId }) => {
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
    const [expandedRowIndex, setExpandedRowIndex] = useState(null);

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
                    body: JSON.stringify({ ref_id: queryId }),
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

    const PriceSubmitValidate = async (refId, quoteId) => {
        console.log(amounts)
        if (!amounts || !comment) {
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
                                        <th className="border px-4 py-2 text-left">Status</th>
                                    </tr>
                                </thead>
                                {/* Table Body */}
                                <tbody>
                                    {scopeDetails.map((quote, index) => (
                                        <React.Fragment key={index}>
                                            {/* Row */}
                                            <tr
                                                className="cursor-pointer hover:bg-gray-50"
                                                onClick={() => toggleRow(index)}
                                            >
                                                <td className="border px-4 py-2">{quote.assign_id}</td>
                                                <td className="border px-4 py-2">{quote.quoteid}</td>
                                                <td className="border px-4 py-2">{quote.currency}</td>
                                                <td className="border px-4 py-2">{quote.plan}</td>
                                                <td className="border px-4 py-2">{quote.service_name || 'N/A'}</td>
                                                <td className="border px-4 py-2">
                                                    <span
                                                        className={
                                                            quote.quote_status == 0
                                                                ? 'text-red-600'
                                                                : 'text-green-600'
                                                        }
                                                    >
                                                        {quote.quote_status == 0 ? 'Pending' : 'Approved'}
                                                    </span>
                                                </td>
                                            </tr>
                                            {/* Accordion */}
                                            {expandedRowIndex == index && (
                                                <tr>
                                                    <td colSpan={6} className="border px-4 py-4 bg-gray-50">
                                                        <div className="space-y-4 text-sm">
                                                            <p><strong>Ref No.:</strong> {quote.assign_id}</p>
                                                            <p><strong>Currency:</strong> {quote.currency}</p>
                                                            {quote.service_name && quote.plan && (
                                                                <>
                                                                    <p><strong>Service Required:</strong> {quote.service_name}</p>
                                                                    <p><strong>Plan:</strong> {quote.plan}</p>
                                                                </>
                                                            )}
                                                            <p><strong>Comments:</strong> {quote.comments}</p>
                                                            <p><strong>Created Date:</strong> {quote.created_date}</p>
                                                            {quote.relevant_file && quote.relevant_file.length > 0 && (
                                                                <div>
                                                                    <strong>Relevant Files:</strong>
                                                                    <div className="space-y-2 mt-2">
                                                                        {quote.relevant_file.map((file, fileIndex) => (
                                                                            <div key={fileIndex}>
                                                                                <a
                                                                                    href={`https://instacrm.rapidcollaborate.com/public/QuotationFolder/${file.file_path}`}
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
                                                            <p><strong>Status:</strong> <span className={quote.quote_status == 0 ? "text-red-600 text-md" : "text-green-600 text-md"}>{quote.quote_status == 0 ? "Pending" : "Approved"}</span></p>
                                                            <p><strong>Reference Url:</strong> <a href={referenceUrl} target="_blank" rel="noopener noreferrer" className='text-blue-400'>{referenceUrl}</a></p>
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
                                                                        return plans
                                                                            .map((plan, index) => `${plan}: ${prices[index]}`) // Map plans to corresponding prices
                                                                            .join(', '); // Join the resulting array with commas
                                                                    })()}
                                                                </p>
                                                                <p><strong>Comments:</strong> {quote.user_comments}</p>
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
                                                            {quote.quote_status == 0 && (
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
                                                                                        {quote.plan &&
                                                                                            quote.plan.split(',').map((plan, index) => (
                                                                                                <div className="form-group" key={index}>
                                                                                                    <label
                                                                                                        htmlFor={`amount_${plan.trim()}`}
                                                                                                        className="col-sm-3 control-label"
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

                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                            {/* Chat Component */}
                            <Chat quoteId={queryId} refId={scopeDetails[0]?.ref_id} />
                        </div>
                    )}
                </div>
            )}
            <ToastContainer />
        </div>
    );
};

export default AskForScopeAdmin;