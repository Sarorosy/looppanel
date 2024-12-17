import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import $ from 'jquery';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import 'daterangepicker/daterangepicker.css'; // Import daterangepicker CSS
import 'daterangepicker'; // Import daterangepicker JS
import moment from 'moment';
import 'select2/dist/css/select2.css';
import 'select2';
import CustomLoader from '../CustomLoader';
import { RefreshCcw, Filter, ListIcon } from 'lucide-react';
import QueryDetails from './QueryDetails';
import { AnimatePresence, motion } from 'framer-motion';
import SummaryPage from './SummaryPage';



const ManageContactMadeQueries = () => {
    const [quotes, setQuotes] = useState([]);
    const [websites, setWebsites] = useState([]);
    const [selectedWebsite, setSelectedWebsite] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [keyword, setKeyword] = useState('');
    const [RefId, setRefId] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('')
    const [loading, setLoading] = useState(false);
    const selectUserRef = useRef(null);
    const [selectedQuery, setSelectedQuery] = useState('');
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [summaryOpen, setSummaryOpen] = useState(false);

    const userData = sessionStorage.getItem('user');

    const userObject = JSON.parse(userData);

    // Access the 'id' field
    const userId = userObject.id;

    DataTable.use(DT);


    const toggleDetailsPage = () => {
        setIsDetailsOpen(!isDetailsOpen);
    };
    const handleViewButtonClick = (query) => {
        setSelectedQuery(query);
        setIsDetailsOpen(true);
    };
    const handleSummaryButtonClick = (query) => {
        setSummaryOpen(true);
    };
    const toggleSummaryPage = () => {
        setSummaryOpen(!summaryOpen);
    };

    useEffect(() => {
        // Initialize select2 for Select Team
        $(selectUserRef.current).select2({
            placeholder: "Select Website",
            allowClear: true,
        }).on('change', (e) => {
            setSelectedWebsite($(e.target).val());
        });


        return () => {
            // Destroy select2 when the component unmounts
            if (selectUserRef.current) {
                $(selectUserRef.current).select2('destroy');
            }
        };
    }, [websites]);

    // Fetch all data on initial render
    useEffect(() => {
        fetchQuotes();
        fetchWebsites();

    }, []);

    const fetchWebsites = async () => {
        
        try {
            const response = await fetch(
                'https://instacrm.rapidcollaborate.com/api/getallwebsites',
                {
                    method: 'POST', // Use POST method
                    headers: {
                        'Content-Type': 'application/json', // Set content type to JSON
                    },
                    body: JSON.stringify(), // Pass the POST data as JSON
                }
            );
    
            const data = await response.json(); // Parse the response as JSON
            if (data.status) {
                setWebsites(data.data); 
            } else {
                console.error('Failed to fetch Websites:', data.message);
            }
        } catch (error) {
            console.error('Error fetching Websites:', error);
        } 
    };

    const fetchQuotes = async () => {
        setLoading(true);


        try {
            const response = await fetch(
                'https://apacvault.com/Webapi/loadcontactmadequeries',
                {
                    method: 'POST', // Use POST method
                    headers: {
                        'Content-Type': 'application/json', // Set content type to JSON
                    },
                    body: JSON.stringify({ user_id: userId, search_keywords: keyword, ref_id: RefId, website:selectedWebsite }), // Pass the POST data as JSON
                }
            );

            const data = await response.json(); // Parse the response as JSON
            if (data.status) {
                setQuotes(data.data); // Update the quotes state
            } else {
                console.error('Failed to fetch quotes:', data.message);
            }
        } catch (error) {
            console.error('Error fetching quotes:', error);
        } finally {
            setLoading(false); // Hide loading spinner
        }
    };



    const columns = [
        {
            title: 'Ref Id',
            data: 'assign_id',
            orderable: false,
        },
        {
            title: 'User Name',
            data: 'user_name',
            orderable: false,
        },
        {
            title: 'Email',
            data: 'email_id',
            orderable: false,
            render: function (data, type, row) {
                return `<div class="flex items-center">${data} ${row.showBellicon == 1 ? ('<i class="fa fa-bell ml-2 text-red-400" aria-hidden="false"></i>') : ""}</div> `;
            }
        },
        {
            title: 'Client Name',
            data: 'name',
            orderable: false,
            render: function (data, type, row) {
                return `<div>${data || "N/A"}</div>`;
            }
        },
        {
            title: 'Contact',
            data: 'phone',
            orderable: false,
        },

        {
            title: 'Website',
            data: 'website_name',
            orderable: false,
        },
        {
            title: 'Actions',
            data: null,
            orderable: false,
            render: (data, type, row) => `
        <button class="view-btn vd mx-1 p-1  text-white" style="font-size:10px;border-radius:3px;" data-id="${row.assign_id}">
            View Details
        </button>
      `,
        },
    ];

    const resetFilters = () => {
        setKeyword('');
        setRefId('');
        setSelectedWebsite('');
        $(selectUserRef.current).val(null).trigger('change');
        fetchQuotes();
    };

    return (
        <div className="container bg-gray-100 w-full">
            <h1 className='text-xl font-bold'>Query History</h1>

            {/* Filter Section */}
            <div className="flex items-center space-x-2 my-3 bg-white px-4 py-2 rounded aql">
                <div className="w-1/2">
                    <input
                        type="text"
                        className="form-control"
                        placeholder='Ref ID'
                        value={RefId}
                        onChange={(e) => setRefId(e.target.value)}
                    />
                </div>
                <div className="w-1/2">
                    <input
                        type="text"
                        className="form-control"
                        placeholder='Enter Search Keywords'
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                </div>
                <div className="w-1/2">
                    <select
                        id="user_id"
                        className=" px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 form-control"

                        value={selectedWebsite}
                        ref={selectUserRef}
                    >
                        <option value="">Select Website</option>
                        {websites.map(website => (
                            <option key={website.id} value={website.id}>
                                {website.website}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="w-1/2 flex justify-content-end space-x-2 mt-1">
                    <label>&nbsp;</label>
                    <button className="gree text-white mr-2 flex items-center" onClick={fetchQuotes}>
                        <Filter size={12} /> &nbsp;
                        Apply Filters
                    </button>
                    <button className="bg-gray-200 text-gray-500  hover:bg-gray-300 ic" onClick={resetFilters}>
                        <RefreshCcw size={12} />
                    </button>
                    <button className="bg-gray-200 text-gray-500  hover:bg-gray-300 ic" onClick={handleSummaryButtonClick} title='View Summary'>
                        <ListIcon size={12} />
                    </button>
                </div>
            </div>

            {loading ? (
                <CustomLoader />
            ) : (
                <div className='bg-white dt border-t-2 border-blue-400 rounded'>
                    <div className="table-scrollable">
                        <DataTable
                            data={quotes}
                            columns={columns}
                            
                            options={{
                                ordering: false,
                                pageLength: 50,
                                createdRow: (row, data) => {
                                    $(row).find('.view-btn').on('click', () => handleViewButtonClick(data));
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

                        queryId={selectedQuery.assign_id}
                    />

                )}
                {summaryOpen && (

                    <SummaryPage
                        onClose={toggleSummaryPage}

                    />

                )}
            </AnimatePresence>

        </div>
    );
};

export default ManageContactMadeQueries;