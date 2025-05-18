import React, { useEffect, useState } from "react";
import { IoIosArrowDown, IoMdClose } from "react-icons/io";
import { BiCheck, BiCopy, BiCross, BiInfoCircle } from "react-icons/bi";
import { FaUserDoctor } from "react-icons/fa6";
import { useToast } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";
import pfp from "../../icons/pfp.png";
import { db } from "../../firebase/firebase";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const AdminVetVerification = ({ users }) => {
  const [isVetTableOpen, setIsVetTableOpen] = useState(false);
  const { showToast } = useToast();
  const [vetUsers, setVetUsers] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const Navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const usersCollection = collection(db, "users");
        const userSnapshot = await getDocs(usersCollection);
        const allUsers = userSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const vetUsers = allUsers.filter((user) => user.isVet);
        setVetUsers(vetUsers);
        setPendingCount(
          vetUsers.filter((user) => user.isVetVerified === undefined).length
        );
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleVerification = async (userId, isApproved) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        isVetVerified: isApproved,
        verificationDate: new Date().toISOString(),
      });

      // Update local state
      const updatedUsers = vetUsers.map((user) =>
        user.id === userId && user.isVet === true
          ? { ...user, isVetVerified: isApproved }
          : user
      );

      setVetUsers(updatedUsers.filter((user) => user.isVet));
      showToast(`Vet ${isApproved ? "approved" : "denied"} successfully`);
    } catch (error) {
      console.error("Error updating verification:", error);
      showToast("Failed to update verification status");
    }
  };

  useEffect(() => {
    setIsVetTableOpen(pendingCount > 0);
  }, [pendingCount]);

  return (
    <>
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
      {loading ? (
        <div className="text-center p-4">
          <AiOutlineLoading3Quarters
            className="animate-spin justify-center items-center w-full mt-4"
            size={25}
          />
        </div>
      ) : (
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
      )}
    </>
  );
};

export default AdminVetVerification;
