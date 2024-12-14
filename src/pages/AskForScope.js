import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CustomLoader from '../CustomLoader';
import { Chat } from './Chat';
import AskPtp from './AskPtp';
import DemoDone from './DemoDone';
import { CheckCircle, RefreshCcw } from 'lucide-react';
import SubmitRequestQuote from './SubmitRequestQuote';

const AskForScope = ({ queryId }) => {
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
    const [expandedRowIndex, setExpandedRowIndex] = useState(null);
    

    const toggleRow = (index) => {
        setExpandedRowIndex(expandedRowIndex === index ? null : index);
    };

    const userObject = JSON.parse(userData);

    const thisUserId = userObject.id

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
                    body: JSON.stringify({ ref_id: queryId }), // Send the ref_id
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
                                        <td className="border px-4 py-2">{quote.ref_id}</td>
                                        <td className="border px-4 py-2">{quote.id}</td>
                                        <td className="border px-4 py-2">{quote.currency}</td>
                                        <td className="border px-4 py-2">{quote.service_name || 'N/A'}</td>
                                        <td className="border px-4 py-2">
                                            <span
                                                className={
                                                    quote.status == 0
                                                        ? 'text-red-600'
                                                        : 'text-green-600'
                                                }
                                            >
                                                {quote.status == 0 ? 'Pending' : 'Approved'}
                                            </span>
                                        </td>
                                    </tr>
                                    {/* Accordion */}
                                    {expandedRowIndex == index && (
                                        <tr>
                                            <td colSpan={5} className="border px-4 py-4 bg-gray-50">
                                                <div className="space-y-4 text-sm">
                                                    <p><strong>Ref No.:</strong> {quote.ref_id}</p>
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
                                                    <p><strong>Status:</strong> <span className={quote.status == 0 ? "text-red-600 text-md" : "text-green-600 text-md"}>{quote.status == 0 ? "Pending" : "Approved"}</span></p>
                                                    <p><strong>Reference Url:</strong> <a href={referenceUrl} target="_blank" rel="noopener noreferrer" className='text-blue-400'>{referenceUrl}</a></p>
                                                    {assignQuoteInfo && assignQuoteInfo != false && (
                                                        <p><strong>Assigned To:</strong> {assignQuoteInfo.name}</p>
                                                    )}
                                                    <div className='flex items-start space-x-1'>
                                                        {quote.status == 0 && quote.user_id == thisUserId && !quote.ptp && (
                                                            <AskPtp scopeDetails={quote} quoteId={queryId} after={fetchScopeDetails} />
                                                        )}
                                                        {quote.user_id == thisUserId && quote.demodone != 1 && (
                                                            <DemoDone scopeDetails={quote} quoteId={queryId} after={fetchScopeDetails} />
                                                        )}
                                                    </div>
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

                    <SubmitRequestQuote refId={queryId} />
                    
                </div>
            )}
            <ToastContainer />
        </div>
    );
};

export default AskForScope;