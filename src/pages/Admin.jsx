import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useToast } from '../context/ToastContext';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast(); 

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const userSnapshot = await getDocs(usersCollection);
        const usersList = userSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(user => user.isVet); // Only get users who registered as vets
        setUsers(usersList);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleVerification = async (userId, isApproved) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isVetVerified: isApproved,
        verificationDate: new Date().toISOString()
      });

      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, isVetVerified: isApproved }
          : user
      ));

      showToast(`Vet ${isApproved ? 'approved' : 'denied'} successfully`);
    } catch (error) {
      console.error('Error updating verification:', error);
      showToast('Failed to update verification status');
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Vet Verification Dashboard</h1>
      <table className='w-full'>
        <thead className='bg-gray-800 text-white w-full'>
          <tr>
            <th className='py-4'>User ID</th>
            <th className='py-4'>Email</th>
            <th className='py-4'>Name</th>
            <th className='py-4'>Vet RN</th>
            <th className='py-4'>isVet</th>
            <th className='py-4'>isVetVerified</th>
            <th className='py-4'>Status</th>
            <th className='py-4'>Actions</th>
          </tr>
        </thead>
        <tbody className='bg-gray-200 w-full'>
          {users.map(user => (
            <tr key={user.id} className="border-b">
              <td className='p-4'>{user.id}</td>
              <td className='p-4'>{user.email}</td>
              <td className='p-4'>{user.name}</td>
              <td className='p-4'>{user.rnum}</td>
              <td className='p-4'>{user.isVet ? 'Yes' : 'No'}</td>
                <td className='p-4'>{user.isVetVerified ? 'Yes' : 'No'}</td>
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Admin;