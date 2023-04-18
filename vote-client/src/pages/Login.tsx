import { useState, useEffect, ChangeEvent, FormEvent} from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {ToastContainer, ToastOptions, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { loginRoute } from '../utils/routes';

function Login(){
   const navigate = useNavigate() ;
   const [values, setValues] = useState({
    username: "",
    password: "",
   })
   const toastOptions: ToastOptions = {
    position:"bottom-right",
    autoClose:8000,
    pauseOnHover:true,
    draggable: true,
    theme: 'dark',
  }
    
  useEffect(() => {
    if(localStorage.getItem('vote-app-user')){
      navigate('/');
    };
  }, []);
      

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if(handleValidation()){
      const {password,username} = values;
      const {data} = await axios.post(loginRoute, {
        "email": username,
        "password": password,
      });
      if(data.status===false){
        toast.error(data.msg, toastOptions);
      } else {
        if (data.exists) {
        localStorage.setItem('vote-app-user',JSON.stringify(username));
        navigate("/");
        } else {
          toast.error("Password and username doesnt match", toastOptions);
        }
      } 
    };
  }    

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      setValues({...values,[event.target.name]:event.target.value});
  }

  const handleValidation = () => {
    const {password,username} = values;
    if(password === ""){
      toast.error("Email and Password is required", toastOptions);
      return false;
    } else if (username === "") {
      toast.error("Email and Password is required", toastOptions);
      return false;
    }
    return true;
  }
  
  return (
    <>
      <FormContainer>
        <form onSubmit={(event)=>handleSubmit(event)}>
          <div className='brand'>
            <h1>Vote App</h1>
          </div>
          <input type="text" placeholder='Email' name='username' onChange={e=>handleChange(e)} min="3"/>
          <input type="password" placeholder='Password' name='password' onChange={e=>handleChange(e)}/>
          <button type='submit'>Log in</button>
          <span>Dont have an account?<Link to={"/register"}> Sign up</Link></span>
        </form>
      </FormContainer>
      <ToastContainer/>
    </>
  )
}


const FormContainer = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #6482d4;
  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    img{
      height: 5rem;
    }
    h1 {
      color: white;
      text-transform: uppercase;
    }
  }
  form{
    display: flex;
    flex-direction: column;
    gap: 2rem;
    background-color: #3b3b3b;
    border-radius: 2rem;
    padding: 3rem 5rem;
    input {
      background-color: transparent;
      padding: 1rem;
      border: 0.1rem solid, orange;
      border-radius: 0.4rem;
      color: white;
    }
    button {
      padding: 1rem;
      border-radius: 0.4rem;
      font-size: 16px;
      font-weight: 700;
      text-transform: uppercase;
    }
    span{
      color: white;
      display: flex;
      justify-content: center;
      a{
        color: wheat;
        padding-left: 10px;
      }
    }
  }
`;

export default Login