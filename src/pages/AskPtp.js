import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AnimatePresence, motion } from 'framer-motion';

function AskPtp({ scopeDetails, quoteId, after }) {
    const [showForm, setShowForm] = useState(false);
    const [ptp, setPtp] = useState('No'); // Default value is "No"
    const [ptpComments, setPtpComments] = useState('');
    const [ptploading, setPtpLoading] = useState(false);

    const userData = sessionStorage.getItem('loopuser');

    const userObject = JSON.parse(userData);

    const handleSubmit = async (e) => {
        setPtpLoading(true);
        e.preventDefault();

        if (!ptpComments) {
            toast.error("Please fill all fields");
            setPtpLoading(false);
            return;
        }

        // Prepare the data for posting
        const postData = {
            ptp,
            ptp_comments: ptpComments,
            ref_id: scopeDetails.assign_id,
            quote_id: quoteId,
            user_name : userObject.fld_first_name + " " + userObject.fld_last_name,
            user_id : userObject.id
        };

        try {
            const response = await fetch('https://apacvault.com/Webapi/askptp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData),
            });
            const result = await response.json();
            if (result.status === "success") {
                toast.success('Request submitted successfully');
                setShowForm(false);
                setTimeout(() => {
                    after();
                }, 1000);
            } else {
                toast.error('Failed to submit the request');
            }
        } catch (error) {
            console.error('Error posting data:', error);
            toast.error('An error occurred while submitting the request');
        } finally {
            setPtpLoading(false);
        }
    };

    return (
        <div className='flex flex-col'>
            <button onClick={() => setShowForm(!showForm)} className="bg-blue-100 hover:bg-blue-200 text-blue-900 px-4 py-2 rounded-3xl w-44 max-w-44">
                Ask Discount
            </button>

            {showForm && (
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.5 }}
                        className="mt-4 p-4 border border-gray-300 rounded"
                    >
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="ptp"
                                        checked={ptp === 'Yes'}
                                        onChange={(e) => setPtp(e.target.checked ? 'Yes' : 'No')}
                                        className="form-checkbox h-5 w-5 text-blue-600"
                                    />
                                    <label htmlFor="ptp" className="text-sm font-semibold mb-0">PTP Client</label>
                                </div>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="ptp_comments" className="block text-sm font-semibold">Comments</label>
                                <textarea
                                    id="ptp_comments"
                                    name="ptp_comments"
                                    value={ptpComments}
                                    onChange={(e) => setPtpComments(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded form-control"
                                />
                            </div>
                            <button type="submit" disabled={ptploading} className="bg-blue-500 text-white px-4 py-2 rounded">
                                {ptploading ? "Submitting..." : "Submit"}
                            </button>
                        </form>
                    </motion.div>
                </AnimatePresence>
            )}

            <ToastContainer />
        </div>
    );
}

export default AskPtp;
