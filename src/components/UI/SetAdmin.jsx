import React, { useState } from "react";
import { IoIosArrowDown, IoMdClose } from "react-icons/io";
import { BiCopy } from "react-icons/bi";
import { useToast } from "../../context/ToastContext";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import pfp from "../../icons/pfp.png";
import { db } from "../../firebase/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const SetAdmin = ({ users }) => {
  const [isUserTableOpen, setIsUserTableOpen] = useState(false);
  const { showToast } = useToast();
  const { user } = useUser();
  const Navigate = useNavigate();
  const [confirmBox, setConfirmBox] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [admin, setAdmin] = useState(users);

  const handleAdminStatus = async (userId, makeAdmin) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        isAdmin: makeAdmin,
      });

      // Update local state
      setAdmin(
        users.map((user) =>
          user.id === userId ? { ...user, isAdmin: makeAdmin } : user
        )
      );

      setConfirmBox(false);
      showToast(
        `${selectedUserId.name} ${makeAdmin ? "made admin" : "removed from admin"} successfully`
      );
    } catch (error) {
      console.error("Error updating admin status:", error);
      showToast("Failed to update admin status");
    }
  };

  const isClerkId = (id) => {
    // Clerk IDs typically start with 'user_' and are followed by a string of characters
    return typeof id === "string" && id.startsWith("user_");
  };

  return (
    <div className="mt-8 w-full">
      <div
        className="flex items-center cursor-pointer bg-base-100 py-4 rounded-t border-b-2 border-base-300"
        onClick={() => setIsUserTableOpen(!isUserTableOpen)}
      >
        <h2 className="text-2xl font-bold">{"User Management"}</h2>
        <span className="ml-2">
          <IoIosArrowDown
            size={20}
            className={`transition-all ${isUserTableOpen ? `-rotate-180` : `rotate-0`}`}
          />
        </span>
      </div>
      <div className={`h-fit ${isUserTableOpen ? "inline" : "hidden"}`}>
        {admin
          .slice()
          .sort((a, b) => {
            // Admins first
            if (a.isAdmin && !b.isAdmin) return -1;
            if (!a.isAdmin && b.isAdmin) return 1;
            // Then Clerk users
            if (isClerkId(a.id) && !isClerkId(b.id)) return -1;
            if (!isClerkId(a.id) && isClerkId(b.id)) return 1;
            // Otherwise, keep order
            return 0;
          })
          .map((u) => (
            <>
              <div
                key={u.id}
                className="grid grid-cols-4 max-sm:flex max-sm:flex-col max-sm:justify-start max-sm:items-start gap-4 w-full my-4 shadow-Uni shadow-base-300 rounded-xl p-4 items-center"
              >
                {/* Avatar + Name */}
                <div className="flex flex-row gap-3 items-center col-span-1">
                  <img
                    src={u.profilePic ?? pfp}
                    className="size-14 rounded-full object-cover cursor-pointer"
                    onClick={() => {
                      Navigate(`/in/profile/${u.id}`);
                    }}
                  />
                  <div className="flex flex-col">
                    <span className="font-bold">{u.name}</span>
                    <div className="flex flex-row gap-2 items-center">
                      <span className="p-2 rounded-md bg-base-300 w-fit">
                        {isClerkId(u.id) ? "Clerk" : "Firebase"}
                      </span>
                      {u.isAdmin && (
                        <span className="p-2 rounded-md bg-base-300 w-fit">
                          {"Admin"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {/* ID + Email */}
                <span className="font-medium col-span-1 max-sm:text-sm">
                  {u.id}
                  <button
                    className="btn ml-2 btn-sm"
                    onClick={() => {
                      navigator.clipboard.writeText(u.id);
                      showToast("Copied to clipboard!: " + u.id);
                    }}
                  >
                    <BiCopy />
                  </button>
                </span>
                <span className="font-medium col-span-1 max-sm:ml-0 ml-16">
                  {u.email}
                  <button
                    className="btn ml-2 btn-sm"
                    onClick={() => {
                      navigator.clipboard.writeText(u.email);
                      showToast("Copied to clipboard!: " + u.email);
                    }}
                  >
                    <BiCopy />
                  </button>
                </span>

                {/* Actions */}
                <div className="flex justify-end">
                  {u.id !== user.id ? (
                    !u.isAdmin ? (
                      <button
                        onClick={() => {
                          setSelectedUserId(u);
                          setConfirmBox(!confirmBox);
                        }}
                        className="btn-success text-base-100 btn btn-md"
                      >
                        {"Make Admin"}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedUserId(u);
                          setConfirmBox(!confirmBox);
                        }}
                        className="btn-error text-base-100 btn btn-md"
                      >
                        {"Remove Admin"}
                      </button>
                    )
                  ) : (
                    <span className="text-gray-500">{"You"}</span>
                  )}
                </div>
              </div>
            </>
          ))}
      </div>
      {confirmBox && (
        <>
          <div
            className="fixed z-20 bg-black opacity-70 w-full h-full left-0 top-0"
            onClick={() => setConfirmBox(!confirmBox)}
          />
          <div className="fixed bg-base-200 flex justify-center items-center z-30 flex-col w-2/5 max-sm:w-4/5 h-fit left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-7 rounded-xl">
            <button
              className="text-lg p-2 rounded-full bg-primary text-base-100 hover:bg-base-300 hover:text-error transition-colors duration-200 self-end mb-5"
              onClick={() => setConfirmBox(!confirmBox)}
            >
              <IoMdClose />
            </button>
            <h3 className="text-2xl font-semibold mb-2 -translate-y-10">
              {"Are you sure?"}
            </h3>
            <p className="mb-4">
              {`You want to make ${selectedUserId.name} `}
              {selectedUserId.isAdmin ? "not an admin?" : "an admin?"}
            </p>
            <div className="flex flex-row gap-5">
              <button
                className="btn-primary btn btn-base-100 rounded-xl text-xl"
                onClick={() =>
                  handleAdminStatus(selectedUserId.id, !selectedUserId.isAdmin)
                }
              >
                {"Yes"}
              </button>
              <button
                className="border-2 border-primary btn btn-base-100 rounded-xl text-xl"
                onClick={() => setConfirmBox(!confirmBox)}
              >
                {"No"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SetAdmin;
