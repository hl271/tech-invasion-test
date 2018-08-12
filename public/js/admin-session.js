let db = firebase.database();
let sessionRef = db.ref('session/')
let adminReqsRef = db.ref('admin-requests/')

let adminRequestsList = document.getElementById('admin-requests-list')

const fetchAllSession = () => {
    sessionRef.on('value', snapshot => {
        snapshot.forEach(session => {})
    })
}
const addNewSession = () => {
    let name = document.addNewSessionForm.name
    let imgURL = document.addNewSessionForm.imgURL
    let description = document.addNewSessionForm.description

    let sessionObj = {
        name: name.value,
        imgURL: imgURL.value,
        description: description.value
    }
    sessionRef.push().set(sessionObj, (err)=> {!!err ? console.log('NOOOOOO! ERROR: ' + err) : console.log('Data saved!')})
    name.value = ""
    imgURL.value = ""
    description.value = ""
}

const acceptRequest = userId => {
    console.log('Request sending!')
    let xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let userRequestElem = document.getElementById(userId)
            userRequestElem.parentNode.removeChild(userRequestElem)
            console.log('Request sent!')
        }
        else {
            console.log('There is something wrong :<<')
        }
    }
    xhttp.open('GET', `/myadmin-main/${userId}`, true)
    xhttp.send()
}

const initAdminMainPage = () => {
    adminReqsRef.once('value', allRequests => {
        allRequests.forEach(request => {
            if (!request.val().accepted) {
                let photoURL = request.val().photoURL
                let displayName = request.val().displayName
                let email = request.val().email
                let userId = request.key
                adminRequestsList.innerHTML += 
                    `<li class="collection-item avatar" id="${userId}">
                        <img src="${photoURL}"  class="circle">
                        <span class="title">${displayName}</span>
                        <p>${email}</p>
                        <div id="btn_${userId}"><a onclick="acceptRequest('${userId}')" class="secondary-content btn right"><i class="material-icons">send</i></a></div>
                    </li>`
            }
            
        })
    })
}

document.addEventListener('DOMContentLoaded', initAdminMainPage)