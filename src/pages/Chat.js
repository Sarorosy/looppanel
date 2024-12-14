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

    const userData = sessionStorage.getItem('user');

    
    const userObject = JSON.parse(userData);

    const loopUserData = sessionStorage.getItem('loopuser');

    
    const loopUserObject = JSON.parse(loopUserData);

    const fetchMessages = async () => {
        setLoadingMessages(true);
        try {
            const response = await fetch('https://apacvault.com/Webapi/getquotechatapi', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quote_id: quoteId, user_id:loopUserObject.id })
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
            const response = await fetch('https://apacvault.com/Webapi/submituserchat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ref_id: refId,
                    quote_id: quoteId,
                    message: newMessage,
                    user_id: loopUserObject.id,
                    user_type:userObject.user_type,
                    category:userObject.category
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
                <h3 className="text-lg font-semibold">Communication Hub</h3>
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
                <div className="flex mb-2 justify-between">
                    <div>
                    {["👍", "👏", "👎"].map((emoji) => (
                        <button
                            key={emoji}
                            onClick={() => setNewMessage((prev) => prev + emoji)}
                            className="text-xl hover:bg-yellow-300 p-1 rounded"
                        >
                            {emoji}
                        </button>
                    ))}
                    </div>
                    <div className='space-x-1'>
                    {["Okay", "Done","Let me know", "I'll check"].map((text) => (
                        <button
                            key={text}
                            onClick={() => setNewMessage((prev) => prev + " " +text)}
                            className="text-sm bg-blue-100 hover:bg-blue-200 rounded"
                            style={{padding:"1px 4px"}}
                        >
                            {text}
                        </button>
                    ))}
                    </div>
                </div>


                {/* Input Section */}
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        placeholder="Type your message"
                        className="flex-1 border border-gray-300 rounded px-3 py-1 form-control"
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