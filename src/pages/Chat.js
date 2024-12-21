import React, { useState, useEffect ,useRef } from 'react';
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

    const chatContainerRef = useRef(null);

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

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // Scroll to bottom when messages update
    https://looppanel.vercel.app/mandeep.tamang%40dissertationindia.net/4dd88559e7c33602bf469723afee58a41018a37d2e0b6c8eb8eaceb86e1d6848

    return (
        <div className="mt-6 py-4 px-2 border-t border-gray-300">
            <div className='flex items-center justify-between'>
                <h3 className="text-lg font-semibold">Communication Hub</h3>
                <button className='bg-gray-300 p-1 rounded' onClick={fetchMessages}>
                    <RefreshCcw size={15}/>
                </button>
            </div>

            {loadingMessages ? (
                <p><CustomLoader /></p>
            ) : (
                <div
                className="mt-4 space-y-2 max-h-56 overflow-y-auto chats pr-3 pl-3 pt-3 pb-0"
                id="chatContainer"
                ref={chatContainerRef} 
                dangerouslySetInnerHTML={{ __html: messages }}
            />
            )}

            <div className="mt-4">
                
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