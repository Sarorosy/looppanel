import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomLoader from '../CustomLoader'; // Assuming you have this loader component
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import $ from 'jquery';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, X } from 'lucide-react';
import QueryDetails from './QueryDetails';
import FeasabilityQueryDetails from './FeasabilityQueryDetails';


const FeasabilityPage = ({ onClose }) => {
    const [quoteSummary, setQuoteSummary] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [approvedCount, setApprovedCount] = useState(0);
    const [selectedQuery, setSelectedQuery] = useState('');
    const [selectedQuote, setSelectedQuote] = useState('');
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const userData = sessionStorage.getItem('loopuser');

    const userObject = JSON.parse(userData);

    // Fetch data from the API
    const fetchQuoteSummary = async () => {
        setLoading(true); // Show loading spinner


        try {
            const response = await fetch(
                'https://apacvault.com/Webapi/getAllFeasabilityAssignedToUser',
                {
                    method: 'POST', // Use POST method
                    headers: {
                        'Content-Type': 'application/json', // Set content type to JSON
                    },
                    body: JSON.stringify({ user_id: userObject.id, }),
                }
            );

            const data = await response.json(); // Parse the response as JSON
            console.log(data)
            if (data.status) {
                setQuoteSummary(data.data); // Update the quotes state
                setPendingCount(data.pending_count);
                setApprovedCount(data.approved_count);
            } else {
                console.error('Failed to fetch Details:', data.message);
            }
        } catch (error) {
            console.error('Error fetching details:', error);
        } finally {
            setLoading(false); // Hide loading spinner
        }
    };

    const toggleDetailsPage = () => {
        setIsDetailsOpen(!isDetailsOpen);
    };

    const handleViewBtnClick = (query) => {
        setSelectedQuery(query.ref_id);
        setSelectedQuote(query.id);
        setIsDetailsOpen(true);
        
    };

    const finalFunction = () =>{
        setIsDetailsOpen(false);
        fetchQuoteSummary();
    }

    // Use DataTable library
    DataTable.use(DT);

    useEffect(() => {
        fetchQuoteSummary();
    }, []);

    const columns = [
        {
            title: 'Ref Id',
            data: 'ref_id', // Replace with actual field name
            orderable: false,
        },
        {
            title: 'Ask For Scope Id',
            data: 'id', // Replace with actual field name
            orderable: false,
            className: 'text-center',
        },
        {
            title: 'Feasability Status',
            data: 'feasability_status', // Replace with actual field name
            orderable: false,
            render: function (data, type, row) {
                if (data == 'Pending') {
                    return '<span class="text-red-600 font-bold">Pending</span>';
                } else if (data == 'Completed') {
                    return '<span class="text-green-600 font-bold">Submitted</span>';
                } 
                return '<span class="text-gray-600">Unknown</span>';
            },
        },
        
        {
            title: 'Service',
            data: 'service_name', // Replace with actual field name
            orderable: false,
        },
        {
            title: 'Currency',
            data: 'currency', // Replace with actual field name
            render: function (data, type, row) {
                if (data == "Other") {
                    return row.other_currency;
                } else {
                    return row.currency;
                }
            },
        },
        {
            title: 'RC Demo',
            data: 'demodone', // Replace with actual field name
            orderable: false,
            render: function (data, type, row) {
                if (data == 1) {
                    return '<span class="text-green-600 font-bold">Done</span>';
                } else if (data == 0) {
                    return '<span class="text-red-600 font-bold">Pending</span>';
                }
                return '<span>Unknown</span>';
            },
        },
        {
            title: 'Actions',
            data: null,
            orderable: false,
            render: (data, type, row) => `
        <button class="view-btn vd mx-1 p-1  text-white" style="font-size:10px;border-radius:3px;" data-id="${row.ref_id}">
          View Details
        </button>`,
        },
    ];



    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 right-0 h-full w-full bg-gray-100 shadow-lg z-50 overflow-y-auto "
        >
            <div className='bg-blue-400 text-white py-3'>
                <div className='container flex items-center justify-between p-0'>
                <h2 className="text-xl font-semibold mllt">Feasability Check</h2>


                <button
                    onClick={onClose}
                    className="text-white hover:text-red-500 transition-colors p-1 rounded-full bg-red-600 hover:bg-red-500"
                >
                    {/* <CircleX size={32} /> */}
                    <X size={15} />
                </button>
                </div>
            </div>
            <div className="flex justify-end py-3 px-0 container">
            
                <div className="flex items-center bg-red-400 text-white px-2 py-1 rounded shadow">
                    <span className="f-12">Pending:</span>
                    <span className="ml-2 font-bold">{pendingCount}</span>
                </div>
                <div className="flex items-center bg-green-200 text-green-800 px-2 py-1 rounded shadow mx-2">
                    <span className="f-12">Completed:</span>
                    <span className="ml-2 font-bold">{approvedCount}</span> {/* Replace 5 with dynamic count */}
                </div>
                <button
                    onClick={fetchQuoteSummary}
                    className="flex items-center bg-blue-400 text-white hover:text-blue-600 hover:bg-blue-500 transition-colors px-2 py-1 f-12 rounded shadow"
                >
                    Refresh <RefreshCcw size={15} className="ml-2" />
                </button>
            </div>

            {loading ? (
                <CustomLoader />
            ) : (
                <div className='bg-white p-4 border-t-2 border-blue-400 rounded container'>
                    <div className="table-scrollable">
                        <DataTable
                            data={quoteSummary}
                            columns={columns}
                            options={{
                                pageLength: 50,
                                ordering: false,
                                createdRow: (row, data) => {
                                    $(row).find('.view-btn').on('click', () => handleViewBtnClick(data));
                                },
                            }}
                        />
                    </div>
                </div>
            )}
            <AnimatePresence>


                {isDetailsOpen && (

                    <FeasabilityQueryDetails
                        onClose={toggleDetailsPage}
                        quotationId={selectedQuote}
                        queryId={selectedQuery}
                        finalFunction={finalFunction}
                    />

                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default FeasabilityPage;
