// Save retrieved ticket to this variable
let tickets = ""

// Add additional elements to admin's navbar
document.getElementById("adminNavbar").innerHTML = 
    `
    <a class="text-decoration-none text-light fw-bold pe-2" href="technicians_list">Technicians</a>
    <a class="text-decoration-none text-light fw-bold pe-2" href="employees_list">Employees</a>
    <a class="text-decoration-none text-light fw-bold pe-2" href="companies_list">Companies</a>
    `

// Prevent forms to be submitted
function preventSubmit(event){
    event.preventDefault()
}


// Show temporary passwords of technicians and employees in their tables
function showPassword(element, event){
    event.target.outerHTML = `<button class="btn badge text-dark btn-outline-secondary px-1" onclick="hidePassword('${element}', event)">Hide</button>`
    document.getElementById(element).style.display = "block"

}


// Hide temporary passwords of technicians and employees in their tables
function hidePassword(element, event){
    event.target.outerHTML = `<button class="btn badge text-dark btn-outline-secondary px-1" onclick="showPassword('${element}', event)">Show</button>`
    document.getElementById(element).style.display = "none"
}


// Enable disabled input fields
function enableField(event){
    let id = event.target.nextElementSibling.nextElementSibling.id
    if(event.target.checked){
        document.getElementById(id).removeAttribute('disabled')
    }else{
        document.getElementById(id).setAttribute('disabled', 'true')
    }
}




// #    Tickets functions    # //


