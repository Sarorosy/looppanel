import { useState } from 'react';
import toast from 'react-hot-toast';
import { Headset, TriangleAlert } from 'lucide-react';
import { getSocket } from './Socket';

function QuoteIssue({ scopeDetails, quoteId, after }) {
    const socket = getSocket();
    const loopuserData = localStorage.getItem('loopuser');
    const loopUserObject = JSON.parse(loopuserData);

    const isIssue = scopeDetails.quote_issue == 1;

    const handleSubmit = async (e) => {
        e.preventDefault();

        const postData = {
            ref_id: scopeDetails.assign_id,
            quote_id: quoteId,
            user_id: loopUserObject.id,
            quote_issue: isIssue ? 0 : 1 // Toggle status
        };

        try {
            const response = await fetch('https://apacvault.com/Webapi/markasquoteissue', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData),
            });

            const result = await response.json();
            if (result.status === "success") {
                toast.success('Success');
                setTimeout(after, 500);
            } else {
                toast.error('Failed to submit the request');
            }
        } catch (error) {
            console.error('Error posting data:', error);
            toast.error('An error occurred while submitting the request');
        }
    };

    return (
        <div className='flex items-start mt-1 mb-3'>
            {scopeDetails.quote_issue == 0 && (
                <button 
                    onClick={handleSubmit} 
                    className="btn text-white bg-red-500 hover:bg-red-600 flex items-center f-12 py-1 px-1.5 btn-sm">
                   Quote Issue <TriangleAlert size={15} className='ml-1' />
                </button>
            )}
            {(scopeDetails.quote_issue == 1) && (
                <button 
                    onClick={handleSubmit} 
                    className="btn text-white bg-red-500 hover:bg-red-600 flex items-center f-12 py-1 px-1.5 btn-sm">
                    Remove Quote Issue <TriangleAlert size={15} className='ml-1' />
                </button>
            )}
            
            
        </div>
    );
}

export default QuoteIssue;
