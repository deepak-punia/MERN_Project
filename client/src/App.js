import {BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import './App.css';
import { loadUser } from './actions/auth';
import { useEffect } from 'react';
import setAuthToken from './utils/setAuthToken';
import PrivateRoute from './components/routing/PrivateRoute'
import Dashboard from './components/dashboard/Dashboard';


//Redux
import {Provider} from 'react-redux';
import store from './store';
 
if(localStorage.token){
  setAuthToken(localStorage.token);
}

const  App=()=> {
  useEffect(()=>{
    store.dispatch(loadUser());
  },[]);
  return (
    <Provider store={store}>
    <Router>
    <>
      <Navbar />
      
      
      <Routes>
       <Route path="/" element={<Landing />} />
        <Route  path='/register' element={<Register />} />
        <Route  path='/login' element={<Login />} />
        <Route
            path="dashboard"
            element={<PrivateRoute component={Dashboard} />}
          />
      </Routes>
      
    </>
    </Router>
    </Provider>
  );
}

export default App;
