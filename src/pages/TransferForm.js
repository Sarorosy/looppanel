import React, { useState, useEffect, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import 'react-quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';
import $ from 'jquery';
import 'select2/dist/css/select2.min.css';
import 'select2';
import CustomLoader from '../CustomLoader';

const TransferForm = ({ refId, quotationId, finalFunction, onClose }) => {
    const [selectedUser, setSelectedUser] = useState('');

    const [currencies, setCurrencies] = useState([]);
    const [services, setServices] = useState([]);
    const [users, setUsers] = useState([]);
    const userRef = useRef(null);
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);

    const plans = ['Basic', 'Standard', 'Advanced'];



    const fetchUsers = async () => {
        try {
            const user = JSON.parse(sessionStorage.getItem('loopuser')); // Parse user object from sessionStorage
            const user_id = user?.id; // Retrieve the category

            if (!user_id) {
                toast.error('User is not available in sessionStorage');
                return;
            }

            const response = await fetch('https://apacvault.com/Webapi/getAllUsers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id }), // Send category in the request body
            });

            const data = await response.json();

            if (data.status) {
                setUsers(data.data || []); // Set fetched services
            } else {
                toast.error('Failed to fetch users');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Error fetching users');
        }
    };

    const userData = sessionStorage.getItem('loopuser');

    const userObject = JSON.parse(userData);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const payload = new FormData();
            payload.append('ref_id', refId);
            payload.append('quote_id', quotationId);
            payload.append('user_id', selectedUser);
            payload.append('ref_user_id',userObject.id )

            const response = await fetch('https://apacvault.com/Webapi/TransferUser', {
                method: 'POST',
                body: payload,
            });

            const data = await response.json();
            if (data.status) {
                toast.success('Request updated successfully.');
                onClose();
                finalFunction();
            } else {
                toast.error('Failed to update request.');
            }
        } catch (error) {
            console.error('Error updating request:', error);
            toast.error('Error updating request.');
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);


    useEffect(() => {
        // Initialize select2 for Tags
        $(userRef.current).select2({
            placeholder: "Select User",
            allowClear: true,
        }).on('change', (e) => {
            setSelectedUser($(e.target).val());
            console.log(selectedUser);
        });



        return () => {
            // Clean up select2 on component unmount
            if (userRef.current) {
                $(userRef.current).select2('destroy');
            }
        };
    }, [users]);


    const planColors = {
        Basic: 'text-blue-400', // Custom brown color
        Standard: 'text-gray-400', // Silver color
        Advanced: 'text-yellow-500', // Gold color
    };

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed right-0 h-full w-1/2 bg-gray-100 shadow-lg z-50 overflow-y-auto "
            style={{ top: "-20px" }}
        >
            <div className="bg-white p-6 shadow rounded-md space-y-4">
                <div className="flex items-center justify-between bg-blue-400 text-white p-2">
                    <h2 className="text-xl font-semibold flex items-center">Transfer User {loading && (<CustomLoader />)}</h2>
                    <button onClick={onClose} className="text-white hover:text-red-600 transition-colors">
                        <X size={15} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={`form-wrapper ${loading ? 'loading' : ''}`} >
                    <div className="w-full grid grid-cols-3 gap-4 space-x-1">

                        <div className='w-full'>
                            {/* Tags */}
                            <label>Select User</label>
                            <select
                                name="tags"
                                id="tags"
                                className="form-select select2 w-auto py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={selectedUser}
                                ref={userRef}
                            >
                                <option value="">Select User</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.fld_first_name + " " + user.fld_last_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className='mt-2'>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                        >
                            {submitting ? 'Submitting...' : 'Update Request'}
                        </button>
                    </div>
                </form>

            </div>
        </motion.div>
    );
};

export default TransferForm;
