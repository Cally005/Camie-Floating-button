import React from 'react';

const Modal = ({ isOpen, onClose, title, aiResponse, analysis }) => {
    if (!isOpen) return null; // Don't render the modal if it's not open

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-bold mb-4">{title}</h2>
                <div>
                    <h3 className="font-bold">AI Response:</h3>
                    <pre>{aiResponse || 'No response available'}</pre>
                    <button
                        className="text-blue-500 underline"
                        onClick={() => alert(analysis)}
                    >
                        View Analysis
                    </button>
                </div>
                <button
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                    onClick={onClose}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default Modal;