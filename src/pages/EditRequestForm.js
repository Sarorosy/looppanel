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
import axios from 'axios';

const EditRequestForm = ({ refId, quoteId, after, onClose }) => {
    const [formData, setFormData] = useState({
        currency: '',
        otherCurrency: '',
        service_name: '',
        plan: [],
        comments: '',
        planComments: {},
        isfeasability: 0,
        selectedUser: ''
    });
    const [currency, setCurrency] = useState('');
    const [otherCurrency, setOtherCurrency] = useState('');
    const [serviceName, setServiceName] = useState('');
    const [plan, setPlan] = useState([]);
    const [comments, setComments] = useState('');
    const [planComments, setPlanComments] = useState({});
    const [isFeasability, setIsFeasability] = useState(0);
    const [selectedUser, setSelectedUser] = useState('');


    const [currencies, setCurrencies] = useState([]);
    const [users, setUsers] = useState([]);
    const userRef = useRef(null);
    const [services, setServices] = useState([]);
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const userData = sessionStorage.getItem('loopuser');
    const hasFetched = useRef(false);

    const userObject = JSON.parse(userData);

    const plans = ['Basic', 'Standard', 'Advanced'];

    const handleCommentChange = (plan, value) => {
        // Update the planComments state with the new comment for the selected plan
        setFormData((prevState) => ({
            ...prevState,
            planComments: {
                ...prevState.planComments,
                [plan]: value,
            },
        }));
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






    const handleInputChange = (e) => {
        const { name, value } = e.target;

        switch (name) {
            case 'currency':
                setCurrency(value);
                break;
            case 'otherCurrency':
                setOtherCurrency(value);
                break;
            case 'service_name':
                setServiceName(value);
                break;
            case 'comments':
                setComments(value);
                break;
            case 'isfeasability':
                setIsFeasability(value);
                break;
            case 'selectedUser':
                setSelectedUser(value);
                break;
            case 'plan':
                setPlan(value.split(',')); // Assuming plan is a comma-separated string
                break;
            default:
                break;
        }
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

        const allCommentsFilled = Object.values(formData.planComments).every(comment => {
            // Check if the comment contains only spaces, <br>, or empty <p> tags
            const plainTextComment = comment.replace(/<[^>]*>/g, '').trim();  // Remove HTML tags
            return plainTextComment !== '';  // Ensure there's something other than just empty content
        });
    
        if (!allCommentsFilled) {
            toast.error('Please fill all plan comments.');
            setSubmitting(false);
            return;
        }


        try {
            const payload = new FormData();
            payload.append('ref_id', refId);
            payload.append('quote_id', quoteId);
            payload.append('currency', currency);
            payload.append('other_currency', otherCurrency);
            payload.append('service_name', serviceName);
            payload.append('plan', plan);
            payload.append('comments', comments);
            payload.append('plan_comments', JSON.stringify(formData.planComments));
            payload.append('user_id', userObject.id);
            payload.append('feas_user', selectedUser);

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
    const fetchData = async () => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        try {
            setLoading(true);

            const user = JSON.parse(sessionStorage.getItem('user'));
            const loopUser = JSON.parse(sessionStorage.getItem('loopuser'));
            const category = user?.category;
            const user_id = loopUser?.id;

            if (!user_id) {
                toast.error('User is not available in sessionStorage');
                return;
            }

            const [currenciesResponse, servicesResponse, usersResponse, requestDetailsResponse] = await axios.all([
                axios.get('https://apacvault.com/Webapi/getCurrencies'),
                axios.post('https://apacvault.com/Webapi/getServices', { category }),
                axios.post('https://apacvault.com/Webapi/getAllUsers', { user_id }),
                fetch('https://apacvault.com/Webapi/getRequestDetails', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ref_id: refId, quote_id: quoteId }),
                }).then((res) => res.json()),
            ]);

            // Handle Currencies Response
            if (currenciesResponse.data.status) {
                setCurrencies(currenciesResponse.data.data || []);
            } else {
                toast.error('Failed to fetch currencies.');
            }

            // Handle Services Response
            if (servicesResponse.data.status) {
                setServices(servicesResponse.data.data || []);
            } else {
                toast.error('Failed to fetch services.');
            }

            // Handle Users Response
            if (usersResponse.data.status) {
                setUsers(usersResponse.data.data || []);
            } else {
                toast.error('Failed to fetch users.');
            }

            // Handle Request Details Response
            if (requestDetailsResponse.status) {
                const details = requestDetailsResponse.data;
                console.log(details);

                // Convert tags from comma-separated string to an array
                const planArray = details.plan ? details.plan.split(',') : [];
                const parsedPlanComments = details.plan_comments ? JSON.parse(details.plan_comments) : {};

                await setFormData({
                    currency: details.currency || '',
                    otherCurrency: details.other_currency || '',
                    service_name: details.service_name || '',
                    plan: planArray,
                    comments: details.comments || '',
                    planComments: parsedPlanComments, 
                    isfeasability: details.isfeasability || 0,
                    selectedUser: details.feasability_user || '',
                });
                setCurrency(details.currency ?? '')
                setOtherCurrency(details.otherCurrency ?? '')
                setServiceName(details.service_name ?? '')
                setPlan(planArray);
                setComments(details.comments ?? '')
                setIsFeasability(details.isfeasability ?? 0)
                setSelectedUser(details.feasability_user ?? '')
            } else {
                toast.error('Failed to fetch request details.');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Error fetching data.');
        } finally {
            setLoading(false);
        }
    };

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
                console.log(details)
                // Convert tags from comma-separated string to an array
                const planArray = details.plan ? details.plan.split(',') : [];

                setFormData({
                    currency: details.currency || '',
                    otherCurrency: details.other_currency || '',
                    service_name: details.service_name || '',
                    plan: planArray,
                    comments: details.comments || '',
                    isfeasability: details.isfeasability || 0,
                    selectedUser: details.feasability_user || '',
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



    useEffect(() => {
        // const fetchData = async () => {
        //     try {
        //         // await fetchCurrencies();
        //         // await fetchServices();
        //         // await fetchUsers();
        //         await fetchAllData();
        //         //fetchInitialData();
        //     } finally {
        //         // This will always run, ensuring fetchInitialData runs last

        //     }
        // };

        fetchData();
    }, []);
    useEffect(() => {
        //fetchInitialData();
    }, []); // Empty dependency array ensures this runs only once


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
                                    value={currency}
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

                                {currency == 'Other' && (
                                    <input
                                        type="text"
                                        name="otherCurrency"
                                        placeholder="Enter other currency"
                                        value={otherCurrency}
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
                                    value={serviceName}
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
                        <div className="mt-4">
                            {formData.plan.map((plan) => (
                                <div key={plan} className="mb-4">
                                    <label htmlFor={`comment_${plan}`} className="block text-sm font-medium text-gray-700">
                                        Add comment for {plan} plan
                                    </label>
                                    <ReactQuill
                                        value={formData.planComments[plan] || ''}
                                        onChange={(value) => handleCommentChange(plan, value)} // Handle Quill's onChange
                                        className="mt-1"
                                        theme="snow"
                                        placeholder={`Add comment for ${plan} plan`}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className={`w-full ${isFeasability == 0 ? "hidden" : "block"}`}>
                            {/* Tags */}
                            <label className="block text-sm font-medium text-gray-700">Select User to Assign </label>
                            <select
                                name="user"
                                id="user"
                                className="form-select select2 w-72 py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 form-control"

                                value={selectedUser}
                                onChange={(e) => setSelectedUser(e.target.value)}
                            >
                                <option value="">Select User</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.fld_first_name + " " + user.fld_last_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='w-full mb-3'>
                            {/* Comments */}
                            <label>Additional Comments <span className='text-gray-400 text-sm ml-2'>(optional)</span></label>
                            <ReactQuill value={comments} onChange={(value) => setComments(value)} />
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
            <ToastContainer />
            </div>
        </motion.div>
    );
};

export default EditRequestForm;
