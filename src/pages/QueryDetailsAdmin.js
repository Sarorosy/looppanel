import React, { useState, useEffect, useRef } from 'react';
import $ from 'jquery';
import 'select2/dist/css/select2.css';
import 'select2';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CircleX, HistoryIcon, X } from 'lucide-react';
import CustomLoader from '../CustomLoader';
import AskForScopeAdmin from './AskForScopeAdmin';


const QueryDetailsAdmin = ({ onClose, queryId }) => {
    const [teamName, setTeamName] = useState('');
    const [managers, setManagers] = useState([]);
    const [selectedManagers, setSelectedManagers] = useState([]);
    const selectTeamRef = useRef(null);
    const [queryInfo, setQueryInfo] = useState('');
    const [tatScore, setTatScore] = useState('');
    const [loading, setLoading] = useState(false);
    const [activityData, setActivityData] = useState(null);
    const [quoteId, setQuoteId] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [activityloading, setActivityLoading] = useState(false);

    const fetchActivityHistory = async () => {
        try {
            setIsVisible(true);
            setActivityLoading(true);
            const response = await fetch('https://instacrm.rapidcollaborate.com/api/viewqueryhistory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ assign_id: queryInfo.assign_id }),
            });
            const data = await response.json();
            setActivityData(data.activity);
        } catch (error) {
            console.error('Error fetching activity history:', error);
        } finally {
            setActivityLoading(false);
        }
    };

    // Hide the activity div when clicked elsewhere
    const hideActivityDiv = () => {
        setIsVisible(false);
    };

    const fetchQueryDetails = async () => {
        setLoading(true); // Show loading spinner


        try {
            const response = await fetch(
                'https://instacrm.rapidcollaborate.com/api/viewquerydetails',
                {
                    method: 'POST', // Use POST method
                    headers: {
                        'Content-Type': 'application/json', // Set content type to JSON
                    },
                    body: JSON.stringify({ query_id: queryId }),
                }
            );

            const data = await response.json(); // Parse the response as JSON
            console.log(data)
            if (data.status) {
                setQueryInfo(data.queryInfo); // Update the quotes state
                setTatScore(data.tatScore);
                setQuoteId(data.quoteId);
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
        fetchQueryDetails();
    }, []);

    function convertMinutesToHoursAndMinutes(totalMinutes) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours}h ${minutes}m`;
      }
      


    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 right-0 h-full w-full bg-gray-100 shadow-lg z-50 overflow-y-auto "
        >
            <div className='flex items-center justify-between bg-blue-400 text-white pnav py-2'>
            <h2 className="text-xl font-semibold mllt">Query Details </h2>

            {tatScore && tatScore.total_rows > 0 ? (
                <div className="flex items-center justify-between space-x-2 mr-16">
                    <p>
                        <span className="font-bold">Average TAT:</span>{" "}
                        <span className="">
                            {convertMinutesToHoursAndMinutes(
                                Math.round(tatScore.total_minute / tatScore.total_rows)
                            )}
                        </span>
                    </p>
                    <p className="">
                        <span className="font-bold">Average Score:</span>{" "}
                        <span className="">
                            {(tatScore.total_score / tatScore.total_rows).toFixed(2)}
                        </span>
                    </p>
                </div>
            ) : (
                <p className="text-gray-500"></p>
            )}
             <button
                onClick={onClose}
                className=" text-white hover:text-red-600 transition-colors mr-2 cir"
            >
                {/* <CircleX size={32} /> */}
                <X size={15} />
            </button>
            </div>

           
            {loading ? (
                <CustomLoader />
            ) : (
                <div className=' flex items-start justify-between space-x-1 pnav'>
                    <div className='col-md-3'>
                <div className="space-y-4 bg-white p-6 shadow rounded-md border-t-2 border-blue-400 m-2 text-sm">
                    <div className="relative">
                        {queryInfo.assign_id && (
                            <p

                                className="cursor-pointer flex"
                            >
                                <strong>Ref. No.:</strong> {queryInfo.assign_id} <HistoryIcon className='ml-2 bg-blue-300 p-1 rounded' onClick={fetchActivityHistory} />
                            </p>
                        )}

                        {/* Activity History Popup */}
                        {isVisible && (
                            <div
                                className="absolute top-0 left-0 bg-white w-full shadow-xl p-2 z-10 border"
                                onClick={e => e.stopPropagation()} // Prevent hiding when clicking inside the div
                            >
                                <button
                                    className="text-red-500 float-end"
                                    onClick={hideActivityDiv} // Button to hide the div
                                >
                                    Close
                                </button>
                                <h3 className="font-bold mb-2">Activity History</h3>
                                {activityloading ? (
                                    <CustomLoader />
                                ) : (
                                    <div className="space-y-1 ">
                                        {activityData.map((activity, index) => (
                                            <div key={index} className="border-b pb-1">
                                                <p>
                                                    <strong>{activity.user_name}:</strong> {activity.message}
                                                </p>
                                                <p className="text-sm text-gray-500">{activity.action_date}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <p><strong>Referred By:</strong> {queryInfo.referred_by}</p>
                    {queryInfo.profile_name && <p><strong>Profile:</strong> {queryInfo.profile_name}</p>}
                    {queryInfo.name && <p><strong>Name:</strong> {queryInfo.name}</p>}
                    {queryInfo.email_id && <p><strong>Email:</strong> {queryInfo.email_id}</p>}
                    {queryInfo.alt_email_id && (
                                <p><strong>Alternate Email ID:</strong> {queryInfo.alt_email_id || 'N/A'}</p>
                            )}
                    {queryInfo.phone && <p><strong>Contact No.:</strong> {queryInfo.phone}</p>}
                    {queryInfo.alt_contact_no && (
                                <p><strong>Alternate Contact No.:</strong> {queryInfo.alt_contact_no || 'N/A'}</p>
                            )}
                    {queryInfo.latest_requirement && (
                        <div className="bg-green-100 p-4 rounded">
                            <p><strong>Latest Requirement:</strong> {queryInfo.latest_requirement}</p>
                        </div>
                    )}
                    {queryInfo.line_format && <p><strong>Requirement:</strong><span dangerouslySetInnerHTML={{ __html: queryInfo.line_format }}></span></p>}
                    {queryInfo.paragraph_format && <p><strong>Requirement:</strong> {queryInfo.paragraph_format}</p>}
                    {queryInfo.area_of_study && <p><strong>Topic/Area of Study:</strong> {queryInfo.area_of_study}</p>}
                    {queryInfo.service_name && <p><strong>Service:</strong> {queryInfo.service_name}</p>}
                    {queryInfo.location && <p><strong>Location:</strong> {queryInfo.location}</p>}
                    {queryInfo.city && <p><strong>City:</strong> {queryInfo.city}</p>}
                    {queryInfo.complete_address && <p><strong>Complete Address:</strong> {queryInfo.complete_address}</p>}
                    {queryInfo.designation && <p><strong>Designation:</strong> {queryInfo.designation}</p>}
                    {queryInfo.company_name && <p><strong>Company Name:</strong> {queryInfo.company_name}</p>}
                    {queryInfo.website_name && (
                        <p>
                            <strong>Website:</strong> {queryInfo.website_name === 'others' ? queryInfo.other_website : queryInfo.website_name}
                        </p>
                    )}
                    {queryInfo.priority && <p><strong>Priority:</strong> {queryInfo.priority}</p>}
                    {queryInfo.academic_level && <p><strong>Academic Level:</strong> {queryInfo.academic_level}</p>}
                    <p>
                        <strong>Tag: </strong>
                        {queryInfo.tags && queryInfo.tags.length > 0 ? (
                            <span className="space-x-1">
                                {queryInfo.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="bg-yellow-500 p-1 rounded text-white mr-1"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </span>
                        ) : (
                            'N/A'
                        )}
                    </p>

                    {queryInfo.follow_up_date && (
                        <p>
                            <strong>Follow-up Date:</strong> {new Date(queryInfo.assign_follow_up_date * 1000).toLocaleDateString('en-GB')}
                        </p>
                    )}
                    {queryInfo.assign_date && (
                        <p>
                            <strong>Query Created Date:</strong>
                            {new Date(queryInfo.assign_date * 1000).toLocaleDateString('en-GB')}
                            {new Date(queryInfo.assign_date * 1000).toLocaleTimeString('en-GB', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                            })}
                        </p>
                    )}
                    
                    {queryInfo.update_status != undefined && (
                        <p className='qss'>
                            <strong>Query Status:</strong>{' '}
                            <span
                                className={`p-1 text-sm rounded ${queryInfo.update_status == 1
                                    ? 'bg-blue-500 text-white'
                                    : queryInfo.update_status == 2
                                        ? 'bg-blue-700 text-white'
                                        : queryInfo.update_status == 3
                                            ? 'bg-yellow-500 text-white'
                                            : queryInfo.update_status == 4
                                                ? 'bg-gray-500 text-white'
                                                : queryInfo.update_status == 5
                                                    ? 'bg-green-500 text-white'
                                                    : queryInfo.update_status == 6
                                                        ? 'bg-red-500 text-white'
                                                        : queryInfo.update_status == 7
                                                            ? 'bg-blue-300 text-white'
                                                            : queryInfo.update_status == 8
                                                                ? 'bg-red-700 text-white'
                                                                : ''
                                    }`}

                            >
                                {queryInfo.update_status == 1
                                    ? 'Lead In'
                                    : queryInfo.update_status == 2
                                        ? 'Contact Made'
                                        : queryInfo.update_status == 3
                                            ? 'Quoted'
                                            : queryInfo.update_status == 4
                                                ? 'Negotiating'
                                                : queryInfo.update_status == 5
                                                    ? 'Converted'
                                                    : queryInfo.update_status == 6
                                                        ? 'Client Not Interested'
                                                        : queryInfo.update_status == 7
                                                            ? 'Reminder'
                                                            : queryInfo.update_status == 8
                                                                ? 'Lost deals'
                                                                : 'Unknown'}
                            </span>
                        </p>
                    )}
                    {queryInfo.sourceoflead && queryInfo.sourceoflead != 0 && (
                                <div>
                                    <strong>Source of Lead:</strong>{" "}
                                    {queryInfo.sourceoflead === 100 && (
                                        <span className="label label-info p-1 rounded">100 -- Google</span>
                                    )}
                                    {queryInfo.sourceoflead === 200 && (
                                        <span className="label label-primary p-1 rounded">200 -- FB</span>
                                    )}
                                    {queryInfo.sourceoflead === 300 && (
                                        <span className="label label-warning p-1 rounded">300 -- Mailer Campaign</span>
                                    )}
                                    {queryInfo.sourceoflead === 400 && (
                                        <span className="label label-default p-1 rounded">400 -- Interakt Campaign</span>
                                    )}
                                    {queryInfo.sourceoflead === 500 && (
                                        <span className="label label-success p-1 rounded">500 -- Through call</span>
                                    )}
                                    {queryInfo.sourceoflead === 600 && (
                                        <span className="label label-danger p-1 rounded">600 -- Through Whatsapp</span>
                                    )}
                                </div>
                            )}

                </div>
                </div>
                <AskForScopeAdmin queryId={queryInfo.assign_id} />
                </div>
            )}

            <ToastContainer />
        </motion.div>
    );

};

export default QueryDetailsAdmin;