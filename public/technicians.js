// Prevent forms to be submitted
function preventSubmit(event){
    event.preventDefault()
}


// Retrieve technician's tickets from the server and represent it in the table
function getTickets(){
    fetch("/tickets").then(res => res.json()).then(data => {
        let node = ""

        if(data != ""){
            data.forEach((ticket) => {
                let description = ((ticket.description).length < 150) ? ticket.description : (ticket.description).slice(0, 150) + "..."
                
                if(ticket.status == "open"){
                    node += `
                        <tr>
                            <td>${ticket.id}</td>
                            <td>${ticket["created_at"]}</td>
                            <td>${ticket.company}</td>
                            <td>${ticket.employee}</td>
                            <td>${ticket.phone}</td>
                            <td>${ticket.category}</td>
                            <td class="text-start">${description}</td>
                            <td class="text-warning fw-bold">${ticket.status}</td>
                            <td>${ticket["closed_at"]}</td>
                            <td></td>
                            <td></td>
                            <td>
                                <div id="loadTicket${ticket.id}">
                                    <button value="Finish" class="btn btn-sm btn-warning" data-bs-toggle="modal" data-bs-target="#viewTicket${ticket.id}">Finish</button>
                                </div>
                                <div class="modal fade" id="viewTicket${ticket.id}">
                                    <div class="modal-dialog modal-lg modal-scrollable">
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
                                                            <label for="timestamp" class="form-label mt-2 mb-1">Created at</label>
                                                            <input type="text" name="timestamp" value="${ticket.timestamp}" class="form-control form-control-sm" disabled />
                                                        </div>
                                                        <div class="col">
                                                            <label for="phone" class="form-label mt-2 mb-1">Phone</label>
                                                            <input type="text" name="phone" value="${ticket.phone}" class="form-control form-control-sm" disabled />
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
                                                            <textarea name="description" rows="4" class="form-control form-control-sm" disabled>${ticket.description}</textarea>
                                                        </div>
                                                    <div>
                                                    <div class="row">
                                                        <div class="col">
                                                            <label for="comment" class="form-label mt-2 mb-1">Comment</label>
                                                            <textarea id="comment${ticket.id}" name="comment" rows="4" class="form-control" required></textarea>
                                                        </div>
                                                    </div>
                                                    <div class="row mt-2">
                                                        <div class="col d-flex justify-content-end">
                                                            <button type="submit" class="btn btn-sm btn-warning" onclick="finishTicket('${ticket.id}')">Finish</button>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>\n
                    `
                    
                }else if(ticket.status == "closed"){
                    let comment = ((ticket.comment).length < 100) ? ticket.comment : (ticket.comment).slice(0, 100) + "..."
                    node += `
                        <tr>
                            <td>${ticket.id}</td>
                            <td>${ticket["created_at"]}</td>
                            <td>${ticket.company}</td>
                            <td>${ticket.employee}</td>
                            <td>${ticket.phone}</td>
                            <td>${ticket.category}</td>
                            <td class="text-start">${description}</td>
                            <td class="fw-bold" style="color: #333399">${ticket.status}</td>
                            <td>${ticket['closed_at']}</td>
                            <td>${ticket['closed_by']}</td>
                            <td class="text-start">${comment}</td>
                            <td>
                                <button class="btn btn-sm btn-light border-0" style="background-color: #333399; color:white" 
                                    data-bs-toggle="modal" data-bs-target="#viewTicket${ticket.id}">View</button>
                                <div class="modal fade" id="viewTicket${ticket.id}">
                                    <div class="modal-dialog modal-lg">
                                        <div class="modal-content">
                                            <div class="modal-header" style="height: 45px">
                                                <h4 class="modal-title">Ticket info</h4>
                                                <button class="btn-close" data-bs-dismiss="modal"></button>
                                            </div>
                                            
                                            <div class="modal-body text-start">
                                                <form>
                                                    <div class="row g-1">
                                                        <div class="col">
                                                            <label for="id" class="form-label mt-2 mb-1">Number</label>
                                                            <input type="text" name="id" value="${ticket.id}" class="form-control form-control-sm" disabled />
                                                        </div>
                                                        <div class="col">
                                                            <label for="timestamp" class="form-label mt-2 mb-1">Created at</label>
                                                            <input type="text" name="timestamp" value="${ticket['created_at']}" class="form-control form-control-sm" disabled />
                                                        </div>
                                                        <div class="col">
                                                            <label for="phone" class="form-label mt-2 mb-1">Phone</label>
                                                            <input type="text" name="phone" value="${ticket.phone}" class="form-control form-control-sm" disabled />
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
                                                            <textarea name="description" rows="4" class="form-control form-control-sm" disabled>${ticket.description}</textarea>
                                                        </div>
                                                    <div>
                                                    <div class="row">
                                                        <div class="col">
                                                            <label for="comment" class="form-label mt-2 mb-1">Comment</label>
                                                            <textarea name="comment" rows="4" class="form-control" disabled>${ticket.comment}</textarea>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>\n
                    `
                }
            
        })
            document.getElementById("tickets").innerHTML = node
        }else{
            document.getElementById("tickets").innerHTML = node 
        }
    })
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