import React, { useContext, useState, useEffect } from 'react'
import { Avatar, Badge, Typography } from 'antd';
import styled from 'styled-components';
import { AppContext } from './Context/AppProvider';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';

const WrapperStyled = styled.div`
  margin-bottom: 10px;
  .author {
    margin-left: 5px;
    font-weight: bold;
  }
  &:hover {
    cursor:pointer
  }
  .text{
    margin-left: 5px;
  }
`;

function UserMessState({displayName, photoURL, id, state, user}) {
    const {setSelectedUserId, setTargetChat} = useContext(AppContext);
    const [data, setData] = useState(null);

    useEffect(() => {
        if (!user || !id) return;

        const id_search = user > id ? `${user}${id}` : `${id}${user}`;
        const docRef = doc(db, "lastMsg", id_search);

        const unsub = onSnapshot(docRef, (docSnap) => {
            setData(docSnap.exists() ? docSnap.data() : null);
        });

        return () => unsub();
    }, [user, id]);

    const handleOnClick = () => {
        if (!user || !id) return;
        const id_search = user > id ? `${user}${id}` : `${id}${user}`;
        updateDoc(doc(db, 'lastMsg', id_search), { unread: false }).catch(() => {});
    };

    return (
        <WrapperStyled onClick={() => {
            setSelectedUserId(id);
            setTargetChat("user");
            handleOnClick();
        }}>
            <div>
                <Badge dot status={state === true ? 'success' : 'error'}>
                    <Avatar src={photoURL}>
                        {photoURL ? '' : displayName?.charAt(0)?.toUpperCase()}
                    </Avatar>
                </Badge>
                <Typography.Text className='author'>{displayName}</Typography.Text>
                {data?.from !== user && data?.unread && (
                    <small className='unread'>New</small>
                )}
                <div>
                    <Typography.Text className='text'>
                        {data && (
                            <>
                                <strong>{data.from === user ? "Me: " : "Friend: "}</strong>
                                {data.inputValue}
                            </>
                        )}
                    </Typography.Text>
                </div>
            </div>
        </WrapperStyled>
    );
}

export default UserMessState;