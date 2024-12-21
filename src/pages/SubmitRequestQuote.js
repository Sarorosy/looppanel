import React, { useState, useEffect, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import 'react-quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';
import $ from 'jquery';
import 'select2/dist/css/select2.min.css'; // Import Select2 CSS
import 'select2';


const SubmitRequestQuote = ({ refId, after, onClose }) => {
    const [currencies, setCurrencies] = useState([]);
    const [services, setServices] = useState([]);
    const [selectedCurrency, setSelectedCurrency] = useState('');
    const [otherCurrency, setOtherCurrency] = useState('');
    const [selectedService, setSelectedService] = useState('');
    const [selectedPlans, setSelectedPlans] = useState([]);
    const [comments, setComments] = useState('');
    const [files, setFiles] = useState([{ id: Date.now(), file: null }]);
    const [submitting, setSubmitting] = useState(false);
    const [isfeasability, setIsFeasability] = useState(0);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const userRef = useRef(null);
    const plans = ['Basic', 'Standard', 'Advanced']; // Hardcoded plans

    const handleCheckboxChange = (plan) => {
        setSelectedPlans((prev) =>
            prev.includes(plan)
                ? prev.filter((p) => p !== plan) // Remove if already selected
                : [...prev, plan] // Add if not selected
        );
    };

    const planColors = {
        Basic: 'text-blue-400', // Custom brown color
        Standard: 'text-gray-400', // Silver color
        Advanced: 'text-yellow-500', // Gold color
    };

    const userData = sessionStorage.getItem('user');
    const LoopUserData = sessionStorage.getItem('loopuser');

    // Parse the JSON string into an object
    const userObject = JSON.parse(userData);

    const loopUserObject = JSON.parse(LoopUserData);

    const fetchCurrencies = async () => {
        try {
            const response = await fetch('https://apacvault.com/Webapi/getCurrencies');
            const data = await response.json();
            if (data.status) {
                setCurrencies(data.data || []); // Set fetched currencies
            } else {
                toast.error('Failed to fetch currencies');
            }
        } catch (error) {
            console.error('Error fetching currencies:', error);
            toast.error('Error fetching currencies');
        }
    };

    const fetchServices = async () => {
        try {
            const user = JSON.parse(sessionStorage.getItem('user')); // Parse user object from sessionStorage
            const category = user?.category; // Retrieve the category

            if (!category) {
                toast.error('Category is not available in sessionStorage');
                return;
            }

            const response = await fetch('https://apacvault.com/Webapi/getServices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ category }), // Send category in the request body
            });

            const data = await response.json();

            if (data.status) {
                setServices(data.data || []); // Set fetched services
            } else {
                toast.error('Failed to fetch services');
            }
        } catch (error) {
            console.error('Error fetching services:', error);
            toast.error('Error fetching services');
        }
    };

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

    const handleFileChange = (id, event) => {
        const updatedFiles = files.map((item) =>
            item.id === id ? { ...item, file: event.target.files[0] } : item
        );
        setFiles(updatedFiles);
    };

    const handleAddFileInput = () => {
        setFiles([...files, { id: Date.now(), file: null }]);
    };

    const handleRemoveFileInput = (id) => {
        setFiles(files.filter((item) => item.id !== id));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        if (!selectedCurrency || !selectedService || !selectedPlans || !comments) {
            toast.error('Please fill in all fields');
            setSubmitting(false);
            return;

        }
        if (selectedCurrency == "Other" && !otherCurrency) {
            toast.error('Please enter other currrency name!');
            setSubmitting(false);
            return;
        }
        if (isfeasability == 1 && !selectedUser) {
            toast.error('Please select user to assign!');
            setSubmitting(false);
            return;
        }

        const formData = new FormData();
        formData.append('ref_id', refId);
        formData.append('currency', selectedCurrency);
        formData.append('other_currency', otherCurrency);
        formData.append('service_name', selectedService);
        formData.append('plan', selectedPlans);
        formData.append('comments', comments);
        formData.append('isfeasability', isfeasability);
        formData.append('feasability_user', selectedUser);
        formData.append('user_id', loopUserObject.id);
        formData.append('user_name', loopUserObject.fld_first_name + " " + loopUserObject.fld_last_name);
        formData.append('category', userObject.category);
        files.forEach((item, index) => {
            if (item.file) {
                formData.append(`quote_upload_file[${index}]`, item.file);
            }
        });

        try {
            const response = await fetch('https://apacvault.com/Webapi/submitRequestQuoteApiAction/', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (data.status) {
                toast.success('Quote request submitted successfully');
                after();
                onClose();
            } else {
                toast.error('Failed to submit quote request');
            }
        } catch (error) {
            console.error('Error submitting quote request:', error);

        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        fetchCurrencies();
        fetchServices();
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


        $(userRef.current).val(selectedUser).trigger('change');


        return () => {
            // Clean up select2 on component unmount
            if (userRef.current) {
                $(userRef.current).select2('destroy');
            }
        };
    }, [users]);


    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed right-0 h-full w-1/2 bg-gray-100 shadow-lg z-50 overflow-y-auto "
            style={{ top: "-20px" }}
        >
            <div className="bg-white p-6 m-3 space-y-4 w-xl">
                <div className="flex items-center justify-between bg-gradient-to-r from-blue-500 to-blue-700 text-white p-2 rounded-lg shadow-lg">
                    {/* Tabs */}
                    <div className="flex items-center space-x-4">
                        <h2
                            className={`tab-btn-n-set cursor-pointer px-2 py-1 rounded-lg transition-colors ${isfeasability == 0
                                    ? "bg-white text-blue-700 shadow-md"
                                    : "bg-blue-600 hover:bg-blue-500 text-gray-200"
                                }`}
                            onClick={() => setIsFeasability(0)}
                        >
                            Ask For Scope
                        </h2>
                        <h2
                            className={`tab-btn-n-set cursor-pointer px-2 py-1 rounded-lg transition-colors ${isfeasability == 1
                                    ? "bg-white text-blue-700 shadow-md"
                                    : "bg-blue-600 hover:bg-blue-500 text-gray-200"
                                }`}
                            onClick={() => setIsFeasability(1)}
                        >
                            Ask For Feasibility Check
                        </h2>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="text-white hover:text-red-500 transition-colors p-1 rounded-full bg-red-600 hover:bg-red-500"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className='p-3 m-0'>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input type="hidden" name="ref_id" value={refId} />

                        <div className='w-full grid grid-cols-3 gap-4 space-x-1'>
                            {/* Currency Dropdown */}
                            <div className='w-full'>
                                <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                                    Currency
                                </label>
                                <select
                                    id="currency"
                                    value={selectedCurrency}
                                    onChange={(e) => setSelectedCurrency(e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm form-control form-control-sm"
                                >
                                    <option value="">Select Currency</option>
                                    {currencies.map((currency) => (
                                        <option key={currency.id} value={currency.name}>
                                            {currency.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {selectedCurrency == 'Other' && (
                                <div className="w-full">
                                    <label htmlFor="otherCurrency" className="block text-sm font-medium text-gray-700">
                                        Other Currency Name
                                    </label>
                                    <input
                                        type="text"
                                        id="otherCurrency"
                                        value={otherCurrency}
                                        onChange={(e) => setOtherCurrency(e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm form-control form-control-sm"
                                        placeholder="Currency name"
                                    />
                                </div>
                            )}

                            {/* Service Name Dropdown */}
                            <div className='w-full'>
                                <label htmlFor="service_name" className="block text-sm font-medium text-gray-700">
                                    Service Name
                                </label>
                                <select
                                    id="service_name"
                                    value={selectedService}
                                    onChange={(e) => setSelectedService(e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm form-control form-control-sm"
                                >
                                    <option value="">Select Service</option>
                                    {services.map((service) => (
                                        <option key={service.id} value={service.id}>
                                            {service.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                           


                        </div>
                         {/* Plan Dropdown */}
                         <div className="w-full mt-4">
                                <label htmlFor="plan" className="block text-sm font-medium text-gray-700">
                                    Plan
                                </label>
                                <div className="mt-1 flex">
                                    {plans.map((plan, index) => (
                                        <div key={index} className="flex items-center mb-2 mr-5">
                                            <input
                                                type="checkbox"
                                                id={`plan-${index}`}
                                                value={plan}
                                                checked={selectedPlans.includes(plan)}
                                                onChange={() => handleCheckboxChange(plan)}
                                                className={`form-checkbox h-4 w-4 border-gray-300 rounded ${planColors[plan]}`}
                                            />
                                            <label htmlFor={`plan-${index}`} className={`ml-2 mb-0 text-sm font-medium ${planColors[plan]}`}>
                                                {plan}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        <div className={`w-full ${isfeasability == 0 ? "hidden" : "block"}`}>
                            {/* Tags */}
                            <label className="block text-sm font-medium text-gray-700">Select User to Assign</label>
                            <select
                                name="user"
                                id="user"
                                className="form-select select2 w-72 py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 form-control"

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
                        <div className='flex items-start justify-between space-x-1 mt-4'>
                            {/* Comments */}
                            <div className="w-full">
                                <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
                                    Comments
                                </label>
                                <ReactQuill
                                    value={comments}
                                    onChange={setComments}
                                    className="mt-1"
                                    theme="snow"
                                    placeholder="Add your comments here"

                                />
                            </div>


                            
                        </div>
                        {/* File Upload */}
                        <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700">Upload Files</label>
                                {files.map((item, index) => (
                                    <div key={item.id} className="flex items-center mt-1 space-x-2">
                                        <input
                                            type="file"
                                            onChange={(e) => handleFileChange(item.id, e)}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                        {index > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFileInput(item.id)}
                                                className="px-2 py-1 bg-red-500 text-white rounded white-space-nowrap"
                                            >
                                                - Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={handleAddFileInput}
                                    className="mt-2 px-2 py-1 bg-green-500 text-white rounded f-14"
                                >
                                    + Add
                                </button>
                            </div>

                        {/* Submit Button */}
                        <div className='text-right'>
                            <button
                                type="submit"
                                disabled={submitting}
                                className=" bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600"
                            >
                                {submitting ? "Submitting..." : "Submit"}
                            </button>
                        </div>
                    </form>
                </div>
                <ToastContainer />
            </div>
        </motion.div>
    );
};

export default SubmitRequestQuote;
