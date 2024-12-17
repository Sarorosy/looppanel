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
    const [tags, setTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [otherCurrency, setOtherCurrency] = useState('');
    const [selectedService, setSelectedService] = useState('');
    const [selectedPlans, setSelectedPlans] = useState([]);
    const [comments, setComments] = useState('');
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const tagsRef = useRef(null);

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

    const fetchTags = async () => {
        try {
            const response = await fetch('https://apacvault.com/Webapi/getTags');
            const data = await response.json();
            if (data.status) {
                setTags(data.data || []);
            } else {
                toast.error('Failed to fetch Tags');
            }
        } catch (error) {
            console.error('Error fetching tags:', error);
            toast.error('Error fetching tags');
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
            setSubmitting(false);
            return;

        }
        if (selectedCurrency == "Other" && !otherCurrency) {
            toast.error('Please enter other currrency name!');
            setSubmitting(false);
            return;
        }

        const formData = new FormData();
        formData.append('ref_id', refId);
        formData.append('currency', selectedCurrency);
        formData.append('other_currency', otherCurrency);
        formData.append('service_name', selectedService);
        formData.append('tags', selectedTags);
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
        fetchTags();
    }, []);

    useEffect(() => {
        // Initialize select2 for Select Team
        $(tagsRef.current).select2({
            placeholder: "Select Tags",
            allowClear: true,
            multiple: true,
        }).on('change', (e) => {
            const selectedValues = $(e.target).val(); // Use select2's value retrieval method
            setSelectedTags(selectedValues);
        });


        return () => {
            // Destroy select2 when the component unmounts
            if (tagsRef.current) {
                $(tagsRef.current).select2('destroy');
            }
        };
    }, [tags]);

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed right-0 h-full w-1/2 bg-gray-100 shadow-lg z-50 overflow-y-auto "
            style={{ top: "-20px" }}
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
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm form-control"
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
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm form-control"
                            >
                                <option value="">Select Service</option>
                                {services.map((service) => (
                                    <option key={service.id} value={service.id}>
                                        {service.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* Plan Dropdown */}
                        <div className="w-full ">
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

                        <div className='w-1/2 max-w-56'>
                            <label htmlFor="service_name" className="block text-sm font-medium text-gray-700">
                               Select Tags
                            </label>
                            <select
                                name="tags"
                                id="tags"
                                className="form-select select2 w-96 py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
