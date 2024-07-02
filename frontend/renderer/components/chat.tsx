import React from "react";
import {
  useMutationRunQuery,
  useMutationRunQueryWithScenario,
} from "../hooks/query";
import SideChat from "./side-chat";
import Markdown from "react-markdown";
import { AiOutlineMessage } from "react-icons/ai";

const scenarioImg = {
  slack: "/images/slack.svg",
  email: "/images/email.svg",
  monday: "/images/monday.svg",
  stripe: "/images/stripe.jpg",
};

const shortenMessage = (message: string) => {
  return message.length > 70 ? message.slice(0, 70) + "..." : message;
};

interface MessageProps {
  text: string;
  handleClickCitedMessage?: (message: string) => void;
  disableCites?: boolean;
}

interface Message {
  text: string;
  type: "bot" | "user";
}

const BotLoadingMessage = () => {
  return (
    <div className="flex flex-col mb-4 message">
      <div className="flex items-center justify-start">
        <div className="h-[32px] px-[2px] pt-1.5 bg-gray-800 rounded-full">
          <img
            className="p-1 bg-gray-800 rounded-full"
            src="/images/bot.svg"
            alt="chat-bot"
          />
        </div>
        <span className="px-2 text-sm text-gray-400">Chatbot</span>
      </div>
      <div className="flex flex-col py-1 pl-1 mt-2">
        <span className="loader"></span>
      </div>
    </div>
  );
};

const BotMessage = (props: MessageProps) => {
  return (
    <div className="flex flex-col mb-4 message">
      <div className="flex items-center justify-start">
        <div className="h-[32px] px-[2px] pt-1.5 bg-gray-800 rounded-full">
          <img
            className="p-1 bg-gray-800 rounded-full"
            src="/images/bot.svg"
            alt="chat-bot"
          />
        </div>
        <span className="px-2 text-sm text-gray-400">Chatbot</span>
      </div>
      <div className="flex flex-col px-2 py-1 mt-2">
        <span className="text-sm text-gray1">
          <Markdown>{props.text}</Markdown>
        </span>

        {!props.disableCites && (
          <div className="flex items-center gap-4 pt-0.5">
            <AiOutlineMessage
              onClick={() => {
                props.handleClickCitedMessage?.(props.text);
              }}
              className="w-5 h-5 text-gray-400 border p-0.5 rounded-md hover:scale-105 cursor-pointer"
            />
          </div>
        )}
      </div>
    </div>
  );
};

const UserMessage = (props: MessageProps) => {
  return (
    <div className="flex flex-col items-end mb-4 message">
      <div className="flex items-center justify-end">
        <span className="px-2 text-sm text-blue-400">User</span>
        <div className="h-[32px] px-[2px] pt-1.5 bg-blue-600 rounded-full">
          <img
            className="p-1 bg-blue-600 rounded-full"
            src="/images/bot.svg"
            alt="chat-bot"
          />
        </div>
      </div>
      <div className="flex px-2 py-1 mt-2 bg-blue-200 rounded-md rounded-tr-none">
        <span className="text-sm text-blue-600">{props.text}</span>
      </div>
    </div>
  );
};

