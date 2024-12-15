import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const SubmitRequestQuote = ({ refId, after, onClose }) => {
    const [currencies, setCurrencies] = useState([]);
    const [services, setServices] = useState([]);
    const [selectedCurrency, setSelectedCurrency] = useState('');
    const [selectedService, setSelectedService] = useState('');
    const [selectedPlans, setSelectedPlans] = useState([]);
    const [comments, setComments] = useState('');
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

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


    const handleFileChange = (event) => {
        setFile(event.target.files[0]); // Get the selected file
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        if (!selectedCurrency || !selectedService || !selectedPlans || !comments) {
            toast.error('Please fill in all fields');
            return;
        }

        const formData = new FormData();
        formData.append('ref_id', refId);
        formData.append('currency', selectedCurrency);
        formData.append('service_name', selectedService);
        formData.append('plan', selectedPlans);
        formData.append('comments', comments);
        formData.append('user_id', loopUserObject.id);
        formData.append('user_name', loopUserObject.fld_first_name + " " + loopUserObject.fld_last_name);
        formData.append('category', userObject.category);
        formData.append('quote_upload_file[]', file);

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
    }, []);

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed right-0 h-full w-1/2 bg-gray-100 shadow-lg z-50 overflow-y-auto "
            style={{top:"-20px"}}
        >
            <div className="bg-white p-6 shadow rounded-md space-y-4 w-xl">
                <div className='flex items-center justify-between bg-blue-400 text-white p-2'>
                    <h2 className="text-xl font-semibold">Submit Request Quote</h2>
                    <button
                        onClick={onClose}
                        className=" text-white hover:text-red-600 transition-colors mr-2 cir"
                    >
                        {/* <CircleX size={32} /> */}
                        <X size={15} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="hidden" name="ref_id" value={refId} />

                    <div className='w-full flex items-start justify-between space-x-1'>
                        {/* Currency Dropdown */}
                        <div className='w-1/2'>
                            <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                                Currency
                            </label>
                            <select
                                id="currency"
                                value={selectedCurrency}
                                onChange={(e) => setSelectedCurrency(e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm form-control"
                            >
                                <option value="">Select Currency</option>
                                {currencies.map((currency) => (
                                    <option key={currency.id} value={currency.name}>
                                        {currency.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Service Name Dropdown */}
                        <div className='w-1/2'>
                            <label htmlFor="service_name" className="block text-sm font-medium text-gray-700">
                                Service Name
                            </label>
                            <select
                                id="service_name"
                                value={selectedService}
                                onChange={(e) => setSelectedService(e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm form-control"
                            >
                                <option value="">Select Service</option>
                                {services.map((service) => (
                                    <option key={service.id} value={service.name}>
                                        {service.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Plan Dropdown */}
                        <div className="w-1/2">
                            <label htmlFor="plan" className="block text-sm font-medium text-gray-700">
                                Plan
                            </label>
                            <div className="mt-1">
                                {plans.map((plan, index) => (
                                    <div key={index} className="flex items-center mb-2">
                                        <input
                                            type="checkbox"
                                            id={`plan-${index}`}
                                            value={plan}
                                            checked={selectedPlans.includes(plan)}
                                            onChange={() => handleCheckboxChange(plan)}
                                            className={`form-checkbox h-4 w-4 border-gray-300 rounded ${planColors[plan]}`}
                                        />
                                        <label htmlFor={`plan-${index}`} className={`ml-2 text-sm font-medium ${planColors[plan]}`}>
                                            {plan}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className='flex items-start justify-between space-x-1 mt-4'>
                        {/* Comments */}
                        <div className='w-full '>
                            <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
                                Comments
                            </label>
                            <textarea
                                id="comments"
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm form-control"
                                rows={4}
                                placeholder="Add your comments here"
                            />
                        </div>

                        {/* File Upload */}
                        <div className='w-full '>
                            <label htmlFor="quote_upload_file" className="ml-4 block text-sm font-medium text-gray-700">
                                Upload File
                            </label>
                            <input
                                type="file"
                                id="quote_upload_file"
                                name="quote_upload_file[]"
                                onChange={handleFileChange}
                                className=" ml-4 mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                        >
                            {submitting ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </form>
                <ToastContainer />
            </div>
        </motion.div>
    );
};

export default SubmitRequestQuote;
