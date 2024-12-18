"use client"

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Moon, Sun } from "lucide-react";

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const [bookMeeeting, setBookMeeting] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const { resolvedTheme, setTheme } = useTheme();

  // Create thread on component mount
  useEffect(() => {
    const createThread = async () => {

    

      try {
        const response = await axios.post(
          "https://camie-ai.onrender.com/api/v0/ai/chat",
          {
            action: "create-thread",
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
       
     
        
        if (response.data.status) {
          setThreadId(response.data.data.id);
      
        } else {
          console.error("Thread ID creation failed:", response.data);
        }
      } catch (error) {
        console.error("Error creating thread:", error);
      }
    };
    
    createThread();
  }, []);

  const callCamieAIChatAPI = async (userMessage) => {

    console.log("Calling Camie AI Chat API with message:", userMessage);
    if (!threadId) {
      console.error("Thread ID not available");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "https://camie-ai.onrender.com/api/v0/ai/chat",
        {
          action: "start-stream",
          thread_id: threadId,
          question: userMessage,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

    
  
      console.log("API Response:", response.data);
      // Safely extract the AI response
      let aiResponse = 
        response.data?.data?.text?.value || 
        response.data?.data?.text || 
        response.data?.text || 
        "I'm sorry, but I couldn't generate a response.";

        console.log("response:", aiResponse);

        if (response.data.data.bookMeeting === true) {
          aiResponse = 'I will open a modal to book the meeting, in a few.'
          setMessages((prevMessages) => [
            ...prevMessages,
            { user: false, text: aiResponse }
          ]);
          await new Promise((resolve) => setTimeout(resolve, 1500));
          aiResponse = 'Let me know when you are done.'
          setMessages((prevMessages) => [
            ...prevMessages,
            { user: false, text: aiResponse }
          ]);
          
          await new Promise((resolve) => setTimeout(resolve, 3000));
          
          setBookMeeting(true);
          setLoading(false);

          return
        }
        

      // Stop loading and add AI message
      setLoading(false);
      setMessages((prevMessages) => [
        ...prevMessages,
        { user: false, text: aiResponse }
      ]);

    } catch (error) {
      console.error("Error calling Camie AI Chat API:", error);
    
      setLoading(false);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          user: false,
          text: "Sorry, there was an error processing your request. Please try again.",
        },
      ]);
    }
  };



  const handleSendMessage = () => {
    if (loading || !inputText.trim()) return;

    if (!hideHeader) setHideHeader(true);

    const newMessage = { user: true, text: inputText };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    callCamieAIChatAPI(inputText);

    setInputText("");
  };

  // Scroll to bottom effect
  useEffect(() => {
    if (messagesEndRef.current && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <div className="flex flex-col w-full h-full">
      {!hideHeader && (
        <div className="p-4 text-center border-b">
          <h2 className="text-xl font-bold text-primary/70">Hello, there</h2>
          <p className="text-sm text-muted-foreground">How can I help you today?</p>
        </div>
      )}

      {/* Messages Container with Constrained Scrolling */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{
          maxHeight: 'calc(100% - 120px)',
          overflowY: 'auto'
        }}
      >
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${
              message.user 
                ? 'justify-end' 
                : 'justify-start'
            }`}
          >
            <div className="flex items-start gap-3 max-w-[90%]">
              {!message.user && (
                <img 
                  src="/camie_logo.png" 
                  alt="AI" 
                  className="w-8 h-8 rounded-full shrink-0"
                />
              )}
              <div className={`
                max-w-full p-3 rounded-lg break-words
                ${message.user 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-foreground'
                }
              `}>
                <p>{message.text}</p>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start items-center gap-3">
            <img 
              src="/camie_logo.png" 
              alt="AI" 
              className="w-8 h-8 rounded-full animate-rotate"
            />
            <div className="space-y-2 w-full max-w-xs">
              <div className="h-3 bg-gradient-to-r from-indigo-500 via-black to-blue-500 bg-[length:200%_100%] animate-animate rounded"></div>
              <div className="h-3 bg-gradient-to-r from-indigo-500 via-black to-blue-500 bg-[length:200%_100%] rounded animate-animate w-5/6"></div>
              <div className="h-3 bg-gradient-to-r from-indigo-500 via-black to-blue-500 bg-[length:200%_100%] rounded animate-animate w-4/6"></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="relative">
          <Input 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (loading && e.key === "Enter") {
                e.preventDefault();
                return;
              }
              if (e.key === "Enter") handleSendMessage();
            }}
            placeholder="Ask Camie..."
            disabled={loading}
            className={`pr-20 ${
              loading 
                ? 'opacity-50 cursor-not-allowed' 
                : ''
            }`}
          />
          <div className="absolute right-0 top-0 h-full flex items-center space-x-2 pr-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="hover:bg-accent"
            >
              {resolvedTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleSendMessage}
              disabled={!inputText.trim() || loading}
              className={`hover:bg-primary/10 ${
                loading 
                  ? 'opacity-50 cursor-not-allowed' 
                  : ''
              }`}
            >
              <Send className="h-5 w-5 text-primary" />
            </Button>
          </div>
        </div>
      </div>

        {/* Modal remains the same */}
        <Modal
          isOpen={bookMeeeting}
          setOpen={setBookMeeting}
         
        />
    </div>
  );
}

 // Modal component remains unchanged
  const Modal = ({ isOpen, setOpen })=> {
    const closeModal = () => {
      setOpen(false);
      
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












//tping effect is giving errors
// "use client"


// import { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { useTheme } from "next-themes";
// import { 
//   Card, 
//   CardContent 
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Send, Moon, Sun } from "lucide-react";

// export default function ChatInterface() {
//   const [messages, setMessages] = useState([]);
//   const [inputText, setInputText] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [hideHeader, setHideHeader] = useState(false);
//   const [threadId, setThreadId] = useState(null);
//   const messagesEndRef = useRef(null);
//   const messagesContainerRef = useRef(null);
//   const [typingEffect, setTypingEffect] = useState("");
//   const [isTyping, setIsTyping] = useState(false);
//   const { resolvedTheme, setTheme } = useTheme();


//   // Create thread on component mount
//   useEffect(() => {
//     console.log("Component mounted. Creating thread...");
//     const createThread = async () => {
//       try {
//         const response = await axios.post(
//           "https://camie-ai.onrender.com/api/v0/ai/chat",
//           {
//             action: "create-thread",
//           },
          
//           {
//             headers: {
//               "Content-Type": "application/json",
//             },
//           }
//         );
//         console.log("Thread creation response:", response.data);
        
//         if (response.data.status) {
//           setThreadId(response.data.data.id);
//           console.log("Thread ID created:", response.data.data.id);
//         } else {
//           console.error("Thread ID creation failed:", response.data);
//         }
//       } catch (error) {
//         console.error("Error creating thread:", error);
//       }
//       console.log(threadId)
//     };
    

//     createThread();
//   }, []);




// const animateTyping = (text) => {
//   // Ensure text is a string and has length
//   const safeText =  (text || '');

//   setIsTyping(true);
//   setTypingEffect("");
//   let index = 0;

//   const interval = setInterval(() => {
//     if (index < safeText.length) {
//       setTypingEffect((prev) => prev + safeText[index]);
//       index++;
//     } else {
//       clearInterval(interval);
//       setIsTyping(false);
//       setMessages((prevMessages) => [
//         ...prevMessages,
//         { user: false, text: safeText }
//       ]);
//       setTypingEffect("");
//     }
//   }, 20); // Adjust typing speed here (lower = faster)
// };

//   const callCamieAIChatAPI = async (userMessage) => {
//     if (!threadId) {
//       console.error("Thread ID not available");
//       return;
//     }

//     try {
//       setLoading(true);

//       const response = await axios.post(
//         "https://camie-ai.onrender.com/api/v0/ai/chat",
//         {
//           action: "start-stream",
//           thread_id: threadId,
//           question: userMessage,
//         },
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       console.log("Sending user message to API:", userMessage);



//       const aiResponse = response.data.data.text.value || response.data.text;

//       // Stop loading and start typing animation
//       setLoading(false);
//       animateTyping(aiResponse);

//     } catch (error) {
//       console.error("Error calling Camie AI Chat API:", error);
    
//       setLoading(false);
//       setMessages((prevMessages) => [
//         ...prevMessages,
//         {
//           user: false,
//           text: "Sorry, there was an error processing your request. Please try again.",
//         },
//       ]);
//     }
//   };

//      const handleSend = () => {
//      if (inputText.trim() !== "") {
//        // Add user message
      
//     if (!hideHeader) setHideHeader(true);

//     const newMessage = { user: true, text: inputText };
//     setMessages((prevMessages) => [...prevMessages, newMessage]);
//     callCamieAIChatAPI(inputText);
       
//        setInputText("") // Clear input field
//      }
//   }


//   const handleSendMessage = () => {

//     if (loading || isTyping || !inputText.trim()) return;
//     if (!inputText.trim()) return;

//     if (!hideHeader) setHideHeader(true);

//     const newMessage = { user: true, text: inputText };
//     setMessages((prevMessages) => [...prevMessages, newMessage]);

//     callCamieAIChatAPI(inputText);

//     setInputText("");
//   };

//   useEffect(() => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages, loading, typingEffect]);

//   const getTextColor = (isUser) => {
//     return resolvedTheme === "dark"
//       ? isUser
//         ? "text-white"
//         : "text-gray-200"
//       : isUser
//       ? "text-black"
//       : "text-gray-800";
//   };

//   useEffect(() => {
//     // Scroll to bottom when messages change
//     if (messagesEndRef.current && messagesContainerRef.current) {
//       messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
//     }
//   }, [messages, loading, typingEffect]);


 
//   return (
//     <div className="flex flex-col w-full h-full">
//       {!hideHeader && (
//         <div className="p-4 text-center border-b">
//           <h2 className="text-xl font-bold text-primary/70">Hello, there</h2>
//           <p className="text-sm text-muted-foreground">How can I help you today?</p>
//         </div>
//       )}

//       {/* Messages Container with Constrained Scrolling */}
//       <div 
//         ref={messagesContainerRef}
//         className="flex-1 overflow-y-auto p-4 space-y-4"
//         style={{
//           maxHeight: 'calc(100% - 120px)', // Adjust based on header and input height
//           overflowY: 'auto'
//         }}
//       >
//         {messages.map((message, index) => (
//           <div 
//             key={index} 
//             className={`flex ${
//               message.user 
//                 ? 'justify-end' 
//                 : 'justify-start'
//             }`}
//           >
//             <div className="flex items-start gap-3 max-w-[90%]">
//               {!message.user && (
//                 <img 
//                   src="/camie_logo.png" 
//                   alt="AI" 
//                   className="w-8 h-8 rounded-full shrink-0"
//                 />
//               )}
//               <div className={`
//                 max-w-full p-3 rounded-lg break-words
//                 ${message.user 
//                   ? 'bg-primary text-primary-foreground' 
//                   : 'bg-muted text-foreground'
//                 }
//               `}>
//                 <p>{message.text}</p>
//               </div>
//             </div>
//           </div>
//         ))}

//         {loading && (
//           <div className="flex justify-start items-center gap-3">
//             <img 
//               src="/camie_logo.png" 
//               alt="AI" 
//               className="w-8 h-8 rounded-full animate-rotate"
//             />
//             <div className="space-y-2 w-full max-w-xs">
//               <div className="h-3 bg-gradient-to-r from-indigo-500 via-black  to-blue-500  bg-[length:200%_100%] animate-animate  rounded"></div>
//               <div className="h-3 bg-gradient-to-r from-indigo-500 via-black to-blue-500 bg-[length:200%_100%] rounded animate-animate w-5/6"></div>
//               <div className="h-3 bg-gradient-to-r from-indigo-500 via-black to-blue-500 bg-[length:200%_100%] rounded animate-animate w-4/6"></div>
//             </div>
//           </div>
//         )}

//         {isTyping && (
//           <div className="flex justify-start items-center gap-3">
//             <img 
//               src="/camie_logo.png" 
//               alt="AI" 
//               className="w-8 h-8 rounded-full"
//             />
//             <div className={`
//               max-w-[70%] p-3 rounded-lg bg-muted text-foreground
//             `}>
//               <p>
//                 {typingEffect}
//                 <span className="animate-blink">|</span>
//               </p>
//             </div>
//           </div>
//         )}

//         <div ref={messagesEndRef} />
//       </div>

//       {/* Input Area */}
//       <div className="p-4 border-t">
//         <div className="relative">
//           <Input 
//             value={inputText}
//             onChange={(e) => setInputText(e.target.value)}
//             onKeyDown={(e) => {
//               if ((loading || isTyping) && e.key === "Enter") {
//                 e.preventDefault();
//                 return;
//               }
//               if (e.key === "Enter") handleSendMessage();
//             }}
//             placeholder="Ask Camie..."
//             disabled={loading || isTyping}
//             className={`pr-20 ${
//               (loading || isTyping) 
//                 ? 'opacity-50 cursor-not-allowed' 
//                 : ''
//             }`}
//           />
//           <div className="absolute right-0 top-0 h-full flex items-center space-x-2 pr-2">
//             <Button 
//               variant="ghost" 
//               size="icon" 
//               onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
//               className="hover:bg-accent"
//             >
//               {resolvedTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
//             </Button>
//             <Button 
//               variant="ghost" 
//               size="icon" 
//               onClick={handleSendMessage}
//               disabled={!inputText.trim() || loading || isTyping}
//               className={`hover:bg-primary/10 ${
//                 (loading || isTyping) 
//                   ? 'opacity-50 cursor-not-allowed' 
//                   : ''
//               }`}
//             >
//               <Send className="h-5 w-5 text-primary" />
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }














// "use client";

// import { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { useTheme } from "next-themes";
// import { Button } from "@/components/ui/button";
// import { FiSend } from "react-icons/fi";
// import ReactMarkdown from 'react-markdown';
// import remarkGfm from 'remark-gfm';
// import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

// export default function ChatInterface() {
//   const [messages, setMessages] = useState([]);
//   const [inputText, setInputText] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [hideHeader, setHideHeader] = useState(false);
//   const [threadId, setThreadId] = useState(null);
//   const messagesEndRef = useRef(null);
//   const [typingEffect, setTypingEffect] = useState("");
//   const [isTyping, setIsTyping] = useState(false);
//   const { resolvedTheme } = useTheme();
//   const { theme, setTheme } = useTheme();

//   // Create thread on component mount
//   useEffect(() => {
//     const createThread = async () => {
//       try {
//         const response = await axios.post(
//           "https://camie-ai.onrender.com/api/v0/ai/chat",
//           {
//             action: "create-thread",
//           },
//           {
//             headers: {
//               "Content-Type": "application/json",
//             },
//           }
//         );
//         console.log(response)

//         if (response.data.status) {
//           setThreadId(response.data.data.id);
//         } else {
//           console.error("Thread ID creation failed:", response.data);
//         }
//       } catch (error) {
//         console.error("Error creating thread:", error);
//       }
//     };

//     createThread();
//   }, []);

//   const animateTyping = (text) => {
//     setIsTyping(true);
//     setTypingEffect("");
//     let index = 0;

//     const interval = setInterval(() => {
//       if (index < text.length) {
//         setTypingEffect((prev) => prev + text[index]);
//         index++;
//       } else {
//         clearInterval(interval);
//         setIsTyping(false);
//         setMessages((prevMessages) => [
//           ...prevMessages,
//           { user: false, text: text }
//         ]);
//         setTypingEffect("");
//       }
//     }, 10); // Adjust typing speed here (lower = faster)
//   };

//   const callCamieAIChatAPI = async (userMessage) => {
//     if (!threadId) {
//       console.error("Thread ID not available");
//       return;
//     }

//     try {
//       setLoading(true);

//       const response = await axios.post(
//         "https://camie-ai.onrender.com/api/v0/ai/chat",
//         {
//           action: "start-stream",
//           thread_id: threadId,
//           question: userMessage,
//         },
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       const aiResponse = response.data.data.text.value || response.data.text;

//       // Stop loading and start typing animation
//       setLoading(false);
//       animateTyping(aiResponse);

//     } catch (error) {
//       console.error("Error calling Camie AI Chat API:", error);
    
//       setLoading(false);
//       setMessages((prevMessages) => [
//         ...prevMessages,
//         {
//           user: false,
//           text: "Sorry, there was an error processing your request. Please try again.",
//         },
//       ]);
//     }
//   };

//   const handleSendMessage = () => {
//     if (!inputText.trim()) return;

//     if (!hideHeader) setHideHeader(true);

//     const newMessage = { user: true, text: inputText };
//     setMessages((prevMessages) => [...prevMessages, newMessage]);

//     callCamieAIChatAPI(inputText);

//     setInputText("");
//   };

//   useEffect(() => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages, loading, typingEffect]);

//   const getTextColor = (isUser) => {
//     return resolvedTheme === "dark"
//       ? isUser
//         ? "text-white"
//         : "text-gray-200"
//       : isUser
//       ? "text-black"
//       : "text-gray-800";
//   };

//   // Custom markdown components
//   const MarkdownComponents = {
//     code({ node, inline, className, children, ...props }) {
//       const match = /language-(\w+)/.exec(className || '');
//       return !inline && match ? (
//         <SyntaxHighlighter
//           style={oneDark}
//           language={match[1]}
//           PreTag="div"
//           {...props}
//         >
//           {String(children).replace(/\n$/, '')}
//         </SyntaxHighlighter>
//       ) : (
//         <code className={`${className} inline-code`} {...props}>
//           {children}
//         </code>
//       );
//     },
//     h1: ({node, ...props}) => <h1 className="text-3xl font-bold mb-4" {...props} />,
//     h2: ({node, ...props}) => <h2 className="text-2xl font-semibold mb-3" {...props} />,
//     h3: ({node, ...props}) => <h3 className="text-xl font-medium mb-2" {...props} />,
//     ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3" {...props} />,
//     ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3" {...props} />,
//     a: ({node, ...props}) => <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
//   };

//   return (
//     <div className="flex max-w-screen-lg flex-col p-4">
//       {!hideHeader && (
//         <header
//           className={`p-4 max-w-screen-lg mx-auto mt-7vh ${
//             resolvedTheme === "dark" ? "text-white" : "text-black"
//           }`}
//         >
//           <h2 className="text-4xl font-bold bg-clip-text text-red-500/50 w-fit">
//             Hello, there
//           </h2>
//           <h2 className="text-2xl font-bold">How can I help you today?</h2>
//         </header>
//       )}

//       <div className="w-[900px] h-[580px] overflow-y-auto p-4 mb-5">
//         {messages.map((message, index) => (
//           <div key={index} className="group mb-4">
//             <div className="flex items-start w-full gap-6">
//               <img
//                 className="w-10 h-10 mt-8 rounded-full object-cover shrink-0"
//                 src={message.user ? "/3R.jpg" : "/camie_logo.png"}
//                 alt={message.user ? "user" : "AI"}
//               />
//               {message.user ? (
//                 <p
//                   className={`mt-8 break-words w-[calc(100%-3rem)] ${getTextColor(
//                     true
//                   )}`}
//                 >
//                   {message.text}
//                 </p>
//               ) : (
//                 <div
//                   className={`mt-8 break-words w-[calc(100%-3rem)] ${getTextColor(
//                     false
//                   )}`}
//                 >
//                   <ReactMarkdown 
//                     components={MarkdownComponents}
//                     remarkPlugins={[remarkGfm]}
//                   >
//                     {message.text}
//                   </ReactMarkdown>
//                 </div>
//               )}
//             </div>
//           </div>
//         ))}
//         {loading && (
//           <div className="max-w-screen-lg mt-6 group">
//             <div className="flex items-center w-full gap-6">
//               <img
//                 className="w-10 h-10 rounded-lg object-cover self-start animate-rotate"
//                 src="/camie_logo.png"
//                 alt="AI"
//               />
//               <div className="flex w-full flex-col gap-3.5">
//                 <div className="w-full bg-gradient-to-r from-indigo-500 via-black to-blue-500 h-5 bg-[length:200%_100%] animate-animate rounded-sm"></div>
//                 <div className="w-5/6 bg-gradient-to-r from-indigo-500 via-black to-blue-500 h-5 bg-[length:200%_100%] animate-animate rounded-sm"></div>
//                 <div className="w-4/5 bg-gradient-to-r from-indigo-500 via-black to-blue-500 h-5 bg-[length:200%_100%] animate-animate rounded-sm"></div>
//               </div>
//             </div>
//           </div>
//         )}
//         {isTyping && (
//           <div className="group mb-4">
//             <div className="flex items-start w-full gap-6">
//               <img
//                 className="w-10 h-10 mt-8 rounded-full object-cover shrink-0"
//                 src="/camie_logo.png"
//                 alt="AI"
//               />
//               <div
//                 className={`mt-8 break-words w-[calc(100%-3rem)] ${getTextColor(
//                   false
//                 )}`}
//               >
//                 <ReactMarkdown 
//                   components={MarkdownComponents}
//                   remarkPlugins={[remarkGfm]}
//                 >
//                   {typingEffect}
//                 </ReactMarkdown>
//                 <span className="animate-blink">|</span>
//               </div>
//             </div>
//           </div>
//         )}
//         <div ref={messagesEndRef} />
//       </div>

//       <div
//         className={`fixed bottom-0 w-full p-4 ${
//           resolvedTheme === "dark" ? "bg-black/50" : "bg-white/50"
//         }`}
//       >
//         <div className="w-3/4 flex h-14">
//           <input
//             type="text"
//             value={inputText}
//             onChange={(e) => setInputText(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
//             className={`w-3/4 h-full p-3 rounded-full focus:outline-none ${
//               resolvedTheme === "dark"
//                 ? "bg-gray-800 text-white placeholder-gray-400 focus:bg-gray-700"
//                 : "bg-blue-400 text-black placeholder-black focus:bg-blue-200"
//             }`}
//             placeholder="Ask Camie..."
//           />
//           <button
//             onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
//             className="px-2 py-1 bg-gray-300 rounded-full"
//           >
//             {resolvedTheme === "dark" ? "🌞" : "🌙"}
//           </button>
//           <button onClick={handleSendMessage} className="ml-2 text-blue-500">
//             <FiSend size={24} />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


//saving the change to be made on teh text

// <div
//         className={`fixed bottom-0 w-full p-4 ${
//           resolvedTheme === "dark" ? "bg-black/50" : "bg-white/50"
//         }`}
//       >
//         <div className="w-3/4 relative flex items-center">
//           <div className="relative w-full">
//             <input
//               type="text"
//               value={inputText}
//               onChange={(e) => setInputText(e.target.value)}
//               onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
//               className={`w-full h-14 pl-4 pr-24 rounded-full focus:outline-none ${
//                 resolvedTheme === "dark"
//                   ? "bg-gray-800 text-white placeholder-gray-400 focus:bg-gray-700"
//                   : "bg-blue-400 text-black placeholder-black focus:bg-blue-200"
//               }`}
//               placeholder="Ask Camie..."
//               disabled={loading || isTyping}
//             />
//             <div className="absolute inset-y-0 right-0 flex items-center pr-2">
//               <button 
//                 onClick={toggleTheme} 
//                 className="mr-2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
//               >
//                 {resolvedTheme === "dark" ? <FiSun /> : <FiMoon />}
//               </button>
//               <button 
//                 onClick={handleSendMessage} 
//                 disabled={loading || isTyping || !inputText.trim()}
//                 className={`
//                   text-blue-500 
//                   ${(loading || isTyping || !inputText.trim()) ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-700'}
//                 `}
//               >
//                 <FiSend size={24} />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
    
  
























//\yping effect working well
// "use client";

// import { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { useTheme } from "next-themes";
// import { Button } from "@/components/ui/button";
// import { FiSend } from "react-icons/fi";

// export default function ChatInterface() {
//   const [messages, setMessages] = useState([]);
//   const [inputText, setInputText] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [hideHeader, setHideHeader] = useState(false);
//   const [threadId, setThreadId] = useState(null);
//   const messagesEndRef = useRef(null);
//   const [typingEffect, setTypingEffect] = useState("");
//   const [isTyping, setIsTyping] = useState(false);
//   const { resolvedTheme } = useTheme();
//   const { theme, setTheme } = useTheme();

//   // Create thread on component mount
//   useEffect(() => {
//     const createThread = async () => {
//       try {
//         const response = await axios.post(
//           "https://camie-ai.onrender.com/api/v0/ai/chat",
//           {
//             action: "create-thread",
//           },
//           {
//             headers: {
//               "Content-Type": "application/json",
//             },
//           }
//         );

//         if (response.data.status) {
//           setThreadId(response.data.data.id);
//         } else {
//           console.error("Thread ID creation failed:", response.data);
//         }
//       } catch (error) {
//         console.error("Error creating thread:", error);
//       }
//     };

//     createThread();
//   }, []);

//   const animateTyping = (text) => {
//     setIsTyping(true);
//     setTypingEffect("");
//     let index = 0;

//     const interval = setInterval(() => {
//       if (index < text.length) {
//         setTypingEffect((prev) => prev + text[index]);
//         index++;
//       } else {
//         clearInterval(interval);
//         setIsTyping(false);
//         setMessages((prevMessages) => [
//           ...prevMessages,
//           { user: false, text: text }
//         ]);
//         setTypingEffect("");
//       }
//     }, 20); // Adjust typing speed here (lower = faster)
//   };

//   const callCamieAIChatAPI = async (userMessage) => {
//     if (!threadId) {
//       console.error("Thread ID not available");
//       return;
//     }

//     try {
//       setLoading(true);

//       const response = await axios.post(
//         "https://camie-ai.onrender.com/api/v0/ai/chat",
//         {
//           action: "start-stream",
//           thread_id: threadId,
//           question: userMessage,
//         },
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       const aiResponse = response.data.data.text.value || response.data.text;

//       // Stop loading and start typing animation
//       setLoading(false);
//       animateTyping(aiResponse);

//     } catch (error) {
//       console.error("Error calling Camie AI Chat API:", error);
    
//       setLoading(false);
//       setMessages((prevMessages) => [
//         ...prevMessages,
//         {
//           user: false,
//           text: "Sorry, there was an error processing your request. Please try again.",
//         },
//       ]);
//     }
//   };

//      const handleSend = () => {
//      if (inputText.trim() !== "") {
//        // Add user message
      
//     if (!hideHeader) setHideHeader(true);

//     const newMessage = { user: true, text: inputText };
//     setMessages((prevMessages) => [...prevMessages, newMessage]);
//     callCamieAIChatAPI(inputText);
       
//        setInputText("") // Clear input field
//      }
//   }


//   const handleSendMessage = () => {
//     if (!inputText.trim()) return;

//     if (!hideHeader) setHideHeader(true);

//     const newMessage = { user: true, text: inputText };
//     setMessages((prevMessages) => [...prevMessages, newMessage]);

//     callCamieAIChatAPI(inputText);

//     setInputText("");
//   };

//   useEffect(() => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages, loading, typingEffect]);

//   const getTextColor = (isUser) => {
//     return resolvedTheme === "dark"
//       ? isUser
//         ? "text-white"
//         : "text-gray-200"
//       : isUser
//       ? "text-black"
//       : "text-gray-800";
//   };

//   return (
//     <div className="flex flex-col items-center gap-4 rounded-lg     w-[40vw] h-[90vh] max-w-screen-2xl  p-8">
//       {!hideHeader && (
//         <header
//           className={`p-4 max-w-screen-lg mx-auto mt-7vh ${
//             resolvedTheme === "dark" ? "text-white" : "text-black"
//           }`}
//         >
//           <h2 className="text-4xl font-bold bg-clip-text text-red-500/50 w-fit">
//             Hello, there
//           </h2>
//           <h2 className="text-2xl font-bold">How can I help you today?</h2>
//         </header>
//       )}

//       <div className="w-[500px] h-[580px]  mb-5">
//         {messages.map((message, index) => (
//           <div key={index} className="group  mb-4">
//             <div className="flex  gap-6">
//               <img
//                 className="w-10 h-10   flex rounded-full object-cover shrink-0"
//                 src={message.user ? "/3R.jpg" : "/camie_logo.png"}
//                 alt={message.user ? "user" : "AI"}
//               />
//               <p
//                 className={`mt-8 break-words w-[calc(100%-3rem)] ${getTextColor(
//                   message.user
//                 )}`}
//               >
//                 {message.text}
//               </p>
//             </div>
//           </div>
//         ))}
//         {loading && (
//           <div className="max-w-screen-lg mt-6 group">
//             <div className="flex items-center w-full gap-6">
//               <img
//                 className="w-10 h-10 rounded-lg object-cover self-start animate-rotate"
//                 src="/camie_logo.png"
//                 alt="AI"
//               />
//               <div className="flex w-full flex-col gap-3.5">
//                 <div className="w-full bg-gradient-to-r from-indigo-500 via-black to-blue-500 h-5 bg-[length:200%_100%] animate-animate rounded-sm"></div>
//                 <div className="w-5/6 bg-gradient-to-r from-indigo-500 via-black to-blue-500 h-5 bg-[length:200%_100%] animate-animate rounded-sm"></div>
//                 <div className="w-4/5 bg-gradient-to-r from-indigo-500 via-black to-blue-500 h-5 bg-[length:200%_100%] animate-animate rounded-sm"></div>
//               </div>
//             </div>
//           </div>
//         )}
//         {isTyping && (
//           <div className="group mb-4">
//             <div className="flex items-start w-full gap-6">
//               <img
//                 className="w-10 h-10 mt-8 rounded-full object-cover shrink-0"
//                 src="/camie_logo.png"
//                 alt="AI"
//               />
//               <p
//                 className={`mt-8 break-words w-[calc(100%-3rem)] ${getTextColor(
//                   false
//                 )}`}
//               >
//                 {typingEffect}
//                 <span className="animate-blink">|</span>
//               </p>
//             </div>
//           </div>
//         )}
//         <div ref={messagesEndRef} />
//       </div>

//       <div
//         className={`fixed bottom-0 w-full flex mb-3  items-center justify-center ${
//           resolvedTheme === "dark" ? "bg-black/50" : "bg-white/50"
//         }`}
//       >

//         <div className="w-4/5 flex h-14">
       
//           <input
//             type="text"
//             value={inputText}
//             onChange={(e) => setInputText(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
//             className={`w-3/4 h-full p-3 rounded-full focus:outline-none ${
//               resolvedTheme === "dark"
//                 ? "bg-gray-800 text-white placeholder-gray-400 focus:bg-gray-700"
//                 : "bg-blue-400 text-black placeholder-black focus:bg-blue-200"
//             }`}
//             placeholder="Ask Camie..."
      

            
//           />
//            <Button onClick={handleSend} className="h-12 w-12 bg-primary text-white rounded-full">
//            Send
//          </Button>
          
//           <button
//             onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
//             className="  self-start  flex rounded-full"
//           >
//             {resolvedTheme === "dark" ? "🌞" : "🌙"}
//           </button>
        
//         </div>
//       </div>
//     </div>
//   );
// }








// "use client";

// import { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { useTheme } from "next-themes";
// import { Button } from "@/components/ui/button";
// import { FiSend } from "react-icons/fi";



// export default function ChatInterface() {
//   const [messages, setMessages] = useState([]);
//   const [inputText, setInputText] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [hideHeader, setHideHeader] = useState(false);
//   const [threadId, setThreadId] = useState(null);
//   const messagesEndRef = useRef(null);
//   const [typingEffect, setTypingEffect] = useState("");
//   const { resolvedTheme } = useTheme();
//   const { theme, setTheme } = useTheme();

//   // Create thread on component mount
//   useEffect(() => {
//     const createThread = async () => {
//       try {
//         const response = await axios.post(
//           "https://camie-ai.onrender.com/api/v0/ai/chat",
//           {
//             action: "create-thread",
//           },
//           {
//             headers: {
//               "Content-Type": "application/json",
//             },
//           }
//         );

//         if (response.data.status) {
//           setThreadId(response.data.data.id);
//         } else {
//           console.error("Thread ID creation failed:", response.data);
//         }
//       } catch (error) {
//         console.error("Error creating thread:", error);
//       }
//     };

//     createThread();
//   }, []);

//   const callCamieAIChatAPI = async (userMessage) => {
//     if (!threadId) {
//       console.error("Thread ID not available");
//       return;
//     }

//     try {
//       setLoading(true);

//       const response = await axios.post(
//         "https://camie-ai.onrender.com/api/v0/ai/chat",
//         {
//           action: "start-stream",
//           thread_id: threadId,
//           question: userMessage,
//         },
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );
//    console.log(response.data)
//       const aiResponse = response.data.data.text.value || response.data.text;

//       setMessages((prevMessages) => [
//         ...prevMessages,
//         { user: false, text: aiResponse },
//       ]);
//     } catch (error) {
//       console.error("Error calling Camie AI Chat API:", error);
    
//       setMessages((prevMessages) => [
//         ...prevMessages,
//         {
//           user: false,
//           text: "Sorry, there was an error processing your request. Please try again.",
//         },
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };



// const animateTyping = (text) => {
//   let index = 0;
//   setTypingEffect("");
//   const interval = setInterval(() => {
//     setTypingEffect((prev) => prev + text[index]);
//     index++;
//     if (index === text.length) {
//       clearInterval(interval);
//       setMessages((prevMessages) => [
//         ...prevMessages,
//         { user: false, text },
//       ]);
//       setTypingEffect("");
//     }
//   }, 10); // Adjust typing speed here
// };

//   const handleSendMessage = () => {
//     if (!inputText.trim()) return;

//     if (!hideHeader) setHideHeader(true);

//     const newMessage = { user: true, text: inputText };
//     setMessages((prevMessages) => [...prevMessages, newMessage]);

//     callCamieAIChatAPI(inputText);

//     setInputText("");
//   };

//   useEffect(() => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages, loading]);

//   const getTextColor = (isUser) => {
//     return resolvedTheme === "dark"
//       ? isUser
//         ? "text-white"
//         : "text-gray-200"
//       : isUser
//       ? "text-black"
//       : "text-gray-800";
//   };

//   return (
//     <div className="flex max-w-screen-lg flex-col p-4">
//       {!hideHeader && (
//         <header
//           className={`p-4 max-w-screen-lg mx-auto mt-7vh ${
//             resolvedTheme === "dark" ? "text-white" : "text-black"
//           }`}
//         >
//           <h2 className="text-4xl font-bold bg-clip-text text-red-500/50 w-fit">
//             Hello, there
//           </h2>
//           <h2 className="text-2xl font-bold">How can I help you today?</h2>
//         </header>
//       )}

//       <div className="w-[900px] h-[580px] overflow-y-auto p-4 mb-5">
//         {messages.map((message, index) => (
//           <div key={index} className="group mb-4">
//             <div className="flex items-start w-full gap-6">
//               <img
//                 className="w-10 h-10 mt-8 rounded-full object-cover shrink-0"
//                 src={message.user ? "/3R.jpg" : "/camie_logo.png"}
//                 alt={message.user ? "user" : "AI"}
//               />
//               <p
//                 className={`mt-8 break-words w-[calc(100%-3rem)] ${getTextColor(
//                   message.user
//                 )}`}
//               >
//                  {message.text}
//               </p>
//             </div>
//           </div>
//         ))}
//         {loading && (
//           <div className="max-w-screen-lg mt-6 group">
//             <div className="flex items-center w-full gap-6">
//               <img
//                 className="w-10 h-10 rounded-lg object-cover self-start animate-rotate"
//                 src="/camie_logo.png"
//                 alt="AI"
//               />
//               <div className="flex w-full flex-col gap-3.5">
//                 <div className="w-full bg-gradient-to-r from-indigo-500 via-black to-blue-500 h-5 bg-[length:200%_100%] animate-animate rounded-sm"></div>
//                 <div className="w-5/6 bg-gradient-to-r from-indigo-500 via-black to-blue-500 h-5 bg-[length:200%_100%] animate-animate rounded-sm"></div>
//                 <div className="w-4/5 bg-gradient-to-r from-indigo-500 via-black to-blue-500 h-5 bg-[length:200%_100%] animate-animate rounded-sm"></div>
//               </div>
//             </div>
//           </div>
//         )}
//         <div ref={messagesEndRef} />
//       </div>

//       <div
//         className={`fixed bottom-0 w-full p-4 ${
//           resolvedTheme === "dark" ? "bg-black/50" : "bg-white/50"
//         }`}
//       >
//         <div className="w-3/4 flex h-14">
//           <input
//             type="text"
//             value={inputText}
//             onChange={(e) => setInputText(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
//             className={`w-3/4 h-full p-3 rounded-full focus:outline-none ${
//               resolvedTheme === "dark"
//                 ? "bg-gray-800 text-white placeholder-gray-400 focus:bg-gray-700"
//                 : "bg-blue-400 text-black placeholder-black focus:bg-blue-200"
//             }`}
//             placeholder="Ask Camie..."
          
//           />
//          <button
//               onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
//               className="px-2 py-1 bg-gray-300 rounded-full">
//               {resolvedTheme === "dark" ? "🌞" : "🌙"}
//                         </button>
//             <button onClick={handleSendMessage} className="ml-2 text-blue-500">
//             <FiSend size={24} />
//           </button>

//          </div>
//        </div>
//      </div>
//    );
//  }
















// "use client";

// import { useState, useEffect, useRef } from "react";

// import { ModeToggle } from "../modes";
// import { Button } from "@/components/ui/button";

// export default function ChatInterface() {
//   const [messages, setMessages] = useState([]);
//   const [inputText, setInputText] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [hideHeader, setHideHeader] = useState(false);
//   const messagesEndRef = useRef(null);

//   // Simulate AI response
//   const simulateAIResponse = async () => {
//     const response = "This is a response from the AI...";
//     setLoading(true);
    

//     await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate loading delay
//     setMessages((prevMessages) => [
//       ...prevMessages,
//       { user: false, text: response },
//     ]);
//     setLoading(false);
//   };

//   const handleSendMessage = () => {
//     if (!inputText.trim()) return;

//     if (!hideHeader) setHideHeader(true); // Hide header on first message

//     const newMessage = { user: true, text: inputText };
//     setMessages((prevMessages) => [...prevMessages, newMessage]);
//     setInputText("");
//     simulateAIResponse();
//   };

//   useEffect(() => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages, loading]);

//   return (
//     <div className=" flex max-w-screen-lg flex-col p-4">
//       {/* Chat Header */}
//       {!hideHeader && (
//         <header className="p-4 max-w-screen-lg mx-auto mt-7vh hidden">
//           <h2 className="text-4xl font-bold bg-clip-text text-red-500/50 w-fit">
//             Hello, there
//           </h2>
//           <h2 className="text-2xl font-bold">How can I help you today?</h2>

//           {/* Suggestions */}
//           <ul className="mt-9 flex list-none gap-6">
//             <li className="p-4 cursor-pointer w-72 shrink-0 rounded-xl bg-blue-500 hover:bg-blue-700 flex flex-col justify-between">
//               <h2 className="text-xl font-bold">I want to book an appointment with Camie</h2>
//               <span>
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   strokeWidth={1.5}
//                   stroke="currentColor"
//                   className="h-11 w-11 mt-10 rounded-xl stroke-white bg-blue-700"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Z"
//                   />
//                 </svg>
//               </span>
//             </li>
//             <li className="p-4 cursor-pointer w-72 shrink-0 rounded-xl bg-blue-500 hover:bg-blue-700 flex flex-col justify-between">
//               <h2 className="text-xl font-bold">Tell me about the core offers of Camie AI</h2>
//               <span>
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   strokeWidth={1.5}
//                   stroke="currentColor"
//                   className="h-11 w-11 mt-10 rounded-full stroke-white bg-blue-700"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
//                   />
//                 </svg>
//               </span>
//             </li>
//           </ul>
//         </header>
//       )}

//       {/* Chat Messages Container */}
//       <div className="w-[900px] h-[580px] overflow-y-auto p-4 mb-5">
//       {!hideHeader && (
//       <header className="p-4 max-w-screen-lg mx-auto mt-7vh ">
//           <h2 className="text-4xl font-bold bg-clip-text text-white w-fit">
//             Hello, there
//           </h2>
//           <h2 className="text-2xl text-white font-bold">How can I help you today?</h2>

//           {/* Suggestions */}
//           <ul className="mt-9 flex list-none gap-6">
//             <li className="p-4 cursor-pointer w-72 shrink-0 rounded-xl bg-blue-500 hover:bg-blue-700 flex flex-col justify-between">
//               <h2 className="text-xl font-bold">I want to book an appointment with Camie</h2>
//               <span>
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   strokeWidth={1.5}
//                   stroke="currentColor"
//                   className="h-11 w-11 mt-10 rounded-xl stroke-white"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Z"
//                   />
//                 </svg>
//               </span>
//             </li>
//             <li className="p-4 cursor-pointer w-72 shrink-0 rounded-xl bg-blue-500 hover:bg-blue-700 flex flex-col justify-between">
//               <h2 className="text-xl font-bold">Tell me about the core offers of Camie AI</h2>
//               <span>
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   strokeWidth={1.5}
//                   stroke="currentColor"
//                   className="h-11 w-11 mt-10 rounded-full stroke-white"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
//                   />
//                 </svg>
//               </span>
//             </li>
//           </ul>
//         </header>
//              )}
//         {messages.map((message, index) => (
//           <div key={index} className="group mb-4">
//             <div className="flex items-start w-full gap-6">
//               <img
//                 className="w-10 h-10 rounded-lg object-cover shrink-0"
//                 src={message.user ? "/3R.jpg" : "/camie_logo.png"}
//                 alt={message.user ? "user" : "AI"}
//               />
//               <p className="text-black mt-4 break-words w-[calc(100%-3rem)]">{message.text}</p>
//             </div>
//             {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 h-4 w-4 cursor-pointer  ml-70 invisible text-black group-hover:visible">
//                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
//             </svg> */}
//           </div>
//         ))}
//         {loading && (
//           <div className="max-w-screen-lg  mt-6 group">
//               <div className="flex items-center w-full gap-6">
//                 <img
//                   className={`w-10 h-10 rounded-lg object-cover self-start ${
//                     loading ? 'animate-rotate' : ''
//                   }  animate-rotate` }
//                   src="/camie_logo.png"
//                   alt="AI"
//                 />
//                 <p className={`${loading ? "hidden" : "block"}  hidden `}>
               
//                 </p>
//                 {/* Loading indicator */}
//                  <div className="flex w-full flex-col gap-3.5">
//                   <div className="w-full bg-gradient-to-r from-indigo-500 via-black  to-blue-500 h-3 bg-[length:200%_100%] animate-animate rounded-sm"></div>
//                   <div className="w-full bg-gradient-to-r from-indigo-500 via-black to-blue-500 h-3 bg-[length:200%_100%] animate-animate rounded-sm"></div>
//                   <div className="w-9/12 bg-gradient-to-r from-indigo-500 via-black to-blue-500 h-3 bg-[length:200%_100%] animate-animate rounded-sm"></div>
//                 </div>
//               </div>
               
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 strokeWidth={1.5}
//                 stroke="currentColor"
//                 className={`h-2 w-2 flex cursor-pointer text-xl items-center rounded-xl justify-center text-black invisible group-hover:visible ${
//                   loading ? "hidden" : "block"
//                 }`}
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
//                 />
//               </svg>
//             </div> 
//             )}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Input Field */}
//       <div className="fixed  bottom-0 w-full p-4">
//       <div className="w-3/4 flex  h-14">
//         <input
//           type="text"
//           value={inputText}
//           onChange={(e) => setInputText(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
//             className="w-3/4 h-full p-3 rounded-full  focus:outline-none  focus:bg-blue-200 bg-blue-400 placeholder-black color: inherit"
//           placeholder="Ask Camie..."
//         />
     
//       </div>
//       <p className="text-sm mt-4 text-center">Camie@2024</p>
//       </div>
     
//     </div>
//   );
// }























//do not auto and it is small
// "use client";

// import { useState, useEffect, useRef } from "react";

// export default function ChatInterface() {
//   const [messages, setMessages] = useState([]);
//   const [inputText, setInputText] = useState("");
//   const [loading, setLoading] = useState(false);
//   const messagesEndRef = useRef(null);

//   // Simulate AI response
//   const simulateAIResponse = async () => {
//     const response = "This is a response from the AI...";
//     setLoading(true);
//     await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate loading delay
//     setMessages((prevMessages) => [
//       ...prevMessages,
//       { user: false, text: response },
//     ]);
//     setLoading(false);
//   };

//   const handleSendMessage = () => {
//     if (!inputText.trim()) return;

//     const newMessage = { user: true, text: inputText };
//     setMessages((prevMessages) => [...prevMessages, newMessage]);
//     setInputText("");
//     simulateAIResponse();
//   };

//   useEffect(() => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);

//   return (
//     <div className="flex flex-col h-screen">
//       {/* Chat Header */}
//       <header className="p-4 max-w-screen-lg mx-auto">
//         <h2 className="text-4xl font-bold bg-clip-text text-red-500/50 w-fit">
//           Hello, there
//         </h2>
//         <h2 className="text-2xl font-bold">How can I help you today?</h2>

//         {/* Suggestions */}
//         <ul className="mt-9 flex list-none gap-6">
//           <li className="p-4 cursor-pointer w-72 shrink-0 rounded-xl bg-blue-500 hover:bg-blue-700 flex flex-col justify-between">
//             <h2 className="text-xl font-bold">I want to book an appointment with Camie</h2>
//             <span>
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 strokeWidth={1.5}
//                 stroke="currentColor"
//                 className="h-11 w-11 mt-10 rounded-xl stroke-white bg-blue-700"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Z"
//                 />
//               </svg>
//             </span>
//           </li>
//           <li className="p-4 cursor-pointer w-72 shrink-0 rounded-xl bg-blue-500 hover:bg-blue-700 flex flex-col justify-between">
//             <h2 className="text-xl font-bold">Tell me about the core offers of Camie AI</h2>
//             <span>
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 strokeWidth={1.5}
//                 stroke="currentColor"
//                 className="h-11 w-11 mt-10 rounded-full stroke-white bg-blue-700"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
//                 />
//               </svg>
//             </span>
//           </li>
//         </ul>
//       </header>

//       {/* Chat Messages Container */}
//       <div className="flex-1 overflow-y-auto max-w-screen-lg mx-auto">
//         {messages.map((message, index) => (
//           <div key={index} className="max-w-screen-lg">
//             <div className={`flex items-center w-full gap-6 ${message.user ? "flex-row-reverse" : ""}`}>
//               <img
//                 className="w-10 h-10 rounded-lg object-cover"
//                 src={message.user ? "/user_logo.png" : "/camie_logo.png"}
//                 alt={message.user ? "user" : "AI"}
//               />
//               <p className="text-black">{message.text}</p>
//             </div>
//           </div>
//         ))}
//         {loading && (
//           <div className="flex w-full flex-col gap-3.5">
//             <div className="w-full bg-gradient-to-r from-indigo-500 via-black  to-blue-500 h-3 bg-[length:200%_100%] animate-animate rounded-sm"></div>
//             <div className="w-full bg-gradient-to-r from-indigo-500 via-black to-blue-500 h-3 bg-[length:200%_100%] animate-animate rounded-sm"></div>
//             <div className="w-9/12 bg-gradient-to-r from-indigo-500 via-black to-blue-500 h-3 bg-[length:200%_100%] animate-animate rounded-sm"></div>
//           </div>
//         )}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Input Field */}
//       <div className="p-4">
//         <input
//           type="text"
//           value={inputText}
//           onChange={(e) => setInputText(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
//           className="w-full p-2 border border-gray-300 rounded"
//           placeholder="Type a message..."
//         />
//       </div>
//     </div>
//   );
// }











// "use client";

// import { useState, useEffect, useRef } from "react";
// import { Button } from "@/components/ui/button"; // ShadCN Button component
// import { SlCalender } from "react-icons/sl";
// import { BsInfoCircle } from "react-icons/bs";

// export default function ChatInterface() {
//   const [messages, setMessages] = useState([]);
//   const [inputText, setInputText] = useState("");
//   const [loading, setLoading] = useState(false);
//   const messagesEndRef = useRef<null | HTMLDivElement>(null);

//   // // Function to handle Enter key press for sending a message
//   // const handleKeyPress = async (e: React.KeyboardEvent) => {
//   //   if (e.key === "Enter" && inputText.trim() !== "") {
//   //     // Add the user message first
//   //     setMessages([{ user: true, text: inputText }, ...messages]);

//   //     setInputText(""); // Clear the input field
//   //     setLoading(true); // Start loading state

//   //     // Simulate AI response
//   //     await simulateAIResponse();
//   //   }
//   // };

//   // // Simulate AI response with step-by-step loading
//   // const simulateAIResponse = async () => {
//   //   const response = "This is a response from the AI..."; // Simulated AI response
//   //   const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

//   //   let aiResponse = "";
//   //   for (let i = 0; i < response.length; i++) {
//   //     await delay(50); // Simulate typing delay
//   //     aiResponse = response.slice(0, i + 1);

//   //     // Update the messages with the progressively appearing AI response
//   //     setMessages(prevMessages => {
//   //       const lastMessage = prevMessages[0];
//   //       return [{ user: false, text: aiResponse }, lastMessage, ...prevMessages.slice(1)];
//   //     });
//   //   }
//   //   setLoading(false); // Stop loading after the response is complete
//   // };

//   // // Scroll to the bottom when a new message is added
//   // useEffect(() => {
//   //   if (messagesEndRef.current) {
//   //     messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//   //   }
//   // }, [messages]);

//   return (
// <div className=" flex flex-col h-screen " >
// {/* // className="flex justify-center items-center  max-w-screen-lg rounded-xl shadow-lg" > */}
     
//       {/* Chat Header */}
//       <header className="p-4  max-w-screen-lg m-0-auto">
//       {/* mt-7vh */}
//         <h2 className="text-4xl font-bold bg-clip-text text-red-500/50 w-fit ">Hello, there</h2>
//         <h2 className="text-2xl font-bold">How can I help you today</h2>

//         {/* suggesttions*/}
//             <ul className="mt-9 flex  list-none gap-6">
//               <li className="p-4 cursor-pointer w-72 shrink-0 rounded-xl bg-blue-500 hover:bg-blue-700 justify-between items-end flex-col ">
//               <h2 className="text-xl font-bold">I want to book an appointment wih Camie</h2>
//               <span> 
//               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-11 w-11 mt-10 text-xl flex items-center justify-center rounded-xl stroke-white bg-blue-700 ">
//                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
//               </svg>

//                 {/* <SlCalender  className="h-11 w-11 mt-10 text-xl flex items-center justify-center rounded-fill stroke-white"/> */}
//                 </span>
//               </li>
//               <li className="p-4 cursor-pointer w-72 shrink-0 rounded-xl bg-blue-500 hover:bg-blue-700">
//               <h2 className="text-xl font-bold">Tell me about the core offers of Camie AI</h2>
//               <span > 
//               <svg   className="h-11 w-11 mt-10 text-xl flex items-center justify-center rounded-full stroke-white  bg-blue-700"  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//                <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
//               </svg>

//                 {/* <BsInfoCircle  className="h-11 w-11 mt-10 text-xl flex items-center justify-center rounded-fill"/> */}
//                  </span>
//               </li>
//             </ul>
//       </header> 

//       {/* Chat Messages Container */}
//       <div className="flex- overflow-y-auto  max-w-screen-lg ">
//         {/* Only show current message (user + AI) */}
        
        
//              {/* out-going  message*/}
//             <div className="max-w-screen-lg">
//               <div className=" flex items-center w-full gap-6   ">
//                 <img className="w-10 h-10 rounded-lg object-cover self-start" src="/camie_logo.png" alt="user"></img>
//                 <p className="text-black"></p>
//               </div>
//             </div>
//               {/* Incoming message  */}
//               <div className="max-w-screen-lg  mt-6 group">
//                 <div className="flex items-center w-full gap-6">
//                 <img  className="w-10 h-10 rounded-lg object-cover self-start" src="/camie_logo.png" alt="AI"></img>
//                 <p></p>
//                 </div>

//                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 h-8 w-8 flex cursor-pointer text-xl items-center  rounded-xl justify-center invisible text-black group-hover:visible">
//                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
//                 </svg>
//               </div>
   
//                <div className="max-w-screen-lg mt-6 group">
            //   <div className="flex items-center w-full gap-6">
            //     <img
            //       className={`w-10 h-10 rounded-lg object-cover self-start ${
            //         loading ? 'animate-rotate' : ''
            //       }  animate-rotate` }
            //       src="/camie_logo.png"
            //       alt="AI"
            //     />
            //     <p className={`${loading ? "hidden" : "block"}  hidden `}>
               
            //     </p>
            //     {/* Loading indicator */}
            //      <div className="flex w-full flex-col gap-3.5">
            //       <div className="w-full bg-gradient-to-r from-indigo-500 via-black  to-blue-500 h-3 bg-[length:200%_100%] animate-animate rounded-sm"></div>
            //       <div className="w-full bg-gradient-to-r from-indigo-500 via-black to-blue-500 h-3 bg-[length:200%_100%] animate-animate rounded-sm"></div>
            //       <div className="w-9/12 bg-gradient-to-r from-indigo-500 via-black to-blue-500 h-3 bg-[length:200%_100%] animate-animate rounded-sm"></div>
            //     </div>
            //   </div>

            //   <svg
            //     xmlns="http://www.w3.org/2000/svg"
            //     fill="none"
            //     viewBox="0 0 24 24"
            //     strokeWidth={1.5}
            //     stroke="currentColor"
            //     className={`h-8 w-8 flex cursor-pointer text-xl items-center rounded-xl justify-center text-black invisible group-hover:visible ${
            //       loading ? "hidden" : "block"
            //     }`}
            //   >
            //     <path
            //       strokeLinecap="round"
            //       strokeLinejoin="round"
            //       d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
            //     />
            //   </svg>
            // </div> 
            
          
         
//       </div>


//       {/* Message Input Container */}
//       <div className=" fixed bottom-0 w-full p-4">
//         <div className="w-full flex h-14">
//           <input
//             type="text"
//             value={inputText}
//             onChange={(e) => setInputText(e.target.value)}
//             onKeyDown={handleKeyPress} // Detect Enter key press
//             placeholder="Ask Camie"
//             className="w-5/6 h-full p-3 rounded-full  focus:outline-none  focus:bg-blue-200 bg-blue-400 placeholder-black"
//           />
  
//         </div>
//         <p className="text-sm mt-4 text-center">Camie@2024</p>
//       </div>
      
//     </div>
//   );
// }



















// "use client";

// import { useState, useEffect, useRef } from "react";
// import { Button } from "@/components/ui/button"; // ShadCN Button component
// import { SlCalender } from "react-icons/sl";
// import { BsInfoCircle } from "react-icons/bs";

// export default function ChatInterface() {
//   const [messages, setMessages] = useState<{ user: boolean; text: string }[]>([]);
//   const [inputText, setInputText] = useState("");
//   const [loading, setLoading] = useState(false);
//   const messagesEndRef = useRef<null | HTMLDivElement>(null);

//   // Function to handle Enter key press for sending a message
//   const handleKeyPress = async (e: React.KeyboardEvent) => {
//     if (e.key === "Enter" && inputText.trim() !== "") {
//       // Add the user message first
//       setMessages([{ user: true, text: inputText }, ...messages]);

//       setInputText(""); // Clear the input field
//       setLoading(true); // Start loading state

//       // Simulate AI response
//       await simulateAIResponse();
//     }
//   };

//   // Simulate AI response with step-by-step loading
//   const simulateAIResponse = async () => {
//     const response = "This is a response from the AI..."; // Simulated AI response
//     const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

//     let aiResponse = "";
//     for (let i = 0; i < response.length; i++) {
//       await delay(50); // Simulate typing delay
//       aiResponse = response.slice(0, i + 1);

//       // Update the messages with the progressively appearing AI response
//       setMessages(prevMessages => {
//         const lastMessage = prevMessages[0];
//         return [{ user: false, text: aiResponse }, lastMessage, ...prevMessages.slice(1)];
//       });
//     }
//     setLoading(false); // Stop loading after the response is complete
//   };

//   // Scroll to the bottom when a new message is added
//   useEffect(() => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);

//   return (
// <div  >
// {/* // className="flex justify-center items-center  max-w-screen-lg rounded-xl shadow-lg" > */}
     
//       {/* Chat Header */}
//       <header className="p-4  max-w-screen-lg m-0-auto">
//       {/* mt-7vh */}
//         <h2 className="text-4xl font-bold bg-clip-text text-red-500/50 w-fit ">Hello, there</h2>
//         <h2 className="text-2xl font-bold">How can I help you today</h2>

//         {/* suggesttions*/}
//             <ul className="mt-9 flex  list-none gap-6">
//               <li className="p-4 cursor-pointer w-72 shrink-0 rounded-xl bg-blue-500 hover:bg-blue-700 justify-between items-end flex-col ">
//               <h2 className="text-xl font-bold">I want to book an appointment wih Camie</h2>
//               <span> 
//               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-11 w-11 mt-10 text-xl flex items-center justify-center rounded-xl stroke-white bg-blue-700 ">
//                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
//               </svg>

//                 {/* <SlCalender  className="h-11 w-11 mt-10 text-xl flex items-center justify-center rounded-fill stroke-white"/> */}
//                 </span>
//               </li>
//               <li className="p-4 cursor-pointer w-72 shrink-0 rounded-xl bg-blue-500 hover:bg-blue-700">
//               <h2 className="text-xl font-bold">Tell me about the core offers of Camie AI</h2>
//               <span > 
//               <svg   className="h-11 w-11 mt-10 text-xl flex items-center justify-center rounded-full stroke-white  bg-blue-700"  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//                <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
//               </svg>

//                 {/* <BsInfoCircle  className="h-11 w-11 mt-10 text-xl flex items-center justify-center rounded-fill"/> */}
//                  </span>
//               </li>
//             </ul>
//       </header> 

//       {/* Chat Messages Container */}
//       <div className="pt-8 px-4 pb-48 max-h-screen overflow-y-auto m-0-auto max-w-screen-lg ">
//         {/* Only show current message (user + AI) */}
//           <>
//              {/* out-going  message*/}
//             <div className="max-w-screen-lg">
//               <div className=" flex items-center w-full gap-6   ">
//                 <img className="w-10 h-10 rounded-lg object-cover self-start" src="/camie_logo.png" alt="user"></img>
//                 <p className="text-black">Lorem ipsum dolor</p>
//               </div>
//             </div>
//               {/* Incoming message  */}
//               <div className="max-w-screen-lg  mt-6 group">
//                 <div className="flex items-center w-full gap-6">
//                 <img  className="w-10 h-10 rounded-lg object-cover self-start" src="/camie_logo.png" alt="AI"></img>
//                 <p></p>
//                 </div>

//                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 h-8 w-8 flex cursor-pointer text-xl items-center  rounded-xl justify-center invisible text-black group-hover:visible">
//                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
//                 </svg>
//               </div>
   
//                <div className="max-w-screen-lg mt-6 group">
//               <div className="flex items-center w-full gap-6">
//                 <img
//                   className={`w-10 h-10 rounded-lg object-cover self-start ${
//                     loading ? 'animate-rotate' : ''
//                   }  animate-rotate` }
//                   src="/camie_logo.png"
//                   alt="AI"
//                 />
//                 <p className={`${loading ? "hidden" : "block"}  hidden `}>
               
//                 </p>
//                 {/* Loading indicator */}
//                  <div className="flex w-full flex-col gap-3.5">
//                   <div className="w-full bg-gradient-to-r from-indigo-500 via-black  to-blue-500 h-3 bg-[length:200%_100%] animate-animate rounded-sm"></div>
//                   <div className="w-full bg-gradient-to-r from-indigo-500 via-black to-blue-500 h-3 bg-[length:200%_100%] animate-animate rounded-sm"></div>
//                   <div className="w-9/12 bg-gradient-to-r from-indigo-500 via-black to-blue-500 h-3 bg-[length:200%_100%] animate-animate rounded-sm"></div>
//                 </div>
//               </div>

//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 strokeWidth={1.5}
//                 stroke="currentColor"
//                 className={`h-8 w-8 flex cursor-pointer text-xl items-center rounded-xl justify-center text-black invisible group-hover:visible ${
//                   loading ? "hidden" : "block"
//                 }`}
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
//                 />
//               </svg>
//             </div> 

//           </>
//       </div>


//       {/* Message Input Container */}
//       <div className=" fixed bottom-0 w-full p-4">
//         <div className="w-full flex h-14">
//           <input
//             type="text"
//             value={inputText}
//             onChange={(e) => setInputText(e.target.value)}
//             onKeyDown={handleKeyPress} // Detect Enter key press
//             placeholder="Ask Camie"
//             className="w-5/6 h-full p-3 rounded-full  focus:outline-none  focus:bg-blue-200 bg-blue-400 placeholder-black"
//           />
  
//         </div>
//         <p className="text-sm mt-4 text-center">Camie@2024</p>
//       </div>
      
//     </div>
//   );
// }


























// "use client";

// import { useState, useEffect, useRef } from "react";
// import { Button } from "@/components/ui/button"; // ShadCN Button component

// export default function ChatInterface() {
//   const [messages, setMessages] = useState<{ user: boolean; text: string }[]>([]);
//   const [inputText, setInputText] = useState("");
//   const [loading, setLoading] = useState(false);
//   const messagesEndRef = useRef<null | HTMLDivElement>(null);

//   // Function to handle Enter key press for sending a message
//   const handleKeyPress = async (e: React.KeyboardEvent) => {
//     if (e.key === "Enter" && inputText.trim() !== "") {
//       // Add the user message first
//       setMessages([{ user: true, text: inputText }, ...messages]);

//       setInputText(""); // Clear the input field
//       setLoading(true); // Start loading state

//       // Simulate AI response
//       await simulateAIResponse();
//     }
//   };

//   // Simulate AI response with step-by-step loading
//   const simulateAIResponse = async () => {
//     const response = "This is a response from the AI..."; // Simulated AI response
//     const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

//     let aiResponse = "";
//     for (let i = 0; i < response.length; i++) {
//       await delay(50); // Simulate typing delay
//       aiResponse = response.slice(0, i + 1);

//       // Update the messages with the progressively appearing AI response
//       setMessages(prevMessages => {
//         const lastMessage = prevMessages[0];
//         return [{ user: false, text: aiResponse }, lastMessage, ...prevMessages.slice(1)];
//       });
//     }
//     setLoading(false); // Stop loading after the response is complete
//   };

//   // Scroll to the bottom when a new message is added
//   useEffect(() => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);

//   return (
//     <div className="flex flex-col justify-between h-[80vh] w-[90vw] max-w-4xl mx-auto p-6 bg-gray-50 rounded-xl shadow-lg">
//       {/* Chat Header */}
//       <div className="flex justify-between items-center p-4 bg-primary text-white rounded-t-xl">
//         <h2 className="text-xl font-bold">Chat with Us</h2>
//       </div>

//       {/* Chat Messages Container */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {/* Only show current message (user + AI) */}
//         {messages.length > 0 && (
//           <>
//             <div className="flex justify-start mb-4">
//               <div className="max-w-xs p-3 rounded-xl bg-gray-200 text-black">
//                 {messages[0].user ? messages[0].text : "Waiting for AI response..."}
//               </div>
//             </div>
//             {!loading && messages.length > 1 && (
//               <div className="flex justify-start">
//                 <div className="max-w-xs p-3 rounded-xl bg-primary text-white">
//                   {messages[1].text}
//                 </div>
//               </div>
//             )}
//           </>
//         )}
        
//         {/* Loading message while AI is typing */}
//         {loading && (
//           <div className="flex justify-start">
//             <div className="max-w-xs p-3 rounded-xl bg-gray-200 text-black">
//               <span>Loading...</span>
//             </div>
//           </div>
//         )}
        
//         {/* Scroll to bottom of messages */}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Message Input Container */}
//       <div className="flex items-center space-x-2 p-4 border-t border-gray-200">
//         <input
//           type="text"
//           value={inputText}
//           onChange={(e) => setInputText(e.target.value)}
//           onKeyDown={handleKeyPress} // Detect Enter key press
//           placeholder="Ask Camie"
//           className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
//         />
//       </div>
//     </div>
//   );
// }

























// "use client"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"  // Shadcn button component

// export default function ChatInterface() {
//   const [messages, setMessages] = useState<{ user: boolean; text: string }[]>([])
//   const [inputText, setInputText] = useState("")

//   const handleSend = () => {
//     if (inputText.trim() !== "") {
//       // Add user message
//       setMessages([...messages, { user: true, text: inputText }])
//       // Simulate bot response
//       setMessages((prevMessages) => [
//         ...prevMessages,
//         { user: false, text: "This is a response from the bot." }
//       ])
//       setInputText("") // Clear input field
//     }
//   }

//   return (
//     <div className="flex flex-col justify-between h-screen max-w-md mx-auto p-4 bg-gray-50 rounded-xl shadow-lg">
//       {/* Chat Header (Optional) */}
//       <div className="flex justify-between items-center p-4 bg-primary text-white rounded-t-xl">
//         <h2 className="text-xl font-bold">Chat with Us</h2>
//       </div>

//       {/* Chat Messages Container */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.map((message, index) => (
//           <div
//             key={index}
//             className={`flex ${message.user ? "justify-end" : "justify-start"}`}
//           >
//             <div
//               className={`max-w-xs p-3 rounded-xl ${
//                 message.user ? "bg-primary text-white" : "bg-gray-200 text-black"
//               }`}
//             >
//               {message.text}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Message Input Container */}
//       <div className="flex items-center space-x-2 p-4 border-t border-gray-200">
//         <input
//           type="text"
//           value={inputText}
//           onChange={(e) => setInputText(e.target.value)}
//           placeholder="Type your message"
//           className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
//         />
//         <Button onClick={handleSend} className="h-12 w-12 bg-primary text-white rounded-full">
//           Send
//         </Button>
//       </div>
//     </div>
//   )
// }
