import React, { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { BiCheck, BiCopy } from "react-icons/bi";
import { IoIosArrowDown } from "react-icons/io";
import pfp from "../../icons/pfp.png";
import { useToast } from "../../context/ToastContext";
import { useNotification } from "../../pages/Notification";

const AdminBugs = () => {
  const [isBugTableOpen, setIsBugTableOpen] = useState(false);
  const { showToast } = useToast();
  const [bugCount, setBugCount] = useState(0);
  const [bugs, setBugs] = useState([]);
  const { NotificationModal, openNotificationModal } = useNotification();

  useEffect(() => {
    setBugCount(bugs.length);
  }, [bugs]);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const feedbackCollection = collection(db, "feedback");
        const feedbackSnapshot = await getDocs(feedbackCollection);

        const feedbackList = feedbackSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const bug = feedbackList.filter(
          (feedback) => feedback.feedbackType === "Bug"
        );

        setBugs(bug);
      } catch (error) {
        console.error(error);
      }
    };

    fetchFeedback();
  }, []);

  const handleCompleteBug = async (id, userId) => {
    try {
      const success = await openNotificationModal(
        true,
        userId,
        "Your bug has been fixed!",
        "bug"
      );

      if (success) {
        await deleteDoc(doc(db, "feedback", id));
        setBugs((prev) => prev.filter((fb) => fb.id !== id));
        showToast("Bug squashed successfully!");
      }
    } catch (error) {
      console.error("Error deleting bug:", error);
      showToast("Failed to delete bug");
    }
  };

  useEffect(() => {
    setIsBugTableOpen(bugCount > 0);
  }, [bugCount]);

  return (
    <div className="mt-8">
      <div
        className="flex items-center cursor-pointer bg-base-100 text-base-content py-4 rounded-t border-b-2 border-base-300"
        onClick={() => setIsBugTableOpen(!isBugTableOpen)}
      >
        <div className="flex flex-row gap-3 items-center">
          <h2 className="text-2xl font-bold">{"Bugs"}</h2>
          {bugCount !== 0 && (
            <span className="font-medium text-base flex flex-row gap-2 text-center px-4 py-2 rounded-full bg-base-300">
              <span>{"Pending: "}</span>
              <span>{bugCount}</span>
            </span>
          )}
        </div>
        <span className="ml-2">
          <IoIosArrowDown
            size={20}
            className={`transition-all ${isBugTableOpen ? `-rotate-180` : `rotate-0`}`}
          />
        </span>
      </div>
      <div
        className={`transition-all duration-300 flex flex-row max-sm:flex-col gap-3 mt-4 overflow-auto p-4 ${isBugTableOpen ? ` inline` : `hidden`}`}
      >
        {bugCount === 0 && (
          <span className="font-light italic">{"You're all caught up!"}</span>
        )}
        {bugs
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
                      handleCompleteBug(user.id, user.userId);
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
      <NotificationModal />
    </div>
  );
};

export default AdminBugs;
