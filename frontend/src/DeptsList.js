import {useEffect, useState} from 'react'
import {useNavigate, Link} from 'react-router-dom'
import {useSelector} from 'react-redux'
import axios from 'axios'


function DeptsList(){
    // lang and auth are global state managed by redux
    const navigate = useNavigate()
    const auth = useSelector((state) => state.auth)
    const lang= useSelector((state) => state.lang)
    const[content, setContent] = useState({})
    const[state, setState] = useState(false)
    const[departments, setDepartments] = useState([])
    const[department, setDepartment] = useState('')


    useEffect(() => {
        axios.post('http://localhost:5200/depts/get', {token: localStorage.getItem('token')})
        .then((res) => {
            if(res.data.auth){
                setDepartments(res.data.depts)
                localStorage.setItem('token', res.data.newToken)
            }else{
                navigate('/')
            }
        })
    },[state, auth])


    // Retrieving page content based on the selected language. Default language is Arabic
    useEffect(() => {
        let language = localStorage.getItem('lang') != null ? localStorage.getItem('lang') : 'ar'
    
        axios.get(`http://localhost:5200/pages_content/deptList/${language}`)
        .then((res) => {
        let newContent = {}
        for(let i of res.data.content){
            newContent[i.element] = i.value
        }
        setContent(newContent)
        })
    },[lang])
    
    
    // Adding a new department
    function addDept(e){
        if(e.target.form.checkValidity()){
            axios.post("http://localhost:5200/depts", {name: department, 
                token: localStorage.getItem('token')})
            .then((res) =>  {
                if(res.data.status){
                    document.getElementById("add-dept-close").click()
                    e.target.parentNode.parentNode.reset()
                    setState(!state)
                }else{
                    document.getElementById("addDeptMsg").innerHTML = "Entered name is already used"
                }
            })
        }
    }

    
    // Deleting a department
    function deleteDept(dept){        
        axios.post("http://localhost:5200/companies/delete", {name: department, 
            token: localStorage.getItem('token')})
    
        document.getElementById(`delete-dept-close${dept}`).click()
        setTimeout(()=>{ setState(!state) }, 1500)
    }


    if(auth == true){
        return(
            <div className="container mt-4">
                <Link to='/admin' className="text-decoration-none fs-6" 
                    style={{color: "#333399"}}>{content['backHome']}</Link>
                <hr className="mt-2"/>
                <h4 className="mt-4">{content['depts']}</h4>
                <div className="mt-5">
                    <button className="btn btn-sm btn-light" 
                        style={{backgroundColor: "#333399", color: "white"}} data-bs-toggle="modal" 
                        data-bs-target="#addDepts">{content['addingDept']}</button>
                    <div className="modal fade" id="addDepts">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header" style={{height: 45+"px"}}>
                                    <h4 className="modal-title">{content['addingDept']}</h4>
                                    <div className="d-flex justify-content-end">
                                        <button id="add-dept-close" className="btn-close" 
                                            data-bs-dismiss="modal"></button>
                                    </div>
                                </div>
                                <div className="modal-body">
                                    <p className="text-danger text-center"></p>
                                    <form onSubmit={(e) => e.preventDefault()}>
                                        <label htmlFor="name" className="form-label mt-2 mb-1">
                                            {content['name']}</label>
                                        <input id="addCompName" name="name" type="text" 
                                            className="form-control form-control-sm" pattern="[A-z0-9-]+" 
                                            title="Only characters, numbers and underscores" 
                                            onChange={(e) => setDepartment(e.target.value)} required />
                                        <div className="d-flex justify-content-end mt-3">
                                            <input type="submit" value={content['addingDept']} 
                                                className="btn btn-sm btn-light" 
                                                style={{backgroundColor: "#333399", color: "white"}}
                                                onClick={(e) => addDept(e)} />
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{height: 320+"px", overflow: "auto"}}>
                        <table className="table table-hover text-center mt-4" 
                            style={{backgroundColor: "hsl(0, 0%, 97%)"}}>
                            <thead className="sticky-top" style={{backgroundColor: "hsl(0, 0%, 96%)"}}>
                                <tr>
                                    <th>{content['name']}</th>
                                    <th>{content['status']}</th>
                                    <th></th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    departments.map((dept, index) => {
                                        if(dept.status == "active"){
                                            return(
                                                <tr key={index}>
                                                    <td>{dept.name}</td>
                                                    <td>{dept.status}</td>
                                                    <td></td>
                                                    <td>
                                                        <button className="btn btn-sm btn-danger" 
                                                            style={{backgroundColor: "#cc0000"}} data-bs-toggle="modal" 
                                                            data-bs-target={`#deleteDept${dept.name}`}>{content['delete']}</button>
                                                        <div className="modal fade" id={`deleteDept${dept.name}`}>
                                                            <div className="modal-dialog modal-dialog-centered">
                                                                <div className="modal-content border-2 border-secondary">
                                                                    <div className="modal-header" style={{height: 45}}>
                                                                        <h5 className="modal-title mx-auto">
                                                                            {content['delete']} {dept.name}</h5>
                                                                    </div>
                                                                    <div className="modal-body pt-2">
                                                                        <div className="container d-flex justify-content-around mt-4" 
                                                                            style={{width: 270+"px"}}>
                                                                            <button id={`delete-dept-close${dept.name}`} 
                                                                                className="btn btn-sm btn-dark px-4" 
                                                                                data-bs-dismiss="modal">{content['cancel']}</button>
                                                                            <button className="btn btn-sm btn-danger px-4" 
                                                                                style={{backgroundColor: "#cc0000"}} 
                                                                                onClick={() => deleteDept(`${dept.name}`)}>
                                                                                {content['delete']}</button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        }
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )
    }
}


export {DeptsList}