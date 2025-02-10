import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import CustomLoader from '../CustomLoader';
import { Chat } from './Chat';
import AskPtp from './AskPtp';
import DemoDone from './DemoDone';
import { CheckCircle2, Info, PlusCircle, RefreshCcw, ChevronUp, ChevronDown, ArrowDown, ArrowUp, Edit, Settings2, History, Hash, FileDownIcon, Paperclip, UserRoundPlus, Share, Share2, ArrowLeftRight, Eye, EyeClosed, Minimize2, Expand } from 'lucide-react';
import SubmitRequestQuote from './SubmitRequestQuote';
import { AnimatePresence } from 'framer-motion';
import EditRequestForm from './EditRequestForm';
import Swal from 'sweetalert2';
import 'sweetalert2/src/sweetalert2.scss'
import HistorySideBar from './HistorySideBar';
import FeasHistorySideBar from './FeasHistorySideBar';
import AddTags from './AddTags';
import AddFollowers from './AddFollowers';
import { io } from "socket.io-client";
import MergedHistoryComponent from './MergedHistoryComponent';
import ScopeLoader from './ScopeLoader';
import { getSocket } from './Socket';
import ReactTooltip, { Tooltip } from 'react-tooltip'
import MergedHistoryComponentNew from "./MergedHistoryComponentNew";

