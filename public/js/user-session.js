let db = firebase.database();
let sessionRef = db.ref('session/')
let sessionBookersRef = db.ref('session_bookers/')
let usersRef = db.ref('users/')

let sessionList = document.querySelector('.user-session-list')

let initUserSessionPage = () => {
    
    sessionRef.on('value', sessions => {
        sessionList.innerHTML = ""
        let user = firebase.auth().currentUser
        let userId = user.uid
        let usersBookedRef = db.ref('users/'+userId+'/booked')
        usersBookedRef.on('value', session_ids => {
            session_ids.forEach(session_id => {
                sessions.forEach(session => {
                    if (session.key === session_id.key) {
                        console.log('Yayyyy')
                        let name = session.val().name
                        let imgURL = session.val().imgURL
                        let description = session.val().description
                        sessionList.innerHTML += 
                            `<div class="col s12 session-container z-depth-2">
                            <a href="#${session.key}" class="modal-trigger">
                                <h4>${name}</h4>
                                <div class="row">
                                    <div class="col s2"><img class="responsive-img" src=${imgURL}/></div>
                                    <div class="col s10">
                                    </div>
                                </div>
                            </a>
                            
                        </div>
                        <div id="${session.key}" class="modal">
                            <div class="modal-content">
                                <h4>${name}</h4>
                                <p>${description}</p>
                            </div>
                                <div class="modal-footer">
                                <a href="#!" class="modal-close waves-effect waves-green btn-flat">Close</a>
                            </div>
                        </div>`
                    }
                })
            })
            var elems = document.querySelectorAll('.modal');
            var instances = M.Modal.init(elems);
        })
        console.log('Session changed')
        
        
        document.getElementById('preloader').innerHTML = ""
        
    })
}

window.addEventListener('load', initUserSessionPage)