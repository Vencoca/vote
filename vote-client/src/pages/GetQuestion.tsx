import axios from 'axios';
import { useEffect, useState, } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components'
import {ToastContainer, ToastOptions, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAllQuestionsRoute, getQuestionRoute } from '../utils/routes';

function GetQuestion(){
    const id = window.location.pathname.split('/').pop();
    const navigate = useNavigate()
    useEffect(() => {
        if(!localStorage.getItem('vote-app-user')){
            navigate('/login');
        }
    });
    const toastOptions: ToastOptions = {
        position:"bottom-right",
        autoClose:8000,
        pauseOnHover:true,
        draggable: true,
        theme: 'dark',
      }
    interface Votes{
        id: BigInt;
        up: Boolean;
        user_email: string;
        question_id: BigInt;
    }

    interface Question {
        id: BigInteger;
        text: string;
        creator_email: string;
        votes: Votes[];
    }

    const [question, setQuestion] = useState<Question>();
    const [yesVotes, setYesVotes] = useState(0);
    const [noVotes, setNoVotes] = useState(0);
    
    useEffect(() => {
        axios.get(getQuestionRoute+"/"+id)
        .then((response) => {
            setQuestion(response.data);
            let up = 0;
            let down = 0;
            response.data?.votes.forEach((element: { up: any; }) => {
                if (element.up){
                    up = up + 1;
                } else {
                    down = down + 1;
                }
            })
            setYesVotes(up)
            setNoVotes(down);
        })
    }, [])

    function voteYes(){
        handleSubmit(true);
    }

    function voteNo(){
        handleSubmit(false);
    }

    const handleSubmit = async (vote: Boolean) => {
        const user = localStorage.getItem('vote-app-user');
        if (!user) {
            navigate('/login');
        } else {
            const route = getQuestionRoute+"/"+id+"/vote"
            const {data} = await axios.put(route, {
                "email": user.replace(/"/g, ''),
                "vote": vote,
                });
                if(data.status===false){
                toast.error(data.msg, toastOptions);
                } else {
                    navigate("/");
                }
        } 
    };

    return <Container>
        <span>Question number: {id}</span><Link to={"/"}> <button>Back</button></Link><br/>
        <span>{question?.text}</span>
        <div><button onClick={voteYes}>Yes: {yesVotes}</button> | <button onClick={voteNo}>No: {noVotes}</button></div>
    </Container>
}

const Container = styled.div`
    height: 100vh;
    width: 100vw;
    background-color: gray;
`;

export default GetQuestion