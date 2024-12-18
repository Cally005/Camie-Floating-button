interface AssistantSpeechIndicatorProps {
  isSpeaking: boolean;
}

const AssistantSpeechIndicator: React.FC<AssistantSpeechIndicatorProps> = ({ isSpeaking }) => {
  return (
    <div className="flex items-center mb-2.5">
      <div className={`w-5 h-5 mr-2.5 rounded-sm ${isSpeaking ? "bg-green-400" : "bg-red-600"}`} />
      <p className="text-white m-0">
        {isSpeaking ? "Assistant speaking" : "Assistant not speaking"}
      </p>
    </div>
  );
};

export default AssistantSpeechIndicator;
