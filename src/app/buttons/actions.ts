import { useEffect, useState } from "react";
import Vapi from "@vapi-ai/web";

const token = process.env.NEXT_PUBLIC_SAVI_VAPI_PU_KEY || "";
const vapi = new Vapi(token);

export const startCall = async (
  assistantId: string,
  setConnecting: React.Dispatch<React.SetStateAction<boolean>>
) => {
  setConnecting(true);
  const assistantOptions = {
    name: "Vapi’s Pizza Front Desk",
    firstMessage: "how can I help you?",
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
      model: "gpt-4o-mini",
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

  const data = await vapi.start(assistantId, assistantOptions as object);
  console.log(data);
};

export const endCall = () => {
  vapi.stop();
};

export const useVapiEvents = (
  setConnecting: React.Dispatch<React.SetStateAction<boolean>>,
  setConnected: React.Dispatch<React.SetStateAction<boolean>>,
  setAssistantIsSpeaking: React.Dispatch<React.SetStateAction<boolean>>,
  setBookMeeting: React.Dispatch<React.SetStateAction<boolean>>,
  meetingResponse: string | null
) => {
  useEffect(() => {
    vapi.on("call-start", () => {
      console.log("connecting");
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

    vapi.on("error", (error) => {
      console.error(error);
      setConnecting(false);
    });
    vapi.on("message", (message) => {
      if (
        message.type === "function-call" &&
        message.functionCall.name === "bookAppointmentModal"
      ) {
        setBookMeeting(true);
      }
    });
  }, [setConnecting, setConnected, setAssistantIsSpeaking, setBookMeeting]);

  useEffect(() => {
    if (meetingResponse) {
      vapi.send({
        type: "add-message",
        message: {
          role: "system",
          content: meetingResponse,
        },
      });
    }
  }, [meetingResponse, vapi]);
};
