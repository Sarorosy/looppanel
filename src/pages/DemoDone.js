import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, CheckIcon } from 'lucide-react';

function DemoDone({ scopeDetails, quoteId , after}) {
    const [showForm, setShowForm] = useState(false);
    const [demoId, setdemoId] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!demoId ) {
            toast.error("Please fill all fields");
            return;
        }
        // Prepare the data for posting
        const postData = {
            demoId,
            ref_id: scopeDetails.assign_id,
            quote_id: quoteId,
        };

        try {
            const response = await fetch('https://apacvault.com/Webapi/markasdemodone', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData),
            });
            const result = await response.json();
            if (result.status == "success") {
                toast.success('Success');
                setShowForm(false); // Close form upon successful submission
                setTimeout(()=>{
                    after();
                }, 1000)
            } else {
                toast.error('Failed to submit the request');
            }
        } catch (error) {
            console.error('Error posting data:', error);
            toast.error('An error occurred while submitting the request');
        }
    };

    return (
        <div className='flex items-start'>
            <button onClick={() => setShowForm(!showForm)} className="bg-green-100 hover:bg-green-200 text-green-900 px-4 py-2 rounded-3xl flex items-start ">
                Mark As RC Demo Done <CheckCircle size={20} className='ml-3'/>
            </button>

            
            {showForm && (
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.5 }}
                        className=" px-4 py-2 border border-gray-300 rounded ml-4"
                    >
                        <form onSubmit={handleSubmit} className='flex items-center justify-between'>
                            <div className="mb-4">
                                <label htmlFor="demoId" className="block text-sm font-semibold">Demo ID</label>
                                <input
                                    type="text"
                                    id="demoId"
                                    name="demo_id"
                                    value={demoId}
                                    onChange={(e) => setdemoId(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded form-control"
                                />
                            </div>
                           
                            <button type="submit" className="bg-blue-500 text-white px-2 py-3 rounded-full ml-3 h-5 flex items-center justify-center"><CheckIcon size={20}/></button>
                        </form>
                    </motion.div>
                </AnimatePresence>
            )}

            <ToastContainer />
        </div>
    );
}

export default DemoDone;