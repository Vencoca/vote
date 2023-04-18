import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import styled from "styled-components";
import {ToastContainer,ToastOptions,toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link,useNavigate } from "react-router-dom";
import { registerRoute } from '../utils/routes';
import axios from "axios";
import bcrypt from 'bcryptjs'

function Register(){
    const navigate = useNavigate();
    const [values, setValues]=useState({
        username:"",
        email: "",
        password: "",
        confirmPassword: "",
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

    const handleValidation = (event: FormEvent<HTMLFormElement>) => {
        const {password,confirmPassword,username,email} = values;
        if(password !== confirmPassword){
          toast.error("Password and confirm password should be same!", toastOptions);
          return false;
        } else if (password.length < 3){
          toast.error("Password should be longer than 3 chars!", toastOptions);
          return false;
        } else if (email === ""){
          toast.error("Email cant be empty!", toastOptions);
          return false;
        }
        return true;
      }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        console.log(event);
        event.preventDefault();
        if(handleValidation(event)){
          const {password,username,email} = values;          
          const hashPassword = async (password: string) => {
            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
            const hashedPassword = await bcrypt.hash(password, salt);
            return hashedPassword;
          }
          const hashed = await hashPassword(password);
          const {data} = await axios.post(registerRoute, {
            "name": username,
            "email": email,
            "password": hashed,
          });
          if(data.status===false){
            toast.error(data.msg, toastOptions);
          } else {
            localStorage.setItem('vote-app-user',JSON.stringify(data.email));
            navigate("/");
          } 
        };
      }

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setValues({...values,[event.target.name]:event.target.value});
    }

    return(
        <>
            <FormContainer>
                <form onSubmit={(event)=>handleSubmit(event)}>
                    <div className='brand'>
                        <h1>Vote App</h1>
                    </div>
                    <input type="text" placeholder='Username' name='username' onChange={e=>handleChange(e)}/>
                    <input type="email" placeholder='Email' name='email' onChange={e=>handleChange(e)}/>
                    <input type="password" placeholder='Password' name='password' onChange={e=>handleChange(e)}/>
                    <input type="password" placeholder='Confirm password' name='confirmPassword' onChange={e=>handleChange(e)}/>
                    <button type='submit'>Create User</button>
                    <span>Already have an account?<Link to={"/login"}> Login</Link></span>
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


export default Register