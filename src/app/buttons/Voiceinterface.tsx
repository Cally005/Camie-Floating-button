"use client"
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";
import Vapi from "@vapi-ai/web";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Moon, Sun } from "lucide-react";

export default function VoiceInterface() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  const { resolvedTheme, setTheme } = useTheme();
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [bookMeeeting, setBookMeeting] = useState(false);
  const [meetingResponse, setMeetingResponse] = useState(null);
  const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY as string)
  const [assistantIsSpeaking, setAssistantIsSpeaking] = useState(false);





  
  
  // Enhanced event listeners
  useEffect(() => {
    vapi.on("call-start", () => {
      setConnecting(false);
      setConnected(true);
    });

    vapi.on("call-end", () => {
      setConnecting(false);
      setConnected(false);
    });

    vapi.on("speech-start", () => {
      setAssistantIsSpeaking(true);
    });

    vapi.on("speech-end", () => {
      setAssistantIsSpeaking(false);
    });

    vapi.on("message", (message) => {
      console.log(message);
    });

    vapi.on("message", (message) => {
      if (
        message.type === "function-call" &&
        message.functionCall.name === "bookAppointmentModal"
      ) {
        setBookMeeting(true);
      }
    });
  }, []);

  // Enhanced call start handler
  const startCallInline = async () => {
    try {

       // If already speaking, stop the call
       if (isSpeaking) {
        endCall();
        return;
      }
      // Request microphone permission first
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // If permission is granted, proceed with starting the call
      setConnecting(true);
      setIsSpeaking(true);
      setMicPermission(true);
      
      // Start the Vapi call
      const data = await vapi.start(assistantOptions as object);
      console.log(data);
    } catch (error) {
      // Handle permission denial or other errors
      console.error("Microphone access denied:", error);
      setMicPermission(false);
      setIsSpeaking(false);
      setConnecting(false);
      
      // Optionally, show a user-friendly error message
      alert("Microphone access is required to start the call. Please grant permission.");
    }
  };

  // Enhanced end call handler
  const endCall = () => {
    vapi.stop();
    setIsSpeaking(false);
    setConnected(false);
  };

  // Maintained mic tap handler
  const handleMicTap = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission(true);
      setIsSpeaking((prev) => !prev);
      console.log("Microphone connected:", stream);
    } catch (error) {
      console.error("Microphone access denied:", error);
      setMicPermission(false);
    }
  };

  // Meeting response handler
  useEffect(() => {
    if (meetingResponse) {
      console.log(meetingResponse)
      vapi.send({
        type: "add-message",
        message: {
          role: "system",
          content: meetingResponse,
        },
      });
    }
  }, [meetingResponse, vapi]);

  // Original assistant options
  const assistantOptions = {
    name: "Vapi's Pizza Front Desk",
    firstMessage: "Vappy's Pizzeria speaking, how can I help you?",
    transcriber: {
      provider: "deepgram",
      model: "nova-2",
      language: "en-US",
    },
    voice: {
      provider: "playht",
      voiceId: "jennifer",
    },
    model: {
      provider: "openai",
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `[Identity]
          You are Ruby, a friendly and knowledgeable voice agent. You work for a dental clinic called Camie Hub.
          
          [Goals]
          Your role is to act as a receptionist for the dental clinic. You will help patients schedule appointments.
          
          [Style & Tone]
          
          Be polite, patient, and professional.
          Maintain a warm, welcoming, and reassuring tone.
          Be concise and clear, as you are currently operating as a Voice Conversation.
          [Tools]
          
          You have access to an appointment booking tool to help patients schedule their appointments.
          [Response Guideline]
          
          Greet Mario
          Introduce yourself as Ruby, the virtual receptionist for the dental clinic.
          
          
          Move to the next phase, offering to help them schedule or reschedule an appointment.
          Ask if they are ready to schedule an appointment with the dentist or hygienist.
          Once they agree, directly call the bookAppointmentModal function 
          [The Appointment Booking Process] and remain quiet  till you get a direct response from the user that they completed booking the meeting with the modal.
          `,
        },
      ],
      functions: [
        {
          name: "bookAppointmentModal",
          description: "Used to book the appointment for the user.",
          parameters: {
            type: "object",
            properties: {
              book: {
                type: "boolean",
                description:
                  "This is set to true if the user wants to book a meeting, so as to open the modal.",
              },
            },
          },
        },
      ],
    },
  };

  

   // Render sound waves animation
   const SoundWaves = () => (
    <div className="absolute inset-0 flex justify-center items-center z-0 overflow-hidden">
      {[1, 2, 3].map((wave) => (
        <div 
          key={wave}
          className={`absolute h-[12px] w-36 
            ${resolvedTheme === 'dark' 
              ? 'bg-primary/30 ' 
              : 'bg-primary/50 '}
            rounded-full animate-pulse 
            ${wave === 1 ? 'left-[calc(50%-10rem)]' : wave === 2 ? 'left-[calc(50%-5rem)]' : 'left-[calc(50%+5rem)]'}
            ${wave === 1 ? 'delay-100' : wave === 2 ? 'delay-300' : 'delay-500'}`}
        ></div>
      ))}
    </div>
  );

  return (
      <div className="flex justify-center items-center mt-20 relative">
        <div className="flex justify-center items-center mt-auto relative w-full max-w-md">
          {/* Mic Card with integrated sound waves */}
          <Card
            className={`
              flex justify-center items-center w-80 h-80 mx-auto rounded-full 
              shadow-2xl transition-all duration-300 ease-in-out relative
              ${isSpeaking 
                ? 'bg-destructive/10 border-4 border-destructive/50 scale-105' 
                : 'bg-primary/10 hover:bg-primary/20'}
              cursor-pointer overflow-hidden
            `}
            onClick={startCallInline}
          >
            {/* Sound waves inside the circle when speaking */}
            {(isSpeaking || assistantIsSpeaking) && <SoundWaves />}
            
            <div className="relative z-10">
              {isSpeaking ? (
                <MicOff 
                  className="w-40 h-40 text-destructive animate-pulse" 
                  strokeWidth={1.5} 
                />
              ) : (
                <Mic 
                  className="w-40 h-40 text-primary group-hover:text-primary/80" 
                  strokeWidth={1.5} 
                />
              )}
            </div>
  
            {/* Pulse effect when speaking */}
            {isSpeaking && (
              <div className="absolute inset-0 bg-destructive/20 animate-ping rounded-full"></div>
            )}
          </Card>
  
          {/* Centered bottom text and theme toggle */}
          <div className="absolute bottom-[-7rem] left-1/2 transform -translate-x-1/2 text-center flex flex-col items-center">
            <p className={`
              transition-all duration-300 mb-2
              ${isSpeaking 
                ? 'text-destructive font-semibold' 
                : 'text-muted-foreground'}
            `}>
              {isSpeaking ? 'Conversation in Progress' : 'Start Conversation'}
            </p>
            
            {/* Theme toggle button */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="hover:bg-accent"
            >
              {resolvedTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
  
        {/* Modal remains the same */}
        <Modal
          isOpen={bookMeeeting}
          setOpen={setBookMeeting}
          vapiResponse={setMeetingResponse}
        />
      </div>
    );
  }
  
  // Modal component remains unchanged
  const Modal = ({ isOpen, setOpen, vapiResponse }:{isOpen: boolean; setOpen:  any; vapiResponse: any}) => {
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
                  src="https://tidycal.com/camie/camieai"
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





















//everthign working except button
// import { useEffect, useState } from "react";
// import { useTheme } from "next-themes";
// import { Card } from "@/components/ui/card";
// import Vapi from "@vapi-ai/web";
// import { Button } from "@/components/ui/button";







// export default function VoiceInterface() {
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [micPermission, setMicPermission] = useState<boolean | null>(null);
//   const { resolvedTheme } = useTheme();
//   const [connecting, setConnecting] = useState(false);
//   const [connected, setConnected] = useState(false);
//   const [bookMeeeting, setBookMeeting] = useState(false);
//   const [meetingResponse, setMeetingResponse] = useState(null);
//   const vapi = new Vapi (process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY as string)
//   const [assistantIsSpeaking, setAssistantIsSpeaking] = useState(false);


// // hook into Vapi events
// useEffect(() => {
//   vapi.on("call-start", () => {
//     setConnecting(false);
//     setConnected(true);

//     // setShowPublicKeyInvalidMessage(false);
//   });

//   vapi.on("call-end", () => {
//     setConnecting(false);
//     setConnected(false);

//     // setShowPublicKeyInvalidMessage(false);
//   });

//   vapi.on("speech-start", () => {
//     setAssistantIsSpeaking(true);
//   });

//   vapi.on("speech-end", () => {
//     setAssistantIsSpeaking(false);
//   });

//   // vapi.on("volume-level", (level) => {
//   //   setVolumeLevel(level);
//   // });

//   // vapi.on("error", (error) => {
//   //   console.error(error);

//     setConnecting(false);
//   //   if (isPublicKeyMissingError({ vapiError: error })) {
//   //     setShowPublicKeyInvalidMessage(true);
//   //   }
//   // });

//   vapi.on("message", (message) => {
//       // console.log("this is mario");
//       console.log(message);
//     });
//     vapi.on("message", (message) => {
//       if (
//         message.type === "function-call" &&
//         message.functionCall.name === "bookAppointmentModal"
//       ) {
//         setBookMeeting(true);
//       }
//     });
// }, []);

// // call start handler
// const startCallInline = async () => {
//   setConnecting(true);
//   const data = await vapi.start(assistantOptions as object);
//   console.log(data);
// };
// const endCall = () => {
//   vapi.stop();
// };

//   useEffect(() => {
//     if (meetingResponse) {
//       console.log(meetingResponse)
//       vapi.send({
//         type: "add-message",
//         message: {
//           role: "system",
//           content: meetingResponse,
//         },
//       });
//     }
//   }, [meetingResponse, vapi]);

// const assistantOptions = {
//     name: "Vapi’s Pizza Front Desk",
//     firstMessage: "Vappy’s Pizzeria speaking, how can I help you?",
//     transcriber: {
//       provider: "deepgram",
//       model: "nova-2",
//       language: "en-US",
//     },
//     voice: {
//       provider: "playht",
//       voiceId: "jennifer",
//     },
//     model: {
//       provider: "openai",
//       model: "gpt-4",
//       messages: [
//         {
//           role: "system",
//           content: `[Identity]
//           You are Ruby, a friendly and knowledgeable voice agent. You work for a dental clinic called Camie Hub.
          
//           [Goals]
//           Your role is to act as a receptionist for the dental clinic. You will help patients schedule appointments.
          
//           [Style & Tone]
          
//           Be polite, patient, and professional.
//           Maintain a warm, welcoming, and reassuring tone.
//           Be concise and clear, as you are currently operating as a Voice Conversation.
//           [Tools]
          
//           You have access to an appointment booking tool to help patients schedule their appointments.
//           [Response Guideline]
          
//           Greet Mario
//           Introduce yourself as Ruby, the virtual receptionist for the dental clinic.
          
          
//           Move to the next phase, offering to help them schedule or reschedule an appointment.
//           Ask if they are ready to schedule an appointment with the dentist or hygienist.
//           Once they agree, directly call the bookAppointmentModal function 
//           [The Appointment Booking Process] and remain quiet  till you get a direct response from the user that they completed booking the meeting with the modal.
//           `,
//         },
//       ],
//       functions: [
//         {
//           name: "bookAppointmentModal",
//           description: "Used to book the appointment for the user.",
//           parameters: {
//             type: "object",
//             properties: {
//               book: {
//                 type: "boolean",
//                 description:
//                   "This is set to true if the user wants to book a meeting, so as to open the modal.",
//               },
//             },
//           },
//         },
//       ],
//     },
//   };

//   // vapi.start(assistantId, assistantOptions as object);



//   // Function to handle microphone access
//   const handleMicTap = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       setMicPermission(true);
//       setIsSpeaking((prev) => !prev);
//       console.log("Microphone connected:", stream);
//     } catch (error) {
//       console.error("Microphone access denied:", error);
//       setMicPermission(false);
//     }
//   };

//   return (
//     <div className="flex justify-center items-center mt-20 relative">
//     <div className="flex justify-center items-center mt-auto relative w-full max-w-md">
//       {/* Sound Waves */}
//       {isSpeaking   && (
//         <div className="absolute inset-0 flex justify-center items-center z-0">
//           {/* Left Side Waves */}
//           <div className="absolute left-1/2 -translate-x-full flex space-x-2">
//             <div className="h-[12px] w-36 bg-teal-400 animate-waveLeft"></div>
//             <div className="h-[12px] w-36 bg-teal-400 animate-waveLeft delay-300"></div>
//             <div className="h-[12px] w-36 bg-teal-400 animate-waveLeft delay-600"></div>
//           </div>

//           {/* Right Side Waves */}
//           <div className="absolute right-1/2 translate-x-full flex space-x-2">
//             <div className="h-[12px] w-36 bg-teal-400 animate-waveRight"></div>
//             <div className="h-[12px] w-36 bg-teal-400 animate-waveRight delay-300"></div>
//             <div className="h-[12px] w-36 bg-teal-400 animate-waveRight delay-600"></div>
//           </div>
//         </div>
//       )}

//       {/* Mic Card */}
//       <Card
//         className={`bg-background flex justify-center items-center w-80 h-80 rounded-full cursor-pointer transition-transform z-10 relative ${
//           connected ? "scale-110" : "scale-100"
//         }`}
//         // onClick={handleMicTap}
//           onClick={startCallInline}
//           // isLoading={connecting}
//           // assistantIsSpeaking={assistantIsSpeaking}
         
//       >
//       <Button 
//           onClick={endCall}
//           >
//           <svg
//           xmlns="http://www.w3.org/2000/svg"
//           fill="none"
//           viewBox="0 0 24 24"
//           strokeWidth="1.5"
//           stroke="currentColor"
//           className={`w-40 h-40 ${
//             isSpeaking ? "text-primary" : "text-muted-foreground"
//           }`}
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
//           />
//         </svg>
//         </Button>
//       </Card>
//     </div>
//     <Modal
//         isOpen={bookMeeeting}
//         setOpen={setBookMeeting}
//         vapiResponse={setMeetingResponse}
//       />
//   </div>
// );
// }



// const Modal = ({ isOpen, setOpen, vapiResponse }:{isOpen: boolean; setOpen:  any; vapiResponse: any}) => {
//   const closeModal = () => {
//     setOpen(false);
//     vapiResponse(
//       "The user has booked the meeting greet and thank the user, but we also sell story books to help children brush well"
//     );
//   };

//   return (
//     <div>
//       {/* Modal */}
//       {isOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//           <div className="bg-white p-8 rounded-lg w-full max-w-3xl relative">
//             <div className="flex justify-between items-center">
//               <h2 className="text-xl font-semibold">Book a Meeting</h2>
//               <button onClick={closeModal} className="text-gray-600 text-xl">
//                 &times;
//               </button>
//             </div>
//             <p className="mt-4">Click below to schedule your meeting:</p>

//             {/* Calendly iframe */}
//             <div className="mt-4">
//               <iframe
//                 src="https://tidycal.com/camie/camieai" // Replace with your Calendly link
//                 width="100%"
//                 height="600"
//                 frameBorder="0"
//                 title="Calendly Scheduler"
//                 className="rounded-lg"
//               ></iframe>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };





// "use client";

// import { useState } from "react";
// import { useTheme } from "next-themes";
// import { Card } from "@/components/ui/card";
// import "../globals.css"; 
// export default function VoiceInterface() {
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [micPermission, setMicPermission] = useState<boolean | null>(null);
//   const { resolvedTheme } = useTheme();

//   // Function to handle microphone access
//   const handleMicTap = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       setMicPermission(true);
//       setIsSpeaking((prev) => !prev);
//       console.log("Microphone connected:", stream);
//     } catch (error) {
//       console.error("Microphone access denied:", error);
//       setMicPermission(false);
//     }
//   };

//   return (
//     <div className="flex justify-center items-center mt-20 relative">
//       <div className="flex justify-center items-center mt-auto relative w-full max-w-md">
//         {/* Sound Waves */}
//         {isSpeaking && (
//           <div className="absolute inset-0 flex justify-center items-center">
//             {/* Left Side Waves */}
//             <div className="absolute left-1/2 -translate-x-full flex space-x-2">
//               <div className="h-30 bg-blue-600 transition-all ease-in-out delay-300"></div>
//               <div className="sound-wave left-wave-2"></div>
//               <div className="sound-wave left-wave-3"></div>
//             </div>
            
//             {/* Right Side Waves */}
//             <div className="absolute right-1/2 translate-x-full flex space-x-2">
//               <div className="sound-wave right-wave-1"></div>
//               <div className="sound-wave right-wave-2"></div>
//               <div className="sound-wave right-wave-3"></div>
//             </div>
//           </div>
//         )}

//         {/* Mic Card */}
//         <Card
//           className={`bg-background flex justify-center items-center w-80 h-80 rounded-full cursor-pointer transition-transform z-10 relative ${
//             isSpeaking ? "scale-110" : "scale-100"
//           }`}
//           onClick={handleMicTap}
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             fill="none"
//             viewBox="0 0 24 24"
//             strokeWidth="1.5"
//             stroke="currentColor"
//             className={`w-40 h-40 ${isSpeaking ? 'text-primary' : 'text-muted-foreground'}`}
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
//             />
//           </svg>
//         </Card>
//       </div>
//     </div>
//   );
// }





