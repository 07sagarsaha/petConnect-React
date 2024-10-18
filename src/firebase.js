// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  getDocs,
  getDoc,
} from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCAkwUSmrB8mO6K_SzDde1_Zjy1pKzKvSs",
  authDomain: "pet-connect-01.firebaseapp.com",
  projectId: "pet-connect-01",
  storageBucket: "pet-connect-01.appspot.com",
  messagingSenderId: "107924468638",
  appId: "1:107924468638:web:c7158a902b81f086ae5c8f",
  measurementId: "G-ENKG0FJETY",
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// // Handle user registration and storing user data
// const registerForm = document.querySelector('.register form');
// if (registerForm) {
//     registerForm.addEventListener('submit', async (e) => {
//         e.preventDefault();
//         const name = document.getElementById('userName').value;
//         const handle = document.getElementById('handle').value;
//         const email = document.getElementById('email').value;
//         const password = document.getElementById('setPassword').value;

//         try {
//             const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//             const user = userCredential.user;

//             // Store user data in Firestore
//             await setDoc(doc(db, "users", user.uid), {
//                 name: name,
//                 handle: handle,
//                 email: email,
//                 createdAt: new Date()
//             });

//             alert('User registered successfully. Redirecting to login page.');
//             window.location.href = 'loginPage.html';
//         } catch (error) {
//             alert('Error: ' + error.message);
//         }
//     });
// }

// // Handle user login
// const loginForm = document.querySelector('.login form');
// if (loginForm) {
//     loginForm.addEventListener('submit', async (e) => {
//         e.preventDefault();
//         const email = document.getElementById('email').value;
//         const password = document.getElementById('Password').value;

//         try {
//             const userCredential = await signInWithEmailAndPassword(auth, email, password);
//             alert('Logged in successfully. Redirecting to the home page.');
//             window.location.href = 'index.html';
//         } catch (error) {
//             alert('Error: ' + error.message);
//         }
//     });
// }

// // Handaling user logout
// const logout = document.getElementById('logout');
// if (logout) {
//     logout.addEventListener('click', async (e) => {
//         e.preventDefault();
//         await auth.signOut();
//         alert('Logged out successfully. Redirecting to the login page.');
//         window.location.href = 'loginPage.html';
//     });
// }

// // Handling user profile
// const profile = document.getElementById('profile');
// const userCollection = collection(db, 'users');
// if(profile){
//     onAuthStateChanged(auth, (user) => {
//         const cuser= user.uid;
//     if (user) {
//         const userSnipit = doc(userCollection, cuser);
//         getDoc(userSnipit).then((doc) => {
//             if (doc.exists()) {
//                 const data = doc.data();
//                 document.getElementById('username').textContent = data.name;
//                 document.getElementById('handle').textContent = data.handle;
//                 document.getElementById('email').textContent = data.email;
//             }
//         });
//         let name = cuser.name;
//         console.log(name);
//     } else {
//         alert("User not logged in. Redirecting to login page.");
//         window.location.href = 'loginPage.html';
//     }
//     });
// }

// //Post mechanism but it's not wrking and it automatically refreshes

// // Handle post submission
// // Initialize Firebase and Firestore
// // Import Firebase SDK
// import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-storage.js";

// const storage = getStorage(app);

// const postForm = document.querySelector('.posts');
// if (postForm) {
//     postForm.addEventListener('submit', async (e) => {
//         e.preventDefault();
//         const postTitle = document.getElementById('post_title').value;
//         const postDesc = document.getElementById('post_desc').value;
//         const postImg = document.getElementById('post_image').files[0];
//         const postSevere = document.getElementById('slider-value').value;

//         const user = auth.currentUser;
//         if (user) {
//             if (postImg) {
//                 const storageRef = ref(storage, 'images/' + postImg.name);
//                 await uploadBytes(storageRef, postImg);
//                 const postImgUrl = await getDownloadURL(storageRef);

//                 try {
//                     await setDoc(doc(db, "posts", user.uid + "_" + new Date().getTime()), {
//                         title: postTitle,
//                         desc: postDesc,
//                         img: postImgUrl,
//                         severe: postSevere,
//                         postedAt: new Date()
//                     });

//                     alert('Your post titled: ' + postTitle + ' was successfully posted!');
//                 } catch (error) {
//                     alert('Error: ' + error.message);
//                 }
//             } else {
//                 alert('Please select an image.');
//             }
//         } else {
//             alert("User not logged in. Redirecting to login page.");
//             window.location.href = 'loginPage.html';
//         }
//     });
// }
