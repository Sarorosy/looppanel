import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AnimatePresence, motion } from 'framer-motion';

function AskPtp({ scopeDetails, quoteId , after}) {
    const [showForm, setShowForm] = useState(false);
    const [ptp, setPtp] = useState('');
    const [ptpComments, setPtpComments] = useState('');
    const [ptploading, setPtpLoading] = useState(false);

    const handleSubmit = async (e) => {
        setPtpLoading(true);
        e.preventDefault();

        if (!ptp && !ptpComments) {
            toast.error("Please fill all fields");
            return;
        }
        // Prepare the data for posting
        const postData = {
            ptp,
            ptp_comments: ptpComments,
            ref_id: scopeDetails.ref_id,
            quote_id : quoteId
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
            if (result.status == "success") {
                toast.success('Request submitted successfully');
                setShowForm(false); 
                setTimeout(()=>{
                    after();
                }, 1000)
            } else {
                toast.error('Failed to submit the request');
            }
        } catch (error) {
            console.error('Error posting data:', error);
            toast.error('An error occurred while submitting the request');
        }finally{
            setPtpLoading(false);
        }
    };

    return (
        <div className='flex flex-col'>
            <button onClick={() => setShowForm(!showForm)} className="bg-blue-100 hover:bg-blue-200 text-blue-900 px-4 py-2 rounded-3xl w-44 max-w-44">
                Request PTP
            </button>

            {/* Show form to submit PTP details with motion */}
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
                                <label htmlFor="ptp" className="block text-sm font-semibold">PTP</label>
                                <input
                                    type="text"
                                    id="ptp"
                                    name="ptp"
                                    value={ptp}
                                    onChange={(e) => setPtp(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded form-control"
                                />
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
                            <button type="submit" disabled={ptploading} className="bg-blue-500 text-white px-4 py-2 rounded">{ptploading ? "Submitting..." : "Submit"}</button>
                        </form>
                    </motion.div>
                </AnimatePresence>
            )}

            <ToastContainer />
        </div>
    );
}

export default AskPtp;
