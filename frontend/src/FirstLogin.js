import {useEffect, useState} from 'react'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'


function FirstLogin(props){
    // lang and auth are global state managed by redux
    const auth = useSelector((state) => state.auth)
    const lang = useSelector((state) => state.lang)
    const dispatch = useDispatch()
    const[content, setContent] = useState({})
    const[password, setPassword] = useState()
    const[rePassword, setRePassword] = useState()
    const[message, setMessage] = useState()
    

    // Retrieving page content based on the selected language. Default language is Arabic
    useEffect(() => {
        let language = localStorage.getItem('lang') != null ? localStorage.getItem('lang') : 'ar'
    
        axios.get(`http://localhost:5200/pages_content/firstLogin/${language}`)
        .then((res) => {
        let newContent = {}
        for(let i of res.data.content){
            newContent[i.element] = i.value
        }
        setContent(newContent)
        })
    },[lang])


    // To setting the global states: auth and lang in the redux store
    function setStore(auth){
        if(auth == false){
          dispatch({type: 'loggedout', payload: {lang: localStorage.getItem('lang')}})
        }
    }


    // Assigning new password for an user after first time login
    function assignNewPassword(){
        if(password == rePassword){
            axios.post('http://localhost:5200/login/first', {username: props.username, password: password, 
                token: localStorage.getItem('token')})
            setStore(false)
        }else{
            setMessage("Passwords are not matched")
        }
    }


    if(auth == true){
        return(
            <div className="container w-50 mt-5 pt-3">
                <h4 className="text-center mb-4">{content['assginYourPass']}</h4>
                <form method="post" onSubmit={(e) => e.preventDefault()}>
                    <label htmlFor="username" className="form-label">{content['assginYourPass']}</label>
                    <input id="username" value={props.username} className="form-control" readonly/>
                    <label htmlFor="password" className="form-label mt-2">{content['password']}</label>
                    <input id="password" type="password" className="form-control" minLength="3" required 
                        onChange={(e) => { setMessage(); setPassword(e.target.value) }}/>
                    <label htmlFor="repassword" className="form-label mt-2">{content['reTypePass']}</label>
                    <input id="repassword" type="password"  className="form-control" minLength="3" required 
                        onChange={(e) => { setMessage(); setRePassword(e.target.value) }}/>
                    <p className="text-danger">{ message }</p>
                    <input type="submit" value={content['done']} className="btn btn-sm btn-light border-0 mt-3" 
                        style={{backgroundColor: "#333399", color:"white", width: 70}} onClick={() => assignNewPassword()}/>
                </form>
            </div>
        )
    }
}


export {FirstLogin}