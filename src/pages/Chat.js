import React, { useState, useEffect, useRef } from 'react';
import { toast as toastify, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CustomLoader from '../CustomLoader';
import { ScaleLoader } from 'react-spinners';
import { File, Paperclip, RefreshCcw, X, Expand, Minimize2 } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { io } from "socket.io-client";
import { getSocket } from './Socket';
const socket = getSocket();


export const Chat = ({ quoteId, refId, status, submittedToAdmin, finalFunction,finalfunctionforsocket ,allDetails, tlType, handlefullScreenBtnClick,chatTabVisible, fullScreenTab}) => {
    const [messages, setMessages] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState("");
    const [markStatus, setMarkStatus] = useState(false);

    

    const userData = localStorage.getItem('user');


    const userObject = JSON.parse(userData);

    const loopUserData = localStorage.getItem('loopuser');

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
    const fetchMessagesForSocket = async () => {
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
                setNewMessage('');
                setFile('');
                setFile(null); // Clear the file input after sending
                setFileName('');
                finalFunction();
                const user_name = loopUserObject.fld_first_name + " " + loopUserObject.fld_last_name;
                socket.emit('sendmessage',{
                    quote_id: quoteId,
                    ref_id :refId,
                    user_name: user_name,
                    all_details:allDetails,
                    user_id:loopUserObject.id
                })
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
        if((loopUserObject.id == 1 || loopUserObject.id == 342) && allDetails.status == 0){
            setMarkStatus(true);
        }
    }, [quoteId]);

    useEffect(() => {
    socket.on('chatresponse', (data) => {
        if(data.quote_id == quoteId && data.ref_id == refId){
            
            fetchMessagesForSocket();
        }
    });

    return () => {
        socket.off('chatresponse');  // Clean up on component unmount
    };
}, []);


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
        <div className="px-3 pt-3 bg-white pb-4 w-full">
            <div className='flex items-center justify-between border-bottom mb-0 pb-2'>
                <h3 class="f-18 mb-0">Communication Hub</h3>
                {/* <h3 className="text-lg font-semibold">Communication Hub</h3> */}
                <div className='flex items-center'>
                    <button className='bg-gray-300 p-1 rounded mr-1' onClick={fetchMessages}>
                        <RefreshCcw size={15} />
                    </button>
                    
                        <button className="" 
                        >
                            {fullScreenTab == "chat" ? (<Minimize2 size={25} onClick={()=>{handlefullScreenBtnClick(null)}}  className="btn btn-sm btn-light flex items-center px-1"/>) : (<Expand size={25} onClick={()=>{handlefullScreenBtnClick("chat")}}  className="btn btn-sm btn-light flex items-center px-1"/>)}
                            
                        </button>
                    
                </div>
            </div>

            {loadingMessages ? (
                <p><CustomLoader /></p>
            ) : (
                messages && messages !== "" && messages !== null && (
                    <div
                        className="mt-4 space-y-2 max-h-56 overflow-y-auto chats pr-3 pl-3 pb-0 pt-2"
                        id="chatContainer"
                        ref={chatContainerRef}
                        dangerouslySetInnerHTML={{ __html: messages }}
                    />
                )
            )}

            <div className="mt-3 px-0">

                {/* Input Section */}
                    {((loopUserObject.fld_email == 'puneet@redmarkediting.com' ||
                        loopUserObject.fld_email == 'clientsupport@chankyaresearch.net') && status == 0 && submittedToAdmin == "true") ? (
                        <div className="flex items-center space-x-2 mb-2">
                            <label className='mb-0' for="markStatus" style={{ fontSize: "15px" }}>Mark as pending at user</label>
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
                <div className="space-x-2">
                    <textarea
                        placeholder="Type your message"
                        className="w-full text-gray-700 bg-white px-3 resize-none py-1 rounded focus:outline-none border"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        rows={4}
                        disabled={tlType && tlType == 2}
                    ></textarea>

                    <div className='flex items-end justify-end'>
                        <div className="flex items-end justify-end ">
                            <label
                                htmlFor="fileInput"
                                className="border border-gray-300 rounded px-2 py-1 bg-gray-100 text-sm text-gray-700 cursor-pointer hover:bg-gray-200 mb-0 mr-2"
                            >
                                <Paperclip size={15}/>
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
                            className="text-white chatsbut "
                        >
                            {buttonDisabled ? "Sending..." : "Send"}
                        </button>
                    </div>
                </div>
                {fileName && (
                    <div className='d-flex justify-end'>
                        <div className="flex items-center justify-end space-x-2 bg-red-100 d-inline-flex mt-3 p-2">
                            <span className="text-sm text-right text-gray-500">{fileName}</span>
                            <button
                                onClick={clearFile}
                                className="text-sm text-white bg-red-500 rounded-full p-1 hover:bg-red-600"
                            >
                                <X size={13}/>
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
        </div>
    );
};