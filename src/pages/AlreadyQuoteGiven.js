// AlreadyQuoteGiven.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe } from 'lucide-react';

const AlreadyQuoteGiven = ({ email_id, website_id }) => {
    const [quoteDetails, setQuoteDetails] = useState([]);
    const [showModal, setShowModal] = useState(false);


    useEffect(() => {
        const fetchQuoteData = async () => {
            try {
                const response = await axios.post(
                    "https://loopback-skci.onrender.com/api/scope/checkpresentemail",
                    { email_id, website_id }
                );

                const quoteData = response.data?.quote_details || [];

                // For each quote, fetch the detailed data using ref_id
                const detailedQuotes = await Promise.all(
                    quoteData.map(async (quote) => {
                        try {
                            const detailRes = await fetch(
                                "https://loopback-skci.onrender.com/api/scope/view_query_details_api",
                                {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({ query_id: quote.ref_id }),
                                }
                            );

                            const detailData = await detailRes.json();

                            if (detailData.status && detailData?.queryInfo) {
                                const website_name = detailData.queryInfo.website_name || null;
                                return {
                                    ...quote,
                                    website_name,
                                    ...detailData.data,
                                };
                            }
                            else {
                                console.warn(
                                    `Detail fetch failed for ref_id ${quote.ref_id}: ${detailData.message}`
                                );
                                return { ...quote, website_name: null };
                            }
                        } catch (err) {
                            console.error(`Error fetching details for ref_id ${quote.ref_id}`, err);
                            return { ...quote, website_name: null };
                        }
                    })
                );

                setQuoteDetails(detailedQuotes);
            } catch (err) {
                console.error("Error fetching quote data:", err);
            }
        };

        if (email_id && website_id) {
            fetchQuoteData();
        }
    }, [email_id, website_id]);


    if (!quoteDetails.length) return null;

    return (
        <div>

            <button className="text-blue-600  hover:underline  px-1 pt-1 " onClick={() => setShowModal(true)}>
                Quote For Other Website
            </button>

            <AnimatePresence>
                {showModal && (
                    <motion.div
                        className="modal-backdrop h-screen fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowModal(false)}
                    >

                        <motion.div
                            className="bg-white px-6 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-3 border-b py-3 sticky top-0 bg-white">
                                <h2 className="  text-gray-800 text-lg font-semibold  ">Quote Details</h2>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => setShowModal(false)}
                                >
                                    Close
                                </button>
                            </div>

                            {quoteDetails.map((quote, index) => {
                                const plans = quote.plan.split(',');
                                const comments = JSON.parse(quote.plan_comments || '{}');
                                const wordCounts = JSON.parse(quote.word_counts || '{}');
                                console.log(quote)
                                return (
                                    <div key={index} className="mb-8 text-gray-800 overflow-y-scroll pr-3 space-y-8 py-6">
                                        {quote.website_name && (
                                            <p className='flex items-center text-blue-500'> <Globe size={15} className='text-blue-600 mr-1'/> Website name <span className='text-black font-medium ml-2'>{quote.website_name}</span></p>
                                        )}
                                        <div className="grid grid-cols-3 md:grid-cols-3 gap-4 mb-4">
                                            <div className="p-2 border rounded bg-gray-50 d-flex gap-x-2">
                                                <p className="text-sm font-semibold">Quote ID :</p>
                                                <p>{quote.id}</p>
                                            </div>
                                            <div className="p-2 border rounded bg-gray-50 d-flex gap-x-2">
                                                <p className="text-sm font-semibold">Ref ID :</p>
                                                <p>{quote.ref_id}</p>
                                            </div>
                                            <div className="p-2 border rounded bg-gray-50 d-flex gap-x-2">
                                                <p className="text-sm font-semibold">Client Name :</p>
                                                <p>{quote.client_name}</p>
                                            </div>
                                        </div>

                                        <div className="mb-3">
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

                        </motion.div>

                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default AlreadyQuoteGiven;
