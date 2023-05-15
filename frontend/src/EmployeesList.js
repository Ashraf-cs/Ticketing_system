import {useEffect, useState} from 'react'
import {useNavigate, Link} from 'react-router-dom'
import {useSelector} from 'react-redux'
import axios from 'axios'


function EmployeesList(){
    // lang and auth are global state managed by redux
    const navigate = useNavigate()
    const auth = useSelector((state) => state.auth)
    const lang = useSelector((state) => state.lang)
    const[content, setContent] = useState({})
    const[state, setState] = useState(false)
    const[departments, setDepartments] = useState([])
    const[employees, setEmployees] = useState([])
    const[message, setMessage] = useState('')
    const[username, setUsername] = useState('')
    const[name, setName] = useState('')
    const[department, setDepartment] = useState('')
    const[history, setHistory] = useState([])

    
    // Retrieving page content based on the selected language. Default language is Arabic
    useEffect(() => {
        let language = localStorage.getItem('lang') != null ? localStorage.getItem('lang') : 'ar'
    
        axios.get(`http://localhost:5200/pages_content/employeesList/${language}`)
        .then((res) => {
        let newContent = {}
        for(let i of res.data.content){
            newContent[i.element] = i.value
        }
        setContent(newContent)
        })
    },[lang])


    // Retrieving derpartment and and employees lists
    useEffect(() => {
        axios.post('http://localhost:5200/depts/get', {token: localStorage.getItem('token')})
        .then((res) => {
            if(res.data.auth){
                setDepartments(res.data.depts)
                localStorage.setItem('token', res.data.newToken)
                axios.post('http://localhost:5200/users/get', {category: 'employees', token: localStorage.getItem('token')})
                .then((res) => {
                    setEmployees(res.data.users)
                })
            }else{
                navigate('/')
            }
        })
    },[state, auth])

    
    // Adding an employee
    function addEmployee(e){
        if(e.target.form.checkValidity()){
            axios.post('http://localhost:5200/users', {username: username, name: name, category: 'employees',
            privilege: 'none', dept: department, token: localStorage.getItem('token')})
            .then(res => {
                if(res.data.status){
                    document.getElementById("add-emp-close").click()
                    e.target.form.reset()
                    setUsername('')
                    setName('')
                    setDepartment('')
                    setState(!state)
                }else{
                    setMessage('Entered username is already used, choose another one')
                }
            })
        }
    }


    // Showing the temporary password of an employee if exist
    function showPassword( e){
        let node = e.target.form.childNodes[1]
        if(node.hidden == true){
            node.removeAttribute('hidden')
        }else{
            node.setAttribute('hidden', true)
        }
    }


    // Enabling disabled input fields (of editing an employee)
    function enableField(e, state){
        if(e.target.checked){
            e.target.form.elements[1].removeAttribute('disabled')
        }else{
            state('')
            e.target.form.elements[1].setAttribute('disabled', 'true')
        }
    }


    // Editing and updating an employee information
    function editEmployee(e, employee){
        if(e.target.form.checkValidity()){
            axios.put("http://localhost:5200/users", {username: employee, name: name, dept: department, category: 'employees'})

            document.getElementById(`edit-emp-close${employee}`).click()
            setName('')
            setDepartment('')
            setTimeout(()=>{ setState(!state) }, 1500)
        }
    }


    // Deleting an employee
    function deleteEmployee(employee){        
        axios.post("http://localhost:5200/users/delete", {username: employee, category: 'employees', 
            token: localStorage.getItem('token')})

        document.getElementById('delete-close').click()
        setTimeout(()=>{ setState(!state) }, 1500)
    }


    // Retrieving employee updates history 
    function getEmpHistory(employee){
        axios.post('http://localhost:5200/users/history', {username: employee, token: localStorage.getItem('token')})
        .then(res => setHistory(res.data.history))
    }


    if(auth == true){
        return(
            <div className="container mt-4">
                <Link to="/admin" className="text-decoration-none fs-6" style={{color: "#333399"}}>{content['backHome']}</Link>
                <hr className="mt-2"/>
                <h4 className="mt-4">{content['employees']}</h4>
                <div className="mt-5">
                    <button className="btn btn-sm btn-light border-0" data-bs-toggle="modal" 
                        style={{backgroundColor: "#333399", color: "white"}}
                        data-bs-target="#addEmployees">{content['addEmployee']}</button>
                    <div className="modal fade" id="addEmployees">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header" style={{height: 45+"px"}}>
                                    <h4 className="modal-title">{content['addEmployee']}</h4>
                                    <div className="d-flex justify-content-end">
                                        <button id="add-emp-close" className="btn-close" data-bs-dismiss="modal"></button>
                                    </div>
                                </div>
                                <div className="modal-body">
                                    <p className="text-danger text-center">{ message }</p>
                                    <form onSubmit={(e) => e.preventDefault()}>
                                        <label htmlFor="username" className="form-label mb-1">{content['username']}</label>
                                        <input id="addEmpUsername" className="form-control form-control-sm" pattern="[A-z0-9]+" 
                                            title="Only characters, numbers and underscores" required 
                                            onChange={(e) => setUsername(e.target.value)}/>
                                        <label htmlFor="name" className="form-label mt-2 mb-1">{content['name']}</label>
                                        <input id="addEmpName" className="form-control form-control-sm" pattern="[A-z0-9 ]+" 
                                            title="Only characters, numbers and underscores" required 
                                            onChange={(e) => setName(e.target.value)}/>
                                        <label htmlFor="dept" className="form-label mt-2 mb-1">{content['dept']}</label>
                                        <select id="addEmpDept" className="form-select form-select-sm" required 
                                            onChange={(e) => setDepartment(e.target.value)}>
                                            <option selected disabled></option>
                                            {
                                                departments.map((dept, index) => {
                                                    return <option key={index} value={dept.name}>{dept.name}</option>
                                                })
                                            }
                                        </select>
                                        <div className="d-flex justify-content-end mt-3">
                                            <input type="submit" value={content['addEmployee']} className="btn btn-sm btn-light border-0" 
                                                style={{backgroundColor: "#333399", color: "white"}} onClick={(e) => addEmployee(e)} />
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
                                    <th>{content['dept']}</th>
                                    <th></th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    employees.map((employee, index) => {
                                        return(
                                            <tr key={index}>
                                                <td>{employee.username}</td>
                                                <td>{employee.name}</td>
                                                <td>
                                                    <form>
                                                        <button type="button" className="btn badge text-dark btn-outline-secondary px-1" 
                                                        onClick={(e) => showPassword( e)}>{content['show']}</button>
                                                        <p className="mt-2 mb-0" hidden>{employee.password}</p>
                                                    </form>
                                                </td>
                                                <td>{employee.department}</td>
                                                <td>
                                                    <button className="btn btn-sm btn-warning" data-bs-toggle="modal" 
                                                        data-bs-target={`#viewEmployee${employee.username}`}
                                                        onClick={() => getEmpHistory(`${employee.username}`)}>{content['view']}</button>
                                                    <div className="modal fade text-start" id={`viewEmployee${employee.username}`}>
                                                        <div className="modal-dialog modal-dialog-scrollable modal-lg pt-0">
                                                            <div className="modal-content">
                                                            <div className="modal-header" style={{height: 45+"px"}}>
                                                                <h4 className="modal-title">{content['edit']}</h4>
                                                                <div className="d-flex justify-content-end">
                                                                    <button id={`edit-emp-close${employee.username}`} 
                                                                        className="btn-close" data-bs-dismiss="modal"></button>
                                                                </div>
                                                                </div>
                                                                <div className="modal-body pt-3">
                                                                    <form id={`form${employee.username}`} 
                                                                        onSubmit={(e) => e.preventDefault()}>
                                                                        <div className="d-flex justify-content-start">
                                                                            <label htmlFor="username" className="form-label mb-1">
                                                                                {content['username']}</label>
                                                                        </div>
                                                                        <input id={`editEmpUsername${employee.username}`} name="username" 
                                                                            className="form-control form-control-sm" 
                                                                            value={employee.username} readonly required />
                                                                        <form>
                                                                            <div className="d-flex justify-content-start mt-2">
                                                                                <input type="checkbox" 
                                                                                    className="form-check-input align-middle mb-1" 
                                                                                    onClick={(e) => enableField(e, setName)} />
                                                                                <label htmlFor="name" className="form-label mb-1 mx-1">
                                                                                    {content['name']}</label>
                                                                            </div>
                                                                            <input id={`editEmpName${employee.username}`} name="name" 
                                                                                className="form-control form-control-sm" 
                                                                                defaultValue={employee.name} pattern="[A-z0-9]+" 
                                                                                title="Only characters, numbers and underscores" 
                                                                                required disabled/>
                                                                        </form>
                                                                        <form>
                                                                            <div className="d-flex justify-content-start mt-2">
                                                                                <input type="checkbox" 
                                                                                    className="form-check-input align-middle mb-1" 
                                                                                    onClick={(e) => enableField(e, setDepartment)} />
                                                                                <label htmlFor="dept" className="form-label mb-1 mx-1">
                                                                                    {content['dept']}</label>
                                                                            </div>
                                                                            <select id={`editEmpDept${employee.username}`} name="dept" 
                                                                                className="form-select form-select-sm" required disabled>
                                                                                {
                                                                                    departments.map((dept) => {
                                                                                        if(dept.name == employee.department){
                                                                                            return(
                                                                                                <option value={dept.name} selected>
                                                                                                {dept.name}</option>
                                                                                            )
                                                                                        }else{
                                                                                            return(
                                                                                                <option value={dept.name}>
                                                                                                    {dept.name}</option>
                                                                                            )
                                                                                        }
                                                                                    })
                                                                                }
                                                                            </select>
                                                                        </form>
                                                                        <div className="d-flex justify-content-end mt-3">
                                                                            <input type="submit" value={content['edit']} 
                                                                                className="btn btn-sm btn-warning" 
                                                                                onClick={(e) => editEmployee(e,`${employee.username}`)}/>
                                                                        </div>
                                                                    </form>
                                                                    <hr className="my-1"/>
                                                                    <div className="d-flex justify-content-start">
                                                                        <h5 className="my-2">{content['history']}</h5>
                                                                    </div>
                                                                    <div className="d-flex justify-content-start">
                                                                        <p className="mb-1">{content['createdAt']} </p>
                                                                        <p className="mx-2">{employee["created_at"]}</p>
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
                                                        style={{backgroundColor: "#cc0000"}}
                                                        data-bs-target={`#deleteEmployee${employee.username}`}>
                                                        {content['delete']}</button>
                                                    <div className="modal fade" id={`deleteEmployee${employee.username}`}>
                                                        <div className="modal-dialog modal-dialog-centered">
                                                            <div className="modal-content border-2 border-secondary">
                                                                <div className="modal-header" style={{height: 45}}>
                                                                    <h5 className="modal-title mx-auto">{content['delete']} 
                                                                        {employee.username}</h5>
                                                                </div>
                                                                <div className="modal-body pt-2">
                                                                    <div className="container d-flex justify-content-around mt-4" 
                                                                        style={{width: 270+"px"}}>
                                                                        <button id="delete-close" className="btn btn-sm btn-dark px-4" 
                                                                            data-bs-dismiss="modal" data-content="cancel">
                                                                            {content['cancel']}</button>
                                                                        <button className="btn btn-sm btn-danger px-4" 
                                                                            style={{backgroundColor: "#cc0000"}} 
                                                                            onClick={() => deleteEmployee(`${employee.username}`)}>
                                                                            {content['delete']}</button>
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


export {EmployeesList}