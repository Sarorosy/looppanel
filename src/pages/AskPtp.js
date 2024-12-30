import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AnimatePresence, motion } from 'framer-motion';

function AskPtp({ scopeDetails, quoteId, after, plans }) {
    const [showForm, setShowForm] = useState(false);
    const [ptp, setPtp] = useState('No'); // Default value is "No"
    const [ptpAmount, setPtpAmount] = useState('');
    const [ptpComments, setPtpComments] = useState('');
    const [ptploading, setPtpLoading] = useState(false);
    const [selectedPlans, setSelectedPlans] = useState(plans ? plans.split(",") : []);
    const [ptpFile, setPtpFile] = useState(null);

    const handleCheckboxChange = (plan) => {
        setSelectedPlans((prevSelectedPlans) => {
            if (prevSelectedPlans.includes(plan)) {
                return prevSelectedPlans.filter((p) => p !== plan); // Uncheck
            } else {
                return [...prevSelectedPlans, plan]; // Check
            }
        });
    };

    const handleFileChange = (e) => {
        setPtpFile(e.target.files[0]); // Store the selected file
    };

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
        const sortedPlans = selectedPlans.sort();

        
        const formData = new FormData();
            formData.append('ptp', ptp);
            formData.append('ptp_comments', ptpComments);
            formData.append('ptp_amount', ptpAmount);
            formData.append('old_plans', plans);
            formData.append('selected_plans', sortedPlans.join(","));
            formData.append('ref_id', scopeDetails.assign_id);
            formData.append('quote_id', quoteId);
            formData.append('user_name', userObject.fld_first_name + " " + userObject.fld_last_name);
            formData.append('user_id', userObject.id);

            // Append the selected file if there is one
            if (ptpFile) {
                formData.append('ptp_file', ptpFile);
            }

        try {
            const response = await fetch('https://apacvault.com/Webapi/askptp', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            if (result.status === "success") {
                toast.success('Request submitted successfully');
                setShowForm(false);
                setTimeout(()=>{
                    after();
                },1000)
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
                            <div className='w-full flex  items-start space-x-2'>
                                
                                <div className="mb-4">
                                    <label htmlFor="ptpamount" className="block text-sm font-semibold">PTP Amount</label>
                                    <input
                                        id="ptpamount"
                                        type="number"
                                        value={ptpAmount}
                                        onChange={(e) => setPtpAmount(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded no-arrows form-control"
                                    />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Plans</label>
                                <div className="mt-2 flex flex-wrap">
                                    {['Basic', 'Standard', 'Advanced'].map((plan, index) => (
                                        <div key={index} className="flex items-center mb-2 mr-5">
                                            <input
                                                type="checkbox"
                                                id={`plan-${plan}`}
                                                value={plan}
                                                checked={selectedPlans.includes(plan)}
                                                onChange={() => handleCheckboxChange(plan)}
                                                className="form-checkbox h-4 w-4 border-gray-300 rounded"
                                            />
                                            <label htmlFor={`plan-${plan}`} className="ml-2 text-sm font-medium">{plan}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="ptp_comments" className="block text-sm font-semibold">Comments</label>
                                <textarea
                                    id="ptp_comments"
                                    name="ptp_comments"
                                    value={ptpComments}
                                    onChange={(e) => setPtpComments(e.target.value)}
                                    style={{ resize: 'none' }}
                                    className="w-full p-2 border border-gray-300 rounded form-control"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="ptp_file" className="block text-sm font-semibold">Upload File</label>
                                <input
                                    type="file"
                                    id="ptp_file"
                                    onChange={handleFileChange}
                                    className="w-full p-2 border border-gray-300 rounded"
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
