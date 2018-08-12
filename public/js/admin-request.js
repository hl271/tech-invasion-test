let db = firebase.database()
let adminReqsRef = db.ref('admin-requests/')

let adminStatusPanel = document.getElementById('admin-status-panel')

const sendAdminRequest = () => {
    let user = firebase.auth().currentUser
    if (user) {
        const displayName = user.displayName
        const photoURL = user.photoURL
        const email = user.email
        const accepted = false
        const userId = user.uid 
        const userRequest = {displayName, photoURL, email, accepted}
        adminReqsRef.child(userId).set(userRequest).then((result) => {
            console.log('Admin Request sent!')
            console.log(result)
        })
    }
}

const showAdminUI = () => {
    
    adminStatusPanel.innerHTML = `<h4>You are an admin. Go to admin panel now?</h4>
                                    <a href="/myadmin-main" class="btn waves-effect waves-light">Go to Admin Panel <i class="material-icons right">send</i></button>`
    console.log('Admin UI')
}
const showAdminRequestingUI = () => {
    adminStatusPanel.innerHTML = 
                                    `<h4>This feature can only be used by an admin. Want to be an admin?</h4>
                                    <button id="admin-request-btn" onclick="sendAdminRequest()" class="btn waves-effect waves-light">Send Admin Request <i class="material-icons right">send</i></button>`
    console.log('Admin Requesting UI')
}

const showAdminRequestPendingUI = () => {
    adminStatusPanel.innerHTML = `<h4>Your Admin Request is pending.</h4>
                                    <a href="/" class="btn waves-effect waves-light">Go to Homepage <i class="material-icons right">home</i></button>`
    console.log('Admin Request Pending UI')

}

const initAdminRequestPage = () => {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            let userId = user.uid
            db.ref('admin-requests/'+userId).on('value', userRequest => {
                let adminRequest = userRequest.val()
                if (adminRequest) {
                        adminRequest.accepted ? showAdminUI() : showAdminRequestPendingUI()
                }
                else {showAdminRequestingUI()}
            })
        }
    })    
}

document.addEventListener('DOMContentLoaded', initAdminRequestPage)