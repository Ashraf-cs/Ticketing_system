// Prevent forms to be submitted
function preventSubmit(event){
    event.preventDefault()
}


// Retrieve employee's tickets from the server and represent it in the table
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
                            <td>${ticket.phone}</td>
                            <td>${ticket.category}</td>
                            <td class="text-start">${description}</td>
                            <td class="text-warning fw-bold">${ticket.status}</td>
                            <td></td>
                            <td></td>
                        </tr>\n
                    `
                    
                }else if(ticket.status == "closed"){
                    node += `
                        <tr>
                            <td>${ticket.id}</td>
                            <td>${ticket["created_at"]}</td>
                            <td>${ticket.company}</td>
                            <td>${ticket.phone}</td>
                            <td>${ticket.category}</td>
                            <td class="text-start">${description}</td>
                            <td class="fw-bold" style="color: #333399">${ticket.status}</td>
                            <td>${ticket['closed_at']}</td>
                            <td>
                        <button class="btn btn-sm btn-light border-0" style="background-color: #333399; color:white" 
                            data-bs-toggle="modal" data-bs-target="#View${ticket.id}">View</button>
                        <div class="modal fade" id="View${ticket.id}">
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
                                                    <input type="text" name="id" value="${ticket.id}" class="form-control form-control-sm" disabled readonly />
                                                </div>
                                                <div class="col">
                                                    <label for="timestamp" class="form-label mt-2 mb-1">Date & Time</label>
                                                    <input type="text" name="timestamp" value="${ticket.timestamp}" class="form-control form-control-sm" disabled readonly />
                                                </div>
                                                <div class="col">
                                                    <label for="closed_at" class="form-label mt-2 mb-1">Updated</label>
                                                    <input type="text" name="closed_at" value="${ticket['closed_at']}" class="form-control form-control-sm" disabled readonly />
                                                </div>
                                                <div class="col">
                                                    <label for="phone" class="form-label mt-2 mb-1">Phone</label>
                                                    <input type="text" name="phone" value="${ticket.phone}" class="form-control form-control-sm" disabled readonly />
                                                </div>
                                            </div>
                                            <div class="row g-1">
                                                <div class="col">
                                                    <label for="company" class="form-label mt-2 mb-1">Comapny</label>
                                                    <input type="text" name="company" value="${ticket.company}" class="form-control form-control-sm" disabled readonly />
                                                </div>
                                                <div class="col">
                                                    <label for="category" class="form-label mt-2 mb-1">Category</label>
                                                    <input type="text" name="category" value="${ticket.category}" class="form-control form-control-sm" disabled readonly />
                                                </div>
                                                <div class="col">
                                                    <label for="status" class="form-label mt-2 mb-1">Status</label>
                                                    <input type="text" name="category" value="closed" class="form-control form-control-sm" disabled readonly />
                                                </div>
                                            </div>
                                            <div class="row">
                                                <div class="col">
                                                    <label for="description" class="form-label mt-2 mb-1">Description</label>
                                                    <textarea name="description" rows="4" class="form-control form-control-sm" disabled readonly>${ticket.description}</textarea>
                                                </div>
                                            <div>
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


// Create a ticket and send it to server
function sendTicket(event){
    let name = document.getElementById("name")
    let phone = document.getElementById("phone")
    let company = document.getElementById("company")
    let category = document.getElementById("category")
    let description = document.getElementById("description")

    if(phone.checkValidity() && category.checkValidity() && description.checkValidity()){
        fetch("/tickets", {"method": "POST", "headers": {"content-Type": "application/x-www-form-urlencoded"},
            "body": `name=${name.value}&phone=${phone.value}&company=${company.value}&category=${category.value}&description=${description.value}`})
        
        event.target.parentNode.reset()
        setTimeout(()=>{
            event.target.focus();
            event.target.blur()}, 0)
        setTimeout(()=>{getTickets()}, 1500)
    }
}