import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {useSelector} from 'react-redux'
import axios from 'axios'


function Technicians(){
    // lang and auth are global state managed by redux
    const navigate = useNavigate()
    const auth = useSelector((state) => state.auth)
    const lang= useSelector((state) => state.lang)
    const[content, setContent] = useState({})
    const[state, setState] = useState(false)
    const[tickets, setTickets] = useState([])
    const[comment, setComment] = useState('')
    
    
    // Retrieving page content based on the selected language. Default language is Arabic
    useEffect(() => {
        let language = localStorage.getItem('lang') != null ? localStorage.getItem('lang') : 'ar'
    
        axios.get(`http://localhost:5200/pages_content/technicians/${language}`)
        .then((res) => {
        let newContent = {}
        for(let i of res.data.content){
            newContent[i.element] = i.value
        }
        setContent(newContent)
        })
    },[lang])

    
    // Retrieving the technician tickets
    useEffect(() => {
        axios.post('http://localhost:5200/tickets/get', {token: localStorage.getItem('token')})
        .then((res) => {
            if(res.data.auth){
                setTickets(res.data.tickets)
                localStorage.setItem('token', res.data.newToken)
            }else{
                navigate('/')
            }
        })
    },[state, auth])

    
    // Finish a ticket and set it closed
    function finishTicket(e, ticket){
        if(e.target.form.checkValidity()){
            axios.put("http://localhost:5200/tickets/finish", {ticket: ticket, comment: comment, token: localStorage.getItem('token')})

            document.getElementById(`ticket-close${ticket}`).click()
            setTimeout(() => { setState(!state) }, 1500)
        }
    }


    if(auth == true){
        return(
            <div className="container mt-3">
                <div className="mt-5">
                    <h5>{content['yourTickets']}</h5>
                    <div className="mt-3" style={{overflow: "auto", height: 300+"px"}}>
                        <button className="btn btn-sm btn-secondary text-light m-1 py-0" onClick={() => setState(!state)}>
                            <img className="m-1" src="refresh-cw.svg" width="13px"/> {content['refresh']}</button>
                        <table className="table table-hover text-center" style={{backgroundColor: "hsl(0, 0%, 97%)"}}>
                        <thead className="sticky-top" style={{backgroundColor: "hsl(0, 0%, 96%)"}}>
                            <tr>
                                <th>{content['number']}</th>
                                <th>{content['createdAt']}</th>
                                <th>{content['dept']}</th>
                                <th>{content['employee']}</th>
                                <th>{content['phone']}</th>
                                <th>{content['category']}</th>
                                <th>{content['description']}</th>
                                <th>{content['status']}</th>
                                <th>{content['closedAt']}</th>
                                <th>{content['closedBy']}</th>
                                <th>{content['comment']}</th>
                                <th></th>
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
                                                <td>{ticket.dept}</td>
                                                <td>{ticket.employee}</td>
                                                <td>{ticket.phone}</td>
                                                <td>{ticket.category}</td>
                                                <td className="text-start">{description}</td>
                                                <td className="text-warning fw-bold">{ticket.status}</td>
                                                <td>{ticket['closed_at']}</td>
                                                <td></td>
                                                <td></td>
                                                <td>
                                                    <div>
                                                        <button value="Finish" className="btn btn-sm btn-warning" data-bs-toggle="modal" 
                                                            data-bs-target={`#viewTicket${ticket.id}`}>{content['finish']}</button>
                                                    </div>
                                                    <div className="modal fade" id={`viewTicket${ticket.id}`}>
                                                        <div className="modal-dialog modal-lg modal-scrollable">
                                                            <div className="modal-content">
                                                                <div className="modal-header" style={{height: 45+"px"}}>
                                                                    <h4 className="modal-title">{content['ticketInfo']}</h4>
                                                                    <div className="d-flex justify-content-end">
                                                                        <button id={`ticket-close${ticket.id}`} className="btn-close" 
                                                                            data-bs-dismiss="modal"></button>
                                                                    </div>
                                                                </div>
                                                                <div className="modal-body text-start pt-0">
                                                                    <form onSubmit={(e) => e.preventDefault()}>
                                                                        <div className="row g-1">
                                                                            <div className="col">
                                                                                <div className=" d-flex justify-content-start">
                                                                                    <label htmlFor="id" className="form-label mt-2 mb-1">
                                                                                        {content['number']}</label>
                                                                                </div>
                                                                                <input name="id" value={`${ticket.id}`} 
                                                                                    className="form-control form-control-sm" disabled />
                                                                            </div>
                                                                            <div className="col">
                                                                                <div className=" d-flex justify-content-start">
                                                                                    <label htmlFor="timestamp" 
                                                                                        className="form-label mt-2 mb-1">
                                                                                        {content['createdAt']}</label>
                                                                                </div>
                                                                                <input id="timestamp" value={`${ticket.timestamp}`} 
                                                                                    className="form-control form-control-sm" disabled />
                                                                            </div>
                                                                            <div className="col">
                                                                                <div className=" d-flex justify-content-start">
                                                                                    <label htmlFor="phone" 
                                                                                        className="form-label mt-2 mb-1">
                                                                                        {content['phone']}</label>
                                                                                </div>
                                                                                <input id="phone" value={`${ticket.phone}`}
                                                                                    className="form-control form-control-sm" disabled />
                                                                            </div>
                                                                        </div>
                                                                        <div className="row g-1">
                                                                            <div className="col">
                                                                                <div className=" d-flex justify-content-start">
                                                                                    <label htmlFor="dept" 
                                                                                        className="form-label mt-2 mb-1">
                                                                                        {content['dept']}</label>
                                                                                </div>
                                                                                <input id="dept" value={`${ticket.dept}`} 
                                                                                    className="form-control form-control-sm" disabled />
                                                                            </div>
                                                                            <div className="col">
                                                                                <div className=" d-flex justify-content-start">
                                                                                    <label htmlFor="category" 
                                                                                        className="form-label mt-2 mb-1">
                                                                                        {content['category']}</label>
                                                                                </div>
                                                                                <input id="category" value={`${ticket.category}`} 
                                                                                    className="form-control form-control-sm" disabled />
                                                                            </div>
                                                                        </div>
                                                                        <div className="row">
                                                                            <div className="col">
                                                                                <div className=" d-flex justify-content-start">
                                                                                    <label htmlFor="description" className="form-label 
                                                                                        mt-2 mb-1">{content['description']}</label>
                                                                                </div>
                                                                                <textarea name="description" rows="4" 
                                                                                    className="form-control form-control-sm" disabled>
                                                                                    {ticket.description}
                                                                                </textarea>
                                                                            </div>
                                                                        </div>
                                                                        <div className="row">
                                                                            <div className="col">
                                                                                <div className=" d-flex justify-content-start">
                                                                                    <label htmlFor="comment" 
                                                                                        className="form-label mt-2 mb-1">
                                                                                        {content['comment']}</label>
                                                                                </div>
                                                                                <textarea id={`comment${ticket.id}`} name="comment"  
                                                                                    className="form-control" rows="4" required
                                                                                    onChange={(e) => setComment(e.target.value)}>
                                                                                </textarea>
                                                                            </div>
                                                                        </div>
                                                                        <div className="row mt-2">
                                                                            <div className="col d-flex justify-content-end">
                                                                                <button type="submit" className="btn btn-sm btn-warning" 
                                                                                    onClick={(e) => finishTicket(e, `${ticket.id}`)}>
                                                                                    {content['finish']}</button>
                                                                            </div>
                                                                        </div>
                                                                    </form>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    }else if(ticket.status == 'closed'){
                                        let comment = ((ticket.comment).length < 100) ? 
                                            ticket.comment : (ticket.comment).slice(0, 100) + "..."

                                        return(
                                            <tr key={index}>
                                                <td>{ticket.id}</td>
                                                <td>{ticket['created_at']}</td>
                                                <td>{ticket.dept}</td>
                                                <td>{ticket.employee}</td>
                                                <td>{ticket.phone}</td>
                                                <td>{ticket.category}</td>
                                                <td className="text-start">{description}</td>
                                                <td className="fw-bold" style={{color: "#333399"}}>{ticket.status}</td>
                                                <td>{ticket['closed_at']}</td>
                                                <td>{ticket['closed_by']}</td>
                                                <td className="text-start">{comment}</td>
                                                <td>
                                                    <button className="btn btn-sm btn-light border-0" 
                                                        style={{backgroundColor: "#333399", color: "white"}}
                                                        data-bs-toggle="modal" data-bs-target={`#viewTicket${ticket.id}`}>
                                                        {content['view']}</button>
                                                    <div className="modal fade" id={`viewTicket${ticket.id}`}>
                                                        <div className="modal-dialog modal-lg">
                                                            <div className="modal-content">
                                                                <div className="modal-header" style={{height: 45+"px"}}>
                                                                    <h4 className="modal-title">{content['ticketInfo']}</h4>
                                                                    <div className="d-flex justify-content-end">
                                                                        <button className="btn-close" data-bs-dismiss="modal"></button>
                                                                    </div>
                                                                </div>                                                                
                                                                <div className="modal-body text-start">
                                                                    <form>
                                                                        <div className="row g-1">
                                                                            <div className="col">
                                                                                <div className=" d-flex justify-content-start">
                                                                                    <label htmlFor="id" className="form-label mt-2 mb-1">
                                                                                    {content['number']}</label>
                                                                                
                                                                                </div>
                                                                                <input id="id" value={`${ticket.id}`} 
                                                                                    className="form-control form-control-sm" disabled />
                                                                            </div>
                                                                            <div className="col">
                                                                                <div className=" d-flex justify-content-start">
                                                                                    <label htmlFor="timestamp" 
                                                                                        className="form-label mt-2 mb-1">
                                                                                        {content['createdAt']}</label>
                                                                                </div>
                                                                                <input id="timestamp" value={`${ticket['created_at']}`} 
                                                                                    className="form-control form-control-sm" disabled />
                                                                            </div>
                                                                            <div className="col">
                                                                                <div className=" d-flex justify-content-start">
                                                                                    <label htmlFor="phone" 
                                                                                        className="form-label mt-2 mb-1">
                                                                                        {content['phone']}</label>
                                                                                </div>
                                                                                <input id="phone" value={`${ticket.phone}`} 
                                                                                    className="form-control form-control-sm" disabled />
                                                                            </div>
                                                                        </div>
                                                                        <div className="row g-1">
                                                                            <div className="col">
                                                                                <div className=" d-flex justify-content-start">
                                                                                    <label htmlFor="dept" 
                                                                                        className="form-label mt-2 mb-1">
                                                                                        {content['dept']}</label>
                                                                                </div>
                                                                                <input value={`${ticket.dept}`} 
                                                                                    className="form-control form-control-sm" disabled />
                                                                            </div>
                                                                            <div className="col">
                                                                                <div className=" d-flex justify-content-start">
                                                                                    <label htmlFor="category" 
                                                                                        className="form-label mt-2 mb-1">
                                                                                        {content['category']}</label>
                                                                                </div>
                                                                                <input value={`${ticket.category}`} 
                                                                                    className="form-control form-control-sm" disabled />
                                                                            </div>
                                                                        </div>
                                                                        <div className="row">
                                                                            <div className="col">
                                                                                <div className=" d-flex justify-content-start">
                                                                                    <label htmlFor="description" 
                                                                                        className="form-label mt-2 mb-1">
                                                                                        {content['description']}</label>
                                                                                </div>
                                                                                <textarea name="description" rows="4" 
                                                                                    className="form-control form-control-sm" disabled>
                                                                                    {ticket.description}
                                                                                </textarea>
                                                                            </div>
                                                                        </div>
                                                                        <div className="row">
                                                                            <div className="col">
                                                                                <div className=" d-flex justify-content-start">
                                                                                    <label htmlFor="comment" 
                                                                                        className="form-label mt-2 mb-1">
                                                                                        {content['comment']}</label>
                                                                                </div>
                                                                                <textarea className="form-control" rows="4" disabled>
                                                                                    {ticket.comment}</textarea>
                                                                            </div>
                                                                        </div>
                                                                    </form>
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


export {Technicians}