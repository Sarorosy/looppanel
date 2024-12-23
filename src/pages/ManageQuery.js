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
import { RefreshCcw, Filter, FileQuestion } from 'lucide-react';
import QueryDetailsAdmin from './QueryDetailsAdmin';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AllFeasPage from './AllFeasPage';



const ManageQuery = () => {
    const [quotes, setQuotes] = useState([]);
    const [refID, setRefId] = useState('');
    const [keyword, setKeyword] = useState('');
    const [status, setStatus] = useState('');
    const [users, setUsers] = useState([]);
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [ptp, setPtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [tags, setTags] = useState([]);
    const tagsRef = useRef(null);
    const selectUserRef = useRef(null);
    const selectServiceRef = useRef(null);
    const [selectedQuery, setSelectedQuery] = useState('');
    const [selectedQuote, setSelectedQuote] = useState('');
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isAllFeasOpen, setIsAllFeasOpen] = useState(false);
    const navigate = useNavigate();

    DataTable.use(DT);

    const userData = sessionStorage.getItem('user');

    const userObject = JSON.parse(userData);
    useEffect(() => {
        if (!userObject || userObject.user_type !== "admin") {
            navigate('/assignquery');
        }
    }, [userObject, navigate]);


    const toggleDetailsPage = () => {
        setIsDetailsOpen(!isDetailsOpen);
    };

    const toggleAllFeasPage = () => {
        setIsAllFeasOpen(!isAllFeasOpen);
    };

    const handleViewButtonClick = (query) => {
        setSelectedQuery(query);
        setSelectedQuote(query.id)
        setIsDetailsOpen(true);
    };

    useEffect(() => {
        // Initialize select2 for Select Team
        $(selectUserRef.current).select2({
            placeholder: "Select User",
            allowClear: true,
        }).on('change', (e) => {
            setSelectedUser($(e.target).val());
        });


        return () => {
            // Destroy select2 when the component unmounts
            if (selectUserRef.current) {
                $(selectUserRef.current).select2('destroy');
            }
        };
    }, [users]);

    useEffect(() => {
        // Initialize select2 for Select Team
        $(selectServiceRef.current).select2({
            placeholder: "Select Service",
            allowClear: true,
        }).on('change', (e) => {
            setSelectedService($(e.target).val());
        });


        return () => {
            // Destroy select2 when the component unmounts
            if (selectServiceRef.current) {
                $(selectServiceRef.current).select2('destroy');
            }
        };
    }, [services]);

    // Fetch all data on initial render
    useEffect(() => {
        fetchQuotes();
        fetchServices();
        fetchTags();

    }, []);

    const fetchQuotes = async () => {
        setLoading(true); // Show loading spinner
        const userid = selectedUser;
        const ref_id = refID;
        const search_keywords = keyword;
        const service_name = selectedService;
        const tags = selectedTags;


        try {
            const response = await fetch(
                'https://apacvault.com/Webapi/listaskforscope',
                {
                    method: 'POST', // Use POST method
                    headers: {
                        'Content-Type': 'application/json', // Set content type to JSON
                    },
                    body: JSON.stringify({ userid, ref_id, search_keywords, status, service_name, ptp, tags }), // Pass the POST data as JSON
                }
            );

            const data = await response.json(); // Parse the response as JSON
            if (data.status) {
                setQuotes(data.allQuoteData); // Update the quotes state
                setUsers(data.users);
            } else {
                console.error('Failed to fetch quotes:', data.message);
            }
        } catch (error) {
            console.error('Error fetching quotes:', error);
        } finally {
            setLoading(false); // Hide loading spinner
        }
    };

    const fetchServices = async () => {

        try {
            const response = await fetch(
                'https://apacvault.com/Webapi/getAllServices',
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
                setServices(data.data);
            } else {
                console.error('Failed to fetch Services:', data.message);
            }
        } catch (error) {
            console.error('Error fetching Services:', error);
        }
    };
    const fetchTags = async () => {
        try {
            const response = await fetch('https://apacvault.com/Webapi/getTags');
            const data = await response.json();
            if (data.status) setTags(data.data || []);
        } catch (error) {
            
        }
    };

    useEffect(() => {
        // Initialize select2 for Tags
        $(tagsRef.current).select2({
            placeholder: "Select Tags",
            allowClear: true,
            multiple: true,
        }).on('change', (e) => {
            const selectedValues = $(e.target).val();
            setSelectedTags(selectedValues || []);
        });


        $(tagsRef.current).val(selectedTags).trigger('change');


        return () => {
            // Clean up select2 on component unmount
            if (tagsRef.current) {
                $(tagsRef.current).select2('destroy');
            }
        };
    }, [tags]);

    const columns = [
        {
            title: 'Ref Id',
            data: 'ref_id',
            width: "110px",
            orderable: true,
            render: function (data, type, row) {
                if (row.ptp === "Yes") {
                    return `
                        ${data}
                        <span 
                            style="
                               
                                padding: 2px 4px; 
                                background-color: #2B9758FF;
                                color: #ffffff; 
                                font-size: 11px; 
                                font-weight: bold; 
                                line-height: 1.2;
                                z-index:1 !important;
                            ">
                            PTP
                        </span>
                    `;
                } else {
                    return data; // Default case
                }
            },
        },
        {
            title: 'Ask For Scope ID',
            data: 'id',
            width: "20x",
            orderable: true,
            className: 'text-center',
        },
        {
            title: 'CRM Name',
            data: 'fld_first_name',
            orderable: false,
            render: (data, type, row) => `<div style="text-align: left;">${row.fld_first_name + " " + (row.fld_last_name != null ? row.fld_last_name : "")}</div>`,
        },
        {
            title: 'Currency',
            data: 'null',
            orderable: false,
            render: function (data, type, row) {
                if (row.currency == "Other") {
                    return row.other_currency;
                } else {
                    return row.currency;
                }
            },
        },
        {
            title: 'Comments',
            data: 'comments',
            orderable: false,
            render: (data) => {
                // Check if the data is not empty and its length is greater than 50 characters
                const truncatedData = (data && data.length > 40) ? data.substring(0, 40) + '...' : (data || 'N/A');
                return `<div style="text-align: left;">${truncatedData}</div>`;
            },
        },
        {
            title: 'Service',
            data: 'service_name',
            orderable: false,
            render: (data) => `<div style="text-align: left;">${data || 'N/A'}</div>`,
        },
        {
            title: 'Status',
            data: 'status', // Replace with actual field name
            orderable: false,
            render: function (data, type, row) {
                if (data == 0) {
                    return '<span class="text-red-600 font-bold">Pending</span>';
                } else if (data == 1) {
                    return '<span class="text-green-600 font-bold">Submitted</span>';
                } else if (data == 2) {
                    return '<span class="text-yellow-600 font-bold">Discount Requested</span>';
                }
                return '<span class="text-gray-600">Unknown</span>';
            },
        },
        {
            title: 'Tags',
            data: 'tag_names', // Replace with actual field name from your dataset
            orderable: false,
            width: "130px",
            className: "text-sm",
            render: function (data, type, row) {
                if (!data) return ''; // Handle empty or null data

                // Split tags, wrap each in a styled span, and join them
                return data.split(',')
                    .map(tag =>
                        `<span class="text-blue-500 inline-block" style="font-sze:10px">
                            #${tag.trim()}
                        </span>`
                    )
                    .join(''); // Combine all spans into one HTML string
            }
        },

        {
            title: 'Created Date',
            data: 'created_date',
            orderable: false,
            render: (data) => {
                return data ? new Date(data * 1000).toLocaleDateString() : 'N/A';
            },
        },
        {
            title: 'Actions',
            data: null,
            orderable: false,
            render: (data, type, row) => `
        <button class="view-btn vd mx-1 p-1  text-white" style="font-size:10px;border-radius:3px;     white-space: nowrap;" data-id="${row.ref_id}">
            View Details
        </button>
      `,
        },
    ];

    const resetFilters = () => {
        setRefId('');
        setKeyword('');
        setStatus('');
        $(selectUserRef.current).val('').trigger('change');
        $(selectServiceRef.current).val('').trigger('change');
        setSelectedService('');
        setSelectedUser('');
        setSelectedTags([]);
        $(tagsRef.current).val('').trigger('change');
        fetchQuotes();  // Fetch unfiltered data
    };

    return (
        <div className="container bg-gray-100 w-full">


            {/* Filter Section */}
            <div className=" mb-3 bg-white px-3 py-3 rounded ">
                <h1 className='text-xl font-bold mb-3'>All Quote List</h1>
                <div className='flex items-center space-x-2 aql'>
                    <div className="w-1/3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder='Ref ID'
                            value={refID}
                            onChange={(e) => setRefId(e.target.value)}
                        />
                    </div>
                    <div className="w-1/3">
                        <select
                            id="user_id"
                            className=" px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 form-control slt-x-isu "

                            value={selectedUser}
                            ref={selectUserRef}
                        >
                            <option value="">Select User</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.fld_first_name + " " + user.fld_last_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="w-1/3">
                        <select
                            id="service_name"
                            className=" px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 form-control"

                            value={selectedService}
                            ref={selectServiceRef}
                        >
                            <option value="">Select Service</option>
                            {services.map(service => (
                                <option key={service.id} value={service.id}>
                                    {service.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="w-1/3 ss">

                        <select
                            className="form-control"
                            value={ptp}
                            onChange={(e) => setPtp(e.target.value)}
                        >
                            <option value="">Select PTP</option>
                            <option value="Yes">Yes</option>
                        </select>
                    </div>
                    <div className="w-1/3 ss">

                        <select
                            className="form-control"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="">Select Status</option>
                            <option value="Pending">Pending</option>
                            <option value="1">Submitted</option>
                            <option value="2">Discount Requested</option>
                        </select>
                    </div>
                    <div className='w-1/2 ss'>
                        <select
                            name="tags"
                            id="tags"
                            className="px-0 py-0 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 form-control select2-hidden-accessible"
                            multiple
                            value={selectedTags}
                            ref={tagsRef}
                        >
                            <option value="">Select Tags</option>
                            {tags.map((tag) => (
                                <option key={tag.id} value={tag.id}>
                                    {tag.tag_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="w-1/2 flex justify-content-end space-x-1 items-center">
                        <label>&nbsp;</label>
                        <button className="gree text-white mr-1 flex items-center" onClick={fetchQuotes}>
                            <Filter size={12} /> &nbsp;
                            Apply
                        </button>
                        <button className="bg-gray-200 text-gray-500  hover:bg-gray-300 ic" onClick={resetFilters}>
                            <RefreshCcw size={12} />
                        </button>
                        <button className="bg-gray-200 text-gray-500  hover:bg-gray-300 ic flex items-center" onClick={toggleAllFeasPage}>
                            <FileQuestion size={15} />
                            Feasability Request
                        </button>

                    </div>
                </div>
            </div>

            {loading ? (
                <CustomLoader />
            ) : (
                <div className='bg-white p-4 border-t-2 border-blue-400 rounded'>
                    <div className="table-scrollable">
                        <DataTable
                            data={quotes}
                            columns={columns}
                            options={{
                                pageLength: 50,
                                ordering: false,
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

                    <QueryDetailsAdmin
                        onClose={toggleDetailsPage}
                        quotationId={selectedQuote}
                        queryId={selectedQuery.ref_id}
                        after={fetchQuotes}
                    />

                )}
                {isAllFeasOpen && (
                    <AllFeasPage onClose={toggleAllFeasPage} />
                )}
            </AnimatePresence>

        </div>
    );
};

export default ManageQuery;