// Represent tickets in tables based on their statuses
function representTickets(data){
    
    let node = ``;
    
    if(data.tickets != ""){
        data.tickets.forEach((ticket) => {
            let technicians = ""

            data.technicians.forEach((technician) => {
                if(technician.username == ticket.technician){
                    technicians += `<option value=${technician.username} selected>${technician.username}</option>`
                }else{
                    technicians += `<option value=${technician.username}>${technician.username}</option>`
                }
            })
            let description = ""
            try{
                description = ((ticket.description).length < 100) ? ticket.description : (ticket.description).slice(0, 100) + "..."
            }catch{}
            
            if(ticket.status == "open"){
                node += `
                    <tr id="loadTicket${ticket.id}">
                        <td>${ticket.id}</td>
                        <td>${ticket["created_at"]}</td>
                        <td>
                            <select class="form-control form-control-sm" onchange="updateTicket('${ticket.id}', event.target.value)">
                                ${technicians}
                            </select>
                        </td>
                        <td>${ticket.company}</td>
                        <td>${ticket.employee}</td>
                        <td>${ticket.phone}</td>
                        <td>${ticket.category}</td>
                        <td class="text-start" title="${ticket.description}">${description}</td>
                        <td class="text-success fw-bold">${ticket.status}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>
                            <div >
                                <button class="btn btn-sm btn-info" data-bs-toggle="modal" data-bs-target="#finishTicket${ticket.id}"
                                    onclick="getTicketHistory('${ticket.id}')">Finish</button>
                            </div>
                            <div class="modal fade" id="finishTicket${ticket.id}">
                                <div class="modal-dialog modal-dialog-scrollable modal-xl">
                                    <div class="modal-content">
                                        <div class="modal-header" style="height: 45px">
                                            <h4 class="modal-title">Ticket info</h4>
                                            <button id="ticket-close${ticket.id}" class="btn-close" data-bs-dismiss="modal"></button>
                                        </div>
                                        
                                        <div class="modal-body text-start pt-0">
                                            <form onsubmit="preventSubmit(event)">
                                                <div class="row g-1">
                                                    <div class="col">
                                                        <label for="id" class="form-label mt-2 mb-1">Number</label>
                                                        <input type="text" name="id" value="${ticket.id}" class="form-control form-control-sm" disabled />
                                                    </div>
                                                    <div class="col">
                                                        <label for="created_at" class="form-label mt-2 mb-1">Created at</label>
                                                        <input type="text" name="created_at" value="${ticket['created_at']}" class="form-control form-control-sm" disabled />
                                                    </div>
                                                    <div class="col">
                                                        <label for="phone" class="form-label mt-2 mb-1">Phone</label>
                                                        <input type="text" name="phone" value="${ticket.phone}" class="form-control form-control-sm" disabled />
                                                    </div>
                                                    <div class="col-3">
                                                        <label for="technician" class="form-label mt-2 mb-1">Technician</label>
                                                        <input type="text" name="technician" value="${ticket.technician}" class="form-control form-control-sm" disabled />
                                                    </div>
                                                    <div class="col-3">
                                                        <label for="employee" class="form-label mt-2 mb-1">Employee</label>
                                                        <input type="text" name="employee" value="${ticket.employee}" class="form-control form-control-sm" disabled />
                                                    </div>
                                                </div>
                                                <div class="row g-1">
                                                    <div class="col">
                                                        <label for="company" class="form-label mt-2 mb-1">Comapny</label>
                                                        <input type="text" name="company" value="${ticket.company}" class="form-control form-control-sm" disabled />
                                                    </div>
                                                    <div class="col">
                                                        <label for="category" class="form-label mt-2 mb-1">Category</label>
                                                        <input type="text" name="category" value="${ticket.category}" class="form-control form-control-sm" disabled />
                                                    </div>
                                                </div>
                                                <div class="row">
                                                    <div class="col">
                                                        <label for="description" class="form-label mt-2 mb-1">Description</label>
                                                        <textarea name="description" rows="3" class="form-control form-control-sm" disabled>${ticket.description}</textarea>
                                                    </div>
                                                <div>
                                                <div class="row">
                                                    <div class="col">
                                                        <label for="comment" class="form-label mt-2 mb-1">Comment</label>
                                                        <textarea id="comment${ticket.id}" name="comment" rows="3" class="form-control" required></textarea>
                                                    </div>
                                                </div>
                                                <div class="row mt-2">
                                                    <div class="col d-flex justify-content-end">
                                                        <button type="submit" class="btn btn-sm btn-dark" onclick="finishTicket('${ticket.id}')">Finish</button>
                                                    </div>
                                                </div>
                                            </form>
                                            <div>
                                                <hr class="mt-2 mb-1"/>  
                                                <h4 class="my-2">History</h4>
                                                <p class="mb-1">Created at ${ticket["created_at"]}</p>
                                                <div>
                                                    <table class="table table-warning table-sm table-striped table-hover text-center">
                                                        <thead class="sticky-top">
                                                            <tr>
                                                                <th>Update type</th>
                                                                <th>Update value</th>
                                                                <th>Updated By</th>
                                                                <th>Updated at</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody id="historyTicket${ticket.id}">
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </td>
                        
                    </tr>\n
                `
                
            }else if(ticket.status == "closed"){
                let description = ""
                let comment = ""
                try{
                    description = ((ticket.description).length < 100) ? ticket.description : (ticket.description).slice(0, 100) + "..."
                    comment = ((ticket.comment).length < 100) ? ticket.comment : (ticket.comment).slice(0, 100) + "..."
                }catch{}
                node += `
                <tr>
                <td>${ticket.id}</td>
                <td>${ticket["created_at"]}</td>
                <td>${ticket.technician}</td>
                <td>${ticket.company}</td>
                <td>${ticket.employee}</td>
                <td>${ticket.phone}</td>
                <td>${ticket.category}</td>
                <td class="text-start" title="${ticket.description}">${description}</td>
                <td class="text-danger fw-bold">${ticket.status}</td>
                <td>${ticket["closed_at"]}</td>
                <td>${ticket['closed_by']}</td>
                <td title="${ticket.comment}">${comment}</td>
                <td>
                    <div id="loadTicket${ticket.id}">
                        <button class="btn btn-sm btn-info" data-bs-toggle="modal" data-bs-target="#viewTicket${ticket.id}"
                            onclick="getTicketHistory('${ticket.id}')">View</button>
                    </div>
                    <div class="modal fade" id="viewTicket${ticket.id}">
                        <div class="modal-dialog modal-dialog-scrollable modal-xl">
                            <div class="modal-content">
                                <div class="modal-header" style="height: 45px">
                                    <h4 class="modal-title">Ticket info</h4>
                                    <button id="ticket-close${ticket.id}" class="btn-close" data-bs-dismiss="modal"></button>
                                </div>
                                
                                <div class="modal-body text-start pt-0">
                                    <form>
                                        <div class="row g-1">
                                            <div class="col">
                                                <label for="id" class="form-label mt-2 mb-1">Number</label>
                                                <input type="text" name="id" value="${ticket.id}" class="form-control form-control-sm" disabled />
                                            </div>
                                            <div class="col">
                                                <label for="created_at" class="form-label mt-2 mb-1">Created at</label>
                                                <input type="text" name="created_at" value="${ticket['created_at']}" class="form-control form-control-sm" disabled />
                                            </div>
                                            <div class="col-3">
                                                <label for="technician" class="form-label mt-2 mb-1">Technician</label>
                                                <input type="text" name="technician" value="${ticket.technician}" class="form-control form-control-sm" disabled />
                                            </div>
                                            <div class="col-3">
                                                <label for="employee" class="form-label mt-2 mb-1">Employee</label>
                                                <input type="text" name="employee" value="${ticket.employee}" class="form-control form-control-sm" disabled />
                                            </div>
                                            <div class="col">
                                                <label for="phone" class="form-label mt-2 mb-1">Phone</label>
                                                <input type="text" name="phone" value="${ticket.phone}" class="form-control form-control-sm" disabled />
                                            </div>
                                        </div>
                                        <div class="row g-1">
                                            
                                            <div class="col-3">
                                                <label for="company" class="form-label mt-2 mb-1">Comapny</label>
                                                <input type="text" name="company" value="${ticket.company}" class="form-control form-control-sm" disabled />
                                            </div>
                                            <div class="col">
                                                <label for="category" class="form-label mt-2 mb-1">Category</label>
                                                <input type="text" name="category" value="${ticket.category}" class="form-control form-control-sm" disabled />
                                            </div>
                                            <div class="col">
                                                <label for="status" class="form-label mt-2 mb-1">Status</label>
                                                <input type="text" value="${ticket.status}" name="status" class="form-control form-control-sm" disabled>
                                            </div>
                                            <div class="col">
                                                <label for="closed_at" class="form-label mt-2 mb-1">Closed at</label>
                                                <input type="text" name="closed_at" value="${ticket['closed_at']}" class="form-control form-control-sm" disabled />
                                            </div>
                                            <div class="col-3">
                                                <label for="closedBy" class="form-label mt-2 mb-1">Closed By</label>
                                                <input type="text" name="closedBy" value="${ticket['closed_by']}" class="form-control form-control-sm" disabled />
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col">
                                                <label for="description" class="form-label mt-2 mb-1">Description</label>
                                                <textarea name="description" rows="4" class="form-control form-control-sm" disabled readonly>${ticket.description}</textarea>
                                            </div>
                                        <div>
                                        <div class="row">
                                            <div class="col">
                                                <label for="comment" class="form-label mt-2 mb-1">Comment</label>
                                                <textarea name="comment" rows="4" class="form-control" disabled readonly>${ticket.comment}</textarea>
                                            </div>
                                        </div>
                                        <div class="row mt-2">
                                            <div class="col d-flex justify-content-end">
                                                <button type="button" data-bs-dismiss="modal" class="btn btn-sm btn-dark"  
                                                    onclick="openTicket('${ticket.id}')">Re-Open</button>
                                            </div>
                                        </div>
                                    </form>
                                    <div>
                                        <hr class="mt-2 mb-1"/>  
                                        <h4 class="my-2">History</h4>
                                        <p class="mb-1">Created at ${ticket["created_at"]}</p>
                                        <div>
                                            <table class="table table-warning table-sm table-striped table-hover text-center">
                                                <thead class="sticky-top">
                                                    <tr>
                                                        <th>Update type</th>
                                                        <th>Update value</th>
                                                        <th>Updated By</th>
                                                        <th>Updated at</th>
                                                    </tr>
                                                </thead>
                                                <tbody id="historyTicket${ticket.id}">
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </td>
            </tr>\n
                `
            }
            
        })
        document.getElementById("ticketsList").innerHTML = node
        
    }else{
        document.getElementById("ticketsList").innerHTML = ""
    }
}


