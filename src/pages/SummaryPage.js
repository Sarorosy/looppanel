import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomLoader from '../CustomLoader'; // Assuming you have this loader component
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import $ from 'jquery';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, X } from 'lucide-react';
import QueryDetails from './QueryDetails';


const SummaryPage = ({ onClose }) => {
    const [quoteSummary, setQuoteSummary] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [approvedCount, setApprovedCount] = useState(0);
    const [selectedQuery, setSelectedQuery] = useState('');
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const userData = sessionStorage.getItem('loopuser');

    const userObject = JSON.parse(userData);

    // Fetch data from the API
    const fetchQuoteSummary = async () => {
        setLoading(true); // Show loading spinner


        try {
            const response = await fetch(
                'https://apacvault.com/Webapi/getQuoteSummary',
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
        console.log(selectedQuery)
        setIsDetailsOpen(true);
        
    };

    // Use DataTable library
    DataTable.use(DT);

    useEffect(() => {
        fetchQuoteSummary();
    }, []);

    const columns = [
        {
            title: 'Sr. No.',
            data: null,
            orderable: false,
            render: (data, type, row, meta) => {
                return `<div style="text-align: center;">${meta.row + 1}</div>`;
            },
        },
        {
            title: 'Ref Id',
            data: 'ref_id', // Replace with actual field name
            orderable: false,
        },
        {
            title: 'Quote Id',
            data: 'id', // Replace with actual field name
            orderable: false,
        },
        {
            title: 'Status',
            data: 'status', // Replace with actual field name
            orderable: false,
            render: function (data, type, row) {
                if (data == 0) {
                    return '<span class="text-red-600 font-bold">Pending</span>';
                } else if (data == 1) {
                    return '<span class="text-green-600 font-bold">Approved</span>';
                }
                return '<span>Unknown</span>';
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
            orderable: false,
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
            <div className='flex items-center justify-between bg-blue-400 text-white pnav py-2'>
                <h2 className="text-xl font-semibold mllt">All Quote Summary </h2>


                <button
                    onClick={onClose}
                    className=" text-white hover:text-red-600 transition-colors mr-2 cir"
                >
                    {/* <CircleX size={32} /> */}
                    <X size={15} />
                </button>
            </div>
            <div className="flex justify-end mr-5 my-3">
                <div className="flex items-center bg-yellow-500 text-white px-4 py-2 rounded shadow">
                    <span className="text-sm font-medium">Pending:</span>
                    <span className="ml-2 font-bold">{pendingCount}</span>
                </div>

                <div className="flex items-center bg-green-200 text-green-800 px-4 py-2 rounded shadow mx-3">
                    <span className="text-sm font-medium">Approved:</span>
                    <span className="ml-2 font-bold">{approvedCount}</span> {/* Replace 5 with dynamic count */}
                </div>
                <button
                    onClick={fetchQuoteSummary}
                    className="flex items-center bg-blue-400 text-white hover:text-blue-600 hover:bg-blue-500 transition-colors px-4 py-2 rounded shadow"
                >
                    Refresh <RefreshCcw size={20} className="ml-2" />
                </button>
            </div>

            {loading ? (
                <CustomLoader />
            ) : (
                <div className='bg-white dt border-t-2 border-blue-400 rounded'>
                    <div className="table-scrollable">
                        <DataTable
                            data={quoteSummary}
                            columns={columns}
                            options={{
                                pageLength: 50,
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

                    <QueryDetails
                        onClose={toggleDetailsPage}

                        queryId={selectedQuery}
                    />

                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default SummaryPage;
