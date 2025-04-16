// AlreadyQuoteGiven.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const AlreadyQuoteGiven = ({ email_id, website_id }) => {
    const [quoteDetails, setQuoteDetails] = useState([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchQuoteData = async () => {
            try {
                const response = await axios.post('https://apacvault.com/Webapi/checkpresentemail', {
                    email_id,
                    website_id,
                });

                if (response.data?.status && response.data.quote_details?.length > 0) {
                    setQuoteDetails(response.data.quote_details);
                }
            } catch (err) {
                console.error('Error fetching quote data:', err);
            }
        };

        fetchQuoteData();
    }, [email_id, website_id]);

    if (!quoteDetails.length) return null;

    return (
        <div>

            <button className="btn btn-warning px-1 py-0.5 elevenpx" onClick={() => setShowModal(true)}>
                Quote Already Given
            </button>

            <AnimatePresence>
                {showModal && (
                    <motion.div
                        className="modal-backdrop flex items-center justify-center fixed inset-0 z-50 bg-black bg-opacity-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            className="bg-white p-6 rounded-xl shadow-2xl max-w-4xl w-full"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Quote Details</h2>
                            {quoteDetails.map((quote, index) => {
                                const plans = quote.plan.split(',');
                                const comments = JSON.parse(quote.plan_comments || '{}');
                                const wordCounts = JSON.parse(quote.word_counts || '{}');

                                return (
                                    <div key={index} className="mb-8 text-gray-800 overflow-y-scroll">
                                        <div className="grid grid-cols-3 md:grid-cols-3 gap-4 mb-4">
                                            <div className="p-3 border rounded bg-gray-50">
                                                <p className="text-sm font-semibold">Quote ID</p>
                                                <p>{quote.id}</p>
                                            </div>
                                            <div className="p-3 border rounded bg-gray-50">
                                                <p className="text-sm font-semibold">Ref ID</p>
                                                <p>{quote.ref_id}</p>
                                            </div>
                                            <div className="p-3 border rounded bg-gray-50">
                                                <p className="text-sm font-semibold">Client Name</p>
                                                <p>{quote.client_name}</p>
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold mb-2">Plan Details</h3>
                                            <div className="overflow-auto">
                                                <table className="w-full border border-gray-300 text-sm">
                                                    <thead className="bg-gray-100 text-left">
                                                        <tr>
                                                            <th className="border px-3 py-2">Plan</th>
                                                            <th className="border px-3 py-2">Comments</th>
                                                            <th className="border px-3 py-2">Word Count</th>
                                                            <th className="border px-3 py-2">Quote Price</th>
                                                            <th className="border px-3 py-2">Discount Price</th>
                                                            <th className="border px-3 py-2">Final Price</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {plans.map((planName, i) => (
                                                            <tr key={i} className="hover:bg-gray-50">
                                                                <td className="border px-3 py-2 font-medium">{planName}</td>
                                                                <td
                                                                    className="border px-3 py-2"
                                                                    dangerouslySetInnerHTML={{ __html: comments[planName] }}
                                                                ></td>
                                                                <td className="border px-3 py-2">{wordCounts[planName]}</td>

                                                                {/* QUOTE PRICE */}
                                                                <td className="border px-3 py-2">
                                                                    {quote.tasks?.map((task, index) => {
                                                                        const prices = task.quote_price?.split(",") || [];
                                                                        return (
                                                                            <div key={index}>
                                                                                {prices[i] ?? "-"}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </td>

                                                                {/* DISCOUNT PRICE */}
                                                                <td className="border px-3 py-2">
                                                                    {quote.tasks?.map((task, index) => {
                                                                        const discounts = task.discount_price?.split(",") || [];
                                                                        return (
                                                                            <div key={index}>
                                                                                {discounts[i] ?? "-"}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </td>

                                                                {/* FINAL PRICE */}
                                                                <td className="border px-3 py-2">
                                                                    {quote.tasks?.map((task, index) => {
                                                                        const finals = task.final_price?.split(",") || [];
                                                                        return (
                                                                            <div key={index}>
                                                                                {finals[i] ?? "-"}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                        </div>


                                    </div>
                                );
                            })}
                            <div className="text-right mt-6">
                                <button
                                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                                    onClick={() => setShowModal(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>

                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default AlreadyQuoteGiven;