// Retrieve today's tickets from the server
function getTickets(){
    fetch("/tickets")
    .then(res => res.json())
    .then(data => {
        tickets = data
        let openedTickets = 0
        let closedTickets = 0
        let date = new Date()

        document.getElementById("ticketsOf").innerHTML = `Tickets of ${date.getFullYear()}-${date.getMonth()+1}: `
        document.getElementById("ticketsTotal").innerHTML = data.tickets.length
        data.tickets.forEach((ticket) => {
            if(ticket.status == "open"){
                openedTickets += 1
            }else{
                closedTickets += 1
            }
        })
        document.getElementById("openedTicketsTotal").innerHTML = openedTickets
        document.getElementById("closedTicketsTotal").innerHTML = closedTickets
        representTickets(data)
    })
}


// Retrieve current year tickets from the server
function getTicketsAll(){
    fetch("/tickets/tickets_all")
    .then(res => res.json())
    .then(data => {
        tickets = data
        let openedTickets = 0
        let closedTickets = 0
        let date = new Date()
        let node = ``

        data.years.forEach((year) => {
            if(year.year == date.getFullYear()){
                node += `<option value="${year.year}" selected>${year.year}</option>`
            }else{
                node += `<option value="${year.year}">${year.year}</option>`
            }
        })

        document.getElementById("ticketsYears").innerHTML = node
        document.getElementById("ticketsOf").innerHTML = `Tickets of `
        document.getElementById("ticketsTotal").innerHTML = data.tickets.length
        data.tickets.forEach((ticket) => {
            if(ticket.status == "open"){
                openedTickets += 1
            }else{
                closedTickets += 1
            }
        })
        document.getElementById("openedTicketsTotal").innerHTML = openedTickets
        document.getElementById("closedTicketsTotal").innerHTML = closedTickets
        representTickets(data)
    })
}


