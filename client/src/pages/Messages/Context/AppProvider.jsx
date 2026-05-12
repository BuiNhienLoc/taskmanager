import React, {useState, useEffect} from 'react'
import {collection, query, where, onSnapshot, orderBy} from 'firebase/firestore'
import {db, auth} from '../../../firebase';

export const AppContext = React.createContext();

function AppProvider({children}) {

    const [isAddRoomVisible, setIsAddRoomVisible] = useState(false);
    const [isOpenMembersVisible, setIsOpenmembersVisible] = useState(false);
    const [selectedRoomId, setSelectedRoomId] = useState('');
    const [usersRoom, setUsersRooms] = useState([]);
    const [members, setMembers] = useState([]);
    const [isInviteMemberVisible, setIsInviteMemberVisible] = useState(false);
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState();
    const currentUserId = auth.currentUser?.uid;
    const [userHistory, setUserHistory] = useState([]);
    const [recipients, setRecipients] = useState([]);
    const [targetchat, setTargetChat] = useState();
    const [memberInfo, setMemberInfo] = useState(false);

    const clearState = () => {
      setSelectedRoomId('');
      setIsAddRoomVisible(false);
      setIsInviteMemberVisible(false);
      setSelectedUserId('');
    }

    useEffect(() => {
      if (!currentUserId) return;

      const collectionRef = collection(db, "userhistory");
      const q = query(collectionRef, where("from", "==", currentUserId));
      const h = query(collectionRef, where("to", "==", currentUserId));

      let history = [];

      const unsubscribeFrom = onSnapshot(q, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          history.push(doc.data().to);
        });

        const unsubscribeTo = onSnapshot(h, (querySnapshotTo) => {
          querySnapshotTo.forEach((doc) => {
            history.push(doc.data().from);
          });

          const uniqueHistory = Array.from(new Set(history));
          setUserHistory(uniqueHistory);
        });

        return () => unsubscribeTo();
      });

      return () => unsubscribeFrom();
    }, [currentUserId, selectedUserId]);
  

    useEffect(()=>{
      const collectionRef = collection(db, "users");
  
      const unsubscribe = onSnapshot(collectionRef, (querySnapshot) => {
          let users = [];
          querySnapshot.forEach((doc)=>{
              users.push({...doc.data(), id: doc.data().uid, id_firebase: doc.id});
          })
          setUsers(users);
        });
        return unsubscribe;
    }, [])

    useEffect(() => {
      if (!currentUserId) return;

      const collectionRef = collection(db, "rooms");
      const q = query(
        collectionRef,
        where("members", "array-contains", currentUserId),
        orderBy("createdAt", "asc")
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const rooms = [];
        querySnapshot.forEach((doc) => {
          rooms.push({ ...doc.data(), id: doc.id });
        });
        setUsersRooms(rooms);
      });

      return () => unsubscribe();
    }, [currentUserId]);

    
    const selectedRoom = React.useMemo(
      () => usersRoom.find((room) => room.id === selectedRoomId) || {},
      [usersRoom, selectedRoomId]
    );

    const currentUser = React.useMemo(
      () => users.find((user) => user.uid === currentUserId) || {},
      [users, currentUserId]
    )

    const selectedUser = React.useMemo(
      () => users.find((user)=> user.uid === selectedUserId)|| {},
      [users, selectedUserId]
    )

    useEffect(() => {
      if (selectedRoom.members){
        const collectionRefUser = collection(db, "users");
        const h = query(collectionRefUser, where('uid', 'in', selectedRoom.members));

        const unsubscribe = onSnapshot(h, (querySnapshot) => {
          let members = [];
          querySnapshot.forEach((doc)=>{
            members.push({...doc.data(), id:doc.data().uid});
          })
          setMembers(members);
        });
        return unsubscribe;
      }
    }, [selectedRoom.members])


    useEffect(() => {
      if (userHistory.length>0){
        const collectionRef = collection(db, "users");

        const q = query(collectionRef, where('uid', 'in', userHistory), orderBy('last_history','desc'))

        const unsubscribe = onSnapshot(q, (querySnapshot)=> {
          let recipients = [];
          querySnapshot.forEach((doc)=>{
            recipients.push({...doc.data(), id: doc.data().uid});
          })
          setRecipients(recipients);
        });
        return unsubscribe;
      }
    }, [userHistory])


  return (
    <AppContext.Provider value={{isAddRoomVisible, setIsAddRoomVisible, 
    selectedRoomId, setSelectedRoomId, 
    usersRoom, selectedRoom, members,
    isOpenMembersVisible, setIsOpenmembersVisible,
    isInviteMemberVisible, setIsInviteMemberVisible,
    users, setUsers, currentUser,
    selectedUser, selectedUserId, setSelectedUserId,
    userHistory, setUserHistory, recipients, setRecipients,
    clearState, targetchat, setTargetChat,
    memberInfo, setMemberInfo}}>
        {children}
    </AppContext.Provider>
  )
}

export default AppProvider