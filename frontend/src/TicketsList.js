import {useEffect, useState} from 'react'
import {useNavigate, Link} from 'react-router-dom'
import {useSelector} from 'react-redux'
import axios from 'axios'


function TicketsList(){
    // lang and auth are global state managed by redux
    const navigate = useNavigate()
    const date = new Date()
    const auth = useSelector((state) => state.auth)
    const lang = useSelector((state) => state.lang)
    const[content, setContent] = useState({})
    const[state, setState] = useState(false)
    const[year, setYear] = useState(date.getFullYear())
    const[years, setYears] = useState([])
    const[departments, setDepartments] = useState([])
    const[technicians, setTechnicians] = useState([])
    const[tickets, setTickets] = useState([])
    const[history, setHistory] = useState([])
    const[filteredTickets, setFilteredTickets] = useState([])
    const[openedTickets, setOpenedTickets] = useState(0)
    const[closedTickets, setClosedTickets] = useState(0)
    const[createdAtFrom, setCreatedAtFrom] = useState('')
    const[createdAtTo, setCreatedAtTo] = useState('')
    const[closedAtFrom, setClosedAtFrom] = useState('')
    const[closedAtTo, setClosedAtTo] = useState('')
    const[technician, setTechnician] = useState('')
    const[department, setDepartment] = useState('')
    const[employee, setEmployee] = useState('')
    const[category, setCategory] = useState('')
    const[status, setStatus] = useState('')
    const[comment, setComment] = useState('')
    const[closedBy, setClosedBy] = useState('')


    // Retrieving page content based on the selected language. Default language is Arabic
    useEffect(() => {
        let language = localStorage.getItem('lang') != null ? localStorage.getItem('lang') : 'ar'
    
        axios.get(`http://localhost:5200/pages_content/ticketsList/${language}`)
        .then((res) => {
        let newContent = {}
        for(let i of res.data.content){
            newContent[i.element] = i.value
        }
        setContent(newContent)
        })
    },[lang])


    // Retrieving departments and technicians lists
    /* Retrieving all tickets of a given year and assigning them to tickets and filteredTickets states,
     one to be displayed in the table and other as copy for filtering methods */
    useEffect(() => {
        axios.post('http://localhost:5200/depts/get', {token: localStorage.getItem('token')})
        .then((res) => {
            if(res.data.auth){
                setDepartments(res.data.depts)
                localStorage.setItem('token', res.data.newToken)
                
                axios.post('http://localhost:5200/users/get', {category: 'technicians', token: localStorage.getItem('token')})
                .then((res) => setTechnicians(res.data.users))

                axios.post('http://localhost:5200/tickets/get_all', {year: year, token: localStorage.getItem('token')})
                .then((res) => {
                    setTickets(res.data.tickets)
                    setFilteredTickets(res.data.tickets)
                    setYears(res.data.years)

                    let open = 0
                    let closed = 0
                    res.data.tickets.forEach((ticket) => {
                        if(ticket.status == "open"){
                            open += 1
                        }else if(ticket.status == 'closed'){
                            closed += 1
                        }
                    })

                    setOpenedTickets(open)
                    setClosedTickets(closed)
                })
            }else{
                navigate('/')
            }
        })
    },[state, year, auth])


    // Fileter tickets based on a single parameter from filter fields
    function filterTickets(field, value){
        let filtered = []

        if(tickets != ''){
            tickets.forEach((ticket) => {
                let reqexp = new RegExp(value)

                if(String(ticket[field]).search(reqexp) != -1){
                    filtered.push(ticket)
                }
            })

            let open = 0
            let closed = 0
            filtered.forEach((ticket) => {
                if(ticket.status == "open"){
                    open += 1
                }else if(ticket.status == 'closed'){
                    closed += 1
                }
            })

            setOpenedTickets(open)
            setClosedTickets(closed)
            setFilteredTickets(filtered)
        }
    }


    // Fileter tickets based on multiple parameters all at once from custom filter fields
    function customFilterTickets(){
        let filtered = []
        let created_at_from = createdAtFrom != '' ? createdAtFrom + ' 00:00:00' : `${year}-01-01 00:00:00`
        let created_at_to = createdAtTo != '' ? createdAtTo + ' 23:59:59' : `${year}-12-31 23:59:59`
        let closed_at_from = closedAtFrom != ''  ? closedAtFrom + ' 00:00:00' : '00-00-00'
        let closed_at_to = closedAtTo != '' ? closedAtTo + ' 23:59:59' : '9'
        
        if(tickets != ''){
            (tickets).forEach((ticket) => {
                if(
                    String(ticket["created_at"]) >= created_at_from 
                    && String(ticket["created_at"]) <= created_at_to
                    && String(ticket["closed_at"]) >= closed_at_from 
                    && String(ticket["closed_at"]) <= closed_at_to
                    && String(ticket["technician"]).search(technician) != -1 
                    && String(ticket["department"]).search(department) != -1  
                    && String(ticket["employee"]).search(employee) != -1 
                    && String(ticket["category"]).search(category) != -1  
                    && String(ticket["status"]).search(status) != -1 
                    && String(ticket["closed_by"]).search(closedBy) != -1
                ){
                    filtered.push(ticket)
                }
            })

            let open = 0
            let closed = 0
            filtered.forEach((ticket) => {
                if(ticket.status == "open"){
                    open += 1
                }else{
                    closed += 1
                }
            })

            setOpenedTickets(open)
            setClosedTickets(closed)
            setFilteredTickets(filtered)
        }
    }


    // Resetting filter fields and related states to be used for a new filtering
    function resetFilterFields(form){
        let open = 0
        let closed = 0
        tickets.forEach((ticket) => {
            if(ticket.status == "open"){
                open += 1
            }else if(ticket.status == 'closed'){
                closed += 1
            }
        })

        form.reset()
        setOpenedTickets(open)
        setClosedTickets(closed)
        setFilteredTickets(tickets)
        setTechnician(); setDepartment(); setEmployee(); 
        setCategory(); setStatus(); setClosedBy()
    }


    // Updating the technician who is responsible for a given ticket (Assign the ticket to another technician)
    function updateTicket(ticket, technician){
        axios.put("http://localhost:5200/tickets", {ticket: ticket, technician: technician, token: localStorage.getItem('token')})
        
        document.getElementById(`ticket-close${ticket}`).click()
        setTimeout(() => { setState(!state);  }, 1500)
    }


    // Retrieving ticket updates history
    function getTicketHistory(ticket){
        axios.post(`http://localhost:5200/tickets/history`, {id: ticket, token: localStorage.getItem('token')})
        .then(res => setHistory(res.data.history))
    }


    // Finish a ticket and set it closed
    function finishTicket(form, ticket){
        if(form.checkValidity()){
            axios.put('http://localhost:5200/tickets/finish', {ticket: ticket, comment: comment, token: localStorage.getItem('token')})

            document.getElementById(`ticket-close${ticket}`).click()
            setTimeout(() => { setState(!state) }, 1500)
        }
    }


    // Re-opening a closed ticket
    function openTicket(ticket){
        axios.put('http://localhost:5200/tickets/open', {ticket : ticket, token: localStorage.getItem('token')})

        document.getElementById(`ticket-close${ticket}`).click()
        setTimeout(() => { setState(!state)}, 1500)
    }


    if(auth == true){
        return(
            <div className="container-xxl mt-3">
                <Link to="/admin" className="text-decoration-none fs-6 d-block" style={{color:" #0033cc"}}>{content['backHome']}</Link>
                <div className="mt-3">
                    <h5 className="d-inline">{content['ticketsOf']} </h5> 
                    <select onChange={(e) => setYear(e.target.value)}>
                        {
                            years.map((year, index) => {
                                let date = new Date()

                                if(year.year == date.getFullYear()){
                                    return <option key={index} value={year.year} selected>{year.year}</option>
                                }else{
                                    return <option key={index} value={year.year}>{year.year}</option>
                                }
                            })
                        }
                    </select>
                </div>
                <div className="mt-4 card p-2 borer border-secondary">
                    <div className="row">
                        <div className="col">
                            <div className="card text-center fs-4 p-2">
                                <p>{content['tickets']}</p>
                                <span>{filteredTickets.length}</span>
                            </div>
                        </div>
                        <div className="col">
                            <div className="card text-center fs-4 p-2">
                                <p>{content['openedTickets']}</p>
                                <span>{openedTickets}</span>
                            </div>
                        </div>
                        <div className="col">
                            <div className="card text-center fs-4 p-2">
                                <p>{content['closedTickets']}</p>
                                <span>{closedTickets}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-3">
                    <div className="mt-1" style={{height: 100+"%", overflow: "auto"}}>
                        <form id="cFilterForm"></form>
                        <table className="table table-hover text-center" style={{backgroundColor: "hsl(0, 0%, 97%)"}}>
                            <thead className="sticky-top" style={{backgroundColor: "hsl(0, 0%, 96%)"}}>
                                <tr>
                                    <th>{content['number']}</th>
                                    <th>{content['createdAt']}</th>
                                    <th>{content['technician']}</th>
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
                                {/* Filter fields */}
                                <tr>
                                    <th>
                                        <input type="search" className="form-control form-control-sm" 
                                            onInput={(e) => filterTickets('id',e.target.value)} />
                                    </th>
                                    <th>
                                        <input type="date" className="form-control form-control-sm" 
                                            style={{width: 130+"px"}} onInput={(e) => filterTickets('created_at',e.target.value)} />
                                    </th>
                                    
                                    <th>
                                        <input type="search" className="form-control form-control-sm" 
                                            onInput={(e) => filterTickets('technician',e.target.value)} />
                                    </th>
                                    <th>
                                        <select className="form-select form-select-sm" 
                                            onChange={(e) => filterTickets('department',e.target.value)}>
                                            <option value="">{content['all']}</option>
                                            {
                                                departments.map((dept, index) => {
                                                    return  <option key={index} value={dept.name}>{dept.name}</option>
                                                })
                                            }
                                        </select>
                                    </th>
                                    <th>
                                        <input type="search" className="form-control form-control-sm" 
                                            onInput={(e) => filterTickets('employee',e.target.value)} />
                                    </th>
                                    <th></th>
                                    <th>
                                        <select className="form-select form-select-sm" 
                                            onChange={(e) => filterTickets('category',e.target.value)} >
                                            <option value="">{content['all']}</option>
                                            <option value="devices">{content['devices']}</option>
                                            <option value="network">{content['network']}</option>
                                            <option value="printers">{content['printers']}</option>
                                        </select>
                                    </th>
                                    <th></th>
                                    <th>
                                        <select className="form-select form-select-sm" 
                                            onChange={(e) => filterTickets('status',e.target.value)}>
                                            <option value="">{content['all']}</option>
                                            <option value="open">{content['open']}</option>
                                            <option value="closed">{content['closed']}</option>
                                        </select>
                                    </th>
                                    <th>
                                        <input type="date" className="form-control form-control-sm" 
                                            style={{width: 130+"px"}} onInput={(e) => filterTickets('closed_at',e.target.value)} />
                                    </th>
                                    <th>
                                        <input type="search" className="form-control form-control-sm" 
                                            onInput={(e) => filterTickets('closed_by',e.target.value)} />
                                    </th>
                                    <th></th>
                                    <th className="px-0">
                                        <button className="btn btn-sm btn-secondary mx-0" data-bs-toggle="collapse" 
                                            data-bs-target="#customFilter">{content['custom']}</button>
                                    </th>
                                </tr>
                            </thead>
                            {/* Custom filter fields */}
                            <thead className="collapse align-top" id="customFilter">
                                <tr >
                                    <th></th>
                                    <th className="fw-normal pt-0">
                                        {content['from']}
                                        <input type="date" form="cFilterForm" style={{width: 130+"px"}} 
                                            className="form-control form-control-sm" onChange={(e) => setCreatedAtFrom(e.target.value)}/>
                                        {content['to']}
                                        <input type="date" form="cFilterForm" style={{width: 130+"px"}} 
                                            className="form-control form-control-sm" onChange={(e) => setCreatedAtTo(e.target.value)}/>
                                    </th>
                                    <th>
                                        <input type="search" form="cFilterForm" className="form-control form-control-sm"
                                            onChange={(e) => setTechnician(e.target.value)} />
                                    </th>
                                    <th>
                                        <select form="cFilterForm" className="form-select form-select-sm" 
                                            onChange={(e) => setDepartment(e.target.value)}>
                                            <option value="">{content['all']}</option>
                                            {
                                                departments.map((dept, index) => {
                                                    return <option key={index} value={dept.name}>{dept.name}</option>
                                                })
                                            }
                                        </select>
                                    </th>
                                    <th>
                                        <input type="search" form="cFilterForm" className="form-control form-control-sm"
                                            onChange={(e) => setEmployee(e.target.value)} />
                                    </th>
                                    <th></th>
                                    <th>
                                        <select form="cFilterForm" className="form-select form-select-sm" 
                                            onChange={(e) => setCategory(e.target.value)}>
                                            <option value="">{content['all']}</option>
                                            <option value="devices">{content['devices']}</option>
                                            <option value="network">{content['network']}</option>
                                            <option value="printers">{content['printers']}</option>
                                        </select>
                                    </th>
                                    <th></th>
                                    <th>
                                        <select form="cFilterForm" className="form-select form-select-sm"
                                            onChange={(e) => setStatus(e.target.value)}>
                                            <option value="">{content['all']}</option>
                                            <option value="open">{content['open']}</option>
                                            <option value="closed">{content['closed']}</option>
                                        </select>
                                    </th>
                                    <th className="fw-normal pt-0">
                                        {content['from']}
                                        <input type="date" form="cFilterForm" style={{width: 130+"px"}} 
                                            className="form-control form-control-sm" onChange={(e) => setClosedAtFrom(e.target.value)}/>
                                        {content['to']}
                                        <input type="date" form="cFilterForm" style={{width: 130+"px"}} 
                                            className="form-control form-control-sm" onChange={(e) => setClosedAtTo(e.target.value)}/>
                                    </th>
                                    <th>
                                        <input type="search" form="cFilterForm" className="form-control form-control-sm" 
                                            onChange={(e) => setClosedBy(e.target.value)} />
                                    </th>
                                    <th>
                                        <button type="button" onClick={() => customFilterTickets()} 
                                            className="btn btn-sm btn-success">{content['filter']}</button>
                                    </th>
                                    <th>
                                        <button type="reset" form="cFilterForm" className="btn btn-sm btn-secondary" 
                                            onClick={(e) => resetFilterFields(e.target.form)} >{content['reset']}</button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    filteredTickets.map((ticket, index) => {
                                        let description = ""
                                        try{
                                            description = ((ticket.description).length < 100) ? 
                                                ticket.description : (ticket.description).slice(0, 100) + "..."
                                        }catch{}
                                        
                                        if(ticket.status == "open"){
                                            return(
                                                <tr key={index}>
                                                    <td>{ticket.id}</td>
                                                    <td>{ticket['created_at']}</td>
                                                    <td >
                                                        <select className="form-control form-control-sm" 
                                                            onChange={(e) => {updateTicket(`${ticket.id}`, e.target.value)}}>
                                                            {
                                                                technicians.map((technician, index) => {
                                                                    if(technician.username == ticket.technician){
                                                                        return(
                                                                            <option key={index} value={technician.username} selected>
                                                                                {technician.username}</option>
                                                                        )
                                                                    }else{
                                                                        return(
                                                                            <option key={index} value={technician.username}>
                                                                            {technician.username}</option>
                                                                        )
                                                                    }
                                                                })
                                                            }
                                                        </select>
                                                    </td>
                                                    <td>{ticket.department}</td>
                                                    <td>{ticket.employee}</td>
                                                    <td>{ticket.phone}</td>
                                                    <td>{ticket.category}</td>
                                                    <td className="text-start" title={`${ticket.description}`}>{description}</td>
                                                    <td className="text-warning fw-bold">{ticket.status}</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td>
                                                        <div>
                                                            <button className="btn btn-sm btn-warning px-1" data-bs-toggle="modal" 
                                                                data-bs-target={`#finishTicket${ticket.id}`}
                                                                onClick={() => getTicketHistory(`${ticket.id}`)} 
                                                                style={{width: 50}}>{content['finish']}</button>
                                                        </div>
                                                        <div className="modal fade" id={`finishTicket${ticket.id}`}>
                                                            <div className="modal-dialog modal-dialog-scrollable modal-xl">
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
                                                                                    <div className="d-flex justify-content-start">
                                                                                        <label htmlFor="id" 
                                                                                            className="form-label mt-2 mb-1">
                                                                                            {content['number']}</label>
                                                                                    </div>
                                                                                    <input name="id" value={`${ticket.id}`} disabled
                                                                                        className="form-control form-control-sm" />
                                                                                </div>
                                                                                <div className="col">
                                                                                    <div className="d-flex justify-content-start">
                                                                                        <label htmlFor="created_at" 
                                                                                            className="form-label mt-2 mb-1">
                                                                                            {content['createdAt']}</label>
                                                                                    </div>
                                                                                    <input name="created_at" disabled
                                                                                        value={`${ticket['created_at']}`} 
                                                                                        className="form-control form-control-sm"  />
                                                                                </div>
                                                                                <div className="col">
                                                                                    <div className="d-flex justify-content-start">
                                                                                        <label htmlFor="phone" 
                                                                                            className="form-label mt-2 mb-1">
                                                                                            {content['phone']}</label>
                                                                                    </div>
                                                                                    <input name="phone" value={`${ticket.phone}`} 
                                                                                        className="form-control form-control-sm" disabled/>
                                                                                </div>
                                                                                <div className="col-3">
                                                                                    <div className="d-flex justify-content-start">
                                                                                        <label htmlFor="technician" 
                                                                                            className="form-label mt-2 mb-1">
                                                                                            {content['technician']}</label>
                                                                                    </div>
                                                                                    <input name="technician" 
                                                                                        value={`${ticket.technician}`} disabled
                                                                                        className="form-control form-control-sm" />
                                                                                </div>
                                                                                <div className="col-3">
                                                                                    <div className="d-flex justify-content-start">
                                                                                        <label htmlFor="employee" 
                                                                                            className="form-label mt-2 mb-1">
                                                                                            {content['employee']}</label>
                                                                                    </div>
                                                                                    <input name="employee" value={`${ticket.employee}`}
                                                                                        className="form-control form-control-sm" disabled/>
                                                                                </div>
                                                                            </div>
                                                                            <div className="row g-1">
                                                                                <div className="col">
                                                                                    <div className="d-flex justify-content-start">
                                                                                        <label htmlFor="dept" 
                                                                                            className="form-label mt-2 mb-1">
                                                                                            {content['dept']}</label>
                                                                                    </div>
                                                                                    <input name="dept" value={`${ticket.dept}`} 
                                                                                        className="form-control form-control-sm" disabled/>
                                                                                </div>
                                                                                <div className="col">
                                                                                    <div className="d-flex justify-content-start">
                                                                                        <label htmlFor="category" 
                                                                                            className="form-label mt-2 mb-1">
                                                                                            {content['category']}</label>
                                                                                    </div>
                                                                                    <input name="category" value={`${ticket.category}`} 
                                                                                        className="form-control form-control-sm" disabled/>
                                                                                </div>
                                                                            </div>
                                                                            <div className="row">
                                                                                <div className="col">
                                                                                    <div className="d-flex justify-content-start">
                                                                                        <label htmlFor="description" 
                                                                                            className="form-label mt-2 mb-1">
                                                                                            {content['description']}</label>
                                                                                    </div>
                                                                                    <textarea name="description" rows="3" disabled
                                                                                        className="form-control form-control-sm">
                                                                                        {ticket.description}</textarea>
                                                                                </div>
                                                                            </div>
                                                                            <div className="row">
                                                                                <div className="col">
                                                                                    <div className="d-flex justify-content-start">
                                                                                        <label htmlFor="comment" 
                                                                                            className="form-label mt-2 mb-1">
                                                                                            {content['comment']}</label>
                                                                                    </div>
                                                                                    <textarea name="comment" rows="3" 
                                                                                        className="form-control" required
                                                                                        onChange={(e) => setComment(e.target.value)}>
                                                                                    </textarea>
                                                                                </div>
                                                                            </div>
                                                                            <div className="row mt-2">
                                                                                <div className="col d-flex justify-content-end">
                                                                                    <button type="submit" 
                                                                                        className="btn btn-sm btn-warning" 
                                                                                        onClick={(e) => {
                                                                                            finishTicket(e.target.form, `${ticket.id}`)}}>
                                                                                        {content['finish']}</button>
                                                                                </div>
                                                                            </div>
                                                                        </form>
                                                                        <div>
                                                                            <hr className="mt-2 mb-1"/>  
                                                                            <div className="d-flex justify-content-start">
                                                                                <h4 className="my-2">{content['history']}</h4>
                                                                            </div>
                                                                            <div className="d-flex justify-content-start">
                                                                                <p className="mb-1">{content['createdAt']} </p>
                                                                                <p className="mx-2">{ticket['created_at']}</p>
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
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                            
                                        }else if(ticket.status == "closed"){
                                            let description = ""
                                            let comment = ""
                                            try{
                                                description = ((ticket.description).length < 100) ? 
                                                    ticket.description : (ticket.description).slice(0, 100) + "..."
                                                comment = ((ticket.comment).length < 100) ? 
                                                    ticket.comment : (ticket.comment).slice(0, 100) + "..."
                                            }catch{}

                                            return (
                                                <tr key={index}>
                                                    <td>{ticket.id}</td>
                                                    <td>{ticket['created_at']}</td>
                                                    <td>{ticket.technician}</td>
                                                    <td>{ticket.department}</td>
                                                    <td>{ticket.employee}</td>
                                                    <td>{ticket.phone}</td>
                                                    <td>{ticket.category}</td>
                                                    <td className="text-start" title={`${ticket.description}`}>{description}</td>
                                                    <td className="fw-bold" style={{color: "#333399"}}>{ticket.status}</td>
                                                    <td>{ticket['closed_at']}</td>
                                                    <td>{ticket['closed_by']}</td>
                                                    <td title={`${ticket.comment}`}>{comment}</td>
                                                    <td>
                                                        <div id={`loadTicket${ticket.id}`}>
                                                            <button className="btn btn-sm btn-light border-0" data-bs-toggle="modal" 
                                                                data-bs-target={`#viewTicket${ticket.id}`}
                                                                style={{backgroundColor: "#333399", color: "white", width: 50}}
                                                                onClick={() => getTicketHistory(`${ticket.id}`)}>
                                                                {content['view']}</button>
                                                        </div>
                                                        <div className="modal fade" id={`viewTicket${ticket.id}`}>
                                                            <div className="modal-dialog modal-dialog-scrollable modal-xl">
                                                                <div className="modal-content">
                                                                    <div className="modal-header" style={{height: 45+"px"}}>
                                                                        <h4 className="modal-title">{content['ticketInfo']}</h4>
                                                                        <button id={`ticket-close${ticket.id}`} className="btn-close"
                                                                            data-bs-dismiss="modal"></button>
                                                                    </div>
                                                                    
                                                                    <div className="modal-body text-start pt-0">
                                                                        <form>
                                                                            <div className="row g-1">
                                                                                <div className="col">
                                                                                    <div className="d-flex justify-content-start">
                                                                                        <label htmlFor="id" 
                                                                                            className="form-label mt-2 mb-1">
                                                                                            {content['number']}</label>
                                                                                    </div>
                                                                                    <input name="id" value={`${ticket.id}`} 
                                                                                        className="form-control form-control-sm" disabled/>
                                                                                </div>
                                                                                <div className="col">
                                                                                    <div className="d-flex justify-content-start">
                                                                                        <label htmlFor="created_at" 
                                                                                            className="form-label mt-2 mb-1">
                                                                                            {content['createdAt']}</label>
                                                                                    </div>
                                                                                    <input name="created_at" 
                                                                                        value={`${ticket['created_at']}`} disabled
                                                                                        className="form-control form-control-sm" />
                                                                                </div>
                                                                                <div className="col-3">
                                                                                    <div className="d-flex justify-content-start">
                                                                                        <label htmlFor="technician" 
                                                                                            className="form-label mt-2 mb-1">
                                                                                            {content['technician']}</label>
                                                                                    </div>
                                                                                    <input name="technician" 
                                                                                        value={`${ticket.technician}`} disabled
                                                                                        className="form-control form-control-sm" />
                                                                                </div>
                                                                                <div className="col-3">
                                                                                    <div className="d-flex justify-content-start">
                                                                                        <label htmlFor="employee" 
                                                                                            className="form-label mt-2 mb-1">
                                                                                            {content['employee']}</label>
                                                                                    </div>
                                                                                    <input name="employee" value={`${ticket.employee}`} 
                                                                                        className="form-control form-control-sm" disabled/>
                                                                                </div>
                                                                                <div className="col">
                                                                                    <div className="d-flex justify-content-start">
                                                                                        <label htmlFor="phone" 
                                                                                            className="form-label mt-2 mb-1">
                                                                                            {content['phone']}</label>
                                                                                    </div>
                                                                                    <input name="phone" value={`${ticket.phone}`} 
                                                                                        className="form-control form-control-sm" disabled/>
                                                                                </div>
                                                                            </div>
                                                                            <div className="row g-1">
                                                                                <div className="col-3">
                                                                                    <div className="d-flex justify-content-start">
                                                                                        <label htmlFor="dept" 
                                                                                            className="form-label mt-2 mb-1">
                                                                                            {content['dept']}</label>
                                                                                    </div>
                                                                                    <input name="dept" value={`${ticket.dept}`} 
                                                                                        className="form-control form-control-sm" disabled/>
                                                                                </div>
                                                                                <div className="col">
                                                                                    <div className="d-flex justify-content-start">
                                                                                        <label htmlFor="category" 
                                                                                            className="form-label mt-2 mb-1">
                                                                                            {content['category']}</label>
                                                                                    </div>
                                                                                    <input name="category" value={`${ticket.category}`} 
                                                                                        className="form-control form-control-sm" disabled/>
                                                                                </div>
                                                                                <div className="col">
                                                                                    <div className="d-flex justify-content-start">
                                                                                        <label htmlFor="status" 
                                                                                            className="form-label mt-2 mb-1">
                                                                                            {content['status']}</label>
                                                                                    </div>
                                                                                    <input value={`${ticket.status}`} name="status" 
                                                                                        className="form-control form-control-sm" disabled/>
                                                                                </div>
                                                                                <div className="col">
                                                                                    <div className="d-flex justify-content-start">
                                                                                         <label htmlFor="closed_at" 
                                                                                            className="form-label mt-2 mb-1">
                                                                                            {content['closedAt']}</label>
                                                                                    </div>
                                                                                    <input name="closed_at" 
                                                                                        value={`${ticket['closed_at']}`} disabled 
                                                                                        className="form-control form-control-sm" />
                                                                                </div>
                                                                                <div className="col-3">
                                                                                    <div className="d-flex justify-content-start">
                                                                                        <label htmlFor="closedBy" 
                                                                                            className="form-label mt-2 mb-1">
                                                                                            {content['closedBy']}</label>
                                                                                    </div>
                                                                                    <input name="closedBy" 
                                                                                        value={`${ticket['closed_by']}`} disabled
                                                                                        className="form-control form-control-sm" />
                                                                                </div>
                                                                            </div>
                                                                            <div className="row">
                                                                                <div className="col">
                                                                                    <div className="d-flex justify-content-start">
                                                                                        <label htmlFor="description"
                                                                                            className="form-label mt-2 mb-1">
                                                                                            {content['description']}</label> 
                                                                                    </div>
                                                                                    <textarea name="description" rows="3" 
                                                                                        className="form-control form-control-sm" 
                                                                                        disabled readOnly>{ticket.description}</textarea>
                                                                                </div>
                                                                            </div>
                                                                            <div className="row">
                                                                                <div className="col">
                                                                                    <div className="d-flex justify-content-start">
                                                                                        <label htmlFor="comment" 
                                                                                            className="form-label mt-2 mb-1">
                                                                                            {content['comment']}</label>
                                                                                    </div>
                                                                                    <textarea name="comment" rows="3" 
                                                                                        className="form-control" disabled readOnly>
                                                                                        {ticket.comment}</textarea>
                                                                                </div>
                                                                            </div>
                                                                            <div className="row mt-2">
                                                                                <div className="col d-flex justify-content-end">
                                                                                    <button type="button" data-bs-dismiss="modal" 
                                                                                        className="btn btn-sm btn-light"  
                                                                                    style={{backgroundColor: "#333399", color: "white", 
                                                                                    width: 80+"px"}} onClick={() => {
                                                                                        openTicket(`${ticket.id}`)}}>
                                                                                    {content['reOpen']}</button>
                                                                                </div>
                                                                            </div>
                                                                        </form>
                                                                        <div>
                                                                            <hr className="mt-2 mb-1"/>  
                                                                            <div className="d-flex justify-content-start">
                                                                                <h4 className="my-2">{content['history']}</h4>
                                                                            </div>
                                                                            <div className="d-flex justify-content-start">
                                                                                <p className="mb-1">{content['createdAt']} </p>
                                                                                <p className="mx-2">{ticket['created_at']}</p>
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


export {TicketsList}