// Retrieve specific year tickets from the server
function getTicketsAllSpecific(selected_year){
    fetch(`/tickets/tickets_all/?year=${selected_year}`)
    .then(res => res.json())
    .then(data => {
        tickets = data
        let openedTickets = 0
        let closedTickets = 0
        let date = new Date()
        let node = ``
        
        data.years.forEach((year) => {
            if(year.year == selected_year){
                node += `<option value="${year.year}" selected>${year.year}</option>`
            }else{
                node += `<option value="${year.year}">${year.year}</option>`
            }    
        })

        document.getElementById("ticketsYears").innerHTML = node
        document.getElementById("ticketsOf").innerHTML = `Tickets of `
        document.getElementById("ticketsTotal").innerHTML = data.tickets.length
        data.tickets.forEach((ticket) => {
            if(ticket.status == "open"){
                openedTickets += 1
            }else{
                closedTickets += 1
            }
        })
        document.getElementById("openedTicketsTotal").innerHTML = openedTickets
        document.getElementById("closedTicketsTotal").innerHTML = closedTickets
        representTickets(data)
    })
}


// Retrieve ticket updates history
function getTicketHistory(ticket){
    fetch(`/tickets/history/?id=${ticket}`)
    .then(res => res.json())
    .then(history => {
        let node = ``

        history.forEach((item) => {
            node += `
                <tr>
                    <td>${item["update_type"]}</td>
                    <td>${item["update_value"]}</td>
                    <td>${item["updated_by"]}</td>
                    <td>${item["updated_at"]}</td>
                </tr>
            `
        })

        document.getElementById(`historyTicket${ticket}`).innerHTML = node
    })
}


// Fileter tickets based on single parameter
function filterTickets(field, value){
    let filtered = {technicians: tickets.technicians, tickets: []}
    let openedTickets = 0
    let closedTickets = 0
    
    if(tickets.tickets){
        (tickets.tickets).forEach((ticket) => {
            let reqexp = new RegExp(value)

            if(String(ticket[field]).search(reqexp) != -1){
                filtered.tickets.push(ticket)
            }
        })

        document.getElementById("ticketsTotal").innerHTML = filtered.tickets.length
        filtered.tickets.forEach((ticket) => {
            if(ticket.status == "open"){
                openedTickets += 1
            }else{
                closedTickets += 1
            }
        })
        document.getElementById("openedTicketsTotal").innerHTML = openedTickets
        document.getElementById("closedTicketsTotal").innerHTML = closedTickets
        representTickets(filtered)
    }
}


// Fileter tickets based on multiple parameter all at once
function customFilterTickets(){
    let filtered = {technicians: tickets.technicians, tickets: []}
    let created_at_from = document.getElementById("cfilterCreatedAt1").value + " 00:00:00"
    let created_at_to = document.getElementById("cfilterCreatedAt2").value + " 23:59:59"
    let closed_at = document.getElementById("cfilterClosedAt").value
    let technician = document.getElementById("cfilterTechnician").value
    let company = document.getElementById("cfilterCompany").value
    let employee = document.getElementById("cfilterEmployee").value
    let category = document.getElementById("cfilterCategory").value
    let status = document.getElementById("cfilterStatus").value
    let closed_by = document.getElementById("cfilterClosedBy").value
    let openedTickets = 0
    let closedTickets = 0
    
    if(tickets.tickets){
        (tickets.tickets).forEach((ticket) => {
            if(

                String(ticket["created_at"]) >= created_at_from && String(ticket["created_at"]) <= created_at_to
                && String(ticket["closed_at"]).search(closed_at) != -1 &&
                String(ticket["technician"]).search(technician) != -1 && String(ticket["company"]).search(company) != -1 && 
                String(ticket["employee"]).search(employee) != -1 && String(ticket["category"]).search(category) != -1 && 
                String(ticket["status"]).search(status) != -1 && String(ticket["closed_by"]).search(closed_by) != -1

                // String(ticket["created_at"]).search(created_at_from) != -1 && String(ticket["closed_at"]).search(closed_at) != -1 &&
                // String(ticket["technician"]).search(technician) != -1 && String(ticket["company"]).search(company) != -1 && 
                // String(ticket["employee"]).search(employee) != -1 && String(ticket["category"]).search(category) != -1 && 
                // String(ticket["status"]).search(status) != -1 && String(ticket["closed_by"]).search(closed_by) != -1
            ){

                filtered.tickets.push(ticket)
            }
        })
        
        document.getElementById("ticketsTotal").innerHTML = filtered.tickets.length
        filtered.tickets.forEach((ticket) => {
            if(ticket.status == "open"){
                openedTickets += 1
            }else{
                closedTickets += 1
            }
        })
        document.getElementById("openedTicketsTotal").innerHTML = openedTickets
        document.getElementById("closedTicketsTotal").innerHTML = closedTickets
        representTickets(filtered)
    }
}


