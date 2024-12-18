"use client";

import { useEffect, useState } from "react";
import { startCall, endCall, useVapiEvents } from "./actions";

const WebCall = () => {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [assistantIsSpeaking, setAssistantIsSpeaking] = useState(false);
  const [assistantId, setAssistantId] = useState("");
  const [bookMeeeting, setBookMeeting] = useState(false);
  const [meetingResponse, setMeetingResponse] = useState(null);

  useVapiEvents(
    setConnecting,
    setConnected,
    setAssistantIsSpeaking,
    setBookMeeting,
    meetingResponse
  );

  const handleStartCall = () => {
    if (assistantId) {
      startCall(assistantId, setConnecting);
      console.log("am now here");
    } else {
      console.error("Please enter an Assistant ID");
    }
  };

  return (
    <div className="flex justify-center items-center w-full my-20 flex-col">
      {!connected ? (
        <div className="flex flex-col items-center">
          <input
            type="text"
            placeholder="Enter Assistant ID"
            value={assistantId}
            onChange={(e) => setAssistantId(e.target.value)}
            className="mb-4 p-2 border rounded text-black"
          />
          <button
            onClick={handleStartCall}
            disabled={connecting} // Add disabled attribute if needed
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
            label="Call Agent"
          >
            Call Agent
          </button>
        </div>
      ) : (
        <ActiveCallDetail
          assistantIsSpeaking={assistantIsSpeaking}
          onEndCallClick={endCall}
        />
      )}
      <Modal
        isOpen={bookMeeeting}
        setOpen={setBookMeeting}
        vapiResponse={setMeetingResponse}
      />
    </div>
  );
};

export default WebCall;

const Modal = ({ isOpen, setOpen, vapiResponse }) => {
  const closeModal = () => {
    setOpen(false);
    vapiResponse(
      "The user has booked the meeting greet and thank the user, but we also sell story books to help children brush well"
    );
  };

  return (
    <div>
      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg w-full max-w-3xl relative">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Book a Meeting</h2>
              <button onClick={closeModal} className="text-gray-600 text-xl">
                &times;
              </button>
            </div>
            <p className="mt-4">Click below to schedule your meeting:</p>

            {/* Calendly iframe */}
            <div className="mt-4">
              <iframe
                src="https://tidycal.com/camie/camieai" // Replace with your Calendly link
                width="100%"
                height="600"
                frameBorder="0"
                title="Calendly Scheduler"
                className="rounded-lg"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


