import { GET_PROFILE, PROFILE_ERROR } from "../actions/types";
const insitiaState ={
    profile: null,
    profiles:[],
    respos:[],
    loading: true,
    error:{

    }
}

export default function(state=insitiaState, action){
    const {type, payload}=action;

    switch(type){
        case GET_PROFILE:
            return{
                ...state,
                profile:payload,
                loading:false
            }
            case PROFILE_ERROR:
                return{
                    ...state,
                    error: payload,
                    loading: false
                }
                default:
                    return state;
    }
}