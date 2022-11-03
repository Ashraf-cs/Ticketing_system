import {useEffect, useState} from 'react'
import {useNavigate, Link} from 'react-router-dom'
import axios from 'axios'
import {useSelector} from 'react-redux'


function TechniciansList(){
    // lang and auth are global state managed by redux
    const navigate = useNavigate()
    const auth = useSelector((state) => state.auth)
    const lang= useSelector((state) => state.lang)
    const[content, setContent] = useState({})
    const[state, setState] = useState(false)
    const[departments, setDepartments] = useState([])
    const[technicians, setTechnicians] = useState([])
    const[message, setMessage] = useState('')
    const[departmentsList, setDepartmentsList] = useState([])
    const[username, setUsername] = useState('')
    const[name, setName] = useState('')
    const[privilege, setPrivilege] = useState('')
    const[history, setHistory] = useState([])


    // Retrieving page content based on the selected language. Default language is Arabic
    useEffect(() => {
        let language = localStorage.getItem('lang') != null ? localStorage.getItem('lang') : 'ar'
    
        axios.get(`http://localhost:5200/pages_content/techniciansList/${language}`)
        .then((res) => {
        let newContent = {}
        for(let i of res.data.content){
            newContent[i.element] = i.value
        }
        setContent(newContent)
        })
    },[lang])


    // Retrieving derpartment and and technicians lists
    useEffect(() => {
        axios.post('http://localhost:5200/depts/get', {token: localStorage.getItem('token')})
        .then((res) => {
            if(res.data.auth){
                setDepartments(res.data.depts)
                localStorage.setItem('token', res.data.newToken)
                axios.post('http://localhost:5200/users/get', {category: 'technicians',token: localStorage.getItem('token')})
                .then((res) => {
                    setTechnicians(res.data.users)
                })
            }else{
                navigate('/')
            }
        })
    },[state, auth])
    

    //Adding a technician
    function addTechnician(e){
        let selectedDepts = []
        for(let choice in departmentsList){
            if(departmentsList[choice].selected){
                 selectedDepts.push(` ${departmentsList[choice].value}`)
            }
        }

        if(e.target.form.checkValidity()){
            axios.post('http://localhost:5200/users', {username: username, name: name, category: 'technicians',
                privilege: privilege, dept: selectedDepts, token: localStorage.getItem('token')})
            .then(res => {
                if(res.data.status){
                    document.getElementById('add-tech-close').click()
                    e.target.form.reset()
                    setName('')
                    setPrivilege('')
                    setDepartmentsList([])
                    setState(!state)
                }else{
                    setMessage('Entered username is already used, choose another one')
                }
            })
        }
    }


    // Showing the temporary password of a technician if exist
    function showPassword( e){
        let node = e.target.form.childNodes[1]
        if(node.hidden == true){
            node.removeAttribute('hidden')
        }else{
            node.setAttribute('hidden', true)
        }
    }


    // Enabling disabled input fields (of editing a technician)
    function enableField(e, state){
        if(e.target.checked){
            e.target.form.elements[1].removeAttribute('disabled')
        }else{
            state('')
            e.target.form.elements[1].setAttribute('disabled', 'true')
        }
    }


    // Editing and updating a technician information
    function editTechnician(e, technician){
        let selectedDepartments = []
        for(let choice in departmentsList){
            if(departmentsList[choice].selected){
                 selectedDepartments.push(` ${departmentsList[choice].value}`)
            }
        }

        if(e.target.form.checkValidity()){
            axios.put('http://localhost:5200/users', {username: technician, name: name, category: 'technicians',
                privilege: privilege, dept: selectedDepartments, token: localStorage.getItem('token')})

            document.getElementById(`edit-tech-close${technician}`).click()
            setName('')
            setPrivilege('')
            setDepartmentsList([])
            setTimeout(()=>{ setState(!state) }, 1500)
        }   
    }


    // Deleting a technician
    function deleteTechnician(technician){        
        axios.post('http://localhost:5200/users/delete', {username: technician, category: 'technicians',
            token: localStorage.getItem('token')})

        document.getElementById(`delete-tech-close${technician}`).click()
        setTimeout(()=>{ setState(!state) }, 1500)
    }


    // Retrieving technician updates history 
    function getTechHistory(technician){
        axios.post('http://localhost:5200/users/history', {username: technician, token: localStorage.getItem('token')})
        .then(res => setHistory(res.data.history))
    }


    if(auth == true){
        return(
            <div className="container mt-4">
                <Link to="/admin" className="text-decoration-none fs-6" style={{color: "#333399"}}>{content['backHome']}</Link>
                <hr className="mt-2"/>
                <h4 className="mt-4">{content['technicians']}</h4>
                <div className="mt-5">
                    <button className="btn btn-sm btn-light border-0" style={{backgroundColor: "#333399", color:"white"}}
                        data-bs-toggle="modal" data-bs-target="#addTechnician">{content['addTech']}</button>
                    <div className="modal fade" id="addTechnician">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header" style={{height: 45+"px"}}>
                                    <h4 className="modal-title">{content['addTech']}</h4>
                                    <div className="d-flex justify-content-end">
                                        <button id="add-tech-close" className="btn-close" data-bs-dismiss="modal"></button>
                                    </div>
                                </div>
                                <div className="modal-body">
                                    <p id="addTechMsg" className="text-danger text-center">{ message }</p>
                                    <form id="addTechnicianForm" onSubmit={(e) => e.preventDefault()}>
                                        <label htmlFor="username" className="form-label mb-1">{content['username']}</label>
                                        <input name="username" className="form-control form-control-sm" pattern="[A-z0-9]+" 
                                            title="Only characters, numbers and underscores" required 
                                            onChange={(e) => setUsername(e.target.value)}/>
                                        <label htmlFor="name" className="form-label mt-2 mb-1">{content['name']}</label>
                                        <input name="name" className="form-control form-control-sm" pattern="[A-z0-9 ]+" 
                                            title="Only characters, numbers and underscores" required 
                                            onChange={(e) => setName(e.target.value)}/>
                                        <label htmlFor="privilege" className="form-label mt-2 mb-1">{content['privilege']}</label>
                                        <select name="privilege" className="form-select form-select-sm" 
                                            onChange={(e) => setPrivilege(e.target.value)} required>
                                            <option disabled selected></option>
                                            <option value="user">{content['user']}</option>
                                            <option value="admin">{content['admin']}</option>
                                        </select>
                                        <label htmlFor="dept" className="form-label mt-2 mb-1">{content['dept']}</label>
                                        <select className="form-select form-select-sm" multiple required 
                                            onChange={(e)=> setDepartmentsList(e.target.options)}>
                                            {
                                                departments.map((dept, index) => {
                                                    return <option key={index} value={dept.name}>{dept.name}</option>
                                                })
                                            }
                                        </select>
                                        <div className="d-flex justify-content-end mt-3">
                                            <input type="submit" value={content['add']} className="btn btn-sm btn-light border-0" 
                                                style={{backgroundColor: "#333399", color: "white"}} onClick={(e) => addTechnician(e)}/>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{height: 320+"px", overflow: "auto"}}>
                        <table className="table table-hover text-center mt-4" style={{backgroundColor: "hsl(0, 0%, 97%)"}}>
                            <thead className="sticky-top" style={{backgroundColor: "hsl(0, 0%, 96%)"}}>
                                <tr>
                                    <th>{content['username']}</th>
                                    <th>{content['name']}</th>
                                    <th>{content['password']}</th>
                                    <th>{content['privilege']}</th>
                                    <th>{content['dept']}</th>
                                    <th></th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    technicians.map((technician, index) => {
                                        return(
                                            <tr key={index}>
                                                <td>{technician.username}</td>
                                                <td>{technician.name}</td>
                                                <td>
                                                    <form>
                                                        <button type="button" className="btn badge text-dark btn-outline-secondary px-1" 
                                                            onClick={(e) => showPassword(e)}>{content['show']}</button>
                                                        <p className="mt-2 mb-0" hidden>{technician.password}</p>
                                                    </form>
                                                </td>
                                                <td>{technician.privilege}</td>
                                                <td>{technician.department}</td>
                                                <td>
                                                    <button className="btn btn-sm btn-warning" data-bs-toggle="modal" 
                                                        data-bs-target={`#viewTechnician${technician.username}`} 
                                                        onClick={() => getTechHistory(`${technician.username}`)}>
                                                        {content['view']}</button>
                                                    <div className="modal fade text-start" id={`viewTechnician${technician.username}`}>
                                                        <div className="modal-dialog modal-dialog-scrollable modal-lg pt-0">
                                                            <div className="modal-content">
                                                                <div className="modal-header" style={{height: 45+"px"}}>
                                                                    <h4 className="modal-title">{content['edit']}</h4>
                                                                    <div className="d-flex justify-content-end">
                                                                        <button id={`edit-tech-close${technician.username}`} 
                                                                            className="btn-close" data-bs-dismiss="modal"></button>
                                                                    </div>
                                                                </div>
                                                                <div className="modal-body pt-3">
                                                                    <form onSubmit={(e) => e.preventDefault()}>
                                                                        <div className="row g-1">
                                                                            <div className="col pt-2">
                                                                                <div className="d-flex justify-content-start">
                                                                                    <label htmlFor="username" 
                                                                                        className="form-label mb-1">
                                                                                        {content['username']}</label>
                                                                                </div>
                                                                                <input name="username" 
                                                                                    className="form-control form-control-sm" 
                                                                                    defaultValue={technician.username} readOnly required 
                                                                                    onChange={(e) => setUsername(e.target.value)}/>
                                                                            </div>
                                                                            <div className="col">
                                                                                <form>
                                                                                    <div className="d-flex justify-content-start mt-2">
                                                                                        <input type="checkbox" 
                                                                                            className="form-check-input align-middle mb-1" 
                                                                                            onClick={(e) => enableField(e, setName)} />
                                                                                        <label htmlFor="name"
                                                                                            className="form-label mb-1 mx-1">
                                                                                            {content['name']}</label>
                                                                                    </div>
                                                                                    <input name="name" 
                                                                                        className="form-control form-control-sm" 
                                                                                        defaultValue={technician.name} pattern="[A-z0-9]+" 
                                                                                        title="Only characters, numbers and underscores" 
                                                                                        onChange={(e) => setName(e.target.value)}
                                                                                        required disabled/>
                                                                                </form>
                                                                            </div>
                                                                            <div className="col">
                                                                                <form>
                                                                                    <div className=" d-flex justify-content-start mt-2">
                                                                                        <input type="checkbox" 
                                                                                            className="form-check-input align-middle mb-1" 
                                                                                            onClick={(e) => enableField(e, setPrivilege)}/>
                                                                                        <label htmlFor="privilege" 
                                                                                            className="form-label mb-1 mx-1">
                                                                                            {content['privilege']}</label>
                                                                                    </div>
                                                                                    <select name="privilege" 
                                                                                        className="form-select form-select-sm" 
                                                                                        onChange={(e) => setPrivilege(e.target.value)} 
                                                                                        required disabled>
                                                                                        <option value={technician.privilege} selected>
                                                                                            {technician.privilege}</option>
                                                                                        <option value="user">{content['user']}</option>
                                                                                        <option value="admin">{content['admin']}</option>
                                                                                    </select>
                                                                                </form>
                                                                            </div>
                                                                        </div>
                                                                        <div className="row">
                                                                            <div className="col-12">
                                                                                <form>
                                                                                    <div className=" d-flex justify-content-start mt-2">
                                                                                        <input type="checkbox" 
                                                                                            className="form-check-input align-middle mb-1"
                                                                                            onClick={(e) => {
                                                                                                enableField(e, setDepartmentsList)}}/>
                                                                                        <label htmlFor="dept" 
                                                                                            className="form-label mb-1 mx-1">
                                                                                            {content['dept']}</label>
                                                                                    </div>
                                                                                    <select name="dept" multiple
                                                                                        className="form-select form-select-sm" 
                                                                                        style={{height: 80+"px"}} required disabled 
                                                                                        onChange={(e)=> {
                                                                                            setDepartmentsList(e.target.options)}}>
                                                                                        {
                                                                                            departments.map((dept, index) => {
                                                                                                if((technician.department)
                                                                                                    .includes(dept.name)){
                                                                                                    return(
                                                                                                        <option key={index} 
                                                                                                            value={dept.name} selected>
                                                                                                            {dept.name}</option>
                                                                                                    )
                                                                                                }else{
                                                                                                    return(
                                                                                                        <option key={index} 
                                                                                                            value={dept.name}>{dept.name}
                                                                                                        </option>
                                                                                                    )
                                                                                                }
                                                                                            })
                                                                                        }
                                                                                    </select>
                                                                                </form>
                                                                            </div>
                                                                        </div>
                                                                        <div className="d-flex justify-content-end mt-2 mb-3">
                                                                            <input type="submit" value={content['edit']} 
                                                                                className="btn btn-sm btn-warning" 
                                                                                onClick={(e) => {
                                                                                    editTechnician(e, `${technician.username}`)}}/>
                                                                        </div>
                                                                    </form>
                                                                    <hr className="my-1"/>
                                                                    <div className="d-flex justify-content-start">
                                                                        <h5 className="my-2">{content['history']}</h5>
                                                                    </div>
                                                                    <div className="d-flex justify-content-start">
                                                                        <p className="mb-1">{content['createdAt']} </p>
                                                                        <p className="mx-1" style={{direction: 'ltr'}}>
                                                                            {technician["created_at"]}</p>
                                                                    </div>
                                                                    <div>
                                                                        <table className="table table-warning table-sm 
                                                                            table-striped table-hover text-center">
                                                                            <thead className="sticky-top">
                                                                                <tr>
                                                                                    <th>{content['updateType']}</th>
                                                                                    <th>{content['updateValue']}</th>
                                                                                    <th>{content['updatedBy']}</th>
                                                                                    <th>{content['updatedAt']}</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                    {
                                                                                        history.map((element, index) => {
                                                                                            return(
                                                                                                <tr key={index}>
                                                                                                    <td>{element["update_type"]}</td>
                                                                                                    <td>{element["update_value"]}</td>
                                                                                                    <td>{element["updated_by"]}</td>
                                                                                                    <td>{element["updated_at"]}</td>
                                                                                                </tr>
                                                                                            )
                                                                                        })
                                                                                    }
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <button className="btn btn-sm btn-danger" data-bs-toggle="modal" 
                                                        data-bs-target={`#deleteTechnician${technician.username}`} 
                                                        style={{backgroundColor: "#cc0000"}}>{content['delete']}</button>
                                                    <div className="modal fade" id={`deleteTechnician${technician.username}`}>
                                                        <div className="modal-dialog modal-dialog-centered">
                                                            <div className="modal-content border-2 border-secondary">
                                                                <div className="modal-header" style={{height: 45}}>
                                                                    <h5 className="modal-title mx-auto">
                                                                        {content['delete']} {technician.username}
                                                                    </h5>
                                                                </div>
                                                                <div className="modal-body pt-2">
                                                                    <div className="container d-flex justify-content-around mt-4" 
                                                                        style={{width: 270+"px"}}>
                                                                        <button  id={`delete-tech-close${technician.username}`}
                                                                            className="btn btn-sm btn-dark px-4" data-bs-dismiss="modal">
                                                                            {content['cancel']}</button>
                                                                        <button className="btn btn-sm btn-danger px-4" 
                                                                            onClick={() => deleteTechnician(`${technician.username}`)}
                                                                            style={{backgroundColor: "#cc0000"}}>{content['delete']}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
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


export {TechniciansList}