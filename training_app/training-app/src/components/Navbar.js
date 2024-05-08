import './Navbar.css'
import { NavLink, Link } from "react-router-dom"
import React from 'react';

function Navbar() {
    return (
    <nav>
        <Link to='/' className="title"> Moodle chatbot </Link>
        <ul>
            <li>
                <NavLink to='/all-conversations'> Visi pokalbiai </NavLink>
            </li>
            <li>
                <NavLink to='/unanswered-questions'> Neatsakyti klausimai </NavLink>
            </li>
            <li>
                <NavLink to='/bot-training'>Bot'o apmokymas</NavLink>
            </li>
        </ul>
    </nav>
    );
}

export default Navbar;