// Update the technician of a ticket
function updateTicket(ticket, technician){
    fetch("/tickets", {"method": "PUT", "headers": {"content-Type": "application/x-www-form-urlencoded"},
        "body": `ticket=${ticket}&technician=${technician}`})
    
    document.getElementById(`ticket-close${ticket}`).click()
    document.getElementById(`loadTicket${ticket}`).innerHTML = "<td colspan='13'><span class='spinner-border'></span></td>"
    setTimeout(() => {getTickets()}, 1500)
    
}


// Finish and close a ticket
function finishTicket(ticket){
    let comment = document.getElementById(`comment${ticket}`)

    if(comment.checkValidity()){
        fetch("/tickets/finish", {"method": "PUT", "headers": {"content-Type": "application/x-www-form-urlencoded"},
            "body": `ticket=${ticket}&comment=${comment.value}`})

        document.getElementById(`ticket-close${ticket}`).click()
        document.getElementById(`loadTicket${ticket}`).innerHTML = "<div class='spinner-border text-center'></div>"
        setTimeout(() => { getTickets() }, 1500)
    }
}


// Re-open a closed ticket
function openTicket(ticket){
    fetch("/tickets/open", {"method": "PUT", "headers": {"content-Type": "application/x-www-form-urlencoded"},
        "body": `ticket=${ticket}`})

    document.getElementById(`ticket-close${ticket}`).click()
    document.getElementById(`loadTicket${ticket}`).innerHTML = "<div class='spinner-border text-center'></div>"
    setTimeout(() => {getTickets()}, 1500)
}


// Retrieve technicians list from the server and represent it in the table
function getTechnicians(){
    fetch("/technicians/get")
    .then(res => res.json())
    .then(data => {
        if(data.status){
            let node = ""; 

            data.technicians.forEach((technician) => {
                let companies = "";
                data.companies.forEach((company) => {
                    if((technician.company).includes(company.name)){
                        companies += `<option value=${company.name} selected>${company.name}</option>`
                    }else{
                        companies += `<option value=${company.name}>${company.name}</option>`
                    }
                })
                
                node += `
                    <tr id="loadTech${technician.username}">
                        <td>${technician.username}</td>
                        <td>${technician.name}</td>
                        <td>
                            <button class="btn badge text-dark btn-outline-secondary px-1" onclick="showPassword('password${technician.username}', event)">Show</button>
                            <span id="password${technician.username}" style="display: none">${technician.password}</span>
                        </td>
                        <td>${technician.role}</td>
                        <td>${technician.company}</td>
                        <td>
                            <button class="btn btn-sm btn-warning" data-bs-toggle="modal" data-bs-target="#viewTechnician${technician.username}" 
                                onclick="getTechHistory('${technician.username}')">View</button>
                            <div class="modal fade text-start" id="viewTechnician${technician.username}">
                                <div class="modal-dialog modal-dialog-scrollable modal-lg pt-0">
                                    <div class="modal-content">
                                        <div class="modal-header py-3">
                                            <button id="edit-tech-close${technician.username}" class="btn-close" data-bs-dismiss="modal"></button>
                                        </div>
                                        <div class="modal-body pt-0">
                                            <h5 class="mt-3">Edit</h5>
                                            <form id="form${technician.username}" onsubmit="preventSubmit(event)">
                                                <div class="row g-1">
                                                    <div class="col pt-2">
                                                        <label for="username" class="form-label mb-1">Username</label>
                                                        <input id="editUsername${technician.username}" name="username" type="text" class="form-control form-control-sm" 
                                                            value=${technician.username} readonly required />
                                                    </div>
                                                    <div class="col">
                                                        <input type="checkbox" class="form-check-input align-middle mb-1 me-1" onclick="enableField(event)" />
                                                        <label for="name" class="form-label mt-2 mb-1">Name</label>
                                                        <input id="editName${technician.username}" name="name" type="text" class="form-control form-control-sm" 
                                                            value=${technician.name} pattern="[A-z0-9]+" title="Only characters, numbers and underscores" required disabled/>
                                                    </div>
                                                    <div class="col">
                                                        <input type="checkbox" class="form-check-input align-middle mb-1 me-1" onclick="enableField(event)" />
                                                        <label for="role" class="form-label mt-2 mb-1">Role</label>
                                                        <select id="editRole${technician.username}" name="role" class="form-select form-select-sm" required disabled>
                                                            <option value="${technician.role}" selected>${technician.role}</option>
                                                            <option value="user">user</optin>
                                                            <option value="admin">admin</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div class="row">
                                                    <div class="col-12">
                                                        <input type="checkbox" class="form-check-input align-middle mb-1 me-1" onclick="enableField(event)" />
                                                        <label for="company" class="form-label mt-2 mb-1">Company</label>
                                                        <select id="editCompany${technician.username}" name="company" class="form-select form-select-sm" style="height: 80px" multiple required disabled>
                                                            ${companies}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div class="d-flex justify-content-end mt-2 mb-3">
                                                    <input type="submit" value="Edit" class="btn btn-sm btn-primary" onclick="editTechnician('${technician.username}')"/>
                                                </div>
                                            </form>
                                            <hr class="my-1"/>
                                            <h5 class="my-2">History</h5>
                                            <p class="mb-1">Created at ${technician["created_at"]}</p>
                                            <div>
                                                <table class="table table-warning table-sm table-striped table-hover text-center">
                                                    <thead class="sticky-top">
                                                        <tr>
                                                            <th>Update type</th>
                                                            <th>Update value</th>
                                                            <th>Updated By</th>
                                                            <th>Updated at</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody id="history${technician.username}">
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-danger" data-bs-toggle="modal" data-bs-target="#deleteTechnician${technician.username}">Delete</button>
                            <div class="modal fade" id="deleteTechnician${technician.username}">
                                <div class="modal-dialog modal-dialog-centered" style="width: 300px">
                                    <div class="modal-content border-2 border-secondary">
                                        <div class="modal-header" style="">
                                            <h5 class="modal-title mx-auto">Delete ${technician.username} ?</h5>
                                        </div>
                                        <div class="modal-body pt-2">
                                            
                                            <div class="container d-flex justify-content-center mt-4">
                                                <button  id="delete-close${technician.username}" class="btn btn-sm btn-dark me-5" data-bs-dismiss="modal">Cancel</button>
                                                <button class="btn btn-sm btn-danger" onclick="deleteTechnician('${technician.username}')">Delete</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>`
            })

            document.getElementById("techniciansList").innerHTML = node
        }
    })
}


