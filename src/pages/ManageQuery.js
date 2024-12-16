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
import { RefreshCcw,Filter} from 'lucide-react';
import QueryDetailsAdmin from './QueryDetailsAdmin';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';



const ManageQuery = () => {
    const [quotes, setQuotes] = useState([]);
    const [refID, setRefId] = useState('');
    const [keyword, setKeyword] = useState('');
    const [status, setStatus] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('')
    const [loading, setLoading] = useState(false);
    const selectUserRef = useRef(null);
    const [selectedQuery, setSelectedQuery] = useState('');
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
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
    const handleViewButtonClick = (query) => {
        setSelectedQuery(query);
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

    // Fetch all data on initial render
    useEffect(() => {
        fetchQuotes();

    }, []);

    const fetchQuotes = async () => {
        setLoading(true); // Show loading spinner
        const userid = selectedUser;
        const ref_id = refID;
        const search_keywords = keyword;
        
        try {
            const response = await fetch(
                'https://apacvault.com/Webapi/listaskforscope',
                {
                    method: 'POST', // Use POST method
                    headers: {
                        'Content-Type': 'application/json', // Set content type to JSON
                    },
                    body: JSON.stringify({ userid, ref_id,search_keywords ,status }), // Pass the POST data as JSON
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
            data: 'ref_id',
            orderable: true,
        },
        {
            title: 'Ask For Scope ID',
            data: 'id',
            orderable: true,
            className: 'text-center',
        },
        {
            title: 'CRM Name',
            data: 'fld_first_name',
            orderable: false,
            render: (data, type,row) => `<div style="text-align: left;">${row.fld_first_name + " " + (row.fld_last_name != null ? row.fld_last_name : "")}</div>`,
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
        <button class="view-btn vd mx-1 p-1  text-white" style="font-size:10px;border-radius:3px;" data-id="${row.ref_id}">
            View Details
        </button>
      `,
        },
    ];

    const resetFilters = () => {
        setRefId('');
        setKeyword('');
        setSelectedUser('');
        setStatus('')
        $(selectUserRef.current).val(null).trigger('change');
        fetchQuotes();  // Fetch unfiltered data
    };

    return (
        <div className="container bg-gray-100 w-full">
            <h1 className='text-xl font-bold'>All Quote List</h1>

            {/* Filter Section */}
            <div className="flex items-center space-x-2 my-3 bg-white px-4 py-2 rounded aql">
                <div className="w-1/2">
                <input
                        type="text"
                        className="form-control"
                        placeholder='Ref ID'
                        value={refID}
                        onChange={(e) => setRefId(e.target.value)}
                    />
                </div>
                <div className="w-1/2">
                    <select
                        id="user_id"
                        className=" px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 form-control"

                        value={selectedUser}
                        ref={selectUserRef}
                    >
                        <option value="">Select User</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.fld_first_name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="w-1/2 ss">
                    
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
                <div className="w-1/2 flex justify-content-end space-x-2 mt-1">
                    <label>&nbsp;</label>
                    <button className="gree text-white mr-2 flex items-center" onClick={fetchQuotes}>
                    <Filter size={12}/> &nbsp;
                        Apply Filters
                    </button>
                    <button className="bg-gray-200 text-gray-500  hover:bg-gray-300 ic" onClick={resetFilters}>
                        <RefreshCcw size={12}/>
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
                   
                        <QueryDetailsAdmin
                            onClose={toggleDetailsPage}
                            
                            queryId={selectedQuery.ref_id}
                        />
                    
                )}
            </AnimatePresence>
           
        </div>
    );
};

export default ManageQuery;