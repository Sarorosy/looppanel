import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CustomLoader from '../CustomLoader';
import { Chat } from './Chat';

const AskForScope = ({ quoteId }) => {
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
    const[selectedUser, setSelectedUser] = useState(null);
    const [adminComments, setAdminComments] = useState('');

    const fetchScopeDetails = async () => {
        setLoading(true); // Show loading spinner

        try {
            const response = await fetch(
                'https://instacrm.rapidcollaborate.com/api/adminaskforscopedetails',
                {
                    method: 'POST', // Use POST method
                    headers: {
                        'Content-Type': 'application/json', // Set content type to JSON
                    },
                    body: JSON.stringify({ quote_id: quoteId }),
                }
            );

            const data = await response.json(); // Parse the response as JSON
            console.log(data)
            if (data.status) {
                const parsedFiles = data.quoteInfo.relevant_file
                    ? JSON.parse(data.quoteInfo.relevant_file)
                    : [];

                setScopeDetails({
                    ...data.quoteInfo,
                    relevant_file: parsedFiles, // Set parsed files in scopeDetails state
                });
                setAssignQuoteInfo(data.assignQuoteInfo);

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

    const PriceSubmitValidate = async () => {
        if (!quoteAmount || !comment) {
            toast.error('Please fill in all the required fields');
            return; // Prevent form submission if validation fails
        }
        const data = {
            ref_id: scopeDetails.ref_id,
            quote_id: scopeDetails.id,
            quote_amount: quoteAmount,
            comment: comment,
        };

        try {
            // Show loading spinner
            setQuoteLoading(true);

            const response = await fetch('https://instacrm.rapidcollaborate.com/api/submittedtoadmin', {
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
        if (quoteId) {
            fetchScopeDetails(); // Fetch the scope details when the component mounts
        }
    }, [quoteId]);

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
                <h2 className="text-xl font-semibold" onClick={fetchScopeDetails}>Ask For Scope</h2>
            </div>

            {loading ? (
                <CustomLoader /> // A loader component when data is being fetched
            ) : (
                <div className="bg-white p-6 m-2 shadow rounded-md space-y-4">
                    {errorMessage && <p className="text-red-600">{errorMessage}</p>}

                    {scopeDetails ? (
                        <>
                            <div className='space-y-4 text-sm'>
                                <p><strong>Ref No.:</strong> {scopeDetails.ref_id}</p>
                                <p><strong>Currency:</strong> {scopeDetails.currency}</p>
                                <p className='scrollscope'><strong>Comments:</strong> {scopeDetails.comments}</p>
                                <p><strong>Created Date:</strong> {formatDate(scopeDetails.created_date)}</p>
                                {scopeDetails.relevant_file.length > 0 && (
                                    <div>
                                        <strong>Relevant Files:</strong>
                                        <div className="space-y-2 mt-2">
                                            {scopeDetails.relevant_file.map((file, index) => (
                                                <div key={index}>
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
                                <p><strong>Status:</strong> {getStatusText(scopeDetails.status)}</p>
                                <p><strong>Reference Url:</strong> <a href={referenceUrl} target="_blank" rel="noopener noreferrer" className='text-blue-400'>{referenceUrl}</a></p>
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
                                {scopeDetails.status == 0 && assignQuoteInfo == false && (
                                            <>
                                                <div className="nav-tabs-custom tabb">
                                                    <ul className="nav nav-tabs">
                                                        <li>
                                                            <a href="#tab_1" data-toggle="tab">
                                                                Assign Consultant
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <a href="#tab_2" data-toggle="tab">
                                                                Submit Price
                                                            </a>
                                                        </li>
                                                    </ul>
                                                    <div className="tab-content">
                                                        <div className="tab-pane active" id="tab_1">
                                                            <form method="post" name="assQuoteForm" id="assQuoteForm" className="form-horizontal">
                                                                <input type="hidden" name="ref_id" value={scopeDetails.ref_id} />
                                                                <input type="hidden" name="quote_id" value={scopeDetails.id} />
                                                                <div className="box-body">
                                                                    <div className="form-group">
                                                                        <label htmlFor="assign_to_userid" className="col-sm-3 control-label">Assign to</label>
                                                                        <div className="col-sm-12">
                                                                            <select name="assign_to_userid" id="assign_to_userid" className="form-control" onChange={handleUserChange} value={selectedUser}>
                                                                                <option value="">Select User</option>
                                                                                {ConsultantUserData.map((userData) => (
                                                                                    <option key={userData.id} value={userData.id}>
                                                                                        {userData.name}
                                                                                    </option>
                                                                                ))}
                                                                            </select>
                                                                            <div className="error" id="assign_to_useridError"></div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="form-group">
                                                                        <label htmlFor="admin_comments" className="col-sm-3 control-label">Comments</label>
                                                                        <div className="col-sm-12">
                                                                            <textarea name="admin_comments" id="admin_comments" placeholder="Comments" className="form-control" value={adminComments} onChange={(e) => setAdminComments(e.target.value)}></textarea>
                                                                            <div className="error" id="admin_commentsError"></div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="box-footer assi">
                                                                    <input
                                                                        type="button"
                                                                        name="assygn_to_user"
                                                                        value="Assign"
                                                                        className="btn pull-right"
                                                                        onClick={ValidateAssignTask}
                                                                        disabled={assignLoading}
                                                                    />
                                                                </div>
                                                            </form>
                                                        </div>
                                                        <div className="tab-pane" id="tab_2">
                                                            <form method="post" name="submitQuoteForm" id="submitQuoteForm" className="form-horizontal">
                                                                <input type="hidden" name="ref_id" value={scopeDetails.ref_id} />
                                                                <input type="hidden" name="quote_id" value={scopeDetails.id} />
                                                                <div className="box-body">
                                                                    <div className="form-group">
                                                                        <label htmlFor="quote_amount" className="col-sm-3 control-label">
                                                                            Amount ({scopeDetails.currency})
                                                                        </label>
                                                                        <div className="col-sm-12">
                                                                            <input type="text" name="quote_amount" id="quote_amount" className="form-control" value={quoteAmount} onChange={(e) => setQuoteAmount(e.target.value)} />
                                                                            <div className="error" id="quote_amountError"></div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="form-group">
                                                                        <label htmlFor="comment" className="col-sm-3 control-label">Comments</label>
                                                                        <div className="col-sm-12">
                                                                            <textarea name="comment" id="comment" placeholder="Comments" className="form-control"  value={comment} onChange={(e) => setComment(e.target.value)}></textarea>
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
                                                                         onClick={PriceSubmitValidate}
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
                            <Chat quoteId={quoteId} refId={scopeDetails.ref_id} />
                        </>
                    ) : (
                        <p>No scope details available.</p>
                    )}
                </div>
            )}
            <ToastContainer />
        </div>
    );
};

export default AskForScope;