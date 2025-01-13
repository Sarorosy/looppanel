import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, CheckIcon } from 'lucide-react';
import { io } from "socket.io-client";

function DemoDone({ scopeDetails, quoteId , after}) {
    const [showForm, setShowForm] = useState(false);
    const [demoId, setdemoId] = useState('');
    const socket = io("https://looppanelsocket.onrender.com", {
            reconnection: true,             
            reconnectionAttempts: 50,         
            reconnectionDelay: 1000,      
            reconnectionDelayMax: 5000,    
            timeout: 20000,                 
            autoConnect: true                
        });

    const loopuserData = localStorage.getItem('loopuser');
    const loopUserObject = JSON.parse(loopuserData);

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
            user_id:scopeDetails.user_id
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
                socket.emit("demoCompleted",{
                    "ref_id": scopeDetails.assign_id,
                    "demo_id" : demoId,
                    "user_name" : loopUserObject.fld_first_name + " " + loopUserObject.fld_last_name 
                })
               setTimeout(()=>{
                after();
               },1000)
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
            <button onClick={() => setShowForm(!showForm)} className="btn btn-success flex items-center f-14 px-2 py-1">
                Mark As RC Demo Done <CheckCircle size={15} className='ml-1'/>
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
