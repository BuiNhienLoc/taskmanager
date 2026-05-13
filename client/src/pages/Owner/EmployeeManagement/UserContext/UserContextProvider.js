import React, {useState} from 'react';

export const UserContext = React.createContext();

function UserContextProvider({children}) {
    const [isAddUsersVisible, setIsAddUsersVisible] = useState(false);
    const [userName, setUserName] = useState('');
    const [name, setName] = useState('');
    const [avatar, setUserAvatar] = useState(null);
    const [email, setUserEmail] = useState('');
    const [role, setRole] = useState('');
    const [userId, setUserId] = useState('');
    const [branch, setBranch] = useState('');
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isUserInfoVisible, setIsUserInfoVisible] = useState(false);
    

    return (
      <UserContext.Provider value={{isAddUsersVisible, setIsAddUsersVisible, 
      userName, setUserName, avatar, setUserAvatar, 
      email, setUserEmail, role, setRole,
      userId, setUserId, name, setName, phoneNumber, setPhoneNumber,
    //   branch, setBranch,
      isUserInfoVisible, setIsUserInfoVisible}}>
          {children}
      </UserContext.Provider>
    )
}

export default UserContextProvider;