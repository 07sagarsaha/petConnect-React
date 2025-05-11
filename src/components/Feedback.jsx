import React, { useState } from "react";
import { IoIosArrowDown, IoMdClose } from "react-icons/io";
import { VscFeedback } from "react-icons/vsc";
import { useToast } from "../context/ToastContext";
import { useUser } from "@clerk/clerk-react";
import { collection, db } from "../firebase/firebase";
import { addDoc, doc, getDoc } from "firebase/firestore";
import { redirect } from "react-router-dom";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const Feedback = () => {
  const [feedbackForm, setFeedbackForm] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [typeMenu, openTypeMenu] = useState(false);
  const [impMenu, openImpMenu] = useState(false);
  const [feedbackType, setFeedbackType] = useState("Feedback");
  const [importance, setImportance] = useState("Low");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { user } = useUser();

  const handleSubmit = async () => {
    if (feedback === "") {
      showToast("Please enter your feedback!");
      return;
    }

    if (!user.id) {
      showToast("Signin first to continue!");
      return redirect("/");
    }

    setLoading(true);

    const unsubscribe = collection(db, "feedback");
    const userRef = await getDoc(doc(db, "users", user.id));
    const userName = userRef.exists() ? userRef.data() : { name: "unknown" };

    await addDoc(unsubscribe, {
      feedback: feedback,
      feedbackType: feedbackType,
      importance: importance,
      userId: user?.id,
      name: userName.name,
    })
      .then(() => {
        showToast("Feedback successfully submitted!");
        openImpMenu(false);
        openTypeMenu(false);
        setFeedbackForm(false);
        setLoading(false);
      })
      .catch((error) => {
        showToast("Something went wrong");
        console.error(error);
        openImpMenu(false);
        openTypeMenu(false);
        setFeedbackForm(false);
        setLoading(false);
      });
  };

  return (
    <>
      <button
        className="text-xl btn gap-2 max-sm:w-full w-fit text-semibold text-primary border-2 border-primary hover:border-primary rounded-2xl self-start my-4 max-sm:my-0 flex items-center justify-center bg-base-100 hover:bg-base-100"
        onClick={() => {
          setFeedbackForm(true);
        }}
      >
        <VscFeedback />
        {"Feedback"}
      </button>
      {feedbackForm && (
        <>
          <div className="fixed z-50 w-3/5 h-3/5 max-sm:w-5/6 max-sm:h-4/6 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-base-100 rounded-2xl flex flex-col items-center p-6 gap-4">
            <button
              className="absolute top-5 right-5 rounded-full bg-base-300 text-base-content text-2xl"
              onClick={() => {
                setFeedbackForm(false);
              }}
            >
              <IoMdClose />
            </button>
            <h1 className="mt-4 text-base-content text-xl font-extrabold">
              {"Tell us about this app"}
            </h1>
            <p className="text-center font-normal">
              {
                "Anything that you've noticed from bug to suggestion and feedback, you can report it to us in this form. Just select the type of feedback below!"
              }
            </p>
            <textarea
              className="mt-2 w-3/5 max-sm:w-full h-1/2 max-sm:h-1/3 resize-none rounded-2xl bg-base-300 p-4 outline-none"
              placeholder="Write here..."
              onChange={(e) => {
                setFeedback(e.target.value);
              }}
            />
            <div className="flex flex-row max-sm:flex-col gap-4 max-sm:gap-2 max-sm:w-full">
              <button
                onClick={() => {
                  openImpMenu(false);
                  openTypeMenu(!typeMenu);
                }}
                type="button"
                className="bg-base-300 rounded-lg btn relative outline-none"
              >
                {"Type: "}
                <p className="p-2 bg-base-200 rounded-lg">{feedbackType}</p>
                <IoIosArrowDown
                  className={`transition-all ${typeMenu ? `rotate-180` : `rotate-0`}`}
                />
                {typeMenu && (
                  <div className="absolute z-50 left-0 lg:top-full md:top-full max-sm:bottom-full mt-2 w-full bg-base-100 border border-base-300 rounded-lg shadow-lg flex flex-col">
                    <div
                      className="btn cursor-pointer"
                      onClick={() => {
                        setFeedbackType("Feedback");
                        openTypeMenu(false);
                      }}
                      role="menuitem"
                      tabIndex={0}
                    >
                      {"Feedback"}
                    </div>
                    <div
                      className="btn cursor-pointer"
                      onClick={() => {
                        setFeedbackType("Bug");
                        openTypeMenu(false);
                      }}
                      role="menuitem"
                      tabIndex={0}
                    >
                      {"Bug"}
                    </div>
                    <div
                      className="btn cursor-pointer"
                      onClick={() => {
                        setFeedbackType("Others");
                        openTypeMenu(false);
                      }}
                      role="menuitem"
                      tabIndex={0}
                    >
                      {"Others"}
                    </div>
                  </div>
                )}
              </button>

              <button
                className="bg-base-300 rounded-lg btn relative outline-none"
                onClick={() => {
                  openTypeMenu(false);
                  openImpMenu(!impMenu);
                }}
                type="button"
              >
                {"Importance: "}
                <p className="p-2 bg-base-200 rounded-lg">{importance}</p>
                <IoIosArrowDown
                  className={`transition-all ${impMenu ? `rotate-180` : `rotate-0`}`}
                />
                {impMenu && (
                  <div className="absolute left-0 top-full mt-2 w-full bg-base-100 border border-base-300 rounded-lg shadow-lg z-10 flex flex-col">
                    <div
                      className="btn cursor-pointer"
                      onClick={() => {
                        setImportance("Low");
                        openImpMenu(false);
                      }}
                      role="menuitem"
                      tabIndex={0}
                    >
                      {"Low"}
                    </div>
                    <div
                      className="btn cursor-pointer"
                      onClick={() => {
                        setImportance("Medium");
                        openImpMenu(false);
                      }}
                      role="menuitem"
                      tabIndex={0}
                    >
                      {"Medium"}
                    </div>
                    <div
                      className="btn cursor-pointer"
                      onClick={() => {
                        setImportance("High");
                        openImpMenu(false);
                      }}
                      role="menuitem"
                      tabIndex={0}
                    >
                      {"High"}
                    </div>
                  </div>
                )}
              </button>
            </div>
            <button
              className="btn btn-primary mt-2 text-lg"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <AiOutlineLoading3Quarters className="animate-spin mx-auto" />
              ) : (
                "Submit"
              )}
            </button>
          </div>
          <div
            className="fixed z-40 left-0 top-0 w-full h-full bg-black opacity-50"
            onClick={() => {
              setFeedbackForm(false);
            }}
          />
        </>
      )}
    </>
  );
};

export default Feedback;
