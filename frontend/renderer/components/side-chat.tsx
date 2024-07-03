import React, { useEffect } from "react";
import { exampleActions } from "./actions";
import { FaRegTrashAlt } from "react-icons/fa";
import { scenarioClassName, scenarioImg } from "./chat";
import { IoMdEye } from "react-icons/io";

interface SideChatProps {
  handleSubmitMessage: (message: string, aliasMessage?: string) => void;
  tab: string;
  setTab: (tab: string) => void;
}

const HistoryItem = ({ name, text, ...rest }) => {
  return (
    <div className="mb-3 bg-gray-100 rounded-md cursor-pointer entry" {...rest}>
      <div className="p-3 pb-3.5">
        <div className="break-words">
          <span className="text-sm font-semibold text-appPurple">{name}</span>
          <p className="text-sm text-gray2">{text}</p>
        </div>
      </div>
    </div>
  );
};

const ActionItem = ({
  name,
  text,
  image,
  className = "",
  onDelete,
  onView,
  ...rest
}) => {
  return (
    <div
      className={`mb-4 w-full transform bg-gray-100 rounded-md cursor-pointer entry  gradient-purple`}
      {...rest}
    >
      <div className="px-3 pt-3 pb-3.5 grid grid-cols-12 gap-x-4">
        <div className="flex items-center justify-center col-span-2">
          <img src={image} className="w-10 h-10 rounded-md" />
        </div>
        <div className="col-span-10 break-words">
          <div className="flex items-start justify-between">
            <span className="text-sm font-semibold text-gray-600">{name}</span>
            <div className="flex gap-2">
              <FaRegTrashAlt
                className="text-purple-900 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              />
              <IoMdEye
                className="text-purple-900 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onView();
                }}
              />
            </div>
          </div>
          <p className="mt-1 text-xs text-gray2">{text}</p>
        </div>
      </div>
    </div>
  );
};

