import axios from 'axios';
import { useEffect, useState, } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components'
import { getAllQuestionsRoute, getQuestionRoute } from '../utils/routes';

interface Question {
    id: BigInteger;
    text: string;
    creator_email: string;
}

function VotePage(){
    const navigate = useNavigate()
    useEffect(() => {
        if(!localStorage.getItem('vote-app-user')){
            navigate('/login');
        }
    })  
    const [questions, setQuestions] = useState<Question[]>([])
    useEffect(() => {
        axios.get(getAllQuestionsRoute)
        .then((response) => {
            setQuestions(response.data);
        })
    }, [])

    const handleLogout = async () => {
        localStorage.clear();
        navigate("/login");
    }

    return <Container>
        <h1>Hello</h1>
        <Link to={"/create"}><button>New question</button></Link>
        <button onClick={handleLogout}>Logout</button>
        {questions.map((value,id) => (
            <div key={id}>
                <Link to={"question/" + value.id}><span>{value.id}:{value.text}-{value.creator_email}</span></Link>
            </div>
        ))}
    </Container>;
}

const Container = styled.div`
    height: 100vh;
    width: 100vw;
    background-color: gray;
`;

export default VotePage