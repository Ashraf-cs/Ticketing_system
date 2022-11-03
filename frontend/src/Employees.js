import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {useSelector} from 'react-redux'
import axios from 'axios'


function Employees(){
    // lang and auth are global state managed by redux
    const navigate = useNavigate()
    const auth = useSelector((state) => state.auth)
    const lang= useSelector((state) => state.lang)
    const[content, setContent] = useState({})
    const[state, setState] = useState(false)
    const[tickets, setTickets] = useState([])
    const[username, setUsername] = useState()
    const[phone, setPhone] = useState()
    const[department, setDepartment] = useState()
    const[category, setCategory] = useState()
    const[description, setDescription] = useState() 


    // Retrieving page content based on the selected language. Default language is Arabic
    useEffect(() => {
        let language = localStorage.getItem('lang') != null ? localStorage.getItem('lang') : 'ar'
    
        axios.get(`http://localhost:5200/pages_content/employees/${language}`)
        .then((res) => {
        let newContent = {}
        for(let i of res.data.content){
            newContent[i.element] = i.value
        }
        setContent(newContent)
        })
    },[lang])


    // Retrieving the employee tickets
    useEffect(() => {
        axios.post('http://localhost:5200/tickets/get', {token: localStorage.getItem('token')})
        .then((res) => {
            if(res.data.auth){
                setTickets(res.data.tickets)
                setUsername(res.data.username)
                setDepartment(res.data.dept)
                localStorage.setItem('token', res.data.newToken)
            }else{
                navigate('/')
            }
        })
    },[state, auth])


    function createTicket(e){
        if(e.target.form.checkValidity()){
            axios.post("http://localhost:5200/tickets", {username: username, phone: phone, dept: department,
                category: category, description: description, token: localStorage.getItem('token')})
            
            e.target.form.reset()
            setTimeout(() => {
                e.target.focus();
                e.target.blur()
            }, 0)
            setTimeout(() => { setState(!state) }, 1500)
        }
    }
    
    
    if(auth == true){
        return(
            <div className="container mt-3">
                <button className="btn btn-sm btn-success" style={{backgroundColor: "#26734d"}}
                    data-bs-toggle="collapse" data-bs-target="#createTicket">{content['createTicket']}</button>
                <div className="collapse mt-2" id="createTicket">
                    <form style={{backgroundColor: "white"}} onSubmit={(e) => e.preventDefault()}>
                        <div className="row row-cols-2">
                            <div className="col">
                                <label htmlFor="username" className="form-label mt-1 mb-1 fw-bold">{content['name']}</label>
                                <input id="username" className="form-control form-control-sm" readOnly 
                                    defaultValue={username}/>
                            </div>
                            <div className="col">
                                <label htmlFor="phone" className="form-label mt-1 mb-1 fw-bold">{content['phone']}</label>
                                <input id="phone" className="form-control form-control-sm" required pattern="[0-9]+"
                                    onChange={(e) => { setPhone(e.target.value) }}/>
                            </div>
                            <div className="col">
                                <label id="dept" htmlFor="dept" className="form-label mt-2 mb-1 fw-bold">{content['dept']}</label>
                                <input id="dept" className="form-control form-control-sm" readOnly 
                                    defaultValue={department}/>
                            </div>
                            <div className="col">
                                <label htmlFor="category" className="form-label mt-2 mb-1 fw-bold">{content['category']}</label>
                                <select id="category" className="form-select form-select-sm" required 
                                    onChange={(e) => { setCategory(e.target.value) }}>
                                    <option value="" selected></option>
                                    <option value="devices">{content['devices']}</option>
                                    <option value="network">{content['network']}</option>
                                    <option value="printers">{content['printers']}</option>
                                </select>
                            </div>
                            <div className="col-12">
                                <label htmlFor="description" className="form-label mt-2 mb-1 fw-bold">{content['description']}</label>
                                <textarea id="description" className="form-control form-control-sm" rows="4" 
                                    cols="50" maxLength="500" placeholder="Write description for the issue" required 
                                    onChange={(e) => { setDescription(e.target.value) }}></textarea>
                            </div>
                        </div>
                        <input type="submit" value={content['send']} className="btn btn-sm btn-warning mt-2" style={{width: 80+"px"}} 
                            onClick={(e) => createTicket(e)}/>
                    </form>
                </div>
                <div className="mt-4">
                    <h5>{content['yourTickets']}</h5>
                    <div className="mt-3" style={{height: 300+"px", overflow: "auto"}}>
                        <table className="table table-hover" style={{backgroundColor: "hsl(0, 0%, 97%)"}}>
                            <thead className="sticky-top" style={{backgroundColor: "hsl(0, 0%, 96%)"}}> 
                                <tr>
                                    <th>{content['number']}</th>
                                    <th>{content['createdAt']}</th>
                                    <th>{content['dept']}</th>
                                    <th>{content['phone']}</th>
                                    <th>{content['category']}</th>
                                    <th>{content['description']}</th>
                                    <th>{content['status']}</th>
                                    <th>{content['closedAt']}</th>
                                    <td></td>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    tickets.map((ticket, index) => {
                                        let description = ((ticket.description).length < 150) ? 
                                            ticket.description : (ticket.description).slice(0, 150) + "..."
                
                                        if(ticket.status == 'open'){
                                            return(
                                                <tr key={index}>
                                                    <td>{ticket.id}</td>
                                                    <td>{ticket['created_at']}</td>
                                                    <td>{ticket.department}</td>
                                                    <td>{ticket.phone}</td>
                                                    <td>{ticket.category}</td>
                                                    <td className="text-start">{description}</td>
                                                    <td className="text-warning fw-bold">{ticket.status}</td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                            )
                                        }else if(ticket.status == 'closed'){
                                            return(
                                                <tr key={index}>
                                                    <td>{ticket.id}</td>
                                                    <td>{ticket['created_at']}</td>
                                                    <td>{ticket.dept}</td>
                                                    <td>{ticket.phone}</td>
                                                    <td>{ticket.category}</td>
                                                    <td className="text-start">{description}</td>
                                                    <td className="fw-bold" style={{color: "#333399"}}>{ticket.status}</td>
                                                    <td>{ticket['closed_at']}</td>
                                                    <td>
                                                        <button className="btn btn-sm btn-light border-0" 
                                                            style={{backgroundColor: "#333399", color: "white"}}
                                                            data-bs-toggle="modal" data-bs-target={`#View${ticket.id}`}>
                                                            {content['view']}</button>
                                                        <div className="modal fade" id={`View${ticket.id}`}>
                                                            <div className="modal-dialog modal-lg">
                                                                <div className="modal-content">
                                                                    <div className="modal-header" style={{height: 45+"px"}}>
                                                                        <h4 className="modal-title">
                                                                            {content['ticketInfo']}</h4>
                                                                        <div className="d-flex justify-content-end">
                                                                            <button className="btn-close" 
                                                                                data-bs-dismiss="modal"></button>
                                                                        </div>
                                                                    </div>
                                                                    <div className="modal-body text-start">
                                                                            <div className="row g-1">
                                                                                <div className="col">
                                                                                    <div className=" d-flex justify-content-start">
                                                                                        <label htmlFor="id" 
                                                                                            className="form-label mt-2 mb-1">
                                                                                            {content['number']}</label>
                                                                                    </div>
                                                                                    <input id="id" value={ticket.id} 
                                                                                        className="form-control form-control-sm" 
                                                                                        disabled readOnly />
                                                                                </div>
                                                                                <div className="col">
                                                                                    <div className=" d-flex justify-content-start">
                                                                                        <label htmlFor="timestamp" 
                                                                                            className="form-label mt-2 mb-1">
                                                                                            {content['date-time']}</label>
                                                                                    </div>
                                                                                    <input id="timestamp" value={ticket.timestamp} 
                                                                                        className="form-control form-control-sm" 
                                                                                        disabled readOnly />
                                                                                </div>
                                                                                <div className="col">
                                                                                    <div className=" d-flex justify-content-start">
                                                                                        <label htmlFor="closed_at" 
                                                                                            className="form-label mt-2 mb-1">
                                                                                            {content['closedAt']}</label>
                                                                                    </div>
                                                                                    <input id="closed_at" value={ticket['closed_at']} 
                                                                                        className="form-control form-control-sm" 
                                                                                        disabled readOnly />
                                                                                </div>
                                                                                <div className="col">
                                                                                    <div className=" d-flex justify-content-start">
                                                                                        <label htmlFor="phone" 
                                                                                            className="form-label mt-2 mb-1">
                                                                                            {content['phone']}</label>
                                                                                    </div>
                                                                                    <input id="phone" value={ticket.phone} 
                                                                                        className="form-control form-control-sm" 
                                                                                        disabled readOnly />
                                                                                </div>
                                                                            </div>
                                                                            <div className="row g-1">
                                                                                <div className="col">
                                                                                    <div className=" d-flex justify-content-start">
                                                                                        <label htmlFor="dept" 
                                                                                            className="form-label mt-2 mb-1">
                                                                                            {content['dept']}</label>
                                                                                    </div>
                                                                                    <input id="dept" value={ticket.dept} 
                                                                                        className="form-control form-control-sm" 
                                                                                        disabled readOnly />
                                                                                </div>
                                                                                <div className="col">
                                                                                    <div className=" d-flex justify-content-start">
                                                                                        <label htmlFor="category" 
                                                                                            className="form-label mt-2 mb-1">
                                                                                            {content['category']}</label>
                                                                                    </div>
                                                                                    <input id="category" value={ticket.category} 
                                                                                        className="form-control form-control-sm" 
                                                                                        disabled readOnly />
                                                                                </div>
                                                                                <div className="col">
                                                                                    <div className=" d-flex justify-content-start">
                                                                                        <label htmlFor="status" 
                                                                                            className="form-label mt-2 mb-1">
                                                                                            {content['status']}</label>
                                                                                    </div>
                                                                                    <input id="category" value="closed" 
                                                                                        className="form-control form-control-sm" 
                                                                                        disabled readOnly />
                                                                                </div>
                                                                            </div>
                                                                            <div className="row">
                                                                                <div className="col">
                                                                                    <div className=" d-flex justify-content-start">
                                                                                        <label htmlFor="description" 
                                                                                            className="form-label mt-2 mb-1">
                                                                                            {content['description']}</label>
                                                                                    </div>
                                                                                    <textarea id="description" rows="4" 
                                                                                        className="form-control form-control-sm" 
                                                                                        disabled readOnly>{ticket.description}</textarea>
                                                                                </div>
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


export {Employees}