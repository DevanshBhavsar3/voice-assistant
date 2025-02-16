"use client";

import { useRef, useState } from "react";
import { Mic, Send } from "lucide-react";
import { cn } from "@/utils";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GENAI_API_KEY } from "@/config";

interface Chat {
  type: "ai" | "user";
  message: string;
}

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  // const [inputText, setInputText] = useState("");
  const inputRef = useRef<string>("");
  const [isPulsing, setIsPulsing] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);

  const handleSend = async (prompt: string) => {
    console.log(prompt);
    if (!prompt.trim()) return;
    setIsPulsing(true);

    setTimeout(() => {
      setIsPulsing(false);
      // setInputText("");
      inputRef.current = "";
    }, 2000);

    console.log("Generating");
    const genAI = new GoogleGenerativeAI(GENAI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    try {
      const result = await model.generateContent(
        `You are an voice assistant made to help user. If the user want to open any certain app just give something like 'OPENING {URL_FOR_APP}' nothing else like [USER]: Open YouTue [RESPONSE]
        : youtube.com and if asked to search something on youtube search like these example: Searching on [APP_NAME] https://www.youtube.com/results?search_query=python+ai+voice+assistant OR https://www.google.com/search?q=ai. Other than just help the user with its prompts.
        User asked: ${prompt}`
      );

      const response = new SpeechSynthesisUtterance();
      response.text = result.response.text();
      window.speechSynthesis.speak(response);

      console.log(response.text);
      if (response.text.includes("OPENING")) {
        const url = response.text.split("OPENING ")[1];
        console.log(url);

        window.open(`https://${url}`, "_blank");
      } else if (response.text.includes("Searching")) {
        const url = response.text.split(" https:")[1];

        window.open(url, "_blank");
      }

      setChats((chats) => [
        ...chats,
        { type: "user", message: prompt },
        { type: "ai", message: result.response.text() },
      ]);
    } catch (e) {
      setChats((chats) => [
        ...chats,
        { type: "user", message: prompt },
        {
          type: "ai",
          message: "Sorry, I couldn't process your request. Please try again.",
        },
      ]);
    } finally {
      setIsPulsing(false);
    }
  };

  const toggleVoice = () => {
    setIsListening(!isListening);
    setIsPulsing(!isListening);

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => console.log("Listening...");
    recognition.onspeechend = () => {
      console.log("Speech ended, stopping recognition...");
      recognition.stop();
    };
    recognition.onresult = (event: any) => {
      const voiceText = event.results[0][0].transcript;

      if (voiceText) {
        handleSend(voiceText);
      }
    };
    recognition.onerror = (event: any) =>
      console.error("Speech recognition error:", event.error);

    recognition.start();
  };

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-between p-8">
      <div className="max-w-2xl flex justify-between items-center w-full">
        <h1 className="text-white">Voice Assistant</h1>
        <button
          className="px-2 rounded-full text-white/50 hover:text-white transition-colors"
          onClick={() => setChats([])}
        >
          Reset
        </button>
      </div>
      {chats.length !== 0 ? (
        <div className="flex flex-col flex-1 w-full max-w-2xl gap-5 p-2">
          {chats.map((chat, index) => (
            <span
              key={index}
              className={`${
                chat.type === "user"
                  ? "self-end bg-white text-black"
                  : "bg-white/10 border border-white/10 w-fit text-white"
              } px-2 py-1 rounded-md`}
            >
              {chat.message}
            </span>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center w-full">
          <div className="relative">
            <div className="w-80 h-80 border border-blue-500/50 shadow-sm shadow-white rounded-full overflow-hidden relative">
              <div className="absolute inset-0 overflow-hidden">
                {Array.from({ length: 100 }).map((_, index) => (
                  <div
                    key={index}
                    className="absolute w-1 h-1 bg-purple-500 rounded-full"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      animation: `float ${
                        Math.random() * 5 + 5
                      }s infinite ease-in-out`,
                    }}
                  />
                ))}
                <style jsx>{`
                  @keyframes float {
                    0% {
                      transform: translateY(0);
                    }
                    50% {
                      transform: translateY(-20px);
                    }
                    100% {
                      transform: translateY(0);
                    }
                  }
                `}</style>
              </div>
            </div>
            {/* Main Orb */}
            {/* <div
              className={cn(
                "w-48 h-48 rounded-full bg-gradient-to-br from-white/20 to-white/40 backdrop-blur-sm",
                "flex items-center justify-center shadow-lg",
                "border border-white/20",
                isPulsing && "animate-pulse"
              )}
            >
              // Inner Orb 
              <div
                className={cn(
                  "w-36 h-36 rounded-full bg-gradient-to-br from-white/30 to-white/50",
                  "flex items-center justify-center",
                  "border border-white/30",
                  isPulsing && "animate-pulse"
                )}
              >
                // Core 
                <div
                  className={cn(
                    "w-24 h-24 rounded-full bg-gradient-to-br from-white/40 to-white/60",
                    "border border-white/40",
                    isPulsing && "animate-pulse"
                  )}
                />
              </div>
              </div> 

            // Ripple Effects 
            {isPulsing && (
              <>
                <div className="absolute inset-0 animate-ping rounded-full bg-white/20" />
                <div className="absolute inset-0 animate-ping delay-150 rounded-full bg-white/10" />
              </>
            )} */}
          </div>
        </div>
      )}

      <form onSubmit={(e) => e.preventDefault()} className="w-full">
        {/* Input Section */}
        <div className="w-full max-w-2xl mx-auto mt-8">
          <div className="relative flex items-center">
            <input
              type="text"
              // value={inputRef.current}
              onChange={(e) => {
                inputRef.current = e.target.value;
              }}
              placeholder="Type your message..."
              className="w-full px-4 py-3 rounded-full bg-black/10 border border-border focus:outline-none focus:ring-2 focus:ring-white/50 pr-24 text-white"
            />
            <div className="absolute right-2 flex gap-2">
              <button
                type="button"
                onClick={toggleVoice}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  isListening
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-white/10 hover:bg-white/20 text-white"
                )}
              >
                <Mic className="w-5 h-5 text-white" />
              </button>
              <button
                type="submit"
                onClick={() => handleSend(inputRef.current)}
                className="p-2 rounded-full bg-blue-500 text-white-foreground hover:bg-blue-500/90 text-white transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}
