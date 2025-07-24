import { useState } from 'react';
import toast from 'react-hot-toast';
import { Headset, TriangleAlert } from 'lucide-react';
import { getSocket } from './Socket';

function QuoteIssue({ scopeDetails, quoteId, after }) {
    const socket = getSocket();
    const loopuserData = localStorage.getItem('loopuser');
    const loopUserObject = JSON.parse(loopuserData);

    const [showCommentBox, setShowCommentBox] = useState(false);
    const [comment, setComment] = useState('');

    const isIssue = scopeDetails.quote_issue == 1;

    const [marking, setMarking] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (comment.trim() == '' && !isIssue) {
            toast.error('Please enter a comment');
            return;
        }
        setMarking(true);

        const postData = {
            ref_id: scopeDetails.assign_id,
            quote_id: quoteId,
            user_id: loopUserObject.id,
            user_name : loopUserObject.fld_first_name + " " + loopUserObject.fld_last_name,
            quote_issue: isIssue ? 0 : 1, // Toggle status
            comments: comment || '', // Add comment if present
        };

        try {
            const response = await fetch('http://localhost:5000/api/scope/markasquoteissue', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData),
            });

            const result = await response.json();
            if (result.status === "success") {
                toast.success('Success');
                setShowCommentBox(false)
                setTimeout(after, 500);
            } else {
                toast.error('Failed to submit the request');
            }
        } catch (error) {
            console.error('Error posting data:', error);
            toast.error('An error occurred while submitting the request');
        }finally{
            setMarking(false);
        }
    };

    const handleButtonClick = () => {
        if (!isIssue && !showCommentBox) {
            // Open comment box if setting an issue
            setShowCommentBox(true);
        } else {
            // Directly submit if removing the issue
            handleSubmit(new Event('submit'));
        }
    };

    return (
        <div className='flex flex-col items-start mt-2 mb-2'>
            <button
                onClick={handleButtonClick}
                className="px-2 py-1 leading-none text-[10px] bg-red-600 hover:bg-red-700 text-white flex gap-1 items-center rounded"
            >
                {isIssue ? 'Remove Quote Issue' : 'Quote Issue'}
                <TriangleAlert size={11} className='' />
            </button>

            {/* Smooth expanding textarea */}
            <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${showCommentBox ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
                style={{ width: '100%' }}
            >
                <form  className="flex flex-col">
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="border rounded p-2 text-sm"
                        placeholder="Add issue comments..."
                        rows={3}
                        
                    />
                    <div className='flex justify-end '>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={marking}
                            className="bg-red-100 hover:bg-red-200 text-red-600 mt-2 py-1 px-2 text-[11px] leading-none rounded "
                        >
                            {marking ? "Submitting..." : "Submit Issue"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default QuoteIssue;
