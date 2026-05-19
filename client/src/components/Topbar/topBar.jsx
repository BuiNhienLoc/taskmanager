import React, { useState, useEffect } from 'react';
import Camera from './svg/Camera';
import * as AIIcons from 'react-icons/ai';
import { storage, auth, db, logout } from "../../firebase";
import { ref, getDownloadURL, uploadBytes, deleteObject } from "firebase/storage";
import { getDoc, doc, updateDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { useNavigate } from "react-router-dom";
import profilePic from '../assets/profile.png';
import * as BIIcons from 'react-icons/bi';
import './topBar.css';

const MAX_FILE_SIZE_MB = 5;

function TopBar() {
    const [open, setOpen] = useState(false);
    const [img, setImg] = useState("");
    const [user, setUser] = useState([]);
    const [id, setId] = useState();
    const [uploadError, setUploadError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (!auth.currentUser) return;

        const q = query(
            collection(db, "users"),
            where("uid", "==", auth.currentUser.uid)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            let users = [];
            querySnapshot.forEach((doc) => {
                users.push({ ...doc.data(), id: doc.id });
            });
            if (users.length > 0) {
                setUser(users[0]);
                setId(users[0].id);
            }
        });

        return () => unsubscribe();
    }, [auth.currentUser?.uid]);

    useEffect(() => {
        if (!img) return;

        const uploadImg = async () => {
            setUploadError("");
            const imgRef = ref(
                storage,
                `avatar/${new Date().getTime()} - ${img.name}`
            );

            try {
                const snap = await uploadBytes(imgRef, img);
                const url = await getDownloadURL(ref(storage, snap.ref.fullPath));

                if (user?.avatarPath) {
                    await deleteObject(ref(storage, user.avatarPath)).catch(() => {
                    });
                }

                await updateDoc(doc(db, "users", user?.id), {
                    avatar: url,
                    avatarPath: snap.ref.fullPath,
                });

                setImg("");
            } catch (err) {
                console.error("Avatar upload error:", err.message);
                setUploadError("Upload failed. Please try again.");
            }
        };

        uploadImg();
    }, [img]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            setUploadError(`Image must be under ${MAX_FILE_SIZE_MB} MB.`);
            e.target.value = "";
            return;
        }

        setUploadError("");
        setImg(file);
    };

    return (
        <div className='top-menu'>
            <div className='notification'>
                <AIIcons.AiOutlineBell />
            </div>
            <div className='account' onClick={() => setOpen(!open)}>
                <div className='profile'>
                    <img src={user?.avatar || profilePic} alt="avatar" />
                </div>
                <div className='account-info'>
                    <div className='username'>{user?.name}</div>
                    <div>{user?.email}</div>
                </div>
                <div className={`dropdown-menu ${open ? "open" : ""}`}>
                    <ul>
                        <li>
                            <a className='profile-item'>
                                <div className='profile'>
                                    <img src={user?.avatar || profilePic} alt="avatar" />
                                    <div className="overlay">
                                        <div>
                                            <label htmlFor="photo">
                                                <Camera />
                                            </label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                style={{ display: "none" }}
                                                id='photo'
                                                onChange={handleFileChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className='account-info'>
                                    <div className='username'>{user?.name}</div>
                                    <div>{user?.email}</div>
                                    {uploadError && (
                                        <div style={{ color: 'red', fontSize: 12 }}>{uploadError}</div>
                                    )}
                                    <div className='small-text'>View account's information</div>
                                </div>
                            </a>
                        </li>
                        <li>
                            <a className='menu-item' onClick={() => logout(id).then(() => navigate("/"))}>
                                <div className='icon'>
                                    <BIIcons.BiLogOut></BIIcons.BiLogOut>
                                </div>
                                <span>Logout</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default TopBar;