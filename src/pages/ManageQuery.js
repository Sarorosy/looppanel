import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import $ from 'jquery';
import React, { useState, useEffect, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import FeasabilityPage from './FeasabilityPage';
// import { io } from "socket.io-client";
// const socket = io("http://localhost:3001");


const ManageQuery = () => {
    const [quotes, setQuotes] = useState([]);
    const [userPendingQuotes, setUserPendingQuotes] = useState([]);
    const [adminPendingQuotes, setAdminPendingQuotes] = useState([]);
    const [refID, setRefId] = useState('');
    const [keyword, setKeyword] = useState('');
    const [status, setStatus] = useState('');
    const [feasStatus, setFeasStatus] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
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
    const [pendingFeasRequestCount, setPendingFeasRequestCount] = useState(0);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const navigate = useNavigate();

    DataTable.use(DT);

    const userData = sessionStorage.getItem('user');

    const userObject = JSON.parse(userData);
    useEffect(() => {
        // Check if the user is not an admin or the email is not 'clientsupport@chanakyaresearch.net'
        if (!(userObject && (userObject.email_id == "accounts@redmarkediting.com" || userObject.email_id == "clientsupport@chanakyaresearch.net"))) {
            navigate('/assignquery');
        }
    }, [userObject, navigate]);


    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };


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
        fetchQuotes(false);
        fetchServices();
        fetchTags();

    }, []);

    const fetchQuotes = async (nopayload = false) => {

        setLoading(true);



        // Only use the filters if `nopayload` is false
        const userid = selectedUser;
        const ref_id = refID;
        const search_keywords = keyword;
        const service_name = selectedService;
        const tags = selectedTags;
        const feasability_status = feasStatus;
        const start_date = startDate;
        const end_date = endDate;

        // Define the payload conditionally
        let payload = {
            userid, ref_id, search_keywords, status, service_name, ptp, tags, feasability_status, start_date, end_date
        };

        if (nopayload) {
            // If nopayload is true, send an empty payload
            payload = {};
        }

        try {
            const response = await fetch(
                'https://apacvault.com/Webapi/listaskforscope',
                {
                    method: 'POST', // Use POST method
                    headers: {
                        'Content-Type': 'application/json', // Set content type to JSON
                    },
                    body: JSON.stringify(payload), // Send the payload conditionally
                }
            );

            const data = await response.json(); // Parse the response as JSON
            if (data.status) {
                if (quotes.length != 0 && JSON.stringify(data.allQuoteData) !== JSON.stringify(quotes)) {
                    setQuotes(data.allQuoteData);

                    const userPending = data.allQuoteData.filter((quote) =>
                        quote.submittedtoadmin === "false"  // Ensure correct check for "false" value
                    );
                    const adminPending = data.allQuoteData.filter((quote) =>
                        quote.submittedtoadmin === "true" && quote.status == 0
                    );

                    // Set filtered data into states
                    setUserPendingQuotes(userPending);

                    setAdminPendingQuotes(adminPending);

                } else if (quotes.length == 0) {
                    setQuotes(data.allQuoteData);
                    const userPending = data.allQuoteData.filter((quote) =>
                        quote.submittedtoadmin === "false"  // Ensure correct check for "false" value
                    );
                    const adminPending = data.allQuoteData.filter((quote) =>
                        quote.submittedtoadmin === "true" && quote.status == 0
                    );

                    // Set filtered data into states
                    setUserPendingQuotes(userPending);

                    setAdminPendingQuotes(adminPending);
                }
                setUsers(data.users);
                setPendingFeasRequestCount(data.pendingFeasRequestCount);
            } else {
                console.error('Failed to fetch quotes:', data.message);
            }
        } catch (error) {
            console.error('Error fetching quotes:', error);
        } finally {
            setLoading(false); // Hide loading spinner
        }
    };
    const fetchQuotesTwo = async (nopayload = false) => {



        // Only use the filters if `nopayload` is false
        const userid = selectedUser;
        const ref_id = refID;
        const search_keywords = keyword;
        const service_name = selectedService;
        const tags = selectedTags;
        const feasability_status = feasStatus;
        const start_date = startDate;
        const end_date = endDate;

        // Define the payload conditionally
        let payload = {
            userid, ref_id, search_keywords, status, service_name, ptp, tags, feasability_status, start_date, end_date
        };

        if (nopayload) {
            // If nopayload is true, send an empty payload
            payload = {};
        }

        try {
            const response = await fetch(
                'https://apacvault.com/Webapi/listaskforscope',
                {
                    method: 'POST', // Use POST method
                    headers: {
                        'Content-Type': 'application/json', // Set content type to JSON
                    },
                    body: JSON.stringify(payload), // Send the payload conditionally
                }
            );

            const data = await response.json(); // Parse the response as JSON
            if (data.status) {
                if (quotes.length != 0 && JSON.stringify(data.allQuoteData) !== JSON.stringify(quotes)) {
                    setQuotes(data.allQuoteData);

                    const userPending = data.allQuoteData.filter((quote) =>
                        quote.submittedtoadmin === "false"  // Ensure correct check for "false" value
                    );
                    const adminPending = data.allQuoteData.filter((quote) =>
                        quote.submittedtoadmin === "true" && quote.status == 0
                    );

                    // Set filtered data into states
                    setUserPendingQuotes(userPending);

                    setAdminPendingQuotes(adminPending);

                } else if (quotes.length == 0) {
                    setQuotes(data.allQuoteData);
                    const userPending = data.allQuoteData.filter((quote) =>
                        quote.submittedtoadmin === "false"  // Ensure correct check for "false" value
                    );
                    const adminPending = data.allQuoteData.filter((quote) =>
                        quote.submittedtoadmin === "true" && quote.status == 0
                    );

                    // Set filtered data into states
                    setUserPendingQuotes(userPending);

                    setAdminPendingQuotes(adminPending);
                }
                setUsers(data.users);
                setPendingFeasRequestCount(data.pendingFeasRequestCount);
            } else {
                console.error('Failed to fetch quotes:', data.message);
            }
        } catch (error) {
            console.error('Error fetching quotes:', error);
        }
    };


    useEffect(() => {
        fetchQuotes();


        // socket.on("updateTable", (data) => {
        //     console.log("Received updateTable event with data:", data);
        //     const formattedData = {
        //         ref_id: data.ref_id,
        //         id:data.id,
        //         service_name: data.service_name,
        //         currency :data.currency,
        //         other_currency : data.other_currency ?? null,
        //         user_name: `${data.fld_first_name} ${data.fld_last_name}`,
        //         tags: data.tag_names,
        //         status: data.status,
        //         fld_first_name : data.fld_first_name,
        //         created_date: data.created_date,
        //         feasibility_status: data.feasability_status,
        //         comments: data.comments, 
        //     };


        //     setQuotes((prevQuotes) => [...prevQuotes, formattedData]);
        //     toast('New Quote '+data.id+' Request Submitted for refId ' + data.ref_id, {
        //         icon: '💡',
        //       });
        // });

        
        // return () => {
        //     socket.off("updateTable");
        // };

    }, []);


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
            orderable: false,
            render: function (data, type, row) {
                let html = `${data}`;

                if (row.ptp === "Yes") {
                    html += `
                        <span 
                            style="
                                padding: 2px 4px; 
                                background-color: #2B9758FF; 
                                color: #ffffff; 
                                font-size: 11px; 
                                font-weight: bold; 
                                line-height: 1.2;
                                z-index: 1 !important;
                            ">
                            PTP
                        </span>
                    `;
                }

                if (row.edited == 1) {
                    html += `
                        <span 
                            style="
                                padding: 1px 6px; 
                                background-color: #D1D5DB; 
                                color: #4B5563; 
                                font-size: 11px; 
                                border-radius: 9999px; 
                                margin-left: 8px;
                            ">
                            Edited
                        </span>
                    `;
                }

                return html; // Return the complete HTML with conditions applied
            },
        },
        {
            title: 'Ask For Scope ID',
            data: 'id',
            width: "20x",
            orderable: false,
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
            title: 'Quote Status',
            data: 'status', // Replace with actual field name
            orderable: false,
            render: function (data, type, row) {
                if (row.isfeasability == 1 && row.submittedtoadmin == "false") {
                    return '<span class="text-red-600 font-bold">Pending at User</span>';
                } else if (row.changestatus == 1 && row.submittedtoadmin == "false") {
                    return '<span class="text-red-600 font-bold">Pending at User</span>';
                } else {
                    if (data == 0) {
                        return '<span class="text-red-600 font-bold">Pending at Admin</span>';
                    } else if (data == 1) {
                        return '<span class="text-green-600 font-bold">Submitted</span>';
                    } else if (data == 2) {
                        return '<span class="text-yellow-600 font-bold">Discount Requested</span>';
                    }
                }
                return '<span class="text-gray-600">Unknown</span>';
            },
        },
        {
            title: 'Feasability Status',
            data: 'feasability_status', // Replace with actual field name
            orderable: false,
            render: function (data, type, row) {
                if (row.isfeasability == 1) {
                    if (data == 'Pending') {
                        return '<span class="text-red-600 font-bold">Pending</span>';
                    } else if (data == 'Completed') {
                        return `
                            <div>
                                <span class="text-green-600 font-bold">Completed</span>
                            </div>
                        `;
                    }
                }
                // Return "-" if no feasability_status is present
                return '-';
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
            orderable: true,
            render: (data, type, row) => {
                if (data) {
                    const date = new Date(data * 1000);
                    const day = date.getDate().toString().padStart(2, '0'); // Ensures two-digit day
                    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Ensures two-digit month
                    const year = date.getFullYear().toString(); // Gets year
                    const hours = date.getHours().toString().padStart(2, '0'); // Ensures two-digit hours
                    const minutes = date.getMinutes().toString().padStart(2, '0'); // Ensures two-digit minutes
                    const seconds = date.getSeconds().toString().padStart(2, '0'); // Ensures two-digit seconds

                    // Return the formatted date for display
                    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
                }
                return 'N/A';
            },
            // Sort based on the UNIX timestamp for correct ordering
            createdCell: (cell, cellData, rowData, row, col, table) => {
                // This is just in case you want to keep the original timestamp for sorting purposes
                $(cell).attr('data-sort', cellData);
            }
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

    const resetFilters = async () => {
        // Reset filter states
        setRefId('');
        setKeyword('');
        setStatus('');
        setFeasStatus('');
        setStartDate('');
        setEndDate('');
        setSelectedUser('');  // Reset selected user
        setSelectedService('');  // Reset selected service
        setSelectedTags([]);  // Reset selected tags

        // Reset the select elements and trigger change
        $(selectUserRef.current).val(null).trigger('change');
        $(selectServiceRef.current).val(null).trigger('change');
        $(tagsRef.current).val([]).trigger('change');


        try {
            // Fetch quotes after resetting the filters
            await fetchQuotes(true);
        } catch (error) {
            console.error("Error fetching quotes after resetting filters:", error);
        }
    };



    return (
        <div className="container bg-gray-100 w-full">

            {/* Filter Section */}
            <div className=" mb-3 bg-white px-3 py-3 rounded ">
                <div className='flex justify-between  mb-4'>
                    <h1 className='text-xl font-bold'>All Quote List</h1>
                    <div className='flex'>

                        <button className="bg-gray-200 text-gray-500 hover:bg-gray-300  f-12 btn px-2 py-1 flex items-center relative" onClick={toggleAllFeasPage}>
                            <FileQuestion size={15} className="mr-1" />
                            Feasibility Request
                            <span style={{ top: "-15px", right: "-10px" }} className="absolute inline-flex items-center justify-center px-2 py-1 text-xs font-semibold text-white bg-red-600 rounded-full">
                                {pendingFeasRequestCount}
                            </span>
                        </button>
                    </div>
                </div>
                <div className='flex items-end space-x-2'>
                    <div className="row">
                        <div className="col-2 mb-3">
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder='Ref ID'
                                value={refID}
                                onChange={(e) => setRefId(e.target.value)}
                            />
                        </div>
                        <div className="col-2 mb-3">
                            <select
                                id="user_id"
                                className=" px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 form-control form-control-sm slt-x-isu "

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
                        <div className="col-2 mb-3">
                            <select
                                id="service_name"
                                className=" px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 form-control form-control-sm"

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
                        <div className="col-2 mb-3">

                            <select
                                className="form-control form-control-sm"
                                value={ptp}
                                onChange={(e) => setPtp(e.target.value)}
                            >
                                <option value="">Select PTP</option>
                                <option value="Yes">Yes</option>
                            </select>
                        </div>
                        <div className="col-2 mb-3">

                            <select
                                className="form-control form-control-sm"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value="">Select Quote Status</option>
                                <option value="PendingAtUser">Pending at User</option>
                                <option value="PendingAtAdmin">Pending at Admin</option>
                                <option value="1">Submitted</option>
                                <option value="2">Discount Requested</option>
                            </select>
                        </div>
                        <div className="col-2 mb-3">

                            <select
                                className="form-control form-control-sm"
                                value={feasStatus}
                                onChange={(e) => setFeasStatus(e.target.value)}
                            >
                                <option value="">Feasability Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                        <div className="col-2">
                            <DatePicker
                                className="form-control form-control-sm"
                                selected={startDate}
                                onChange={(dates) => {
                                    const [start, end] = dates;
                                    setStartDate(start);
                                    setEndDate(end);
                                }}
                                placeholderText="Select Date Range"
                                dateFormat="yyyy/MM/dd"
                                selectsRange
                                startDate={startDate}
                                endDate={endDate}
                                maxDate={new Date()} // Optional: Restrict to past dates
                            />
                        </div>
                        <div className='col-2'>
                            <select
                                name="tags"
                                id="tags"
                                className="form-control form-control-sm select2-hidden-accessible slt-tag-inp"
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
                        <div className="col flex items-center justify-end">
                            {/* <label>&nbsp;</label> */}
                            <div className='flex'>
                                <button className="bg-gray-200 text-gray-500  hover:bg-gray-300  f-12 btn px-2 py-1 mr-2" onClick={resetFilters}>
                                    <RefreshCcw size={14} />
                                </button>
                                <button className="gree text-white mr-1 flex items-center f-12 btn px-2 py-1" onClick={() => { fetchQuotes(false) }}>
                                    <Filter size={12} /> &nbsp;
                                    Apply
                                </button>

                            </div>


                        </div>
                    </div>


                </div>
            </div>

            {loading ? (
                <CustomLoader />
            ) : (
                <div className="bg-white p-4 border-t-2 border-blue-400 rounded">
                    {/* Tab Buttons */}
                    <div className="mb-4">
                        <div className="flex space-x-4">
                            <button
                                onClick={() => handleTabClick('all')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out ${activeTab === 'all'
                                    ? 'bg-blue-500 text-white border border-blue-600'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-blue-50'
                                    }`}
                            >
                                All Quotes
                            </button>
                            <button
                                onClick={() => handleTabClick('pendingUser')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out ${activeTab === 'pendingUser'
                                    ? 'bg-blue-500 text-white border border-blue-600'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-blue-50'
                                    }`}
                            >
                                Pending at User
                            </button>
                            <button
                                onClick={() => handleTabClick('pendingAdmin')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out ${activeTab === 'pendingAdmin'
                                    ? 'bg-blue-500 text-white border border-blue-600'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-blue-50'
                                    }`}
                            >
                                Pending at Admin
                            </button>
                        </div>
                    </div>


                    {/* Tab Content */}
                    {activeTab === 'all' && (
                        <div className="table-scrollable">
                            <DataTable
                                data={quotes}
                                columns={columns}
                                options={{
                                    pageLength: 50,
                                    ordering: true,
                                    createdRow: (row, data) => {
                                        $(row).find('.view-btn').on('click', () => handleViewButtonClick(data));
                                    },
                                }}
                            />
                        </div>
                    )}
                    {activeTab === 'pendingUser' && (
                        <div className="table-scrollable">
                            <DataTable
                                data={userPendingQuotes}
                                columns={columns}
                                options={{
                                    pageLength: 50,
                                    ordering: true,
                                    createdRow: (row, data) => {
                                        $(row).find('.view-btn').on('click', () => handleViewButtonClick(data));
                                    },
                                }}
                            />
                        </div>
                    )}
                    {activeTab === 'pendingAdmin' && (
                        <div className="table-scrollable">
                            <DataTable
                                data={adminPendingQuotes}
                                columns={columns}
                                options={{
                                    pageLength: 50,
                                    ordering: true,
                                    createdRow: (row, data) => {
                                        $(row).find('.view-btn').on('click', () => handleViewButtonClick(data));
                                    },
                                }}
                            />
                        </div>
                    )}
                </div>
            )}

            <AnimatePresence>


                {isDetailsOpen && (

                    <QueryDetailsAdmin
                        onClose={toggleDetailsPage}
                        quotationId={selectedQuote}
                        queryId={selectedQuery.ref_id}
                        after={() => { fetchQuotes(false) }}
                    />

                )}
                {isAllFeasOpen && (
                    <FeasabilityPage onClose={toggleAllFeasPage} after={() => { fetchQuotes(false) }} />
                )}
            </AnimatePresence>
            <Toaster position="top-right" reverseOrder={false} />
        </div>
    );
};

export default ManageQuery;