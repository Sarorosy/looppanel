import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SubmitRequestQuote = ({ refId, after }) => {
    const [currencies, setCurrencies] = useState([]);
    const [services, setServices] = useState([]);
    const [selectedCurrency, setSelectedCurrency] = useState('');
    const [selectedService, setSelectedService] = useState('');
    const [selectedPlan, setSelectedPlan] = useState('');
    const [comments, setComments] = useState('');
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const plans = ['Basic', 'Standard', 'Advanced']; // Hardcoded plans

    const userData = sessionStorage.getItem('user');
    const LoopUserData = sessionStorage.getItem('user');

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

        if (!selectedCurrency || !selectedService || !selectedPlan || !comments ) {
            toast.error('Please fill in all fields');
            return;
        }

        const formData = new FormData();
        formData.append('ref_id', refId);
        formData.append('currency', selectedCurrency);
        formData.append('service_name', selectedService);
        formData.append('plan', selectedPlan);
        formData.append('comments', comments);
        formData.append('user_id', loopUserObject.id);
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
            } else {
                toast.error('Failed to submit quote request');
            }
        } catch (error) {
            console.error('Error submitting quote request:', error);
            toast.error('Error submitting quote request');
        }finally{
            setSubmitting(false);
        }
    };

    useEffect(() => {
        fetchCurrencies();
        fetchServices();
    }, []);

    return (
        <div className=" h-full bg-gray-100 shadow-lg z-50 overflow-y-auto mt-2 rounded w-full">
            <div className="bg-white p-6 m-2 shadow rounded-md space-y-4">
            <h2 className="text-xl font-bold mb-4">Submit Request Quote</h2>
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
                <div className='w-1/2'>
                    <label htmlFor="plan" className="block text-sm font-medium text-gray-700">
                        Plan
                    </label>
                    <select
                        id="plan"
                        value={selectedPlan}
                        onChange={(e) => setSelectedPlan(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm form-control"
                    >
                        <option value="">Select Plan</option>
                        {plans.map((plan, index) => (
                            <option key={index} value={plan}>
                                {plan}
                            </option>
                        ))}
                    </select>
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
         </div>
    );
};

export default SubmitRequestQuote;
