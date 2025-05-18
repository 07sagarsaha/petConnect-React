import React, { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { BiCheck, BiCopy } from "react-icons/bi";
import { IoIosArrowDown } from "react-icons/io";
import pfp from "../../icons/pfp.png";
import { useToast } from "../../context/ToastContext";

const AdminFeedback = () => {
  const [isFeedbackTableOpen, setIsFeedbackTableOpen] = useState(false);
  const { showToast } = useToast();
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [feedbacks, setFeedback] = useState([]);

  useEffect(() => {
    setFeedbackCount(feedbacks.length);
  }, [feedbacks]);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const feedbackCollection = collection(db, "feedback");
        const feedbackSnapshot = await getDocs(feedbackCollection);

        const feedbackList = feedbackSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const feedback = feedbackList.filter(
          (feedback) => feedback.feedbackType === "Feedback"
        );

        setFeedback(feedback);
      } catch (error) {
        console.error(error);
      }
    };

    fetchFeedback();
  }, []);

  const handleDeleteFeedback = async (id) => {
    try {
      await deleteDoc(doc(db, "feedback", id));
      setFeedback((prev) => prev.filter((fb) => fb.id !== id));
      showToast("Feedback deleted successfully!");
    } catch (error) {
      console.error("Error deleting feedback:", error);
      showToast("Failed to delete feedback");
    }
  };

  useEffect(() => {
    setIsFeedbackTableOpen(feedbackCount > 0);
  }, [feedbackCount]);

  return (
    <div className="mt-8">
      <div
        className="flex items-center cursor-pointer bg-base-100 text-base-content py-4 rounded-t border-b-2 border-base-300"
        onClick={() => setIsFeedbackTableOpen(!isFeedbackTableOpen)}
      >
        <div className="flex flex-row gap-3 items-center">
          <h2 className="text-2xl font-bold">{"Feedback"}</h2>
          {feedbackCount !== 0 && (
            <span className="font-medium text-base flex flex-row gap-2 text-center px-4 py-2 rounded-full bg-base-300">
              <span>{"Pending: "}</span>
              <span>{feedbackCount}</span>
            </span>
          )}
        </div>
        <span className="ml-2">
          <IoIosArrowDown
            size={20}
            className={`transition-all ${isFeedbackTableOpen ? `-rotate-180` : `rotate-0`}`}
          />
        </span>
      </div>
      <div
        className={`transition-all duration-300 flex flex-row max-sm:flex-col gap-3 mt-4 overflow-auto p-4 ${isFeedbackTableOpen ? ` inline` : `hidden`}`}
      >
        {feedbackCount === 0 && (
          <span className="font-light italic">{"You're all caught up!"}</span>
        )}
        {feedbacks
          .slice() // make a shallow copy to avoid mutating state
          .sort((a, b) => {
            const importanceOrder = { High: 0, Medium: 1, Low: 2 };
            return (
              (importanceOrder[a.importance] ?? 3) -
              (importanceOrder[b.importance] ?? 3)
            );
          })
          .map((user) => (
            <>
              <div
                key={user.id}
                className="w-fit max-sm:w-full min-w-[30%] h-fit p-4 shadow-Uni shadow-base-300 rounded-lg bg-base-100 flex flex-col gap-3"
              >
                <div className="flex justify-between">
                  <div className="flex flex-row gap-2 items-center">
                    <img
                      src={user.profilePic || pfp}
                      className="size-14 object-cover rounded-full"
                    />
                    <div className="flex flex-col">
                      <span className="font-bold">{user.name}</span>
                      <span className="font-normal">{user.id}</span>
                    </div>
                  </div>
                  <span className="p-2 bg-base-300 rounded-md h-fit w-fit">
                    {user.importance}
                  </span>
                </div>
                <span className="py-2 px-2 max-sm:text-sm rounded-lg bg-base-300 flex flex-row gap-2 items-center">
                  {user.email ? (
                    <>
                      {user.email}
                      <button
                        className="btn btn-circle btn-sm"
                        onClick={() => {
                          navigator.clipboard.writeText(user.email);
                          showToast("Copied to clipboard!");
                        }}
                      >
                        <BiCopy />
                      </button>
                    </>
                  ) : (
                    "User email not found!"
                  )}
                </span>
                <span className="py-4 px-2 rounded-lg bg-base-300 flex flex-row gap-3 items-center">
                  {user.feedback}
                </span>
                <div className="flex flex-row gap-2">
                  <button
                    className="btn btn-success text-base-100"
                    onClick={() => {
                      handleDeleteFeedback(user.id);
                    }}
                  >
                    <BiCheck size={25} />
                    {"Done"}
                  </button>
                </div>
              </div>
            </>
          ))}
      </div>
    </div>
  );
};

export default AdminFeedback;
