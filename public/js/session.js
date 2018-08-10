let db = firebase.database();
let sessionRef = db.ref('session/')
let sessionBookersRef = db.ref('session_bookers/')
let usersRef = db.ref('users/')

let sessionList = document.querySelector('.session-list')

let addUserToSession = (session_id) => {
    let user = firebase.auth().currentUser
    if (user) {
        let userId = user.uid
        let obj ={}
        obj[userId] = true
        let obj1 = {}
        obj1[session_id] = true
        sessionBookersRef.child(session_id).update(obj)
        usersRef.child(userId).child('booked').update(obj1)
    }
    else {console.log("Error: You need to log in to use this function")}
}

let removeUserFromSession = (session_id) => {
    let user = firebase.auth().currentUser
    if (user) {
        let userId = user.uid
        let obj ={}
        obj[userId] = null
        let obj1 = {}
        obj1[session_id] = null
        sessionBookersRef.child(session_id).update(obj)
        usersRef.child(userId).child('booked').update(obj1)
    }
    else {console.log("Error: You need to log in to use this function")}
}


let initSessionPage = () => {
    
    sessionRef.on('value', snapshot => {
        sessionList.innerHTML = ""
        console.log('Session changed')
        snapshot.forEach(session => {
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
                        ${firebase.auth().currentUser !== null ? `<a id="button_${session.key}" onclick="addUserToSession('${session.key}')" class="btn-floating btn-large waves-effect waves-light red right"><i class="material-icons">add</i></a>` : ""}
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
            
        })

        sessionBookersRef.on('value', snapshot => {
            console.log('Session Bookers changed')
            if (firebase.auth().currentUser) {
                let userId = firebase.auth().currentUser.uid
                snapshot.forEach(session => {
                    let btn = document.getElementById(`button_${session.key}`)

                    if (session.hasChild(userId)) {
                        btn.innerHTML = '<i>ok</i>'
                        btn.setAttribute('onclick', `removeUserFromSession('${session.key}')`)
                    }
                    else {
                        btn.innerHTML = '<i class="material-icons">add</i>'
                        btn.setAttribute('onclick', `addUserToSession('${session.key}')`)
                    }
                })
            }
        })
        document.getElementById('preloader').innerHTML = ""
        var elems = document.querySelectorAll('.modal');
        var instances = M.Modal.init(elems);
    })
}

window.addEventListener('load', initSessionPage)