// Retrieve technician updates history 
function getTechHistory(technician){
    fetch(`/technicians/history/?username=${technician}`)
    .then(res => res.json())
    .then(history => {
        let node = ``

        history.forEach((item) => {
            node += `
                <tr>
                    <td>${item["update_type"]}</td>
                    <td>${item["update_value"]}</td>
                    <td>${item["updated_by"]}</td>
                    <td>${item["updated_at"]}</td>
                </tr>
            `
        })

        document.getElementById(`history${technician}`).innerHTML = node
    })
}


// Add a new technician
function addTechnician(event){
    let username = document.getElementById("addTechUsername")
    let name = document.getElementById("addTechName")
    let role = document.getElementById("addTechRole")
    let company = document.getElementById("addTechCompany")
    let companies = document.getElementById("addTechCompany").options
    let companiesList = []
    for(let choice in companies){
        if (companies[choice].selected) companiesList.push(` ${companies[choice].value}`)
    }

    if(username.checkValidity() && name.checkValidity() && role.checkValidity() && company.checkValidity()){
        fetch("/technicians", {"method": "POST", "headers": {"content-Type": "application/x-www-form-urlencoded"},
            "body": `username=${username.value}&name=${name.value}&role=${role.value}&company=${companiesList}`})
        .then(res => res.json())
        .then(data => {

            if(data.status){
                document.getElementById("add-tech-close").click()
                event.target.parentNode.parentNode.reset()
                getTechnicians()
            }else{
                document.getElementById("addTechMsg").innerHTML = "Entered username is already used, choose another one"
            }
        })
    }
}


// Edit and update a technician information
function editTechnician(technician){
    let form = document.getElementById(`form${technician}`)
    let name = (document.getElementById(`editName${technician}`).disabled) ? "" : document.getElementById(`editName${technician}`).value
    let role = (document.getElementById(`editRole${technician}`).disabled) ? "" : document.getElementById(`editRole${technician}`).value
    let companies = (document.getElementById(`editCompany${technician}`).disabled) ? "" : document.getElementById(`editCompany${technician}`).options
    let companiesList = []
    if(companies) { 
        for(let choice in companies) { if(companies[choice].selected) companiesList.push(companies[choice].value)}
    }

    if(form.checkValidity()){
        fetch("/technicians", {"method": "PUT", "headers": {"content-Type": "application/x-www-form-urlencoded"},
            "body": `username=${technician}&name=${name}&role=${role}&company=${companiesList}`})

        document.getElementById(`edit-tech-close${technician}`).click()
        document.getElementById(`loadTech${technician}`).innerHTML = "<td colspan='7'><span class='spinner-border'></span></td>"
        setTimeout(()=>{getTechnicians()}, 1500)
    }   
}


// Delete a technician
function deleteTechnician(technician){        
    fetch("/technicians", {"method": "DELETE", "headers": {"content-Type": "application/x-www-form-urlencoded"},
        "body": `username=${technician}`})

    document.getElementById(`delete-close${technician}`).click()
    document.getElementById(`loadTech${technician}`).innerHTML = "<td colspan='7'><span class='spinner-border'></span></td>"
    setTimeout(()=>{getTechnicians()}, 1500)
}




