import React, { useState, useEffect, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CustomLoader from '../CustomLoader';
import { ScaleLoader } from 'react-spinners';
import { File, Paperclip, RefreshCcw, X } from 'lucide-react';

export const Chat = ({ quoteId, refId, status , submittedToAdmin, finalFunction}) => {
    const [messages, setMessages] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState("");
    const [markStatus, setMarkStatus] = useState(true);

    const userData = sessionStorage.getItem('user');


    const userObject = JSON.parse(userData);

    const loopUserData = sessionStorage.getItem('loopuser');

    const chatContainerRef = useRef(null);

    const loopUserObject = JSON.parse(loopUserData);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setFileName(selectedFile.name); // Set the file name
        }
    };

    const fetchMessages = async () => {
        setLoadingMessages(true);
        try {
            const response = await fetch('https://apacvault.com/Webapi/getquotechatapi', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quote_id: quoteId, user_id: loopUserObject.id })
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
            toast.error('Message is required');
            return;
        }

        const formData = new FormData();
        formData.append('ref_id', refId);
        formData.append('quote_id', quoteId);
        formData.append('message', newMessage);
        formData.append('user_id', loopUserObject.id);
        formData.append('user_type', userObject.user_type);
        formData.append('category', userObject.category);
        formData.append('markstatus', markStatus ? '1' : '0');
        if (file) {
            formData.append('file', file);
        }

        try {
            setButtonDisabled(true);
            const response = await fetch('https://apacvault.com/Webapi/submituserchatnew', {
                method: 'POST',
                body: formData,
            });
            if (response.ok) {
                toast.success('Message sent successfully');
                setNewMessage('');
                setFile('');
                setFile(null); // Clear the file input after sending
                setFileName('');
                finalFunction();
            } else {
                toast.error('Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Error sending message');
        } finally {
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

    const clearFile = () => {
        setFile(null);
        setFileName("");
    };

    // Scroll to bottom when messages update
    https://looppanel.vercel.app/mandeep.tamang%40dissertationindia.net/4dd88559e7c33602bf469723afee58a41018a37d2e0b6c8eb8eaceb86e1d6848



    return (
        <div className="mt-6 py-4 px-2 border-t border-gray-300">
            <div className='flex items-center justify-between'>
                <h3 className="text-lg font-semibold">Communication Hub</h3>
                <button className='bg-gray-300 p-1 rounded' onClick={fetchMessages}>
                    <RefreshCcw size={15} />
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
                    {((loopUserObject.fld_email == 'puneet@redmarkediting.com' ||
                        loopUserObject.fld_email == 'clientsupport@chankyaresearch.net') && status == 0 && submittedToAdmin == "true") ? (
                        <div className="flex items-center space-x-2 ">
                            <label for="markStatus" style={{fontSize:"10px", maxWidth:"70px"}}>Mark as pending at user</label>
                            <input
                                type="checkbox"
                                id="markStatus"
                                checked={markStatus}
                                onChange={(e) => setMarkStatus(e.target.checked)}
                                className="form-checkbox h-4 w-4 text-blue-600"
                                title="This will change status to Pending at user"
                            />
                           
                        </div>
                    ) : null}
                    <input
                        type="text"
                        placeholder="Type your message"
                        className="flex-1 border border-gray-300 rounded px-3 py-1 form-control"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <div className="flex items-center justify-center ">
                        <label
                            htmlFor="fileInput"
                            className="border border-gray-300 rounded px-3 py-1 bg-gray-100 text-sm text-gray-700 cursor-pointer hover:bg-gray-200"
                        >
                            <Paperclip />
                        </label>
                        <input
                            type="file"
                            id="fileInput"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>
                    <button
                        onClick={sendMessage}
                        disabled={buttonDisabled}
                        className="text-white chatsbut"
                    >
                        {buttonDisabled ? "Sending..." : "Send"}
                    </button>
                </div>
                {fileName && (
                    <div className="flex items-center justify-end space-x-2">
                        <span className="text-sm text-right text-gray-500">{fileName}</span>
                        <button
                            onClick={clearFile}
                            className="text-sm text-white bg-red-500 rounded-full p-1 hover:bg-red-600"
                        >
                            <X />
                        </button>
                    </div>
                )}
            </div>

        </div>
    );
};