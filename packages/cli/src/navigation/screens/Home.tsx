import Header from '../../components/layout/Header'
import InputBar from '../../components/bars/InputBar'
import { useNavigate } from 'react-router'
import { useCallback } from "react";

const Home = () => {
    const navigate = useNavigate()
    const handleSubmit = useCallback((text:string)=>{
        navigate("/sessions/12345", { state: { message: text } });
    },[])
  return (
    <box
      alignItems="center"
      justifyContent="center"
      flexGrow={1}
      gap={2}
      position="relative"
      width="100%"
      height="100%"
    >
      <Header />
      <box width="100%" maxWidth={78} paddingX={2}>
        <InputBar onSubmit={handleSubmit} />
      </box>

    </box>
  );
}
export default Home