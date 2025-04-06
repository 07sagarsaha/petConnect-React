import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useToast } from '../context/ToastContext';
import { useUser } from "@clerk/clerk-react"
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const [vetUsers, setVetUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast(); 
  const [isAdmin , setIsAdmin] = useState(false); 
  const { user } = useUser();
  const Navigate = useNavigate(); 

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const userSnapshot = await getDocs(usersCollection);
        const allUsers = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Separate vet and all users
      const vetUsers = allUsers.filter(user => user.isVet);
      const currentUserDoc = allUsers.find(u => u.id === user?.id);
      const isUserAdmin = currentUserDoc?.isAdmin || false;
      
      setVetUsers(vetUsers);
      setUsers(allUsers);
      setIsAdmin(isUserAdmin);
        
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user]);

  const handleVerification = async (userId, isApproved) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isVetVerified: isApproved,
        verificationDate: new Date().toISOString()
      });

      // Update local state
      setUsers(users.map(user => 
      (user.id === userId && user.isVet === true) 
          ? { ...user, isVetVerified: isApproved }
          : user
      ));
      showToast(`Vet ${isApproved ? 'approved' : 'denied'} successfully`);
    } catch (error) {
      console.error('Error updating verification:', error);
      showToast('Failed to update verification status');
    }
  };

  const handleAdminStatus = async (userId, makeAdmin) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isAdmin: makeAdmin,
      });

      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, isAdmin: makeAdmin }
          : user
      ));

      showToast(`User ${makeAdmin ? 'made admin' : 'removed from admin'} successfully`);
    } catch (error) {
      console.error('Error updating admin status:', error);
      showToast('Failed to update admin status');
    }
  }

  const isClerkId = (id) => {
    // Clerk IDs typically start with 'user_' and are followed by a string of characters
    return typeof id === 'string' && id.startsWith('user_');
  };

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <>
    <div className="p-4">
      {isAdmin && user &&
      <>
      <h1 className="text-2xl font-bold mb-4">Vet Verification Dashboard</h1>
      <button className='btn btn-secondary text-base-content py-4 my-4' onClick={() => Navigate(`/in/home`)}>{"Go to home"}</button>
      <table className='w-full'>
        <thead className='bg-gray-800 text-white w-full'>
          <tr>
            <th className='p-4 text-start'>User ID</th>
            <th className='p-4 text-start'>Email</th>
            <th className='p-4 text-start'>Name</th>
            <th className='p-4 text-start'>Vet RN</th>
            <th className='p-4 text-start'>isVet</th>
            <th className='p-4 text-start'>isVetVerified</th>
            <th className='p-4 text-start'>Status</th>
            <th className='p-4 text-start'>Actions</th>
          </tr>
        </thead>
        <tbody className='bg-gray-200 w-full'>
          {vetUsers.map(user => (
            <tr key={user.id} className="border-b">
              <td className='p-4'>{user.id}</td>
              <td className='p-4'>{user.email}</td>
              <td className='p-4'>{user.name}</td>
              <td className='p-4'>{user.rnum}</td>
              <td className='p-4'>{user.isVet ? 'User is vet' : 'User is not vet'}</td>
              <td className='p-4'>{user.isVetVerified ? 'User is verified vet' : 'User is not verified vet'}</td>
              <td className='p-4'>
                {user.isVetVerified === true && 'Approved'}
                {user.isVetVerified === false && 'Denied'}
                {user.isVetVerified === undefined && 'Pending'}
              </td>
              <td className='p-4 space-x-2'>
                {!user.isVetVerified && (
                  <>
                    <button
                      onClick={() => handleVerification(user.id, true)}
                      className="bg-green-500 text-white px-3 py-1 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleVerification(user.id, false)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Deny
                    </button>
                  </>
                )}
                {user.isVetVerified && (
                  <button
                    onClick={() => handleVerification(user.id, false)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Deny
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">User Management</h2>
        <table className='w-full'>
          <thead className='bg-gray-800 text-white w-full'>
            <tr>
              <th className='p-4 text-start'>User ID</th>
              <th className='p-4 text-start'>Email</th>
              <th className='p-4 text-start'>Name</th>
              <th className='p-4 text-start'>is using Clerk</th>
              <th className='p-4 text-start'>Is Admin</th>
              <th className='p-4 text-start'>Is Vet</th>
              <th className='p-4 text-start'>Actions</th>
            </tr>
          </thead>
          <tbody className='bg-gray-200 w-full'>
            {users.map(u => (
              <tr key={u.id} className="border-b">
                <td className='p-4'>{u.id}</td>
                <td className='p-4'>{u.email}</td>
                <td className='p-4'>{u.name}</td>
                <td className='p-4'>{isClerkId(u.id) ? 'using Clerk' : 'using Firebase'}</td>
                <td className='p-4'>{u.isAdmin ? 'Admin' : 'Normal User'}</td>
                <td className='p-4'>{u.isVetVerified ? 'Vet' : 'Not Vet'}</td>
                <td className='p-4 space-x-2'>
                  {u.id !== user.id ? ( 
                    <>
                      {!u.isAdmin ? (
                        <button
                          onClick={() => handleAdminStatus(u.id, true)}
                          className="bg-blue-500 text-white px-3 py-1 rounded w-52"
                        >
                          Make Admin
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAdminStatus(u.id, false)}
                          className="bg-orange-500 text-white px-3 py-1 rounded w-52"
                        >
                          Remove Admin
                        </button>
                      )}
                    </>
                  ): (
                    <span className="text-gray-500">You</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </>
      }
    </div>
    {!isAdmin && user &&
    <div className="text-center p-4">
      <h1 className="text-2xl font-bold mb-4">You are not authorized to view this page</h1>
      <p>Please contact an admin for more information.</p>
      <button className='btn btn-secondary text-base-content py-4 my-4' onClick={() => Navigate(`/in/home`)}>{"Go to home"}</button>
      </div>}
    </>
  );
};

export default Admin;