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

const EditRequestForm = ({ refId, quoteId, after, onClose }) => {
    const [formData, setFormData] = useState({
        currency: '',
        otherCurrency: '',
        service_name: '',
        plan: [],
        comments: '',
    });

    const [currencies, setCurrencies] = useState([]);
    const [services, setServices] = useState([]);
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);

    const plans = ['Basic', 'Standard', 'Advanced'];

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const response = await fetch('https://apacvault.com/Webapi/getRequestDetails', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ref_id: refId, quote_id: quoteId }),
            });

            const data = await response.json();
            if (data.status) {
                const details = data.data;
                // Convert tags from comma-separated string to an array
                const planArray = details.plan ? details.plan.split(',') : [];

                setFormData({
                    currency: details.currency || '',
                    otherCurrency: details.other_currency || '',
                    service_name: details.service_name || '',
                    plan: planArray,
                    comments: details.comments || '',
                });
            } else {
                toast.error('Failed to fetch request details.');
            }
        } catch (error) {
            console.error('Error fetching request details:', error);
            toast.error('Error fetching request details.');
        } finally {
            setLoading(false);
        }
    };


    const fetchCurrencies = async () => {
        try {
            const response = await fetch('https://apacvault.com/Webapi/getCurrencies');
            const data = await response.json();
            if (data.status) setCurrencies(data.data || []);
        } catch (error) {
            toast.error('Failed to fetch currencies.');
        }
    };

    const fetchServices = async () => {
        try {
            const user = JSON.parse(sessionStorage.getItem('user'));
            const response = await fetch('https://apacvault.com/Webapi/getServices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category: user?.category }),
            });
            const data = await response.json();
            if (data.status) setServices(data.data || []);
        } catch (error) {
            toast.error('Failed to fetch services.');
        }
    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (plan) => {
        setFormData((prev) => ({
            ...prev,
            plan: prev.plan.includes(plan)
                ? prev.plan.filter((p) => p != plan)
                : [...prev.plan, plan],
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const payload = new FormData();
            payload.append('ref_id', refId);
            payload.append('quote_id', quoteId);
            payload.append('currency', formData.currency);
            payload.append('other_currency', formData.otherCurrency);
            payload.append('service_name', formData.service_name);
            payload.append('plan', formData.plan);
            payload.append('comments', formData.comments);

            const response = await fetch('https://apacvault.com/Webapi/updateRequestQuoteApiAction', {
                method: 'POST',
                body: payload,
            });

            const data = await response.json();
            if (data.status) {
                toast.success('Request updated successfully.');
                after();
                onClose();
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
        fetchCurrencies();
        fetchServices();
        fetchInitialData();
    }, []);


   

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
                    <h2 className="text-xl font-semibold flex items-center">Edit Request Form {loading && (<CustomLoader />)}</h2>
                    <button onClick={onClose} className="text-white hover:text-red-500 transition-colors p-1 rounded-full bg-red-600 hover:bg-red-500">
                        <X size={15} />
                    </button>
                </div>
                
                <div className='p-3 mt-0'>
                    <form onSubmit={handleSubmit} className={`form-wrapper ${loading ? 'loading' : ''}`} >
                        <div className="w-full grid grid-cols-2 gap-2 space-x-1">
                            {/* Currency Dropdown */}
                            <div className='w-full mb-3'>
                                <label>Currency</label>
                                <select
                                    name="currency"
                                    value={formData.currency}
                                    onChange={handleInputChange}
                                    className="form-control form-control-sm"
                                >
                                    <option value="">Select Currency</option>
                                    {currencies.map((currency) => (
                                        <option key={currency.id} value={currency.name}>
                                            {currency.name}
                                        </option>
                                    ))}
                                </select>

                                {formData.currency === 'Other' && (
                                    <input
                                        type="text"
                                        name="otherCurrency"
                                        placeholder="Enter other currency"
                                        value={formData.otherCurrency}
                                        onChange={handleInputChange}
                                        className="form-control form-control-sm"
                                    />
                                )}
                            </div>

                            <div className='w-full mb-3'>

                                {/* Service Dropdown */}
                                <label>Service</label>
                                <select
                                    name="service_name"
                                    value={formData.service_name}
                                    onChange={handleInputChange}
                                    className="form-control form-control-sm"
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
                        <div className='w-full mb-3'>
                            {/* Plan Checkboxes */}
                            <label className="">Plan</label>
                            <div className='flex'>
                                {plans.map((plan) => (
                                    <div key={plan} className="flex items-center space-x-2 mr-5">
                                        <input
                                            type="checkbox"
                                            checked={formData.plan.includes(plan)}
                                            onChange={() => handleCheckboxChange(plan)}
                                            className={`form-checkbox h-4 w-4 f-12 border-gray-300 rounded ${planColors[plan] || ''}`} // Default to empty string if no color is found
                                        />
                                        <label className={` font-medium mb-0 ${planColors[plan] || 'text-gray-700'}`}>{plan}</label> {/* Default text color */}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className='w-full mb-3'>
                            {/* Comments */}
                            <label>Comments</label>
                            <ReactQuill value={formData.comments} onChange={(value) => setFormData({ ...formData, comments: value })} />
                        </div>

                        <div className='mt-2 text-right'>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-blue-500 text-white px-2 py-1 rounded"
                            >
                                {submitting ? 'Submitting...' : 'Update Request'}
                            </button>
                        </div>
                    </form>
                </div>
                
            </div>
        </motion.div>
    );
};

export default EditRequestForm;
