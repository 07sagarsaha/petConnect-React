import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { BiCheck, BiCheckCircle } from "react-icons/bi";
import { IoIosArrowDown, IoIosArrowUp, IoMdClose } from "react-icons/io";
import { useToast } from "../../context/ToastContext";
import { useNotification } from "../../pages/Notification";
import { useNavigate } from "react-router-dom";
import { MdReport } from "react-icons/md";
import { IoTrashBin } from "react-icons/io5";

const AdminReports = () => {
  const [isReportsTableOpen, setIsReportsTableOpen] = useState(false);
  const { showToast } = useToast();
  const [ReportsCount, setReportsCount] = useState(0);
  const [Reportss, setReports] = useState([]);
  const [posts, setPosts] = useState({});
  const { openNotificationModal, NotificationModal } = useNotification();
  const navigate = useNavigate();

  // Action modal state
  const [showActionModal, setShowActionModal] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [actionModalResolve, setActionModalResolve] = useState(null);

  useEffect(() => {
    setReportsCount(Reportss.length);
  }, [Reportss]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const ReportsCollection = collection(db, "reports");
        const ReportsSnapshot = await getDocs(ReportsCollection);

        const ReportsList = ReportsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setReports(ReportsList);

        // Fetch posts for each report
        const postsData = {};
        for (const report of ReportsList) {
          if (report.postId) {
            try {
              const postRef = doc(db, "posts", report.postId);
              const postSnapshot = await getDoc(postRef);
              if (postSnapshot.exists()) {
                postsData[report.postId] = postSnapshot.data();
              }
            } catch (error) {
              console.error(`Error fetching post ${report.postId}:`, error);
            }
          }
        }
        setPosts(postsData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchReports();
  }, []);

  // Function to open action modal and return a promise
  const openActionModal = (reportId, userId, reportDescription, postId) => {
    return new Promise((resolve) => {
      setCurrentReport({ reportId, userId, reportDescription, postId });
      setActionModalResolve(() => resolve);
      setShowActionModal(true);
    });
  };

  // Handle modal actions
  const handleModalAction = async (deletePost) => {
    if (actionModalResolve) {
      if (deletePost && currentReport?.postId) {
        try {
          // Delete the reported post
          await deleteDoc(doc(db, "posts", currentReport.postId));
          showToast("Reported post deleted successfully!");
        } catch (error) {
          console.error("Error deleting post:", error);
          showToast("Failed to delete post");
        }
      }

      actionModalResolve(deletePost);
      setShowActionModal(false);
      setCurrentReport(null);
      setActionModalResolve(null);
    }
  };

  const handleCompleteReports = async (id, userId, report, postId) => {
    try {
      // Open modal and wait for result
      await openActionModal(id, userId, report, postId);

      const success = await openNotificationModal(
        true,
        userId,
        `Your Reports for, "${report}", has been taken care of. Thank you for your Reports!`,
        "reports"
      );

      if (success) {
        await deleteDoc(doc(db, "reports", id));
        setReports((prev) => prev.filter((fb) => fb.id !== id));
        showToast("Report resolved successfully!");
      }
    } catch (error) {
      console.error("Error deleting Reports:", error);
      showToast("Failed to delete Reports");
    }
  };

  useEffect(() => {
    setIsReportsTableOpen(ReportsCount > 0);
  }, [ReportsCount]);

  return (
    <div className="mt-8">
      <div
        className="flex items-center cursor-pointer bg-base-100 text-base-content py-4 rounded-t border-b-2 border-base-300"
        onClick={() => setIsReportsTableOpen(!isReportsTableOpen)}
      >
        <div className="flex flex-row gap-3 items-center">
          <h2 className="text-2xl font-bold">{"Reports"}</h2>
          {ReportsCount !== 0 && (
            <span className="font-medium text-base flex flex-row gap-2 text-center px-4 py-2 rounded-full bg-base-300">
              <span>{"Pending: "}</span>
              <span>{ReportsCount}</span>
            </span>
          )}
        </div>
        <span className="ml-2">
          <IoIosArrowDown
            size={20}
            className={`transition-all ${isReportsTableOpen ? `-rotate-180` : `rotate-0`}`}
          />
        </span>
      </div>
      <div
        className={`transition-all duration-300 flex flex-row max-sm:flex-col gap-3 mt-4 overflow-auto p-4 ${isReportsTableOpen ? ` inline` : `hidden`}`}
      >
        {ReportsCount === 0 && (
          <span className="font-light italic">{"You're all caught up!"}</span>
        )}
        {Reportss.map((report) => {
          const reportedPost = posts[report.postId];
          return (
            <div
              key={report.id}
              className="w-fit max-sm:w-full min-w-[30%] h-fit p-4 shadow-Uni shadow-base-300 rounded-lg bg-base-100 flex flex-col gap-3"
            >
              <div className="flex justify-between">
                <div className="flex flex-row gap-2 items-center">
                  <div className="flex flex-col">
                    <span className="font-normal">{report.id}</span>
                  </div>
                </div>
              </div>
              <span className="py-4 px-2 rounded-lg bg-base-300 flex flex-row gap-3 items-center">
                <p>{"Report type:"}</p>
                <p className="p-2 bg-base-100 rounded-md">{report.reason}</p>
              </span>
              <span className="py-4 px-2 rounded-lg bg-base-300 flex flex-row gap-3 items-center">
                {report.description}
              </span>
              {reportedPost && (
                <div className="py-4 px-2 rounded-lg bg-base-300 flex flex-col gap-3">
                  <p className="font-semibold">Reported Post:</p>
                  <div
                    className="flex flex-row gap-2 p-2 bg-base-100 w-fit h-fit rounded-full cursor-pointer hover:bg-base-200 transition-colors"
                    onClick={() => {
                      navigate(`/in/profile/${reportedPost.userId}`);
                    }}
                  >
                    <img
                      src={report.profilePic}
                      alt="Profile"
                      className="w-6 h-auto aspect-square object-cover rounded-full"
                    />
                    <p>{reportedPost.handle}</p>
                  </div>
                  <p className="font-medium">{reportedPost.title}</p>
                  <p className="text-sm">{reportedPost.content}</p>
                  {reportedPost.imageUrl && (
                    <>
                      <div className="aspect-video flex justify-center w-full h-[500px] max-sm:h-full overflow-hidden rounded-xl">
                        <img
                          src={reportedPost.imageUrl}
                          alt="Post"
                          className="h-full rounded-none object-contain cursor-pointer "
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
              <div className="flex flex-row gap-2">
                <button
                  className="btn btn-success text-base-100"
                  onClick={() => {
                    handleCompleteReports(
                      report.id,
                      report.userId,
                      report.description,
                      report.postId
                    );
                  }}
                >
                  <MdReport size={25} />
                  {"Take Action"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Modal */}
      {showActionModal && currentReport && (
        <>
          <div
            className="fixed z-20 bg-black/50 w-full h-full left-0 top-0"
            onClick={() => handleModalAction(false)}
          />
          <div className="fixed bg-base-200/70 backdrop-blur-lg flex justify-center items-center z-30 flex-col w-2/5 max-sm:w-4/5 h-fit left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-7 rounded-xl">
            <button
              className="text-lg p-2 rounded-full bg-primary text-base-100 hover:bg-base-300 hover:text-error transition-colors duration-200 self-end mb-5"
              onClick={() => handleModalAction(false)}
            >
              <IoMdClose />
            </button>
            <h3 className="text-2xl font-semibold mb-2 -translate-y-10">
              {"Take Action on Report"}
            </h3>
            <p className="mb-4 text-center">
              {"Do you want to delete the reported post?"}
            </p>
            <div className="flex flex-row gap-5">
              <button
                className="btn-error btn rounded-xl text-xl flex items-center gap-2"
                onClick={() => handleModalAction(true)}
              >
                <IoTrashBin />
                {"Delete Post"}
              </button>
              <button
                className="btn-success btn rounded-xl text-xl"
                onClick={() => handleModalAction(false)}
              >
                <BiCheckCircle />
                {"Keep Post"}
              </button>
            </div>
          </div>
        </>
      )}

      <NotificationModal />
    </div>
  );
};

export default AdminReports;
