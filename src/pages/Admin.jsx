import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useToast } from "../context/ToastContext";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { IoIosArrowDown, IoIosArrowDropleft, IoMdClose } from "react-icons/io";
import pfp from "../icons/pfp.png";
import { BiCheck, BiCopy, BiCross, BiInfoCircle } from "react-icons/bi";
import { FaUserDoctor } from "react-icons/fa6";

const Admin = () => {
  const [vetUsers, setVetUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [isVetTableOpen, setIsVetTableOpen] = useState(false);
  const [isUserTableOpen, setIsUserTableOpen] = useState(false);
  const [isFeedbackTableOpen, setIsFeedbackTableOpen] = useState(false);
  const [isBugTableOpen, setIsBugTableOpen] = useState(false);
  const [isOthersTableOpen, setIsOthersTableOpen] = useState(false);
  const [confirmBox, setConfirmBox] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [feedbacks, setFeedback] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [others, setOthers] = useState([]);
  const { user } = useUser();
  const Navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users");
        const userSnapshot = await getDocs(usersCollection);
        const allUsers = userSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Separate vet and all users
        const vetUsers = allUsers.filter((user) => user.isVet);
        const currentUserDoc = allUsers.find((u) => u.id === user?.id);
        const isUserAdmin = currentUserDoc?.isAdmin || false;

        setVetUsers(vetUsers);
        setUsers(allUsers);
        setIsAdmin(isUserAdmin);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user]);

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

        const bug = feedbackList.filter(
          (feedback) => feedback.feedbackType === "Bug"
        );

        const other = feedbackList.filter(
          (feedback) => feedback.feedbackType === "Others"
        );

        setFeedback(feedback);
        setBugs(bug);
        setOthers(other);
      } catch (error) {
        console.error(error);
      }
    };

    fetchFeedback();
  }, []);

  const handleVerification = async (userId, isApproved) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        isVetVerified: isApproved,
        verificationDate: new Date().toISOString(),
      });

      // Update local state
      const updatedUsers = users.map((user) =>
        user.id === userId && user.isVet === true
          ? { ...user, isVetVerified: isApproved }
          : user
      );

      setUsers(updatedUsers);
      setVetUsers(updatedUsers.filter((user) => user.isVet));
      showToast(`Vet ${isApproved ? "approved" : "denied"} successfully`);
    } catch (error) {
      console.error("Error updating verification:", error);
      showToast("Failed to update verification status");
    }
  };

  const handleAdminStatus = async (userId, makeAdmin) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        isAdmin: makeAdmin,
      });

      // Update local state
      setUsers(
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

  const handleDeleteFeedback = async (id) => {
    try {
      await deleteDoc(doc(db, "feedback", id));
      setFeedback((prev) => prev.filter((fb) => fb.id !== id));
      setBugs((prev) => prev.filter((fb) => fb.id !== id));
      setOthers((prev) => prev.filter((fb) => fb.id !== id));
      showToast("Feedback deleted successfully!");
    } catch (error) {
      console.error("Error deleting feedback:", error);
      showToast("Failed to delete feedback");
    }
  };

  const isClerkId = (id) => {
    // Clerk IDs typically start with 'user_' and are followed by a string of characters
    return typeof id === "string" && id.startsWith("user_");
  };

  const pendingCount = vetUsers.filter(
    (user) => user.isVetVerified === undefined
  ).length;

  const feedbackCount = feedbacks.length;

  const bugCount = bugs.length;

  const othersCount = others.length;

  useEffect(() => {
    setIsVetTableOpen(pendingCount > 0);
    setIsFeedbackTableOpen(feedbackCount > 0);
    setIsBugTableOpen(bugCount > 0);
    setIsOthersTableOpen(othersCount > 0);
  }, [pendingCount, feedbackCount, bugCount, othersCount]);

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <>
      <div className="p-8 max-sm:p-4">
        {isAdmin && user && (
          <>
            <div className="flex flex-row gap-3 items-center bg-base-300 rounded-xl p-2 w-fit">
              <button
                className="btn btn-ghost btn-md"
                onClick={() => Navigate(`/in/home`)}
              >
                <IoIosArrowDropleft size={30} />
              </button>
              <h1 className="text-2xl font-extrabold mr-4">{"Admin Panel"}</h1>
            </div>
            <div
              className="flex items-center cursor-pointer border-b-2 border-base-300 text-base-content py-4 rounded-t"
              onClick={() => setIsVetTableOpen(!isVetTableOpen)}
            >
              <h1 className="text-2xl font-bold flex flex-row gap-2 items-center">
                <span className="py-2">{"Vet Verification Dashboard"}</span>
                {pendingCount !== 0 && (
                  <span className="font-medium text-base flex flex-row gap-2 text-center px-4 py-2 rounded-full bg-base-300">
                    <span>{"Pending: "}</span>
                    <span>{pendingCount}</span>
                  </span>
                )}
              </h1>
              <span className="ml-2">
                <IoIosArrowDown
                  size={20}
                  className={`transition-all ${isVetTableOpen ? `-rotate-180` : `rotate-0`}`}
                />
              </span>
            </div>
            <div
              className={`transition-all duration-300 flex flex-row max-sm:flex-col gap-3 mt-4 overflow-auto p-4 ${isVetTableOpen ? ` inline` : `hidden`}`}
            >
              {vetUsers
                .slice() // make a shallow copy to avoid mutating state
                .sort((a, b) => {
                  // Pending (undefined) first, then others
                  if (
                    a.isVetVerified === undefined &&
                    b.isVetVerified !== undefined
                  )
                    return -1;
                  if (
                    a.isVetVerified !== undefined &&
                    b.isVetVerified === undefined
                  )
                    return 1;
                  return 0;
                })
                .map((user) => (
                  <>
                    <div
                      key={user.id}
                      className="w-full sm:w-fit h-fit p-4 shadow-Uni shadow-base-300 rounded-lg bg-base-100 flex flex-col gap-3"
                    >
                      <div
                        className="flex flex-row gap-2 items-center"
                        aria-label="Go to User"
                      >
                        <img
                          src={user.profilePic || pfp}
                          className="size-14 object-cover rounded-full cursor-pointer"
                          onClick={() => {
                            Navigate(`/in/profile/${user.id}`);
                          }}
                        />
                        <div className="flex flex-col">
                          <span className="font-bold">{user.name}</span>
                          <span className="font-normal max-w-[200px] truncate sm:max-w-none">
                            {user.id}
                            <button
                              className="btn btn-circle btn-sm"
                              onClick={() => {
                                navigator.clipboard.writeText(user.id);
                                showToast("Copied to clipboard!");
                              }}
                            >
                              <BiCopy />
                            </button>
                          </span>
                        </div>
                      </div>
                      <span className="p-4 rounded-lg bg-base-300 flex flex-row gap-2">
                        {user.isVet && user.isVetVerified === true
                          ? `This user is a vet`
                          : user.isVetVerified === undefined
                            ? `This user has requested to be a vet`
                            : `This user in not a vet`}
                        {user.isVetVerified === undefined && (
                          <span className="text-primary text-2xl size-3 text-start max-sm:mr-4">
                            <BiInfoCircle className="text-base-200 bg-error p-1 rounded-full" />
                          </span>
                        )}
                        {user.isVetVerified === true && (
                          <span className="text-primary text-2xl size-3 text-center">
                            <FaUserDoctor className="text-base-200 bg-success p-1 rounded-full" />
                          </span>
                        )}
                      </span>
                      {user.rnum ? (
                        <span className="p-4 rounded-lg bg-base-300 flex flex-row gap-3 items-center">
                          {`User's Vet Registration Number: `}
                          {user.rnum}
                          <button
                            className="btn btn-circle btn-sm"
                            onClick={() => {
                              navigator.clipboard.writeText(user.rnum);
                              showToast("Copied to clipboard!");
                            }}
                          >
                            <BiCopy />
                          </button>
                        </span>
                      ) : (
                        <span className="p-4 rounded-lg bg-base-300 flex flex-row gap-3 items-center">
                          {
                            "This user did not provide a Vet Registration Number for some reason"
                          }
                          <button
                            className="btn btn-circle btn-sm"
                            onClick={() => {
                              showToast("No data found!");
                            }}
                          >
                            <BiInfoCircle />
                          </button>
                        </span>
                      )}
                      {user.address ? (
                        <span className="p-4 rounded-lg bg-base-300 flex flex-row gap-3 items-center">
                          {`User's Address: `}
                          {user.address}
                          <button
                            className="btn btn-circle btn-sm"
                            onClick={() => {
                              navigator.clipboard.writeText(user.address);
                              showToast("Copied to clipboard!");
                            }}
                          >
                            <BiCopy />
                          </button>
                        </span>
                      ) : (
                        <span className="p-4 rounded-lg bg-base-300 flex flex-row gap-3 items-center">
                          {"This user did not provide any address"}
                          <button
                            className="btn btn-circle btn-sm"
                            onClick={() => {
                              showToast("No data found!");
                            }}
                          >
                            <BiInfoCircle />
                          </button>
                        </span>
                      )}
                      <div className="flex flex-row gap-2">
                        {user.isVetVerified === undefined ? (
                          <>
                            <button
                              className="btn btn-success rounded-xl text-base-100"
                              onClick={() => {
                                handleVerification(user.id, true);
                              }}
                            >
                              <BiCheck size={25} />
                              {"Verify as vet"}
                            </button>
                            <button
                              className="btn btn-error rounded-xl text-base-100"
                              onClick={() => {
                                handleVerification(user.id, false);
                              }}
                            >
                              <IoMdClose size={25} />
                              {"Deny"}
                            </button>
                          </>
                        ) : user.isVetVerified === true ? (
                          <>
                            <button
                              className="btn btn-error rounded-xl text-base-100"
                              onClick={() => {
                                handleVerification(user.id, false);
                              }}
                            >
                              <IoMdClose size={25} />
                              {"Revoke"}
                            </button>
                          </>
                        ) : (
                          user.isVetVerified === false && (
                            <>
                              <button
                                className="btn btn-accent rounded-xl text-base-100"
                                onClick={() => {
                                  handleVerification(user.id, true);
                                }}
                              >
                                <BiCheck size={25} />
                                {"Reverify"}
                              </button>
                            </>
                          )
                        )}
                      </div>
                    </div>
                  </>
                ))}
            </div>
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
                {users
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
                                onClick={() => handleAdminStatus(u.id, false)}
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
            </div>
            {/*Feedback Table*/}
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
                  <span className="font-light italic">
                    {"You're all caught up!"}
                  </span>
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
                                  navigator.clipboard.writeText(user.rnum);
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
            {/*Bug Table*/}
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
                  <span className="font-light italic">
                    {"You're all caught up!"}
                  </span>
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
                                  navigator.clipboard.writeText(user.rnum);
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
            {/*Other Table*/}
            <div className="mt-8">
              <div
                className="flex items-center cursor-pointer bg-base-100 text-base-content py-4 rounded-t border-b-2 border-base-300"
                onClick={() => setIsOthersTableOpen(!isOthersTableOpen)}
              >
                <div className="flex flex-row gap-3 items-center">
                  <h2 className="text-2xl font-bold">{"Others"}</h2>
                  {othersCount !== 0 && (
                    <span className="font-medium text-base flex flex-row gap-2 text-center px-4 py-2 rounded-full bg-base-300">
                      <span>{"Pending: "}</span>
                      <span>{othersCount}</span>
                    </span>
                  )}
                </div>
                <span className="ml-2">
                  <IoIosArrowDown
                    size={20}
                    className={`transition-all ${isOthersTableOpen ? `-rotate-180` : `rotate-0`}`}
                  />
                </span>
              </div>
              <div
                className={`transition-all duration-300 flex flex-row max-sm:flex-col gap-3 mt-4 overflow-auto p-4 ${isOthersTableOpen ? ` inline` : `hidden`}`}
              >
                {othersCount === 0 && (
                  <span className="font-light italic">
                    {"You're all caught up!"}
                  </span>
                )}
                {others
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
                                  navigator.clipboard.writeText(user.rnum);
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
          </>
        )}
      </div>
      {!isAdmin && user && (
        <div className="text-center p-4">
          <h1 className="text-2xl font-bold mb-4">
            You are not authorized to view this page
          </h1>
          <p>Please contact an admin for more information.</p>
          <button
            className="btn btn-secondary text-base-content py-4 my-4"
            onClick={() => Navigate(`/in/home`)}
          >
            {"Go to home"}
          </button>
        </div>
      )}

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
            <p className="mb-4">{`You want to make ${selectedUserId.name} an Admin?`}</p>
            <div className="flex flex-row gap-5">
              <button
                className="bg-primary rounded-xl text-xl btn"
                onClick={() => handleAdminStatus(selectedUserId.id, true)}
              >
                Yes
              </button>
              <button
                className="border-2 border-primary btn rounded-xl text-xl"
                onClick={() => setConfirmBox(!confirmBox)}
              >
                No
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Admin;
