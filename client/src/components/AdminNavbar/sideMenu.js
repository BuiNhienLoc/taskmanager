import React, { useState } from 'react'
import './sideMenu.css'
import icon from '../assets/icon.png'
import * as FAIcons from 'react-icons/fa';
import * as AIIcons from "react-icons/ai";
import * as BSIcons from "react-icons/bs";
import * as TIIcons from "react-icons/ti";

import { Link } from 'react-router-dom';

const SideMenu = (props) => {
    const [inactive, setInactive] = useState(true);

    return (
        <div onMouseEnter={() => { setInactive(false) }} onMouseLeave={() => { setInactive(true) }} className={`side-menu ${inactive ? "inactive" : ""}`}>
            <div className='top-section'>
                <div className='logo'>
                    < img src={icon} alt='logo'/>
                </div>
                <div className='toggle-menu-btn'>
                    <FAIcons.FaBars />
                </div>
            </div>

            <div className='divider'></div>

            <div className='main-menu'>
                <ul>
                    <li>
                        <Link to='/owner/dashboard' className='menu-item'>
                            <div className='menu-icon'>
                                <AIIcons.AiOutlineHome />
                            </div>

                            <span>Dashboard</span>
                        </Link>
                    </li>
                    <li>
                        <Link to='/owner/user-management' className='menu-item'>
                            <div className='menu-icon'>
                                <AIIcons.AiOutlineTeam />
                            </div>

                            <span>Employees</span>
                        </Link>
                    </li>
                    {/* <li>
                        <Link to='/owner/storage'>
                            <div className='menu-item'>
                                <div className='menu-icon'>
                                    <AIIcons.AiOutlineMedicineBox />
                                </div>

                                <span>Storage</span>

                            </a>
                        </Link>
                    </li> */}
                    <li>
                        <Link to='/owner/messages' className='menu-item'>
                            <div className='menu-icon'>
                                <TIIcons.TiMessages />
                            </div>

                            <span>Message</span>
                        </Link>
                    </li>
                    <li>
                        <Link to='/owner/tasks' className='menu-item'>
                            <div className='menu-icon'>
                                <AIIcons.AiOutlineBarChart />
                            </div>
                            <span>Tasks</span>
                        </Link>
                    </li>
                </ul>
            </div>

            <div className='side-menu-footer'>
                <ul>
                    <li>
                        <a className='app-item'>
                            <div className='app-icon'>
                                <AIIcons.AiOutlineQuestionCircle />
                            </div>
                            <span>Help</span>
                        </a>
                    </li>
                    <li>
                        <a className='app-item'>
                            <div className='app-icon'>
                                <BSIcons.BsGear />
                            </div>
                            <span>Settings</span>
                        </a>
                    </li>
                </ul>
            </div>


        </div>
    )
}

export default SideMenu;
