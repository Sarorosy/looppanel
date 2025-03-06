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
import { RefreshCcw, Filter, FileQuestion, ArrowBigLeft, MoveLeft, ArrowLeftRight, FilterIcon } from 'lucide-react';
import QueryDetailsAdmin from './QueryDetailsAdmin';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AllFeasPage from './AllFeasPage';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import FeasabilityPage from './FeasabilityPage';
import * as XLSX from 'xlsx';
import { io } from "socket.io-client";
import { getSocket } from './Socket';
import TransferRequestsPage from './TransferRequestsPage';
import TableLoader from '../components/TableLoader';
const socket = getSocket();

const ManageQuery = ({ sharelinkrefid, sharelinkquoteid }) => {
    const [quotes, setQuotes] = useState([]);
    const [userPendingQuotes, setUserPendingQuotes] = useState([]);
    const [adminPendingQuotes, setAdminPendingQuotes] = useState([]);
    const [refID, setRefId] = useState('');
    const [scopeId, setScopeId] = useState('');
    const [keyword, setKeyword] = useState('');
    const [status, setStatus] = useState('');
    const [feasStatus, setFeasStatus] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
    const [users, setUsers] = useState([]);
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState('');
    const [selectedSubjectArea, setSelectedSubjectArea] = useState('');
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
    const [pendingTransRequestCount, setPendingTransRequestCount] = useState(0);
    const [startDate, setStartDate] = useState(null);
    const [TransferPageVisible, setTransferPageVisible] = useState(false);
    const [endDate, setEndDate] = useState(null);
    const [callOption, setCallOption] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [selectedRows, setSelectedRows] = useState([]);
    const [filterSummary, setFilterSummary] = useState('');
    const [showFilterDiv, setShowFilterDiv] = useState(true);

    const navigate = useNavigate();


    DataTable.use(DT);

    const userData = localStorage.getItem('user');

    const userObject = JSON.parse(userData);

    const loopUserData = localStorage.getItem('loopuser');

    const loopUserObject = JSON.parse(loopUserData);

    useEffect(() => {
        const isAuthorizedUser =
            userObject && (
                userObject.email_id == "accounts@redmarkediting.com" ||
                userObject.id == "366"
            );

        const isScopeAdmin = loopUserObject && loopUserObject.scopeadmin == 1;

        if (!isAuthorizedUser && !isScopeAdmin) {
            navigate('/assignquery');
        }

    }, [userObject, loopUserObject, navigate]);



    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };
    const handleSelectAll = (isChecked) => {
        if (isChecked) {
            // Select all rows across all pages
            setSelectedRows(quotes.map((row) => row.id)); // Select all row IDs
            $('.row-checkbox').prop('checked', true); // Check all row checkboxes
        } else {
            // Deselect all rows across all pages
            setSelectedRows([]); // Deselect all rows
            $('.row-checkbox').prop('checked', false); // Uncheck all row checkboxes
        }
    };


    const handleRowSelect = (rowId, isChecked) => {
        setSelectedRows((prevSelected) =>
            isChecked
                ? [...prevSelected, rowId] // Add row ID if checked
                : prevSelected.filter((id) => id != rowId) // Remove row ID if unchecked
        );
    };

    const handleExport = () => {
        // Define the custom headers and map the data
        const headers = ['Ref ID', 'Ask For Scope Id', 'Client Name', 'CRM Name', 'Currrency', 'Comments', 'Service', 'Quote Status', 'Feasibility Status', 'Created On']; // Define your custom table headings
        const filteredData = quotes
            .filter((row) => selectedRows.includes(row.id))
            .map((row) => ({
                RefID: row.ref_id,
                AskForScopeID: row.id, // Example field
                ClientName: row.client_name,
                CRMName: row.fld_first_name + " " + row.fld_last_name,
                Currency: row.currency,
                Comments: row.comments,
                Service: row.service_name,
                QuoteStatus: row.status == 0 ? "Pending" : "Submitted",
                FeasibilityStatus: row.isfeasability == 1 ? row.feasability_status : "",
                CreatedOn: new Date(row.created_date * 1000).toLocaleString(), // Adjust field names based on your data
            }));

        // Add the headers as the first row
        const worksheetData = [headers, ...filteredData.map(Object.values)];

        // Create worksheet and workbook
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Quotes');

        // Export the file
        XLSX.writeFile(workbook, 'Exported_Data.xlsx');
    };


    const toggleDetailsPage = () => {
        setIsDetailsOpen(!isDetailsOpen);
    };

    const toggleAllFeasPage = () => {
        setIsAllFeasOpen(!isAllFeasOpen);
    };
    const toggleTransferRequests = () => {
        setTransferPageVisible(!TransferPageVisible);
    };

    const handleViewButtonClick = (query) => {
        setSelectedQuery(query);
        setSelectedQuote(query.id)
        setIsDetailsOpen(true);
    };
    useEffect(() => {
        if (sharelinkrefid && sharelinkquoteid) {
            setSelectedQuery({ ref_id: sharelinkrefid });
            setSelectedQuote(sharelinkquoteid);
            setIsDetailsOpen(true);
        }
    }, [sharelinkrefid, sharelinkquoteid]);


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
        //fetchQuotes(false);
        fetchServices();
        fetchTags();

    }, []);

    const fetchQuotes = async (nopayload = false) => {

        setLoading(true);


        const userid = selectedUser;
        const ref_id = refID;
        const scope_id = scopeId;
        const search_keywords = keyword;
        const service_name = selectedService;
        const subject_area = selectedSubjectArea;
        const tags = selectedTags;
        const feasability_status = feasStatus;
        const start_date = startDate;
        const end_date = endDate;
        const callrecordingpending = callOption;

        let payload = {
            userid, ref_id, scope_id, subject_area, search_keywords, status, service_name, ptp, tags, feasability_status, start_date, end_date , callrecordingpending
        };

        if (nopayload) {
            payload = {};
        }

        try {

            const response = await fetch(
                'https://apacvault.com/Webapi/listaskforscope',
                {
                    method: 'POST', // Use POST method
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                }
            );

            const data = await response.json();
            if (data.status) {
                if (quotes.length != 0 && JSON.stringify(data.allQuoteData) !== JSON.stringify(quotes)) {
                    setQuotes(data.allQuoteData);

                    const userPending = data.allQuoteData.filter((quote) =>
                        quote.submittedtoadmin === "false"
                    );
                    const adminPending = data.allQuoteData.filter((quote) =>
                        quote.submittedtoadmin === "true" && quote.status == 0
                    );


                    setUserPendingQuotes(userPending);

                    setAdminPendingQuotes(adminPending);
                    setFilterSummary('')
                    let summary = 'Showing results for : ';
                    const appliedFilters = [];

                    if (refID) appliedFilters.push(`Ref ID: ${refID}`);
                    if (scope_id) appliedFilters.push(`Scope ID: ${scope_id}`);
                    if (ptp && ptp == 'Yes') appliedFilters.push(`PTP: YES`);
                    if (callOption && callOption == '1') appliedFilters.push(`Call Recording Pending`);
                    if (userid) appliedFilters.push(`User: ${users.find(u => u.id === userid)?.fld_first_name ?? 'N/A'}`);
                    if (service_name) appliedFilters.push(`Service: ${services.find(s => s.id === service_name)?.name ?? 'N/A'}`);
                    if (subject_area) appliedFilters.push(`Subject: ${subject_area}`);
                    if (tags.length > 0) appliedFilters.push(`Tags: ${tags.join(', ')}`);
                    if (status) appliedFilters.push(`Status: ${status}`);
                    if (feasability_status) appliedFilters.push(`Feasibility: ${feasability_status}`);
                    if (start_date && end_date) appliedFilters.push(`Date: ${start_date.toLocaleDateString()} - ${end_date.toLocaleDateString()}`);

                    setFilterSummary(appliedFilters.length > 0 ? summary + appliedFilters.join(', ') : 'Showing all results');

                } else if (quotes.length == 0) {
                    setQuotes(data.allQuoteData);
                    const userPending = data.allQuoteData.filter((quote) =>
                        quote.submittedtoadmin === "false"
                    );
                    const adminPending = data.allQuoteData.filter((quote) =>
                        quote.submittedtoadmin === "true" && quote.status == 0
                    );

                    setUserPendingQuotes(userPending);

                    setAdminPendingQuotes(adminPending);
                }
                setUsers(data.users);
                setPendingFeasRequestCount(data.pendingFeasRequestCount);
                setPendingTransRequestCount(data.pendingTransferRequestCount ?? 0);
                resetFiltersWithoutApiCall();
            } else {
                console.error('Failed to fetch quotes:', data.message);
            }
        } catch (error) {
            console.error('Error fetching quotes:', error);
        } finally {
            setLoading(false);
        }
    };
    const fetchQuotesTwo = async (nopayload = false) => {

        const userid = selectedUser;
        const ref_id = refID;
        const search_keywords = keyword;
        const service_name = selectedService;
        const tags = selectedTags;
        const feasability_status = feasStatus;
        const start_date = startDate;
        const end_date = endDate;

        let payload = {
            userid, ref_id, search_keywords, status, service_name, ptp, tags, feasability_status, start_date, end_date
        };

        if (nopayload) {
            payload = {};
        }

        try {
            const response = await fetch(
                'https://apacvault.com/Webapi/listaskforscope',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                }
            );

            const data = await response.json();
            if (data.status) {
                if (quotes.length != 0 && JSON.stringify(data.allQuoteData) !== JSON.stringify(quotes)) {
                    setQuotes(data.allQuoteData);

                    const userPending = data.allQuoteData.filter((quote) =>
                        quote.submittedtoadmin === "false"
                    );
                    const adminPending = data.allQuoteData.filter((quote) =>
                        quote.submittedtoadmin === "true" && quote.status == 0
                    );

                    setUserPendingQuotes(userPending);

                    setAdminPendingQuotes(adminPending);

                } else if (quotes.length == 0) {
                    setQuotes(data.allQuoteData);
                    const userPending = data.allQuoteData.filter((quote) =>
                        quote.submittedtoadmin === "false"
                    );
                    const adminPending = data.allQuoteData.filter((quote) =>
                        quote.submittedtoadmin === "true" && quote.status == 0
                    );

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


        socket.on("updateTable", (data) => {
            console.log("Received updateTable event with data:", data);
            const formattedData = {
                ref_id: data.ref_id,
                id: data.id,
                service_name: data.service_name,
                currency: data.currency,
                other_currency: data.other_currency ?? null,
                user_name: `${data.fld_first_name} ${data.fld_last_name}`,
                tags: data.tag_names,
                status: data.status,
                fld_first_name: data.fld_first_name,
                created_date: data.created_date,
                feasibility_status: data.feasability_status,
                comments: data.comments,
            };


            setQuotes((prevQuotes) => [...prevQuotes, formattedData]);
            if (data.submittedtoadmin == "true") {
                setAdminPendingQuotes((prevQuotes) => [...prevQuotes, formattedData])
            } else if (data.submittedtoadmin == "true") {
                setUserPendingQuotes((prevQuotes) => [...prevQuotes, formattedData])
            }
            if (data.isfeasability == 0) {
                toast(data.fld_first_name + ' Submitted a request Quote ' + data.id + ' for refId ' + data.ref_id, {
                    icon: '💡',
                });
            } else if (data.isfeasability == 1) {
                toast(data.fld_first_name + ' Created Feasibility request Quote ' + data.id + ' for refId ' + data.ref_id, {
                    icon: '❓❗',
                });
            }
        });


        return () => {
            socket.off("updateTable");
        };

    }, []);
    useEffect(() => {
        socket.on('chatresponse', (data) => {
            if (data.user_id != loopUserObject.id) {
                toast(data.user_name + " Sent a chat for Quote " + data.quote_id, {
                    icon: "💬",
                })
            }

        });

        return () => {
            socket.off('chatresponse');  // Clean up on component unmount
        };
    }, []);

    useEffect(() => {
        socket.on('updateQuery', (data) => {
            toast(data.user_name + ' Submitted a request Quote ' + data.quote_id + ' for refId ' + data.ref_id, {
                icon: '💡',
            });
            setQuotes((prev) => {
                return prev.map((quote) =>
                    quote.id == data.quote_id
                        ? { ...quote, submittedtoadmin: "true" }
                        : quote
                );
            });
            setAdminPendingQuotes((prev) => {
                return prev.map((quote) =>
                    quote.id == data.quote_id
                        ? { ...quote, submittedtoadmin: "true" }
                        : quote
                );
            });
            setUserPendingQuotes((prev) =>
                prev.filter((quote) => quote.id != data.quote_id)
            );


        });

        return () => {
            socket.off('updateQuery');  // Clean up on component unmount
        };
    }, []);

    useEffect(() => {
        socket.on('quoteReceived', (data) => {

            setQuotes((prev) => {
                return prev.map((quote) =>
                    quote.id == data.quote_id
                        ? { ...quote, status: 1 }
                        : quote
                );
            });
            setAdminPendingQuotes((prev) => {
                return prev.map((quote) =>
                    quote.id == data.quote_id
                        ? { ...quote, status: 1 }
                        : quote
                );
            });

        });

        return () => {
            socket.off('quoteReceived');  // Clean up on component unmount
        };
    }, []);

    useEffect(() => {
        socket.on('discountReceived', (data) => {

            toast(data.user_name + " Requested discount for Quote " + data.quote_id, {
                icon: "💯",
            });
            setQuotes((prev) =>
                prev.map((quote) =>
                    quote.id == data.quote_id ? { ...quote, status: 2 } : quote
                )
            );

        });

        return () => {
            socket.off('discountReceived');  // Clean up on component unmount
        };
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
            title: `
                <input 
                    type="checkbox" 
                    class="select-all-checkbox" 
                />
            `,
            data: null,
            orderable: false,
            render: () => `
                <input 
                    type="checkbox" 
                    class="row-checkbox" 
                />
            `,
        },
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
                if (row.callrecordingpending == 1) {
                    html += `
                        <span 
                            style="
                                padding: 2px 4px;
                                color: #E69500FF; 
                                font-size: 11px; 
                                font-weight: bold; 
                                line-height: 1.2;
                                z-index: 1 !important;
                            ">
                            <i class="fa fa-headphones" aria-hidden="true"></i>
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
            title: 'Client Name',
            data: 'client_name',
            orderable: false,
            className: 'text-center',
            render: function (data, type, row) {
                return data ? data : 'null'; // Check if data exists; if not, return 'null'
            },
        },
        {
            title: 'CRM Name',
            data: 'fld_first_name',
            orderable: false,
            render: (data, type, row) => {
                let name = row.fld_first_name + " " + (row.fld_last_name != null ? row.fld_last_name : "");

                // Check if the user is deleted
                if (row.isdeleted == 1) {
                    return `<div style="text-align: left; color: red; text-decoration: line-through;" title="This user was deleted">
                                ${row.deleted_user_name}
                            </div>`;
                }

                // If the user is not deleted, just return the normal name
                return `<div style="text-align: left;">${name}</div>`;
            },
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
            title: 'Feasibility Status',
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
        setScopeId('');
        setKeyword('');
        setCallOption('');
        setStatus('');
        setFeasStatus('');
        setStartDate('');
        setEndDate('');
        setSelectedUser('');  // Reset selected user
        setSelectedService('');  // Reset selected service
        setSelectedSubjectArea('');
        setSelectedTags([]);  // Reset selected tags

        // Reset the select elements and trigger change
        $(selectUserRef.current).val(null).trigger('change');
        $(selectServiceRef.current).val(null).trigger('change');
        $(tagsRef.current).val([]).trigger('change');
        setFilterSummary('');


        try {
            // Fetch quotes after resetting the filters
            await fetchQuotes(true);
        } catch (error) {
            console.error("Error fetching quotes after resetting filters:", error);
        }
    };

    const resetFiltersWithoutApiCall = async () => {
        // Reset filter states
        setRefId('');
        setScopeId('');
        setCallOption('')
        setKeyword('');
        setStatus('');
        setFeasStatus('');
        setStartDate('');
        setEndDate('');
        setSelectedUser('');  // Reset selected user
        setSelectedService('');  // Reset selected service
        setSelectedSubjectArea('');
        setSelectedTags([]);  // Reset selected tags

        // Reset the select elements and trigger change
        $(selectUserRef.current).val(null).trigger('change');
        $(selectServiceRef.current).val(null).trigger('change');
        $(tagsRef.current).val([]).trigger('change');

    };



    return (
        <div className="container bg-gray-100 w-full">

            {/* Filter Section */}
            <div className=" mb-3 bg-white px-3 py-3 rounded ">
                <div className='flex justify-between mb-1'>
                    <div className='flex items-center space-x-2'>
                        <h1 className='text-xl font-bold'>All Quote List</h1>
                        <button
                            onClick={() => setShowFilterDiv(!showFilterDiv)}
                            className="btn btn-primary btn-sm"
                        >
                            <FilterIcon size={15} />
                        </button>

                    </div>
                    <div className='flex'>
                        {(loopUserObject.id == "206" || loopUserObject.scopeadmin == 1) && (
                            <button className="bg-gray-200 flex items-center relative mr-3 p-1 rounded" onClick={() => { navigate("/assignquery") }}>
                                <MoveLeft size={20} className='mr-2' />
                                Queries
                            </button>
                        )}
                        <button onClick={handleExport} className="bg-blue-400 text-white text-sm mr-2  px-2 py-1 rounded hover:bg-blue-500">
                            Export as XLS
                        </button>

                        <button className="bg-gray-200 text-gray-500 hover:bg-gray-300  f-12 btn px-2 py-1 flex items-center relative" onClick={toggleAllFeasPage}>
                            <FileQuestion size={15} className="mr-1" />
                            Feasibility Request
                            <span style={{ top: "-15px", right: "-10px" }} className="absolute inline-flex items-center justify-center px-2 py-1 text-xs font-semibold text-white bg-red-600 rounded-full">
                                {pendingFeasRequestCount}
                            </span>
                        </button>
                        <button className="ml-2 bg-gray-200 text-gray-500 hover:bg-gray-300  f-12 btn px-2 py-1 flex items-center relative" onClick={toggleTransferRequests}>
                            <ArrowLeftRight size={15} className="mr-1" />
                            Transfer Requests
                            <span style={{ top: "-15px", right: "-10px" }} className="absolute inline-flex items-center justify-center px-2 py-1 text-xs font-semibold text-white bg-red-600 rounded-full">
                                {pendingTransRequestCount}
                            </span>
                        </button>
                    </div>
                </div>
                <div className={`${showFilterDiv ? 'hidden' : 'flex'} items-end space-x-2 border py-3 mt-3 px-3 bg-light`}>
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
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder='Scope ID'
                                value={scopeId}
                                onChange={(e) => setScopeId(e.target.value)}
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
                                id="subject_area"
                                className="form-control form-control-sm"
                                value={selectedSubjectArea}
                                onChange={(e) => setSelectedSubjectArea(e.target.value)}
                            >
                                <option value="">Select Subject Area</option>

                                <option value="Accounting">Accounting</option>
                                <option value="Accounts Law">Accounts Law</option>
                                <option value="Agency Law">Agency Law</option>
                                <option value="Alternative Dispute Resolution (ADR)/Mediation">Alternative Dispute Resolution (ADR)/Mediation</option>
                                <option value="Anthropology">Anthropology</option>
                                <option value="Archaeology">Archaeology</option>
                                <option value="Architecture">Architecture</option>
                                <option value="Art">Art</option>
                                <option value="Biology">Biology</option>
                                <option value="Business">Business</option>
                                <option value="Chemistry">Chemistry</option>
                                <option value="Children &amp; Young People">Children &amp; Young People</option>
                                <option value="Civil Litigation Law">Civil Litigation Law</option>
                                <option value="Commercial Law">Commercial Law</option>
                                <option value="Commercial Property Law">Commercial Property Law</option>
                                <option value="Communications">Communications</option>
                                <option value="Company/business/partnership Law">Company/business/partnership Law</option>
                                <option value="Comparative Law">Comparative Law</option>
                                <option value="Competition Law">Competition Law</option>
                                <option value="Computer Science">Computer Science</option>
                                <option value="Constitutional/administrative Law">Constitutional/administrative Law</option>
                                <option value="Construction">Construction</option>
                                <option value="Consumer Law">Consumer Law</option>
                                <option value="Contract Law">Contract Law</option>
                                <option value="Corporate Finance">Corporate Finance</option>
                                <option value="Counselling">Counselling</option>
                                <option value="Criminal Law">Criminal Law</option>
                                <option value="Criminal Litigation">Criminal Litigation</option>
                                <option value="Criminology">Criminology</option>
                                <option value="Cultural Studies">Cultural Studies</option>
                                <option value="Cybernetics">Cybernetics</option>
                                <option value="Design">Design</option>
                                <option value="Dental">Dental</option>
                                <option value="Drama">Drama</option>
                                <option value="Economics">Economics</option>
                                <option value="EEconometrics">EEconometrics</option>
                                <option value="Education">Education</option>
                                <option value="Employment">Employment</option>
                                <option value="Employment Law">Employment Law</option>
                                <option value="Engineering">Engineering</option>
                                <option value="English Language">English Language</option>
                                <option value="English Literature">English Literature</option>
                                <option value="Environment">Environment</option>
                                <option value="Environment Law">Environment Law</option>
                                <option value="Environmental Sciences">Environmental Sciences</option>
                                <option value="Equity Law">Equity Law</option>
                                <option value="Estate Management">Estate Management</option>
                                <option value="European Law">European Law</option>
                                <option value="European Studies">European Studies</option>
                                <option value="Eviews">Eviews</option>
                                <option value="Family Law">Family Law</option>
                                <option value="Fashion">Fashion</option>
                                <option value="Film Studies">Film Studies</option>
                                <option value="Finance">Finance</option>
                                <option value="Finance Law">Finance Law</option>
                                <option value="Food and Nutrition">Food and Nutrition</option>
                                <option value="Forensic Science">Forensic Science</option>
                                <option value="French">French</option>
                                <option value="General Law">General Law</option>
                                <option value="Geography">Geography</option>
                                <option value="Geology">Geology</option>
                                <option value="German">German</option>
                                <option value="Health">Health</option>
                                <option value="Health &amp; Social Care">Health &amp; Social Care</option>
                                <option value="Health and Safety">Health and Safety</option>
                                <option value="Health and Safety Law">Health and Safety Law</option>
                                <option value="History">History</option>
                                <option value="Holistic/alternative therapy">Holistic/alternative therapy</option>
                                <option value="Housing">Housing</option>
                                <option value="Housing Law">Housing Law</option>
                                <option value="Human Resource Management">Human Resource Management</option>
                                <option value="Human Rights">Human Rights</option>
                                <option value="HR">HR</option>
                                <option value="Immigration/refugee Law">Immigration/refugee Law</option>
                                <option value="Information - Media &amp; Technology Law">Information - Media &amp; Technology Law</option>
                                <option value="Information Systems">Information Systems</option>
                                <option value="Information Technology">Information Technology</option>
                                <option value="IT">IT</option>
                                <option value="Intellectual Property Law">Intellectual Property Law</option>
                                <option value="International Business">International Business</option>
                                <option value="International Commerical Law">International Commerical Law</option>
                                <option value="International Law">International Law</option>
                                <option value="International political economy">International political economy</option>
                                <option value="International Relations">International Relations</option>
                                <option value="International Studies">International Studies</option>
                                <option value="Jurisprudence">Jurisprudence</option>
                                <option value="Land/property Law">Land/property Law</option>
                                <option value="Landlord &amp; Tenant Law">Landlord &amp; Tenant Law</option>
                                <option value="Law of Evidence">Law of Evidence</option>
                                <option value="Life Sciences">Life Sciences</option>
                                <option value="Linguistics">Linguistics</option>
                                <option value="Logistics">Logistics</option>
                                <option value="Management">Management</option>
                                <option value="Maritime Law">Maritime Law</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Maths">Maths</option>
                                <option value="Media">Media</option>
                                <option value="Medical Law">Medical Law</option>
                                <option value="Medical Technology">Medical Technology</option>
                                <option value="Medicine">Medicine</option>
                                <option value="Mental Health">Mental Health</option>
                                <option value="Mental Health Law">Mental Health Law</option>
                                <option value="Methodology">Methodology</option>
                                <option value="Music">Music</option>
                                <option value="Negligence Law">Negligence Law</option>
                                <option value="Nursing">Nursing</option>
                                <option value="Occupational therapy">Occupational therapy</option>
                                <option value="Operations">Operations</option>
                                <option value="Pharmacology">Pharmacology</option>
                                <option value="Philosophy">Philosophy</option>
                                <option value="Photography">Photography</option>
                                <option value="Physical Education">Physical Education</option>
                                <option value="Physics">Physics</option>
                                <option value="Planning/environmental Law">Planning/environmental Law</option>
                                <option value="Politics">Politics</option>
                                <option value="Project Management">Project Management</option>
                                <option value="Professional Conduct Law">Professional Conduct Law</option>
                                <option value="Psychology">Psychology</option>
                                <option value="Psychotherapy">Psychotherapy</option>
                                <option value="Public Administration">Public Administration</option>
                                <option value="Public Health">Public Health</option>
                                <option value="Public Law">Public Law</option>
                                <option value="Quantity Surveying">Quantity Surveying</option>
                                <option value="Real Estate">Real Estate</option>
                                <option value="Restitution Law">Restitution Law</option>
                                <option value="Shipping Law">Shipping Law</option>
                                <option value="Sports">Sports</option>
                                <option value="Social Policy">Social Policy</option>
                                <option value="Social Work">Social Work</option>
                                <option value="Social Work Law">Social Work Law</option>
                                <option value="Sociology">Sociology</option>
                                <option value="Spanish">Spanish</option>
                                <option value="Sports Law">Sports Law</option>
                                <option value="Sports Science">Sports Science</option>
                                <option value="SPSS">SPSS</option>
                                <option value="Statistics">Statistics</option>
                                <option value="Succession Law">Succession Law</option>
                                <option value="Supply">Supply Chain</option>
                                <option value="Tax Law">Tax Law</option>
                                <option value="Teacher Training">Teacher Training</option>
                                <option value="Theatre Studies">Theatre Studies</option>
                                <option value="Theology &amp; Religion">Theology &amp; Religion</option>
                                <option value="Tort Law">Tort Law</option>
                                <option value="Tourism">Tourism</option>
                                <option value="Town &amp; Country Planning">Town &amp; Country Planning</option>
                                <option value="Translation">Translation</option>
                                <option value="Trusts Law">Trusts Law</option>
                                <option value="Wills/probate Law">Wills/probate Law</option>
                                <option value="Economics (Social Sciences)">Economics (Social Sciences)</option>
                                <option value="Other">Other</option>

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
                                <option value="">Feasibility Status</option>
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
                        <div className=" mb-3" style={{width: "140px"}}>

                            <select
                                className="form-control form-control-sm"
                                value={callOption}
                                onChange={(e) => setCallOption(e.target.value)}
                            >
                                <option value="">Call Recording</option>
                                <option value="1">Pending</option>
                            </select>
                        </div>
                        <div className="col flex items-center justify-end">
                            {/* <label>&nbsp;</label> */}
                            <div className='flex'>
                                <button className="bg-gray-200 text-gray-500 flex items-cente  hover:bg-gray-300  f-12 btn px-2 py-1 mr-2" onClick={resetFilters}>
                                    <RefreshCcw size={14} /> &nbsp;
                                    Reset Filters
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
                <TableLoader />
            ) : (
                <div className="bg-white p-4 border-t-2 border-blue-400 rounded">
                    {filterSummary && <p className="text-gray-600 text-sm mb-3 font-semibold">{filterSummary}</p>}

                    {/* Tab Buttons */}
                    <div className="mb-4">
                        <div className="flex space-x-4" >
                            <button
                                onClick={() => handleTabClick('all')}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out ${activeTab === 'all'
                                    ? 'bg-blue-500 text-white border border-blue-600'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-blue-50'
                                    }`}
                            >
                                All Quotes
                            </button>
                            <button
                                onClick={() => handleTabClick('pendingUser')}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out ${activeTab === 'pendingUser'
                                    ? 'bg-blue-500 text-white border border-blue-600'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-blue-50'
                                    }`}
                            >
                                Pending at User
                            </button>
                            <button
                                onClick={() => handleTabClick('pendingAdmin')}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out ${activeTab === 'pendingAdmin'
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
                                    order: [[11, 'desc']],

                                    createdRow: (row, data) => {
                                        // Attach event listener for the "View Details" button
                                        $(row).find('.view-btn').on('click', () => handleViewButtonClick(data));

                                        // Handle row-specific checkbox events
                                        $(row).find('.row-checkbox').on('change', (e) => {
                                            const isChecked = e.target.checked;
                                            handleRowSelect(data.id, isChecked);
                                        });

                                    },
                                    initComplete: () => {
                                        // Attach event listener for "Select All" checkbox
                                        $('.select-all-checkbox').on('change', (e) => {
                                            const isChecked = e.target.checked;
                                            handleSelectAll(isChecked);
                                        });
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
                {TransferPageVisible && (
                    <TransferRequestsPage onClose={() => { setTransferPageVisible(!TransferPageVisible) }} />
                )}
            </AnimatePresence>

        </div>
    );
};

export default ManageQuery;