const AskForScope = ({ queryId, userType, quotationId, userIdDefined, clientName, tlType }) => {
    const socket = getSocket();
    const [scopeDetails, setScopeDetails] = useState(null);
    const [assignQuoteInfo, setAssignQuoteInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [priceLoading, setPriceLoading] = useState(false);
    const [quoteLoading, setQuoteLoading] = useState(false);
    const [assignLoading, setAssignLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [quotePrice, setQuotePrice] = useState('');
    const [userComments, setUserComments] = useState('');
    const [ConsultantUserData, setConsultantUserData] = useState([]);
    const [quoteAmount, setQuoteAmount] = useState('');
    const [comment, setComment] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [adminComments, setAdminComments] = useState('');
    const userData = localStorage.getItem('user');
    const loopuserData = localStorage.getItem('loopuser');
    const [expandedRowIndex, setExpandedRowIndex] = useState(0);
    const [addNewFormOpen, setAddNewFormOpen] = useState(false);
    const [editFormOpen, setEditFormOpen] = useState(false);
    const [hashEditFormOpen, setHashEditFormOpen] = useState(false);
    const [followersFormOpen, setFollowersFormOpen] = useState(false);
    const [selectedQuoteId, setSelectedQuoteId] = useState('');
    const [selectedRefId, setSelectedRefId] = useState('');
    const [historyData, setHistoryData] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const [error, setError] = useState(null);

    const [historyPanelOpen, SetHistoryPanelOpen] = useState(false);
    const [quoteIdForHistory, setQuoteIdForHistory] = useState('');

    const [feasHistoryPanelOpen, SetFeasHistoryPanelOpen] = useState(false);
    const [quoteIdForFeasHistory, setQuoteIdForFeasHistory] = useState('');
    const [refIdForFeasHistory, setRefIdForFeasHistory] = useState('');
    const [userIdForTag, setUserIdForTag] = useState('');


const [scopeTabVisible, setScopeTabVisible] = useState(true);
  const [chatTabVisible, setChatTabVisible] = useState(true);
  const [feasTabVisible, setFeasTabVisible] = useState(false);
  const [fullScreenTab, setFullScreenTab] = useState(null);
  const closeModal = () => {
    setChatTabVisible(false);
  };
  const handleTabButtonClick = (tab) => {
    if (tab == "scope") {
      setScopeTabVisible(true);
      setFullScreenTab(null)
    } else if (tab == "chat") {
      setChatTabVisible(!chatTabVisible);
      setFullScreenTab(null)
    } else if (tab == "feas") {
      setFeasTabVisible(!feasTabVisible);
      setFullScreenTab(null)
    }
  };

  const handlefullScreenBtnClick = (tab) =>{
      if(tab == "scope"){
        // setChatTabVisible(false);
        // setFeasTabVisible(false);
        // setScopeTabVisible(true);
        setFullScreenTab("scope")
      }else if(tab == "chat"){
        // setChatTabVisible(true);
        // setFeasTabVisible(false);
        // setScopeTabVisible(false);
        setFullScreenTab("chat")
      }else if(tab =="feas"){
        // setChatTabVisible(false);
        // setFeasTabVisible(true);
        // setScopeTabVisible(false);
        setFullScreenTab("feas")
      }else{
        setFullScreenTab(null)
      }
  }
const getVisibleTabCount = () => {
    let visibleCount = 0;
    if (scopeTabVisible) visibleCount++;
    if (chatTabVisible) visibleCount++;
    if (feasTabVisible) visibleCount++;
    return visibleCount;
  };

  // Determine the colClass based on the number of visible tabs
  const colClass = useMemo(() => {
    const visibleTabs = getVisibleTabCount();
    if (visibleTabs === 1) {
      return "col-md-12";
    } else if (visibleTabs === 2) {
      return "col-md-6";
    } else {
      return "col-md-4";
    }
  }, [scopeTabVisible, chatTabVisible, feasTabVisible]);

  const planColClass = useMemo(() => {
    const visibleTabs = getVisibleTabCount();
    if (visibleTabs === 1) {
      return "col-md-4";
    } else if (visibleTabs === 2) {
      return "col-md-6";
    } else {
      return "col-md-12";
    }
  }, [scopeTabVisible, chatTabVisible, feasTabVisible]);




  function capitalizeFirstLetter(str) {
    if (typeof str !== 'string') return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }



    const toggleHistoryDiv = ($id) => {
        setQuoteIdForHistory($id);
        SetHistoryPanelOpen(true);
    }

    const toggleRow = (index) => {
        setExpandedRowIndex(expandedRowIndex == index ? null : index);
    };


    const userObject = JSON.parse(userData);
    const loopUserObject = JSON.parse(loopuserData);

    const thisUserId = (userIdDefined && userIdDefined != null && userIdDefined != "") ? userIdDefined : loopUserObject.id


    const fetchScopeDetails = async () => {
        setLoading(true); // Show loading spinner
        let hasResponse = false;
        try {
            const response = await fetch(
                'https://apacvault.com/Webapi/adminScopeDetails',
                {
                    method: 'POST', // Use POST method
                    headers: {
                        'Content-Type': 'application/json', // Set content type to JSON
                    },
                    body: JSON.stringify({ ref_id: queryId, quote_id: quotationId, user_type: userType }), // Send the ref_id
                }
            );

            const data = await response.json(); // Parse the response as JSON
            console.log(data);

            if (data.status) {
                if (data.quoteInfo != null && Array.isArray(data.quoteInfo)) {
                    // If quoteInfo is an array, process each entry
                    const parsedQuoteInfo = data.quoteInfo.map((quote) => ({
                        ...quote,
                        relevant_file: quote.relevant_file
                            ? JSON.parse(quote.relevant_file)
                            : [], // Parse the file data if present
                    }));

                    setScopeDetails(parsedQuoteInfo); // Set the array of quotes
                    setAssignQuoteInfo(data.assignQuoteInfo); // Assuming you also want to set assignQuoteInfo
                } else {
                    setScopeDetails(null); // If no quoteInfo, set scopeDetails to null
                }
            } else {
                console.error('Failed to fetch Details:', data.message);
            }
            hasResponse = true;
        } catch (error) {
            console.error('Error fetching details:', error);
        } finally {
            if (hasResponse) {
                setLoading(false); // Hide the loader
            }
        }
    };
    const fetchScopeDetailsForScoket = async () => {
        let hasResponse = false;
        try {
            const response = await fetch(
                'https://apacvault.com/Webapi/adminScopeDetails',
                {
                    method: 'POST', // Use POST method
                    headers: {
                        'Content-Type': 'application/json', // Set content type to JSON
                    },
                    body: JSON.stringify({ ref_id: queryId, quote_id: quotationId, user_type: userType }), // Send the ref_id
                }
            );

            const data = await response.json(); // Parse the response as JSON
            if (data.status) {
                if (data.quoteInfo != null && Array.isArray(data.quoteInfo)) {
                    // If quoteInfo is an array, process each entry
                    const parsedQuoteInfo = data.quoteInfo.map((quote) => ({
                        ...quote,
                        relevant_file: quote.relevant_file
                            ? JSON.parse(quote.relevant_file)
                            : [], // Parse the file data if present
                    }));

                    setScopeDetails(parsedQuoteInfo); // Set the array of quotes
                    setAssignQuoteInfo(data.assignQuoteInfo); // Assuming you also want to set assignQuoteInfo
                } else {
                    setScopeDetails(null); // If no quoteInfo, set scopeDetails to null
                }
            } else {
                console.error('Failed to fetch Details:', data.message);
            }
            hasResponse = true;
        } catch (error) {
            console.error('Error fetching details:', error);
        }
    };




    useEffect(() => {
        if (queryId) {
            fetchScopeDetails(); // Fetch the scope details when the component mounts
        }
    }, [queryId]);

    useEffect(() => {
        socket.on('quoteReceived', (data) => {
            if (data.ref_id == queryId) {

                fetchScopeDetailsForScoket();
            }
        });

        return () => {
            socket.off('quoteReceived');  // Clean up on component unmount
        };
    }, []);

    useEffect(() => {
        socket.on('feasabilityDone', (data) => {
            if (data.ref_id == queryId) {

                fetchScopeDetailsForScoket();
            }
        });

        return () => {
            socket.off('feasabilityDone');  // Clean up on component unmount
        };
    }, []);

    const formatDate = (timestamp) => {
        const date = new Date(timestamp * 1000); // Convert Unix timestamp to Date object
        return date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    };

    const getStatusText = (status) => {
        switch (status) {
            case 0:
                return 'Pending';
            case 1:
                return 'Submitted';
            default:
                return 'Unknown';
        }
    };
    const referenceUrl = `https://instacrm.rapidcollaborate.com/managequote/view-askforscope/${scopeDetails?.ref_id}`;

    const toggleAddNewForm = () => setAddNewFormOpen((prev) => !prev);
    const toggleEditForm = (id) => {
        setSelectedQuoteId(id);
        setEditFormOpen((prev) => !prev)
    };

    const toggleFeasHistoyDiv = (assign_id, quote_id) => {
        setQuoteIdForFeasHistory(quote_id);
        setRefIdForFeasHistory(assign_id);
        SetFeasHistoryPanelOpen((prev) => !prev);

    }






    const confirmSubmit = (assign_id, quote_id, user_id) => {
        Swal.fire({
            title: "Add Latest comments",
            text: "Once submitted, this action cannot be undone!",

            showCancelButton: true, // Show cancel button
            confirmButtonText: 'Submit',
            cancelButtonText: 'Cancel',
            preConfirm: () => {
                // Get the value of the final_comments input
                const finalComments = Swal.getPopup().querySelector('#final_comments').value;
                if (!finalComments) {
                    Swal.showValidationMessage("Please enter your comments.");
                }
                return finalComments; // Return the comments to be used in the submitToAdmin function
            },
            html: `
                <div style="text-align: left; width: 100%;">
                    <label for="final_comments" style="font-weight: bold; font-size: 14px; display: block; margin-bottom: 5px;">Enter Comments:</label>
                    <textarea id="final_comments" class="swal2-input" placeholder="Enter your comments..." style="width: 100%; height: 100px; padding: 10px; font-size: 14px; border-radius: 5px; border: 1px solid #ccc; resize: none;"></textarea>
                </div>
            `,
            focusConfirm: false, // Focus on the textarea (not the confirm button)
        }).then((result) => {
            if (result.isConfirmed) {
                const finalComments = result.value; // Get the entered comments
                submitToAdmin(assign_id, quote_id, user_id, finalComments);
            } else {
                Swal.fire("Submission canceled!");
            }
        });
    };

    const submitToAdmin = async (assign_id, quote_id, user_id) => {
        const payload = {
            ref_id: assign_id,
            quote_id: quote_id,
            user_id: user_id,

        };

        try {
            const response = await fetch('https://apacvault.com/Webapi/submitFeasRequestToAdmin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (data.status) {
                toast.success("The quote has been successfully submitted to the admin.");
                socket.emit("updateRequest", {
                    quote_id: quote_id,
                    ref_id: assign_id,
                    user_name: loopUserObject.fld_first_name + " " + loopUserObject.fld_last_name
                })
                setTimeout(() => {
                    fetchScopeDetails();
                }, 1000);

            } else {
                toast.error(data.message || "Something went wrong.");
            }
        } catch (error) {
            console.error("Error submitting to admin:", error);
            toast.error("An unexpected error occurred. Please try again.");
        }
    };



    const toggleHashEditForm = (id, user_id) => {
        setSelectedQuoteId(id);
        setUserIdForTag(user_id);
        setHashEditFormOpen((prev) => !prev)
    };
    const toggleFollowersForm = (id, user_id) => {
        setSelectedQuoteId(id);
        setUserIdForTag(user_id);
        setFollowersFormOpen((prev) => !prev)
    };
    const numberToWords = (num) => {
        const toWords = require("number-to-words");
        return toWords.toWords(Number(num));
      };

    return (
      <div className=" h-full bg-gray-100  z-50 overflow-y-auto mt-2 rounded w-full">
        <div className="flex items-center justify-between bg-blue-400 text-white py-2 px-3">
          <h2 className="text-sx font-semibold ">Ask For Scope </h2>
          <div className="flex items-center">
            <button
              disabled={tlType && tlType == 2}
              onClick={toggleAddNewForm}
              className="flex items-center mr-2 rounded px-2 py-1 text-xs btn-light line-h-in"
            >
              <PlusCircle size={15} className="mr-1" /> Add New
            </button>
            <button onClick={fetchScopeDetails} className="btn btn-dark btn-sm">
              <RefreshCcw size={15} className="cursor-pointer" />
            </button>
          </div>
        </div>

        {loading ? (
          <ScopeLoader /> // A loader component when data is being fetched
        ) : (
          <div className="bg-white p-3 space-y-4">
            {errorMessage && <p className="text-red-600">{errorMessage}</p>}

            {scopeDetails && scopeDetails.length > 0 ? (
              <div>
                {/* Table Header */}
                <table className="w-full border-collapse border border-gray-200 f-14">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-2 py-2 text-left">Ref No.</th>
                      <th className="border px-2 py-2 text-left">Quote Id.</th>
                      <th className="border px-2 py-2 text-left">Currency</th>
                      <th className="border px-2 py-2 text-left">Plan</th>
                      <th className="border px-2 py-2 text-left">
                        Service Name
                      </th>
                      <th className="border px-2 py-2 text-left">
                        Quote Status
                      </th>
                      <th className="border px-2 py-2 text-left">Action</th>
                    </tr>
                  </thead>
                  {/* Table Body */}
                  <tbody>
                    {scopeDetails.map((quote, index) => (
                      <React.Fragment key={index}>
                        {/* Row */}
                        <tr className="cursor-pointer hover:bg-gray-50">
                          <td
                            className="border px-2 py-2 "
                            style={{ fontSize: "11px" }}
                          >
                            <p className="flex items-center line-h-in">
                              {quote.assign_id}
                              {quote.ptp == "Yes" && (
                                <span
                                  className="inline-block pl-3 pr-2 py-1 f-10 ml-1" // Increased padding for more space
                                  style={{
                                    backgroundColor: "#2B9758FF", // Green color for PTP
                                    clipPath:
                                      "polygon(25% 0%, 100% 0, 100% 99%, 25% 100%, 0% 50%)",
                                    color: "#ffffff",
                                    fontSize: "12px", // Increased font size for better visibility
                                    fontWeight: "bold",
                                    lineHeight: "1.3", // Increased line height to make it visually balanced
                                  }}
                                >
                                  PTP
                                </span>
                              )}
                              {quote.edited == 1 && (
                                <span
                                  className="text-gray-600 bg-gray-200 rounded-full text-sm ml-2"
                                  style={{
                                    fontSize: "11px",
                                    padding: "1px 6px",
                                  }}
                                >
                                  Edited
                                </span>
                              )}
                              {quote.ownership_transferred == 1 && (
                                <div className="relative group">
                                  <ArrowLeftRight
                                    size={24}
                                    className="text-yellow-600 bg-yellow-300 border-2 border-yellow-600 p-1 rounded-full ml-1"
                                    data-tooltip-id="my-tooltip"
                                    data-tooltip-content={`Ownership transferred from ${quote.old_user_name}`}
                                  />
                                </div>
                              )}
                            </p>
                          </td>
                          <td
                            className="border px-2 py-2"
                            style={{ fontSize: "11px" }}
                          >
                            {quote.quoteid}
                          </td>
                          <td
                            className="border px-2 py-2"
                            style={{ fontSize: "11px" }}
                          >
                            {quote.currency}
                          </td>
                          <td
                            className="border px-2 py-2"
                            style={{ fontSize: "11px" }}
                          >
                            {quote.plan}
                          </td>
                          <td
                            className="border px-2 py-2"
                            style={{ fontSize: "11px" }}
                          >
                            {quote.service_name || "N/A"}
                          </td>
                          <td
                            className="border px-2 py-2"
                            style={{ fontSize: "11px" }}
                          >
                            {quote.isfeasability == 1 ? (
                              quote.submittedtoadmin == "false" ? (
                                quote.feasability_status == "Pending" ? (
                                  <span className="text-red-600">
                                    Feasabilty Submitted
                                  </span>
                                ) : (
                                  <span className="text-green-600">
                                    Feasabilty Completed
                                  </span>
                                )
                              ) : quote.feasability_status == "Completed" &&
                                quote.quote_status == "1" ? (
                                <span className="text-green-700">
                                  Feasabilty Completed and Admin Submitted
                                </span>
                              ) : (
                                <p>
                                  <span className="text-green-700">
                                    Feasabilty Completed
                                  </span>{" "}
                                  and{" "}
                                  <span className="text-red-600">
                                    Admin Pending
                                  </span>
                                </p>
                              )
                            ) : (
                              <span
                                className={
                                  quote.quote_status == 0
                                    ? "badge-danger p-1 f-10 rounded-sm px-2 font-semibold" // Pending - Red
                                    : quote.quote_status == 1
                                    ? "badge-success p-1 f-10 rounded-sm px-2 font-semibold" // Submitted - Green
                                    : quote.quote_status == 2
                                    ? "badge-warning p-1 f-10 rounded-sm px-2 font-semibold" // Discount Requested - Yellow
                                    : "badge-secondary p-1 f-10 rounded-sm px-2 font-semibold" // Default - Gray for Unknown
                                }
                              >
                                {quote.quote_status == 0 &&
                                quote.submittedtoadmin == "false"
                                  ? "Pending at User"
                                  : quote.quote_status == 0 &&
                                    quote.submittedtoadmin == "true"
                                  ? "Pending at Admin"
                                  : quote.quote_status == 1
                                  ? "Submitted"
                                  : quote.quote_status == 2
                                  ? "Discount Requested"
                                  : "Unknown"}
                              </span>
                            )}
                          </td>

                          <td
                            className="border px-2 py-2 "
                            style={{ fontSize: "11px" }}
                          >
                            <div className='flex items-center'>
                                {/* Up/Down Arrow Button */}
                                <button
                                onClick={() => toggleRow(index)}
                                className="flex items-center justify-center btn btn-primary btn-sm mr-1"
                                >
                                {expandedRowIndex == index ? (
                                    <ArrowUp size={14} className="text-white" />
                                ) : (
                                    <ArrowDown size={14} className="text-white" />
                                )}
                                </button>

                                {(quote.isfeasability == 1 &&
                                quote.feasability_status == "Pending") ||
                                quote.quote_status == 0 ? (
                                <button
                                    onClick={() => {
                                    toggleEditForm(quote.quoteid);
                                    }}
                                    disabled={tlType && tlType == 2}
                                    className="flex items-center justify-center btn btn-warning btn-sm mr-1"
                                >
                                    <Settings2 size={14}  className="text-white" />
                                </button>
                                ) : null}

                                <button
                                disabled={tlType && tlType == 2}
                                onClick={() => {
                                    toggleHashEditForm(
                                    quote.quoteid,
                                    quote.user_id
                                    );
                                }}
                                className="flex items-center  btn btn-dark btn-sm mr-1"
                                >
                                <Hash size={14} />
                                </button>
                                <button
                                disabled={tlType && tlType == 2}
                                onClick={() => {
                                    toggleFollowersForm(quote.quoteid, thisUserId);
                                }}
                                className="flex items-center justify-center btn btn-info btn-sm mr-1"
                                >
                                <UserRoundPlus size={14} className="" />
                                </button>
                                <button
                                onClick={() => {
                                    const url = `https://apacvault.com/askforscope/viewdetails/${quote.assign_id}/${quote.quoteid}`;
                                    navigator.clipboard
                                    .writeText(url)
                                    .then(() => {
                                        toast.success("URL copied to clipboard!");
                                    })
                                    .catch((err) => {
                                        console.error("Failed to copy URL:", err);
                                    });
                                }}
                                className="flex items-center justify-center btn btn-success btn-sm mr-1"
                                >
                                <Share2 size={14} className="" />
                                </button>
                            </div>
                          </td>
                        </tr>
                        {/* Accordion */}
                        {expandedRowIndex == index && (
                          <tr>
                            <td colSpan={7}>
                              <div className="mx-3 mt-4 mb-0 bg-gray-100 px-3 pt-3 pb-0">
                                <div className="">
                                  <button
                                    onClick={() =>
                                      handleTabButtonClick("scope")
                                    }
                                    className={`px-2 py-1 mr-1 inline-flex items-center text-sm ${
                                      scopeTabVisible
                                        ? "btn-info focus-outline-none"
                                        : "btn-light"
                                    } btn btn-sm  focus:outline-none`}
                                  >
                                    Scope Details{" "}
                                    {scopeTabVisible ? (
                                      <Eye
                                        size={20}
                                        className="badge badge-dark ml-2"
                                      />
                                    ) : (
                                      <EyeClosed
                                        size={20}
                                        className="badge badge-dark ml-2"
                                      />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleTabButtonClick("chat")}
                                    className={`px-2 py-1 mr-1 inline-flex items-center text-sm ${
                                      chatTabVisible
                                        ? "btn-info focus-outline-none"
                                        : "btn-light"
                                    } btn btn-sm`}
                                  >
                                    Communication Hub{" "}
                                    {chatTabVisible ? (
                                      <Eye
                                        size={20}
                                        className="badge badge-dark ml-2"
                                      />
                                    ) : (
                                      <EyeClosed
                                        size={20}
                                        className="badge badge-dark ml-2"
                                      />
                                    )}
                                  </button>
                                  <button
                                    disabled={quote.isfeasability == 0}
                                    onClick={() => handleTabButtonClick("feas")}
                                    className={`px-2 py-1 mr-1 text-sm inline-flex items-center ${
                                      feasTabVisible
                                        ? "btn-info focus-outline-none"
                                        : "btn-light"
                                    } btn btn-sm`}
                                  >
                                    Feasibility{" "}
                                    {feasTabVisible ? (
                                      <Eye
                                        size={20}
                                        className="badge badge-dark ml-2"
                                      />
                                    ) : (
                                      <EyeClosed
                                        size={20}
                                        className="badge badge-dark ml-2"
                                      />
                                    )}
                                  </button>
                                </div>
                              </div>
                              <div className="mx-3 mb-0 bg-gray-100 pt-3 pb-3 pl-0 pr-2 row ">
                                {scopeTabVisible && (
                                  <div
                                    className={`${
                                      fullScreenTab == "scope"
                                        ? "custom-modal"
                                        : colClass
                                    }`}
                                  >
                                    <div
                                      className={`${
                                        fullScreenTab == "scope"
                                          ? "custom-modal-content"
                                          : ""
                                      } `}
                                    >
                                      <div className={`  pl-0`}>
                                        <div className="bg-white p-3">
                                          <div className=" border-bottom pb-2 mb-3 flex items-center justify-between">
                                            <h3 className="f-18">
                                              Scope Details
                                            </h3>
                                            <div>
                                              <button className="">
                                                {fullScreenTab == "scope" ? (
                                                  <Minimize2
                                                    size={25}
                                                    onClick={() => {
                                                      handlefullScreenBtnClick(
                                                        null
                                                      );
                                                    }}
                                                    className="btn btn-sm btn-light flex items-center px-1"
                                                  />
                                                ) : (
                                                  <Expand
                                                    size={25}
                                                    onClick={() => {
                                                      handlefullScreenBtnClick(
                                                        "scope"
                                                      );
                                                    }}
                                                    className="btn btn-sm btn-light flex items-center px-1"
                                                  />
                                                )}
                                              </button>
                                            </div>
                                          </div>
                                          <div className="overscroll-modal">
                                            <div className="space-y-4 text-sm px-0">
                                              <div className="row">
                                                {/* Ref No Section */}
                                                <div className="col-md-12 border-bottom">
                                                  <p className=" mb-3">
                                                    <div><strong>Ref No </strong>{" "}</div>
                                                    <div className='flex items-center'>
                                                        <div className='line-h-in'>{quote.assign_id}</div>
                                                        <div>
                                                            {quote.ptp === "Yes" && (
                                                            <span
                                                                className="inline-block pl-3 pr-2 py-1 f-10 ml-1" 
                                                                style={{
                                                                backgroundColor:
                                                                    "#2B9758FF", 
                                                                clipPath:
                                                                    "polygon(25% 0%, 100% 0, 100% 99%, 25% 100%, 0% 50%)",
                                                                color: "#ffffff",
                                                                fontSize: "14px",
                                                                fontWeight: "bold",
                                                                lineHeight: "1.5",
                                                                }}
                                                            >
                                                                PTP
                                                            </span>
                                                            )}
                                                            {quote.edited == 1 && (
                                                            <span
                                                                className="ml-2 badge badge-secondary"
                                                                style={{
                                                                    fontSize: "11px",
                                                                }}
                                                            >
                                                                Edited
                                                            </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                  </p>

                                                  {quote.tag_names && (
                                                    <p className=' mb-3'>
                                                      <div><strong>Tags</strong></div>
                                                      {quote.tag_names
                                                        .split(",")
                                                        .map((tag, index) => (
                                                          <span
                                                            key={index}
                                                            className="badge badge-secondary f-12"
                                                          >
                                                            #{tag.trim()}
                                                          </span>
                                                        ))}
                                                    </p>
                                                  )}

                                                  {quote.service_name &&
                                                    quote.plan && (
                                                      <>
                                                        <p className='mb-3'>
                                                          <div>
                                                          <strong>
                                                            Service Required
                                                          </strong>{" "}
                                                          </div>
                                                          {quote.service_name}
                                                        </p>
                                                        {quote.old_plan && (
                                                          <p className="text-gray-500 mb-2">
                                                            <div>
                                                            <strong>
                                                              Old Plan
                                                            </strong>{" "}
                                                            </div>
                                                            {quote.old_plan}
                                                          </p>
                                                        )}
                                                        <p className='mb-3'>
                                                          <div>
                                                          <strong>Plan</strong>{" "}
                                                          </div>
                                                          {quote.plan}
                                                        </p>
                                                      </>
                                                    )}
                                                  {quote.subject_area && (
                                                    <>
                                                      <p className='mb-3'>
                                                        <div>
                                                        <strong>
                                                          Subject Area
                                                        </strong>{" "}
                                                        </div>
                                                        {quote.subject_area}
                                                      </p>
                                                      {quote.subject_area ==
                                                        "Other" && (
                                                        <p className="text-gray-500 mb-2">
                                                          <div>
                                                          <strong>
                                                            Other Subject Area
                                                            name
                                                          </strong>{" "}
                                                          </div>
                                                          {
                                                            quote.other_subject_area
                                                          }
                                                        </p>
                                                      )}
                                                    </>
                                                  )}
                                                </div>
                                              </div>
                                              <div className="row">
                                                <div className="col-md-12">
                                                  <h3 className="f-18 mb-2 font-weight-bold">
                                                    Plan Description
                                                  </h3>
                                                </div>
                                                {quote.plan_comments &&
                                                  typeof quote.plan_comments ===
                                                    "string" &&
                                                  quote.plan &&
                                                  Object.entries(
                                                    JSON.parse(
                                                      quote.plan_comments
                                                    )
                                                  )
                                                    .filter(([plan]) =>
                                                      quote.plan
                                                        .split(",")
                                                        .includes(plan)
                                                    ) // Filter based on the updated plan list
                                                    .map(
                                                      (
                                                        [plan, comment],
                                                        index
                                                      ) => (
                                                        <div
                                                          key={index}
                                                          className={
                                                            planColClass
                                                          }
                                                        >
                                                          <div className="border p-3 mb-2">
                                                            <p className='flex items-center mb-1 justify-content-between'>
                                                              <strong>
                                                                {plan}
                                                              </strong>
                                                            </p>
                                                            <div
                                                              dangerouslySetInnerHTML={{
                                                                __html: comment,
                                                              }}
                                                            />

                                                            {/* Word Count Section */}
                                                            {quote.word_counts &&
                                                              typeof quote.word_counts ===
                                                                "string" &&
                                                              Object.entries(
                                                                JSON.parse(
                                                                  quote.word_counts
                                                                )
                                                              )
                                                                .filter(
                                                                  ([
                                                                    planWordCount,
                                                                  ]) =>
                                                                    quote.plan
                                                                      .split(
                                                                        ","
                                                                      )
                                                                      .includes(
                                                                        planWordCount
                                                                      )
                                                                ) // Filter word count based on the plan list
                                                                .map(
                                                                  (
                                                                    [
                                                                      planWordCount,
                                                                      wordcount,
                                                                    ],
                                                                    wcIndex
                                                                  ) =>
                                                                    plan ===
                                                                      planWordCount && (
                                                                      <div
                                                                        key={
                                                                          wcIndex
                                                                        }
                                                                        className=" mt-2"
                                                                      >
                                                                        <p
                                                                          style={{
                                                                            fontWeight:
                                                                              "bold",
                                                                            color:
                                                                              "#007bff",
                                                                            backgroundColor:
                                                                              "#f0f8ff", // Background color for word count text
                                                                            padding:
                                                                              "5px", // Padding around the word count text
                                                                            borderRadius:
                                                                              "5px", // Rounded corners for the background
                                                                            border:
                                                                              "1px solid #40BD5DFF",
                                                                          }}
                                                                        >
                                                                          <p className="mb-1 text-black">
                                                                            <div>
                                                                              Word
                                                                              Counts:
                                                                            </div>
                                                                          </p>
                                                                          {
                                                                            planWordCount
                                                                          }
                                                                          :{" "}
                                                                          <span
                                                                            style={{
                                                                              color:
                                                                                "#28a745",
                                                                            }}
                                                                          >
                                                                            {
                                                                              wordcount
                                                                            }{" "}
                                                                            words
                                                                          </span>
                                                                          <br />
                                                                          <span
                                                                            style={{
                                                                              color:
                                                                                "gray",
                                                                            }}
                                                                          >
                                                                            {capitalizeFirstLetter(
                                                                              numberToWords(
                                                                                wordcount
                                                                              )
                                                                            )}{" "}
                                                                            words
                                                                          </span>
                                                                        </p>
                                                                      </div>
                                                                    )
                                                                )}
                                                          </div>
                                                        </div>
                                                      )
                                                    )}
                                              </div>
                                              <div className="mb-0 row px-2 pb-3 space-y-4">
                                                {quote.comments &&
                                                  quote.comments != "" &&
                                                  quote.comments != null && (
                                                    <p className='mb-2'>
                                                      <strong
                                                        style={{
                                                            fontSize: "15px",
                                                        }}
                                                      >
                                                        Description
                                                      </strong>{" "}
                                                      <span
                                                        dangerouslySetInnerHTML={{
                                                          __html:
                                                            quote.comments,
                                                        }}
                                                      />
                                                    </p>
                                                  )}
                                                {quote.final_comments !=
                                                  null && (
                                                  <div>
                                                    <p>
                                                      <strong>
                                                        Final Comments:
                                                      </strong>{" "}
                                                      {quote.final_comments}
                                                    </p>
                                                  </div>
                                                )}

                                                {quote.relevant_file &&
                                                  quote.relevant_file.length >
                                                    0 && (
                                                    <div>
                                                      <strong>
                                                        Relevant Files:
                                                      </strong>
                                                      <div className="space-y-2 mt-2">
                                                        {quote.relevant_file.map(
                                                          (file, fileIndex) => (
                                                            <div
                                                              key={fileIndex}
                                                            >
                                                              <a
                                                                href={`https://apacvault.com/public/QuotationFolder/${file.file_path}`}
                                                                download
                                                                target="_blank"
                                                                className="text-blue-500"
                                                              >
                                                                {file.filename}
                                                              </a>
                                                            </div>
                                                          )
                                                        )}
                                                      </div>
                                                    </div>
                                                  )}
                                                {quote.ptp != null && (
                                                  <>
                                                    <p>
                                                      <strong>PTP:</strong>{" "}
                                                      {quote.ptp}
                                                    </p>
                                                    {quote.ptp_amount &&
                                                      quote.ptp_amount != 0 && (
                                                        <p>
                                                          <strong>
                                                            PTP Amount:
                                                          </strong>{" "}
                                                          {quote.ptp_amount}
                                                        </p>
                                                      )}
                                                    {quote.ptp == "Yes" && (
                                                      <p>
                                                        <strong>
                                                          PTP Comments:
                                                        </strong>{" "}
                                                        {quote.ptp_comments}
                                                      </p>
                                                    )}
                                                    {quote.ptp_file != null && (
                                                      <p>
                                                        <strong>
                                                          Attached File :{" "}
                                                        </strong>
                                                        <a
                                                          className="text-blue-500 font-semibold flex items-center"
                                                          href={`https://apacvault.com/public/ptpfiles/${quote.ptp_file}`}
                                                          download={
                                                            quote.ptpfile
                                                          }
                                                          target="_blank"
                                                        >
                                                          {quote.ptp_file}{" "}
                                                          <FileDownIcon
                                                            size={20}
                                                          />
                                                        </a>
                                                      </p>
                                                    )}
                                                  </>
                                                )}
                                                {quote.demodone != 0 && (
                                                  <>
                                                    <p className="mb-3">
                                                      
                                                        {" "}
                                                        <div>
                                                        <strong>
                                                          Demo Id {" "}
                                                        </strong>{" "}
                                                        </div>
                                                        <div className='flex items-center'>
                                                            <div className='line-h-in'>{quote.demo_id}</div>
                                                            <div className="line-h-in badge badge-success ml-2 flex items-center f-10">
                                                                Demo Completed{" "}
                                                                <CheckCircle2
                                                                size={13}
                                                                className="ml-2"
                                                                />{" "}
                                                            </div>{" "}
                                                        </div>
                                                    </p>
                                                  </>
                                                )}
                                                {quote.quote_status != 0 &&
                                                  quote.quote_price &&
                                                  quote.plan && (
                                                    <>
                                                      {quote.old_plan && (
                                                        <p className="text-gray-600">
                                                         <div>
                                                         <strong>
                                                            Quote Price For Old
                                                            Plan
                                                          </strong>{" "}
                                                         </div>
                                                          {(() => {
                                                            const prices =
                                                              quote.quote_price.split(
                                                                ","
                                                              ); // Split quote_price into an array
                                                            const plans =
                                                              quote.old_plan.split(
                                                                ","
                                                              ); // Split plan into an array
                                                            return plans.map(
                                                              (plan, index) => (
                                                                <span
                                                                  key={index}
                                                                  className="line-through bg-gray-200 p-1 mx-1 rounded border border-gray-500"
                                                                >
                                                                  <strong>
                                                                    {plan}{" "}
                                                                  </strong>
                                                                  :{" "}
                                                                  {quote.currency ==
                                                                  "Other"
                                                                    ? quote.other_currency
                                                                    : quote.currency}{" "}
                                                                  {prices[index]
                                                                    ? prices[
                                                                        index
                                                                      ]
                                                                    : 0}
                                                                  {index <
                                                                    plans.length -
                                                                      1 && ", "}
                                                                      {quote.mp_price === plan && " (MP Price)"}
                                                                </span>
                                                              )
                                                            );
                                                          })()}
                                                        </p>
                                                      )}
                                                      {quote.quote_status !=
                                                        2 && (
                                                        <p className='mb-3'>
                                                          <div>
                                                            <strong className='f-16'>
                                                                Quote Price
                                                            </strong>{" "}
                                                          </div>
                                                          {(() => {
                                                            const prices =
                                                              quote.quote_price.split(
                                                                ","
                                                              ); // Split quote_price into an array
                                                            const plans =
                                                              quote.plan.split(
                                                                ","
                                                              ); // Split plan into an array
                                                            return plans.map(
                                                              (plan, index) => (
                                                                <span
                                                                  key={index}
                                                                  className={`${
                                                                    quote.discount_price !=
                                                                    null
                                                                      ? "line-through bg-red-200 p-1 rounded mr-1 f-12"
                                                                      : ""
                                                                  }`}
                                                                >
                                                                  <strong>
                                                                    {plan}{" "}
                                                                  </strong>
                                                                  :{" "}
                                                                  {quote.currency ==
                                                                  "Other"
                                                                    ? quote.other_currency
                                                                    : quote.currency}{" "}
                                                                  {prices[index]
                                                                    ? prices[
                                                                        index
                                                                      ]
                                                                    : 0}
                                                                  {index <
                                                                    plans.length -
                                                                      1 && ", "}
                                                                      {quote.mp_price === plan && " (MP Price)"}
                                                                </span>
                                                              )
                                                            );
                                                          })()}
                                                        </p>
                                                      )}

                                                      {quote.discount_price && (
                                                        <p className='mb-3'>
                                                          <div>
                                                          <strong>
                                                            Discounted Price
                                                          </strong>{" "}
                                                          </div>
                                                          {(() => {
                                                            const prices =
                                                              quote.discount_price.split(
                                                                ","
                                                              ); // Split quote_price into an array
                                                            const plans =
                                                              quote.plan.split(
                                                                ","
                                                              ); // Split plan into an array
                                                            return plans.map(
                                                              (plan, index) => (
                                                                <span
                                                                  key={index}
                                                                  className="silver px-1 py-1 f-12 rounded mr-1"
                                                                >
                                                                  <strong>
                                                                    {plan}{" "}
                                                                  </strong>
                                                                  :{" "}
                                                                  {quote.currency ==
                                                                  "Other"
                                                                    ? quote.other_currency
                                                                    : quote.currency}{" "}
                                                                  {prices[
                                                                    index
                                                                  ] ?? 0}
                                                                  {index <
                                                                    plans.length -
                                                                      1 && ", "}
                                                                      {quote.mp_price === plan && " (MP Price)"}
                                                                </span>
                                                              )
                                                            );
                                                          })()}
                                                        </p>
                                                      )}
                                                      {quote.final_price && (
                                                        <p className='mb-3'>
                                                          <div>
                                                          <strong>
                                                            Final Price
                                                          </strong>{" "}
                                                          </div>
                                                          {(() => {
                                                            const prices =
                                                              quote.final_price.split(
                                                                ","
                                                              ); // Split quote_price into an array
                                                            const plans =
                                                              quote.plan.split(
                                                                ","
                                                              ); // Split plan into an array
                                                            return plans.map(
                                                              (plan, index) => (
                                                                <span
                                                                  key={index}
                                                                  className=" px-1 py-2 rounded mr-1 gold"
                                                                >
                                                                  <strong>
                                                                    {plan}{" "}
                                                                  </strong>
                                                                  :{" "}
                                                                  {quote.currency ==
                                                                  "Other"
                                                                    ? quote.other_currency
                                                                    : quote.currency}{" "}
                                                                  {
                                                                    prices[
                                                                      index
                                                                    ]
                                                                  }
                                                                  {index <
                                                                    plans.length -
                                                                      1 && ", "}
                                                                      {quote.mp_price === plan && " (MP Price)"}
                                                                </span>
                                                              )
                                                            );
                                                          })()}
                                                        </p>
                                                      )}
                                                      {quote.user_comments && (
                                                        <p className='mb-3'>
                                                         <div>
                                                         <strong
                                                            style={{
                                                            }}
                                                          >
                                                            Admin Comments
                                                          </strong>{" "}
                                                         </div>
                                                          {quote.user_comments}
                                                        </p>
                                                      )}
                                                    </>
                                                  )}

                                                {assignQuoteInfo &&
                                                  assignQuoteInfo != false && (
                                                    <p className='mb-3'>
                                                      <div>
                                                        <strong>
                                                            Assigned To
                                                        </strong>{" "}
                                                      </div>
                                                      {assignQuoteInfo.name}
                                                    </p>
                                                  )}

                                                <div className="">
                                                  {quote.quote_status == 1 &&
                                                    quote.submittedtoadmin ==
                                                      "true" &&
                                                    quote.user_id ==
                                                      thisUserId && (
                                                      <AskPtp
                                                        scopeDetails={quote}
                                                        quoteId={quote.quoteid}
                                                        after={
                                                          fetchScopeDetails
                                                        }
                                                        plans={quote.plan}
                                                      />
                                                    )}
                                                  {quote.user_id ==
                                                    thisUserId &&
                                                    quote.submittedtoadmin ==
                                                      "true" &&
                                                    quote.demodone != 1 && (
                                                      <DemoDone
                                                        scopeDetails={quote}
                                                        quoteId={quote.quoteid}
                                                        after={
                                                          fetchScopeDetails
                                                        }
                                                      />
                                                    )}
                                                </div>

                                                {quote.isfeasability == 1 && (
                                                  <>
                                                    <div className="flex items-center">
                                                      <>
                                                        {quote.feasability_status ==
                                                          "Completed" &&
                                                          quote.submittedtoadmin ==
                                                            "false" && (
                                                            <button
                                                              disabled={
                                                                tlType &&
                                                                tlType == 2
                                                              }
                                                              onClick={() => {
                                                                submitToAdmin(
                                                                  quote.assign_id,
                                                                  quote.quoteid,
                                                                  quote.user_id
                                                                );
                                                              }}
                                                              className="btn btn-outline-success btn-sm f-12 px-2 py-1"
                                                              title="Submit request to admin for Ask For Scope"
                                                            >
                                                              Request Quote
                                                            </button>
                                                          )}
                                                      </>
                                                    </div>

                                                    
                                                    
                                                    
                                                  </>
                                                )}
                                              </div>
                                            </div>
                                            <div className="px-0">
                                              <MergedHistoryComponentNew
                                                quoteId={quote.quoteid}
                                                refId={quote.assign_id}
                                                onlyFetch="quote"
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {chatTabVisible && (
                                  <div
                                    className={`${
                                      fullScreenTab == "chat"
                                        ? "custom-modal"
                                        : colClass
                                    } p-0`}
                                  >
                                    <div
                                      className={`${
                                        fullScreenTab == "chat"
                                          ? "custom-modal-content"
                                          : ""
                                      }`}
                                    >
                                      <div className={`p-0 `}>
                                        <Chat
                                          quoteId={quote.quoteid}
                                          refId={quote.assign_id}
                                          status={quote.quote_status}
                                          submittedToAdmin={
                                            quote.submittedtoadmin
                                          }
                                          finalFunction={fetchScopeDetails}
                                          finalfunctionforsocket={
                                            fetchScopeDetailsForScoket
                                          }
                                          allDetails={quote}
                                          tlType={tlType}
                                          handlefullScreenBtnClick={
                                            handlefullScreenBtnClick
                                          }
                                          chatTabVisible={chatTabVisible}
                                          fullScreenTab={fullScreenTab}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {feasTabVisible && quote.isfeasability == 1 && (
                                  <div
                                    className={`${
                                      fullScreenTab == "feas"
                                        ? "custom-modal"
                                        : colClass
                                    }`}
                                  >
                                    <div
                                      className={`${
                                        fullScreenTab == "feas"
                                          ? "custom-modal-content"
                                          : ""
                                      }`}
                                    >
                                      <div className={` pr-0`}>
                                        <div className="bg-white px-3 pt-3 pb-3">
                                          <>
                                          <div className="d-flex justify-between border-bottom pb-2 mb-3 ">
                                            <h3 class="f-18 ">Feasibility</h3>
                                            <div className="d-flex justify-between items-center">
                                              <button className="">
                                                {fullScreenTab == "feas" ? (<Minimize2 size={25} onClick={()=>{handlefullScreenBtnClick(null)}}  className="btn btn-sm btn-light flex items-center px-1"/>) : (<Expand size={25} onClick={()=>{handlefullScreenBtnClick("feas")}}  className="btn btn-sm btn-light flex items-center px-1"/>)}
                                              </button>
                                            </div>
                                          </div>
                                            {quote.feasability_status ==
                                              "Completed" && (
                                              <>
                                              
                                                <p
                                                  style={{
                                                    textDecoration: "italic",
                                                  }}
                                                  className="italic mb-3"
                                                >
                                                  <div>
                                                    <strong>
                                                    Feasibility Comments
                                                    </strong>
                                                  </div>
                                                  <span
                                                    className="mt-2"
                                                    dangerouslySetInnerHTML={{
                                                      __html:
                                                        quote.feasability_comments,
                                                    }}
                                                  />
                                                </p>
                                                {quote.feas_file_name && (
                                                  <p className="flex items-center">
                                                    Feasibility Attachment :{" "}
                                                    <a
                                                      href={
                                                        "https://apacvault.com/public/feasabilityFiles/" +
                                                        quote.feas_file_name
                                                      }
                                                      target="_blank"
                                                      className="text-blue-600 flex items-center"
                                                    >
                                                      <Paperclip size={20} />{" "}
                                                      View File
                                                    </a>
                                                  </p>
                                                )}
                                              </>
                                            )}
                                            {historyLoading && <CustomLoader />}
                                            {historyData.length > 0 && (
                                              <div className="mt-4 space-y-4">
                                                <strong className="">
                                                  Feasibility Check History:
                                                </strong>
                                                <div className="">
                                                  {historyData.map(
                                                    (historyItem, index) => (
                                                      <div
                                                        key={historyItem.id}
                                                        className="mb-4"
                                                      >
                                                        <div className="flex items-start space-x-3">
                                                          {/* Timeline Icon */}
                                                          <div className="w-h-2 bg-blue-500 rounded-full mt-1"></div>
                                                          <div className="flex flex-col">
                                                            {/* User Details */}
                                                            <p className=" font-semibold text-gray-700">
                                                              {
                                                                historyItem.from_first_name
                                                              }{" "}
                                                              {
                                                                historyItem.from_last_name
                                                              }
                                                              {historyItem.to_first_name &&
                                                                historyItem.to_first_name && (
                                                                  <span className="text-gray-500 text-xs">
                                                                    {" "}
                                                                    to{" "}
                                                                  </span>
                                                                )}
                                                              {
                                                                historyItem.to_first_name
                                                              }{" "}
                                                              {
                                                                historyItem.to_last_name
                                                              }
                                                            </p>
                                                            <p className=" text-gray-500">
                                                              {
                                                                historyItem.created_at
                                                              }
                                                            </p>
                                                            {/* Message */}
                                                            <p className="text-gray-600">
                                                              {
                                                                historyItem.message
                                                              }
                                                            </p>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    )
                                                  )}
                                                </div>
                                              </div>
                                            )}
                                            <MergedHistoryComponentNew
                                              quoteId={quote.quoteid}
                                              refId={quote.assign_id}
                                              onlyFetch="feasibility"
                                            />
                                          </>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex justify-center items-center">
                <p className="flex items-center justify-between">
                  {" "}
                  <Info className="mr-2" /> No Previous Requests{" "}
                </p>
              </div>
            )}
            <AnimatePresence>
              {addNewFormOpen && (
                <SubmitRequestQuote
                  refId={queryId}
                  onClose={toggleAddNewForm}
                  after={fetchScopeDetails}
                  userIdDefined={userIdDefined}
                  clientName={clientName}
                />
              )}
              {editFormOpen && (
                <EditRequestForm
                  quoteId={selectedQuoteId}
                  refId={queryId}
                  onClose={() => {
                    setEditFormOpen(!editFormOpen);
                  }}
                  after={fetchScopeDetails}
                />
              )}
              {historyPanelOpen && (
                <HistorySideBar
                  quoteId={quoteIdForHistory}
                  refId={queryId}
                  onClose={() => {
                    SetHistoryPanelOpen(!historyPanelOpen);
                  }}
                />
              )}
              {feasHistoryPanelOpen && (
                <FeasHistorySideBar
                  quoteId={quoteIdForFeasHistory}
                  refId={refIdForFeasHistory}
                  onClose={() => {
                    SetFeasHistoryPanelOpen(!feasHistoryPanelOpen);
                  }}
                />
              )}
              {hashEditFormOpen && (
                <AddTags
                  quoteId={selectedQuoteId}
                  refId={queryId}
                  userId={userIdForTag}
                  onClose={() => {
                    setHashEditFormOpen(!hashEditFormOpen);
                  }}
                  after={fetchScopeDetails}
                  notification="no"
                />
              )}
              {followersFormOpen && (
                <AddFollowers
                  quoteId={selectedQuoteId}
                  refId={queryId}
                  onClose={() => {
                    setFollowersFormOpen(!followersFormOpen);
                  }}
                  after={fetchScopeDetails}
                />
              )}
            </AnimatePresence>
            <Tooltip id="my-tooltip" />
          </div>
        )}
      </div>
    );
};

export default AskForScope;