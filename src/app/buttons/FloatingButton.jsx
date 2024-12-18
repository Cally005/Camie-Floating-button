"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircleIcon, MicIcon } from "lucide-react";
import ChatInterface from "./ChatInterface";
import Voiceinterface from "./Voiceinterface";
import { ModeToggle } from "../modes";
import axios from "axios";

const BubbleText = ({ text, isVisible }) => {
  return isVisible ? (
    <div className="absolute -top-24 -left-16 z-50 animate-bounce">
      <div
        className="relative bg-white text-primary border border-primary px-2 py-3 max-w-xs rounded-3xl shadow-lg text-sm text-wrap
        before:content-[''] before:absolute before:bottom-[-6px] before:left-4 before:w-0 before:h-0 
        before:border-l-[6px] before:border-l-transparent 
        before:border-t-[6px] before:border-t-primary 
        before:border-r-[6px] before:border-r-transparent"
      >
        {text}
      </div>
    </div>
  ) : null;
};

// Embeddable Floating Button Component
const FloatingButton = (config = {}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [modalType, setModalType] = useState("");
  const [bubbleText, setBubbleText] = useState("");
  const [isBubbleVisible, setIsBubbleVisible] = useState(false);

  // Simulate fetching dynamic text from backend
  useEffect(() => {
    const fetchDynamicText = async () => {
      try {
        const responses = await axios.post(
          config.apiEndpoint || "https://camie-ai.onrender.com/api/v0/ai/leads-note",
          {
            campaign_id: config.campaignId || "e3d83007-37bd-4bfc-a186-c542f3ce5d49",
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const randomText = responses.data.msg;
        
        // Show bubble
        setBubbleText(randomText);
        setIsBubbleVisible(true);

        // Hide bubble after 8 seconds
        const timer = setTimeout(() => {
          setIsBubbleVisible(false);
        }, 8000);

        // Prepare next bubble appearance
        const nextTimer = setTimeout(() => {
          fetchDynamicText();
        }, 8000);

        // Cleanup timers
        return () => {
          clearTimeout(timer);
          clearTimeout(nextTimer);
        };
      } catch (error) {
        console.error("Failed to fetch dynamic text", error);
      }
    };

    // Initial call
    fetchDynamicText();
  }, []);

  const handleButtonClick = () => {
    setIsVisible(false);
    setIsOpen(true);
  };

  const handleDialogClose = () => {
    setIsOpen(false);
    setIsVisible(true);
  };

  const handleSelection = (type) => {
    setModalType(type);
    setIsOpen(false);
  };

  return (
    <div>
      {/* Fixed positioning at bottom right of screen */}
      {isVisible && (
        <div className="fixed bottom-5 right-5 z-50">
          <BubbleText text={bubbleText} isVisible={isBubbleVisible} />
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full bg-primary shadow-lg hover:bg-primary/90 focus:outline-none animate-bounce"
            onClick={handleButtonClick}
          >
            <video
              autoPlay
              loop
              muted
              className="h-full w-full object-contain rounded-full"
            >
              <source src={config.videoSrc || "/hi.mp4"} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}

      {/* Initial Popup Modal */}
      <Dialog open={isOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="flex flex-col items-center gap-8 rounded-lg shadow-xl bg-white w-[80vw] h-[80vh] max-w-[1200px] p-10">
          <h2 className="text-3xl font-semibold text-center mb-8">
            {config.modalTitle || "How do you want us to communicate?"}
          </h2>

          {/* Video between title and cards */}
          <video
            autoPlay
            loop
            muted
            className="h-64 w-full object-contain rounded-xl mb-2"
          >
            <source src={config.videoSrc || "/hi.mp4"} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Cards for Chat with Me and Talk with Audio */}
          <div className="flex w-full justify-between gap-10 mt-auto mb-auto">
            {/* Card 1: Chat with Me */}
            <div
              className="flex-1 p-8 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-primary/10 transition-all"
              onClick={() => handleSelection("chat")}
            >
              <MessageCircleIcon className="h-16 w-16 text-primary" />
              <h3 className="text-xl font-semibold">{config.chatCardTitle || "Chat with Me"}</h3>
              <p className="text-gray-600">{config.chatCardDescription || "Text-based communication for quick exchanges."}</p>
            </div>

            {/* Card 2: Talk with Audio */}
            <div
              className="flex-1 p-8 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-primary/10 transition-all"
              onClick={() => handleSelection("voice")}
            >
              <MicIcon className="h-16 w-16 text-primary" />
              <h3 className="text-xl font-semibold">{config.voiceCardTitle || "Talk with Audio"}</h3>
              <p className="text-gray-600">{config.voiceCardDescription || "Voice-based interaction for more personal conversations."}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal for Chat */}
      {modalType === "chat" && (
        <Dialog open={true} onOpenChange={() => setModalType("")}>
          <DialogContent className="flex items-center justify-center rounded-lg w-[40vw] h-[90vh] max-w-[1200px] mt-auto mb-auto">
            <ChatInterface />
          </DialogContent>
        </Dialog>
      )}

      {/* Modal for Voice */}
      {modalType === "voice" && (
        <Dialog open={true} onOpenChange={() => setModalType("")}>
          <DialogContent className="flex flex-col items-center gap-4 rounded-lg shadow-xl bg-white w-[80vw] h-[80vh] max-w-[1000px] p-8">
            <h2 className="text-2xl font-semibold text-center">Tap to speak</h2>
            
            <div className="flex justify-end items-end">
              <ModeToggle />
            </div>
            <Voiceinterface />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};


export default FloatingButton;







// "use client";

// import React, { useEffect, useState } from "react";
// import { Dialog, DialogContent } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { MessageCircleIcon, MicIcon } from "lucide-react";
// import ChatInterface from "./ChatInterface";
// import Voiceinterface from "./Voiceinterface";
// import { ModeToggle } from "../modes";
// import axios from "axios";


// const BubbleText = ({ text, isVisible }) => {
//   return isVisible ? (
//     <div className="absolute -top-24 -left-16 z-50 animate-bounce">
//       <div
//         className="relative bg-white text-primary border border-primary px-2 py-3 max-w-xs rounded-3xl shadow-lg text-sm text-wrap
//         before:content-[''] before:absolute before:bottom-[-6px] before:left-4 before:w-0 before:h-0 
//         before:border-l-[6px] before:border-l-transparent 
//         before:border-t-[6px] before:border-t-primary 
//         before:border-r-[6px] before:border-r-transparent"
//       >
//         {text}
//       </div>
//     </div>
//   ) : null;
// };


// // Floating Button Component
// export function FloatingButton() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [isVisible, setIsVisible] = useState(true);
//   const [modalType, setModalType] = useState("");
//   const [bubbleText, setBubbleText] = useState("");
//   const [isBubbleVisible, setIsBubbleVisible] = useState(false);

//   // Simulate fetching dynamic text from backend
//   useEffect(() => {
//     const fetchDynamicText = async () => {
//       const responses = await axios.post(
//         "https://camie-ai.onrender.com/api/v0/ai/leads-note",
//         {
//           campaign_id: "e3d83007-37bd-4bfc-a186-c542f3ce5d49",
//         },
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       console.log("generated text", responses)

//       const randomText = responses.data.msg;
      
//       // Show bubble
//       setBubbleText(randomText);
//       setIsBubbleVisible(true);

//       // Hide bubble after 3 seconds
//       const timer = setTimeout(() => {
//         setIsBubbleVisible(false);
//       }, 8000
//     );

//       // Prepare next bubble appearance
//        const nextTimer = setTimeout(() => {
//          fetchDynamicText();
//        }, 8000); // Reappear after 10 seconds

//       // Cleanup timers
//       return () => {
//         clearTimeout(timer);
//         clearTimeout(nextTimer);
//       };
//     };

//     // Initial call
//     fetchDynamicText();
//   }, []);

//   const handleButtonClick = () => {
//     setIsVisible(false);
//     setIsOpen(true);
//   };

//   const handleDialogClose = () => {
//     setIsOpen(false);
//     setIsVisible(true);
//   };

//   const handleSelection = (type) => {
//     setModalType(type);
//     setIsOpen(false);
//   };

//   return (
//     <div>
//       {/* Fixed positioning at bottom right of screen */}
//       {isVisible && (
//         <div className="fixed bottom-5 right-5 z-50">
//              <BubbleText text={bubbleText} isVisible={isBubbleVisible} />
//           <div
//             className="flex h-20 w-20 items-center justify-center rounded-full bg-primary shadow-lg hover:bg-primary/90 focus:outline-none animate-bounce"
//             onClick={handleButtonClick}
//           >
//             <video
//               autoPlay
//               loop
//               muted
//               className="h-full w-full object-contain rounded-full"
//             >
//               <source src={config.videoSrc || "/hi.mp4"} type="video/mp4" />
//               Your browser does not support the video tag.
//             </video>
//           </div>
//         </div>
//       )}
//  {/* Initial Popup Modal */}
//  <Dialog open={isOpen} onOpenChange={handleDialogClose}>
//         <DialogContent className="flex flex-col items-center gap-8 rounded-lg shadow-xl bg-white w-[80vw] h-[80vh] max-w-[1200px] p-10">
//           <h2 className="text-3xl font-semibold text-center mb-8">How do you want us to communicate?</h2>

//           {/* Video between title and cards */}
//           <video
//             autoPlay
//             loop
//             muted
//             className="h-64 w-full object-contain rounded-xl mb-2"
//           >
//             <source src="/hi.mp4" type="video/mp4" />
//             Your browser does not support the video tag.
//           </video>

//           {/* Cards for Chat with Me and Talk with Audio */}
//           <div className="flex w-full justify-between gap-10 mt-auto mb-auto">
//             {/* Card 1: Chat with Me */}
//             <div
//               className="flex-1 p-8 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-primary/10 transition-all"
//               onClick={() => handleSelection("chat")}
//             >
//               <MessageCircleIcon className="h-16 w-16 text-primary" />
//               <h3 className="text-xl font-semibold">Chat with Me</h3>
//               <p className="text-gray-600">Text-based communication for quick exchanges.</p>
//             </div>

//             {/* Card 2: Talk with Audio */}
//             <div
//               className="flex-1 p-8 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-primary/10 transition-all"
//               onClick={() => handleSelection("voice")}
//             >
//               <MicIcon className="h-16 w-16 text-primary" />
//               <h3 className="text-xl font-semibold">Talk with Audio</h3>
//               <p className="text-gray-600">Voice-based interaction for more personal conversations.</p>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Modal for Chat */}
//       {modalType === "chat" && (
//         <Dialog open={true} onOpenChange={() => setModalType("")}>
//           <DialogContent className="flex  items-center justify-center rounded-lg w-[40vw] h-[90vh] max-w-[1200px]  mt-auto mb-auto">
//             {/* <h2 className="text-2xl font-semibold text-center">Chat with Me</h2> */}
//             {/* Embed ChatComponent */}
          
//             <div className="">
           
           
//               </div>
//            {/* Display your chat UI here */}
//            <ChatInterface />
//           </DialogContent>
//         </Dialog>
//       )}

//       {/* Modal for Voice */}
//       {modalType === "voice" && (
//         <Dialog open={true} onOpenChange={() => setModalType("")}>
//           <DialogContent className="flex flex-col items-center gap-4 rounded-lg shadow-xl bg-white w-[80vw] h-[80vh] max-w-[1000px] p-8">
//             <h2 className="text-2xl font-semibold text-center">Tap to speak</h2>
          
//             {/* Audio UI */}
//             <div className="flex justify-end items-end">
//             <ModeToggle></ModeToggle>
//               </div>
//           <Voiceinterface/>
//           </DialogContent>
//         </Dialog>
//       )}
//     </div>
//   );
// }












// //wroking well
// "use client";

// import React, { useState } from "react";
// import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"; // ShadCN Dialog components
// import { Button } from "@/components/ui/button"; // ShadCN Button components
// import { MessageCircleIcon, MicIcon } from "lucide-react"; // Icons from lucide-react

// // Floating Button Component
// export function FloatingButton() {
//   const [isOpen, setIsOpen] = useState(false); // Track modal open state
//   const [isVisible, setIsVisible] = useState(true); // Track button visibility
//   const [modalType, setModalType] = useState(""); // Track which modal to open next (chat or voice)

//   const handleButtonClick = () => {
//     setIsVisible(false); // Hide button when clicked
//     setIsOpen(true); // Open the initial dialog/modal
//   };

//   const handleDialogClose = () => {
//     setIsOpen(false); // Close the dialog
//     setIsVisible(true); // Show button again when dialog closes
//   };

//   // Function to handle selection of "Chat with Me" or "Talk with Audio"
//   const handleSelection = (type) => {
//     setModalType(type); // Set the modal type to either 'chat' or 'voice'
//     setIsOpen(false); // Close the initial modal
//   };

//   return (
//     <div>
//       {/* Floating Button */}
//       {isVisible && (
//         <div
//           className="fixed bottom-5 right-5 z-50 flex h-20 w-20 items-center justify-center rounded-full bg-primary shadow-lg hover:bg-primary/90 focus:outline-none animate-bounce"
//           onClick={handleButtonClick}
//         >
//           <video
//             autoPlay
//             loop
//             muted
//             className="h-full w-full object-contain rounded-full"
//           >
//             <source src="/hi.mp4" type="video/mp4" />
//             Your browser does not support the video tag.
//           </video>
//         </div>
//       )}

//       {/* Initial Popup Modal */}
//       <Dialog open={isOpen} onOpenChange={handleDialogClose}>
//         <DialogContent className="flex flex-col items-center gap-8 rounded-lg shadow-xl bg-white w-[90vw] h-[80vh] max-w-[1200px] p-10">
//           <h2 className="text-3xl font-semibold text-center mb-8">How do you want us to communicate?</h2>

//           {/* Video between title and cards */}
//           <video
//             autoPlay
//             loop
//             muted
//             className="h-64 w-full object-contain rounded-xl mb-2"
//           >
//             <source src="/hi.mp4" type="video/mp4" />
//             Your browser does not support the video tag.
//           </video>

//           {/* Cards for Chat with Me and Talk with Audio */}
//           <div className="flex w-full justify-between gap-10 mt-auto mb-auto">
//             {/* Card 1: Chat with Me */}
//             <div className="flex-1 p-8 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-primary/10 transition-all" onClick={() => handleSelection("chat")}>
//               <MessageCircleIcon className="h-16 w-16 text-primary" />
//               <h3 className="text-xl font-semibold">Chat with Me</h3>
//               <p className="text-gray-600">Text-based communication for quick exchanges.</p>
//             </div>

//             {/* Card 2: Talk with Audio */}
//             <div className="flex-1 p-8 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-primary/10 transition-all" onClick={() => handleSelection("voice")}>
//               <MicIcon className="h-16 w-16 text-primary" />
//               <h3 className="text-xl font-semibold">Talk with Audio</h3>
//               <p className="text-gray-600">Voice-based interaction for more personal conversations.</p>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Modal for Chat */}
//       {modalType === "chat" && (
//         <Dialog open={true} onOpenChange={() => setModalType("")}>
//           <DialogContent className="flex flex-col items-center gap-4 rounded-lg shadow-xl bg-white w-[80vw] h-[70vh] max-w-[1000px] p-8">
//             <h2 className="text-2xl font-semibold text-center">Chat with Me</h2>
//             <p>Implement your chat UI here!</p>
//             {/* Chat UI */}
//             <Button variant="outline" className="w-full" onClick={() => setModalType("")}>
//               Close Chat
//             </Button>
//           </DialogContent>
//         </Dialog>
//       )}

//       {/* Modal for Voice */}
//       {modalType === "voice" && (
//         <Dialog open={true} onOpenChange={() => setModalType("")}>
//           <DialogContent className="flex flex-col items-center gap-4 rounded-lg shadow-xl bg-white w-[80vw] h-[70vh] max-w-[1000px] p-8">
//             <h2 className="text-2xl font-semibold text-center">Talk with Audio</h2>
//             <p>Implement your audio UI here!</p>
//             {/* Audio UI */}
//             <Button variant="outline" className="w-full" onClick={() => setModalType("")}>
//               Close Voice Chat
//             </Button>
//           </DialogContent>
//         </Dialog>
//       )}
//     </div>
//   );
// }


























// "use client";

// import React, { useState } from "react";
// import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"; // ShadCN Dialog components
// import { Button } from "@/components/ui/button"; // ShadCN Button components
// import { MessageCircleIcon, MicIcon } from "lucide-react"; // Icons from lucide-react

// // Floating Button Component
// export function FloatingButton() {
//   const [isOpen, setIsOpen] = useState(false); // Track modal open state
//   const [isVisible, setIsVisible] = useState(true); // Track button visibility
//   const [modalType, setModalType] = useState(""); // Track which modal to open next (chat or voice)

//   const handleButtonClick = () => {
//     setIsVisible(false); // Hide button when clicked
//     setIsOpen(true); // Open the initial dialog/modal
//   };

//   const handleDialogClose = () => {
//     setIsOpen(false); // Close the dialog
//     setIsVisible(true); // Show button again when dialog closes
//   };

//   // Function to handle selection of "Chat with Me" or "Talk with Audio"
//   const handleSelection = (type) => {
//     setModalType(type); // Set the modal type to either 'chat' or 'voice'
//     setIsOpen(false); // Close the initial modal
//   };

//   return (
//     <div>
//       {/* Floating Button */}
//       {isVisible && (
//         <div
//           className="fixed bottom-5 right-5 z-50 flex h-20 w-20 items-center justify-center rounded-full bg-primary shadow-lg hover:bg-primary/90 focus:outline-none animate-bounce"
//           onClick={handleButtonClick}
//         >
//           <video
//             autoPlay
//             loop
//             muted
//             className="h-full w-full object-contain rounded-full"
//           >
//             <source src="/hi.mp4" type="video/mp4" />
//             Your browser does not support the video tag.
//           </video>
//         </div>
//       )}

//       {/* Initial Popup Modal */}
//       <Dialog open={isOpen} onOpenChange={handleDialogClose}>
//         <DialogContent className="flex flex-col items-center gap-8 rounded-lg shadow-xl bg-white w-[90vw] h-[80vh] max-w-[1200px] p-10">
//           <h2 className="text-3xl font-semibold text-center mb-8">How do you want us to communicate?</h2>

//           {/* Cards for Chat with Me and Talk with Audio */}
//           <div className="flex w-full justify-between gap-10">
//             {/* Card 1: Chat with Me */}
//             <div className="flex-1 p-8 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-primary/10 transition-all" onClick={() => handleSelection("chat")}>
//               <MessageCircleIcon className="h-16 w-16 text-primary" />
//               <h3 className="text-xl font-semibold">Chat with Me</h3>
//               <p className="text-gray-600">Text-based communication for quick exchanges.</p>
//             </div>

//             {/* Card 2: Talk with Audio */}
//             <div className="flex-1 p-8 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-primary/10 transition-all" onClick={() => handleSelection("voice")}>
//               <MicIcon className="h-16 w-16 text-primary" />
//               <h3 className="text-xl font-semibold">Talk with Audio</h3>
//               <p className="text-gray-600">Voice-based interaction for more personal conversations.</p>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Modal for Chat */}
//       {modalType === "chat" && (
//         <Dialog open={true} onOpenChange={() => setModalType("")}>
//           <DialogContent className="flex flex-col items-center gap-4 rounded-lg shadow-xl bg-white w-[80vw] h-[70vh] max-w-[1000px] p-8">
//             <h2 className="text-2xl font-semibold text-center">Chat with Me</h2>
//             <p>Implement your chat UI here!</p>
//             {/* Chat UI */}
//             <Button variant="outline" className="w-full" onClick={() => setModalType("")}>
//               Close Chat
//             </Button>
//           </DialogContent>
//         </Dialog>
//       )}

//       {/* Modal for Voice */}
//       {modalType === "voice" && (
//         <Dialog open={true} onOpenChange={() => setModalType("")}>
//           <DialogContent className="flex flex-col items-center gap-4 rounded-lg shadow-xl bg-white w-[80vw] h-[70vh] max-w-[1000px] p-8">
//             <h2 className="text-2xl font-semibold text-center">Talk with Audio</h2>
//             <p>Implement your audio UI here!</p>
//             {/* Audio UI */}
//             <Button variant="outline" className="w-full" onClick={() => setModalType("")}>
//               Close Voice Chat
//             </Button>
//           </DialogContent>
//         </Dialog>
//       )}
//     </div>
//   );
// }




































// "use client";

// import React, { useState } from "react";
// import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { CatIcon } from "lucide-react";

// import Animatedgif from "react" 

// // Floating Button Component
// export function FloatingButton() {
//   const [isOpen, setIsOpen] = useState(false); // Track modal open state
//   const [isVisible, setIsVisible] = useState(true); // Track button visibility

//   const handleButtonClick = () => {
//     setIsVisible(false); // Hide button when clicked
//     setIsOpen(true); // Open the dialog
//   };

//   const handleDialogClose = () => {
//     setIsOpen(false); // Close the dialog
//     setIsVisible(true); // Show button again when dialog closes
//   };

//   return (
//     <div>
//       {/* Floating Button */}
//       {isVisible && (
//         <div
//           className="fixed bottom-5 right-20 z-50 flex h-20 w-25 items-center justify-center rounded-full bg-primary shadow-lg hover:bg-primary/90 focus:outline-none animate-bounce"
//           onClick={handleButtonClick}
//         >

//              <video autoPlay loop muted className="w-50  h-50 object-contain h-full w-full p-0 rounded-full flex items-center justify-center">
//                     <source src="/hi.mp4" type="video/mp4" />
//                     Your browser does not support the video tag.
//                   </video>

//           {/* <Button
//             variant="ghost"
//             className="h-full w-full p-0 rounded-full flex items-center justify-center"
//           >
//             <CatIcon className="text-white h-8 w-8" />
//           </Button> */}
//         </div>
//       )}

//       {/* Popup Modal */}
//       <Dialog open={isOpen} onOpenChange={handleDialogClose}>
//         <DialogContent className="flex flex-col items-center gap-4 rounded-lg shadow-md bg-white">
//           <h2 className="text-lg font-semibold text-center">Choose Messaging Mode</h2>
//           <Button
//             variant="default"
//             className="w-full"
//             onClick={() => {
//               alert("Voice Messaging Selected");
//               handleDialogClose();
//             }}
//           >
//             Voice Messaging
//           </Button>
//           <Button
//             variant="outline"
//             className="w-full"
//             onClick={() => {
//               alert("Text Messaging Selected");
//               handleDialogClose();
//             }}
//           >
//             Text Messaging
//           </Button>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