const SideChat = (props: SideChatProps) => {
  const { tab, setTab } = props;

  const [lastMessages, setLastMessages] = React.useState<string[]>([]);
  const [quickActions, setQuickActions] = React.useState<any[]>([]);
  const [disableForm, setDisableForm] = React.useState(false);

  const [showModal, setShowModal] = React.useState(false);

  const [form, setForm] = React.useState({
    name: "",
    text: "",
    prompt: "",
    image: "",
    className: "",
  });

  useEffect(() => {
    const lastMessages = localStorage.getItem("lastMessages");
    if (lastMessages) {
      setLastMessages(JSON.parse(lastMessages)?.reverse());
    }

    const quickActions = localStorage.getItem("quickActions");
    if (quickActions) {
      setQuickActions(JSON.parse(quickActions));
    }
  }, []);

  const handleCreateAction = () => {
    const currentActions = localStorage.getItem("quickActions");
    const actions = currentActions ? JSON.parse(currentActions) : [];

    const newAction = {
      ...form,
      image: scenarioImg[form.image],
      className: scenarioClassName[form.image],
    };

    actions.unshift(newAction);

    localStorage.setItem("quickActions", JSON.stringify(actions));
    setQuickActions(actions);

    setForm({ name: "", text: "", prompt: "", image: "", className: "" });
    setShowModal(false);
  };

  return (
    <div className="relative">
      <div className="p-4 flex-col hidden border-r-2 h-full border-gray-100 sidebar lg:flex flex-2 max-w-[450px] w-full">
        <div className="flex items-center justify-between gap-8 h-[40px]">
          <h1 className="text-xl font-light text-black">Quick actions</h1>
          <div className="flex items-center gap-2 pr-2">
            <button
              className="px-4 py-2 text-sm text-white transform rounded-md cursor-pointer bg-appPurple disabled:hover:scale-100 disabled:cursor-default disabled:bg-gray-400 active:bg-opacity-80"
              onClick={() => {
                setShowModal(true);
                setDisableForm(false);
              }}
            >
              Create new
            </button>
          </div>
        </div>
        <div className="w-[365px] flex-1 max-h-[300px] h-full pt-4 mt-4 overflow-auto border-t-2 border-gray-100 pr-2">
          {tab === "history" && (
            <>
              <button
                onClick={() => {
                  localStorage.removeItem("lastMessages");
                  setLastMessages([]);
                }}
                disabled={lastMessages.length === 0}
                className="flex justify-center w-full p-2 mb-4 text-sm text-white transform rounded-md cursor-pointer bg-appPurple disabled:hover:scale-100 disabled:cursor-default disabled:bg-gray-400 active:bg-opacity-80"
              >
                Clear history
              </button>
              {lastMessages?.map((message, index) => (
                <HistoryItem
                  key={index}
                  name="Action"
                  text={message}
                  onClick={() => props.handleSubmitMessage(message)}
                />
              ))}
            </>
          )}

          <dialog
            id="my_modal_2"
            className={`modal ${showModal ? "modal-open" : ""}`}
          >
            <div className="text-black bg-white modal-box">
              <h3 className="text-lg font-bold">
                {disableForm ? (
                  form.name
                ) : (
                  <span className="font-light">
                    Add new <span className="font-semibold">Quick action</span>
                  </span>
                )}
              </h3>
              <input
                type="text"
                placeholder="Name"
                disabled={disableForm}
                className="w-full p-2 mt-2 text-sm bg-transparent border rounded-md disabled:bg-gray-50"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Description"
                disabled={disableForm}
                className="w-full p-2 mt-2 text-sm bg-transparent border rounded-md disabled:bg-gray-50"
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
              />
              <textarea
                placeholder="Prompt"
                disabled={disableForm}
                className="w-full p-2 mt-2 text-sm bg-transparent border rounded-md disabled:bg-gray-50"
                value={form.prompt}
                rows={3}
                onChange={(e) => setForm({ ...form, prompt: e.target.value })}
              />
              {!disableForm && (
                <select
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="w-full p-2 mt-2 text-sm bg-transparent border rounded-md"
                >
                  <option value="">Select image</option>
                  <option value="monday">Monday</option>
                  <option value="slack">Slack</option>
                  <option value="email">Email</option>
                  <option value="stripe">Stripe</option>
                </select>
              )}

              <div className="flex justify-end gap-2">
                <button
                  className={`
                   px-4 py-2 mt-4 mb-4 text-sm text-white transform bg-red-500 rounded-md cursor-pointer disabled:hover:scale-100 disabled:cursor-default disabled:bg-gray-400 active:bg-opacity-80 ${
                     disableForm ? "w-full" : "w-1/3"
                   }`}
                  onClick={() => {
                    setShowModal(false);
                    setForm((prev) => ({
                      name: "",
                      text: "",
                      prompt: "",
                      image: "",
                      className: "",
                    }));
                  }}
                >
                  Close
                </button>
                {!disableForm && (
                  <button
                    disabled={
                      !form.name || !form.text || !form.prompt || !form.image
                    }
                    className="w-1/3 px-4 py-2 mt-4 mb-4 text-sm text-white transform rounded-md cursor-pointer bg-appPurple disabled:hover:scale-100 disabled:cursor-default disabled:bg-gray-400 active:bg-opacity-80"
                    onClick={handleCreateAction}
                  >
                    Create
                  </button>
                )}
              </div>
            </div>
          </dialog>
          {tab === "quick" && (
            <>
              {quickActions.length === 0 && (
                <div className="flex items-center justify-center w-full">
                  <p className="text-gray-400">No quick actions yet</p>
                </div>
              )}
              {quickActions?.map((ac, index) => (
                <ActionItem
                  key={index}
                  {...ac}
                  onClick={() => props.handleSubmitMessage(ac.prompt, ac.text)}
                  onView={() => {
                    setForm(ac);
                    setShowModal(true);
                    setDisableForm(true);
                  }}
                  onDelete={() => {
                    const actions = quickActions.filter(
                      (action) => action.name !== ac.name
                    );
                    localStorage.setItem(
                      "quickActions",
                      JSON.stringify(actions)
                    );
                    setQuickActions(actions);
                  }}
                />
              ))}
            </>
          )}
        </div>
      </div>
      <div className="absolute bottom-0 flex justify-center w-full gap-2 py-4 bg-appPurple bg-opacity-10 rounded-bl-md ">
        <button
          onClick={() => setTab("quick")}
          className={`px-3 py-1.5 text-sm bg-white shadow-sm text-appPurple border  ${
            tab === "quick" ? "font-semibold" : "font-light"
          } rounded-md active:opacity-80`}
        >
          Quick actions
        </button>
        <button
          onClick={() => setTab("history")}
          className={`px-3 py-1.5 text-sm bg-white shadow-sm text-appPurple border  ${
            tab === "history" ? "font-semibold" : "font-light"
          } rounded-md active:opacity-80`}
        >
          History
        </button>
      </div>
    </div>
  );
};

export default SideChat;
