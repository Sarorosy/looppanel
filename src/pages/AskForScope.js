import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import CustomLoader from '../CustomLoader';
import { Chat } from './Chat';
import AskPtp from './AskPtp';
import DemoDone from './DemoDone';
import { CheckCircle2, Info, PlusCircle, Hourglass, RefreshCcw, ChevronUp, ChevronDown, ArrowDown, ArrowUp, Edit, Settings2, History, Hash, FileDownIcon, Paperclip, UserRoundPlus, Share, Share2, ArrowLeftRight, Eye, EyeClosed, Minimize2, Expand, CheckCircle, XCircle, Copy, Headset, Star, Crown, Pen, Upload, Folder, BadgeCheck } from 'lucide-react';
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
import CallRecordingPending from './CallRecordingPending';
import academic from '../academic.svg';
import experiment from '../poll.svg';
import AttachedFiles from './AttachedFiles';
import ClientSharedFiles from './rapidshare/ClientSharedFiles';
import UserAccounts from './rapidshare/UserAccounts';





const AskForScope = ({ queryId, queryInfo, userType, quotationId, userIdDefined, clientName, tlType, tagAccess }) => {
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
  const [totalCount, setTotalCount] = useState("0");

  const [historyPanelOpen, SetHistoryPanelOpen] = useState(false);
  const [quoteIdForHistory, setQuoteIdForHistory] = useState('');

  const [feasHistoryPanelOpen, SetFeasHistoryPanelOpen] = useState(false);
  const [quoteIdForFeasHistory, setQuoteIdForFeasHistory] = useState('');
  const [refIdForFeasHistory, setRefIdForFeasHistory] = useState('');
  const [userIdForTag, setUserIdForTag] = useState('');

  const [showUpload, setShowUpload] = useState(false);

  const changeShowUpload = () => {
    setShowUpload(!showUpload)
  }

  const [scopeTabVisible, setScopeTabVisible] = useState(true);
  const [chatTabVisible, setChatTabVisible] = useState(true);
  const [feasTabVisible, setFeasTabVisible] = useState(false);
  const [fileTabVisible, setFileTabVisible] = useState(true);
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
    else if (tab == "file") {
      setFileTabVisible(!fileTabVisible);
      setFullScreenTab(null)
    }
  };

  const handlefullScreenBtnClick = (tab) => {
    if (tab == "scope") {
      setFullScreenTab("scope")
    } else if (tab == "chat") {
      setFullScreenTab("chat")
    } else if (tab == "feas") {
      setFullScreenTab("feas")
    } else if (tab == "file") {
      setFullScreenTab("file")
    } else {
      setFullScreenTab(null)
    }
  }
  const getVisibleTabCount = () => {
    let visibleCount = 0;
    if (scopeTabVisible) visibleCount++;
    if (chatTabVisible) visibleCount++;
    if (feasTabVisible) visibleCount++;
    if (fileTabVisible) visibleCount++;
    return visibleCount;
  };

  // Determine the colClass based on the number of visible tabs
  const colClass = useMemo(() => {
    const visibleTabs = getVisibleTabCount();
    if (visibleTabs === 1) {
      return "col-md-12";
    } else if (visibleTabs === 2) {
      return "col-md-6";
    } else if (visibleTabs === 3) {
      return "col-md-4";
    } else {
      return "col-md-3";
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


  const FollowersList = ({ followerNames }) => {
    if (!followerNames) return null;

    const followersArray = followerNames.split(",").map((name) => name.trim());

    return (
      <div className="flex gap-2 mt-2">
        {followersArray.map((fullName, index) => {
          const initials = fullName
            .split(" ")
            .map((word) => word.charAt(0))
            .join("")
            .toUpperCase();

          return (
            <div key={index}>
              <div
                data-tooltip-id={`tooltip-${index}`}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-500 text-white text-sm  cursor-pointer"
              >
                {initials}
              </div>
              <Tooltip id={`tooltip-${index}`} place="top" effect="solid">
                {fullName}
              </Tooltip>
            </div>
          );
        })}
      </div>
    );
  };

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

  const [parentQuote, setParentQuote] = useState(false);
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
          if (parsedQuoteInfo.length === 0) {
            setParentQuote(true);
          } else {
            setParentQuote(false);
          }
          setScopeDetails(parsedQuoteInfo); // Set the array of quotes
          setAssignQuoteInfo(data.assignQuoteInfo); // Assuming you also want to set assignQuoteInfo
          setTotalCount(data.totalCounter ? data.totalCounter : "0");
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
  const fetchAllScopeDetails = async () => {
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
          body: JSON.stringify({ ref_id: queryId, user_type: userType }), // Send the ref_id
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
          if (parsedQuoteInfo.length === 0) {
            setParentQuote(true);
          } else {
            setParentQuote(false);
          }
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
    socket.on('planCommentsEdited', (data) => {
      if (data.ref_id == queryId) {

        fetchScopeDetailsForScoket();
      }
    });

    return () => {
      socket.off('planCommentsEdited');  // Clean up on component unmount
    };
  }, []);


  useEffect(() => {
    socket.on('tagsUpdated', (data) => {
      if (data.ref_id == queryId) {
        fetchScopeDetailsForScoket();
      }
    });

    return () => {
      socket.off('tagsUpdated');  // Clean up on component unmount
    };
  }, []);

  useEffect(() => {
    socket.on('followersUpdated', (data) => {
      if (data.ref_id == queryId) {
        fetchScopeDetailsForScoket();
      }
    });

    return () => {
      socket.off('followersUpdated');  // Clean up on component unmount
    };
  }, []);

  useEffect(() => {
    socket.on('feasibilityCommentsUpdated', (data) => {
      if (data.ref_id == queryId) {
        fetchScopeDetailsForScoket();
      }
    });

    return () => {
      socket.off('feasibilityCommentsUpdated');  // Clean up on component unmount
    };
  }, []);


  useEffect(() => {
    socket.on('quotePriceUpdated', (data) => {
      if (data.ref_id == queryId) {
        fetchScopeDetailsForScoket();
      }
    });
    fetchScopeDetailsForScoket();

    return () => {
      socket.off('quotePriceUpdated');  // Clean up on component unmount
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

  const submitToAdmin = async (assign_id, quote_id, user_id, tags) => {

    if (!tags || tags == "") {
      toast.error("Please add Atleast one tag to submit");
      return;
    }
    const payload = {
      ref_id: assign_id,
      quote_id: quote_id,
      user_id: user_id,

    };

    try {
      const response = await fetch('https://apacvault.com/Webapi/submitFeasRequestToAdmintest', {
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

  const createRapidShareAccount = async () => {
    try {
      console.log(queryInfo)
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
        setShowRapidButton(false)
      } else {
        toast.error(data.message || "Failed to create RapidShare account.");
      }

    } catch (err) {
      console.error("Error creating RapidShare account:", err);
    }
  }

  const [showRapidButton, setShowRapidButton] = useState(false);

  const checkRapidShareAccount = async () => {
    try {
      if (queryInfo && queryInfo.email_id && queryInfo.website_name) {
        const response = await fetch(`https://www.rapidcollaborate.com/rapidshare/api/Api/checkAccount`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: queryInfo.email_id,
          }),
        })
        const data = await response.json();
        if (data.status && !data.value) {
          setShowRapidButton(true);
        } else {
          setShowRapidButton(false);
        }
      }
    } catch (err) {
      console.error("Error checking RapidShare account:", err);
    }
  }
  useEffect(() => {
    if (queryInfo && queryInfo.email_id && queryInfo.website_name) {
      checkRapidShareAccount();
    }
  }, [queryInfo])

  const [openClientSharedFiles, setOpenClientSharedFiles] = useState(false);

  return (
    <div className=" h-full bg-gray-100  z-50 overflow-y-auto mt-2 rounded w-full">
      <div className="flex items-center justify-between bg-blue-400 text-white py-2 px-3">
        <h2 className="text-sx font-semibold ">Ask For Scope </h2>
        <div className="flex items-center">
          {
            showRapidButton ? (
              <button
                onClick={createRapidShareAccount}
                className="flex items-center mr-2 rounded px-2 py-1 text-xs btn btn-sm bg-blue-950 text-white hover:bg-blue-900"
              >
                <Folder size={12} className="mr-1" /> Create RapidShare Account
              </button>
            ) : (
              <button
                onClick={() => { setOpenClientSharedFiles(true); }}
                className="flex items-center mr-2 rounded px-2 py-1 text-xs btn btn-sm bg-blue-950 text-white hover:bg-blue-900"
              >
                <Folder size={12} className="mr-1" /> RapidShare Account Created
                <BadgeCheck size={12} className="ml-1 text-green-600" />
              </button>
            )}
          

          <button
            onClick={fetchAllScopeDetails}
            className="flex items-center mr-2 rounded px-2 py-1 text-xs btn-light"
          >
            <Hourglass size={10} className="mr-1" /> <div>All </div>
            <span className="px-1 py-0 f-10 rounded-full bg-blue-600 text-white ml-2">
              {totalCount}
            </span>
          </button>
          <button
            disabled={tlType && tlType == 2}
            onClick={toggleAddNewForm}
            className="flex items-center mr-2 rounded px-2 py-1 text-xs btn-light line-h-in"
          >
            <PlusCircle size={15} className="mr-1" /> Add New
          </button>
          <button onClick={fetchScopeDetails}
            data-tooltip-id="my-tooltip"
            data-tooltip-content="Refresh"
            className="btn btn-dark btn-sm">
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
                            {quote.parent_quote == true && (
                              <Crown color='orange'
                                className="mr-1"
                                size={20}
                                data-tooltip-id="my-tooltip"
                                data-tooltip-content="Parent Quote" // Tooltip for Parent Quote
                              />
                            )}
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
                            {quote.callrecordingpending == 1 && (
                              <span
                                className="text-orange-600 rounded-full text-sm ml-2"
                                style={{
                                  fontSize: "11px",
                                  padding: "1px 6px",
                                }}
                              >
                                <Headset size={13} />
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
                          className="border px-2 py-2 flex items-center"
                          style={{ fontSize: "11px" }}
                        >
                          <div className="flex items-center">
                            {quote.quoteid}
                            <button
                              onClick={() => {

                                navigator.clipboard
                                  .writeText(quote.quoteid)
                                  .then(() => {
                                    toast.success("QuoteID copied to clipboard!");
                                  })
                                  .catch((err) => {
                                    console.error("Failed to copy QuoteID:", err);
                                  });
                              }}
                              className="flex items-center justify-center btn  btn-sm mr-1"
                            >
                              <Copy size={14} className="text-blue-600" />
                            </button>
                          </div>
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
                              data-tooltip-id="my-tooltip"
                              data-tooltip-content="Toggle Row"
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
                                data-tooltip-id="my-tooltip"
                                data-tooltip-content="Edit"
                                disabled={tlType && tlType == 2}
                                className="flex items-center justify-center btn btn-warning btn-sm mr-1"
                              >
                                <Pen size={14} className="text-white" />
                              </button>
                            ) : null}

                            <button
                              disabled={tlType && tlType == 2 && tagAccess != 1}
                              onClick={() => {
                                toggleHashEditForm(
                                  quote.quoteid,
                                  quote.user_id
                                );
                              }}
                              data-tooltip-id="my-tooltip"
                              data-tooltip-content="Update Tags"
                              className="flex items-center  btn btn-dark btn-sm mr-1"
                            >
                              <Hash size={14} />
                            </button>
                            <button
                              disabled={tlType && tlType == 2}
                              onClick={() => {
                                toggleFollowersForm(quote.quoteid, thisUserId);
                              }}
                              data-tooltip-id="my-tooltip"
                              data-tooltip-content="Update Followers"
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
                              data-tooltip-id="my-tooltip"
                              data-tooltip-content="Copy Quote URL"
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
                            <div className="mx-2 mt-2 mb-0 bg-gray-100 px-3 pt-3 pb-0 flex items-center justify-between">
                              <div className="">
                                <button
                                  onClick={() =>
                                    handleTabButtonClick("scope")
                                  }
                                  className={`px-2 py-1 mr-1 inline-flex items-center f-12 ${scopeTabVisible
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
                                  className={`px-2 py-1 mr-1 inline-flex items-center f-12 ${chatTabVisible
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
                                  className={`px-2 py-1 mr-1 f-12 inline-flex items-center ${feasTabVisible
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

                                <button
                                  onClick={() => handleTabButtonClick("file")}
                                  className={`px-2 py-1 mr-1 inline-flex items-center f-12 ${fileTabVisible
                                    ? "btn-info focus-outline-none"
                                    : "btn-light"
                                    } btn btn-sm`}
                                >
                                  Attached Files{" "}
                                  {fileTabVisible ? (
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
                              <div>
                                {/* display here follower nams  */}
                                <FollowersList followerNames={quote.follower_names} />
                              </div>
                            </div>
                            <div className="mx-2 mb-0 bg-gray-100 pt-3 pb-3 pl-0 pr-2 row ">
                              {scopeTabVisible && (
                                <div
                                  className={`${fullScreenTab == "scope"
                                    ? "custom-modal"
                                    : colClass
                                    }`}
                                >
                                  <div
                                    className={`${fullScreenTab == "scope"
                                      ? "custom-modal-content"
                                      : ""
                                      } `}
                                  >
                                    <div className={`  pl-0`}>
                                      <div className="py-2 px-2 flex items-center justify-between bg-blue-100">
                                        <h3 className=""><strong>Scope Details</strong></h3>
                                        <button className="">
                                          {fullScreenTab == "scope" ? (<Minimize2 size={23} onClick={() => { handlefullScreenBtnClick(null) }} className="btn btn-sm btn-danger flex items-center p-1" />) : (<Expand size={20} onClick={() => { handlefullScreenBtnClick("scope") }} className="btn btn-sm btn-light flex items-center p-1" />)}
                                        </button>
                                      </div>
                                      <div className="bg-white">
                                        <div className="overscroll-modal">
                                          <div className="space-y-2 px-0">
                                            <div className="row">
                                              {/* Ref No Section */}
                                              <div className="col-md-12">
                                                <p className=" mb-3">
                                                  <div><strong>Ref No </strong>{" "}</div>
                                                  <div className='flex items-center'>
                                                    <div className='line-h-in'>{quote.assign_id}</div>

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
                                                          fontSize: "10px",
                                                        }}
                                                      >
                                                        Edited
                                                      </span>
                                                    )}

                                                  </div>
                                                </p>

                                                {quote.tag_names && (
                                                  <div className="flex items-end  mb-3">
                                                    <p className=''>
                                                      <div className=''><strong>Tags</strong></div>
                                                      {quote.tag_names
                                                        .split(",")
                                                        .map((tag, index) => (
                                                          <span
                                                            key={index}
                                                            className="badge badge-primary f-10 mr-1"
                                                          >
                                                            # {tag.trim()}
                                                          </span>
                                                        ))}
                                                    </p>
                                                    {quote.tags_updated_time && (
                                                      <p className="text-gray-500 tenpx">
                                                        {new Date(quote.tags_updated_time).toLocaleDateString('en-US', {
                                                          day: 'numeric',
                                                          month: 'short',
                                                          year: 'numeric',
                                                          hour: 'numeric',
                                                          minute: '2-digit',
                                                          hour12: true
                                                        }).replace(',', ',')}
                                                      </p>
                                                    )}
                                                  </div>
                                                )}
                                                {quote.ptp != null && (
                                                  <div className="bg-white mb-3 rounded-lg p-3 border border-gray-300">
                                                    <h3 className="text-md font-semibold mb-2 text-gray-700">PTP Details</h3>
                                                    <div className="space-y-1 text-sm text-gray-600">
                                                      <p className="flex items-center gap-1">
                                                        <strong>PTP:</strong>
                                                        {quote.ptp === "Yes" ? (
                                                          <CheckCircle className="text-green-500 w-4 h-4" />
                                                        ) : (
                                                          <XCircle className="text-red-500 w-4 h-4" />
                                                        )}
                                                      </p>
                                                      {quote.ptp === "Yes" && quote.ptp_amount && quote.ptp_amount != 0 && (
                                                        <p>
                                                          <strong>PTP Amount:</strong> {quote.ptp_amount}
                                                        </p>
                                                      )}
                                                      {quote.ptp_comments !== "" && (
                                                        <p>
                                                          <strong>PTP Comments:</strong> {quote.ptp_comments}
                                                        </p>
                                                      )}
                                                      {quote.ptp_file != null && (
                                                        <p className="flex items-center gap-1">
                                                          <strong>Attached File:</strong>
                                                          <Paperclip className="text-blue-500 w-4 h-4" />
                                                          <a
                                                            className="text-blue-500 font-semibold hover:underline"
                                                            href={`https://apacvault.com/public/ptpfiles/${quote.ptp_file}`}
                                                            download={quote.ptpfile}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                          >
                                                            {quote.ptp_file}
                                                          </a>
                                                        </p>
                                                      )}
                                                      {quote.ptp_time && (
                                                        <div className='flex items-center justify-end'>
                                                          <p className='text-gray-500 tenpx'>
                                                            {new Date(quote.ptp_time).toLocaleDateString('en-US', {
                                                              day: 'numeric',
                                                              month: 'short',
                                                              year: 'numeric',
                                                              hour: 'numeric',
                                                              minute: '2-digit',
                                                              hour12: true
                                                            }).replace(',', ',')}
                                                          </p>
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>
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
                                                <p className="mb-2">
                                                  <strong>Plan Description</strong>
                                                </p>
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
                                                        <div className="border p-2 mb-3">
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
                                                                          fontWeight: "bold",
                                                                          color: "#007bff",
                                                                          backgroundColor: "#f0f8ff",
                                                                          padding: "5px",
                                                                          borderRadius: "5px",
                                                                          border: "1px solid #40BD5DFF",
                                                                          fontSize: "11px",
                                                                        }}
                                                                      >
                                                                        <p className="text-black">
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
                                                          {plan === "Basic" && quote.basic_edited_time && (
                                                            <p className="text-gray-500 mt-2 tenpx">
                                                              {new Date(quote.basic_edited_time).toLocaleDateString('en-US', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric',
                                                                hour: 'numeric',
                                                                minute: '2-digit',
                                                                hour12: true
                                                              }).replace(',', ',')}
                                                            </p>
                                                          )}
                                                          {plan === "Standard" && quote.standard_edited_time && (
                                                            <p className="text-gray-500 mt-2 tenpx">
                                                              {new Date(quote.standard_edited_time).toLocaleDateString('en-US', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric',
                                                                hour: 'numeric',
                                                                minute: '2-digit',
                                                                hour12: true
                                                              }).replace(',', ',')}
                                                            </p>
                                                          )}
                                                          {plan === "Advanced" && quote.advanced_edited_time && (
                                                            <p className="text-gray-500 mt-2 tenpx">
                                                              {new Date(quote.advanced_edited_time).toLocaleDateString('en-US', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric',
                                                                hour: 'numeric',
                                                                minute: '2-digit',
                                                                hour12: true
                                                              }).replace(',', ',')}
                                                            </p>
                                                          )}
                                                        </div>
                                                      </div>
                                                    )
                                                  )}
                                            </div>
                                            {quote.client_academic_level && quote.results_section && (
                                              <div class="flex gap-4 mb-3">
                                                <div class="flex items-center px-1 py-1 bg-blue-100 border-l-4 border-blue-500 text-blue-900 shadow-md rounded-lg"
                                                  x-show="quote.client_academic_level">
                                                  <div>
                                                    <img src={academic} className='h-5 w-5' />
                                                  </div>
                                                  <div className='px-2'>
                                                    <h3 class="text-md font-semibold">Academic Level</h3>
                                                    <p class="text-sm">{quote.client_academic_level}</p>
                                                  </div>
                                                </div>

                                                <div class="flex items-center px-1 py-1 bg-green-100 border-l-4 border-green-500 text-green-900 shadow-md rounded-lg"
                                                  x-show="quote.results_section">
                                                  <div>
                                                    <img src={experiment} className='h-5 w-5' />
                                                  </div>
                                                  <div className='px-2'>
                                                    <h3 class="text-md font-semibold">Results Section</h3>
                                                    <p class="text-sm">{quote.results_section}</p>
                                                  </div>
                                                </div>
                                              </div>
                                            )}

                                            <div className="mb-0 mt-0 row px-2 pb-3 space-y-2">
                                              {quote.comments &&
                                                quote.comments != "" &&
                                                quote.comments != null && (
                                                  <p className='mb-2'>
                                                    <strong
                                                      style={{
                                                        fontSize: "12px",
                                                      }}
                                                    >
                                                      Additional Comments
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
                                                  <div className="my-2 rounded border p-2">
                                                    <table className="w-full border-collapse " style={{ fontSize: "12px" }}>
                                                      <thead>
                                                        <tr className="bg-gray-50">
                                                          <th className="border px-3 py-2 text-left">Plan Type</th>
                                                          <th className="border px-3 py-2 text-left">Price Details</th>
                                                        </tr>
                                                      </thead>
                                                      <tbody>
                                                        {/* Old Plan Price Row */}
                                                        {quote.old_plan && quote.plan != quote.old_plan && (
                                                          <tr className="border-b">
                                                            <td className="border px-1 py-2">
                                                              <strong>Initial Plan Price</strong>
                                                            </td>
                                                            <td className={`border px-1 py-2 flex flex-col space-y-1`}

                                                            >
                                                              {(() => {
                                                                const prices = quote.quote_price.split(",");
                                                                const plans = quote.old_plan.split(",");
                                                                return plans.map((plan, index) => (
                                                                  <span key={index} className=" bg-gray-100 px-2 py-1 rounded mr-2 text-gray-600"
                                                                    style={{ textAlign: colClass == 'col-md-4' ? 'left' : 'center', width: colClass == 'col-md-4' ? '90%' : '' }}
                                                                  >
                                                                    <p className="line-through">
                                                                      {plan}: {quote.currency == "Other" ? quote.other_currency : quote.currency} {prices[index] ? prices[index] : 0}
                                                                      {quote.mp_price === plan && " (MP Price)"}
                                                                    </p>
                                                                    {quote.new_comments && (() => {
                                                                      let parsedComments;
                                                                      try {
                                                                        parsedComments = JSON.parse(quote.new_comments); // Parse JSON string to object
                                                                      } catch (error) {
                                                                        console.error("Invalid JSON format:", error);
                                                                        return null;
                                                                      }

                                                                      return Object.entries(parsedComments)
                                                                        .filter(([_, value]) => value.trim() !== "") // Remove empty values
                                                                        .map(([key, value]) => (
                                                                          key == plan ? (
                                                                            <p key={key} className="text-black text-sm" style={{ fontSize: "11px", textDecoration: "none !important", }}>
                                                                              {value}
                                                                            </p>
                                                                          ) : null

                                                                        ));
                                                                    })()}
                                                                  </span>
                                                                ));
                                                              })()}
                                                            </td>

                                                          </tr>
                                                        )}

                                                        {quote.plan && quote.quote_status == 2 && !quote.discount_price && (!quote.old_plan || (quote.plan == quote.old_plan)) && (
                                                          <tr className="border-b">
                                                            <td className="border px-1 py-2">
                                                              <strong>Plan Price</strong>
                                                            </td>
                                                            <td className={`border px-1 py-2 flex flex-col space-y-1`}

                                                            >
                                                              {(() => {
                                                                const prices = quote.quote_price.split(",");
                                                                const plans = quote.old_plan.split(",");
                                                                return plans.map((plan, index) => (
                                                                  <span key={index} className=" bg-gray-100 px-2 py-1 rounded mr-2 text-gray-600"
                                                                    style={{ textAlign: colClass == 'col-md-4' ? 'left' : 'center', width: colClass == 'col-md-4' ? '90%' : '' }}
                                                                  >
                                                                    <p className="line-through">
                                                                      {plan}: {quote.currency == "Other" ? quote.other_currency : quote.currency} {prices[index] ? prices[index] : 0}
                                                                      {quote.mp_price === plan && " (MP Price)"}
                                                                    </p>
                                                                    {quote.new_comments && (() => {
                                                                      let parsedComments;
                                                                      try {
                                                                        parsedComments = JSON.parse(quote.new_comments); // Parse JSON string to object
                                                                      } catch (error) {
                                                                        console.error("Invalid JSON format:", error);
                                                                        return null;
                                                                      }

                                                                      return Object.entries(parsedComments)
                                                                        .filter(([_, value]) => value.trim() !== "") // Remove empty values
                                                                        .map(([key, value]) => (
                                                                          key == plan ? (
                                                                            <p key={key} className="text-black text-sm" style={{ fontSize: "11px", textDecoration: "none !important" }}>
                                                                              {value}
                                                                            </p>
                                                                          ) : null

                                                                        ));
                                                                    })()}
                                                                  </span>
                                                                ));
                                                              })()}

                                                            </td>

                                                          </tr>
                                                        )}

                                                        {/* Current Quote Price Row */}
                                                        {quote.quote_status != 2 && !quote.discount_price && (
                                                          <tr className="border-b">
                                                            <td className="border px-1 py-2">
                                                              <strong>Quote Price </strong>
                                                            </td>
                                                            <td className={`border px-1 py-2 flex flex-col space-y-1`}

                                                            >
                                                              {(() => {
                                                                const prices = quote.quote_price.split(",");
                                                                const plans = quote.plan.split(",");
                                                                return plans.map((plan, index) => (
                                                                  <span
                                                                    key={index}
                                                                    className={`${quote.discount_price != null ? '' : ''} ruby px-1 py-1 f-12 rounded mr-1`}
                                                                    style={{ textAlign: colClass == 'col-md-4' ? 'left' : '', width: colClass == 'col-md-4' ? '90%' : '' }}
                                                                  >
                                                                    <p className={`${quote.discount_price != null ? 'line-through' : ''}}`}>
                                                                      {plan}: {quote.currency == "Other" ? quote.other_currency : quote.currency} {prices[index] ? prices[index] : 0}
                                                                      {quote.mp_price === plan && " (MP Price)"}
                                                                    </p>
                                                                    {quote.new_comments && (() => {
                                                                      let parsedComments;
                                                                      try {
                                                                        parsedComments = JSON.parse(quote.new_comments); // Parse JSON string to object
                                                                      } catch (error) {
                                                                        console.error("Invalid JSON format:", error);
                                                                        return null;
                                                                      }

                                                                      return Object.entries(parsedComments)
                                                                        .filter(([_, value]) => value.trim() !== "") // Remove empty values
                                                                        .map(([key, value]) => (
                                                                          key == plan ? (
                                                                            <p key={key} className="text-black text-sm" style={{ fontSize: "11px", textDecoration: "none !important" }}>
                                                                              {value}
                                                                            </p>
                                                                          ) : null

                                                                        ));
                                                                    })()}
                                                                  </span>
                                                                ));
                                                              })()}
                                                            </td>

                                                          </tr>
                                                        )}

                                                        {/* Discounted Price Row */}
                                                        {quote.discount_price && (
                                                          <tr className="border-b">
                                                            <td className="border px-1 py-2">
                                                              <strong>Discounted Price</strong>
                                                            </td>
                                                            <td className={`border px-1 py-2 flex flex-col space-y-1`}

                                                            >
                                                              {(() => {
                                                                const prices = quote.discount_price.split(",");
                                                                const plans = quote.plan.split(",");
                                                                return plans.map((plan, index) => (
                                                                  <span key={index} className="silver px-1 py-1 f-12 rounded mr-1"
                                                                    style={{ textAlign: colClass == 'col-md-4' ? 'left' : '', width: colClass == 'col-md-4' ? '90%' : '' }}
                                                                  >
                                                                    {plan}: {quote.currency == "Other" ? quote.other_currency : quote.currency} {prices[index] ?? 0}
                                                                    {quote.mp_price === plan && " (MP Price)"}

                                                                    {quote.new_comments && (() => {
                                                                      let parsedComments;
                                                                      try {
                                                                        parsedComments = JSON.parse(quote.new_comments); // Parse JSON string to object
                                                                      } catch (error) {
                                                                        console.error("Invalid JSON format:", error);
                                                                        return null;
                                                                      }

                                                                      return Object.entries(parsedComments)
                                                                        .filter(([_, value]) => value.trim() !== "") // Remove empty values
                                                                        .map(([key, value]) => (
                                                                          key == plan ? (
                                                                            <p key={key} className="text-black text-sm" style={{ fontSize: "11px", textDecoration: "none !important" }}>
                                                                              {value}
                                                                            </p>
                                                                          ) : null

                                                                        ));
                                                                    })()}
                                                                  </span>
                                                                ));
                                                              })()}
                                                            </td>


                                                          </tr>
                                                        )}

                                                        {/* Final Price Row */}
                                                        {quote.final_price && (
                                                          <tr>
                                                            <td className="border px-1 py-2">
                                                              <strong>Final Price</strong>
                                                            </td>
                                                            <td className={`border px-1 py-2 flex flex-col space-y-1`}

                                                            >
                                                              {(() => {
                                                                const prices = quote.final_price.split(",");
                                                                const plans = quote.plan.split(",");
                                                                return plans.map((plan, index) => (
                                                                  <span key={index} className="gold px-1 py-1 f-12 rounded mr-1"
                                                                    style={{ textAlign: colClass == 'col-md-4' ? 'left' : '', width: colClass == 'col-md-4' ? '90%' : '' }}
                                                                  >
                                                                    {plan}: {quote.currency == "Other" ? quote.other_currency : quote.currency} {prices[index]}
                                                                    {quote.new_comments && (() => {
                                                                      let parsedComments;
                                                                      try {
                                                                        parsedComments = JSON.parse(quote.new_comments); // Parse JSON string to object
                                                                      } catch (error) {
                                                                        console.error("Invalid JSON format:", error);
                                                                        return null;
                                                                      }

                                                                      return Object.entries(parsedComments)
                                                                        .filter(([_, value]) => value.trim() !== "") // Remove empty values
                                                                        .map(([key, value]) => (
                                                                          key == plan ? (
                                                                            <p key={key} className="text-black text-sm" style={{ fontSize: "11px", textDecoration: "none !important" }}>
                                                                              {value}
                                                                            </p>
                                                                          ) : null

                                                                        ));
                                                                    })()}
                                                                  </span>
                                                                ));
                                                              })()}
                                                            </td>
                                                          </tr>
                                                        )}
                                                      </tbody>
                                                    </table>



                                                    {quote.quote_time && (
                                                      <div className='flex items-center justify-end'>
                                                        <p className='text-gray-500 tenpx'>
                                                          {new Date(quote.quote_time).toLocaleDateString('en-US', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                            hour: 'numeric',
                                                            minute: '2-digit',
                                                            hour12: true
                                                          }).replace(',', ',')}
                                                        </p>
                                                      </div>
                                                    )}
                                                  </div>
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
                                              <div>

                                                <CallRecordingPending
                                                  scopeDetails={quote}
                                                  quoteId={quote.quoteid}
                                                  after={
                                                    fetchScopeDetails
                                                  }
                                                />

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
                                                                quote.user_id,
                                                                quote.tags
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
                                  className={`${fullScreenTab == "chat"
                                    ? "custom-modal"
                                    : colClass
                                    } p-0`}
                                >
                                  <div
                                    className={`${fullScreenTab == "chat"
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
                                  className={`${fullScreenTab == "feas"
                                    ? "custom-modal"
                                    : colClass
                                    }`}
                                >
                                  <div
                                    className={`${fullScreenTab == "feas"
                                      ? "custom-modal-content"
                                      : ""
                                      }`}
                                  >
                                    <div className={` pr-0`}>
                                      <div className="bg-white">
                                        <>
                                          <div className="py-2 px-2 flex items-center justify-between bg-blue-100">
                                            <h3 className=""><strong>Feasibility</strong></h3>
                                            <div className='flex items-center'>

                                              <button className="">
                                                {fullScreenTab == "feas" ? (<Minimize2 size={23} onClick={() => { handlefullScreenBtnClick(null) }} className="btn btn-sm btn-light flex items-center p-1" />) : (<Expand size={20} onClick={() => { handlefullScreenBtnClick("feas") }} className="btn btn-sm btn-light flex items-center p-1" />)}
                                              </button>
                                            </div>
                                          </div>

                                          {quote.feasability_status ==
                                            "Completed" && (
                                              <>
                                                <div className="px-3 pt-3 pb-0">
                                                  <p
                                                    style={{
                                                      textDecoration: "italic",
                                                    }}
                                                    className="italic px-0 f-12"
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
                                                </div>
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
                                          <div className="p-3">
                                            <MergedHistoryComponentNew
                                              quoteId={quote.quoteid}
                                              refId={quote.assign_id}
                                              onlyFetch="feasibility"
                                            />
                                          </div>
                                        </>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {fileTabVisible && (
                                <div
                                  className={`${fullScreenTab == "file"
                                    ? "custom-modal"
                                    : colClass
                                    }`}
                                >
                                  <div
                                    className={`${fullScreenTab == "file"
                                      ? "custom-modal-content"
                                      : ""
                                      }`}
                                  >
                                    <div className={` pr-0`}>
                                      <div className="bg-white">
                                        <>
                                          <div className="py-2 px-2 flex items-center justify-between bg-blue-100">
                                            <h3 className=""><strong>Attached Files</strong></h3>
                                            <div className='flex items-center n-gap-3 '>
                                              {!showUpload && (
                                                <button
                                                  onClick={() => setShowUpload(true)}
                                                  className="btn btn-info btn-sm f-11 flex items-center px-2 n-py-1"
                                                >
                                                  <Upload className="mr-1" size={10} /> Attach more file
                                                </button>
                                              )}

                                              <button className="">
                                                {fullScreenTab == "file" ? (<Minimize2 size={23} onClick={() => { handlefullScreenBtnClick(null) }} className="btn btn-sm btn-light flex items-center p-1" />) : (<Expand size={20} onClick={() => { handlefullScreenBtnClick("file") }} className="btn btn-sm btn-light flex items-center p-1" />)}
                                              </button>
                                            </div>
                                          </div>

                                          <AttachedFiles 
                                            ref_id={quote.assign_id}
                                            relevant_file={quote.relevant_file}
                                            quote={quote}
                                            showUpload={showUpload}
                                            setShowUpload={changeShowUpload}

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
                parentQuote={parentQuote}
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
            {openClientSharedFiles && (
              <UserAccounts queryInfo={queryInfo} onClose={() => { setOpenClientSharedFiles(false) }}  />
              // <ClientSharedFiles queryInfo={queryInfo} onClose={() => { setOpenClientSharedFiles(false) }} />
            )}
          </AnimatePresence>
          <Tooltip id="my-tooltip" />
        </div>
      )}
    </div>
  );
};

export default AskForScope;