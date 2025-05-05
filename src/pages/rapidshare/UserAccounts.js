import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CirclePause,UserCircle , X, Lock, CircleHelp, FileText, Plus, ArrowRight, CircleArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import ClientSharedFiles from './ClientSharedFiles';

const UserAccounts = ({ onClose, queryInfo }) => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [filesOpen, setFilesOpen] = useState(false);

    const fetchAccounts = async () => {

        try {
            if (queryInfo?.email_id == undefined || queryInfo?.email_id == null) {
                toast.error('Email is required to fetch files.');
                return;
            }

            setLoading(true);
            const response = await fetch(`https://rapidcollaborate.com/rapidshare/api/Api/getAllAccounts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: queryInfo.email_id }),
            });
            const data = await response.json();
            if (data.status) {
                setAccounts(data.accounts || []);
            } else {
                toast.error(data.message || 'Failed to fetch files.');
            }

        } catch (error) {
            console.log('Failed to fetch files.');
        } finally {
            setLoading(false);

        }
    }

    useEffect(() => {
        fetchAccounts();
    }, [queryInfo])

    const createRapidShareAccount = async () => {
        try {
            if(!window.confirm("Are you sure want to create another account?")){
                return;
            }
            if (!queryInfo.website_name) {
                toast.error("Website not found for this query.");
                return;
            }
            if (!queryInfo.email_id) {
                toast.error("Client Email not found for this query.");
                return;
            }

            const response = await fetch(`https://www.rapidcollaborate.com/rapidshare/api/Api/registerUser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: queryInfo.email_id,

                }),
            })
            const data = await response.json();
            if (data.status) {
                toast.success(data.message || "RapidShare account created successfully.");
                fetchAccounts()
            } else {
                toast.error(data.message || "Failed to create RapidShare account.");
            }

        } catch (err) {
            console.error("Error creating RapidShare account:", err);
        }
    }
    const renderSkeleton = () => (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    className="flex justify-between items-center bg-gray-100 border border-gray-200 rounded-xl p-4 animate-pulse"
                >
                    <div className="flex items-center gap-3">
                        <div className="h-6 w-6 bg-gray-300 rounded" />
                        <div>
                            <div className="h-3 w-40 bg-gray-300 rounded mb-2"></div>
                            <div className="h-2 w-24 bg-gray-300 rounded"></div>
                        </div>
                    </div>
                    <div className="h-8 w-20 bg-gray-300 rounded-lg"></div>
                </div>
            ))}
        </div>
    );

    const handleViewBtnClick = (userId) => {
        setSelectedAccount(userId);
        setFilesOpen(true);
    }
    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed mt-0 top-0 right-0 w-[400px] h-full bg-white shadow-lg z-50"
        >
            <div className="flex justify-between items-center px-4 py-3 border-b bg-blue-500 text-white">
                <h2 className="text-lg font-semibold">User Accounts</h2>
                <button 
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Create Another Account"
                title='Create Another RapidShare Account'
                onClick={createRapidShareAccount}
                
                className="text-green-600 bg-green-50  border-green-600 rounded px-2 py-0.5 flex items-center" >
                    <Plus size={20} /> Create New
                </button>
                <button onClick={onClose} className="text-gray-500 hover:text-red-500">
                    <X />
                </button>
            </div>

            {loading ? (
                renderSkeleton()
            ) : accounts.length === 0 ? (
                <div className="text-gray-500 text-center py-6">
                    No Accounts found with this email.
                </div>
            ) : (
                <div className="space-y-4 h-full overflow-y-auto mb-24 pb-24 px-1 ">
                    {accounts.map((account, index) => (
                        <div
                        key={account.id || index}
                        className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl py-2 px-1 space-y-2 shadow-sm hover:shadow-md transition"
                      >
                        <div className="flex flex-col justify-start items-start px-3 my-1">
                          <div className=" flex items-center justify-start">
                            <UserCircle size={28} className="  mr-3 p-0.5 bg-blue-50 text-blue-600 rounded-full" />
                            <div className="text-sm font-medium text-gray-800">Username: {account.username || 'N/A'}</div>
                          </div>
                          <div>
                            
                            <div className="text-sm text-gray-500">Email: {account.email}</div>
                          </div>
                        </div>
                      
                        <button
                          className="bg-blue-600 text-white text-sm px-3 py-1 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                          onClick={() => handleViewBtnClick(account.id)}
                        >
                          View <CircleArrowRight className='ml-2' size={20} />
                        </button>
                      </div>
                    ))}

                </div>
            )}
            <AnimatePresence>
                {filesOpen && (
                    <ClientSharedFiles userId={selectedAccount} queryInfo={queryInfo} onClose={() => { setFilesOpen(false) }} />
                )}
            </AnimatePresence>

        </motion.div>
    );
};

export default UserAccounts;
