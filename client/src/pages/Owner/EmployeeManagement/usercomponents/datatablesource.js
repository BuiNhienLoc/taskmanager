import profilePic from "../../../../components/assets/profile.png";

export const userColumns = [
    { field: "id", headerName: "ID", width: 200 },
    {
      field: "avatar",
      headerName: "User",
      width: 150,
      renderCell: (params) => {
        const avatarSrc = params.row.avatar || profilePic;

        return (
          <div className="cellWithImg">
            <img className="cellImg" src={avatarSrc} alt="avatar" />
            {params.row.username || params.row.name}
          </div>
        );
      },
    },

    {
      field: "name",
      headerName: "Name",
      width: 150,
    },


    {
      field: "email",
      headerName: "Email",
      width: 230,
    },

    {
      field: "phoneNumber",
      headerName: "Phone",
      width: 150,
    },
  
    {
      field: "role",
      headerName: "Role",
      width: 150,
    },

    // {
    //   field: "branch",
    //   headerName:"Branch",
    //   width: 150,
    // },

    {
      field: "isOnline",
      headerName: "Status",
      width: 160,
      renderCell: (params) => {
        let status;
        if (params.row.isOnline){
          status = 'Active';
        }
        else{
          status = 'Inactive';
        }
        return (
          <div className={`cellWithStatus ${params.row.isOnline}`}>
            {status}
          </div>
        );
      },
    },
  ];