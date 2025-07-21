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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (comment.trim() == '') {
            toast.error('Please enter a comment');
            return;
        }

        const postData = {
            ref_id: scopeDetails.assign_id,
            quote_id: quoteId,
            user_id: loopUserObject.id,
            quote_issue: isIssue ? 0 : 1, // Toggle status
            comments: comment || '', // Add comment if present
        };

        try {
            const response = await fetch('https://loopback-skci.onrender.com/api/scope/markasquoteissue', {
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
        <div className='flex flex-col items-start mt-1 mb-3'>
            <button
                onClick={handleButtonClick}
                className="btn text-white bg-red-500 hover:bg-red-600 flex items-center f-12 py-1 px-1.5 btn-sm"
            >
                {isIssue ? 'Remove Quote Issue' : 'Quote Issue'}
                <TriangleAlert size={15} className='ml-1' />
            </button>

            {/* Smooth expanding textarea */}
            <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${showCommentBox ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
                style={{ width: '100%' }}
            >
                <form onSubmit={handleSubmit} className="flex flex-col">
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="border rounded p-2 text-sm"
                        placeholder="Add issue comments..."
                        rows={3}
                        
                    />
                    <button
                        type="submit"
                        className="btn bg-red-100 text-red-600 hover:bg-red-200 mt-2 py-0.5 px-1 text-sm self-start"
                    >
                        Submit Issue
                    </button>
                </form>
            </div>
        </div>
    );
}

export default QuoteIssue;
