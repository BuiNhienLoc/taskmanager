import React, { useEffect, useState } from 'react';
import { db } from '../../../firebase';
import { collection, where, query, onSnapshot } from 'firebase/firestore';
import UserState from './UserState';
import './UserState.css';

function UserInfo() {
    const [activeUsers, setActiveUsers] = useState([]);
    const [inactiveUsers, setInactiveUsers] = useState([]);

    useEffect(() => {
        const q = query(collection(db, "users"), where('isOnline', '==', true));
        const unsub = onSnapshot(q, (snap) => {
            setActiveUsers(snap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        const q = query(collection(db, "users"), where('isOnline', '==', false));
        const unsub = onSnapshot(q, (snap) => {
            setInactiveUsers(snap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        });
        return () => unsub();
    }, []);

    return (
        <div className='Activity'>
            <p id='Active'>Active users</p>
            <div className='active'>
                {activeUsers.map((user) =>
                    <UserState key={user.uid} photoURL={user.avatar} displayName={user.name} state='success' id={user.uid} email={user.email} />
                )}
            </div>

            <p className='inactive-title' id='Inactive' style={{ top: '269px' }}>Inactive users</p>
            <div className='inactive'>
                {inactiveUsers.map((user) =>
                    <UserState key={user.uid} photoURL={user.avatar} displayName={user.name} state='error' id={user.uid} email={user.email} />
                )}
            </div>
        </div>
    );
}

export default UserInfo;