import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CustomLoader from '../CustomLoader';
import { ScaleLoader } from 'react-spinners';
import { RefreshCcw } from 'lucide-react';

export const Chat = ({ quoteId, refId }) => {
    const [messages, setMessages] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [buttonDisabled, setButtonDisabled] = useState(false);

    const fetchMessages = async () => {
        setLoadingMessages(true);
        try {
            const response = await fetch('https://instacrm.rapidcollaborate.com/api/getallquotechats', {
                method: 'POST',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quote_id: quoteId })
            });
            const data = await response.text(); // Expecting an HTML response
            setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoadingMessages(false);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) {
            toast.error('Message cannot be empty');
            return;
        }

        try {
            setButtonDisabled(true);
            const response = await fetch('https://instacrm.rapidcollaborate.com/api/submituserchat-api', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ref_id: refId,
                    quote_ids: quoteId,
                    message: newMessage,
                }),
            });
            if (response.ok) {
                toast.success('Message sent successfully');
                setNewMessage('');
                fetchMessages(); // Refresh messages
            } else {
                toast.error('Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Error sending message');
        }finally{
            setButtonDisabled(false);
        }
    };

    useEffect(() => {
        if (quoteId) {
            fetchMessages();
        }
    }, [quoteId]);

    return (
        <div className="mt-6 py-4 px-2 border-t border-gray-300">
            <div className='flex items-center justify-between'>
                <h3 className="text-lg font-semibold">Chats</h3>
                <button className='bg-gray-300 p-1 rounded' onClick={fetchMessages}>
                    <RefreshCcw size={15}/>
                </button>
            </div>

            {loadingMessages ? (
                <p><ScaleLoader /></p>
            ) : (
                <div
                    className="mt-4 space-y-2 max-h-56 overflow-y-auto chats"
                    dangerouslySetInnerHTML={{ __html: messages }}
                />
            )}

            <div className="mt-4">
                {/* Emoji Section */}
                <div className="flex space-x-2 mb-2">
                    {["👍", "😊", "❤️", "👏", "👎"].map((emoji) => (
                        <button
                            key={emoji}
                            onClick={() => setNewMessage((prev) => prev + emoji)}
                            className="text-xl hover:bg-gray-200 p-1 rounded"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>

                {/* Input Section */}
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        placeholder="Type your message"
                        className="flex-1 border border-gray-300 rounded px-3 py-1"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={buttonDisabled}
                        className="text-white chatsbut"
                    >
                        {buttonDisabled ? "Sending..." : "Send"}
                    </button>
                </div>
            </div>

        </div>
    );
};