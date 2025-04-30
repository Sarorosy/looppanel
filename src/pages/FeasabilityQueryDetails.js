import React, { useState, useEffect, useRef } from 'react';
import $ from 'jquery';
import 'select2/dist/css/select2.css';
import 'select2';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CircleX, HistoryIcon, Upload, X } from 'lucide-react';
import CustomLoader from '../CustomLoader';
import AskForScope from './AskForScope';
import SubmitRequestQuote from './SubmitRequestQuote';
import FeasabilityUpdate from './FeasabilityUpdate';
import QueryLoader from './QueryLoader';
import AttachedFiles from './AttachedFiles';


const FeasabilityQueryDetails = ({ onClose, queryId, quotationId, finalFunction }) => {
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

    const userData = localStorage.getItem('loopuser');

    const userObject = JSON.parse(userData);

    const close = () => {
        onClose();
        finalFunction();
    }
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

        let hasResponse = false;
        try {
            const response = await fetch(
                'https://apacvault.com/Webapi/view_query_details_api',
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
            hasResponse = true;
        } catch (error) {
            console.error('Error fetching details:', error);
        } finally {
            if (hasResponse) {
                setLoading(false); // Hide the loader
            }
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


    const [showUpload, setShowUpload] = useState(false);

    const changeShowUpload = () => {
        setShowUpload(!showUpload)
    }
    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 right-0 h-full w-full bg-gray-100 shadow-lg z-50 overflow-y-auto "
        >
            <div className='flex items-center justify-between bg-blue-400 text-white pnav py-3'>
                <h2 className="text-xl font-semibold">Query Details </h2>

                {/* {tatScore && tatScore.total_rows > 0 ? (
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
                )} */}
                <button
                    onClick={close}
                    className="text-white hover:text-red-500 transition-colors p-1 rounded-full bg-red-600 hover:bg-red-500"
                >
                    {/* <CircleX size={32} /> */}
                    <X size={15} />
                </button>
            </div>



            <div className=' flex items-start justify-between space-x-1 pnav text-black'>
                <div className='col-md-3'>
                    {loading ? <QueryLoader /> : (


                        <div className="bg-white mt-2">
                            <>
                                <div className="py-2 px-2 flex items-center justify-between bg-blue-400 rounded-tl-md rounded-tr-md text-white">
                                    <h3 className=""><strong>Attached Files</strong></h3>
                                    <div className='flex items-center n-gap-3 '>
                                        {!showUpload && (
                                            <button
                                                onClick={() => setShowUpload(true)}
                                                className="btn bg-white btn-sm f-11 flex items-center px-2 n-py-1"
                                            >
                                                <Upload className="mr-1" size={10} /> Attach more file
                                            </button>
                                        )}


                                    </div>
                                </div>

                                <AttachedFiles
                                    ref_id={queryInfo.assign_id}
                                    showUpload={showUpload}
                                    quote={{ quoteid: quotationId }}
                                    setShowUpload={changeShowUpload}
                                />

                            </>
                        </div>
                    )}
                </div>
                <FeasabilityUpdate queryId={queryId} quotationId={quotationId} userType={userObject.fld_admin_type} finalFunction={finalFunction} />

            </div>



        </motion.div>
    );

};

export default FeasabilityQueryDetails;