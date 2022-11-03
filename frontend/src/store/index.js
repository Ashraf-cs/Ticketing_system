import {createStore} from 'redux'

const reducer = (state = {auth: null, privilege: [], username: '', lang: ''}, action) => {
    if(action.type == 'loggedin'){
        return {auth: true, privilege:[action.payload.privilege] ,username: action.payload.username, lang:action.payload.lang}
    }else if(action.type == 'loggedout'){
        return {auth: false, privilege: [], username: '', lang:action.payload.lang}
    }
    return state
}

const store = createStore(reducer)
export default store