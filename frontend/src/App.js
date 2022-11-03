import {BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom';
import {useState, useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import axios from 'axios';

import {Login} from './Login';
import {Admin} from './Admin';
import {DeptsList} from './DeptsList'
import {TicketsList} from './TicketsList'
import {Technicians} from './Technicians';
import {TechniciansList} from './TechniciansList';
import {Employees} from './Employees'
import {EmployeesList} from './EmployeesList';
import './App.css';


function App() {
  // lang, auth, user and privilege are global state managed by redux
  const lang = useSelector((state) => state.lang)
  const auth = useSelector((state) => state.auth)
  const user = useSelector((state) => state.username)
  const privilege = useSelector((state) => state.privilege)
  const dispatch = useDispatch()
  const[content, setContent] = useState({})
  const[direction, setDirection] = useState('rtl')
  

  // Authentication method works on every component to check if the user is logged in or not
  useEffect(() => {
    axios.post('http://localhost:5200/auth', {token: localStorage.getItem('token')})
    .then((res) => {
      if(res.data.auth){
        localStorage.setItem('token', res.data.newToken) // reassgin token to extend the exp time
        setStore(true, res.data.privilege, res.data.username)
      }else{
        setStore(false)
      }
    })
  },[])

  
  /* Retrieving page content based on the selected language and setting the page direction. 
    Default language is Arabic and direction is rtl */
  useEffect(() => {
    let language = localStorage.getItem('lang') != null ? localStorage.getItem('lang') : 'ar'

    if(language == 'ar'){
      setDirection('rtl')
    }else{
      setDirection('ltr')
    }

    axios.get(`http://localhost:5200/pages_content/app/${language}`)
    .then((res) => {
      let newContent = {}
      for(let i of res.data.content){
        newContent[i.element] = i.value
      }
      setContent(newContent)
    })
  },[lang])


  function changeLang(language){
    localStorage.setItem('lang', language)
    if(auth){
      setStore(auth, privilege, user, language)
    }else{
      setStore(auth, language)
    }
  }


  // To setting the global states in the redux store
  function setStore(auth, privilege, username){
    if(auth){
      dispatch({type: 'loggedin', payload: {auth: auth, privilege: privilege, username: username, 
        lang: localStorage.getItem('lang')}})
    }else{
      dispatch({type: 'loggedout', payload: {lang: localStorage.getItem('lang')}})
    }
  }


  function logout(){
    axios.post('http://localhost:5200/login/logout')
    .then((res) => {
      localStorage.setItem('token', res.data.token)
      setStore(false)
    })
  }


  return(
    <Router>
      <div style={{direction: direction, backgroundColor: 'f8f8f8'}}>
        <nav className="navbar navbar-expand-lg shadow navbar-dark text-light" 
          style={{backgroundColor: '#330066'}} onClick={(e)=>console.log(e.target.style)}>
          <div className="container-fluid">
            <Link to='/' className="navbar-brand text-light">
              <h4>{content['logo']}</h4>
            </Link>
            <>
              <button className="navbar-toggler" type="button" data-bs-toggle="collapse" 
                data-bs-target="#navbarContent" >
                <span className="navbar-toggler-icon"></span>
              </button>
              <div className="collapse navbar-collapse" id="navbarContent">
                <ul className="navbar-nav d-flex justify-content-center mb-lg-0 w-75 px-0">
                  {
                    // Navigation links for technicians with super or admin privilages
                    privilege.map((type) => {
                      if(type == 'super' || type == 'admin'){
                        return(
                          <>
                          <li className="nav-item"><Link to="/technicians_list" 
                            className="nav-link text-light px-2">{content['techsList']}</Link></li>
                          <li className="nav-item"><Link to="/employees_list" 
                            className="nav-link text-light px-2">{content['empsList']}</Link></li>
                          <li className="nav-item"><Link to="/depts_list" 
                            className="nav-link text-light px-2">{content['deptsList']}</Link></li>
                          </>
                        )
                      }
                    })
                  }
                </ul>
                <ul className="navbar-nav mb-lg-0 pt-1 d-flex justify-content-between w-25 px-0">
                  <li className="nav-item my-1">
                    <div className="dropdown">
                      <img src="world.png" className="dropdown-toggle mx-3" width="30px" 
                        data-bs-toggle="dropdown"/>
                      <ul className="dropdown-menu">
                        <li onClick={() => {changeLang('ar')}}>
                          <button className="dropdown-item">العربية</button> 
                        </li>
                        <li onClick={() => {changeLang('en')}}>
                          <button className="dropdown-item">English</button>
                        </li>
                      </ul>
                    </div>
                  </li>
                  {
                    privilege.map(() => {
                      return(
                        <li className="nav-item my-1">
                          <span className="mx-1 fw-bold">{user}</span>
                          <button className="btn btn-sm btn-warning fw-bold" 
                            onClick={logout}>{content['logout']}</button>
                        </li>
                      )
                    })
                  }
                </ul>
              </div>
            </>
          </div>
        </nav>

        <Routes>
          <Route path='/'  element={<Login />}/>
          <Route path='admin' element={<Admin />} />
          <Route path='tickets_list' element={<TicketsList />} />
          <Route path='depts_list' element={<DeptsList />} />
          <Route path='technicians' element={<Technicians />} />
          <Route path='technicians_list' element={<TechniciansList />} />
          <Route path='employees' element={<Employees />} />
          <Route path='employees_list' element={<EmployeesList />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App;