// #    Employees functions    # //


// Retrieve employees list from the server and represent it in the table
function getEmployees(){
    fetch("/employees/get")
    .then(res => res.json())
    .then(data => {
        if(data.status){
            let node = ""; 
            
            data.employees.forEach((employee) => {
                let companies = "";
                data.companies.forEach((company) => {
                    if(company.name == employee.company){
                        companies += `<option value=${company.name} selected>${company.name}</option>`
                    }else{
                        companies += `<option value=${company.name}>${company.name}</option>`
                    }
                })

                node += `
                    <tr id="loadTech${employee.username}">
                        <td>${employee.username}</td>
                        <td>${employee.name}</td>
                        <td>
                            <button class="btn badge text-dark btn-outline-secondary px-1" onclick="showPassword('password${employee.username}', event)">Show</button>
                            <span id="password${employee.username}" style="display: none">${employee.password}</span>
                        </td>
                        <td>${employee.company}</td>
                        <td>
                            <button class="btn btn-sm btn-warning" data-bs-toggle="modal" data-bs-target="#viewEmployee${employee.username}"
                                onclick="getEmpHistory('${employee.username}')">View</button>
                            <div class="modal fade text-start" id="viewEmployee${employee.username}">
                                <div class="modal-dialog modal-dialog-scrollable modal-lg pt-0">
                                    <div class="modal-content">
                                        <div class="modal-header py-3">
                                            <button id="edit-emp-close${employee.username}" class="btn-close" data-bs-dismiss="modal"></button>
                                        </div>
                                        <div class="modal-body pt-0">
                                            <h5 class="mt-3">Edit</h5>
                                            <form id="form${employee.username}" onsubmit="preventSubmit(event)">
                                                <label for="username" class="form-label mb-1">Username</label>
                                                <input id="editEmpUsername${employee.username}" name="username" type="text" class="form-control form-control-sm" 
                                                    value=${employee.username} readonly required />
                                                <input type="checkbox" class="form-check-input align-middle mb-1 me-1" onclick="enableField(event)" />
                                                <label for="name" class="form-label mt-2 mb-1">name</label>
                                                <input id="editEmpName${employee.username}" name="name" type="text" class="form-control form-control-sm" 
                                                    value=${employee.name} pattern="[A-z0-9]+" title="Only characters, numbers and underscores" required disabled/>
                                                <input type="checkbox" class="form-check-input align-middle mb-1 me-1" onclick="enableField(event)" />
                                                <label for="company" class="form-label mt-2 mb-1">Company</label>
                                                <select id="editEmpCompany${employee.username}" name="company" class="form-select form-select-sm" required disabled>
                                                    
                                                    ${companies}
                                                </select>
                                                <div class="d-flex justify-content-end mt-3">
                                                    <input type="submit" value="Edit" class="btn btn-sm btn-primary" onclick="editEmployee('${employee.username}')"/>
                                                </div>
                                            </form>
                                            <hr class="my-1"/>
                                            <h5 class="my-2">History</h5>
                                            <p class="mb-1">Created at ${employee["created_at"]}</p>
                                            <div>
                                                <table class="table table-warning table-sm table-striped table-hover text-center">
                                                    <thead class="sticky-top">
                                                        <tr>
                                                            <th>Update type</th>
                                                            <th>Update value</th>
                                                            <th>Updated By</th>
                                                            <th>Updated at</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody id="history${employee.username}">
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-danger" data-bs-toggle="modal" data-bs-target="#deleteEmployee${employee.username}">Delete</button>
                            <div class="modal fade" id="deleteEmployee${employee.username}">
                                <div class="modal-dialog modal-dialog-centered" style="width: 300px">
                                    <div class="modal-content border-2 border-secondary">
                                        <div class="modal-header" style="">
                                            <h5 class="modal-title mx-auto">Delete ${employee.username} ?</h5>
                                        </div>
                                        <div class="modal-body pt-2">
                                            
                                            <div class="container d-flex justify-content-center mt-4">
                                                <button  id="delete-emp-close${employee.username}" class="btn btn-sm btn-dark me-5" data-bs-dismiss="modal">Cancel</button>
                                                <button class="btn btn-sm btn-danger" onclick="deleteEmployee('${employee.username}')">Delete</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>`
            })
            
            document.getElementById("employeesList").innerHTML = node
        }
    })
}


// Retrieve employee updates history 
function getEmpHistory(employee){
    fetch(`/employees/history/?username=${employee}`)
    .then(res => res.json())
    .then(history => {
        let node = ``

        history.forEach((item) => {
            node += `
                <tr>
                    <td>${item["update_type"]}</td>
                    <td>${item["update_value"]}</td>
                    <td>${item["updated_by"]}</td>
                    <td>${item["updated_at"]}</td>
                </tr>
            `
        })

        document.getElementById(`history${employee}`).innerHTML = node
    })
}


