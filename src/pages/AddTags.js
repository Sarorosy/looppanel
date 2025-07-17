import React, { useState, useEffect, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import 'react-quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';
import $ from 'jquery';
import 'select2/dist/css/select2.min.css';
import 'select2';
import CustomLoader from '../CustomLoader';
import { getSocket } from "./Socket";


const AddTags = ({ refId, quoteId, after, onClose , userId, notification}) => {
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
    const userData = localStorage.getItem('loopuser');
    const socket = getSocket();

    const userObject = JSON.parse(userData);

    const plans = ['Basic', 'Standard', 'Advanced'];
    

    const fetchTags = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/scope/getTags');
            const data = await response.json();
            if (data.status) setTags(data.data || []);
        } catch (error) {
            toast.error('Failed to fetch tags.');
        }finally{
            fetchInitialData();
        }
    };
    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/scope/getRequestDetails', {
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
            payload.append('notification', notification);
            payload.append('admin_id', userObject.id)

            const response = await fetch('http://localhost:5000/api/scope/updateTags', {
                method: 'POST',
                body: payload,
            });

            const data = await response.json();
            if (data.status) {
                toast.success('Request updated successfully.');
                after();
                const user_name = userObject.fld_first_name + " " + userObject.fld_last_name;
                socket.emit('addedTags', {
                    quote_id: quoteId,
                    ref_id: refId,
                    user_name: user_name
                })
                
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
            className="fixed right-0 h-full w-1/3 bg-gray-100 shadow-lg z-50 overflow-y-auto "
            style={{ top: "0px" }}
        >
            <div className="bg-white p-6 shadow rounded-md space-y-4 h-100">
                <div className="flex items-center justify-between bg-blue-400 text-white p-2">
                    <h2 className="text-xl font-semibold flex items-center">Add Tags </h2>
                    <button onClick={onClose} className="text-white hover:text-red-500 transition-colors p-1 rounded-full bg-red-600 hover:bg-red-500">
                        <X size={15} />
                    </button>
                </div>
                
                    <form onSubmit={handleSubmit} className={`form-wrapper ${loading ? 'loading' : ''}`} >
                        <div className="w-full p-2">
                            
                            <div className='w-full ad-tab-inp'>
                                {/* Tags */}
                                <label>Tags</label>
                                <select
                                    name="tags"
                                    id="tags"
                                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 form-control select2-hidden-accessible"
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

                        <div className='mt-3 text-right'>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-blue-500 text-white px-2 py-1 rounded f-14"
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
