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

const AddTags = ({ refId, quoteId, after, onClose , userId}) => {
    const [formData, setFormData] = useState({
        tags: [],
    });

    const [currencies, setCurrencies] = useState([]);
    const [services, setServices] = useState([]);
    const [tags, setTags] = useState([]);
    const tagsRef = useRef(null);
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
                body: JSON.stringify({ ref_id: refId, quote_id: quoteId,  }),
            });

            const data = await response.json();
            if (data.status) {
                const details = data.data;
                const tagsArray = details.tags ? details.tags.split(',') : [];

                setFormData({
                    tags: tagsArray, // Set tags as an array
                });
                $(tagsRef.current).val(tagsArray).trigger('change');
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

    const fetchTags = async () => {
        try {
            const response = await fetch('https://apacvault.com/Webapi/getTags');
            const data = await response.json();
            if (data.status) setTags(data.data || []);
        } catch (error) {
            toast.error('Failed to fetch tags.');
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
            payload.append('tags', formData.tags);
            payload.append('user_id', userId);

            const response = await fetch('https://apacvault.com/Webapi/updateTags', {
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
        fetchTags();
        fetchInitialData();
    }, []);


    useEffect(() => {
        // Initialize select2 for Tags
        $(tagsRef.current).select2({
            placeholder: "Select Tags",
            allowClear: true,
            multiple: true,
        }).on('change', (e) => {
            const selectedValues = $(e.target).val();
            setFormData((prev) => ({ ...prev, tags: selectedValues }));
        });

        
        $(tagsRef.current).val(formData.tags).trigger('change');
        

        return () => {
            // Clean up select2 on component unmount
            if (tagsRef.current) {
                $(tagsRef.current).select2('destroy');
            }
        };
    }, [tags]);
   

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
                    <h2 className="text-xl font-semibold flex items-center">Add Tags {loading && (<CustomLoader />)}</h2>
                    <button onClick={onClose} className="text-white hover:text-red-600 transition-colors">
                        <X size={15} />
                    </button>
                </div>
                
                    <form onSubmit={handleSubmit} className={`form-wrapper ${loading ? 'loading' : ''}`} >
                        <div className="w-full grid grid-cols-3 gap-4 space-x-1">
                            
                            <div className='w-full'>
                                {/* Tags */}
                                <label>Tags</label>
                                <select
                                    name="tags"
                                    id="tags"
                                    className="form-select select2 w-auto py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    multiple
                                    value={formData.tags}
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

export default AddTags;