// Add a new employee
function addEmployee(event){
    let username = document.getElementById("addEmpUsername")
    let name = document.getElementById("addEmpName")
    let company = document.getElementById("addEmpCompany")

    if(username.checkValidity() && name.checkValidity() && company.checkValidity()){
        fetch("/employees", {"method": "POST", "headers": {"content-Type": "application/x-www-form-urlencoded"},
            "body": `username=${username.value}&name=${name.value}&company=${company.value}`})
        .then(res => res.json())
        .then(data => {

            if(data.status){
                document.getElementById("add-emp-close").click()
                event.target.parentNode.parentNode.reset()
                getEmployees()

            }else{
                document.getElementById("addEmpMsg").innerHTML = "Entered username is already used, choose another one"
            }
        })
    }
}


// Edit and update an employee information
function editEmployee(employee){
    let form = document.getElementById(`form${employee}`)
    let name = (document.getElementById(`editEmpName${employee}`).disabled) ? "" : document.getElementById(`editEmpName${employee}`).value
    let company = (document.getElementById(`editEmpCompany${employee}`).disabled) ? "" : document.getElementById(`editEmpCompany${employee}`).value

    if(form.checkValidity()){
        fetch("/employees", {"method": "PUT", "headers": {"content-Type": "application/x-www-form-urlencoded"},
            "body": `username=${employee}&name=${name}&company=${company}`})

        document.getElementById(`edit-emp-close${employee}`).click()
        document.getElementById(`loadTech${employee}`).innerHTML = "<td colspan='6'><span class='spinner-border'></span></td>"
        setTimeout(()=>{getEmployees()}, 1500)
    }   
}


// Delete an employee
function deleteEmployee(employee){        
    fetch("/employees", {"method": "DELETE", "headers": {"content-Type": "application/x-www-form-urlencoded"},
        "body": `username=${employee}`})

    document.getElementById(`delete-emp-close${employee}`).click()
    document.getElementById(`loadTech${employee}`).innerHTML = "<td colspan='6'><span class='spinner-border'></span></td>"
    setTimeout(()=>{getEmployees()}, 1500)
        
}




// #    Companies functions    # //


// Retrieve companies list from the server and represent it in the table
function getCompanies(){
    fetch("/companies/get")
    .then(res => res.json())
    .then(data => {
        if(data.status){
            let node = ""; 
            
            data.companies.forEach((company) => {

                if(company.status == "active"){
                    node += `
                    <tr id="loadTech${company.name}">
                        <td>${company.name}</td>
                        <td>${company.status}</td>
                        <td></td>
                        <td>
                            <button class="btn btn-sm btn-danger" data-bs-toggle="modal" data-bs-target="#deleteCompany${company.name}">Delete</button>
                            <div class="modal fade" id="deleteCompany${company.name}">
                                <div class="modal-dialog modal-dialog-centered" style="width: 300px">
                                    <div class="modal-content border-2 border-secondary">
                                        <div class="modal-header" style="">
                                            <h5 class="modal-title mx-auto">Delete ${company.name} ?</h5>
                                        </div>
                                        <div class="modal-body pt-2">
                                            <div class="container d-flex justify-content-center mt-4">
                                                <button id="delete-Comp-close${company.name}" class="btn btn-sm btn-dark me-5" data-bs-dismiss="modal">Cancel</button>
                                                <button class="btn btn-sm btn-danger" onclick="deleteCompany('${company.name}')">Delete</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>`
                }
            })

            document.getElementById("companiesList").innerHTML = node
        }
    })
}


// Add a new company
function addCompany(event){
    let name = document.getElementById("addCompName")

    if(name.checkValidity()){
        fetch("/companies", {"method": "POST", "headers": {"content-Type": "application/x-www-form-urlencoded"},
            "body": `name=${name.value}`})
        .then(res => res.json())
        .then(data => {

            if(data.status){
                document.getElementById("add-comp-close").click()
                event.target.parentNode.parentNode.reset()
                getCompanies()
            }else{
                document.getElementById("addCompMsg").innerHTML = "Entered name is already used"
            }
        })
    }
}


// Delete a company
function deleteCompany(company){        
    fetch("/companies", {"method": "DELETE", "headers": {"content-Type": "application/x-www-form-urlencoded"},
        "body": `name=${company}`})

    document.getElementById(`delete-Comp-close${company}`).click()
    document.getElementById(`loadTech${company}`).innerHTML = "<td colspan='4'><span class='spinner-border'></span></td>"
    setTimeout(()=>{getCompanies()}, 1500)
        
}