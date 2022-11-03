import {useNavigate} from 'react-router-dom';
import {useState, useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import axios from 'axios';

import {FirstLogin} from './FirstLogin'


function Login(){
    // lang and auth are global state managed by redux
    const navigate = useNavigate()
    const auth = useSelector((state) => state.auth)
    const lang = useSelector((state) => state.lang)
    const dispatch = useDispatch()
    const[content, setContent] = useState({})
    const[username, setUsername] = useState()
    const[password, setPassword] = useState()
    const[message, setMessage] = useState()
    const[first, setFirst] = useState(false)
    
    
    // Retrieving page content based on the selected language. Default language is Arabic
    useEffect(() => {
        let language = localStorage.getItem('lang') != null ? localStorage.getItem('lang') : 'ar'
    
        axios.get(`http://localhost:5200/pages_content/login/${language}`)
        .then((res) => {
        let newContent = {}
        for(let i of res.data.content){
            newContent[i.element] = i.value
        }
        setContent(newContent)
        })
    },[lang])


    /* Authentication method to check if the user is logged in or not. 
        If logged in redirecting to related component (page) based on privilege */
    useEffect(() => {
        axios.post('http://localhost:5200/auth', {token: localStorage.getItem('token')})
        .then((res) => {
            if(res.data.auth){
                if(res.data.privilege == 'super'){
                    navigate('/admin')
                }else if(res.data.privilege == 'user'){
                   navigate('/technicians') 
                }else if(res.data.privilege == 'none'){
                    navigate('/employees')
                }
            }else{
                setStore(res.data.auth)
            }
        })
    },[])
    
    
    // To setting the global states in the redux store
    function setStore(auth, privilege, username){
        if(auth){
        dispatch({type: 'loggedin', payload: {auth: auth, privilege: privilege, username: username, 
            lang: localStorage.getItem('lang')}})
        }else{
        dispatch({type: 'loggedout', payload: {lang: localStorage.getItem('lang')}})
        }
    }
    
    
    /* Sending login request. If first time login return FirstLogin component,
        else redirecting to related component (page) based on privilege */ 
    function login(){
        axios.post('http://localhost:5200/login', {username: username, password: password})
        .then((res) => {
            if(res.data.status == true){
                localStorage.setItem('token', res.data.token)
                setStore(true,res.data.privilege, res.data.username)
                if(res.data.privilege == 'super'){
                    navigate('/admin')
                }else if(res.data.privilege == 'user'){
                   navigate('/technicians') 
                }else if(res.data.privilege == 'none'){
                    navigate('/employees')
                }
            }else if(res.data.status == false){
                setMessage('Invalid username or password')
            }else if(res.data.status == 'none'){
                setStore(true)
                setFirst(true)
            }
        })
    }


    if(auth == false){
        return(
            <div className="container-c mt-5 pt-3">
                <h4 className="text-center mb-4">{content['login']}</h4>
                <p className="text-danger"> { message } </p>
                <form onSubmit={(e) => e.preventDefault()}>
                    <label htmlFor="username" className="form-label">{content['username']}</label>
                    <input id="username" required className="form-control" 
                        onChange={(e) =>{ setMessage(); setUsername(e.target.value) }}/>
                    <label htmlFor="password" className="form-label mt-2">{content['password']}</label>
                    <input type="password" id="password" required className="form-control" 
                        onChange={(e) => { setMessage(); setPassword(e.target.value) }}/>
                    <input type="submit" value={content['login']} className="btn btn-sm btn-light border-0 mt-3" 
                        style={{backgroundColor: "#333399", color:"white", width: 100}} onClick={() => login()}/>
                </form>
            </div>
        )
    }
    
    if(first){
        return <FirstLogin username={username} />
    }
}


export {Login}