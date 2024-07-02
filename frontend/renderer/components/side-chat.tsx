import React, { useEffect } from "react";

interface SideChatProps {
  handleSubmitMessage: (message: string) => void;
  tab: string;
  setTab: (tab: string) => void;
}

const exampleActions = [
  {
    name: "Tasks updates",
    text: "Get the stuck items on monday for the agileloop board",
    img: "/images/monday.svg",
    className: "gradient-green",
  },
  {
    name: "Tasks durations",
    text: "Get the total duration of my tasks in monday for the board agileloop",
    img: "/images/monday.svg",
    className: "gradient-green",
  },
  {
    name: "Publish on slack",
    text: "Send a message in slack to the general channel saying 'hello everyone'",
    img: "/images/slack.svg",
    className: "gradient-yellow",
  },
  {
    name: "Send email",
    text: "Send an email to something@gmail with subject 'Payment Link' and content 'Here is the payment link: https://stripe.com/link'",
    img: "/images/email.svg",
    className: "gradient-blue",
  },
  {
    name: "Stripe payment link",
    text: "Generate a stripe payment link for 3 hour of development",
    img: "/images/stripe.jpg",
    className: "gradient-purple",
  },
];

const HistoryItem = ({ name, text, ...rest }) => {
  return (
    <div className="mb-3 bg-gray-100 rounded-md cursor-pointer entry" {...rest}>
      <div className="p-3 pb-3.5">
        <div className="break-words">
          <span className="text-sm font-semibold text-blue-600">{name}</span>
          <p className="text-sm text-gray2">{text}</p>
        </div>
      </div>
    </div>
  );
};

const ActionItem = ({ name, text, img, className = "", ...rest }) => {
  return (
    <div
      className={`mb-4 w-full transform bg-gray-100 rounded-md cursor-pointer entry ${className}`}
      {...rest}
    >
      <div className="p-3 pb-3.5 grid grid-cols-12 gap-4">
        <div className="flex items-center justify-center col-span-2">
          <img src={img} className="w-10 h-10 rounded-md" />
        </div>
        <div className="col-span-10 break-words">
          <span className="text-sm font-semibold text-gray-600">{name}</span>
          <p className="text-xs text-gray2">{text}</p>
        </div>
      </div>
    </div>
  );
};

const SideChat = (props: SideChatProps) => {
  const { tab, setTab } = props;

  const [lastMessages, setLastMessages] = React.useState<string[]>([]);

  useEffect(() => {
    const lastMessages = localStorage.getItem("lastMessages");
    if (lastMessages) {
      setLastMessages(JSON.parse(lastMessages)?.reverse());
    }
  }, []);

  return (
    <div className="flex-col hidden pr-4 border-r-2 border-gray-100 sidebar lg:flex flex-2 max-w-[450px] w-full">
      <div className="flex items-center justify-between gap-8 h-[40px]">
        <h1 className="text-xl font-light text-gray-400">Quick actions</h1>
        <div className="flex items-center gap-2 ">
          <button
            onClick={() => setTab("quick")}
            className={`px-3 py-1.5 text-sm  ${
              tab === "quick"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-black"
            } rounded-md active:opacity-80`}
          >
            Quick actions
          </button>
          <button
            onClick={() => setTab("history")}
            className={`px-3 py-1.5 text-sm  ${
              tab === "history"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            } rounded-md active:opacity-80`}
          >
            History
          </button>
        </div>
      </div>
      <div className="flex-1 max-h-[360px] h-full pt-4 mt-4 overflow-auto border-t-2 border-gray-100 pr-2">
        {tab === "history" && (
          <>
            {lastMessages?.map((message, index) => (
              <HistoryItem
                key={index}
                name="Action"
                text={message}
                onClick={() => props.handleSubmitMessage(message)}
              />
            ))}

            <button
              onClick={() => {
                localStorage.removeItem("lastMessages");
                setLastMessages([]);
              }}
              disabled={lastMessages.length === 0}
              className="flex justify-center w-full p-2 mb-4 text-sm text-white transform bg-blue-600 rounded-md cursor-pointer disabled:hover:scale-100 disabled:cursor-default disabled:bg-gray-400 active:bg-opacity-80"
            >
              Clear history
            </button>
          </>
        )}
        {tab === "quick" && (
          <>
            {exampleActions?.map((ac, index) => (
              <ActionItem
                key={index}
                {...ac}
                onClick={() => props.handleSubmitMessage(ac.text)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default SideChat;
