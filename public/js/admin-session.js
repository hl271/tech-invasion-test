let db = firebase.database();
let sessionRef = db.ref('session/')

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