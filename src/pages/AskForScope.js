import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CustomLoader from '../CustomLoader';
import { Chat } from './Chat';
import AskPtp from './AskPtp';
import DemoDone from './DemoDone';
import { CheckCircle2, Info, PlusCircle, RefreshCcw, ChevronUp, ChevronDown, ArrowDown, ArrowUp, Edit, Settings2, History } from 'lucide-react';
import SubmitRequestQuote from './SubmitRequestQuote';
import { AnimatePresence } from 'framer-motion';
import EditRequestForm from './EditRequestForm';
import Swal from 'sweetalert2';
import 'sweetalert2/src/sweetalert2.scss'
import HistorySideBar from './HistorySideBar';

const AskForScope = ({ queryId, userType, quotationId }) => {
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
    const [expandedRowIndex, setExpandedRowIndex] = useState(0);
    const [addNewFormOpen, setAddNewFormOpen] = useState(false);
    const [editFormOpen, setEditFormOpen] = useState(false);
    const [selectedQuoteId, setSelectedQuoteId] = useState('');
    const [selectedRefId, setSelectedRefId] = useState('');
    const [historyData, setHistoryData] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    
    const [error, setError] = useState(null);
    
    const [historyPanelOpen,SetHistoryPanelOpen]  = useState(false);
    const [quoteIdForHistory, setQuoteIdForHistory] = useState('');

    const toggleHistoryDiv = ($id) =>{
        setQuoteIdForHistory($id);
        SetHistoryPanelOpen(true);
    }

    const toggleRow = (index) => {
        setExpandedRowIndex(expandedRowIndex == index ? null : index);
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
                    body: JSON.stringify({ ref_id: queryId, quote_id: quotationId, user_type: userType }), // Send the ref_id
                }
            );

            const data = await response.json(); // Parse the response as JSON
            console.log(data);

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

    const toggleAddNewForm = () => setAddNewFormOpen((prev) => !prev);
    const toggleEditForm = (id) => {
        setSelectedQuoteId(id);
        setEditFormOpen((prev) => !prev)
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

    


    const confirmSubmit = (assign_id, quote_id, user_id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "Once submitted, this action cannot be undone!",
            icon: "question",
            buttons: true,
            dangerMode: true,
        }).then((result) => {
            if (result.isConfirmed) {
                submitToAdmin(assign_id, quote_id, user_id);
            } else {
                Swal.fire("Submission canceled!");
            }
        });
    };

    const submitToAdmin = async (assign_id, quote_id, user_id) => {
        const payload = {
            ref_id: assign_id,
            quote_id: quote_id,
            user_id: user_id
        };

        try {
            const response = await fetch('https://apacvault.com/Webapi/submitFeasRequestToAdmin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (data.status) {
                toast.success("The quote has been successfully submitted to the admin.")
            } else {
                toast.error(data.message || "Something went wrong.")
            }
        } catch (error) {
            console.error("Error submitting to admin:", error);
            toast.error("An unexpected error occurred. Please try again.");
        }
    };


    return (
        <div className=" h-full bg-gray-100 shadow-lg z-50 overflow-y-auto mt-2 rounded w-full">
            <div className="flex items-center justify-between bg-blue-400 text-white py-2 px-3">
                <h2 className="text-xl font-semibold " >Ask For Scope </h2>
                <div className='flex items-center'>
                    <button onClick={toggleAddNewForm} className='flex items-center mr-3 rounded px-2 py-1 f-14 btn-light'>
                        <PlusCircle size={15} className='mr-1' /> <div>Add New</div>
                    </button>
                    <RefreshCcw size={20} onClick={fetchScopeDetails} className='cursor-pointer' />
                </div>
            </div>

            {loading ? (
                <CustomLoader /> // A loader component when data is being fetched
            ) : (
                <div className="bg-white p-6 m-2 shadow rounded-md space-y-4">
                    {errorMessage && <p className="text-red-600">{errorMessage}</p>}

                    {scopeDetails && scopeDetails.length > 0 ? (
                        <div>
                            {/* Table Header */}
                            <table className="w-full border-collapse border border-gray-200 f-14">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border px-2 py-2 text-left">Ref No.</th>
                                        <th className="border px-2 py-2 text-left">Quote Id.</th>
                                        <th className="border px-2 py-2 text-left">Currency</th>
                                        <th className="border px-2 py-2 text-left">Plan</th>
                                        <th className="border px-2 py-2 text-left">Service Name</th>
                                        <th className="border px-2 py-2 text-left">Quote Status</th>
                                        <th className="border px-2 py-2 text-left">Action</th>
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
                                                <td className="border px-2 py-2 ">
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

                                                    </p>
                                                </td>
                                                <td className="border px-2 py-2">{quote.quoteid}</td>
                                                <td className="border px-2 py-2">{quote.currency}</td>
                                                <td className="border px-2 py-2">{quote.plan}</td>
                                                <td className="border px-2 py-2">{quote.service_name || 'N/A'}</td>
                                                <td className="border px-2 py-2">
                                                    {quote.isfeasability == 1 ? (
                                                        quote.submittedtoadmin == "false" ? (
                                                            quote.feasability_status == "Pending" ? <span className='text-red-600'>Feasabilty Submitted</span> : <span className='text-green-600'>Feasabilty Completed</span>
                                                        ) : (
                                                            quote.feasability_status == "Completed" && quote.quote_status == "1" ? <span className='text-green-700'>Feasabilty Completed and Admin Submitted</span> : <p><span className='text-green-700'>Feasabilty Completed</span> and <span className='text-red-600'>Admin Pending</span></p>

                                                        )
                                                    ) : (
                                                        <span
                                                            className={
                                                                quote.quote_status == 0
                                                                    ? 'badge-danger p-1 f-10 rounded-sm px-2 font-semibold' // Pending - Red
                                                                    : quote.quote_status == 1
                                                                        ? 'badge-success p-1 f-10 rounded-sm px-2 font-semibold' // Submitted - Green
                                                                        : quote.quote_status == 2
                                                                            ? 'badge-warning p-1 f-10 rounded-sm px-2 font-semibold' // Discount Requested - Yellow
                                                                            : 'badge-secondary p-1 f-10 rounded-sm px-2 font-semibold' // Default - Gray for Unknown
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
                                                    )}
                                                </td>

                                                <td className="border px-2 py-2 flex items-center">
                                                    {/* Up/Down Arrow Button */}
                                                    <button
                                                        onClick={() => toggleRow(index)}
                                                        className="flex items-center justify-center p-2"
                                                    >
                                                        {expandedRowIndex == index ? <ArrowUp size={20} className='bg-blue-500 p-1 rounded-full text-white' /> : <ArrowDown size={20} className='bg-blue-500 p-1 rounded-full text-white' />}
                                                    </button>

                                                    {quote.quote_status == 0 && quote.isfeasability == 0 && quote.user_id == thisUserId && (
                                                        <button onClick={() => { toggleEditForm(quote.quoteid) }}
                                                            className='flex items-center rounded-full border-2 border-blue-500'>
                                                            <Settings2 className='p-1' />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                            {/* Accordion */}
                                            {expandedRowIndex == index && (

                                                <tr>
                                                    <td colSpan={7} className="border px-4 py-4 bg-gray-50">
                                                        <div className="space-y-4 text-sm">
                                                            <p className='d-flex align-items-center'>
                                                                <strong>Ref No.:</strong> {quote.assign_id}
                                                                {quote.ptp === "Yes" && (
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
                                                                <button
                                                                    onClick={() => toggleHistoryDiv(quote.quoteid)}
                                                                    className="ml-2 bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600"
                                                                >
                                                                    <History size={15} />
                                                                </button>
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


                                                            <p><strong>Currency:</strong> {quote.currency == "Other" ? quote.other_currency : quote.currency}</p>
                                                            {quote.service_name && quote.plan && (
                                                                <>
                                                                    <p><strong>Service Required:</strong> {quote.service_name}</p>
                                                                    <p><strong>Plan:</strong> {quote.plan}</p>
                                                                </>
                                                            )}
                                                            <p><strong>Comments:</strong>  <span dangerouslySetInnerHTML={{ __html: quote.comments }} /></p>
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
                                                            {quote.ptp != null && (
                                                                <>
                                                                    <p><strong>PTP:</strong> {quote.ptp}</p>
                                                                    <p><strong>PTP Comments:</strong> {quote.ptp_comments}</p>
                                                                </>
                                                            )}
                                                            {quote.demodone != 0 && (
                                                                <>
                                                                    <p className='flex items-center '><p className='mr-3'> <strong>Demo Id : </strong> {quote.demo_id}</p><span className='badge-success px-2 py-0 ml-3 rounded-sm text-white-900 font-semibold flex items-center f-12'>Demo Completed <CheckCircle2 size={15} className='ml-2' /> </span> </p>
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
                                                                                <span key={index} className={`${quote.discount_price != null ? "line-through bg-red-200 p-1 rounded mr-1" : ""}`}>
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
                                                                                    <span key={index} className='bg-[#FFD700] px-1 py-2 rounded mr-1'>
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
                                                            {quote.submittedtoadmin == "true" && (
                                                                <p>
                                                                    <strong>Quote Status:</strong>
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
                                                            )}

                                                            {assignQuoteInfo && assignQuoteInfo != false && (
                                                                <p><strong>Assigned To:</strong> {assignQuoteInfo.name}</p>
                                                            )}

                                                            <div className='flex items-start space-x-1'>
                                                                {quote.quote_status == 1 && quote.submittedtoadmin == "true" && quote.user_id == thisUserId && quote.ptp == null && (
                                                                    <AskPtp scopeDetails={quote} quoteId={quote.quoteid} after={fetchScopeDetails} />
                                                                )}
                                                                {quote.user_id == thisUserId && quote.submittedtoadmin == "true" && quote.demodone != 1 && (
                                                                    <DemoDone scopeDetails={quote} quoteId={quote.quoteid} after={fetchScopeDetails} />
                                                                )}
                                                            </div>

                                                            {quote.isfeasability == 1 && (
                                                                <>
                                                                    <div className='flex items-center'>
                                                                        <>
                                                                            <p><strong>Feasability Status:</strong> <span className={`${quote.feasability_status == "Pending" ? "badge-danger p-1 f-10 rounded-sm px-2 font-semibold ml-2" : "badge-success p-1 f-10 rounded-sm px-2 font-semibold ml-2"}`}>{quote.feasability_status}</span></p>

                                                                            {/* Button to View History */}
                                                                            <button
                                                                                onClick={() => fetchFeasibilityHistory(quote.assign_id, quote.quoteid)}
                                                                                className="bg-blue-400 text-white p-1 rounded hover:bg-blue-600 ml-3"
                                                                            >
                                                                                <History size={18} />
                                                                            </button>
                                                                            {quote.feasability_status == "Completed" && quote.submittedtoadmin == "false" && (
                                                                                <button
                                                                                    onClick={() => {
                                                                                        confirmSubmit(quote.assign_id, quote.quoteid, quote.user_id);
                                                                                    }}
                                                                                    className="bg-green-100 text-green-700 p-1 rounded border border-green-900 ml-5 hover:bg-green-200"
                                                                                    title='Submit request to admin for Ask For Scope'
                                                                                >
                                                                                    Submit To Admin
                                                                                </button>
                                                                            )}
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
                                                                            <div className="">
                                                                                {historyData.map((historyItem, index) => (
                                                                                    <div key={historyItem.id} className="mb-4">
                                                                                        <div className="flex items-start space-x-3">
                                                                                            {/* Timeline Icon */}
                                                                                            <div className="w-h-2 bg-blue-500 rounded-full mt-1"></div>
                                                                                            <div className="flex flex-col">
                                                                                                {/* User Details */}
                                                                                                <p className=" font-semibold text-gray-700">
                                                                                                    {historyItem.from_first_name} {historyItem.from_last_name}
                                                                                                    {historyItem.to_first_name && historyItem.to_first_name && (<span className="text-gray-500 text-xs">to</span>)}

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
                                                                </>)}

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
                    ) : (
                        <div className="flex justify-center items-center">
                            <p className='flex items-center justify-between'> <Info className='mr-2' /> No Previous Requests </p>
                        </div>
                    )}
                    <AnimatePresence>
                        {addNewFormOpen && (
                            <SubmitRequestQuote refId={queryId} onClose={toggleAddNewForm} after={fetchScopeDetails} />
                        )}
                        {editFormOpen && (
                            <EditRequestForm quoteId={selectedQuoteId} refId={queryId} onClose={() => { setEditFormOpen(!editFormOpen) }} after={fetchScopeDetails} />
                        )}
                        {historyPanelOpen && (
                            <HistorySideBar quoteId={quoteIdForHistory} refId={queryId} onClose={() => { SetHistoryPanelOpen(!historyPanelOpen) }} />
                        )}
                    </AnimatePresence>

                </div>
            )}
            <ToastContainer />
        </div>
    );
};

export default AskForScope;