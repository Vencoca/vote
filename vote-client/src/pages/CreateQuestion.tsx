import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {ToastContainer,ToastOptions,toast} from "react-toastify";
import styled from 'styled-components'
import { createQuestionRoute } from '../utils/routes';
import axios from "axios";

function CreateQuestion(){

    const [values, setValues] = useState({
        question: "",
       })
    const navigate = useNavigate()
    useEffect(() => {
        if(!localStorage.getItem('vote-app-user')){
            navigate('/login');
        }
    })
    const toastOptions: ToastOptions = {
        position:"bottom-right",
        autoClose:8000,
        pauseOnHover:true,
        draggable: true,
        theme: 'dark',
    }
    
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setValues({...values,[event.target.name]:event.target.value});
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const user = localStorage.getItem('vote-app-user');
        if (!user) {
            navigate('/login');
        } else {
            console.log(user);
            const {data} = await axios.post(createQuestionRoute, {
                "creator": user.replace(/"/g, ''),
                "text": values.question,
                });
                if(data.status===false){
                toast.error(data.msg, toastOptions);
                } else {
                navigate("/");
                }
        } 
    };

    return <>
    <Container>
        <h1>Hello</h1>
        <form onSubmit={(event)=>handleSubmit(event)}>
            <input type="text" placeholder='Question' name='question' onChange={e=>handleChange(e)} min="3"/>
            <button type='submit'>Create</button>
        </form>
        <Link to={"/"}><button>Back</button></Link>
    </Container>
    <ToastContainer/>
    </>
    ;
}

const Container = styled.div`
height: 100vh;
width: 100vw;
background-color: gray;
`;

export default CreateQuestion