const Chat = () => {
  const runQuery = useMutationRunQuery();

  const [updateSideChat, setUpdateSideChat] = React.useState("false");

  const [inputValue, setInputValue] = React.useState("");

  const [messages, setMessages] = React.useState<Message[]>([
    { text: "Hello, how can I help you today ?", type: "bot" },
  ]);

  const [citedMessage, setCitedMessage] = React.useState<string>("");
  const [scenario, setScenario] = React.useState<string>("");

  const handleSubmitMessage = (message: string) => {
    if (!message) return;

    setMessages((prev) => [...prev, { text: message, type: "user" }]);

    try {
      const lastMessagesStr = localStorage.getItem("lastMessages") || "[]";
      const lastMessagesJson: string[] = JSON.parse(lastMessagesStr);
      lastMessagesJson.push(message);
      localStorage.setItem("lastMessages", JSON.stringify(lastMessagesJson));
      handleUpdateSideChat();
    } catch (error) {}

    runQuery.mutate(
      {
        query: citedMessage
          ? `Given the previous message: "${citedMessage}"\nAnswer this new message: ${message}.`
          : message,
      },
      {
        onSuccess: (data) => {
          let text: string =
            data?.result ||
            "Unexpected error occurred. Please try again later.";

          setMessages((prev) => [...prev, { text, type: "bot" }]);
        },
      }
    );

    if (message === inputValue) {
      setInputValue("");
      setCitedMessage("");
    }
  };

  const handleUpdateSideChat = () => {
    setUpdateSideChat((prev) => (prev === "true" ? "false" : "true"));
  };

  const handleClickCitedMessage = (message: string) => {
    setCitedMessage(message);
  };

  const handleResetCitedMessage = () => {
    setCitedMessage("");
    setScenario("");
  };

  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const height = scrollRef.current?.scrollHeight;
    scrollRef.current?.scrollTo(0, height);
  }, [messages]);

  const [tab, setTab] = React.useState("quick");

  return (
    <>
      <SideChat
        key={updateSideChat}
        handleSubmitMessage={(m) => handleSubmitMessage(m)}
        tab={tab}
        setTab={setTab}
      />
      <div className="flex flex-col flex-1 w-full pl-4">
        <div className="flex mb-6 justify-between items-center border-b-2 border-gray-100 h-[58px]">
          <h2 className="py-2 text-xl font-light text-gray-400">Chat</h2>
          <div>
            <button
              onClick={() => {
                setMessages([
                  { text: "Hello, how can I help you today ?", type: "bot" },
                ]);
              }}
              className={`px-3 py-1.5 text-sm  bg-gray-200 text-gray-700 rounded-md active:opacity-80`}
            >
              Reset chat
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-auto messages pr-4 h-full max-h-[250px]"
        >
          {messages.map((message, index) => {
            if (message.type === "bot") {
              return (
                <BotMessage
                  key={index}
                  text={message.text}
                  handleClickCitedMessage={handleClickCitedMessage}
                  disableCites={index === 0}
                />
              );
            } else {
              return <UserMessage key={index} text={message.text} />;
            }
          })}
          {runQuery.isPending && <BotLoadingMessage />}
        </div>

        <div className="pt-2 flex-2">
          <div className="flex bg-white rounded-md write">
            <div className="flex-1 bg-gray-100  h-[72px] rounded-md">
              {citedMessage && (
                <div className="flex items-center gap-2 pt-2 pl-4 text-sm text-gray-500 ">
                  <div>{shortenMessage(citedMessage)}</div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    viewBox="0 0 24 24"
                    className="w-4 h-4 p-0.5 cursor-pointer hover:scale-105 bg-gray-200 rounded-full"
                    onClick={handleResetCitedMessage}
                  >
                    <path d="M 4.9902344 3.9902344 A 1.0001 1.0001 0 0 0 4.2929688 5.7070312 L 10.585938 12 L 4.2929688 18.292969 A 1.0001 1.0001 0 1 0 5.7070312 19.707031 L 12 13.414062 L 18.292969 19.707031 A 1.0001 1.0001 0 1 0 19.707031 18.292969 L 13.414062 12 L 19.707031 5.7070312 A 1.0001 1.0001 0 0 0 18.980469 3.9902344 A 1.0001 1.0001 0 0 0 18.292969 4.2929688 L 12 10.585938 L 5.7070312 4.2929688 A 1.0001 1.0001 0 0 0 4.9902344 3.9902344 z"></path>
                  </svg>
                </div>
              )}
              <div className="flex items-center">
                {scenario && (
                  <div className="pl-4">
                    <img
                      src={scenarioImg[scenario]}
                      className="w-5 h-5"
                      alt="scenario"
                    />
                  </div>
                )}
                <textarea
                  name="message"
                  className="block w-full px-4 pt-2 pb-2 text-sm bg-transparent outline-none"
                  rows={citedMessage ? 1 : 2}
                  placeholder="Type a message..."
                  autoFocus
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSubmitMessage(inputValue);
                    }
                  }}
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;
