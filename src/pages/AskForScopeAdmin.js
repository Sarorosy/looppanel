import React, { useState, useEffect, useMemo } from "react";
import './modalStyles.css';
import toast from "react-hot-toast";
import CustomLoader from "../CustomLoader";
import { Chat } from "./Chat";
import {
  ArrowDown,
  ArrowUp,
  History,
  CheckCircle,
  CheckCircle2,
  Paperclip,
  Hash,
  RefreshCcw,
  PlusCircle,
  Hourglass,
  CirclePause,
  CircleCheck,
  Bell,
  UserRoundPlus,
  Settings2,
  Pencil,
  ArrowLeftRight,
  Eye,
  Expand,
  Minimize2,
  X,
  EyeClosed,
  Pen,
  CircleUserRound,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import AddTags from "./AddTags";
import HistorySideBar from "./HistorySideBar";
import FeasHistorySideBar from "./FeasHistorySideBar";
import AllRequestSideBar from "./AllRequestSideBar";
import ClientEmailSideBar from "./ClientEmailSideBar";
import AddFollowers from "./AddFollowers";
import { io } from "socket.io-client";
import EditRequestForm from "./EditRequestForm";
import EditPriceComponent from "./EditPriceComponent";
import EditFeasibilityCommentsComponent from "./EditFeasabilityCommentsComponent";
import CompleteFeasability from "./CompleteFeasability";
import MergedHistoryComponent from "./MergedHistoryComponent";
import ScopeLoader from "./ScopeLoader";
import { getSocket } from "./Socket";
import ReactTooltip, { Tooltip } from "react-tooltip";
import MergedHistoryComponentNew from "./MergedHistoryComponentNew";
import EditCommentsComponent from "./EditCommentsComponent";

const AskForScopeAdmin = ({
  queryId,
  userType,
  quotationId,
  viewAll,
  clientEmail,
  info
}) => {
  const socket = getSocket();
  const [scopeDetails, setScopeDetails] = useState(null);
  const [assignQuoteInfo, setAssignQuoteInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [quotePrice, setQuotePrice] = useState("");
  const [userComments, setUserComments] = useState("");
  const [ConsultantUserData, setConsultantUserData] = useState([]);
  const [quoteAmount, setQuoteAmount] = useState("");
  const [totalCount, setTotalCount] = useState("0");
  const [amounts, setAmounts] = useState({});
  const [comment, setComment] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [adminComments, setAdminComments] = useState("");
  const [expandedRowIndex, setExpandedRowIndex] = useState(0);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [editingFormOpen, setEditingFormOpen] = useState(false);
  const [feascommentseditingFormOpen, setFeasCommentsEditingFormOpen] =
    useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState("");
  const [selectedRefId, setSelectedRefId] = useState("");
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [userIdForTag, setUserIdForTag] = useState("");
  const [isFeasabilityCompleted, setIsFeasabilityCompleted] = useState(null);
  const [refIds, setRefIds] = useState([]);
  const [clientEmailDivOpen, setClientEmailDivOpen] = useState(false);
  const [followersFormOpen, setFollowersFormOpen] = useState(false);
  const [completeFeasabilityDiv, setCompleteFeasabilityDiv] = useState(false);
  const [selectedMP, setSelectedMP] = useState("");

  const [commentEditFormOpen, setCommentEditFormOpen] = useState(false);
  const [commentQuote, setCommentQuote] = useState(null);
  const [commentPlan, setCommentPlan] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentWordCount, setCommentWordCount] = useState(null);


  const [selectedAllReqRefId, setSelectedAllReqRefId] = useState("");
  const [allRequestDivOpen, setAllRequestDivOpen] = useState(false);

  const [historyPanelOpen, SetHistoryPanelOpen] = useState(false);
  const [quoteIdForHistory, setQuoteIdForHistory] = useState("");

  const [feasHistoryPanelOpen, SetFeasHistoryPanelOpen] = useState(false);
  const [quoteIdForFeasHistory, setQuoteIdForFeasHistory] = useState("");
  const [refIdForFeasHistory, setRefIdForFeasHistory] = useState("");

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

  const handlefullScreenBtnClick = (tab) => {
    if (tab == "scope") {
      // setChatTabVisible(false);
      // setFeasTabVisible(false);
      // setScopeTabVisible(true);
      setFullScreenTab("scope")
    } else if (tab == "chat") {
      // setChatTabVisible(true);
      // setFeasTabVisible(false);
      // setScopeTabVisible(false);
      setFullScreenTab("chat")
    } else if (tab == "feas") {
      // setChatTabVisible(false);
      // setFeasTabVisible(true);
      // setScopeTabVisible(false);
      setFullScreenTab("feas")
    } else {
      setFullScreenTab(null)
    }
  }

  const handleMPChange = (plan) => {
    setSelectedMP(selectedMP === plan ? "" : plan); // Toggle selection
  };

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

  const loopuserData = localStorage.getItem("loopuser");
  const loopUserObject = JSON.parse(loopuserData);

  const thisUserId = loopUserObject.id;

  const toggleAllRequestDiv = () => {
    setSelectedAllReqRefId(queryId);
    setAllRequestDivOpen((prev) => !prev);
  };

  const toggleHistoryDiv = ($id) => {
    setQuoteIdForHistory($id);
    SetHistoryPanelOpen(true);
  };
  const toggleClientEmailDiv = () => {
    setClientEmailDivOpen((prev) => !prev);
  };
  const toggleFollowersForm = (id, user_id) => {
    setSelectedQuoteId(id);
    setUserIdForTag(user_id);
    setFollowersFormOpen((prev) => !prev);
  };
  const toggleCompleteFeasability = (id, ref_id, user_id) => {
    setSelectedQuoteId(id);
    setSelectedRefId(ref_id);
    setSelectedUser(user_id);
    setCompleteFeasabilityDiv((prev) => !prev);
  };

  const toggleFeasHistoyDiv = (assign_id, quote_id) => {
    setQuoteIdForFeasHistory(quote_id);
    setRefIdForFeasHistory(assign_id);
    SetFeasHistoryPanelOpen((prev) => !prev);
  };

  const numberToWords = (num) => {
    const toWords = require("number-to-words");
    return toWords.toWords(Number(num));
  };

  const toggleRow = (index) => {
    setExpandedRowIndex(expandedRowIndex === index ? null : index);
  };
  const fetchScopeDetails = async () => {
    setLoading(true); // Show loading spinner
    let hasResponse = false;
    try {
      const response = await fetch(
        "https://apacvault.com/Webapi/adminScopeDetails",
        {
          method: "POST", // Use POST method
          headers: {
            "Content-Type": "application/json", // Set content type to JSON
          },
          body: JSON.stringify({
            ref_id: queryId,
            user_type: userType,
            quote_id: quotationId,
          }),
        }
      );

      const data = await response.json(); // Parse the response as JSON
      console.log(data);
      if (data.status) {
        if (data.quoteInfo != null && Array.isArray(data.quoteInfo)) {
          const parsedQuoteInfo = data.quoteInfo.map((quote) => ({
            ...quote,
            relevant_file: quote.relevant_file
              ? JSON.parse(quote.relevant_file)
              : [], // Parse the file data if present
          }));

          setScopeDetails(parsedQuoteInfo); // Set the array of quotes
          setAssignQuoteInfo(data.assignQuoteInfo); // Assuming you also want to set assignQuoteInfo
          setTotalCount(data.totalCounter ? data.totalCounter : "0");
          setIsFeasabilityCompleted(
            data.isFeasabilityCompleted ? data.isFeasabilityCompleted : null
          );
        } else {
          setScopeDetails(null); // If no quoteInfo, set scopeDetails to null
        }
      } else {
        console.error("Failed to fetch Details:", data.message);
      }
      hasResponse = true;
    } catch (error) {
      console.error("Error fetching details:", error);
    } finally {
      if (hasResponse) {
        setLoading(false); // Hide the loader
        fetchAllRefIds();
      }
    }
  };

  const fetchScopeDetailsForSocket = async () => {
    try {
      const response = await fetch(
        "https://apacvault.com/Webapi/adminScopeDetails",
        {
          method: "POST", // Use POST method
          headers: {
            "Content-Type": "application/json", // Set content type to JSON
          },
          body: JSON.stringify({
            ref_id: queryId,
            user_type: userType,
            quote_id: quotationId,
          }),
        }
      );

      const data = await response.json(); // Parse the response as JSON
      console.log(data);
      if (data.status) {
        if (data.quoteInfo != null && Array.isArray(data.quoteInfo)) {
          const parsedQuoteInfo = data.quoteInfo.map((quote) => ({
            ...quote,
            relevant_file: quote.relevant_file
              ? JSON.parse(quote.relevant_file)
              : [], // Parse the file data if present
          }));

          setScopeDetails(parsedQuoteInfo); // Set the array of quotes
          setAssignQuoteInfo(data.assignQuoteInfo); // Assuming you also want to set assignQuoteInfo
          setTotalCount(data.totalCounter ? data.totalCounter : "0");
          setIsFeasabilityCompleted(
            data.isFeasabilityCompleted ? data.isFeasabilityCompleted : null
          );
        } else {
          setScopeDetails(null); // If no quoteInfo, set scopeDetails to null
        }
      } else {
        console.error("Failed to fetch Details:", data.message);
      }
    } catch (error) {
      console.error("Error fetching details:", error);
    }
  };

  const fetchAllScopeDetails = async () => {
    setLoading(true); // Show loading spinner
    let hasResponse = false;
    try {
      const response = await fetch(
        "https://apacvault.com/Webapi/adminScopeDetails",
        {
          method: "POST", // Use POST method
          headers: {
            "Content-Type": "application/json", // Set content type to JSON
          },
          body: JSON.stringify({ ref_id: queryId, user_type: userType }),
        }
      );

      const data = await response.json(); // Parse the response as JSON
      console.log(data);
      if (data.status) {
        if (data.quoteInfo != null && Array.isArray(data.quoteInfo)) {
          const parsedQuoteInfo = data.quoteInfo.map((quote) => ({
            ...quote,
            relevant_file: quote.relevant_file
              ? JSON.parse(quote.relevant_file)
              : [], // Parse the file data if present
          }));
          setTotalCount(data.totalCounter ? data.totalCounter : "0");

          setScopeDetails(parsedQuoteInfo); // Set the array of quotes
          setAssignQuoteInfo(data.assignQuoteInfo); // Assuming you also want to set assignQuoteInfo
        } else {
          setScopeDetails(null); // If no quoteInfo, set scopeDetails to null
        }
      } else {
        console.error("Failed to fetch Details:", data.message);
      }
      hasResponse = true;
    } catch (error) {
      console.error("Error fetching details:", error);
    } finally {
      if (hasResponse) {
        setLoading(false); // Hide the loader
      }
    }
  };

  const updatePriceQuote = async () => {
    const data = {
      task_id: assignQuoteInfo.id,
      quoteid: assignQuoteInfo.quote_id,
      quote_price: quotePrice,
      user_comments: userComments,
    };

    try {
      // Show loading spinner
      setPriceLoading(true);

      const response = await fetch(
        "https://instacrm.rapidcollaborate.com/api/updatepricequote",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // Set content type to JSON
          },
          body: JSON.stringify(data), // Send the data as JSON
        }
      );

      const responseData = await response.json(); // Parse the response as JSON

      if (response.ok) {
        toast.success("Quote price updated successfully");
        setTimeout(() => {
          fetchScopeDetails();
        }, 800);
      } else {
        toast.error("Failed to update quote price");
      }
    } catch (error) {
      console.error("Error updating price quote:", error);
    } finally {
      // Hide loading spinner
      setPriceLoading(false);
    }
  };

  const toggleEditForm = (id, user_id) => {
    setSelectedQuoteId(id);
    setUserIdForTag(user_id);
    setEditFormOpen((prev) => !prev);
  };
  const toggleEditingForm = (id) => {
    setSelectedQuoteId(id);
    setEditingFormOpen((prev) => !prev);
  };
  const toggleFeasCommentsEditingForm = (id) => {
    setSelectedQuoteId(id);
    setFeasCommentsEditingFormOpen((prev) => !prev);
  };

  const handleAmountChange = (e, plan) => {
    const value = e.target.value;

    setAmounts((prevAmounts) => {
      return {
        ...prevAmounts,
        [plan]: value, // Update the amount for the specific plan
      };
    });
  };

  const fetchAllRefIds = async () => {
    try {
      const response = await fetch(
        "https://apacvault.com/webapi/selectallrefids/",
        {
          method: "POST", // Use POST method
          headers: {
            "Content-Type": "application/json", // Set content type to JSON
          },
          body: JSON.stringify({ email: clientEmail }), // Send client email
        }
      );

      const data = await response.json(); // Parse the response as JSON
      console.log("all refids " + data.ref_ids);

      if (data.status) {
        if (data.ref_ids && Array.isArray(data.ref_ids)) {
          setRefIds(data.ref_ids); // Store ref_ids array in state
        } else {
          setRefIds([]); // If no ref_ids, set an empty array
        }
      } else {
        console.error("Failed to fetch ref_ids:", data.message);
      }
    } catch (error) {
      console.error("Error fetching ref_ids:", error);
    }
  };

  useEffect(() => {
    socket.on("feasabilityDone", (data) => {
      if (data.quote_id == quotationId) {
        fetchScopeDetailsForSocket();
      }
    });

    return () => {
      socket.off("feasabilityDone"); // Clean up on component unmount
    };
  }, []);

  const PriceSubmitValidate = async (refId, quoteId, plans, userId) => {
    const form = document.getElementById("submitQuoteForm");

    // Define the amount variables
    const basicAmount =
      document.getElementById("amount_Basic")?.value.trim() || "0";
    const standardAmount =
      document.getElementById("amount_Standard")?.value.trim() || "0";
    const advancedAmount =
      document.getElementById("amount_Advanced")?.value.trim() || "0";

    // Create a map for plan amounts
    const planAmountMap = {
      Basic: basicAmount,
      Standard: standardAmount,
      Advanced: advancedAmount,
    };

    // Filter the selected plans and join the corresponding amounts
    const quoteAmount = plans
      .split(",") // Split the comma-separated plans
      .map((plan) => planAmountMap[plan] || "0") // Get corresponding amounts, defaulting to "0"
      .join(",");

    try {
      // Show loading spinner
      setQuoteLoading(true);

      const response = await fetch(
        "https://apacvault.com/Webapi/submittedtoadminquote",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ref_id: refId,
            quote_id: quoteId,
            quote_amount: quoteAmount,
            user_id: loopUserObject.id,
            mp_price : selectedMP,
            comment: comment,
          }), // Send the data as JSON
        }
      );

      const responseData = await response.json(); // Parse the response as JSON

      if (response.ok) {
        setTimeout(() => {
          fetchScopeDetails();
        }, 800);
        form.reset();
        document.getElementById("amount_Basic").value = "0";
        document.getElementById("amount_Standard").value = "0";
        document.getElementById("amount_Advanced").value = "0";
        setComment("");
        socket.emit("quoteSubmitted", {
          quote_id: quoteId,
          ref_id: refId,
          user_id: userId,
        });
      } else {
        toast.error("Failed to update quote price");
      }
    } catch (error) {
      console.error("Error updating price quote:", error);
    } finally {
      // Hide loading spinner
      setQuoteLoading(false);
    }
  };

  const ValidateAssignTask = async () => {
    if (!selectedUser || !adminComments) {
      toast.error("Please select a user and provide comments");
      return; // Prevent form submission if validation fails
    }
    const data = {
      ref_id: scopeDetails.ref_id,
      quote_id: scopeDetails.id,
      assign_to_userid: selectedUser,
      admin_comments: adminComments,
    };

    try {
      // Show loading spinner
      setAssignLoading(true);

      const response = await fetch(
        "https://instacrm.rapidcollaborate.com/api/submitassignquote",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // Set content type to JSON
          },
          body: JSON.stringify(data), // Send the data as JSON
        }
      );

      const responseData = await response.json(); // Parse the response as JSON

      if (response.ok) {
        toast.success("Quote price updated successfully");
      } else {
        toast.error("Failed to update quote price");
      }
    } catch (error) {
      console.error("Error updating price quote:", error);
      toast.error("Error updating quote price");
    } finally {
      // Hide loading spinner
      setAssignLoading(false);
    }
  };

  useEffect(() => {
    if (queryId) {
      fetchScopeDetails(); // Fetch the scope details when the component mounts
    }
  }, [queryId]);

  useEffect(() => {
    socket.on("discountReceived", (data) => {
      if (data.quote_id == quotationId) {
        fetchScopeDetailsForSocket();
      }
    });

    return () => {
      socket.off("discountReceived"); // Clean up on component unmount
    };
  }, []);

  useEffect(() => {
    socket.on("demoDone", (data) => {
      if (data.ref_id == queryId) {
        fetchScopeDetailsForSocket();
      }
    });

    return () => {
      socket.off("demoDone"); // Clean up on component unmount
    };
  }, []);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000); // Convert Unix timestamp to Date object
    return date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return "Pending";
      case 1:
        return "Submitted";
      default:
        return "Unknown";
    }
  };
  function capitalizeFirstLetter(str) {
    if (typeof str !== 'string') return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const handleEditClick = (quote, plan, comment) => {
    //console.log("Quote Ref ID:", quote.assign_id);
    //console.log("Quote ID:", quote.quoteid);
    //console.log("Plan:", plan);
    //console.log("Comment:", comment);

    const planComments = typeof quote.plan_comments === "string" ? JSON.parse(quote.plan_comments) : quote.plan_comments;
    const wordCounts = quote.word_counts && typeof quote.word_counts === "string" ? JSON.parse(quote.word_counts) : quote.word_counts;

    //console.log("Plan Comments for Selected Plan:", planComments[plan]);
    //console.log("Word Count for Selected Plan:", wordCounts ? wordCounts[plan] : null);

    setCommentQuote(quote);
    setCommentPlan(plan);
    setCommentText(planComments[plan]);
    setCommentWordCount(wordCounts ? wordCounts[plan] : null);
    setCommentEditFormOpen(true);

  };



  const referenceUrl = `https://instacrm.rapidcollaborate.com/managequote/view-askforscope/${scopeDetails?.ref_id}`;

  const handleUserChange = (event) => {
    setSelectedUser(event.target.value); // Update the state with selected user ID
  };

  return (
    <div className=" h-full bg-gray-100  z-50 overflow-y-auto mt-2 rounded w-full">
      <div className="flex items-center justify-between bg-blue-400 text-white py-2 px-3">
        <div className="flex items-center space-x-2">
          <h2 className="text-sx font-semibold ">Ask For Scope </h2>
          <div className="badge badge-light flex items-center" title="Client Name">
            <CircleUserRound size={15} className="mr-2" />
            {info.name ?? 'Loading..'}
          </div>
        </div>
        <div className="flex items-center">
          {refIds && refIds.length > 0 && (
            <div
              title="You have new RefIds"
              className="cursor-pointer flex items-center mx-2 px-2 py-1 rounded-full"
              onClick={toggleClientEmailDiv}
            >
              <Bell size={20} className="text-yellocol-md-30" />
            </div>
          )}
          {isFeasabilityCompleted && isFeasabilityCompleted != null && (
            <p
              className={`cursor-help text-xs flex items-center mx-2 px-2 py-1 rounded ${isFeasabilityCompleted.feasability_status === "Pending"
                  ? "bg-orange-100 text-orange-500"
                  : "bg-green-100 text-green-600"
                }`}
              title={`${isFeasabilityCompleted.feasability_status === "Pending"
                  ? "Feasibility is Pending for his RefId"
                  : "Feasibility has been completed for this RefId"
                }`}
            >
              Feasibility{" "}
              {isFeasabilityCompleted.feasability_status == "Pending" ? (
                <CirclePause size={18} className="ml-2 text-orange-500" />
              ) : (
                <CircleCheck size={18} className="ml-2 text-green-700" />
              )}
            </p>
          )}
          {viewAll && (
            <button
              onClick={fetchAllScopeDetails}
              className="flex items-center mr-2 rounded px-2 py-1 text-xs btn-light"
            >
              <Hourglass size={10} className="mr-1" /> <div>All </div>
              <span className="px-1 py-0 f-10 rounded-full bg-blue-600 text-white ml-2">
                {totalCount}
              </span>
            </button>
          )}
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

          {scopeDetails && scopeDetails.length > 0 && (
            <div>
              {/* Table Header */}
              <table className="w-full border-collapse border border-gray-200 f-14">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-2 text-left">Ref No.</th>
                    <th className="border px-2 py-2 text-left">Quote Id.</th>
                    <th className="border px-2 py-2 text-left">Currency</th>
                    <th className="border px-2 py-2 text-left">Plan</th>
                    <th className="border px-2 py-2 text-left">Service Name</th>
                    <th className="border px-2 py-2 text-left">Quote Status</th>
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
                          className="border px-2 py-2"
                          style={{ fontSize: "11px" }}
                        >
                          <p className="flex items-center">
                            {quote.assign_id}
                            {quote.ptp == "Yes" && (
                              <span
                                className="inline-block pl-3 pr-2 py-1 f-10 ml-1" // Increased padding for more space
                                style={{
                                  backgroundColor: "#2B9758FF", // Green color for PTP
                                  clipPath:
                                    "polygon(25% 0%, 100% 0, 100% 99%, 25% 100%, 0% 50%)",
                                  color: "#ffffff",
                                  fontSize: "14px", // Increased font size for better visibility
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
                                style={{ fontSize: "11px", padding: "1px 6px" }}
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
                          <span
                            className={
                              quote.quote_status == 0
                                ? "text-red-600" // Pending - Red
                                : quote.quote_status == 1
                                  ? "text-green-600" // Submitted - Green
                                  : quote.quote_status == 2
                                    ? "text-yellow-600" // Discount Requested - Yellow
                                    : "text-gray-600" // Default - Gray for Unknown
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
                          {quote.isfeasability == 1 &&
                            quote.feasability_status == "Completed" && (
                              <>
                                <br />
                                <span
                                  className="text-green-700 text-sm mr-1"
                                  style={{ fontSize: "11px" }}
                                >
                                  Feasibility Completed
                                </span>
                              </>
                            )}
                          {quote.isfeasability == 1 &&
                            quote.feasability_status == "Pending" && (
                              <>
                                <br />
                                <span
                                  className="text-red-700 text-sm font-bold mr-1"
                                  style={{ fontSize: "11px" }}
                                >
                                  Feasibility Pending
                                </span>
                              </>
                            )}
                          {quote.isfeasability == 1 &&
                            quote.feasability_status == "Pending" &&
                            loopUserObject.id != "206" && (
                              <button
                                onClick={() => {
                                  toggleCompleteFeasability(
                                    quote.quoteid,
                                    quote.assign_id,
                                    quote.user_id
                                  );
                                }}
                                className="bg-green-100 text-green-600 px-2 py-1 rounded"
                                style={{ fontSize: "11px" }}
                              >
                                Give Feasibility
                              </button>
                            )}
                        </td>
                        <td className="border px-2 py-2">
                          {/* Up/Down Arrow Button */}
                          <>
                            <div className="flex items-center">
                              <button
                                onClick={() => toggleRow(index)}
                                className="flex items-center justify-center btn btn-primary btn-sm mr-1"
                              >
                                {expandedRowIndex === index ? (
                                  <ArrowUp size={14} className="text-white" />
                                ) : (
                                  <ArrowDown size={14} className="text-white" />
                                )}
                              </button>

                              <button
                                onClick={() => {
                                  toggleEditForm(quote.quoteid, quote.user_id);
                                }}
                                className="flex items-center  btn btn-dark btn-sm mr-1"
                              >
                                <Hash size={14} className="" />
                              </button>
                              <button
                                onClick={() => {
                                  toggleFollowersForm(
                                    quote.quoteid,
                                    thisUserId
                                  );
                                }}
                                className="flex items-center  btn btn-info btn-sm mr-1"
                              >
                                <UserRoundPlus size={14} className="" />
                              </button>
                            </div>
                          </>
                        </td>
                      </tr>
                      {/* Accordion */}

                      {expandedRowIndex == index && (
                        <tr>
                          <td colSpan={7}>
                            <div className="mx-2 mt-2 mb-0 bg-gray-100 px-3 pt-3 pb-0">
                              <div className="">
                                <button
                                  onClick={() => handleTabButtonClick("scope")}
                                  className={`px-2 py-1 mr-1 inline-flex items-center f-12 ${scopeTabVisible
                                      ? "btn-info focus-outline-none"
                                      : "btn-light"
                                    } btn btn-sm  focus:outline-none`}
                                >
                                  Scope Details {scopeTabVisible ? <Eye size={20} className="badge badge-dark ml-2" /> : <EyeClosed size={20} className="badge badge-dark ml-2" />}
                                </button>
                                <button
                                  onClick={() => handleTabButtonClick("chat")}
                                  className={`px-2 py-1 mr-1 inline-flex items-center f-12 ${chatTabVisible
                                      ? "btn-info focus-outline-none"
                                      : "btn-light"
                                    } btn btn-sm`}
                                >
                                  Communication Hub {chatTabVisible ? <Eye size={20} className="badge badge-dark ml-2" /> : <EyeClosed size={20} className="badge badge-dark ml-2" />}
                                </button>
                                <button
                                  disabled={quote.isfeasability == 0}
                                  onClick={() => handleTabButtonClick("feas")}
                                  className={`px-2 py-1 mr-1 f-12 inline-flex items-center ${feasTabVisible
                                      ? "btn-info focus-outline-none"
                                      : "btn-light"
                                    } btn btn-sm`}
                                >
                                  Feasibility  {feasTabVisible ? <Eye size={20} className="badge badge-dark ml-2" /> : <EyeClosed size={20} className="badge badge-dark ml-2" />}
                                </button>
                              </div>
                            </div>
                            <div className="mx-2 mb-0 bg-gray-100 pt-3 pb-3 pl-0 pr-2 row ">
                              {scopeTabVisible && (
                                <div className={`${fullScreenTab == "scope" ? "custom-modal" : colClass}`}>
                                  <div className={`${fullScreenTab == "scope" ? "custom-modal-content" : ""}`}>
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
                                                <p className="mb-3">
                                                  <div>
                                                    <strong className="mr-2">
                                                      Ref No
                                                    </strong>
                                                  </div>
                                                  <div className="d-flex align-items-center">
                                                    <div>{quote.assign_id}</div>
                                                    <div>
                                                      {quote.ptp === "Yes" && (
                                                        <span
                                                          className="ptp-badge badge badge-success ml-2"
                                                          style={{
                                                            backgroundColor: "#2B9758FF", // Green for PTP
                                                            color: "#fff",
                                                            fontSize: "11px", // Adjusted for better visibility
                                                            fontWeight: "bold",
                                                          }}
                                                        >
                                                          PTP
                                                        </span>
                                                      )}
                                                    </div>
                                                  </div>
                                                  {quote.edited === 1 && (
                                                    <span
                                                      className="edited-badge ml-2"
                                                      style={{
                                                        fontSize: "11px",
                                                        padding: "2px 8px",
                                                        backgroundColor: "#f0f0f0",
                                                        color: "#666",
                                                        borderRadius: "5px",
                                                      }}
                                                    >
                                                      Edited
                                                    </span>
                                                  )}
                                                </p>
                                              </div>

                                              {/* Tags Section */}
                                              {quote.tag_names && (
                                                <div className="col-md-12 mb-3">
                                                  <p>
                                                    <div>
                                                      <strong className="mb-1 d-block">
                                                        Tags
                                                      </strong>
                                                    </div>
                                                    {quote.tag_names
                                                      .split(",")
                                                      .map((tag, index) => (
                                                        <div
                                                          key={index}
                                                          className="tag-badge mr-1 d-inline"
                                                          style={{
                                                            padding: "3px 5px",
                                                            borderRadius: "4px",
                                                            backgroundColor:
                                                              "#007bff",
                                                            color: "#fff",
                                                            fontSize: "10px",
                                                          }}
                                                        >
                                                          # {tag.trim()}
                                                        </div>
                                                      ))}
                                                  </p>
                                                </div>
                                              )}

                                              {/* Service Required & Plan Section */}
                                              {quote.service_name && quote.plan && (
                                                <>
                                                  <div className="col-md-12 mb-3">
                                                    <p>
                                                      <div>
                                                        <strong>
                                                          Service Required
                                                        </strong>{" "}
                                                      </div>
                                                      {quote.service_name}
                                                    </p>
                                                  </div>

                                                  {quote.old_plan && (
                                                    <div className="col-md-12 mb-3">
                                                      <p className="text-muted">
                                                        <div>
                                                          <strong>Old Plan</strong>{" "}
                                                        </div>
                                                        {quote.old_plan}
                                                      </p>
                                                    </div>
                                                  )}

                                                  <div className="col-md-12 mb-3">
                                                    <p>
                                                      <div>
                                                        <strong>Plan</strong>{" "}
                                                      </div>
                                                      {quote.plan}
                                                    </p>
                                                  </div>
                                                </>
                                              )}

                                              {/* Subject Area Section */}
                                              <div className="col-md-12 mb-3">
                                                {quote.subject_area && (
                                                  <>
                                                    <p>
                                                      <div>
                                                        <strong>Subject Area</strong>{" "}
                                                      </div>
                                                      {quote.subject_area}
                                                    </p>
                                                    {quote.subject_area ===
                                                      "Other" && (
                                                        <p className="text-muted">
                                                          <div>
                                                            <strong>
                                                              Other Subject Area
                                                            </strong>{" "}
                                                          </div>
                                                          {quote.other_subject_area}
                                                        </p>
                                                      )}
                                                  </>
                                                )}
                                              </div>
                                            </div>
                                            <div className="row mt-0">
                                              <div className="col-md-12">
                                                <p className=" mb-2">
                                                  <strong>Plan Description</strong>
                                                </p>
                                              </div>
                                              {quote.plan_comments && typeof quote.plan_comments === "string" && quote.plan && (
                                                Object.entries(JSON.parse(quote.plan_comments))
                                                  .filter(([plan]) => quote.plan.split(',').includes(plan)) // Filter based on the updated plan list
                                                  .map(([plan, comment], index) => (
                                                    <div key={index} className={planColClass}>
                                                      <div className="border p-2 mb-3">
                                                        <p className="flex items-center mb-1 justify-content-between">
                                                          <strong>{plan}</strong> <button
                                                            className="btn btn-warning btn-sm px-1"
                                                            onClick={() => handleEditClick(quote, plan, comment)}
                                                          >
                                                            <Pen size={8} className="text-white" />
                                                          </button>
                                                        </p>
                                                        <div dangerouslySetInnerHTML={{ __html: comment }} />

                                                        {/* Word Count Section */}
                                                        {quote.word_counts && typeof quote.word_counts === "string" && (
                                                          Object.entries(JSON.parse(quote.word_counts))
                                                            .filter(([planWordCount]) => quote.plan.split(',').includes(planWordCount)) // Filter word count based on the plan list
                                                            .map(([planWordCount, wordcount], wcIndex) => (
                                                              plan === planWordCount && (
                                                                <div key={wcIndex} className=" mt-2">
                                                                  <p
                                                                    style={{
                                                                      fontWeight: "bold",
                                                                      color: "#007bff",
                                                                      backgroundColor: "#f0f8ff", // Background color for word count text
                                                                      padding: "5px", // Padding around the word count text
                                                                      borderRadius: "5px", // Rounded corners for the background
                                                                      border: "1px solid #40BD5DFF",
                                                                      fontSize: "11px",
                                                                    }}
                                                                  >
                                                                    <p className="text-black">
                                                                      <div>Word Count:</div>
                                                                    </p>
                                                                    {planWordCount}:{" "}
                                                                    <span style={{ color: "#28a745" }}>
                                                                      {wordcount} words
                                                                    </span>
                                                                    <br />
                                                                    <span style={{ color: "gray" }}>
                                                                      {capitalizeFirstLetter(numberToWords(wordcount))} words
                                                                    </span>
                                                                  </p>
                                                                </div>
                                                              )
                                                            ))
                                                        )}
                                                      </div>
                                                    </div>
                                                  ))
                                              )}
                                            </div>

                                            <div className="mb-0 mt-0 row px-2 pb-3 space-y-4 ">
                                              {quote.comments &&
                                                quote.comments != "" &&
                                                quote.comments != null && (
                                                  <p>
                                                    <strong
                                                      style={{
                                                        
                                                      }}
                                                    >
                                                      Description
                                                    </strong>{" "}
                                                    <span
                                                      dangerouslySetInnerHTML={{
                                                        __html: quote.comments,
                                                      }}
                                                    />
                                                  </p>
                                                )}
                                              {quote.final_comments != null && (
                                                <div>
                                                  <p>
                                                    <strong>Final Comments:</strong>{" "}
                                                    {quote.final_comments}
                                                  </p>
                                                </div>
                                              )}
                                              {quote.relevant_file &&
                                                quote.relevant_file.length > 0 && (
                                                  <div>
                                                    <strong>Relevant Files:</strong>
                                                    <div className="space-y-2 mt-2">
                                                      {quote.relevant_file.map(
                                                        (file, fileIndex) => (
                                                          <div key={fileIndex}>
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
                                                    <strong>PTP:</strong> {quote.ptp}
                                                  </p>
                                                  {quote.ptp_amount &&
                                                    quote.ptp_amount != 0 && (
                                                      <p>
                                                        <strong>PTP Amount:</strong>{" "}
                                                        {quote.ptp_amount}
                                                      </p>
                                                    )}
                                                  {quote.ptp == "Yes" && (
                                                    <p>
                                                      <strong>PTP Comments:</strong>{" "}
                                                      {quote.ptp_comments}
                                                    </p>
                                                  )}
                                                  {quote.ptp_file != null && (
                                                    <p>
                                                      <strong>
                                                        Attached File :{" "}
                                                      </strong>
                                                      <a
                                                        className="text-blue-500 font-semibold"
                                                        href={`https://apacvault.com/public/${quote.ptp_file}`}
                                                        download={quote.ptpfile}
                                                        target="_blank"
                                                      >
                                                        {quote.ptp_file}
                                                      </a>
                                                    </p>
                                                  )}
                                                </>
                                              )}
                                              {quote.demodone != 0 && (
                                                <>
                                                  <p className="flex items-center ">
                                                    {" "}
                                                    <p className="">
                                                      {" "}
                                                      <strong>Demo Id : </strong>{" "}
                                                      {quote.demo_id}
                                                    </p>{" "}
                                                    <span className="badge-success px-2 py-0 ml-3 rounded-sm text-white-900 font-semibold flex items-center f-12">
                                                      Demo Completed{" "}
                                                      <CheckCircle2
                                                        size={12}
                                                        className="ml-1"
                                                      />{" "}
                                                    </span>
                                                  </p>
                                                </>
                                              )}
                                              {quote.quote_status != 0 &&
                                                quote.quote_price &&
                                                quote.plan && (
                                                  <>
                                                    {quote.old_plan && (
                                                      <p className="text-gray-600">
                                                        <strong>
                                                          Quote Price For Old Plan:
                                                        </strong>{" "}
                                                        {(() => {
                                                          const prices =
                                                            quote.quote_price.split(
                                                              ","
                                                            ); // Split quote_price into an array
                                                          const plans =
                                                            quote.old_plan.split(","); // Split plan into an array
                                                          return plans.map(
                                                            (plan, index) => (
                                                              <span
                                                                key={index}
                                                                className="line-through bg-gray-200 p-1 mx-1 rounded border border-gray-500 f-12 mb-2 d-inline-block"
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
                                                                  ? prices[index]
                                                                  : 0}
                                                                {index <
                                                                  plans.length - 1 &&
                                                                  ", "}
                                                                  {quote.mp_price === plan && " (MP Price)"}
                                                              </span>
                                                            )
                                                          );
                                                        })()}
                                                      </p>
                                                    )}
                                                    {quote.quote_status != 2 && (
                                                      <p className="my-1">
                                                        <strong>Quote Price:</strong>{" "}
                                                        {(() => {
                                                          const prices =
                                                            quote.quote_price.split(
                                                              ","
                                                            ); // Split quote_price into an array
                                                          const plans =
                                                            quote.plan.split(","); // Split plan into an array
                                                          return plans.map(
                                                            (plan, index) => (
                                                              <span
                                                                key={index}
                                                                className={`${quote.discount_price !=
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
                                                                  ? prices[index]
                                                                  : 0}
                                                                {index <
                                                                  plans.length - 1 &&
                                                                  ", "}
                                                                  {quote.mp_price === plan && " (MP Price)"}
                                                              </span>
                                                            )
                                                          );
                                                        })()}
                                                      </p>
                                                    )}

                                                    {quote.discount_price && (
                                                      <p className="my-2">
                                                        <strong>
                                                          Discounted Price:
                                                        </strong>{" "}
                                                        {(() => {
                                                          const prices =
                                                            quote.discount_price.split(
                                                              ","
                                                            ); // Split quote_price into an array
                                                          const plans =
                                                            quote.plan.split(","); // Split plan into an array
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
                                                                {prices[index] ?? 0}
                                                                {index <
                                                                  plans.length - 1 &&
                                                                  ", "}
                                                                  {quote.mp_price === plan && " (MP Price)"}
                                                              </span>
                                                            )
                                                          );
                                                        })()}
                                                      </p>
                                                    )}
                                                    {quote.final_price && (
                                                      <p>
                                                        <strong>Final Price:</strong>{" "}
                                                        {(() => {
                                                          const prices =
                                                            quote.final_price.split(
                                                              ","
                                                            ); // Split quote_price into an array
                                                          const plans =
                                                            quote.plan.split(","); // Split plan into an array
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
                                                                {prices[index]}
                                                                {index <
                                                                  plans.length - 1 &&
                                                                  ", "}
                                                              </span>
                                                            )
                                                          );
                                                        })()}
                                                      </p>
                                                    )}
                                                    <p className="flex items-center">
                                                      <span className="font-weight-bold">Edit Quote Price</span>
                                                      {quote.quote_status == 1 &&
                                                        loopUserObject.id !=
                                                        "206" && (
                                                          <button
                                                            onClick={() => {
                                                              toggleEditingForm(
                                                                quote
                                                              );
                                                            }}
                                                            className="flex items-center rounded-full border-2 border-blue-500 mx-2"
                                                          >
                                                            <Pencil className="p-1" />
                                                          </button>
                                                        )}
                                                    </p>
                                                    {quote.user_comments && (
                                                      <p>
                                                        <strong
                                                          style={{
                                                            
                                                          }}
                                                        >
                                                          Admin Comments:
                                                        </strong>{" "}
                                                        {quote.user_comments}
                                                      </p>
                                                    )}
                                                  </>
                                                )}
                                              {assignQuoteInfo &&
                                                assignQuoteInfo != false && (
                                                  <p>
                                                    <strong>Assigned To:</strong>{" "}
                                                    {assignQuoteInfo.name}
                                                  </p>
                                                )}

                                              {assignQuoteInfo &&
                                                assignQuoteInfo != false && (
                                                  <>
                                                    {assignQuoteInfo.status === 0 ? (
                                                      <>
                                                        <p>
                                                          <strong>
                                                            Assigned To:
                                                          </strong>{" "}
                                                          {assignQuoteInfo.name}
                                                        </p>
                                                        <p>
                                                          <strong>
                                                            Assign Date:
                                                          </strong>{" "}
                                                          {
                                                            assignQuoteInfo.assigned_date
                                                          }
                                                        </p>
                                                        <p>
                                                          <strong>
                                                            Admin Comments:
                                                          </strong>{" "}
                                                          {
                                                            assignQuoteInfo.admin_comments
                                                          }
                                                        </p>
                                                      </>
                                                    ) : (
                                                      <>
                                                        <p>
                                                          Submitted by{" "}
                                                          {assignQuoteInfo.name}
                                                        </p>
                                                        <p>
                                                          <strong>Price:</strong>{" "}
                                                          {assignQuoteInfo.currency}{" "}
                                                          {
                                                            assignQuoteInfo.quote_price
                                                          }
                                                        </p>
                                                        <p>
                                                          <strong>
                                                            Submitted Date:
                                                          </strong>{" "}
                                                          {new Date(
                                                            assignQuoteInfo.user_submitted_date *
                                                            1000
                                                          ).toLocaleDateString(
                                                            "en-GB"
                                                          )}
                                                          {new Date(
                                                            assignQuoteInfo.user_submitted_date *
                                                            1000
                                                          ).toLocaleTimeString(
                                                            "en-GB",
                                                            {
                                                              hour: "2-digit",
                                                              minute: "2-digit",
                                                              hour12: true,
                                                            }
                                                          )}
                                                        </p>
                                                        <p>
                                                          <strong>
                                                            Assigned Comments:
                                                          </strong>{" "}
                                                          {
                                                            assignQuoteInfo.admin_comments
                                                          }
                                                        </p>
                                                        <p>
                                                          <strong>Comments:</strong>{" "}
                                                          {assignQuoteInfo.user_comments !=
                                                            ""
                                                            ? assignQuoteInfo.user_comments
                                                            : assignQuoteInfo.admin_comments}
                                                        </p>
                                                      </>
                                                    )}
                                                    {assignQuoteInfo.status == 1 && (
                                                      <form
                                                        name="edit_price_form"
                                                        id="edit_price_form"
                                                        className="form-horizontal"
                                                      >
                                                        <div className="box-body">
                                                          <input
                                                            type="hidden"
                                                            name="task_id"
                                                            id="task_id"
                                                            value={assignQuoteInfo.id}
                                                          />
                                                          <input
                                                            type="hidden"
                                                            name="quoteid"
                                                            id="quoteid"
                                                            value={
                                                              assignQuoteInfo.quote_id
                                                            }
                                                          />
                                                          <div className="form-group">
                                                            <label className="col-sm-12 control-label">
                                                              Quote Price (INR)
                                                            </label>
                                                            <div className="col-sm-12">
                                                              <input
                                                                type="text"
                                                                className="form-control"
                                                                id="quote_price"
                                                                name="quote_price"
                                                                value={
                                                                  quotePrice ||
                                                                  assignQuoteInfo?.quote_price ||
                                                                  ""
                                                                }
                                                                placeholder="Quote Price"
                                                                onChange={(e) =>
                                                                  setQuotePrice(
                                                                    e.target.value
                                                                  )
                                                                }
                                                              />
                                                            </div>
                                                          </div>
                                                          <div className="form-group">
                                                            <label className="col-sm-3 control-label">
                                                              Comments
                                                            </label>
                                                            <div className="col-sm-12">
                                                              <textarea
                                                                className="form-control"
                                                                id="user_comments"
                                                                name="user_comments"
                                                                value={
                                                                  userComments ||
                                                                  assignQuoteInfo?.user_comments ||
                                                                  assignQuoteInfo?.admin_comments ||
                                                                  ""
                                                                }
                                                                onChange={(e) =>
                                                                  setUserComments(
                                                                    e.target.value
                                                                  )
                                                                }
                                                              />
                                                            </div>
                                                          </div>
                                                        </div>

                                                        <div className="modal-footer tabb">
                                                          <span id="load_btn">
                                                            <button
                                                              type="button"
                                                              className="btn"
                                                              onClick={() =>
                                                                updatePriceQuote()
                                                              }
                                                              disabled={priceLoading}
                                                            >
                                                              Confirm
                                                            </button>
                                                          </span>
                                                        </div>
                                                      </form>
                                                    )}
                                                  </>
                                                )}
                                            </div>

                                            <div className="row mt-0 mx-1">
                                              {quote.quote_status != 1 &&
                                                quote.submittedtoadmin == "true" &&
                                                loopUserObject.id != "206" && (
                                                  <>
                                                    <div className="nav-tabs-custom tabb p-3 shadow-0">
                                                      <ul className="nav nav-tabs pb-2 p-0">
                                                        <li className="btn btn-primary btn-sm border-0 f-12">
                                                          Submit Price
                                                        </li>
                                                      </ul>
                                                      <div className="tab-content p-0 mt-2">
                                                        <div
                                                          className="tab-pane active"
                                                          id="tab_2"
                                                        >
                                                          <form
                                                            method="post"
                                                            name="submitQuoteForm"
                                                            id="submitQuoteForm"
                                                            className="form-horizontal"
                                                          >
                                                            <input
                                                              type="hidden"
                                                              name="ref_id"
                                                              value={quote.assign_id}
                                                            />
                                                            <input
                                                              type="hidden"
                                                              name="quote_id"
                                                              value={quote.quoteid}
                                                            />
                                                            <div className="box-body p-0 f-12">
                                                              <div className="row">
                                                                {[
                                                                  "Basic",
                                                                  "Standard",
                                                                  "Advanced",
                                                                ].map(
                                                                  (plan, index) => (
                                                                    <div
                                                                      className={` ${scopeTabVisible && !chatTabVisible && !feasTabVisible ? 'col-md-4' : 'col-md-12'} form-group`}
                                                                      key={index}
                                                                    >
                                                                     <div className="flex justify-between items-center mb-2">
                                                                      <label
                                                                          htmlFor={`amount_${plan}`}
                                                                          className="control-label mb-0"
                                                                        >
                                                                          Amount for{" "}
                                                                          <strong>
                                                                            {plan} (
                                                                            {quote.currency ===
                                                                              "Other"
                                                                              ? quote.other_currency
                                                                              : quote.currency}
                                                                            )
                                                                          </strong>
                                                                        </label>
                                                                        <div className="flex items-center">
                                                                          <input
                                                                            type="checkbox"
                                                                            className="h-1 w-1"
                                                                            id={`mp_${plan}`}
                                                                            name={`mp_${plan}`}
                                                                            checked={selectedMP === plan}
                                                                            onChange={() => handleMPChange(plan)}
                                                                          />
                                                                          <label style={{ fontSize: "10px" }} htmlFor={`mp_${plan}`} className="ml-1 mb-0">Mark as MP Price</label>
                                                                        </div>
                                                                    </div>
                                                                      <div className="">
                                                                        <input
                                                                          type="text"
                                                                          name={`amount_${plan}`}
                                                                          id={`amount_${plan}`}
                                                                          className="form-control form-conotrol-sm"
                                                                          value={
                                                                            amounts[
                                                                            plan
                                                                            ] || ""
                                                                          } // Default to empty if no amount is set
                                                                          required={
                                                                            quote.plan &&
                                                                            quote.plan
                                                                              .split(
                                                                                ","
                                                                              )
                                                                              .includes(
                                                                                plan
                                                                              )
                                                                          } // Required only if the plan is included in quote.plan
                                                                          disabled={
                                                                            !quote.plan ||
                                                                            !quote.plan
                                                                              .split(
                                                                                ","
                                                                              )
                                                                              .includes(
                                                                                plan
                                                                              )
                                                                          } // Disable if the plan is not in quote.plan
                                                                          onChange={(
                                                                            e
                                                                          ) =>
                                                                            handleAmountChange(
                                                                              e,
                                                                              plan
                                                                            )
                                                                          }
                                                                        />
                                                                        <div
                                                                          className="error"
                                                                          id={`amountError_${plan}`}
                                                                        ></div>
                                                                      </div>
                                                                      
                                                                    </div>
                                                                  )
                                                                )}

                                                                <div className="form-group col-sm-12">
                                                                  
                                                                  <div className="mt-2">
                                                                    <textarea
                                                                      name="comment"
                                                                      id="comment"
                                                                      placeholder="Comments"
                                                                      className="form-control form-conotrol-sm"
                                                                      value={comment}
                                                                      onChange={(e) =>
                                                                        setComment(
                                                                          e.target
                                                                            .value
                                                                        )
                                                                      }
                                                                    ></textarea>
                                                                    <div
                                                                      className="error"
                                                                      id="commentError"
                                                                    ></div>
                                                                  </div>
                                                                </div>
                                                              </div>
                                                            </div>
                                                            <div className="">
                                                              <input
                                                                type="button"
                                                                name="priceSubmitted"
                                                                className="btn pull-right btn-success btn-sm f-12"
                                                                value="Submit"
                                                                onClick={() =>
                                                                  PriceSubmitValidate(
                                                                    quote.assign_id,
                                                                    quote.quoteid,
                                                                    quote.plan,
                                                                    quote.user_id
                                                                  )
                                                                }
                                                                disabled={
                                                                  priceLoading
                                                                }
                                                              />
                                                            </div>
                                                          </form>
                                                        </div>
                                                      </div>
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
                                <div className={`${fullScreenTab == "chat" ? "custom-modal" : colClass} p-0`}>
                                  <div className={`${fullScreenTab == "chat" ? "custom-modal-content" : ""} `}>

                                    <div className={`p-0 `}>
                                      <Chat
                                        quoteId={quote.quoteid}
                                        refId={quote.assign_id}
                                        status={quote.quote_status}
                                        submittedToAdmin={quote.submittedtoadmin}
                                        finalFunction={fetchScopeDetails}
                                        allDetails={quote}
                                        finalfunctionforsocket={fetchScopeDetailsForSocket}
                                        handlefullScreenBtnClick={handlefullScreenBtnClick}
                                        chatTabVisible={chatTabVisible}
                                        fullScreenTab={fullScreenTab}
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}

                              {feasTabVisible && quote.isfeasability == 1 && (
                                <div className={`${fullScreenTab == "feas" ? "custom-modal" : colClass}`}>
                                  <div className={`${fullScreenTab == "feas" ? "custom-modal-content" : ""} `}>
                                    <div className={` pr-0`}>
                                      <div className="bg-white">
                                        <>
                                          {quote.isfeasability == 1 && (
                                            <>
                                            <div className="py-2 px-2 flex items-center justify-between bg-blue-100">
                                                <h3 className=""><strong>Feasibility</strong></h3>
                                                <div className='flex items-center'>
                                                    {quote.feasability_status ==
                                                        "Completed" && (
                                                          <>
                                                            {loopUserObject.id !=
                                                              "206" && (
                                                                <button
                                                                  onClick={() => {
                                                                    toggleFeasCommentsEditingForm(
                                                                      quote
                                                                    );
                                                                  }}
                                                                  className="btn btn-sm btn-primary flex items-center p-1 mr-2"
                                                                >
                                                                  <Pencil
                                                                    className=""
                                                                    size={12}
                                                                  />
                                                                </button>
                                                              )}
                                                          </>
                                                        )}
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
                                                        <strong>
                                                          Feasibility Comments:
                                                        </strong>

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
                                                            className="text-blue-600 flex items-center ml-2"
                                                          >
                                                            <Paperclip size={13} /> View File
                                                          </a>
                                                        </p>
                                                      )}
                                                      </div>
                                                    </>
                                                  )}
                                            </>
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
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {editFormOpen && (
          <AddTags
            quoteId={selectedQuoteId}
            refId={queryId}
            userId={userIdForTag}
            onClose={() => {
              setEditFormOpen(!editFormOpen);
            }}
            after={fetchScopeDetails}
            notification="yes"
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
        {allRequestDivOpen && (
          <AllRequestSideBar
            refId={queryId}
            onClose={() => {
              setAllRequestDivOpen(!allRequestDivOpen);
            }}
          />
        )}
        {clientEmailDivOpen && (
          <ClientEmailSideBar
            refIds={refIds}
            onClose={() => {
              setClientEmailDivOpen(!clientEmailDivOpen);
            }}
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
        {editingFormOpen && (
          <EditPriceComponent
            quote={selectedQuoteId}
            PriceSubmitValidate={PriceSubmitValidate}
            refId={queryId}
            onClose={() => {
              setEditingFormOpen(!editingFormOpen);
            }}
            after={fetchScopeDetailsForSocket}
          />
        )}
        {feascommentseditingFormOpen && (
          <EditFeasibilityCommentsComponent
            quote={selectedQuoteId}
            onClose={() => {
              setFeasCommentsEditingFormOpen(!feascommentseditingFormOpen);
            }}
            after={fetchScopeDetailsForSocket}
          />
        )}
        {completeFeasabilityDiv && (
          <CompleteFeasability
            onClose={() => {
              setCompleteFeasabilityDiv(!completeFeasabilityDiv);
            }}
            quoteId={selectedQuoteId}
            refId={selectedRefId}
            userId={selectedUser}
            after={fetchScopeDetailsForSocket}
          />
        )}

        {commentEditFormOpen && (
          <EditCommentsComponent quote={commentQuote} plan={commentPlan} comment={commentText} wordCount={commentWordCount} onClose={() => { setCommentEditFormOpen(false) }} after={fetchScopeDetailsForSocket} />
        )}
      </AnimatePresence>
      <Tooltip id="my-tooltip" />
    </div>
  );
};

export default AskForScopeAdmin;
